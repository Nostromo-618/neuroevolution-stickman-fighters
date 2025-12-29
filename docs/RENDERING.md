# 🎨 Visual Rendering System

This document explains how the game's graphics are rendered using the HTML5 Canvas 2D API.

---

## Table of Contents

1. [Canvas Basics](#canvas-basics)
2. [Rendering Pipeline](#rendering-pipeline)
3. [Background Layers](#background-layers)
4. [Stickman Skeleton System](#stickman-skeleton-system)
5. [Animation System](#animation-system)
6. [Visual Effects](#visual-effects)
7. [HUD Elements](#hud-elements)

---

## Canvas Basics

We use the **HTML5 Canvas 2D API** for all game rendering.

### Canvas Setup

```html
<canvas width="800" height="450" />
```

### Coordinate System

```
(0,0) ─────────────────────────────────► X (800)
  │
  │
  │      CANVAS COORDINATE SYSTEM
  │
  │      • Origin at top-left
  │      • X increases rightward
  │      • Y increases downward
  │
  ▼
  Y (450)
```

### Getting the Context

```typescript
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Now we can draw!
ctx.fillRect(10, 10, 100, 50);  // Draw rectangle
ctx.beginPath();                 // Start path
ctx.arc(50, 50, 30, 0, Math.PI * 2);  // Circle
ctx.fill();                      // Fill the path
```

---

## Rendering Pipeline

Each frame, we completely redraw the canvas (retained mode is not used).

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER PIPELINE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CLEAR                                                    │
│     └── ctx.clearRect(0, 0, 800, 450)                       │
│                                                              │
│  2. BACKGROUND (Back to front)                               │
│     ├── Sky gradient                                         │
│     ├── Moon with glow                                       │
│     ├── Distant forest (dark blue)                          │
│     ├── Close trees (dark green triangles)                  │
│     └── Ground with grass highlight                         │
│                                                              │
│  3. FIGHTERS                                                 │
│     ├── Fighter 1 (stickman skeleton)                       │
│     └── Fighter 2 (stickman skeleton)                       │
│                                                              │
│  4. EFFECTS                                                  │
│     └── Attack hitbox glow (when active)                    │
│                                                              │
│  5. HUD (Rendered via Vue components, overlaid on canvas)   │
│     ├── Health bars                                          │
│     ├── Energy bars                                          │
│     ├── Timer                                                │
│     └── Generation counter                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why Complete Redraw?

Canvas is an **immediate-mode** graphics API:
- Nothing is "remembered" between frames
- Must redraw everything each frame
- This actually simplifies game rendering!
- No need to track what changed

---

## Background Layers

The background creates depth through layering (painter's algorithm).

### Layer 1: Sky Gradient

```typescript
// Create vertical gradient
const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
gradient.addColorStop(0, '#0f172a');  // Dark top
gradient.addColorStop(1, '#1e293b');  // Lighter bottom

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
```

### Layer 2: Moon

```typescript
ctx.fillStyle = '#f8fafc';
ctx.shadowBlur = 40;         // Glow effect
ctx.shadowColor = '#e2e8f0';
ctx.beginPath();
ctx.arc(CANVAS_WIDTH - 100, 80, 50, 0, Math.PI * 2);
ctx.fill();
ctx.shadowBlur = 0;  // Reset for other elements
```

### Layer 3: Distant Forest

```typescript
ctx.fillStyle = '#1e3a8a';  // Dark blue
for (let i = 0; i < CANVAS_WIDTH; i += 40) {
    const h = 50 + Math.sin(i * 0.05) * 20;  // Varied height
    ctx.fillRect(i, CANVAS_HEIGHT - 120 - h, 20, h + 50);
}
```

### Layer 4: Close Trees

```typescript
ctx.fillStyle = '#064e3b';  // Dark green
[50, 250, 450, 650].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, CANVAS_HEIGHT - 80);       // Left base
    ctx.lineTo(x + 30, CANVAS_HEIGHT - 400); // Top point
    ctx.lineTo(x + 60, CANVAS_HEIGHT - 80);  // Right base
    ctx.fill();
});
```

### Layer 5: Ground

```typescript
// Dark ground base
ctx.fillStyle = '#022c22';
ctx.fillRect(0, CANVAS_HEIGHT - 70, CANVAS_WIDTH, 70);

// Grass highlight strip
ctx.fillStyle = '#14532d';
ctx.fillRect(0, CANVAS_HEIGHT - 75, CANVAS_WIDTH, 10);
```

---

## Stickman Skeleton System

Fighters are rendered as skeleton-based stickmen with articulated joints.

### Anatomy

```
                    ○  ← HEAD (circle)
                    │
                ────┼────  ← HEADBAND (colored stripe)
                    │
             ═══════╪═══════  ← SHOULDERS (anchor for arms)
                    ║
                    ║  ← TORSO (thick line)
                    ║
             ═══════╪═══════  ← HIPS (anchor for legs)
            /       │       \
           /        │        \  ← LEGS (2 segments each)
          ○         │         ○
                    │
                 FEET
```

### Joint Structure

Each limb has three points:
1. **Origin** (shoulder or hip)
2. **Midpoint** (elbow or knee)
3. **Endpoint** (hand or foot)

```typescript
// Left arm joint positions relative to shoulder
const lArm = {
  elbow: { x: -15, y: 15 },
  hand: { x: -10, y: -10 }
};

// Left leg joint positions relative to hip
const lLeg = {
  knee: { x: -5, y: 20 },
  foot: { x: -10, y: 45 }
};
```

### Direction Mirroring

The `direction` property (-1 or 1) flips the skeleton horizontally:

```typescript
// Direction multiplier
const dir = fighter.direction;  // 1 = facing right, -1 = facing left

// Apply to joint positions
lArm = { 
  elbow: { x: 10 * dir, y: 20 },  // Flips X based on direction
  hand: { x: 20 * dir, y: -10 } 
};
```

### Depth Ordering

To create proper layering, we draw back limbs first:

```typescript
if (dir === 1) {  // Facing right
    // Left limbs are BEHIND the body
    drawLimb(hip, lLeg);   // Back leg
    drawLimb(shoulder, lArm);  // Back arm
    
    // Redraw torso to cover joints
    drawTorso();
    
    // Right limbs are IN FRONT
    drawLimb(hip, rLeg);   // Front leg
    drawLimb(shoulder, rArm);  // Front arm
}
```

---

## Animation System

Animations are **state-based** with procedural interpolation.

### Animation States

Each `FighterAction` state defines a unique pose:

```typescript
switch (fighter.state) {
  case FighterAction.IDLE:
    // Breathing animation (subtle movement)
    headOffset.y = Math.sin(frameCount * 0.1) * 2;
    // Fighting stance
    lArm = { elbow: {x: 10, y: 20}, hand: {x: 20, y: -10} };
    rArm = { elbow: {x: 15, y: 20}, hand: {x: 25, y: -5} };
    break;
    
  case FighterAction.PUNCH:
    // Extended punching arm
    rArm = { elbow: {x: 20, y: 0}, hand: {x: 45, y: -5} };
    // Guard arm
    lArm = { elbow: {x: 5, y: 20}, hand: {x: 15, y: -15} };
    // Lunge stance
    torsoAngle = 10 * (Math.PI / 180);
    break;
    
  // ... other states
}
```

### Run Cycle Animation

Movement uses sine waves for smooth cycling:

```typescript
const runTime = frameCount * 0.5;  // Animation speed
const stride = 20;  // Step distance

// Left leg cycles with sine
lLeg = { 
  knee: { x: Math.sin(runTime) * stride, y: 20 },
  foot: { x: Math.sin(runTime) * stride * 1.5, y: 45 }
};

// Right leg is offset by π for alternation
rLeg = { 
  knee: { x: Math.sin(runTime + Math.PI) * stride, y: 20 },
  foot: { x: Math.sin(runTime + Math.PI) * stride * 1.5, y: 45 }
};
```

This creates the classic walking animation:
```
Frame 0:    Frame 5:    Frame 10:   Frame 15:
  ○           ○           ○           ○
  │           │           │           │
 /│\         \│/         /│\         \│/
 /│           │\         /│           │\
/  \           \       /  \           \
```

### Pose Examples

| State | Description |
|-------|-------------|
| IDLE | Slight breathing sway, guard stance |
| MOVE | Run cycle, arm swing opposite to legs |
| PUNCH | Punching arm extended, lunge forward |
| KICK | Kicking leg high, torso leaning back |
| BLOCK | Both arms raised, head tucked |
| JUMP | Legs tucked under body |
| CROUCH | Deep knee bend, lowered body |
| DEAD | Lying flat on ground |

---

## Visual Effects

### Attack Hitbox Glow

When a fighter's hitbox is active, we draw a glowing circle:

```typescript
if (fighter.hitbox) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';  // Semi-transparent white
  ctx.beginPath();
  ctx.arc(
    hitbox.x + hitbox.w / 2,  // Center X
    hitbox.y + hitbox.h / 2,  // Center Y
    20,                        // Radius
    0, Math.PI * 2            // Full circle
  );
  ctx.fill();
}
```

### Moon Glow Effect

Using Canvas shadowBlur for soft light:

```typescript
ctx.shadowBlur = 40;
ctx.shadowColor = '#e2e8f0';
// Draw moon at this point
ctx.shadowBlur = 0;  // Reset!
```

---

## HUD Elements

### Fighter Health/Energy Bars

Each fighter has overhead bars drawn directly on canvas:

```typescript
// Red background (empty health)
ctx.fillStyle = '#ef4444';
ctx.fillRect(fighter.x, fighter.y - 30, 50, 6);

// Green foreground (current health)
ctx.fillStyle = '#22c55e';
ctx.fillRect(fighter.x, fighter.y - 30, 50 * (health / 100), 6);

// Yellow energy bar (below health)
ctx.fillStyle = '#eab308';
ctx.fillRect(fighter.x, fighter.y - 22, 50 * (energy / 100), 3);
```

### Main HUD (Vue Component Overlay)

The main HUD (large health bars, timer, generation) is rendered as Vue components overlaid on the canvas:

```vue
<template>
  <div class="absolute top-4 left-4 right-4 z-10">
    <!-- P1 Health Bar -->
    <div class="w-32 h-4 bg-slate-800 rounded-sm">
      <div 
        class="h-full bg-red-500" 
        :style="{ width: `${player1Health}%` }"
      />
    </div>
    
    <!-- Timer -->
    <span class="text-yellow-400">
      {{ timeRemaining.toFixed(0) }}
    </span>
    
    <!-- P2 Health Bar -->
    <!-- ... -->
  </div>
</template>
```

This hybrid approach lets us use Vue transitions for smooth animations while keeping the canvas for fast game rendering.

---

## Code References

### Main Render Function
[GameCanvas.vue - onMounted()](../components/GameCanvas.vue)

### Stickman Drawing
[GameCanvas.vue - drawStickman()](../components/GameCanvas.vue)

### Background Rendering
[GameCanvas.vue - drawBackground()](../components/GameCanvas.vue)

### HUD Overlay
[index.vue - template](../pages/index.vue)

---

## Further Reading

- [Canvas API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Canvas Tutorial (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Advanced Stickman Animation](https://www.sitepoint.com/html5-canvas-animation/)

---

← Back to [Game Engine](./GAME_ENGINE.md) | Return to [README](../README.md) →
