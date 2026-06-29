# Walkthrough: Implementing Core Memories & Shadow Puppet Fixes

## 1. Paper Boats Overhaul
- **Authentic Origami Folding:** Replaced the generic CSS rotations with a 5-step interactive SVG origami sequence. You now fold the flat paper in half, fold the corners down, fold the flaps up, and finally pull it out into a 3D boat shape.
- **Drag-to-Launch:** After folding, the boat rests on the pavement. You must manually drag it off the pavement and drop it into the water stream to launch it.
- **Endless Sailing Physics:** Removed the "sinking" and abrupt resetting logic. The boat now floats endlessly down the stream. It gently bobs and drifts toward the center while the water and debris flow past it. You can still click the water to create ripples that push the boat around.

## 2. Dandelion Blowing Modes
- **Camera & Mic Integration:** The Dandelion memory now features a custom starting prompt allowing you to choose how you want to interact with it.
- **Sound (Mic):** Uses audio frequencies to detect when you blow into the microphone, creating wind forces to blow the seeds away.
- **Face (Camera):** Uses a newly added ML model (`@mediapipe/face_mesh`) to track your facial landmarks in real-time. It specifically calculates the aspect ratio of your mouth to detect when you purse your lips to blow, pushing the dandelion seeds away without any sound.
- Both modes provide an on-screen visual indicator ("Detecting Blow...") when triggered.

## 3. Cloud Watching Interaction
- **Shape Selection:** Clicking on a cloud in the "Cloud Watching" activity now brings up a small popup menu allowing you to choose what animal you see (Bunny, Dog, or Whale) before the cloud morphs into that exact shape.

## 4. Steamy Window Update
- **Refogging with Microphone:** You can now blow into your microphone to make the screen foggy again instead of clearing the fog. The hint text was updated to "WIPE TO REMEMBER • BLOW TO FOG" to make this interaction clearer.

## 5. Library Tapes Update
- **VHS Labels:** The VHS tapes in the library now precisely match the names of the 7 core memory activities (e.g. "Bubble Wrap", "Shadow Puppets", "Dandelion").
- **Linking:** All 7 core memory tapes are now added to the library shelf and correctly route to their respective activity pages when clicked.

## 6. Shadow Puppets Update
Per your requests, we overhauled the [Shadow Puppets](file:///c:/Users/anush/OneDrive/Desktop/rewound/src/components/memories/ShadowPuppets.tsx):
- **Dynamic Checklists & Sidebar:** Replaced the "fixed bird" prompt in the middle of the screen with a clean sidebar guide. As you complete animals, they are visually checked off in the sidebar.
- **Lenient Tracking (60% Match):** Replaced the binary "exact shape" rules with a confidence-scoring system inside [shadowGestures.ts](file:///c:/Users/anush/OneDrive/Desktop/rewound/src/lib/shadowGestures.ts). It now looks for partial finger curls to reach a >60% threshold for each animal.
- **Shadow Reflection:** The hand shadows strictly reflect what your real hands are doing (instead of overlaying an SVG prompt in the middle).

## 7. Login Page Names
You requested to "fix the names in the login page". I've reviewed the PRD and the current [login page](file:///c:/Users/anush/OneDrive/Desktop/rewound/src/app/login/page.tsx) and changed the "Display Name" field to **"Tape Label Name"**, and the prompt to **"Who does this tape belong to?"**. This aligns well with the broader PRD themes without fundamentally changing the underlying user profile structure.
