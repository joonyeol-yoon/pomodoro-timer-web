const form = document.getElementById("settings-form");
const minutesInput = document.getElementById("timer-minutes");
const saveButton = document.getElementById("save-button");

// 비어 있음(required), 범위(min, max), 정수 여부(step)는 input 속성으로 검사한다.
function updateSaveButton() {
  saveButton.disabled = !minutesInput.checkValidity();
}

function showSavedMinutes() {
  minutesInput.value = loadTimerMinutes();
  updateSaveButton();
}

minutesInput.addEventListener("input", updateSaveButton);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!minutesInput.checkValidity()) {
    return;
  }
  saveTimerMinutes(Number(minutesInput.value));
  window.location.href = "index.html";
});

// 뒤로 가기로 돌아왔을 때도 저장된 값을 보여 주도록 pageshow를 쓴다.
window.addEventListener("pageshow", showSavedMinutes);
