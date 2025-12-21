# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-12-21

### Changed - UI Simplification & Script Selector
Major UX improvements for clearer script selection in both Training and Arcade modes:

- **Training mode**: Replaced confusing "Custom" with explicit **Script A** and **Script B** buttons
- **Arcade mode P2**: Removed "BOT" option, renamed "SCR A/B" to **SCRIPT A** and **SCRIPT B**
- **Fighter colors**: Script B now uses distinct **teal** color (was pink, too similar to Script A purple)
- **HUD labels**: Now show actual player type (AI, SCRIPT A, SCRIPT B, HUMAN) with matching colors
- **Scripts auto-load**: Default template loads automatically if no custom script saved
- **Quiet notifications**: Removed spammy "Script not ready" toasts; only errors show notifications
- **Script Editor**: Renamed "Reset" to **"Load Default"** for clarity

### Fixed
- Toast notification spam when selecting script modes

## [1.2.3] - 2025-12-21

### Changed - Import/Export Improvements
- **Export now saves generation number**: Continuation from where you left off.
- **Export includes architecture metadata**: Helps detect version mismatches.
- **Import shows detailed error messages**: Clear feedback on incompatible files.
- **Import restores generation counter**: Training continues from exported generation.
- **Import seeds 25% of population**: Better gene preservation through crossover.
- **Simplified UI**: Removed confusing "Arcade Only" option; import/export hidden in Arcade mode.

## [1.2.2] - 2025-12-21

### Changed - Neural Network Training Improvements
Major improvements to accelerate AI learning and produce more effective fighters:

- **Rich Fitness Shaping**: Restored incremental rewards for damage dealt (+3/point), remaining health (+2/point), and timeout wins (+200). Added stalemate penalty (-100) for passive play.
- **Stronger Selection Pressure**: Parents now selected from top 25% (was 50%) for faster convergence on good strategies.
- **Improved Mutation**: Larger base mutations (±0.5 to ±1.0 instead of ±0.25). Added 10% chance of "big mutations" (±2.0) to escape local optima.
- **Faster Adaptive Decay**: Mutation rate now decays from 30% to 5% over ~30 generations (was 25%→5% over ~50 generations).
- **Increased Network Capacity**: Hidden layer increased from 10 to 16 neurons (+60% capacity, 272 total weights).
- **Larger Population**: Default population size increased from 24 to 48 for better genetic diversity.

### Breaking Changes
- **Saved weights incompatible**: Previously exported AI weights will not work with the new 16-neuron architecture. Please retrain your AI.

### Documentation
- Added `docs/NN-improvements.md` with detailed analysis and implementation notes.
- Updated `docs/NEURAL_NETWORK.md` with new parameters and code examples.

## [1.2.1] - 2025-12-21

### Fixed
- **Mobile Controls Crash**: Resolved "Cannot read properties of undefined" error when using touch controls by properly passing `inputManager` ref.

### Changed
- **Dashboard UI Optimization**: Relocated "Pause/Start" and "Reset" controls higher up in the dashboard (between Player selectors) for better mobile accessibility and convenience.
- **Improved Control Labels**: The play button now dynamically transitions from **"START"** to **"PAUSE"** and **"RESUME"** to better reflect the current game state.

## [1.2.0] - 2025-12-21

### Added
- **Multi-Slot Script Editor**: You can now maintain two separate custom scripts (Script A and Script B) via new tabs in the editor.
- **Flexible Arcade Mode**: Redesigned match setup allows explicit selection of Player 1 and Player 2 types.
    - Player 1 options: Human, Script A, Script B.
    - Player 2 options: AI, Bot (Scripted), Script A, Script B.
- **Script vs Script Battles**: Ability to pit "Script A" against "Script B" to test strategies.
- **Immediate Visual Feedback**: Canvas fighters now visually update immediately when changing settings in Arcade mode.
- **Visual Indicators**: Added subtle color coding in UI to match fighter colors (Red for P1, Blue/Purple/Pink for P2).

### Changed
- Refactored `startMatch` logic in `App.tsx` to support arbitrary P1 vs P2 configurations.
- improved `CustomScriptWorker` handling to support dual parallel workers for "Custom vs Custom" matches.
- Updated documentation.

## [1.1.2] - 2025-12-21

### Fixed
- Fixed critical bug where custom scripts would reset/recompile after every round.
- Fixed `useEffect` dependency loop causing performance issues.
- Fixed UI toast notification spam.

## [1.1.1] - 2025-12-20

### Fixed
- Minor bug fixes and performance improvements.

## [1.1.0] - 2025-12-20

### Added
- Initial support for Custom Scripting via Monaco Editor.
- Web Worker isolation for user scripts.
