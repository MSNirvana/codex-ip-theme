# Flagship runtime patterns

Use these patterns when changing the runtime template or building a theme that goes beyond the generated defaults. They were validated while producing the Tu Xing Ren flagship case.

## 1. Separate image pipelines

- Prepare sidebar/composer characters as transparent PNG assets.
- Preserve a rectangular Hero scene exactly; never send it through white-background removal.
- Hash config, CSS, sidebar, composer, and Hero bytes so any asset can hot reload.
- If no scene is supplied, reuse the prepared transparent character rather than the uncropped source/contact sheet.

## 2. Detect the real home route

Prefer semantic markers and keep a fallback:

```js
const marker = document.querySelector('[data-testid="home-icon"]') ||
  document.querySelector('[data-feature="game-source"]');
const homeMain = marker?.closest('[role="main"]') || null;
```

Apply the home class to the real `[role="main"]` and route classes to `main.main-surface`. Do not infer home state from visible text or the current language.

## 3. Keep route state mutually exclusive

Route changes can reuse the same shell element. Adding the next class without removing the previous one leaves both treatments active.

```js
shell.classList.toggle('ip-theme-home-shell', Boolean(homeMain));
shell.classList.toggle('ip-theme-task-shell', !homeMain);
```

Also remove stale route classes from replaced shell/main nodes during decoration and cleanup.

## 4. Preserve native interaction

- Add only `aria-hidden` copy/decorative nodes.
- Keep all decoration at `pointer-events: none`.
- Style the real suggestion buttons, project selector, composer, and sidebar.
- Never insert a full-window screenshot or cloned fake control layer.
- Do not mutate the native suggestion action or project-selection event handlers.

## 5. Use selector fallbacks

Generated class names may change. Pair structural/class selectors with stable semantic attributes when available.

Project selector example:

```css
[class*="project-selector"],
[data-composer-navigation-target="workspace-project"]
```

Home suggestions can use `[class*="home-suggestions"]`, but validation should count the real descendant buttons instead of trusting the container alone.

## 6. Inspect computed bounds, not only visibility

Codex home containers may include native negative margins such as `-mt-16`. An element can be visible and still overlap the suggestion cards.

During iteration, record `x`, `y`, `width`, and `height` for:

- Hero frame
- Every visible suggestion button
- Project selector / utility bar
- Composer surface

Require a deliberate gap or overlap treatment. If the composer is pulled into the card row, override the responsible native margin in the scoped home layout instead of using arbitrary global transforms.

## 7. Compose the Hero for readability

- Place copy on the visually quiet side of the supplied image.
- Add a strong white-to-transparent gradient behind copy when needed.
- Use a full-scene background on the right and avoid cropping the main character recognition point.
- Keep the title and brand overlay non-interactive; leave native controls live.
- Let cards overlap the bottom of the Hero only when their entire label and click target remain visible.

Validated flagship baseline on a 1238px content surface:

- Hero: about `1152 × 650`
- Cards: four columns on wide layouts
- Composer: full native width below the Hero
- Task wallpaper: about `0.08`–`0.18` opacity with a white mask

Treat these as starting points, not fixed requirements.

## 8. Responsive behavior

- Wide: use four suggestion columns.
- Medium: allow two columns and reduce decorative copy width.
- Narrow: keep 2–6 native suggestions as Codex renders them; hide nonessential badges/characters before compressing controls.
- Require no horizontal overflow at every tested width.
- Vertical scrolling is acceptable when the native composer and cards remain reachable.

Test at least one width in each layout branch. The Tu Xing Ren case was checked at 1180, 900, and 640px.

## 9. Task-page restraint

- Apply a separate task-shell pseudo-element below live content.
- Use the Hero scene with low opacity and a strong background mask.
- Keep message, code, diff, file-card, side-panel, and composer contrast unchanged.
- Validate a populated task, not only an empty route.

## 10. Verification gates

On every route require:

- Installed style and runtime layer
- Layer `pointer-events: none`
- Visible native sidebar and composer
- Visible sidebar/composer character placements
- No horizontal overflow

Additionally on home require:

- Home route class present
- Hero at least `280 × 280`
- Visible injected Hero copy
- 2–6 visible native suggestion buttons
- Visible real project selector

Then test:

1. Home → task transition
2. Task → home transition
3. Full renderer reload
4. One wide and one narrow viewport

Do not mark the theme complete from an injection log alone.
