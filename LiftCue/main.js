var STATE_LIFTING = 0;
var STATE_RESTING = 1;
var STATE_OVERTIME = 2;

var DEFAULT_REST_SECONDS = 60;

var READY_CUE_SECONDS = 10;
var REST_TICK_3_SECONDS = 3;
var REST_TICK_2_SECONDS = 2;
var REST_TICK_1_SECONDS = 1;

var CUE_READY = "Info";
var CUE_TICK = "Button";
var CUE_EXPIRED = "Interval";
var CUE_BUTTON_PRESS = "Button";

var state;
var setNumber;
var phaseStartSeconds;
var restStartSeconds;
var restDurationSeconds;
var cueReadyPlayed;
var cueTick3Played;
var cueTick2Played;
var cueTick1Played;
var cueExpiredPlayed;

var activitySeconds = function(input) {
  if (input && input.duration >= 0) return input.duration;
  return 0;
};

var timeOfDaySeconds = function(input) {
  var localTime;
  var secondsToday;

  if (!input || input.localTime === undefined) return -1;

  localTime = Math.floor(input.localTime);
  if (localTime <= 0) return -1;

  secondsToday = localTime % 86400;
  return secondsToday;
};

var initRestCues = function() {
  cueReadyPlayed = 0;
  cueTick3Played = 0;
  cueTick2Played = 0;
  cueTick1Played = 0;
  cueExpiredPlayed = 0;
};

var initLiftCue = function(now) {
  state = STATE_LIFTING;
  setNumber = 1;
  phaseStartSeconds = now;
  restStartSeconds = now;
  restDurationSeconds = DEFAULT_REST_SECONDS;
  initRestCues();
};

var playRestCues = function(remainingSeconds) {
  var displayRemaining = Math.ceil(remainingSeconds);

  if (!cueReadyPlayed && displayRemaining <= READY_CUE_SECONDS) {
    playIndication(CUE_READY, false, 1, false);
    cueReadyPlayed = 1;
  }

  if (!cueTick3Played && displayRemaining <= REST_TICK_3_SECONDS) {
    playIndication(CUE_TICK, false, 0, false);
    cueTick3Played = 1;
  }

  if (!cueTick2Played && displayRemaining <= REST_TICK_2_SECONDS) {
    playIndication(CUE_TICK, false, 0, false);
    cueTick2Played = 1;
  }

  if (!cueTick1Played && displayRemaining <= REST_TICK_1_SECONDS) {
    playIndication(CUE_TICK, false, 0, false);
    cueTick1Played = 1;
  }
};

var playExpiredCue = function() {
  if (!cueExpiredPlayed) {
    playIndication(CUE_EXPIRED, false, 2, false);
    cueExpiredPlayed = 1;
  }
};

var playButtonPressCue = function() {
  playIndication(CUE_BUTTON_PRESS, false, 0, false);
};

var startRest = function(now) {
  state = STATE_RESTING;
  restStartSeconds = now;
  initRestCues();
};

var startNextSet = function(now) {
  setNumber += 1;
  state = STATE_LIFTING;
  phaseStartSeconds = now;
  initRestCues();
};

var updateState = function(now) {
  var elapsed;
  var remaining;

  if (state == STATE_RESTING) {
    elapsed = now - restStartSeconds;
    remaining = restDurationSeconds - elapsed;

    if (remaining > 0) {
      playRestCues(remaining);
    }
    else {
      playExpiredCue();
      state = STATE_OVERTIME;
    }
  }
};

var publish = function(now, output, input) {
  var elapsed;
  var remaining;
  var overtime;

  output.state = state;
  output.setNumber = setNumber;
  output.timeOfDay = timeOfDaySeconds(input);

  if (state == STATE_LIFTING) {
    elapsed = now - phaseStartSeconds;
    output.timerSeconds = Math.floor(elapsed);
  }
  else if (state == STATE_RESTING) {
    elapsed = now - restStartSeconds;
    remaining = restDurationSeconds - elapsed;
    output.timerSeconds = Math.max(0, Math.ceil(remaining));
  }
  else {
    overtime = now - restStartSeconds - restDurationSeconds;
    output.timerSeconds = -Math.max(0.1, Math.floor(overtime));
  }
};

function onLoad(input, output) {
  var now = activitySeconds(input);
  initLiftCue(now);
  publish(now, output, input);
}

function onExerciseStart(input, output) {
  var now = activitySeconds(input);
  initLiftCue(now);
  publish(now, output, input);
}

function evaluate(input, output) {
  var now = activitySeconds(input);
  updateState(now);
  publish(now, output, input);
}

function onEvent(input, output, eventId) {
  var now = activitySeconds(input);

  if (eventId != 1) return;

  playButtonPressCue();

  if (state == STATE_LIFTING) {
    startRest(now);
  }
  else {
    startNextSet(now);
  }

  publish(now, output, input);
}

function getUserInterface() {
  return {
    template: "t"
  };
}

function getSummaryOutputs(input, output) {
}
