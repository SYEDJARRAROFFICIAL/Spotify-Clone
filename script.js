let currentSong = new Audio();
let songs = [];
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  console.log(`Fetching songs from folder: ${currFolder}`);
  let a = await fetch(`./${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // Just get the filename, not the full path
      let fileName = element.href.split("/").pop(); // Use innerText instead of href
      console.log("Found song name:", fileName);

      if (fileName.endsWith(".mp3")) {
        songs.push(fileName);
      }
    }
  }
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `
    <li>
                <img class="invert" src="./src/assets/svg/music.svg" alt="music image" />
                <div class="info">
                  <div>${song}</div>
                  <div>Syed Jarrar</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="./src/assets/svg/playnow.svg" alt="play song" />
                </div>
              </li>`;
  }
  // attach event listener to each music
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").firstElementChild.innerText);
      playMusic(e.querySelector(".info").firstElementChild.innerText);
    });
  });
  // console.log("Songs found:", songs);
  return songs;
}

const playMusic = async (track, pause = false) => {
  try {
    // Stop current song if playing
    if (!currentSong.paused) {
      currentSong.pause();
    }

    // Change this line - use relative path with dot
    currentSong.src = `./${currFolder}/${track}`; // Instead of /${currFolder}/${track}

    // Wait for the audio to load
    await new Promise((resolve, reject) => {
      currentSong.addEventListener("loadeddata", resolve, { once: true });
      currentSong.addEventListener("error", reject, { once: true });
    });

    // Update UI immediately
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // Play if not paused
    if (!pause) {
      await currentSong.play();
      play.src = "./src/assets/svg/pause.svg";
    } else {
      play.src = "./src/assets/svg/play.svg";
    }
  } catch (error) {
    console.error("Error playing music:", error);
    play.src = "./src/assets/svg/play.svg";
  }
};
async function displayAlbums() {
  let a = await fetch("./songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  // Clear existing cards
  cardContainer.innerHTML = "";

  let array = Array.from(anchors);
  // console.log("response:", response);
  for (let index = 0; index < array.length; index++) {
    const element = array[index];

    if (
      element.href.includes("/songs/") ||
      element.href.includes("%5Csongs%5C")
    ) {
      console.log("Album found:", element.href);
      // for live preview dev extentension
      //       let folder = element.href.split("%5C").pop().replace("/", "");

      let folder = element.href.split("/").pop().replace("/", "");
      // console.log("folder", folder);
      // get the metadata of the folder
      let a = await fetch(`./songs/${folder}/info.json`);
      let metadata = await a.json();
      // console.log("metadata.title", metadata.title);
      // console.log("anchor", a);
      // console.log("folder", folder);
      // console.log("Album found:", metadata);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `
      <div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141B34"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                    fill="#000"
                  />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt="SongImage"
              />
              <h2>${metadata.title}</h2>
              <p>${metadata.description}</p>
            </div>`;
    }
  }
  // load the playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get all songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);
  //  display all the albums on the page
  displayAlbums();
  // attach an event listener to previous, play and next button
  document.getElementById("previous").addEventListener("click", () => {
    console.log("Previous song");
  });
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./src/assets/svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./src/assets/svg/play.svg";
    }
  });
  document.getElementById("next").addEventListener("click", () => {
    console.log("Next song");
  });

  // listen for time update event on seekbar element
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = currentSong.currentTime;
    let duration = currentSong.duration;
    let progress = (currentTime / duration) * 100;
    document.querySelector(".seekbar .circle").style.left = `${progress}%`;
    // showing time in seconds and minutes relative to whole duration
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentTime
    )} / ${secondsToMinutesSeconds(duration)}`;
  });

  //   add an event listener to seekbar element
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.clientWidth) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    // console.log(percent);
  });

  // add an event listener for hamburger menu
  document
    .querySelector(".hamburger-container")
    .addEventListener("click", () => {
      document.querySelector(".left").style.left = "0%";
    });
  // add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // add an event listener for previous button in the above bar
  previous.addEventListener("click", () => {
    // console.log("Previous song");
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index > 0) {
      index--;
    } else {
      index = songs.length - 1; // Go to last song
    }
    playMusic(songs[index]);
    // console.log(songs[index]);
  });

  // add an event listener for next button in the above bar

  next.addEventListener("click", () => {
    // console.log("Next song");
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index >= 0 && index < songs.length - 1) {
      index++;
    } else {
      index = 0; // Go to first song
    }
    playMusic(songs[index]);
    // console.log(songs[index]);
  });

  // add an event listener for volume control
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log(`Setting volume to: ${e.target.value}`);
      currentSong.volume = parseInt(e.target.value) / 100;
    });
  // Add Event Listener to mute th track
  document.querySelector(".volume").addEventListener("click", () => {
    if (currentSong.volume > 0) {
      currentSong.volume = 0;
      document.querySelector(".volume img").src = "./src/assets/svg/mute.svg";
      document.querySelector(".range input").value = 0;
    } else {
      currentSong.volume = 1;
      document.querySelector(".volume img").src = "./src/assets/svg/volume.svg";
      document.querySelector(".range input").value = 10;
    }
  });
}
main();
