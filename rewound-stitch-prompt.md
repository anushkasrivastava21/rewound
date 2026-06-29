# REWOUND — Complete Frontend Build Prompt

You are building a web application called **"Rewound"**. It is an interactive nostalgia experience that looks and feels like playing a VHS tape on an old CRT television. Users press play and experience seven interactive childhood memories — like drawing on a steamy window, popping bubble wrap, and blowing a dandelion. There is also a public library where users can browse community-submitted memories.

Read every single word of this prompt. Do not skip anything. Do not improvise. Do not add anything I have not described. Build exactly what is written here.

---

## TECH STACK — USE EXACTLY THESE

- **Framework:** Next.js 14 with the App Router (not Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS for layout and utilities. Use CSS custom properties (CSS variables) for the color tokens listed below. Put these variables in a global CSS file.
- **Animation:** Framer Motion for page transitions and UI animations
- **Canvas:** HTML5 Canvas API for the interactive memories (steamy window, dandelion, bubble wrap, etch-a-sketch)
- **SVG:** Native SVG with CSS transitions for cloud watching and shadow puppets
- **Audio:** Howler.js for sound effects
- **Font loading:** Use `next/font/google` to load Google Fonts
- **State management:** React useState and useContext. No Redux. No Zustand.
- **Deployment target:** Vercel

---

## COLOR TOKENS — USE EXACTLY THESE COLORS

Define these as CSS custom properties in `styles/globals.css` inside a `:root` selector:

```css
:root {
  --vhs-black: #1a1714;       /* The darkest color. Used for the TV bezel frame, deep backgrounds. */
  --vhs-dark: #2c2824;        /* Slightly lighter dark brown. Used for the transport bar, UI panels. */
  --static-gray: #6b6560;     /* Medium warm gray. Used for inactive buttons, the VHS timestamp text. */
  --tape-cream: #d4c8b0;      /* Warm off-white cream. Used for all text, labels, title cards. */
  --memory-warm: #e8a849;      /* Golden amber. The accent color. Used sparingly for highlights, glows, the REC dot. */
  --tracking-blue: #4a7fb5;   /* Muted blue. Used only in VHS tracking distortion effects during transitions. */
  --vhs-red: #c44040;         /* Muted red. Used for the REC indicator dot and the etch-a-sketch frame. */
  --library-shelf: #5c3d2e;   /* Warm dark wood brown. Used for the library shelf background. */
}
```

The overall feel is WARM. Think of a room lit by a single lamp at dusk. Nothing is pure white. Nothing is pure black. Everything has a warm brownish-amber cast.

---

## FONTS — USE EXACTLY THESE

Load these from Google Fonts using `next/font/google`:

1. **Caveat** (weight: 400, 700) — This is a handwriting font. Use it for: memory titles that appear inside the player, the tape labels, captions like "I see a bunny", the "press play to remember" subtitle, and the "be kind, rewind" end card.

2. **VT323** (weight: 400) — This is a pixelated retro monospace font. Use it for: the VHS timestamp counter in the top-left corner (like `REC 00:03:42`), the transport bar button labels, any technical/system text.

3. **Bungee Shade** (weight: 400) — This is a bold decorative display font. Use it ONLY for the word "Rewound" on the landing page title card. Nowhere else.

4. **DM Sans** (weight: 400, 500, 600) — This is a clean modern sans-serif. Use it for: the Library browsing UI, filter tags, the Memory Creator tool interface, any "app-like" UI that is not part of the VHS experience.

---

## GLOBAL VISUAL EFFECTS — THE VHS LAYER

These effects appear ON TOP of everything at all times (except the landing static screen). They are what make the whole app feel like a VHS tape playing on an old TV. Implement these as a fixed-position overlay component called `VHSOverlay.tsx` that sits above all content.

### Effect 1: Scan Lines
- Create a full-screen div with `position: fixed`, covering the entire viewport
- Set `pointer-events: none` so users can click through it
- Background: a repeating horizontal stripe pattern — every 2 pixels alternating between fully transparent and rgba(0, 0, 0, 0.05)
- This creates very faint horizontal lines across the entire screen like an old TV
- z-index: 9998 (above content, below cursor)

### Effect 2: Film Grain
- Another full-screen fixed div, also `pointer-events: none`
- Background: an animated noise texture. Create this by generating a small (100x100) canvas with random grayscale pixels, then tile it as a CSS background. Every 100ms, regenerate the noise to make it shimmer.
- Opacity: 0.03 (barely visible — you should have to look for it)
- z-index: 9997

### Effect 3: Vignette
- Another full-screen fixed div, `pointer-events: none`
- Background: a radial gradient — transparent in the center, fading to rgba(0, 0, 0, 0.4) at the edges
- This darkens the corners and edges of the screen like a CRT TV
- z-index: 9996

### Effect 4: Color Warmth
- On the root `<html>` or `<body>` element, apply a CSS filter: `sepia(0.08) saturate(1.1) brightness(0.98)`
- This gives everything a very subtle warm amber cast

ALL FOUR of these effects must be present simultaneously. They combine to create the VHS feel. Without them the app looks like a normal website. With them it looks like a VHS tape.

---

## SCREEN 1: THE LANDING PAGE (route: `/`)

This is the first thing users see. It simulates a VHS tape being inserted into a TV.

### Phase 1: Static (duration: 1.5 seconds, auto-advances)

- The entire screen is filled with TV static noise — random black and white pixels flickering rapidly
- Implementation: a full-screen canvas. Every frame (60fps), fill every pixel with a random grayscale value (0 to 255). This creates the "no signal" snow effect on old TVs.
- Background color behind the canvas: `var(--vhs-black)`
- No text. No buttons. No UI. Just static.
- A faint audio hum plays (if audio is enabled) — a low 60Hz buzz

### Phase 2: Tracking Distortion (duration: 0.8 seconds, auto-advances)

- The static is still playing, but now a horizontal band of distortion rolls from bottom to top of the screen
- The band is about 60px tall. It warps the static horizontally — pixels in the band are shifted 20-40px to the right and slightly color-shifted (add a blue/cyan tint using `var(--tracking-blue)`)
- The band moves upward at a steady speed, taking 0.8 seconds to travel from the bottom edge to the top edge
- This simulates the "tracking" adjustment on old VHS players

### Phase 3: Title Card (fades in over 0.5 seconds, stays until user acts)

- The static fades out (opacity 1 → 0 over 0.5 seconds)
- Behind it is a solid background of `var(--vhs-black)`
- In the center of the screen, the following appears by fading in (opacity 0 → 1 over 0.8 seconds):

**Line 1:** The word **"Rewound"** in Bungee Shade font, size 72px on desktop / 48px on mobile, color `var(--tape-cream)`. Centered horizontally. Positioned about 35% down from the top of the viewport.

**Line 2:** Below "Rewound", with 16px of spacing, the text **"press play to remember"** in Caveat font, size 24px, color `var(--static-gray)`. Centered horizontally. This text has a gentle opacity pulse animation — it fades between 0.5 and 1.0 opacity on a 2-second loop (ease-in-out). This makes it feel like it's breathing.

**Line 3:** Below the subtitle, with 48px of spacing, a play button. This is NOT a standard button. It looks like this:
- A triangle (play icon) made with CSS borders or an SVG, 40px wide, 48px tall, color `var(--tape-cream)`
- Below the triangle, the text **"PLAY"** in VT323 font, size 16px, color `var(--static-gray)`, with 8px spacing above it
- The entire play button area (triangle + text) is clickable
- On hover: the triangle color changes to `var(--memory-warm)` (the golden amber), transition 0.2s
- On click: navigates to `/player`

**Line 4:** Below the play button, with 32px of spacing, a second clickable area:
- The text **"📼 BROWSE THE LIBRARY"** in VT323 font, size 14px, color `var(--static-gray)`
- On hover: color changes to `var(--tape-cream)`, transition 0.2s
- On click: navigates to `/library`

- In the bottom-right corner of the screen, 24px from edges: the text **"REC ●"** in VT323 font, size 12px. The word "REC" is in `var(--static-gray)`. The dot "●" is in `var(--vhs-red)` and blinks on a 1-second interval (visible for 0.5s, hidden for 0.5s). This is just decorative — it mimics the VHS recording indicator.

---

## SCREEN 2: THE MEMORY PLAYER (route: `/player`)

This is the main experience. It plays the seven memories in sequence inside a CRT television frame.

### The CRT Bezel (the TV frame)

The entire player page is wrapped in a component that looks like the front of an old CRT television:

- The outer container fills the full viewport (100vw × 100vh), background: `var(--vhs-black)`
- Inside it, centered both horizontally and vertically, is the "TV screen" area
- The TV screen is a rounded rectangle: width is 90% of the viewport width (max 1200px), height is 80% of the viewport height. It has `border-radius: 16px` to simulate the curved glass of a CRT.
- Around the TV screen is a "bezel" — a border/frame that is 12px thick, color `var(--vhs-dark)`, with a subtle `box-shadow: inset 0 0 30px rgba(0,0,0,0.5)` to give depth
- The active memory content renders INSIDE the TV screen area, clipped by `overflow: hidden` and the border-radius

### Entry Transition

When the player page loads (navigating from the landing page):
1. Show 0.3 seconds of static (same as landing page static, but inside the CRT bezel only)
2. A tracking distortion band rolls up (same as landing, but faster — 0.4 seconds)
3. Static fades out, first memory fades in

### The VHS HUD (Heads-Up Display)

These elements appear overlaid on top of the memory content, inside the CRT bezel. They are always visible while a memory is playing.

**Top-left corner** (16px inset from the edges of the TV screen):
- Text: `REC ● 00:03:42` in VT323 font, size 14px
- "REC" is `var(--static-gray)`, the "●" is `var(--vhs-red)` and blinks (1s interval), the timestamp is `var(--tape-cream)`
- The timestamp is a real timer — it starts at `00:00:00` when the memory loads and counts up in real time (HH:MM:SS format)
- When the user switches to a new memory, the timer resets to `00:00:00`

**Top-right corner** (16px inset):
- The name of the current memory in Caveat font, size 18px, color `var(--tape-cream)` with 50% opacity
- Memory names are: "Steamy Window", "Bubble Wrap", "Cloud Watching", "Dandelion", "Paper Boats", "Shadow Puppets", "Etch-a-Sketch"

**Audio toggle** (top-right, below the memory name, 8px gap):
- A small speaker icon (🔇 when muted, 🔊 when unmuted), 20px, clickable
- Default state: muted (🔇)
- Click toggles audio on/off for ambient sounds and interaction sounds

### The Transport Bar (bottom of TV screen)

A horizontal bar at the bottom of the TV screen area (not the browser viewport — inside the CRT bezel).

- Height: 48px
- Background: `var(--vhs-dark)` with 80% opacity (slightly transparent so you can see the memory behind it)
- Backdrop filter: `blur(8px)` for a frosted glass effect
- Border-radius on top-left and top-right: 8px
- The bar contains three buttons, centered horizontally with 32px spacing between them:

**Button 1: REWIND (◀◀)**
- Text: `◀◀` in VT323 font, size 20px, color `var(--static-gray)`
- Below it: "RW" in VT323, size 10px, color `var(--static-gray)` at 60% opacity
- On hover: color changes to `var(--tape-cream)`
- On click: go to the PREVIOUS memory in the sequence (1→7 wraps, so pressing RW on memory 1 goes to memory 7)
- On click: trigger the VHS transition animation (described below)
- While the first memory is active, this button still works (wraps to memory 7)

**Button 2: PAUSE (▮▮) / PLAY (▶)**
- Toggles between pause and play icons
- Default state: PLAY (▶) — meaning the memory is active/playing
- When paused: the memory freezes (canvas animations stop, timers pause). The VHS HUD shows `▮▮ PAUSED` blinking in the center of the screen in VT323, 24px, `var(--tape-cream)` at 70% opacity
- On hover: color changes to `var(--tape-cream)`

**Button 3: FAST FORWARD (▶▶)**
- Text: `▶▶` in VT323 font, size 20px, color `var(--static-gray)`
- Below it: "FF" in VT323, size 10px, color `var(--static-gray)` at 60% opacity
- On hover: color changes to `var(--tape-cream)`
- On click: go to the NEXT memory in the sequence
- When on memory 7 (the last one), pressing FF shows the End Card (described below)

**Progress dots** — below the three buttons, with 8px spacing:
- 7 small circles (6px diameter each) in a horizontal row, 8px apart
- The dot corresponding to the current memory is filled with `var(--memory-warm)`
- All other dots are outlined with `var(--static-gray)` (1px border, transparent fill)
- Dots are clickable — clicking dot N jumps directly to memory N (with VHS transition)

### VHS Transition Animation (between memories)

This animation plays every time the user switches from one memory to another (via RW, FF, or dot click). Duration: 0.8 seconds total.

1. **Phase 1 (0 – 0.3s): Scramble.** The current memory's content gets distorted:
   - Apply a CSS animation that rapidly shifts the content horizontally by random amounts (-30px to +30px) every 50ms
   - Simultaneously, add 3-4 horizontal bands of color distortion — thin bars (8-12px tall) at random vertical positions that are color-shifted toward `var(--tracking-blue)` and horizontally offset
   - Reduce saturation of the entire image
   
2. **Phase 2 (0.3 – 0.5s): Static flash.** Brief flash of TV static (same noise as landing page) for 0.2 seconds

3. **Phase 3 (0.5 – 0.8s): New memory resolves.** The new memory fades in from behind the static. A single tracking distortion band rolls from bottom to top quickly. The image stabilizes.

### End Card

When the user presses FF on memory 7 (the last memory):

Instead of transitioning to a new memory, show a card inside the CRT bezel:
- Background: `var(--vhs-black)`
- Center text: **"be kind, rewind"** in Caveat font, size 36px, color `var(--tape-cream)`, fade-in over 1 second
- Below it, after 2 seconds, two lines fade in:
  - **"▶ play again"** in VT323, size 16px, color `var(--static-gray)` — clickable, goes back to memory 1
  - **"✎ record your own"** in VT323, size 16px, color `var(--static-gray)` — clickable, goes to `/create`
  - **"📼 browse the library"** in VT323, size 16px, color `var(--static-gray)` — clickable, goes to `/library`
- Each link: on hover, color changes to `var(--memory-warm)`

### Keyboard Shortcuts

- Left arrow key: same as RW button (previous memory)
- Right arrow key: same as FF button (next memory)
- Spacebar: same as PLAY/PAUSE button

---

## THE SEVEN MEMORIES — INTERACTIVE CONTENT

Each memory is a React component that renders INSIDE the CRT bezel area. Each memory fills the entire TV screen area. Each memory has its own background, interaction, and mood. Below is the EXACT specification for each.

### MEMORY 1: STEAMY WINDOW (`SteamyWindow.tsx`)

**What it looks like:**
- The entire TV screen area shows a view through a foggy car/house window on a rainy evening
- LAYER 1 (background, behind the fog): A scene painted with CSS gradients. No images. Build it like this:
  - Sky: a vertical gradient from `#1a1a3e` (deep navy) at the top to `#2d2245` (dark purple) at the bottom 40%
  - Street lights: 4-5 circles of soft warm glow scattered across the scene. Each is a radial gradient — `var(--memory-warm)` at center fading to transparent. Size: 60-100px diameter. These simulate out-of-focus bokeh lights seen through wet glass. Place them at varying heights in the middle 60% of the screen.
  - Ground: the bottom 15% is a gradient from `#1a1a2e` to `#0d0d1a` (dark ground)
  - Apply `filter: blur(12px)` to this entire background layer to simulate looking through glass
- LAYER 2 (fog, on top of background): A full-size HTML5 canvas element
  - Initially, this canvas is filled with a semi-transparent white/gray fog: `rgba(200, 195, 185, 0.85)` (warm gray, not pure white)
  - The fog is NOT perfectly uniform. To make it look natural: when first drawing the fog, vary the opacity slightly using Perlin noise or random soft circles — edges and corners should be slightly MORE opaque (0.9), center slightly LESS opaque (0.75). This simulates how steam condenses more on colder parts of glass (edges near the frame).
- LAYER 3 (rain droplets, on top of fog): 15-20 small water droplets that slowly slide down the screen
  - Each droplet is a small elongated oval (4px wide, 8px tall), slightly transparent, with a tiny bright highlight dot at the top
  - They start at random horizontal positions near the top of the screen
  - They slide downward at varying speeds (between 0.3 and 1.0 pixels per frame), with very slight horizontal wobble (±0.5px random per frame)
  - When a droplet reaches the bottom, remove it and spawn a new one at the top
  - These droplets are rendered on a separate canvas or as absolutely positioned divs, ON TOP of the fog canvas

**How the interaction works:**
- When the user presses and holds the mouse button (or touches on mobile) and drags across the fog canvas, the fog is "wiped away" under their finger/cursor
- Implementation: On each mousemove/touchmove event while the button is pressed, draw a circle at the cursor position on the fog canvas using `globalCompositeOperation = 'destination-out'`. The circle should have a SOFT EDGE — use a radial gradient from full opacity at center to zero opacity at edge. Radius: 25px.
- This reveals the background scene behind the fog wherever the user draws
- IMPORTANT: The wiped areas should SLOWLY RE-FOG over time. Every 100ms, increase the opacity of all partially-cleared pixels by 0.005. This means a fully wiped area takes about 17 seconds to fully re-fog. This simulates steam re-condensing on the glass.
- The re-fogging should happen continuously, even while the user is drawing (they're fighting the fog)
- When drawing, if audio is enabled, play a soft high-pitched squeaky sound (a short 200ms audio clip that plays intermittently, not on every single pixel — play it once every 150ms of continuous drawing)

**What it feels like:** Quiet. Rainy. Introspective. You're a kid in the backseat of a car at night, drawing shapes on the fogged-up window.

---

### MEMORY 2: BUBBLE WRAP (`BubbleWrap.tsx`)

**What it looks like:**
- The entire TV screen area is covered with a grid of bubbles, like a sheet of bubble wrap
- Background (visible behind/between bubbles): `#c4b69c` (warm tan, like a cardboard box surface)
- The grid: calculate how many bubbles fit based on screen size. Each bubble is 48px × 48px with 4px gap between them. Center the grid so there is equal padding on all sides.
- Each individual bubble looks like this:
  - A circle, 44px diameter
  - Background: a radial gradient — `rgba(255, 255, 255, 0.4)` at center, `rgba(255, 255, 255, 0.15)` at edge. This gives it a translucent plastic look.
  - Border: 1px solid `rgba(255, 255, 255, 0.3)`
  - A specular highlight: a small white ellipse (12px × 8px) positioned in the top-left quadrant of the bubble at about 30% from top, 30% from left, rotated -30 degrees, opacity 0.6. This is the light reflection.
  - `box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)` — this gives each bubble a slight 3D pop
  - Add a SLIGHT random size variation: each bubble's diameter should be randomly between 42px and 46px (decided once when the grid is created, not changing). This makes the grid look organic, not machine-perfect.
  - Cursor: pointer (on hover)

**How the interaction works:**
- Each bubble has a state: `unpopped` or `popped`
- **Tap/click a bubble:** It pops.
  - Animation (CSS transition, 150ms ease-out):
    - Scale shrinks from 1.0 to 0.85
    - The radial gradient flattens (goes from raised/3D to flat — reduce the highlight opacity to 0, reduce the gradient contrast)
    - The box-shadow changes to `inset 0 1px 3px rgba(0,0,0,0.15)` (looks pressed in, concave)
    - Background becomes slightly more opaque: `rgba(200, 195, 185, 0.3)`
  - Sound: Play a short "pop" sound effect (a crisp, satisfying, high-pitched pop, ~80ms duration). IMPORTANT: Each pop should have a slightly different pitch — randomly shift the playback rate between 0.9 and 1.1 on each pop. This prevents it from sounding robotic.
  - The bubble stays popped permanently. It does NOT re-inflate.
- **Click and drag across multiple bubbles:** As the cursor moves over unpopped bubbles while the mouse button is held down, each bubble pops in rapid succession. This is the "I can't stop popping" moment. Each one plays the pop sound with its own random pitch.
- **Counter:** In the bottom-right corner of the TV screen area, 16px inset, show text in VT323 font, size 12px, color `var(--tape-cream)` at 40% opacity: `"popped: 47 / 120"` (where 47 is the number popped and 120 is the total). Update in real-time as bubbles are popped.
- When ALL bubbles are popped, wait 2 seconds, then show a brief text in the center: **"all gone."** in Caveat font, 24px, `var(--tape-cream)`, fade in over 0.5s, hold for 2s, then fade out. Then regenerate a fresh sheet of bubble wrap (reset all bubbles to unpopped with new random size variations).

**What it feels like:** Addictive. Fidgety. Satisfying. The kind of thing you cannot stop doing once you start.

---

### MEMORY 3: CLOUD WATCHING (`CloudWatching.tsx`)

**What it looks like:**
- Full-screen sky. The background is a vertical gradient:
  - Top: `#5b8cc7` (medium blue)
  - Bottom: `#c7dce8` (very light blue-white, almost white)
  - This simulates lying on your back and looking straight up at a clear sky
- At the very bottom of the screen (bottom 8%): a grass silhouette. This is just a series of small green triangles/spikes along the bottom edge, color `#4a7a3d` with slight randomization in height (15-30px tall). It frames the sky and tells you "you're lying down looking up."
- 5 to 7 clouds floating in the sky:
  - Each cloud is an SVG shape — a blobby, organic, irregular rounded shape. NOT circles stacked together. Create each cloud as an SVG `<path>` with smooth curves. Each cloud should look different.
  - Color: white (`#ffffff`) with 85% opacity
  - Size: varying between 120px and 250px wide
  - Slight drop shadow: `filter: drop-shadow(0 4px 8px rgba(0,0,0,0.05))` — very faint
  - The clouds drift slowly from LEFT to RIGHT. Different clouds move at different speeds (the visual concept is parallax — "closer" clouds are larger and move faster, "farther" clouds are smaller and move slower):
    - Far clouds (small, ~120px): speed 0.1px per frame, opacity 0.7
    - Near clouds (large, ~250px): speed 0.3px per frame, opacity 0.9
  - When a cloud drifts fully off the right edge of the screen, it reappears on the left edge after a 3-5 second delay, at a new random vertical position

**How the interaction works:**
- **Tap/click a cloud:** The cloud smoothly morphs into a recognizable animal silhouette over 2 seconds.
  - The morph is a smooth SVG path transition — the cloud's `<path>` d attribute interpolates from the blobby cloud shape to the animal shape using a path animation library or manual interpolation (transition each control point)
  - Available animal shapes (cycle through them on each tap): dog, bunny, whale, bird, elephant, cat, fish, dragon
  - After morphing into the animal shape, a handwritten label fades in (Caveat font, 20px, `var(--vhs-dark)`) positioned below the cloud: *"I see a bunny"* (or whichever animal)
  - The label and animal shape hold for 4 seconds
  - Then the cloud slowly morphs BACK to its original blobby shape over 2 seconds, and the label fades out
  - While morphed, the cloud continues drifting at its normal speed
- Tapping the same cloud again (after it has returned to cloud form) shows the NEXT animal in the cycle
- Only one cloud can be morphed at a time — tapping a second cloud while one is already morphed does nothing until the first one finishes its cycle

**What it feels like:** Dreamy. Slow. Peaceful. You're lying in the grass on a summer day with nowhere to be.

---

### MEMORY 4: DANDELION (`Dandelion.tsx`) — ⭐ THE TECHNICAL SHOWPIECE

**What it looks like:**
- Background: a warm golden-hour field scene, built with CSS gradients:
  - Sky: gradient from `#e8a849` (warm amber) at top to `#f0c878` (light gold) at 40%
  - Sun glow: a large radial gradient on the right side — `rgba(255, 220, 150, 0.6)` at center fading to transparent, about 300px diameter, positioned at 80% horizontal, 30% vertical. This is the setting sun.
  - Field: the bottom 35% is a gradient from `#5a8a3a` (green) at top to `#3d6b28` (darker green) at bottom, with a subtle wavy top edge (use clip-path or SVG) to simulate grass line against the sky
  - A few thin vertical lines in the grass area with tiny circles on top = distant dandelions/flowers in the field (decorative only, 4-5 of them, very subtle, `rgba(255,255,255,0.3)`)
- The dandelion: centered horizontally, positioned so the stem starts at about 65% from the top of the screen
  - Stem: a single slightly curved vertical line, 3px wide, color `#5a7a44` (muted green), height about 35% of the screen
  - Seed head: at the top of the stem, a circle of seeds arranged radially
  - Each seed consists of:
    - A tiny thin line (the seed shaft) radiating outward from the center, length 20-28px (random per seed)
    - At the end of the line, a tiny tuft — 3-4 very short thin lines fanning out like a tiny asterisk (the pappus/feathery part). Color: white with 90% opacity.
  - Total seeds: 50-60, arranged in a roughly spherical/circular pattern around the center point. They should look like a dense puffball.
  - The entire seed head very gently sways — a slow CSS animation rotating ±2 degrees on a 3-second loop

**How the interaction works — THIS IS THE MOST IMPORTANT INTERACTION IN THE APP:**
- **Blow mechanic:** The user clicks (or touches) somewhere on the screen and drags outward. This simulates "blowing" on the dandelion.
  - Calculate the blow direction: from the click/touch START position toward the current drag position
  - Calculate the blow strength: based on the SPEED of the drag (pixels moved per frame). Faster drag = stronger blow.
  - Seeds that are on the SIDE of the dandelion head closest to the blow origin are affected first. Seeds further away from the blow origin need a stronger blow to detach.
  - Detached seeds: When a seed detaches, it becomes an independent particle with the following physics:
    - Initial velocity: in the blow direction, proportional to blow strength, with ±15 degree random angle variation per seed
    - Gravity: a constant downward acceleration of 0.02 pixels/frame² (very gentle — seeds are light)
    - Air resistance (drag): decelerates the seed proportional to its velocity squared, coefficient 0.01. This means seeds start fast and slow down organically.
    - Wind: add a small random horizontal force that changes slowly over time (use a simple sine wave: `wind_x = sin(time * 0.001 + seed_id) * 0.05`). This makes seeds drift lazily left and right.
    - Vertical wobble: add a small sinusoidal vertical oscillation: `wobble_y = sin(time * 0.003 + seed_id * 2) * 0.3`. This makes seeds bob up and down slightly as they float.
    - Rotation: each detached seed rotates slowly (1-3 degrees per frame, random direction per seed). This makes the tufts tumble.
    - Fade out: when a seed's position is more than 200px from the screen edge OR when it has been floating for more than 8 seconds, start reducing its opacity by 0.02 per frame until invisible, then remove it.
  - The user can blow multiple times. Each blow detaches more seeds from whatever remains on the head.
  - As seeds detach, the dandelion head becomes progressively barer — the remaining seeds should still be positioned radially around the center, with visible gaps where detached seeds used to be.
- **When ALL seeds are gone:**
  - Just the bare stem and empty receptacle (a small circle at the top of the stem) remain
  - Wait 3 seconds of quiet
  - Then animate a NEW dandelion growing: the stem slowly grows upward from the grass (over 2 seconds), and seeds pop in one by one around the head (over 2 seconds), and the cycle can begin again
  - During regrowth, show faint text in center: *"make a wish"* in Caveat, 20px, `var(--tape-cream)` at 40% opacity, fade in and out over the regrowth period
- **Sound:** On each blow gesture (drag), play a soft breathy whoosh sound (500ms, soft, airy). When seeds detach, very faint soft tinkling sounds (optional).

**Implementation notes:**
- Use an HTML5 Canvas for the seeds (both attached and floating). This is necessary for performance with 50-60 particles.
- Use requestAnimationFrame for the physics loop
- The background (sky, field, sun) should be CSS/HTML behind the canvas (the canvas should have a transparent background)
- Each seed stores: `{ attached: boolean, angle: number, distance: number, x: number, y: number, vx: number, vy: number, rotation: number, opacity: number }`

**What it feels like:** Magic. Pure magic. The moment the seeds lift off should feel like the most beautiful thing in the app.

---

### MEMORY 5: PAPER BOATS (`PaperBoats.tsx`)

**What it looks like:**
- A top-down view of a rain gutter stream — like looking straight down at the edge of a curb during rain
- The stream flows from TOP to BOTTOM of the screen
- Left side (0-15% of screen width): Pavement/sidewalk. Color: `#7a7570` (gray), with a subtle texture (very faint noise). A painted curb line along the right edge of the pavement: a 3px line in `#b0a890` (faded yellow).
- Right side (85-100% of screen width): More pavement, same as left side, with a curb line on the left edge.
- Center (15-85% of screen width): The water stream.
  - Base color: `#5a7a9a` (muted blue-gray)
  - Animated flow lines: thin, semi-transparent lighter blue streaks (`rgba(140, 180, 210, 0.3)`) that move from top to bottom at a steady speed (2-3 pixels per frame). These are ~2px wide, 40-80px long, spaced randomly. They create the impression of flowing water.
  - Surface ripples: small concentric circles that appear randomly on the water surface every 0.5-1 seconds at random positions. Each ripple expands from 0 to 30px radius over 1 second while fading from 0.3 to 0 opacity. These are rain drops hitting the water.
- Small debris floating in the stream: 3-4 small leaf shapes (simple green ovals, 8-12px long, slightly rotated) that drift downward with the water flow, bobbing slightly left and right. When they exit the bottom, they reappear at the top at a new random horizontal position.
- THE PAPER BOAT:
  - An origami boat shape. Draw this as an SVG: a simple side-view of a paper boat — a triangular sail/fold on top, a flat bottom hull with pointed bow and stern. Size: about 40px wide, 30px tall. Color: `#f0ebe0` (slightly off-white, like notebook paper). Thin fold lines drawn on the boat in `rgba(0,0,0,0.1)`.
  - The boat floats on the water, roughly centered horizontally. It bobs up and down very slightly (±2px, sine wave, 2-second period). It also sways rotationally (±5 degrees, sine wave, 3-second period). This gives it a "floating" feel.
  - The boat drifts slowly downward with the water flow, but MUCH slower than the water (0.3px per frame). This is because it has drag.

**How the interaction works:**
- **Tap/click on the water near the boat:** Creates a ripple at the tap point (same expanding circle animation as the rain ripples, but larger — expands to 60px radius). This ripple exerts a PUSH FORCE on the boat:
  - Direction: from the tap point toward the boat
  - Strength: inversely proportional to the distance between the tap and the boat. Tapping very close to the boat pushes it a lot. Tapping far away barely moves it.
  - The boat accelerates in the push direction, then decelerates due to water drag (deceleration = 0.02 per frame applied against velocity)
- **Tap directly ON the boat:** Creates a splash (the ripple) and pushes the boat slightly downward and to a random side
- **The boat is constrained:** It cannot leave the water area (15-85% of screen width). If pushed toward the pavement, it bumps softly against the curb and stops (velocity zeroed on that axis).
- **Obstacles:** Every 5-8 seconds, a twig floats into view from the top — a small brown line, 30-50px long, 3px wide, slightly rotated, drifting downward. If the boat collides with a twig, it gets stuck (stops moving) until the user taps near it to push it free with a ripple.
- **Looping:** When the boat drifts off the bottom of the screen, a new boat appears at the top center after 1 second, floating back in.
- **Sound:** Gentle rain ambience (continuous, soft). Each tap on the water makes a soft "plop" sound (a short, low-pitched water drop sound, ~150ms).

**What it feels like:** Calm. Meditative. You're a kid crouching by the curb in the rain, guiding your boat downstream.

---

### MEMORY 6: SHADOW PUPPETS (`ShadowPuppets.tsx`)

**What it looks like:**
- A warmly lit bedroom wall at night
- Background: the wall itself. Color: `#e8ddd0` (warm off-white, like painted plaster). Apply a very subtle noise texture to give it a wall-like feel (same technique as film grain but at 2% opacity, static/non-animated, warmer tones).
- Lighting: A gradient overlay that simulates a lamp shining from the bottom center of the screen:
  - Radial gradient centered at bottom-center (50% horizontal, 100% vertical): `rgba(255, 220, 150, 0.25)` at center, fading to `rgba(0, 0, 0, 0.3)` at the edges. This makes the bottom-center of the wall warm and bright, and the top/corners dimmer.
- No furniture, no objects. Just the wall and the light. Keep it simple.

**How the interaction works:**
- **The shadow follows the cursor:** A dark shadow shape is displayed on the wall, positioned at the cursor's location.
  - The shadow is an SVG silhouette, filled with `rgba(0, 0, 0, 0.7)` (not pure black — it's a shadow)
  - Apply `filter: blur(3px)` to the shadow to make it look soft/diffused (real shadows aren't sharp)
  - The shadow's SIZE changes based on the cursor's vertical position on the screen:
    - Cursor near the BOTTOM of the screen (near the "light source"): shadow is LARGE (scale 2.0-2.5x). Shadows are bigger when the object (your hand) is closer to the light source.
    - Cursor near the TOP of the screen (far from light): shadow is SMALLER (scale 0.8-1.0x)
    - Scale interpolates linearly between these extremes based on Y position
  - The shadow's BLUR also changes: more blur when cursor is near the bottom (larger, more diffused shadow), less blur near the top (sharper shadow). Range: 2px to 8px.
- **Shape recognition zones:** The screen is divided into invisible zones. When the cursor enters a zone, the shadow morphs (over 0.5 seconds, smooth SVG path transition) into an animal shape:
  - Center of screen: DOG silhouette (side profile — head with ear, snout, body)
  - Top-left quadrant: BIRD silhouette (spread wings, in flight)
  - Top-right quadrant: BUNNY silhouette (long ears upright, sitting)
  - Bottom-left quadrant: ELEPHANT silhouette (trunk raised, big ears)
  - Bottom-right quadrant: ALLIGATOR silhouette (long snout, bumpy back, open jaw)
  - The "default" shape (when in no specific zone, or during transition): a hand silhouette (open palm with 5 fingers)
- **Click to animate the puppet:**
  - Dog: the jaw part of the SVG opens and closes (rotate the lower jaw path by 15 degrees down, then back up, over 0.3 seconds). If audio is on, play a soft "woof" sound.
  - Bird: the wings flap — rotate each wing path up 20 degrees then down, over 0.4 seconds. Repeat 3 times.
  - Bunny: the ears wiggle — rotate each ear path outward 10 degrees then back, alternating, 3 times.
  - Elephant: the trunk curls — animate the trunk path from straight to curled upward, over 0.5 seconds.
  - Alligator: the jaw snaps — open wide (30 degrees) then shut quickly, over 0.2 seconds. Repeat twice.
- **Label:** When a shape is recognized (cursor enters a zone), show a handwritten label (Caveat, 20px, `var(--vhs-dark)`) near the shadow: *"a dog!"*, *"a bunny!"*, etc. Fade in over 0.3 seconds. Fade out when the cursor leaves the zone.

**What it feels like:** Playful. Imaginative. You're a kid making shadows on your bedroom wall with a flashlight.

---

### MEMORY 7: ETCH-A-SKETCH (`EtchASketch.tsx`)

**What it looks like:**
- Centered in the TV screen area is an Etch-a-Sketch toy. It does NOT fill the whole screen — it's a toy ON a surface.
- Behind the toy: a simple carpet/floor background — `#8b7b6b` (warm medium brown) with a very subtle woven texture pattern (optional, can just be a solid color)
- The Etch-a-Sketch itself:
  - Outer frame: a rounded rectangle, about 70% of the TV screen width and 75% of the TV screen height, centered. `border-radius: 16px`. Background: `var(--vhs-red)` (#c44040 — classic red). `box-shadow: 4px 4px 12px rgba(0,0,0,0.3)` for depth.
  - Top label area: at the top of the red frame, centered, a decorative strip:
    - Text: **"Rewound"** in a bold sans-serif (DM Sans 600 weight), size 20px, color `var(--tape-cream)`, `letter-spacing: 4px`, uppercase
    - Below it, a thin decorative line, 1px, `var(--tape-cream)` at 30% opacity, width 60% of the frame
  - Drawing screen: inside the red frame, with 20px padding on all sides from the frame edge. This is a rectangle with:
    - Background: `#b8b4a4` (silver-gray-green, the classic Etch-a-Sketch screen color)
    - `border-radius: 4px`
    - `box-shadow: inset 0 2px 8px rgba(0,0,0,0.2)` (pressed-in look)
    - This is the area where drawing happens — an HTML5 Canvas element sized to fit exactly this rectangle
  - Two dials at the bottom of the red frame:
    - Positioned at the bottom of the frame, one at ~25% horizontal, one at ~75% horizontal
    - Each dial is a circle, 44px diameter
    - Background: white (`#f0ebe0`)
    - Border: 2px solid `rgba(0,0,0,0.1)`
    - `box-shadow: 0 2px 4px rgba(0,0,0,0.2)` (raised look)
    - A small indicator line from the center of the dial to its top edge (4px long, 2px wide, `var(--static-gray)`), showing the dial's current rotation position
    - The dials visually rotate as the drawing cursor moves (left dial rotates when moving horizontally, right dial rotates when moving vertically) — this is purely cosmetic. Calculate rotation: horizontal_distance_traveled * 2 degrees for the left dial, vertical_distance_traveled * 2 degrees for the right dial.
  - Bottom of frame, centered below the screen and between the dials: small text **"magic screen"** in DM Sans, 10px, `var(--tape-cream)` at 50% opacity, italic

**How the interaction works:**
- **Drawing with keyboard (desktop):**
  - Arrow keys or WASD move a drawing cursor on the canvas
  - The cursor moves 2px per keypress (or 2px per frame if key is held down)
  - Movement is AXIS-LOCKED: pressing Left/Right moves only horizontally, pressing Up/Down moves only vertically. You cannot move diagonally. This is how a real Etch-a-Sketch works.
  - A line is drawn from the previous cursor position to the new position on every move. The line is 2px wide, color `#4a4a4a` (dark gray — the aluminum powder being displaced).
  - The line is ALWAYS connected. There is no way to "lift the pen." Every movement draws.
  - The cursor starts at the center of the drawing screen.
  - Show a tiny dot at the current cursor position (3px circle, `var(--vhs-red)`, pulsing opacity 0.5-1.0 on a 1-second loop) so the user knows where they are.

- **Drawing with mouse/touch (alternative):**
  - Click/touch and drag on the drawing screen to draw
  - Same axis-lock rule: determine whether the drag is MORE horizontal or MORE vertical (based on dx vs dy of the initial drag direction), and lock to that axis until the user releases and starts a new drag
  - Line drawn continuously along the drag path on the locked axis

- **Shake to erase:**
  - A small button in the bottom-right corner of the red frame (outside the drawing screen): text **"shake"** in VT323, 12px, `var(--tape-cream)`. On hover: color changes to `var(--memory-warm)`.
  - On click:
    1. The entire Etch-a-Sketch frame shakes: apply a CSS animation that rapidly translates it by random ±3px on both axes, 8 times over 0.8 seconds (ease-out)
    2. Simultaneously, the canvas drawing fades out: reduce the opacity of all drawn lines over 1.2 seconds (clear the canvas with gradually increasing globalAlpha of the background color)
    3. At the end, the canvas is fully cleared — fresh silver-gray screen
    4. Sound: a rattling/shaking sound (like beads in a box), 1 second duration
  - On mobile: if the device has an accelerometer, also trigger the shake-to-erase when the device is physically shaken (detect acceleration > threshold on any axis for 3+ consecutive readings)

**What it feels like:** Creative. Free. Meditative in a different way. You're a kid on the living room floor, making art with constraints. The constraint (axis-locked, no pen lift) is what makes it special.

---

## SCREEN 3: THE LIBRARY (route: `/library`)

This is the public gallery of community-contributed memories. For the hackathon, pre-seed it with 8-12 example memories.

### Visual Design

- Background: `var(--vhs-black)` — dark, like a dimly lit room
- The main visual element is a SHELF — like a wooden bookshelf, but for VHS tapes

**The Shelf:**
- A horizontal strip across the screen, at about 40% vertical position
- The shelf is drawn as a simple rectangle: 100% width, 8px tall, color `var(--library-shelf)` (#5c3d2e)
- Below the shelf surface, a small shadow: `box-shadow: 0 4px 12px rgba(0,0,0,0.5)`
- Standing ON the shelf are VHS tape spines:
  - Each tape is a vertical rectangle: 40px wide, 140px tall
  - They stand upright on the shelf, side by side, with 8px spacing between them
  - Each tape has a slightly different background color — not fully random, but from a curated set:
    - `#2c4a6b` (navy), `#6b3a3a` (burgundy), `#3a6b4a` (forest green), `#6b5a2c` (olive brown), `#5a3a6b` (purple), `#4a6b6b` (teal), `#6b6b3a` (khaki), `#3a3a3a` (charcoal)
  - On each tape spine, rotated 90 degrees (reading bottom to top, like real VHS spines):
    - The memory title in Caveat font, size 12px, color `var(--tape-cream)`
    - Below the title: a small region/culture tag in VT323, size 8px, color `var(--static-gray)` — like "India", "Japan", "Global", etc.
  - On hover over a tape: the tape slides UP by 20px (translateY: -20px, transition 0.2s). A tooltip/popover appears above it showing:
    - Memory title (Caveat, 16px)
    - Creator name (DM Sans, 12px, `var(--static-gray)`)
    - Play count ("played 2,847 times" in VT323, 11px, `var(--static-gray)`)
    - Tags (small colored pills/badges: "rainy day", "India", "90s kid")
  - On click on a tape: trigger the VHS transition animation (same scramble → static → resolve as the player), then navigate to that memory's interactive experience
  - The shelf scrolls horizontally if there are more tapes than fit on screen. Use a horizontal scroll container with `overflow-x: auto` and hide the scrollbar (use `-webkit-scrollbar` CSS to hide). Left and right arrow buttons (‹ ›) appear at the edges when there are more tapes to see.

**Above the shelf:**
- Centered, in Caveat font, size 32px, color `var(--tape-cream)`: **"The Library"**
- Below it: a subtitle in VT323, 14px, `var(--static-gray)`: *"other people's childhoods"*
- Below the subtitle (16px gap): a row of filter pills. These are small, horizontally scrollable buttons:
  - Each filter is a rounded pill: `border-radius: 999px`, padding 6px 14px, border 1px solid `var(--static-gray)`, color `var(--static-gray)`, background transparent
  - On click, the pill becomes active: background `var(--memory-warm)`, color `var(--vhs-black)`, border-color `var(--memory-warm)`
  - Filter categories and their options (each is a pill):
    - "All" (default active)
    - Region: "India", "Japan", "Brazil", "Global", "Nigeria", "UK"
    - Mood: "Calm", "Playful", "Magical", "Cozy"
    - Era: "90s", "2000s", "Timeless"
  - When a filter is active, only tapes matching that tag are shown on the shelf (others animate out with opacity → 0 and width → 0, 0.3s transition)
  - "All" shows every tape

**Below the shelf:**
- A section with the heading **"someone else's childhood"** in Caveat, 20px, `var(--tape-cream)` at 60% opacity
- A single large button below it: **"▶ RANDOM TAPE"** in VT323, 16px, `var(--tape-cream)`, border 1px solid `var(--static-gray)`, padding 10px 24px, `border-radius: 8px`
- On hover: border and text color change to `var(--memory-warm)`
- On click: picks a random tape from the library and loads it with the VHS transition

**Navigation:**
- Top-left: **"← back"** in VT323, 14px, color `var(--static-gray)`, clickable, navigates to `/` (landing page)
- Top-right: **"✎ record a memory"** in VT323, 14px, color `var(--static-gray)`, clickable, navigates to `/create`
- Both change to `var(--tape-cream)` on hover

### Pre-seeded Library Content

For the hackathon demo, pre-create these example tapes (they don't all need to be fully interactive — some can be concept cards that just show a title screen when opened):

1. "Drawing Rangoli" — tagged: India, Timeless, Calm — creator: "Priya from Mumbai" — played: 3,241 times
2. "Catching Fireflies" — tagged: Global, Magical, 90s — creator: "Marcus from Ohio" — played: 5,102 times
3. "Rain on a Tin Roof" — tagged: India, Monsoon, Cozy — creator: "Arun from Kerala" — played: 2,890 times
4. "Folding Paper Cranes" — tagged: Japan, Calm, Timeless — creator: "Yuki from Kyoto" — played: 4,567 times
5. "Sidewalk Chalk" — tagged: Global, Playful, 2000s — creator: "Emma from London" — played: 3,890 times
6. "Spinning a Top" — tagged: India, Playful, 90s — creator: "Rohan from Delhi" — played: 2,134 times
7. "Ice Cream Truck Song" — tagged: Global, Magical, 90s — creator: "Daniela from São Paulo" — played: 6,230 times
8. "Mud Pies" — tagged: Global, Playful, Timeless — creator: "Amara from Lagos" — played: 1,987 times

Store these in a simple JSON array in a file (`lib/library-data.ts`). No database needed for the hackathon demo.

---

## SCREEN 4: MEMORY CREATOR (route: `/create`)

A simplified builder tool for creating a new interactive memory. For the hackathon, this is a WORKING PROTOTYPE — it doesn't need to save to a database, but it needs to demonstrate the concept of "anyone can create."

### Layout

- Background: `var(--vhs-black)`
- Top bar: **"← back to library"** (left, VT323, 14px, clickable → `/library`) and **"✎ record a memory"** (center, Caveat, 24px, `var(--tape-cream)`)
- Below the top bar: a stepped wizard/form. 5 steps, shown one at a time. Each step fills the main content area.
- At the bottom: a step indicator (5 dots like the memory player's progress dots) and "← Previous" / "Next →" buttons (VT323, 14px)

### Step 1: Set the Scene

- Title: **"what does it feel like?"** (Caveat, 22px, `var(--tape-cream)`)
- 6 clickable background mood cards in a 3×2 grid (2×3 on mobile):
  - Each card is 160px × 120px (responsive), `border-radius: 8px`, shows a preview gradient and a label
  - Card options:
    1. "Rainy Evening" — gradient: dark blue to purple, with small bokeh dots
    2. "Golden Field" — gradient: amber to gold to green (the dandelion background)
    3. "Bedroom at Night" — gradient: warm dark brown to amber glow from bottom
    4. "Sunny Day" — gradient: bright blue to light blue-white (the cloud background)
    5. "Classroom" — solid: `#e8e0d0` warm white (like a whiteboard/desk)
    6. "Backyard" — gradient: light blue sky to green grass
  - Selected card: gets a 2px border in `var(--memory-warm)` and a small checkmark icon in the top-right corner
  - Only one can be selected at a time

### Step 2: Choose Your Interaction

- Title: **"what do you do?"** (Caveat, 22px, `var(--tape-cream)`)
- 4 clickable interaction type cards in a 2×2 grid:
  - Each card: 180px × 140px (responsive), `border-radius: 8px`, background `var(--vhs-dark)`, 1px border `var(--static-gray)`
  - Each card has a simple icon (drawn with CSS or SVG, not an emoji) and a label:
    1. Icon: wavy lines (finger trails). Label: "Draw & Wipe" — *"like a steamy window"*
    2. Icon: grid of circles. Label: "Tap to Pop" — *"like bubble wrap"*
    3. Icon: scattered dots. Label: "Blow & Scatter" — *"like a dandelion"*
    4. Icon: wavy horizontal line with arrow. Label: "Float & Guide" — *"like a paper boat"*
  - Selected card: same highlight treatment as Step 1
  - Only one can be selected

### Step 3: Customize

- Title: **"make it yours"** (Caveat, 22px, `var(--tape-cream)`)
- Show 3 sliders, each with a label and current value:
  - Slider 1: "Speed" — range 1-10, default 5. Label: "how fast things move" (DM Sans, 12px, `var(--static-gray)`)
  - Slider 2: "Density" — range 1-10, default 5. Label: "how many things are on screen"
  - Slider 3: "Magic" — range 1-10, default 5. Label: "how dreamy and floaty it feels"
- Slider styling: track is `var(--vhs-dark)`, filled portion is `var(--memory-warm)`, thumb is a circle 20px diameter, white, with `box-shadow: 0 2px 4px rgba(0,0,0,0.3)`
- Below the sliders: a live preview area (a small rectangle, 300px × 200px, centered, `border-radius: 8px`, showing a simplified version of the chosen interaction with the chosen background, reacting in real time to slider changes). For the hackathon, this can be a static preview image or a simplified animation — it does NOT need to be a fully working simulation.

### Step 4: Add Feeling

- Title: **"the finishing touches"** (Caveat, 22px, `var(--tape-cream)`)
- **Sound picker:** A horizontal row of 5 small audio option cards (80px × 60px each, 8px gap):
  - "Rain" 🌧, "Crickets" 🦗, "Wind" 🌬, "Silence" 🤫, "Classroom" 📚
  - Each card: `border-radius: 8px`, bg `var(--vhs-dark)`, text centered (emoji on top, label below in VT323 10px)
  - Selected: border `var(--memory-warm)`
- **Caption:** A text input field
  - Placeholder text: *"what do you remember?"* in Caveat italic
  - Max length: 50 characters
  - Styling: transparent background, no border except a bottom line (1px `var(--static-gray)`), text in Caveat 18px, `var(--tape-cream)`. On focus: bottom line becomes `var(--memory-warm)`.
- **Tags:** Three rows of filter pills (same style as Library filters):
  - Region: India, Japan, Brazil, Global, Nigeria, UK, Other
  - Mood: Calm, Playful, Magical, Cozy
  - Era: 90s, 2000s, Timeless
  - Multiple can be selected (multi-select within each row)

### Step 5: Preview & Publish

- Title: **"your memory is ready"** (Caveat, 22px, `var(--tape-cream)`)
- A VHS tape mockup in the center of the screen:
  - Draw a simplified top-down view of a VHS tape (a rectangle with rounded corners, 280px × 180px)
  - The tape is the color assigned by the system (from the curated tape color set)
  - A white label in the center of the tape with the user's caption (Caveat, 14px) and their tags below it (VT323, 9px)
- Below the tape: a large publish button
  - Text: **"▶ PUBLISH TO LIBRARY"** in VT323, 16px
  - Background: `var(--memory-warm)`, color: `var(--vhs-black)`, padding: 12px 32px, `border-radius: 8px`
  - On hover: brightness increases slightly (`filter: brightness(1.1)`)
  - On click: show a brief animation (tape slides upward and fades out, like being shelved), then show text: **"your memory is in the library"** in Caveat, 20px, `var(--tape-cream)`, and a link: **"← back to library"**
  - For the hackathon: clicking publish doesn't actually save anything. It just shows the success state. This is a UI demonstration, not a full backend flow.

---

## NAVIGATION STRUCTURE SUMMARY

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Static → tracking → title card → PLAY or LIBRARY |
| `/player` | Memory Player | CRT bezel + 7 memories + transport bar |
| `/library` | Library | VHS tape shelf + filters + random tape |
| `/create` | Memory Creator | 5-step wizard to create a memory |

### Global navigation rules:
- There is NO persistent header or navigation bar. Each page has its own contextual nav (back buttons, etc.)
- All page transitions use the VHS transition animation (scramble → static → resolve) — not standard fade or slide transitions
- The VHS overlay (scan lines, grain, vignette, color warmth) is active on ALL pages including library and creator

---

## RESPONSIVE DESIGN RULES

**Desktop (>1024px):**
- CRT bezel is centered with space around it
- Library shows 8-10 tape spines visible on the shelf without scrolling
- Etch-a-sketch uses keyboard arrow keys for drawing
- Memory Creator wizard steps have side-by-side layouts for cards

**Tablet (768px–1024px):**
- CRT bezel fills more of the screen (95% width)
- Library shows 5-6 tape spines visible
- Touch interactions replace mouse interactions everywhere
- Memory Creator cards are in a 2-column grid

**Mobile (<768px):**
- CRT bezel fills the full width with minimal border visible
- Transport bar buttons are larger (easier to tap) — 48px tap targets
- Library shows 3-4 tape spines visible, scroll for more
- Bubble wrap grid uses smaller bubbles (36px instead of 48px)
- Etch-a-sketch: swipe to draw instead of keyboard. Axis detection based on initial swipe direction.
- Dandelion: fewer seeds (30 instead of 50-60) for performance
- Memory Creator cards are in a single column
- All interactive areas have minimum 44px touch targets

---

## FILE STRUCTURE — CREATE EXACTLY THESE FILES

```
src/
├── app/
│   ├── layout.tsx              # Root layout: loads fonts, applies VHS overlay globally
│   ├── page.tsx                # Landing page (static → title → play)
│   ├── player/
│   │   └── page.tsx            # Memory player (CRT bezel + transport + memories)
│   ├── library/
│   │   └── page.tsx            # Library (tape shelf + filters)
│   └── create/
│       └── page.tsx            # Memory creator (5-step wizard)
├── components/
│   ├── shell/
│   │   ├── CRTBezel.tsx        # The TV frame that wraps the player
│   │   ├── TransportBar.tsx    # RW, PLAY/PAUSE, FF buttons + progress dots
│   │   ├── VHSOverlay.tsx      # Scan lines + grain + vignette (global)
│   │   ├── VHSTransition.tsx   # The scramble → static → resolve transition
│   │   └── VHSHUD.tsx          # REC counter, memory name, audio toggle
│   ├── memories/
│   │   ├── SteamyWindow.tsx
│   │   ├── BubbleWrap.tsx
│   │   ├── CloudWatching.tsx
│   │   ├── Dandelion.tsx
│   │   ├── PaperBoats.tsx
│   │   ├── ShadowPuppets.tsx
│   │   └── EtchASketch.tsx
│   ├── library/
│   │   ├── TapeShelf.tsx       # The horizontal shelf with standing VHS tapes
│   │   ├── TapeSpine.tsx       # Individual VHS tape on the shelf
│   │   └── FilterBar.tsx       # Region/mood/era filter pills
│   └── creator/
│       ├── ScenePicker.tsx     # Step 1
│       ├── InteractionPicker.tsx  # Step 2
│       ├── ParamTuner.tsx      # Step 3
│       ├── FeelEditor.tsx      # Step 4
│       └── PublishPreview.tsx  # Step 5
├── hooks/
│   ├── useCanvas.ts            # Sets up a canvas, handles resize, returns context
│   ├── useParticles.ts         # Particle system for dandelion seeds
│   ├── useAudio.ts             # Howler.js wrapper for playing sounds
│   └── useTimer.ts             # The REC timestamp counter
├── lib/
│   ├── physics.ts              # Vector math, force calculations
│   ├── noise.ts                # Simple Perlin noise implementation
│   ├── shapes.ts               # SVG path strings for animal silhouettes (cloud + shadow puppet morphs)
│   ├── library-data.ts         # Pre-seeded library tape data (the 8 example memories)
│   └── constants.ts            # Color tokens, timing constants, physics constants
├── styles/
│   └── globals.css             # CSS variables, base styles, VHS effects
└── public/
    └── audio/                  # Sound files (pop.mp3, whoosh.mp3, rain.mp3, squeak.mp3, shake.mp3, plop.mp3)
```

---

## CRITICAL RULES — DO NOT VIOLATE THESE

1. **No external images.** Every visual is built with CSS gradients, SVG shapes, or Canvas drawing. The only external files are audio files.
2. **Every color must use the CSS variable tokens.** Do not hardcode hex values in components. The only place hex values appear is in `globals.css` defining the tokens, and in the memory-specific background gradients (which are unique to each memory scene).
3. **Every font must be from the four specified Google Fonts.** Do not use system fonts, do not use any other Google Font.
4. **The VHS overlay (scan lines, grain, vignette) must be on every page.** It is what makes this feel like a VHS tape. Without it, it's just a website.
5. **All transitions between pages and memories use the VHS transition animation.** No standard fades, slides, or cuts.
6. **No UI framework (no Material UI, no Chakra, no shadcn).** Build all UI components from scratch with Tailwind CSS. The design is too specific for a component library.
7. **Canvas-based memories (steamy window, dandelion, bubble wrap, paper boats, etch-a-sketch) must use HTML5 Canvas API.** Do not use a canvas library like Konva or PixiJS. Keep it lightweight.
8. **All interactive elements must work with both mouse and touch.** Use pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) instead of separate mouse and touch handlers.
9. **The app must be usable without audio.** Audio is an enhancement, not a requirement. All interactions must work and feel complete even with sound muted.
10. **Performance: 60fps minimum on canvas memories.** Use `requestAnimationFrame` for all animations. Do not use `setInterval` for rendering loops.
