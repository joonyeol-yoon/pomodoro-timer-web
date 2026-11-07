const TICK_MS = 250;

const timeElement = document.getElementById("time");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const resetButton = document.getElementById("reset-button");
const settingsButton = document.getElementById("settings-button");

let durationMs = loadTimerMinutes() * 60000;
let remainingMs = durationMs;
let endTime = null;
let intervalId = null;

function render() {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  // 글꼴의 숫자 폭이 제각각이라 글자마다 고정 폭 칸에 넣어 흔들림을 막는다.
  const characters = [...`${minutes}:${seconds}`].map((character) => {
    const span = document.createElement("span");
    span.className = character === ":" ? "time-colon" : "time-digit";
    span.textContent = character;
    return span;
  });

  timeElement.replaceChildren(...characters);
  document.documentElement.style.setProperty(
    "--minutes-left",
    remainingMs / 60000,
  );
}

function clearTick() {
  clearInterval(intervalId);
  intervalId = null;
}

// 간격을 세지 않고 종료 시각과 비교한다. 백그라운드 탭에서 인터벌이 느려져도 시간이 밀리지 않는다.
function tick() {
  remainingMs = Math.max(endTime - Date.now(), 0);
  if (remainingMs === 0) {
    clearTick();
  }
  render();
}

function startTimer() {
  if (intervalId !== null) {
    return;
  }
  if (remainingMs === 0) {
    remainingMs = durationMs;
  }
  endTime = Date.now() + remainingMs;
  intervalId = setInterval(tick, TICK_MS);
  render();
}

function stopTimer() {
  if (intervalId === null) {
    return;
  }
  remainingMs = Math.max(endTime - Date.now(), 0);
  clearTick();
  render();
}

function resetTimer() {
  clearTick();
  remainingMs = durationMs;
  render();
}

// 진행 중이거나 일시정지된 타이머는 끊지 않고, 새 시간은 다음 초기화부터 적용한다.
function syncDuration() {
  const savedDurationMs = loadTimerMinutes() * 60000;
  const isUntouched = intervalId === null && remainingMs === durationMs;

  durationMs = savedDurationMs;
  if (isUntouched) {
    remainingMs = durationMs;
    render();
  }
}

startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);
settingsButton.addEventListener("click", () => {
  window.location.href = "settings.html";
});

// 뒤로 가기(페이지 복원)와 다른 탭에서의 저장까지 반영한다.
window.addEventListener("pageshow", syncDuration);
window.addEventListener("storage", syncDuration);

render();
