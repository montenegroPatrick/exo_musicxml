/// <reference lib="webworker" />

let timerID: any = null;
let interval = 25;

addEventListener('message', ({ data }) => {
  if (data === 'start') {
    timerID = setInterval(() => postMessage('tick'), interval);
  } else if (data.interval) {
    interval = data.interval;
    if (timerID) {
      clearInterval(timerID);
      timerID = setInterval(() => postMessage('tick'), interval);
    }
  } else if (data === 'stop') {
    clearInterval(timerID);
    timerID = null;
  }
});
