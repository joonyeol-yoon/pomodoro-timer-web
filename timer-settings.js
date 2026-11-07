const TIMER_MINUTES_KEY = "pomodoro.timerMinutes";
const DEFAULT_TIMER_MINUTES = 25;
const MIN_TIMER_MINUTES = 1;
const MAX_TIMER_MINUTES = 60;

function loadTimerMinutes() {
  let stored = null;
  try {
    stored = localStorage.getItem(TIMER_MINUTES_KEY);
  } catch {
    return DEFAULT_TIMER_MINUTES;
  }

  const minutes = Number(stored);
  const isValid =
    stored !== null &&
    Number.isInteger(minutes) &&
    minutes >= MIN_TIMER_MINUTES &&
    minutes <= MAX_TIMER_MINUTES;

  return isValid ? minutes : DEFAULT_TIMER_MINUTES;
}

function saveTimerMinutes(minutes) {
  localStorage.setItem(TIMER_MINUTES_KEY, String(minutes));
}
