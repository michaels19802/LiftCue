var STATE_LIFTING = 0;
var STATE_RESTING = 1;
var STATE_OVERTIME = 2;

var CONTINUE_MANUAL = 0;
var CONTINUE_AUTO = 1;
var DEFAULT_CONTINUE_MODE = CONTINUE_AUTO;

var EVENT_DOWN_PRESS = 1;
var EVENT_NEW_EXERCISE = 2;
var EVENT_REST_MINUS = 3;
var EVENT_REST_PLUS = 4;
var EVENT_SETTINGS_REST_MINUS = 5;
var EVENT_SETTINGS_REST_PLUS = 6;
var EVENT_CONTINUE_MANUAL = 7;
var EVENT_CONTINUE_AUTO = 8;

var DEFAULT_REST_SECONDS = 60;
var MIN_REST_SECONDS = 15;
var MAX_REST_SECONDS = 600;
var REST_ADJUSTMENT_SECONDS = 15;

var READY_CUE_SECONDS = 10;
var REST_TICK_3_SECONDS = 3;
var REST_TICK_2_SECONDS = 2;
var REST_TICK_1_SECONDS = 1;

var CUE_READY = "Info";
var CUE_TICK = "Button";
var CUE_EXPIRED = "Interval";
var CUE_BUTTON_PRESS = "Interval";
var CUE_ADJUSTMENT = "Button";

var state;
var exerciseNumber;
var setNumber;
var sessionSetCount;
var phaseStartSeconds;
var restStartSeconds;
var restDurationSeconds;
var defaultRestSeconds;
var continueMode;
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

var loadPreferences = function() {
  var storedDefaultRest;
  var storedContinueMode;
  var parsedDefaultRest;
  var parsedContinueMode;

  defaultRestSeconds = DEFAULT_REST_SECONDS;
  continueMode = DEFAULT_CONTINUE_MODE;

  if (typeof localStorage == "undefined") return;

  storedDefaultRest = localStorage.getItem("defaultRestSeconds");
  storedContinueMode = localStorage.getItem("continueMode");
  parsedDefaultRest = parseInt(storedDefaultRest, 10);
  parsedContinueMode = parseInt(storedContinueMode, 10);

  if (parsedDefaultRest == parsedDefaultRest) {
    defaultRestSeconds = Math.max(
      MIN_REST_SECONDS,
      Math.min(MAX_REST_SECONDS, parsedDefaultRest)
    );
  }

  if (
    parsedContinueMode == CONTINUE_MANUAL ||
    parsedContinueMode == CONTINUE_AUTO
  ) {
    continueMode = parsedContinueMode;
  }
};

var savePreferences = function() {
  if (typeof localStorage == "undefined") return;

  localStorage.setItem("defaultRestSeconds", "" + defaultRestSeconds);
  localStorage.setItem("continueMode", "" + continueMode);
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
  exerciseNumber = 1;
  setNumber = 1;
  sessionSetCount = 0;
  phaseStartSeconds = now;
  restStartSeconds = now;
  restDurationSeconds = defaultRestSeconds;
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
  playIndication(CUE_BUTTON_PRESS, false, 2, false);
};

var playAdjustmentCue = function() {
  playIndication(CUE_ADJUSTMENT, false, 0, false);
};

var startRest = function(now) {
  state = STATE_RESTING;
  restStartSeconds = now;
  restDurationSeconds = defaultRestSeconds;
  initRestCues();
};

var startNextSet = function(now) {
  setNumber += 1;
  state = STATE_LIFTING;
  phaseStartSeconds = now;
  initRestCues();
};

var startNewExercise = function(now) {
  exerciseNumber += 1;
  setNumber = 1;
  state = STATE_LIFTING;
  phaseStartSeconds = now;
  initRestCues();
};

var expireRest = function(now) {
  playExpiredCue();

  if (continueMode == CONTINUE_AUTO) {
    startNextSet(now);
  }
  else {
    state = STATE_OVERTIME;
  }
};

var reconcileRestCues = function(now) {
  var elapsed;
  var remaining;
  var displayRemaining;

  if (state != STATE_RESTING) return;

  elapsed = now - restStartSeconds;
  remaining = restDurationSeconds - elapsed;

  if (remaining <= 0) {
    expireRest(now);
    return;
  }

  displayRemaining = Math.ceil(remaining);
  cueReadyPlayed = displayRemaining <= READY_CUE_SECONDS ? 1 : 0;
  cueTick3Played = displayRemaining <= REST_TICK_3_SECONDS ? 1 : 0;
  cueTick2Played = displayRemaining <= REST_TICK_2_SECONDS ? 1 : 0;
  cueTick1Played = displayRemaining <= REST_TICK_1_SECONDS ? 1 : 0;
};

var adjustDefaultRest = function(deltaSeconds, now) {
  var previousDefault = defaultRestSeconds;
  var nextDefault = Math.max(
    MIN_REST_SECONDS,
    Math.min(MAX_REST_SECONDS, previousDefault + deltaSeconds)
  );
  var effectiveDelta = nextDefault - previousDefault;

  if (effectiveDelta == 0) return false;

  defaultRestSeconds = nextDefault;

  if (state == STATE_RESTING) {
    restDurationSeconds += effectiveDelta;
    reconcileRestCues(now);
  }

  savePreferences();
  return true;
};

var handleDownPress = function(now) {
  playButtonPressCue();

  if (state == STATE_LIFTING) {
    sessionSetCount += 1;
    startRest(now);
  }
  else {
    startNextSet(now);
  }
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
      expireRest(now);
    }
  }
};

var publish = function(now, output, input) {
  var elapsed;
  var remaining;
  var overtime;

  output.state = state;
  output.exerciseNumber = exerciseNumber;
  output.setNumber = setNumber;
  output.continueMode = continueMode;
  output.defaultRestSeconds = defaultRestSeconds;
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
  loadPreferences();
  initLiftCue(now);
  publish(now, output, input);
}

function onExerciseStart(input, output) {
  var now = activitySeconds(input);
  loadPreferences();
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

  if (eventId == EVENT_DOWN_PRESS) {
    handleDownPress(now);
  }
  else if (eventId == EVENT_NEW_EXERCISE) {
    playButtonPressCue();
    startNewExercise(now);
  }
  else if (
    eventId == EVENT_REST_MINUS ||
    eventId == EVENT_SETTINGS_REST_MINUS
  ) {
    if (adjustDefaultRest(-REST_ADJUSTMENT_SECONDS, now)) {
      playAdjustmentCue();
    }
  }
  else if (
    eventId == EVENT_REST_PLUS ||
    eventId == EVENT_SETTINGS_REST_PLUS
  ) {
    if (adjustDefaultRest(REST_ADJUSTMENT_SECONDS, now)) {
      playAdjustmentCue();
    }
  }
    else if (eventId == EVENT_CONTINUE_MANUAL) {
        if (continueMode != CONTINUE_MANUAL) {
            continueMode = CONTINUE_MANUAL;
            savePreferences();
            playAdjustmentCue();
        }
    }
    else if (eventId == EVENT_CONTINUE_AUTO) {
        if (continueMode != CONTINUE_AUTO) {
            continueMode = CONTINUE_AUTO;
            savePreferences();
            playAdjustmentCue();
        }
    }
  else {
    return;
  }

  updateState(now);
  publish(now, output, input);
}

function getUserInterface() {
  return {
    template: "t"
  };
}

function getSummaryOutputs(input, output) {
}
