<template>
  <div class="w-full lg:hidden flex justify-between items-end px-2 sm:px-4 pb-4 select-none touch-none">
    <div class="flex justify-between items-end w-full max-w-lg mx-auto">
      <!-- D-Pad (Left Side) -->
      <div class="relative w-40 h-40 pointer-events-auto opacity-70">
        <button
          ref="upButton"
          class="absolute flex items-center justify-center touch-none select-none top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700/80 rounded-t-lg border border-slate-500 active:bg-slate-500/80"
          @touchstart.prevent="handlePress('up', true)"
          @touchend.prevent="handlePress('up', false)"
          @touchcancel.prevent="handlePress('up', false)"
          @mousedown.prevent="handlePress('up', true)"
          @mouseup.prevent="handlePress('up', false)"
          @mouseleave="handlePress('up', false)"
          @contextmenu.prevent
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        <button
          ref="downButton"
          class="absolute flex items-center justify-center touch-none select-none bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700/80 rounded-b-lg border border-slate-500 active:bg-slate-500/80"
          @touchstart.prevent="handlePress('down', true)"
          @touchend.prevent="handlePress('down', false)"
          @touchcancel.prevent="handlePress('down', false)"
          @mousedown.prevent="handlePress('down', true)"
          @mouseup.prevent="handlePress('down', false)"
          @mouseleave="handlePress('down', false)"
          @contextmenu.prevent
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        <button
          ref="leftButton"
          class="absolute flex items-center justify-center touch-none select-none left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700/80 rounded-l-lg border border-slate-500 active:bg-slate-500/80"
          @touchstart.prevent="handlePress('left', true)"
          @touchend.prevent="handlePress('left', false)"
          @touchcancel.prevent="handlePress('left', false)"
          @mousedown.prevent="handlePress('left', true)"
          @mouseup.prevent="handlePress('left', false)"
          @mouseleave="handlePress('left', false)"
          @contextmenu.prevent
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <button
          ref="rightButton"
          class="absolute flex items-center justify-center touch-none select-none right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700/80 rounded-r-lg border border-slate-500 active:bg-slate-500/80"
          @touchstart.prevent="handlePress('right', true)"
          @touchend.prevent="handlePress('right', false)"
          @touchcancel.prevent="handlePress('right', false)"
          @mousedown.prevent="handlePress('right', true)"
          @mouseup.prevent="handlePress('right', false)"
          @mouseleave="handlePress('right', false)"
          @contextmenu.prevent
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-600" />
      </div>

      <!-- Action Buttons (Right Side) -->
      <div class="relative w-40 h-40 pointer-events-auto opacity-80">
        <button
          ref="punchButton"
          class="absolute flex items-center justify-center touch-none select-none top-0 right-10 w-16 h-16 bg-red-600/80 rounded-full border-2 border-red-400 active:bg-red-500/80 shadow-lg"
          @touchstart.prevent="handlePress('action1', true)"
          @touchend.prevent="handlePress('action1', false)"
          @touchcancel.prevent="handlePress('action1', false)"
          @mousedown.prevent="handlePress('action1', true)"
          @mouseup.prevent="handlePress('action1', false)"
          @mouseleave="handlePress('action1', false)"
          @contextmenu.prevent
        >
          <span class="font-black text-white text-xl">P</span>
        </button>

        <button
          ref="kickButton"
          class="absolute flex items-center justify-center touch-none select-none bottom-8 left-2 w-16 h-16 bg-blue-600/80 rounded-full border-2 border-blue-400 active:bg-blue-500/80 shadow-lg"
          @touchstart.prevent="handlePress('action2', true)"
          @touchend.prevent="handlePress('action2', false)"
          @touchcancel.prevent="handlePress('action2', false)"
          @mousedown.prevent="handlePress('action2', true)"
          @mouseup.prevent="handlePress('action2', false)"
          @mouseleave="handlePress('action2', false)"
          @contextmenu.prevent
        >
          <span class="font-black text-white text-xl">K</span>
        </button>

        <button
          ref="blockButton"
          class="absolute flex items-center justify-center touch-none select-none bottom-0 right-0 w-12 h-12 bg-amber-600/80 rounded-full border-2 border-amber-400 active:bg-amber-500/80 shadow-lg"
          @touchstart.prevent="handlePress('action3', true)"
          @touchend.prevent="handlePress('action3', false)"
          @touchcancel.prevent="handlePress('action3', false)"
          @mousedown.prevent="handlePress('action3', true)"
          @mouseup.prevent="handlePress('action3', false)"
          @mouseleave="handlePress('action3', false)"
          @contextmenu.prevent
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InputManager } from '~/services/InputManager';

interface Props {
  inputManager: { value: InputManager | null };
}

const props = defineProps<Props>();

const handlePress = (action: string, pressed: boolean) => {
  if (props.inputManager.value) {
    props.inputManager.value.setTouchState({ [action]: pressed });
  }
};
</script>
