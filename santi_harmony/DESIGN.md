```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Resonant Sanctuary"

This design system is built to facilitate difficult conversations. In the context of conflict resolution, the UI must act as a neutral, calming mediator—not a rigid software interface. We move away from the "industrial" feel of standard apps toward a **"Resonant Sanctuary"**—an editorial-inspired digital environment that feels as grounded as a physical workshop space.

The system breaks traditional "boxed-in" layouts. By utilizing intentional asymmetry, deep tonal layering, and generous white space, we create a sense of psychological safety. The goal is to make the user feel held, not managed. We achieve this by prioritizing soft transitions over hard lines and tactile depth over flat grids.

---

## 2. Colors: Tonal Empathy

The palette balances the professional authority of deep teals with the empathetic warmth of soft oranges. We avoid "alert" colors in favor of "informative" tones to keep the nervous system regulated.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** To define boundaries, you must use background color shifts. For example, a `surface-container-low` card should sit on a `surface` background. The transition of color is the boundary.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers. 
- Use `surface-container-lowest` for the most "elevated" interactive elements (like an active Scenario Card).
- Use `surface-container-highest` for background structural elements that need to feel anchored.
- This "stacking" of containers creates a sense of order without the claustrophobia of grid lines.

### The "Glass & Gradient" Rule
To add visual "soul," use subtle gradients for primary actions. Instead of a flat `primary` fill, transition from `primary` (#00464a) to `primary-container` (#006064) at a 135-degree angle. For floating facilitator controls, apply a **Glassmorphism** effect: use a semi-transparent `surface` color with a `backdrop-filter: blur(12px)`.

---

## 3. Typography: Editorial Clarity

The typography system pairs **Manrope** (for Latin/Display) with **Prompt** or **Sarabun** (for Thai) to create a sophisticated, accessible hierarchy.

*   **Display & Headlines (Manrope/Thai Sans):** These are your "Authoritative Voice." Use `display-lg` (3.5rem) for major phase transitions in the seminar. Use `headline-md` (1.75rem) for conflict scenarios to give them weight and importance.
*   **Body & Titles (Be Vietnam Pro/Thai Sans):** Designed for "The Dialogue." `body-lg` (1rem) is the standard for scenario descriptions. It offers high legibility for long-form Thai text, ensuring no meaning is lost in translation.
*   **Labels:** Use `label-md` (0.75rem) in all-caps (Latin) or slightly tracked-out Thai to denote meta-information, like "Facilitator View" or "Round 1."

---

## 4. Elevation & Depth: Tonal Layering

We reject traditional drop shadows. We convey hierarchy through **Tonal Layering** and ambient light.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f5f3f3) background. This creates a "soft lift" that feels organic and calm.
*   **Ambient Shadows:** If an element must float (e.g., a modal or a floating action button), use a shadow with a blur radius of at least `32px` and an opacity of `6%`. The shadow color must be a tinted version of `on-surface` (#1b1c1c), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#bec8c9) at **20% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use for "Facilitator Control" panels. This keeps the facilitator present "above" the game board without disconnecting them from the participants' visual flow.

---

## 5. Components: Tactile Resolution

### Cards & Scenarios
*   **Guideline:** Forbid divider lines. Use `1.5rem` (xl) padding and background shifts to separate the "Scenario Title" from the "Conflict Description."
*   **Style:** Use `xl` (1.5rem) corner rounding for scenario cards to make them feel approachable. 

### Emotion & Need Cards
*   **Visuals:** These should use the `tertiary` (soft orange) scale. A card representing a "Need" should use a `tertiary-container` (#814626) background with `on-tertiary-container` text.
*   **Interaction:** On tap/hover, the card should scale slightly (1.02x) and transition to `surface-container-lowest` to simulate "picking it up."

### Buttons
*   **Primary:** A gradient from `primary` to `primary-container`. `full` rounded corners (capsule). 
*   **Secondary:** No fill. A "Ghost Border" (20% opacity `outline-variant`) and `on-secondary-container` text.
*   **Tertiary:** Used for "Empathy Actions." Use `tertiary-fixed` (#ffdbcb) background to provide a warm, inviting glow.

### Facilitator Control Elements
*   **Style:** These should always be anchored in a `surface-container-high` glassmorphic dock. 
*   **Inputs:** Text fields should not have bottom lines. Use a `surface-variant` (#e3e2e2) fill with `md` (0.75rem) rounded corners.

### Chips (Sentiment Markers)
*   Use `secondary-container` (#cbe7f5) for neutral observations and `tertiary-fixed` (#ffdbcb) for high-emotion callouts.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., 24px left, 40px right) for headers to create an editorial, modern feel.
*   **Do** leave "breathing room." If you think there is enough white space, add 20% more.
*   **Do** ensure Thai typography has a line-height of at least 1.6x to prevent character stacking/clashing.

### Don’t:
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#1b1c1c) to maintain a "soft" visual contrast.
*   **Don't** use "Success Green" or "Danger Red." Use the `primary` (teal) for progress and `tertiary` (orange) for items needing attention.
*   **Don't** use standard 1px dividers. If you need to separate content, use a 16px or 24px gap of empty space.

---

## 7. Spacing & Rhythm

*   **Base Unit:** 8px.
*   **Section Spacing:** Use `32px`, `48px`, or `64px` to define major shifts in content.
*   **Component Padding:** Minimum `16px` (md) for internal card padding to ensure Thai script is never cramped.

This system is designed to be felt. Every interaction should feel like a deep breath—deliberate, calm, and supportive.```