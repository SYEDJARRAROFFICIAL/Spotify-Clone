console.log("Hello, Spotify Clone!");
let currentSong = new Audio();

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
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("songs%5C").pop().replaceAll("%20", " "));
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  //   let audio = new Audio(`/songs/${track}`);

  currentSong.src = `/songs/${track}`;
  if (!pause) {
    currentSong.play();
  }
  play.src = "./src/pause.svg";
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function main() {
  // Get all songs
  let songs = await getSongs();
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
                <img class="invert" src="./src/music.svg" alt="music image" />
                <div class="info">
                  <div>${song}</div>
                  <div>Syed Jarrar</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="./src/playnow.svg" alt="play song" />
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
      play.src = "./src/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./src/play.svg";
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
}
main();
