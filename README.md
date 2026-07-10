# LiftCue

LiftCue is a simple SuuntoPlus strength-training rest timer for Suunto watches.

It is designed for Weight Training activities where you want a one-button flow:

1. Lift a set.
2. Press Down/Lap to start rest.
3. Rest counts down.
4. Press Up during rest to add 15 seconds to the current and future rest periods.
5. Long press Up to toggle manual/auto continue mode.
6. The watch vibrates when rest expires.
7. In manual mode, overtime counts up until you press Down/Lap to start the next set.
8. In auto mode, the next set starts automatically when rest expires.

## Features

- Set counter
- Set timer
- 60 second rest countdown
- Up button adds 15 seconds to rest during a workout
- Manual or auto continue after rest
- Overtime timer
- Heart rate
- Heart rate zone
- Calories
- Session timer
- Time of day
- Vibration cue on button press
- Rest vibration cues at 10 seconds, then 3, 2, and 1 seconds
- Strong vibration cue at rest expiry
- Black AMOLED-friendly background
- Compact main timer below one minute (saves battery)
- Colour-coded main timer:
  - Green: lifting
  - Yellow: resting
  - Red: rest overtime

The small `M`/`A` marker shows the continue mode:

- `M`: manual mode. Rest expiry enters overtime until Down/Lap starts the next set.
- `A`: auto mode. Rest expiry starts the next set automatically.

## Target

- Platform: SuuntoPlus Sports App
- Tested on real Suunto Vertical 2
- Tested on all models in the simulator
- Intended activity: Weight Training
- Built with: SuuntoPlus Editor for VS Code

## Notes

This app is intentionally small and focused. It is not a rep counter, weight logger, exercise detector, workout planner, or routine tracker.

