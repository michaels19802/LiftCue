# LiftCue

LiftCue is a focused SuuntoPlus strength-training rest timer for Suunto watches.

It tracks the current exercise and set while leaving the Suunto workout recording running. LiftCue does not record exercise names, weights, or repetitions and does not provide workout planning.

## Controls

### Workout display

- Short Up: open the New Exercise confirmation display.
- Long Up: open Settings.
- Down while lifting: complete the current set and start rest.
- Down while resting or in overtime: end rest and start the next set.
- Touch `−15` or `+15` during rest: adjust both the current rest and the default duration used for future rests.

### New Exercise confirmation

- Up: confirm Yes. This increments `EXE`, resets `SET` to 1, cancels rest or overtime, and restarts the lifting timer.
- Down: cancel No and return to the Workout display without changing the workout state.
- Long Up: cancel the confirmation and open Settings.

The active lifting, rest, or overtime timer continues while the confirmation display is visible.

### Settings display

- Touch `−15` or `+15`: adjust Default Rest in 15-second steps from 15 to 600 seconds.
- Touch Manual or Auto: select what happens when rest expires.
- Touch Done: return to the Workout display.
- Long Up: return to the Workout display when touch is unavailable.

Short Up and Down do nothing while Settings is displayed. Enable touch for the workout on the watch to use the touchscreen controls; the core lifting/rest flow remains usable with hardware buttons when touch is disabled.

## Continue modes

- Manual: rest expiry enters overtime and waits for Down before starting the next set.
- Auto: rest expiry immediately starts the next set.

The small `M` or `A` marker on the Workout display shows the active mode.

## Features

- Exercise and per-exercise set numbering
- Persistent Default Rest and Continue Mode
- Rest adjustment from the Workout and Settings displays
- Lifting, rest, and overtime timers
- Rest cues at 10 seconds, then 3, 2, and 1 seconds
- Strong rest-expiry cue and short adjustment confirmation
- Heart rate, heart-rate zone, calories, session duration, and time of day
- Colour-coded timer: green while lifting, yellow while resting, and red in overtime
- AMOLED-friendly black background

## Target

- Platform: SuuntoPlus Sports App
- Activity: Weight Training
- Built with SuuntoPlus Editor for VS Code
- Tested layouts: `s`, `m`, `l`, `n`, `o`, and `q`
- Real-watch target: Suunto Vertical 2
