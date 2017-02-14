/**
  this is a timer
  by default it executes an observing function after 3 minutes
  user can add additional time and Timer will continue delaying for
  the additional time
  the default additional time unit is 1 minute
 */
export default class Timer {
  constructor(observer, ms = 180000, intervalObserver) {
    this._ms = ms;
    this._additionalTime = 0;
    this.timer = null;
    this.intervalTimer = null;
    this.observer = observer;
    this.intervalObserver = intervalObserver || (() => {});
    this.timePassed = 0;
  }

  runIntervalTimer() {
    if (!this.timer) {
      this.runTimer();
    }

    this.intervalTimer = setTimeout(() => {
      this.timePassed += 1;
      this.intervalObserver();
      this.runIntervalTimer();
    }, 1000);
  }

  setObserver(observer) {
    this.observer = observer;
  }

  setMS(ms) {
    this._ms = ms;
  }

  resetAdditionalTime() {
    this._additionalTime = 0;
  }

  resetTimer() {
    this.timer = null;
    this.intervalTimer = null;
    this.clearTimePassed();
    this.resetAdditionalTime();
  }

  clearTimePassed() {
    this.timePassed = 0;
  }

  runTimer() {
    clearTimeout(this.timer); //precaution
    this.timer = setTimeout(() => {
      const additionalTime = this.getAdditionalTime();
      if (additionalTime) {
        this.addTime();
        this.runTimer();
      } else {
        this.observer();
        this.stopTimer();
      }
    }, this.getTime());
  }

  /**
    stops timer early and executes observer early
   */
  stopTimer(shouldExecuteObserver = false) {
    clearTimeout(this.timer);
    clearTimeout(this.intervalTimer);
    if (shouldExecuteObserver) {
      this.observer();
    }
    this.resetTimer();
  }

  addAdditionalTime(ms = 60000) {
    this._additionalTime += ms;
  }

  addTime() {
    this._ms += this._additionalTime;
    this.resetAdditionalTime();
  }

  getAdditionalTime() {
    return this._additionalTime;
  }

  getTime() {
    return this._ms;
  }
}
