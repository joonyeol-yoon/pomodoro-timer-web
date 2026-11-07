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

function createFace(className) {
  const half = document.createElement("span");
  const digit = document.createElement("span");
  half.className = className;
  digit.className = "flip-digit";
  half.append(digit);
  return { half, digit };
}

// 카드 한 장은 고정된 위/아래 반쪽과, 넘어갈 때만 보이는 위/아래 날개로 이루어진다.
function createFlipCard() {
  const element = document.createElement("span");
  const top = createFace("half half-top");
  const bottom = createFace("half half-bottom");
  const flapTop = createFace("half half-top flap flap-top");
  const flapBottom = createFace("half half-bottom flap flap-bottom");

  element.className = "flip-card";
  element.append(top.half, bottom.half, flapTop.half, flapBottom.half);

  const card = { element, top, bottom, flapTop, flapBottom, value: null };

  // 날개가 내려앉으면 그제야 아래 반쪽을 새 숫자로 바꾼다.
  flapBottom.half.addEventListener("animationend", () => {
    bottom.digit.textContent = card.value;
    element.classList.remove("is-flipping");
  });

  return card;
}

function setCardValue(card, value) {
  const previous = card.value;
  if (previous === value) {
    return;
  }

  card.value = value;
  card.top.digit.textContent = value;
  card.flapBottom.digit.textContent = value;

  if (previous === null) {
    card.bottom.digit.textContent = value;
    return;
  }

  card.bottom.digit.textContent = previous;
  card.flapTop.digit.textContent = previous;

  // 넘어가는 도중에 값이 또 바뀌어도 애니메이션이 처음부터 다시 돌도록 한다.
  card.element.classList.remove("is-flipping");
  void card.element.offsetWidth;
  card.element.classList.add("is-flipping");
}

const flipCards = [
  createFlipCard(),
  createFlipCard(),
  createFlipCard(),
  createFlipCard(),
];
const colon = document.createElement("span");
colon.className = "time-colon";

const board = document.createElement("span");
board.className = "flip-board";
board.setAttribute("aria-hidden", "true");
board.append(
  flipCards[0].element,
  flipCards[1].element,
  colon,
  flipCards[2].element,
  flipCards[3].element,
);
timeElement.replaceChildren(board);

function render() {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const digits =
    String(minutes).padStart(2, "0") + String(seconds).padStart(2, "0");

  flipCards.forEach((card, index) => setCardValue(card, digits[index]));

  // 카드는 스크린 리더에서 숨기고, 시간은 라벨로 읽어 준다.
  timeElement.setAttribute("aria-label", `남은 시간 ${minutes}분 ${seconds}초`);
  document.body.classList.toggle("is-running", intervalId !== null);
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
