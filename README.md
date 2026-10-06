# Slime Studio 🧪✨ The Tactile ASMR Slime Maker

A cozy, satisfying, physics-based ASMR slime making game and tactile soft-body jelly simulator. Make your own custom slimes, squish them with your mouse, stretch them like putty, and feel their stickiness!

---

## 🎮 Game Features & Physics

- **💥 Click to Squish:**
  - Clicking/tapping the slime creates an instant soft-body indentation at that exact point.
  - Generates jelly ripple waves that radiate across the boundary with volume conservation.
  - Emits squish splash particles and plays synthesized ASMR squishes.
  - Earns `+1 Slime Coin` per squish!

- **➰ Click & Drag to Stretch:**
  - Clicking down and dragging pulls and stretches that specific part of the slime outward like putty or taffy!
  - Creates a stretchy, viscous putty bridge connecting the base body to your cursor.
  - When released, the slime snaps back with elastic spring dampening oscillations.
  - Earns `+3 Slime Coins` per stretch!

- **🍯 Hover Stickiness (Adheres & Releases Based on Stickiness Level):**
  - Hovering your mouse over the slime causes it to **stick** to your cursor!
  - Forms sticky gooey filaments and suction threads connecting the slime surface to your cursor.
  - The surface lifts toward your cursor as you move.
  - **Stickiness Duration:** Holds for a duration determined by the stickiness level set when it was made:
    - **Level 1 (Ultra Slick):** Holds for `0.25s` — barely sticks, quick slide off with a light snap.
    - **Level 2 (Light Gloss):** Holds for `0.70s` — light adhesion, releases promptly.
    - **Level 3 (Balanced):** Holds for `1.50s` — gooey adhesion, holds for 1.5 seconds.
    - **Level 4 (Gooey Cushion):** Holds for `2.80s` — thick gooey suction, forms long adhesive strands for 2.8 seconds.
    - **Level 5 (Super Sticky Taffy):** Holds for `4.50s` — extreme tacky suction, long stretchy filaments follow the cursor for 4.5 seconds!
  - When the timer expires, the slime **lets go** with a satisfying synthesized ASMR suction release pop (`playStickRelease`), snapping back to the body and awarding `+2 Slime Coins`!

- **🧪 Slime Crafter Studio:**
  - Mix customized slime recipes!
  - Select base textures: Classic Jelly, Cloud Slime ☁️, Floam Crunch 🍡, Butter Slime 🧈, Glitter Galaxy ✨, Crystal Clear 💎, and Golden Chrome 👑.
  - Choose any color from the vibrant palette or pick a custom RGB tint.
  - Dual-color swirl option to mix two colors together!
  - Tune stickiness level (1 to 5) with live recipe testing in the preview bowl.
  - Add toppings and charms: Rainbow Foam Beads, Star Glitter, Fruit Confetti, Boba Pearls, and Gummy Bears!

- **🛍️ Texture Boutique (Shop):**
  - Unlock sensory textures using earned in-game Slime Coins (`🪙`):
    - ☁️ **Cloud Slime (150 Coins):** Fluffy drizzling cotton texture, layered cloud puffs, floaty mist bursts, and soft airy ASMR puffs.
    - 🍡 **Floam Crunch (180 Coins):** Packed with thousands of colorful crunchy foam beads that shift with the soft body and pop when squished!
    - 🧈 **Butter Slime (220 Coins):** Smooth velvety matte finish with a creamy butter-knife swirl curve.
    - ✨ **Glitter Galaxy (250 Coins):** Holographic 4-point star sparkles with rotating shimmer trails.
    - 💎 **Crystal Clear (300 Coins):** Ultra clear optical prism facets and glass refraction.
    - 👑 **Golden Chrome (500 Coins):** Molten liquid 24K gold metallic sheen and royal sparkles.

- **🛠️ Quick Tactile Tools:**
  - 🖐️ **Poke & Drag:** Freeform soft-body squishing and stretching.
  - 🥄 **Spatula Swirl:** Knead and swirl the slime.
  - ✨ **Glitter Shaker:** Sprinkle cascading star glitter dust.
  - 🫧 **Bubble Pop:** Blow squishy translucent bubbles onto the slime and pop them!

---

## 🕹️ Controls

| Action | Control |
| :--- | :--- |
| **Hover Stickiness** | Move mouse over slime (sticks & releases after timer) |
| **Squish Slime** | Click / Tap anywhere on slime |
| **Stretch Putty** | Click & Drag outward |
| **Change Stickiness** | Press keys `1`, `2`, `3`, `4`, `5` or toolbar buttons |
| **Center / Smooth Slime** | Press `R` or click `🔄 Center` |
| **Toggle Sound** | Press `M` or click `🔊 Sound` |
| **Make New Slime** | Click `🧪 Make Slime` |
| **Open Texture Shop** | Click `🛍️ Texture Shop` |

---

## 🚀 How to Play

Open [`index.html`](index.html) in any modern web browser. Completely self-contained with synthesized Web Audio API sound effects and zero build dependencies!
