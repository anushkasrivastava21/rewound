# Rewound — Product Requirements Document v2

**Version:** 2.0
**Date:** June 29, 2026
**Context:** Hackathon project · Theme: Open Innovation

---

## 1. Vision

Rewound is an interactive web platform disguised as a VHS tape. You press play, and forgotten childhood moments come alive under your fingers — drawing on steamy windows, blowing dandelions, popping bubble wrap. No words, no instructions. Just instinct and feeling.

But Rewound isn't just a product. It's a **public library of touchable memories.**

Anyone can create an interactive memory and publish it to the Rewound Library — a shared, browsable collection of sensory moments from every childhood, every culture, every generation. An Indian kid's memory of drawing rangoli in sand. A Japanese kid's memory of catching cicadas. A Brazilian kid folding papel picado. The core experience ships with 7 handcrafted memories, but the platform is designed to hold thousands — each one a tiny, wordless, universal interaction contributed by the community.

**The thesis:** Nostalgia isn't a feeling you explain. It's a feeling you touch. And when you make it open, you discover that everyone's childhood rhymes.

**Why this is Open Innovation:** The innovation is interaction-as-content. Rewound treats tactile, sensory micro-experiences as a new content primitive — like how YouTube treats video or Spotify treats audio. The "open" part is that this content is community-created, culturally diverse, and freely accessible. It's an open platform for a content type that doesn't exist yet.

---

## 2. The Three Pillars (Hackathon Strategy)

Every element of Rewound is designed to win across three judging axes simultaneously:

### Pillar 1 — Open Innovation (Theme Fit)

The "open" isn't bolted on. The entire architecture is designed around community contribution:

- **The Rewound Library** — a public, browsable gallery of interactive memories (like Roblox's game library or The Sims Gallery). Anyone can visit, play, and feel.
- **Memory Creator** — a builder tool where users design their own interactive memories using a template system (choose a background mood, an interaction type, a sound, a caption). No code required.
- **Cultural discovery** — memories are tagged by region, era, and mood. You can browse "rainy day memories from Japan" or "summer memories from Brazil." Nostalgia becomes a window into someone else's childhood.
- **Open-source interaction primitives** — the physics engines (particle systems, fluid simulation, fog dynamics) are modular and reusable. Other developers can build on them.

Even if the Memory Creator is a working prototype at demo time, the concept reframes the entire project from "cool art piece" to "new content platform."

### Pillar 2 — Technical Depth (Impress the Engineers)

This isn't animation. It's simulation.

- **Steamy Window** uses a thermodynamic condensation model — fog density varies by proximity to edges (colder glass), wipe paths re-fog at rates determined by a simulated humidity curve, and condensation droplets form organically at the boundaries of cleared areas based on surface tension physics.
- **Dandelion** runs a full particle physics system — each of the 50+ seeds has individual mass, drag coefficient, and lift. Wind follows a Perlin noise field so gusts feel organic, not random. Seeds tumble with angular velocity, not just translation.
- **Paper Boats** uses simplified Navier-Stokes fluid dynamics for the water surface. Ripples propagate realistically, the boat has buoyancy and drag, and user-created waves follow the inverse-square law for force dissipation.
- **Cloud Watching** morphs between shapes using cubic Bézier path interpolation on SVG control points — not opacity crossfades, actual geometric transformation of the cloud's boundary.

One memory that's *simulated* to a physics-accurate degree is worth more to judges than seven that are *animated* to look nice. Lead the demo with the dandelion.

### Pillar 3 — Impact & Purpose (Why It Matters)

Nostalgia isn't just pleasant. It's clinically therapeutic.

Research backing:
- Nostalgia increases social connectedness and reduces loneliness (Wildschut et al., 2006, Journal of Personality and Social Psychology)
- Brief nostalgia interventions improve mood and reduce anxiety (Sedikides et al., 2015, Current Directions in Psychological Science)
- Sensory-triggered nostalgia (touch, sound, smell) produces stronger emotional responses than visual-only triggers (Reid et al., 2014)

**Positioning:** Rewound is a **digital wellness micro-tool** — a two-minute sensory reset when you're overwhelmed. Instead of doomscrolling, press play. Instead of opening TikTok, blow a dandelion. The interactions are deliberately short (30-90 seconds each) and deliberately calm.

The VHS metaphor reinforces this: memories degrade, they're warm and imperfect, and you have to actively choose to press play. Rewinding is intentional. It's the opposite of infinite scroll.

Future applications: therapeutic use in elder care (triggering positive autobiographical memory), mindfulness tools for schools, anxiety management in clinical settings.

---

## 3. Experience Architecture

### 3.1 The Shell — VHS Player

The entire app lives inside the metaphor of a VHS tape playing on an old CRT television.

**Landing state:**
- Screen shows TV static (animated noise grain) for 1.5 seconds
- A wobbly VHS tracking band rolls through the screen
- The static resolves into a title card: handwritten-style "Rewound" with a subtitle — *"press play to remember"*
- Below the play button, two paths:
  - ▶ PLAY — enters the curated 7-memory tape
  - 📚 LIBRARY — opens the public memory gallery
- Faint mechanical hum in the background

**Active state (inside a memory):**
- The CRT bezel fades to the edges, memory fills 90% of viewport
- Bottom transport bar: ◀◀ RW · ▮▮ PAUSE · FF ▶▶
- Top-left: VHS timestamp counter (`REC 00:03:42`) — real time spent in this memory
- Top-right: tape label with memory name in handwritten font
- Subtle scan line overlay + very light grain across all memories
- Slight vignette darkening at corners (CRT curvature feel)

**Transitions between memories:**
- Pressing RW or FF triggers a 0.8s transition:
  1. Screen scrambles — horizontal distortion bands, color bleeding
  2. Brief flash of static/snow
  3. New memory fades in with a subtle VHS tracking wobble
- Memories play in a fixed sequence to create an emotional arc:
  1. Steamy Window (calm, introspective)
  2. Bubble Wrap (tactile, satisfying)
  3. Cloud Watching (dreamy, slow)
  4. Dandelion (magical, peak wonder)
  5. Paper Boats (serene, flow)
  6. Shadow Puppets (playful, imaginative)
  7. Etch-a-Sketch (creative, freeform — you leave your mark)

**End state:**
- After the last memory, pressing FF shows: *"be kind, rewind"*
- Tape auto-rewinds (visual + audio) back to memory 1
- Or: a prompt — *"record your own"* — leading to the Memory Creator

### 3.2 Shared Visual Layer

These effects apply globally to maintain the VHS illusion:

| Layer | Implementation | Intensity |
|---|---|---|
| Scan lines | Repeating 2px horizontal lines, ~5% opacity | Subtle — felt, not seen |
| Film grain | Animated noise texture, ~3% opacity | Barely visible, adds warmth |
| Vignette | Radial gradient from edges | ~15% opacity at corners |
| Color shift | Warm color grade nudged toward amber | Global CSS filter |
| Bloom | Faint glow on bright elements | 1-2px blur on highlights |

---

## 4. The Rewound Library — Public Memory Gallery

### 4.1 Concept

The Library is the "open" in Open Innovation. It's a community-curated museum of interactive childhood moments from around the world — browsable, playable, and contributor-driven. Think of it as:
- **Roblox** but for sensory micro-experiences instead of games
- **The Sims Gallery** but for memories instead of builds
- **Are.na** but tactile instead of visual

### 4.2 Browsing the Library

**Visual design:** A wall of VHS tape spines on a shelf — each tape is a memory. Tapes are color-coded by mood/category. You pull one out, and it "loads" into the player with the standard VHS transition.

**Organization:**

Memories can be filtered and browsed by:
- **Region/Culture:** India, Japan, Brazil, Nigeria, Global...
- **Season/Weather:** Rainy day, Summer, Winter, Monsoon...
- **Mood:** Calm, Playful, Magical, Cozy, Adventurous...
- **Era:** 90s kid, 2000s kid, Timeless...
- **Interaction type:** Draw, Tap, Blow, Drag, Shake...

**Discovery features:**
- "Someone's Childhood" — a shuffle button that plays a random tape from a random culture. You experience a memory you've never had but somehow recognize.
- "Tapes Near You" — location-based. See what kids in your city/country remember.
- Trending tapes — most played this week.
- Staff picks — curated collections like "Monsoon Memories" or "School Desk Moments."

### 4.3 Memory Creator (Builder Tool)

The creator is how the Library grows. It's a simplified, no-code tool for building interactive memories using Rewound's engine.

**Builder flow:**

Step 1 — **Set the scene.** Choose a background mood from presets (rainy evening, golden field, bedroom at night, classroom, backyard) or upload a custom gradient/image.

Step 2 — **Choose your interaction.** Pick from a library of interaction primitives:
- Draw/wipe (steamy window style)
- Tap to pop/trigger (bubble wrap style)
- Blow/scatter (dandelion style)
- Float/guide (paper boat style)
- Drag to draw (etch-a-sketch style)
- Morph on tap (cloud watching style)
- Shadow/follow (shadow puppet style)

Step 3 — **Customize.** Adjust parameters depending on the interaction type:
- For draw/wipe: fog density, re-fog speed, reveal image
- For tap: grid size, pop animation style, sound
- For blow: particle count, wind strength, particle shape
- For float: flow speed, obstacle count, boat/object shape

Step 4 — **Add feeling.** Choose an ambient sound (rain, crickets, wind, classroom hum, silence). Write an optional caption in handwriting font. Tag it with region, era, mood.

Step 5 — **Publish.** The memory gets a VHS tape spine, enters the Library, and is playable by anyone.

**Hackathon scope:** The full builder is the long-term vision. For the hackathon demo, a working prototype that lets you set a scene + choose an interaction + publish to the library is enough to prove the platform concept. Even a clickable mockup of the builder flow alongside 2-3 "community-contributed" example tapes in the library sells the vision.

### 4.4 Social Layer (Light Touch)

The social layer is intentionally minimal — this isn't social media. It's a museum.

- **Play count** on each tape (no likes, no comments — just "played 2,847 times")
- **Collections** — users can save tapes to personal collections ("my favorites", "rainy day playlist")
- **Contributor profiles** — just a name and their published tapes. No followers, no feeds.
- **Share a tape** — generates a direct link. When opened, it loads that memory instantly with the VHS startup.

The philosophy: connection through shared experience, not through engagement metrics.

---

## 5. The Seven Core Memories — Interaction Specifications

### Memory 1: Steamy Window

**Mood:** Quiet. Rainy evening. You're in the backseat.

**Visual setup:**
- Background: soft, blurred evening scene through glass — warm street lights as bokeh circles, silhouettes of trees, deep blue-purple sky gradient
- Foreground: full-screen fog/condensation layer — slightly uneven opacity (thicker at corners and edges where glass is colder, thinner near center)
- Occasional rain droplets sliding down the glass (slow, organic paths, slight refraction)

**Interaction:**
- Mouse/touch draws on fog, wiping it away to reveal the scene beneath
- Wipe has soft edges, ~30px radius brush
- Wiped areas slowly re-fog over 15-20 seconds (memory fades, humidity curve)
- Condensation droplets form organically at the edges of cleared areas (surface tension simulation)
- Drawing makes a soft squeaky sound (optional audio)

**Simulation details (Pillar 2):**
- Fog density modeled as a 2D temperature field — edges are colder (denser fog), center is warmer (thinner fog)
- Re-fogging speed varies by position — corners re-fog faster than center
- Droplet formation follows simplified surface tension rules — water accumulates at wipe boundaries and drips when mass exceeds threshold

**Technical approach:**
- Two-layer canvas: background scene (CSS gradient/image) + fog layer (canvas with per-pixel alpha)
- Draw by reducing alpha with a soft circular brush + Gaussian falloff
- Re-fog via time-stepped alpha recovery with position-dependent rate
- Droplet physics on a third canvas layer

**Emotional beat:** Calm, introspective. The entry point. Sets the tone.

---

### Memory 2: Bubble Wrap

**Mood:** Fidgety. Satisfying. Can't stop.

**Visual setup:**
- Sheet of bubble wrap fills the screen — realistic grid of bubbles
- Soft lighting from above-left, each bubble has a specular highlight and shadow
- Translucent, slightly glossy material
- Background: warm surface (cardboard box or wooden desk)

**Interaction:**
- Tap/click individual bubbles to pop them
- Pop animation: bubble deflates (scale down + flatten), slight color shift
- Satisfying pop sound with ±10% pitch variation for natural feel
- Popped bubbles stay popped
- Click-and-drag to pop multiple rapidly (the "I can't stop" moment)
- Quiet counter in corner: "47/120 popped"
- Long-press on an unpopped bubble: it slowly inflates slightly before popping (tension and release)

**Technical approach:**
- CSS grid of circular elements, each with independent state
- ±5% random size variation for organic feel
- Pop via CSS transition (transform + opacity)
- Web Audio API for real-time pitch-shifted pop sounds

**Emotional beat:** Playful energy spike after Memory 1's calm.

---

### Memory 3: Cloud Watching

**Mood:** Lying in grass. Staring up. Time doesn't exist.

**Visual setup:**
- Full-screen sky gradient — soft blue at top fading to warm white-blue at horizon
- 5-7 clouds drifting slowly left-to-right (parallax layers — closer clouds faster)
- Clouds are soft blobby shapes (SVG paths, not images)
- Faint grass silhouette at the very bottom edge
- Occasional bird silhouette crossing lazily

**Interaction:**
- Tap a cloud → it morphs into a recognizable shape over 2 seconds (dog, bunny, whale, dragon, elephant, fish, bird)
- After morphing, handwritten label fades in: *"I see a bunny"*
- Shape holds for a few seconds, then drifts back to abstract cloud
- Each cloud can be tapped multiple times for different shapes
- Clouds keep drifting — you might miss one

**Simulation details (Pillar 2):**
- Cloud morph uses cubic Bézier path interpolation on SVG control points — actual geometric boundary transformation, not crossfades
- Cloud shapes are procedurally generated from Perlin noise, so no two clouds look identical even on replay
- Parallax follows real atmospheric perspective — distant clouds are desaturated and slower

**Technical approach:**
- Clouds as SVG paths with interpolated morph transitions
- Predefined shape library: 8-10 animal silhouettes as target paths
- CSS animation for drift (translateX, 30-60s per pass)
- Layered parallax with depth-based opacity

**Emotional beat:** Wonder. The pace slows way down.

---

### Memory 4: Dandelion ⭐ (Technical Showcase)

**Mood:** Standing in a field. One breath. Magic.

This is the **Pillar 2 showpiece** — the memory where simulation depth is pushed to impress judges technically.

**Visual setup:**
- Single dandelion seed head (white puffball) centered, tall stem
- Background: warm golden-hour field — soft gradient with blurred grass
- Warm glowing light from right (sunset feel)
- 50-60 individually visible seeds attached to the head

**Interaction:**
- Click and hold, drag away → seeds detach and float in drag direction
- Drag force/speed determines how many seeds release
- Seeds follow realistic float paths with organic drift
- Seeds slowly fade as they exit viewport
- As seeds deplete, the head becomes bare — just stem and receptacle
- Gentle whoosh sound on each blow
- After all seeds gone: quiet beat, then new dandelion grows in (time-lapse)

**Simulation details (Pillar 2) — this is the technical selling point:**
- Each seed is a rigid body with individual mass (0.003g ± variance), frontal area, and drag coefficient
- Detachment uses a force threshold model — seeds closer to the blow point detach first, peripheral seeds need more force
- Post-detachment physics per seed:
  - Gravity: constant downward pull (9.8 m/s² scaled)
  - Drag: proportional to velocity² × frontal area × Cd (accounts for the papus/feathery top creating air resistance)
  - Lift: Bernoulli-approximated lift from airflow over the asymmetric seed shape
  - Wind field: 2D Perlin noise field that evolves over time — creates organic gusts and eddies, not uniform wind
  - Angular velocity: seeds tumble and rotate as they float, rotation rate coupled to air resistance
  - Terminal velocity: each seed reaches a natural terminal velocity (~0.5 m/s scaled) based on its drag-to-weight ratio
- Wind field parameters exposed for the Memory Creator (wind strength, gust frequency, turbulence)
- Performance: spatial partitioning (quadtree) so 60 particles at 60fps is achievable

**Technical approach:**
- Canvas-based particle system with per-frame physics integration (Verlet)
- Perlin noise via a lightweight JS implementation
- Each seed rendered as a small SVG shape (stem + papus tufts) drawn to canvas
- requestAnimationFrame loop with delta-time for consistent physics across frame rates

**Emotional beat:** Peak wonder. The centerpiece of the entire experience.

---

### Memory 5: Paper Boats

**Mood:** Rainy day. Gutter stream. Following your boat.

**Visual setup:**
- Top-down or slight-angle view of a rain gutter stream flowing down the screen
- Animated water with flowing texture, ripples, floating leaves
- Curb/pavement edges on both sides, wet and reflective
- Rain drops hitting water surface (expanding splash circles)
- One small origami paper boat floating in the stream

**Interaction:**
- Stream flows continuously
- Mouse/touch on water creates ripples that push the boat
- Tap near the boat to nudge it with a small wave
- Boat rocks and tilts with water movement
- Obstacles appear: twigs, leaves, pebble — boat navigates around or bumps softly
- If boat gets stuck, tap to create a splash that frees it
- Journey loops — boat exits screen, new one appears

**Simulation details (Pillar 2):**
- Water surface modeled with a simplified 2D heightfield (shallow water equations)
- Ripple propagation follows the wave equation with damping
- User taps inject energy into the heightfield, which propagates outward
- Boat has buoyancy (responds to local water height), drag, and a simple collision hull
- Force from ripples on the boat follows inverse-square dissipation

**Technical approach:**
- Canvas for water surface rendering (heightfield → normal-mapped shading)
- Boat physics: position integration based on local flow vector + wave forces
- Ripples: expanding ring particles that modify the heightfield
- Obstacles as static colliders with soft bounce

**Emotional beat:** Serene but engaged. Guiding something fragile.

---

### Memory 6: Shadow Puppets

**Mood:** Bedroom. Night light. The wall is your stage.

**Visual setup:**
- Warm-lit wall as background — slight plaster texture
- Light source from bottom-center (lamp on the floor)
- Warm yellow-amber glow gradient — brighter near bottom, dimmer at top
- Shadow projected on wall based on cursor position

**Interaction:**
- Moving cursor creates a hand shadow on the wall
- Shadow follows cursor with projection physics — stretches/warps based on distance from light source
- At certain cursor zones, shadow morphs into animals:
  - Center → dog (click to make mouth open/close)
  - Upper area → bird (move to flap wings)
  - Sides → bunny (ears wiggle)
  - Bottom → snapping alligator
- Small handwritten label on recognition: *"a dog!"*
- Click makes the puppet perform — dog barks, bird flaps, bunny hops
- Two simultaneous touch points create two shadows (two-hand puppets)

**Technical approach:**
- Predefined shadow puppet SVGs morphing based on cursor zones
- Shadow scale increases with distance from light source
- Penumbra effect: blur increases for shadows further from wall
- CSS transforms for real-time stretch/warp

**Emotional beat:** Playful, imaginative. Your hands come alive.

---

### Memory 7: Etch-a-Sketch

**Mood:** Living room floor. Rainy Saturday. Infinite possibilities.

**Visual setup:**
- Red Etch-a-Sketch frame fills most of screen
- Classic proportions: red plastic frame, gray-green screen, two white dials
- Silver-gray metallic drawing surface
- Top label reads "Rewound" in the Etch-a-Sketch lettering style

**Interaction:**
- Two control modes:
  - Dials: left = horizontal, right = vertical. Circular drag gesture to rotate
  - Keyboard: arrow keys / WASD (desktop), swipe (mobile)
- Drawing creates a continuous dark line on the silver screen
- Line is always connected — no lifting the pen (true to life)
- Movement is axis-locked (horizontal OR vertical per input, like real Etch-a-Sketch)
- Shake to erase: device accelerometer (mobile) or shake button (desktop)
- Shake animation: frame jitters (CSS transform, 1s), lines dissolve from outside in

**Technical approach:**
- Canvas drawing surface
- Line rendering: connected segments, tracked cursor position
- Axis-locked movement detection
- Shake erase: canvas opacity fade + container CSS jitter animation

**Emotional beat:** Creative freedom. The closing moment — you leave your mark. And then you shake it away. Nothing is permanent. That's okay.

---

## 6. Design System

### 6.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--vhs-black` | `#1a1714` | CRT bezel, deep backgrounds |
| `--vhs-dark` | `#2c2824` | UI chrome, transport bar |
| `--static-gray` | `#6b6560` | Inactive states, timestamps |
| `--tape-cream` | `#d4c8b0` | Text, labels, title cards |
| `--memory-warm` | `#e8a849` | Accent, highlights, warm glow |
| `--tracking-blue` | `#4a7fb5` | VHS tracking distortion accent |
| `--vhs-red` | `#c44040` | REC indicator, subtle accents |
| `--library-shelf` | `#5c3d2e` | Library wood shelf tones |

### 6.2 Typography

| Role | Font | Usage |
|---|---|---|
| Handwritten display | *Caveat* or *Patrick Hand* | Memory titles, tape labels, "I see a bunny" captions |
| System / timestamp | *VT323* or *Share Tech Mono* | VHS counter, transport controls |
| Title card | *Bungee Shade* or custom | "Rewound" logo on landing |
| Library UI | *Inter* or *DM Sans* | Library browsing, creator tool, tags |

### 6.3 Audio Design

| Sound | Trigger |
|---|---|
| Mechanical hum | Ambient, always-on (very low volume) |
| Tape clunk | Pressing RW / FF / PLAY |
| Tracking screech | Transition between memories |
| Rewind whirr | End-state rewind sequence |
| Squeaky finger | Drawing on steamy window |
| Pop (pitch-varied) | Each bubble wrap pop |
| Gentle whoosh | Dandelion blow |
| Rain ambience | Paper boats, steamy window |
| Soft splash | Tapping water near paper boat |
| Crickets | Dandelion field ambience |

All audio opt-in — speaker icon to unmute. Default muted for autoplay policy compliance.

---

## 7. Technical Specification

### 7.1 Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14** (React) | Anushka's current stack |
| Styling | **Tailwind CSS** + CSS custom properties | Design tokens + speed |
| Canvas/Graphics | **HTML5 Canvas API** | Steamy window, dandelion, paper boats, etch-a-sketch |
| SVG Animation | **Native SVG + CSS transitions** | Cloud morphing, shadow puppets |
| Animation | **Framer Motion** | VHS transitions, UI animation |
| Physics | **Custom lightweight engine** | Particle systems, fluid sim (no heavy library) |
| Audio | **Howler.js** | Cross-browser audio with sprites |
| Database | **Supabase** | Library storage, user memories, auth |
| Deployment | **Vercel** | One-click deploy |

### 7.2 Project Structure

```
rewound/
├── app/
│   ├── layout.tsx                  # CRT shell, global VHS overlay
│   ├── page.tsx                    # Landing — static → title → play/library
│   ├── player/
│   │   └── page.tsx                # Memory player with transport controls
│   ├── library/
│   │   ├── page.tsx                # Public memory gallery (browse/search)
│   │   └── [id]/page.tsx           # Single memory player from library
│   └── create/
│       └── page.tsx                # Memory Creator builder tool
├── components/
│   ├── shell/
│   │   ├── CRTBezel.tsx
│   │   ├── TransportBar.tsx
│   │   ├── VHSOverlay.tsx
│   │   └── Transition.tsx
│   ├── memories/
│   │   ├── SteamyWindow.tsx
│   │   ├── BubbleWrap.tsx
│   │   ├── CloudWatching.tsx
│   │   ├── Dandelion.tsx
│   │   ├── PaperBoats.tsx
│   │   ├── ShadowPuppets.tsx
│   │   └── EtchASketch.tsx
│   ├── library/
│   │   ├── TapeShelf.tsx           # VHS shelf gallery view
│   │   ├── TapeSpine.tsx           # Individual tape in shelf
│   │   ├── FilterBar.tsx           # Region/mood/era filters
│   │   └── MemoryCard.tsx          # Preview card for a memory
│   ├── creator/
│   │   ├── ScenePicker.tsx         # Step 1: background mood
│   │   ├── InteractionPicker.tsx   # Step 2: interaction type
│   │   ├── ParamTuner.tsx          # Step 3: customize physics
│   │   ├── FeelEditor.tsx          # Step 4: sound + caption + tags
│   │   └── PublishFlow.tsx         # Step 5: preview + publish
│   └── shared/
│       ├── GrainOverlay.tsx
│       └── HandwrittenText.tsx
├── hooks/
│   ├── useCanvas.ts
│   ├── useParticles.ts
│   ├── useFluid.ts                 # Shallow water sim for paper boats
│   ├── usePerlinNoise.ts           # Wind fields, fog, cloud generation
│   ├── useAudio.ts
│   └── useShake.ts
├── lib/
│   ├── physics/
│   │   ├── vectors.ts              # 2D vector math
│   │   ├── particles.ts            # Particle system core
│   │   ├── fluid.ts                # Heightfield fluid sim
│   │   └── springs.ts              # Spring-damper for soft interactions
│   ├── noise.ts                    # Perlin noise implementation
│   ├── shapes.ts                   # SVG paths for cloud → animal morphs
│   └── vhs.ts                     # VHS effect utilities
├── public/
│   └── audio/
└── styles/
    └── vhs.css
```

### 7.3 Database Schema (Supabase)

```sql
-- Published community memories
memories (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  creator_id uuid REFERENCES auth.users,
  creator_name text,
  scene_config jsonb,        -- background, lighting, mood
  interaction_type text,     -- 'draw', 'tap', 'blow', 'float', 'drag', 'morph', 'shadow'
  interaction_params jsonb,  -- physics params, grid size, particle count, etc.
  audio_preset text,         -- 'rain', 'crickets', 'wind', 'classroom', 'silence'
  caption text,              -- optional handwritten caption
  tags jsonb,                -- { region, era, mood, season }
  play_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  is_featured boolean DEFAULT false
)

-- User's saved collections
collections (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name text,
  memory_ids uuid[],
  created_at timestamptz DEFAULT now()
)

-- Regional/cultural tags for discovery
tags (
  id uuid PRIMARY KEY,
  category text,             -- 'region', 'era', 'mood', 'season'
  value text,                -- 'India', '90s', 'cozy', 'monsoon'
  display_label text
)
```

### 7.4 Performance Targets

- 60fps on canvas-heavy memories (dandelion with 60 particles, paper boats fluid sim)
- Total bundle under 500KB (excluding audio)
- First paint under 2 seconds
- Memories lazy-loaded — only active memory renders its canvas
- Library page: virtualized list for scrolling through hundreds of tapes

### 7.5 Responsive Strategy

- Primary: desktop/laptop (mouse interactions shine)
- Tablet: fully supported, touch replaces mouse
- Mobile: supported with adaptations — smaller grids, fewer particles, swipe replaces dials
- Minimum viewport: 360px wide

---

## 8. Build Tiers

### Tier 1 — Hackathon MVP (Build First — 70% of time)

Deliverables that make it a winning, demo-ready product:

1. **VHS Shell** — CRT bezel, scan lines, grain overlay, transport bar, VHS transitions between memories. This is the first impression. Make it flawless.
2. **Dandelion** ⭐ — Full particle physics simulation. This is your technical showpiece. Spend real time here.
3. **Steamy Window** — Canvas fog + wipe with re-fog and droplet formation.
4. **Bubble Wrap** — CSS grid of tappable bubbles with satisfying audio.
5. **Landing sequence** — Static → title card → play animation. Judges see this first.

> Four playable memories inside a polished shell. The dandelion alone proves technical depth. The shell proves design craft.

### Tier 2 — Platform Layer (Next — 20% of time)

This is what turns "cool project" into "hackathon winner":

6. **Library page** — A browsable shelf of VHS tapes. Pre-seed with 3-5 "community-contributed" memories (you make them, label them as if from different contributors/cultures).
7. **Memory Creator (prototype)** — A working flow: pick a scene → pick an interaction → adjust 2-3 sliders → publish. Even if it only supports 1-2 interaction types, it proves the platform concept.
8. **Share-a-tape** — Direct link to any memory. Opens with VHS startup.

> This is the "open innovation" proof. Without it, you have a great art project. With it, you have a platform.

### Tier 3 — Polish & Remaining Memories (Last — 10% of time)

9. **Etch-a-Sketch** — Canvas line drawing with shake erase.
10. **Cloud Watching** — SVG morph transitions.
11. **Shadow Puppets** — Cursor-zone shadow mapping.
12. **Paper Boats** — Fluid simulation.
13. **Audio layer** — All sounds and ambience.

> Add as many as time allows. Each one enriches the tape but isn't required for a winning demo.

---

## 9. Pitch Strategy

### 9.1 The One-Liner

*"Rewound is a VHS tape of childhood moments you can touch again — and an open platform where anyone can press record on their own."*

### 9.2 The Pitch Script (3 minutes)

**Open with a question (10 seconds):**
> "When was the last time you blew a dandelion?"
> [Pause. Let the silence work.]
> "You just felt something. That's what we built."

**Demo — don't present (90 seconds):**
Hand the laptop to a judge. Don't explain. Let them:
1. See the VHS static load (wow moment #1 — instant atmosphere)
2. Draw on the steamy window (wow moment #2 — they'll smile)
3. Pop some bubble wrap (wow moment #3 — they won't want to stop)
4. Blow the dandelion (wow moment #4 — the technical showcase, the emotional peak)

> Say almost nothing during the demo. Let the product speak. The silence is the pitch.

**The platform vision (30 seconds):**
> "These are seven of our memories. But everyone's childhood has its own. In India, it's drawing rangoli in sand. In Japan, it's catching cicadas. Rewound isn't just a tape — it's a library. Anyone can record a memory using our builder, tag it with where they grew up, and add it to a public collection. Open innovation means the content comes from everywhere."

**The impact angle (20 seconds):**
> "Nostalgia isn't just nice. Research shows it measurably reduces loneliness and anxiety. Rewound is a two-minute sensory reset — the opposite of doomscrolling. Press play instead of opening Twitter. We think that's a product worth building."

**Close (10 seconds):**
> "The tagline on the landing screen says 'press play to remember.' We think that's what technology should do more often. Thank you."

### 9.3 If Judges Ask Questions

**"How is this Open Innovation?"**
> "The interaction types — particle physics, fluid simulation, fog dynamics — are open, modular primitives. The Memory Creator lets anyone combine them into new experiences without code. And the Library is community-driven — the more people contribute, the richer it gets. The innovation is treating tactile interaction as a new content type, and making the platform open for anyone to create and share it."

**"What's the technical complexity?"**
> "The dandelion alone runs a per-particle physics simulation — individual mass, drag coefficients, Bernoulli lift, and a Perlin noise wind field. The steamy window uses a temperature-field model for condensation density. These aren't animations — they're simulations. We built custom physics engines for each memory."

**"What's the business case / future?"**
> "Therapeutic applications — nostalgia interventions for elder care, mindfulness tools for schools, anxiety management. The Library model scales like any UGC platform. And the interaction primitives are licensable for other products — imagine a meditation app using our particle engine, or a children's museum using our touch interactions."

**"How does the Library handle quality/moderation?"**
> "Community-contributed memories go through a lightweight review. But the interaction primitives are inherently safe — you can't build harmful content from fog, bubbles, and wind. The worst case is a memory that's boring. The system self-curates through play counts."

---

## 10. Success Metrics (For Judging)

| Criteria | How Rewound wins |
|---|---|
| **Theme fit** | The Library + Memory Creator IS open innovation — community-created content on an open interaction platform |
| **Innovation** | New content primitive: tactile, sensory micro-experiences. Nobody has built this. |
| **Technical** | Simulation-grade physics (not animation), custom particle/fluid engines, SVG path morphing |
| **Design** | Cohesive VHS metaphor across every pixel. No UI clutter. The experience IS the interface. |
| **Impact** | Research-backed wellness application. Universal emotional resonance. Cultural bridge through shared nostalgia. |
| **Completion** | Tier 1 gives a polished, complete product. Tier 2 proves the platform scales. |
| **Presentation** | The product is the pitch. Judges play it, feel it, remember it. |

---

## 11. Post-Hackathon Roadmap (Slide for Q&A)

| Phase | What ships |
|---|---|
| **Month 1** | All 7 core memories polished. Library with 30+ seeded memories across 10 cultures. |
| **Month 2** | Memory Creator public beta. Community contributions open. |
| **Month 3** | Mobile app (React Native). Haptic feedback for bubble wrap, shake-to-erase. |
| **Month 6** | API for interaction primitives. Partnerships with wellness apps and museums. |
| **Month 12** | 1,000+ community memories. Educational partnerships. Therapeutic pilot programs. |
