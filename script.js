const container = document.getElementById("gameContainer");

let level = 1;
let lives = 3;
let score = 0;

const TOTAL_LEVELS = 20;
const WRONG_SOUND_THRESHOLD = 40;

let audioContext;
let analyser;
let dataArray;
let lastSound = 0;

function createBall(size){
  const ball = document.createElement("div");

  ball.style.width = size + "px";
  ball.style.height = size + "px";
  ball.style.borderRadius = "50%";
  ball.style.position = "absolute";
  ball.style.background = "radial-gradient(circle,#ffdd00,#ff5500)";
  ball.style.left = Math.random()*400 + "px";
  ball.style.top = Math.random()*300 + "px";

  container.appendChild(ball);

  return ball;
}

function startLevel(){

  container.innerHTML = "";

  const requiredSound = level * 5;
  const size = 60 + level*10;

  const ball = createBall(size);

  const info = document.createElement("div");
  info.innerText = "Level " + level + " | Need " + requiredSound + "% sound";
  container.appendChild(info);

  listenForSound(requiredSound, ball);
}

async function setupMic(){

  if(audioContext) return;

  const stream = await navigator.mediaDevices.getUserMedia({audio:true});

  audioContext = new AudioContext();

  analyser = audioContext.createAnalyser();

  const mic = audioContext.createMediaStreamSource(stream);

  mic.connect(analyser);

  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function listenForSound(requiredSound,ball){

  const detect = ()=>{

    analyser.getByteFrequencyData(dataArray);

    let sum = 0;

    for(let i=0;i<dataArray.length;i++){
      sum += dataArray[i];
    }

    const avg = sum/dataArray.length;

    const percent = Math.min(100,Math.round((avg/120)*100));

    const now = Date.now();

    if(percent >= requiredSound && now-lastSound>800){

      lastSound = now;

      ball.remove();

      level++;

      if(level > TOTAL_LEVELS){

        alert("You won! Score: "+score);

        return;
      }

      startLevel();

    }

    else if(percent >= WRONG_SOUND_THRESHOLD && percent < requiredSound && now-lastSound>800){

      lastSound = now;

      lives--;

      alert("Wrong sound! Lives left: "+lives);

      if(lives<=0){

        alert("Game Over");

        return;

      }

    }

    requestAnimationFrame(detect);

  }

  detect();

}

async function startGame(){

  await setupMic();

  level = 1;

  lives = 3;

  startLevel();

}

startGame();