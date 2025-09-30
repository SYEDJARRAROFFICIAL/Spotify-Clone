console.log("Hello, Spotify Clone!");
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

async function getSongs() {
  let a = await fetch("./songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(
        element.href.split("%5Csongs%5C").pop().replaceAll("%20", " ")
      );
    }
  }
  return songs;
}

// const playMusic = (track, pause = false) => {

//   currentSong.src = `/songs/${track}`;
//   if (!pause) {
//     currentSong.play();
//   }
//   play.src = "./src/assets/svg/pause.svg";
//   document.querySelector(".songinfo").innerHTML = track;
//   document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
// };

const playMusic = async (track, pause = false) => {
  try {
    // Stop current song if playing
    if (!currentSong.paused) {
      currentSong.pause();
    }

    // Reset the audio source
    currentSong.src = `/songs/${track}`;

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

async function main() {
  // Get all songs
  songs = await getSongs();
  playMusic(songs[0], true);
  // display all songs in the playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
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
      console.log(e.querySelector(".info").firstElementChild.innerText);
      playMusic(e.querySelector(".info").firstElementChild.innerText);
    });
  });
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
    console.log(percent);
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
      console.log(`Setting volume to: ${e.target.value}`);
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}
main();
