import { InputState } from '../types';

const defaultInput: InputState = {
  left: false, right: false, up: false, down: false,
  action1: false, action2: false, action3: false
};

export class InputManager {
  keys: Set<string> = new Set();
  gamepadIndex: number | null = null;
  
  private handleKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);
  private handleKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private handleGamepadConnected = (e: any) => {
      console.log('Gamepad connected at index %d: %s.', e.gamepad.index, e.gamepad.id);
      this.gamepadIndex = e.gamepad.index;
  };

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
  }

  getState(): InputState {
    // Keyboard mapping
    const kbState = {
      left: this.keys.has('ArrowLeft') || this.keys.has('KeyA'),
      right: this.keys.has('ArrowRight') || this.keys.has('KeyD'),
      up: this.keys.has('ArrowUp') || this.keys.has('KeyW'),
      down: this.keys.has('ArrowDown') || this.keys.has('KeyS'),
      action1: this.keys.has('KeyJ') || this.keys.has('Space'), // Punch
      action2: this.keys.has('KeyK'), // Kick
      action3: this.keys.has('KeyL') || this.keys.has('ShiftLeft'), // Block
    };

    // Gamepad mapping
    if (this.gamepadIndex !== null) {
      const gp = navigator.getGamepads()[this.gamepadIndex];
      if (gp) {
        // Simple deadzone
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];
        
        return {
          left: kbState.left || axisX < -0.5 || gp.buttons[14].pressed,
          right: kbState.right || axisX > 0.5 || gp.buttons[15].pressed,
          up: kbState.up || axisY < -0.5 || gp.buttons[12].pressed,
          down: kbState.down || axisY > 0.5 || gp.buttons[13].pressed,
          action1: kbState.action1 || gp.buttons[2].pressed || gp.buttons[0].pressed, // X or A
          action2: kbState.action2 || gp.buttons[3].pressed || gp.buttons[1].pressed, // Y or B
          action3: kbState.action3 || gp.buttons[5].pressed || gp.buttons[4].pressed || gp.buttons[7].pressed, // Bumpers/Triggers
        };
      }
    }

    return kbState;
  }
}