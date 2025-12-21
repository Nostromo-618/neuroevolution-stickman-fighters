# Changelog

All notable changes to this project will be documented in this file.

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
