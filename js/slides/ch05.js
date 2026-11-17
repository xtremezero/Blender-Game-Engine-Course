/* Part II — Chapter 05: Pumpkin Run (31 slides incl. Part II divider) */

SLIDES.push(

{ ch: 5, t: "Part II — Beginner & Intermediate Tutorials", k: "divider", h: `
<div class="div-label">Part</div>
<div class="div-part">II</div>
<div class="div-title">Beginner &amp; Intermediate Tutorials</div>
<div class="div-chapters">
  <span class="chip acc">05 &middot; Pumpkin Run</span>
  <span class="chip">06 &middot; Tube Cleaner</span>
  <span class="chip">07 &middot; Pinball</span>
  <span class="chip">08 &middot; SubRacer</span>
</div>
` },

{ ch: 5, t: "Chapter 05 — Pumpkin Run", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">05</div>
  <div class="ch-info">
    <h1>Pumpkin Run</h1>
    <div class="ch-sub">Environment Modeling &middot; Realtime Materials &middot; Interactivity &middot; Real-time Lighting &middot; Animation &middot; Sound</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will build a complete collect-them-all game</h4>
  <ul>
    <li>Block out and model a small autumn environment</li>
    <li>Author real-time materials with UV textures and normal maps</li>
    <li>Light the scene with a sun key and shadowed fills</li>
    <li>Drive a character with logic bricks, then refine with forces</li>
    <li>Collect pumpkins with properties, collisions, and a Python score</li>
    <li>Animate collectibles and wire satisfying 3D sound</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>31</b> slides</span>
  <span class="ch-stat"><b>~4</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9734&#9734&#9734</b></span>
</div>
` },

{ ch: 5, t: "Project Plan & Scene Blockout", h: `
<h3>Design in one sentence</h3>
<p><em>&ldquo;Run around an autumn yard and collect all pumpkins before the timer ends.&rdquo;</em> One verb (move), one secondary verb (collect), one fail state (timer), one win state (count = total).</p>

<h3>Why blockout first</h3>
<ul>
<li>Gameplay is proven <strong>before</strong> art exists: is the yard fun to run around? Are pumpkins findable?</li>
<li>Use gray boxes only; set the <strong>scale contract</strong>: player &asymp; 1.8 m tall, run speed &asymp; 5 m/s, yard &asymp; 40&times;40 m.</li>
<li>Walk the blockout with your player controller for five minutes <em>before</em> modeling anything pretty.</li>
</ul>

<h3>The production plan</h3>
<div class="flow">
  <span class="fnode hot">Blockout<small>boxes, scale, loop</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Environment<small>ground, fence, props</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Materials<small>UV + normal maps</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Lighting<small>sun + fills + shadows</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Interactivity<small>player + pickups</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Anim + Sound<small>juice</small></span>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Fix the <strong>numbers first</strong>: speed, jump height, collect radius, timer length — on gray boxes. Tuning on finished art is psychologically harder: you will forgive bad gameplay because the scene looks nice.</p></div>
` },

{ ch: 5, t: "Environment — Ground & Terrain", h: `
<h3>Modeling the yard floor</h3>
<ol>
<li>Add a plane, scale to 40&times;40 m — this is your <em>walkable world</em>.</li>
<li>Give it structure: loop cuts (<kbd>Ctrl</kbd>+<kbd>R</kbd>) where you want gentle height variation, then move edge loops in Z + grab for shallow hills.</li>
<li>Keep it <strong>low-poly on purpose</strong>: a runtime terrain is a collision surface first and a visual second.</li>
</ol>

<h3>The two-mesh rule for ground</h3>
<div class="cols2">
  <div class="card hot"><h4>Collision mesh</h4><p>Simple, watertight, static physics. The physics engine never needs to see your art.</p></div>
  <div class="card"><h4>Visual mesh</h4><p>Subdivided, normal-mapped, pretty. Can be denser than collision or even a separate plane offset by 2 cm.</p></div>
</div>

<h3>Texture plan for the ground</h3>
<ul>
<li><strong>One tiled grass/dirt texture</strong> (512&sup2; or 1024&sup2;, seamless — test with the GIMP tile preview from Ch. 02).</li>
<li>Tiling is set on the material: UV coordinates + <em>Extension: Repeat</em> with UV scale &gt; 1 (scale UVs or use texture&rsquo;s sizeX/sizeY).</li>
<li>Break the repeat with a second, blended detail channel or vertex-painted patches.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Visible tiling from a too-small texture stretched over 40 m. Fix by <em>tiling more, blending two scales</em>, not by a single giant texture — 40 m of unique ground at 1 texel/cm would be a 4000&sup2; texture.</p></div>
` },

{ ch: 5, t: "Environment — Fences, Walls & Arrays", h: `
<h3>Repeat geometry, not work</h3>
<h3>Fence run with the Array modifier</h3>
<ol>
<li>Model <strong>one</strong> fence post and <strong>one</strong> plank set.</li>
<li>Add an Array modifier; set <em>Relative Offset X = spacing</em>; add a second modifier (Curve for the fence line, or keep it straight).</li>
<li>For the game: <kbd>Ctrl</kbd>+<kbd>A</kbd> apply, join into one object (<kbd>Ctrl</kbd>+<kbd>J</kbd>), then give it a single Box collision bound.</li>
</ol>

<h3>Wall around the yard</h3>
<ul>
<li>Either low stone walls (array of modules) or the cheap classic: an <em>invisible boundary</em> — a wall mesh with <em>invisible</em> physics flag and no render, so the player simply cannot leave.</li>
<li>Visible boundaries read better: low fences let the eye leave the yard while the body cannot.</li>
</ul>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Prop</th><th>Base primitive</th><th>Key edits</th></tr></thead>
<tbody>
<tr><td>Fence post</td><td>Cube</td><td>Scale tall, bevel top, taper</td></tr>
<tr><td>Plank</td><td>Cube</td><td>Thin scale, slight random tilt (array + slight offsets)</td></tr>
<tr><td>Stone</td><td>Icosphere</td><td>Random scale on instances, flat shading</td></tr>
<tr><td>Tree</td><td>Cylinder + icospheres</td><td>Trunk ring + canopy blobs, alpha-leaf planes</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Join each fence run / wall into <strong>one object</strong> before export. 400 separate picket objects = 400 transforms, bounds and draw submissions; one joined run = 1. Draw calls are the budget that matters (Ch. 13).</p></div>
` },

{ ch: 5, t: "Modeling the Pumpkin", h: `
<h3>Sphere to squash in five moves</h3>
<ol>
<li><kbd>Shift</kbd>+<kbd>A</kbd> &rarr; UV Sphere, 24 segments &times; 16 rings (flow matters for the lobes).</li>
<li><kbd>Ctrl</kbd>+<kbd>R</kbd> vertical loops &times;8 evenly (future lobes).</li>
<li>Select alternating column loops; <kbd>Alt</kbd>+<kbd>S</kbd> (shrink/fatten) outward &mdash; the bulging lobes appear.</li>
<li>Flatten top and bottom (select pole rings, <kbd>S</kbd> <kbd>Z</kbd> <kbd>0</kbd>); add a short cylinder stalk in the top dimple.</li>
<li>Smooth-shade (<kbd>Ctrl</kbd>+<kbd>W</kbd> menu) &mdash; a pumpkin is all curvature.</li>
</ol>

<h3>Production facts for this asset</h3>
<ul>
<li>Poly count target: <strong>&lt; 300 tris</strong> — it will be instanced dozens of times.</li>
<li>Pivot at the <em>base center</em>, sitting on Z=0 — so &ldquo;place on ground&rdquo; is a single click.</li>
<li>Name: <span class="chip acc">prop_pumpkin</span> (mesh) + <span class="chip acc">pumpkin</span> (object); collectible logic will find it by name/property.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Detail budget check: if it reads as a pumpkin in silhouette at gameplay distance, the model is <em>done</em>. Lobes of normal-mapped faking beat lobes of geometry at 30 instances (next slides make the normal map).</p></div>
` },

{ ch: 5, t: "Instancing the Props", h: `
<h3>Filling the yard efficiently</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Method</th><th>Shares mesh?</th><th>Shares logic?</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Linked duplicate <kbd>Alt</kbd>+<kbd>D</kbd></td><td>Yes</td><td>Yes (same object dup = separate bricks)</td><td>Quick prop placement</td></tr>
<tr><td>DupliVerts / DupliFaces</td><td>Yes (virtual)</td><td>No (editor-time only)</td><td>Scatter leaves, stones at edit time</td></tr>
<tr><td>Group instances</td><td>Yes</td><td><strong>Yes</strong></td><td><strong>Collectibles &amp; prefabs</strong></td></tr>
<tr><td>Runtime Add Object actuator</td><td>Yes</td><td>Yes (from template)</td><td>Spawning (Ch. 06+)</td></tr>
</tbody></table></div>

<h3>The collectible prefab pattern (use it now)</h3>
<ol>
<li>Build the pumpkin object <em>with its pickup logic</em> (coming slides).</li>
<li>Group it: <span class="chip acc">grp_pumpkin</span>.</li>
<li>Instance the group around the yard — every instance carries the logic.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Randomize placements <em>meaningfully</em>: cluster some pumpkins (discovery moments), isolate others (exploration payoff). Uniform random scatter reads as noise; designed placement reads as a level.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Decorating with <em>non-shared</em> duplicates then editing the master: half the yard updates, half doesn&rsquo;t. If props must diverge, decide per prop <em>on purpose</em> (make one full copy, rename it).</p></div>
` },

{ ch: 5, t: "UV Unwrapping — Environment", h: `
<h3>Three surfaces, three strategies</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Surface</th><th>Strategy</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Ground</td><td>Top-down <em>Project from View (Bounds)</em> or plain UVs + tiling texture</td><td>Tile repeats; no seams to hide on a plane-ish surface</td></tr>
<tr><td>Fence run</td><td>Unwrap one module; tile along length; or atlas-pack the whole run</td><td>One texture for every plank = one draw call</td></tr>
<tr><td>Props (trees, stones)</td><td>Atlas: many props, one texture sheet</td><td>Atlas = fewer materials = fewer state changes</td></tr>
</tbody></table></div>

<h3>Making the atlas</h3>
<ol>
<li>Select all small props &rarr; <kbd>U</kbd> &rarr; Unwrap.</li>
<li>In the UV editor: select all islands &rarr; <em>UVs &rarr; Pack Islands</em> — automatic efficient layout.</li>
<li>Export the layout (Ch. 02 workflow) and paint every prop on one 1024&sup2; sheet in GIMP.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice — the 3-texture scene</div>
<p>A performance-conscious small scene needs surprisingly few textures: <span class="chip acc">ground_tile</span>, <span class="chip acc">props_atlas</span>, <span class="chip acc">pumpkin</span>. Fewer materials = fewer shader switches; every fence, tree and stone sharing the atlas is the whole trick.</p></div>
` },

{ ch: 5, t: "UV Unwrapping — Pumpkin", h: `
<h3>Spherical object, seam placement</h3>
<ol>
<li>Edit Mode &rarr; select the vertical edge loop hidden at the <em>back</em> (between two lobes) &rarr; <em>Mark Seam</em>.</li>
<li>Also mark a ring seam around the bottom pole area (it faces the ground — invisible).</li>
<li>Select all &rarr; <kbd>U</kbd> &rarr; <strong>Unwrap</strong> (angle-based). The peel flattens into one connected island strip.</li>
<li>Check with a checker texture: lobes should show even checker density, no smearing at poles.</li>
</ol>

<h3>Painting the orange</h3>
<ul>
<li><strong>Base:</strong> saturated orange base with hue variation per lobe (each lobe slightly different &mdash; pumpkins are never uniform).</li>
<li><strong>Vertical creases:</strong> darker strokes at lobe boundaries; bright mid-lobes.</li>
<li><strong>Character:</strong> optional carved face on the front lobe &mdash; this is Pumpkin Run&rsquo;s signature prop.</li>
<li>Leave a lighter <em>ground-contact shadow</em> band at the bottom &mdash; cheap baked AO.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Texture paint mode paints <em>directly on the mesh</em> (Ch. 04 mode matrix) — block in the face on the model, refine in GIMP. Both views in one screen: paint where the seams are invisible.</p></div>
` },

{ ch: 5, t: "Realtime Materials — Shading Mode Decision", h: `
<h3>The project&rsquo;s first engine decision</h3>
<p>From Ch. 03: the scene shading mode decides your decade. For Pumpkin Run choose <span class="chip acc">GLSL</span> — we want per-pixel lighting and shadows on the pumpkins.</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Feature</th><th>Multitexture</th><th>GLSL</th></tr></thead>
<tbody>
<tr><td>Lighting granularity</td><td>Per-vertex</td><td>Per-pixel</td></tr>
<tr><td>Shadow support</td><td>None / buffers only</td><td>Shadow maps (sun/spot)</td></tr>
<tr><td>Normal maps</td><td>No (approximate)</td><td>Yes, tangent-space</td></tr>
<tr><td>Specular control</td><td>Limited</td><td>Full (spec color, hardness per-pixel)</td></tr>
<tr><td>Custom shaders</td><td>No</td><td>Yes (Ch. 08)</td></tr>
<tr><td>Hardware floor</td><td>Anything</td><td>GLSL-capable GPU (anything modern)</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Building all materials in Multitexture, switching to GLSL at the end: spec/normal channels silently change meaning and the art pass happens twice. Set GLSL in <em>World properties &rarr; Game &rarr; Shading</em> before texturing anything.</p></div>
` },

{ ch: 5, t: "Materials — Diffuse & Specular Setup", h: `
<h3>The four surfaces of Pumpkin Run</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Material</th><th>Diffuse model</th><th>Spec model</th><th>Values</th></tr></thead>
<tbody>
<tr><td>mat_ground</td><td>Lambert</td><td>CookTorr, low</td><td>Spec 0.15 / Hard 10 &mdash; soil is matte</td></tr>
<tr><td>mat_fence_wood</td><td>Lambert</td><td>Phong, medium</td><td>Spec 0.25 / Hard 30 &mdash; dry wood sheen</td></tr>
<tr><td>mat_pumpkin</td><td>Lambert</td><td>Phong, waxy</td><td>Spec 0.45 / Hard 60 &mdash; waxy skin, tight highlight</td></tr>
<tr><td>mat_leaf (alpha)</td><td>Lambert</td><td>none</td><td>Spec 0 + Alpha Clip</td></tr>
</tbody></table></div>

<h3>Why these numbers</h3>
<ul>
<li><strong>Hardness = highlight tightness</strong> (Ch. 03). Waxy pumpkin skin: tight, bright. Soil: broad, dim. The eye reads <em>material</em> from this pair faster than from color.</li>
<li>Keep <strong>ambient &le; 0.2</strong> — flat ambient kills the sun-and-shadow look we build next.</li>
<li>Zero <strong>emit</strong> on everything here; emission is for self-lit props (lanterns) only.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Judge materials <em>in the runtime</em>, with final lighting, at final camera distance. A specular that sings in the viewport preview can vanish (or glare) in-game — only <kbd>P</kbd> tells the truth.</p></div>
` },

{ ch: 5, t: "Texture Channels & Blend Modes", h: `
<h3>One material, multiple maps, one stack</h3>
<div class="flow">
  <span class="fnode hot">Channel 1: Diffuse<small>UV &middot; Color blend</small></span><span class="farrow">+</span>
  <span class="fnode">Channel 2: Normal<small>UV &middot; Normal blend</small></span><span class="farrow">+</span>
  <span class="fnode">Channel 3: Spec/Emit<small>UV &middot; mix by map</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Final material</span>
</div>

<h3>The influence panel — what each channel writes</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Map</th><th>Influence checkboxes</th><th>Pumpkin values</th></tr></thead>
<tbody>
<tr><td>diffuse.png</td><td>Diffuse &rarr; Color</td><td>default mix</td></tr>
<tr><td>normal.png</td><td>Geometry &rarr; Normal</td><td>Normal map space: <strong>Tangent</strong></td></tr>
<tr><td>glow.png (face)</td><td>Diffuse &rarr; Emit (masked)</td><td>carved-face glow at night</td></tr>
</tbody></table></div>

<ul>
<li><strong>Blend type per channel:</strong> Mix (default), Multiply (dirt), Add (glow), Overlay/Lighten for variety.</li>
<li>Order matters for stacked blends: diffuse base, then modifiers <em>above</em> it.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Normal map texture set to <em>Color</em> influence instead of <em>Normal</em> — the object turns rainbow-noise colored. The classic &ldquo;my model is possessed&rdquo; screenshot. Channel purpose is chosen in <em>Influence</em>, not by filename.</p></div>
` },

{ ch: 5, t: "Normal Maps — Faking Depth", h: `
<h3>Why the pumpkin gets away with 300 tris</h3>
<p>A <strong>normal map</strong> stores per-pixel surface slope, tilting the lighting math without adding geometry. Rivets, creases, pumpkin lobes&rsquo; crevices — free at render time, invisible to physics.</p>

<h3>Two ways to make one</h3>
<div class="cols2">
  <div class="card">
    <h4>Bake from detail mesh</h4>
    <ol>
    <li>Duplicate the pumpkin; sculpt deep lobes/wrinkles (or subdivide + displace).</li>
    <li>Original low-poly UVs stay; bake: mark high-res, <em>Bake &rarr; Normals &rarr; Selected to Active</em>.</li>
    <li>Result: a tangent-space normal map matched to your unwrap.</li>
    </ol>
  </div>
  <div class="card">
    <h4>Generate from a height map</h4>
    <ol>
    <li>Paint a grayscale height map (crevices dark, ridges bright) in GIMP.</li>
    <li>Use GIMP&rsquo;s <em>Normalmap plugin</em> or a converter &rarr; normal map.</li>
    <li>Faster, art-directable, slightly less accurate at silhouettes.</li>
    </ol>
  </div>
</div>

<h3>Reading normal map colors</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Channel</th><th>Axis</th><th>&ldquo;Flat&rdquo; value</th></tr></thead>
<tbody>
<tr><td>R</td><td>tangent U</td><td>0.5</td></tr>
<tr><td>G</td><td>tangent V</td><td>0.5</td></tr>
<tr><td>B</td><td>surface normal</td><td>1.0 (that&rsquo;s why they look <em>blue</em>)</td></tr>
</tbody></table></div>
` },

{ ch: 5, t: "Lighting — The Sun Key Light", h: `
<h3>Autumn late afternoon in one lamp</h3>
<ol>
<li><kbd>Shift</kbd>+<kbd>A</kbd> &rarr; Sun, name <span class="chip acc">sun_key</span>.</li>
<li>Rotate to &asymp; 45&deg; elevation from the south-west — long shadows, warm feel.</li>
<li>Energy &asymp; 1.2, warm white color (slight orange: RGB 1.0, 0.95, 0.85).</li>
<li><strong>Shadows:</strong> enable <em>Shadow buffer</em> (or ray for GLSL where supported); buffer size 1024; softness 2&ndash;3 samples.</li>
</ol>

<h3>World ambient — the shadowless half</h3>
<ul>
<li><em>World properties &rarr; Ambient Color</em>: a cool dusk blue at low energy (0.1&ndash;0.15).</li>
<li>The classic outdoor recipe: <strong>warm key + cool ambient</strong> = instant believable daylight; both halves of every shadow carry information.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Shadow buffer resolution is a budget: 1024&sup2; per shadow-casting lamp is fine for this yard; 4096&sup2; on a fence post is waste. And only lamps that <em>need</em> shadows cast them — one shadowed sun beats five shadowed fills.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Moving a Sun lamp&rsquo;s <em>position</em> to change shadows. Sun light is directional — only <strong>rotation</strong> matters. Dragging it around the yard does nothing (Ch. 02&rsquo;s fact, now load-bearing).</p></div>
` },

{ ch: 5, t: "Lighting — Fills, Points & Spots", h: `
<h3>The three-point yard</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Lamp</th><th>Type</th><th>Job</th><th>Shadows</th></tr></thead>
<tbody>
<tr><td>sun_key</td><td>Sun</td><td>Warm key, direction of all shadows</td><td>Yes (1024 buffer)</td></tr>
<tr><td>lamp_yard_fill</td><td>Hemi or weak Sun</td><td>Lift shadow side, no shadows of its own</td><td>No</td></tr>
<tr><td>lamp_porch</td><td>Point</td><td>Local pool of warm light near the house</td><td>No (expensive)</td></tr>
<tr><td>spot_moon</td><td>Spot</td><td>Optional: rim/backlight on the player path</td><td>Optional</td></tr>
</tbody></table></div>

<h3>Lamp physics that matter at runtime</h3>
<ul>
<li><strong>Distance:</strong> where a Point/Spot fades to zero — set it tight; overlapping bright fields wash out contrast and cost shader time (GLSL loops lights per pixel).</li>
<li><strong>Attenuation / falloff:</strong> quadratic default reads physically; linear reads &ldquo;video game cozy.&rdquo;</li>
<li><strong>GLSL light budget:</strong> each per-pixel light multiplies fragment cost. This scene: 1 sun + 1 hemi + 1 point = comfortable.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Tune lighting <em>as a system</em>: mute all but the key, look; add fills one at a time, look. If a scene only works with all lamps on, you don&rsquo;t know which one is doing the work — and you can&rsquo;t fix it when it breaks.</p></div>
` },

{ ch: 5, t: "Interactivity — Player Physics Setup", h: `
<h3>The actor recipe</h3>
<p>Player object: a simple capsule or box, named <span class="chip acc">player</span>. Physics tab:</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Value</th><th>Reason</th></tr></thead>
<tbody>
<tr><td>Physics Type</td><td>Dynamic</td><td>Full rigid body, driven by forces</td></tr>
<tr><td>Actor</td><td>&#10003</td><td>Can be seen by Near/Radar sensors</td></tr>
<tr><td>Ghost</td><td>&#10005</td><td>We want solid ground contact</td></tr>
<tr><td>Mass</td><td>60</td><td>Kilograms — human-scale</td></tr>
<tr><td>Radius</td><td>0.4</td><td>With a 1.8 m box &rarr; capsule-ish feel</td></tr>
<tr><td>Bounds &rarr; Box</td><td>on mesh? No — <em>Box</em></td><td>Convex, cheap, stable on flat ground</td></tr>
<tr><td>Damping: translation / rotation</td><td>0.1 / 0.9</td><td>Kills spin, keeps slides controllable</td></tr>
<tr><td>Lock Z rotation? &rarr; Rot lock Z</td><td>&#10003</td><td>Character shouldn&rsquo;t tumble (upright agent)</td></tr>
<tr><td>Force field / anisotropic friction</td><td>defaults</td><td>&mdash;</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Using a <strong>triangle-mesh bound</strong> on a dynamic player. Bullet forbids it for moving bodies (it&rsquo;s static-only collision); you get silent fallbacks or tunneling. Dynamics get convex bounds: Box, Sphere, Cylinder, Convex Hull.</p></div>
` },

{ ch: 5, t: "Player Movement — Logic Bricks v1", h: `
<h3>Four brick columns, WASD + arrows</h3>
<div class="flow">
  <span class="fnode hot">Keyboard W<small>+ AND + Motion</small></span>
  <span class="fnode hot">Keyboard S<small>&minus; local Y</small></span>
  <span class="fnode hot">Keyboard A<small>Rot Z +</small></span>
  <span class="fnode hot">Keyboard D<small>Rot Z &minus;</small></span>
  <span class="farrow">&rarr;</span>
  <span class="fnode">player moves / turns</span>
</div>

<h3>Motion actuator — Simple Motion fields</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Column</th><th>dLoc</th><th>dRot</th></tr></thead>
<tbody>
<tr><td>W</td><td>X 0, Y <strong>0.15</strong>, Z 0</td><td>&mdash;</td></tr>
<tr><td>S</td><td>Y <strong>&minus;0.08</strong></td><td>&mdash;</td></tr>
<tr><td>A</td><td>&mdash;</td><td>Z <strong>+1.5&deg;</strong></td></tr>
<tr><td>D</td><td>&mdash;</td><td>Z <strong>&minus;1.5&deg;</strong></td></tr>
</tbody></table></div>
<ul>
<li>Move along <strong>local Y</strong> so the player goes where it faces (tank controls). Local axes: the &ldquo;L&rdquo; toggle on the Motion actuator.</li>
<li><kbd>Shift</kbd>-click extends multiple sensor links; use one AND per column for readability.</li>
</ul>

<div class="callout note"><div class="co-label">&#9432 Note — why this is only v1</div>
<p>dLoc/dRot per frame is frame-rate dependent (Ch. 02) and ignores mass. It proves the loop; the next slide replaces it with forces &mdash; the production version.</p></div>
` },

{ ch: 5, t: "Player Movement — Forces & Servo v2", h: `
<h3>Physics-correct movement</h3>
<div class="cols2">
<div>
<h4>Force mode (dynamic bodies)</h4>
<ul>
<li>Motion actuator &rarr; <strong>Force</strong> fields: W &rarr; local Y force &asymp; 120 N (60 kg &times; 2 m/s&sup2;).</li>
<li>Forces integrate through mass &mdash; collisions push you around believably.</li>
<li>Downside: ice-skating. Solution &rarr; damping (set 0.1 earlier) or Servo.</li>
</ul>
</div>
<div>
<h4>Servo control (the pro option)</h4>
<ul>
<li>Motion actuator &rarr; <strong>Servo Control</strong>: a PID-style velocity servo.</li>
<li>Target: <span class="chip acc">ref object: player, L (local), linV Y = 5.0</span>.</li>
<li>Force cap &asymp; 200; the controller accelerates <em>to</em> 5 m/s and stops pushing — no skating, no frame-rate dependence.</li>
</ul>
</div>
</div>

<h3>Jump (v2.5)</h3>
<ol>
<li>Keyboard <kbd>Space</kbd> sensor &rarr; AND &rarr; Motion <strong>dLoc Z 0</strong>? No &mdash; use <strong>Force Z &asymp; 400 N</strong>, impulse-like.</li>
<li>Gate it with a <em>Ray sensor</em> pointing down (range 1.2 m) so you can&rsquo;t air-jump: Keyboard AND Ray &rarr; Jump force.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Movement feel = mass + damping + force caps, tuned together. Change one, re-test. Write the final numbers into your conventions text block — &ldquo;why does the sequel&rsquo;s player feel different&rdquo; is a real question these numbers answer.</p></div>
` },

{ ch: 5, t: "Camera — Follow Setups", h: `
<h3>Three standard relationship patterns</h3>
<div class="cols3">
  <div class="card"><h4>Parented</h4><p>Camera is a child of player. Rigid, arcade, zero logic. Rotates <em>with</em> the player (first-person feel).</p></div>
  <div class="card hot"><h4>Track To</h4><p>Camera floats (parented to a rig or free) + <em>Track To</em> constraint aiming at the player. Classic third-person chase.</p></div>
  <div class="card"><h4>Camera actuator</h4><p><em>Camera actuator</em> on the player: follow + height + min/max distance + damping. Engine-side chase cam, no rig needed.</p></div>
</div>

<h3>The Pumpkin Run camera</h3>
<ol>
<li>Camera at player&rsquo;s back offset: position it at (0, &minus;6, 3) relative to a <span class="chip acc">cam_rig</span> empty.</li>
<li>cam_rig parents to player (or use Camera actuator: height 3, distance 6, damping 8).</li>
<li><em>Track To</em> constraint (or the actuator&rsquo;s implicit aim) keeps the player framed.</li>
</ol>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Camera clipping through the fence/trees. Either raise it, or accept the classic era solution: design sightlines so the chase path stays clear (soft lock). Modern engines solve this with raycast collision cameras — you can prototype that with a Ray sensor + Python in one afternoon with Ch. 06 skills.</p></div>
` },

{ ch: 5, t: "Collectibles — Properties & Setup", h: `
<h3>Game state starts here</h3>
<p>Every pumpkin carries its identity as <strong>properties</strong> (Ch. 03 data model). On the pumpkin object:</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Type</th><th>Value</th><th>Used by</th></tr></thead>
<tbody>
<tr><td>item</td><td>String</td><td>"pumpkin"</td><td>Generic pickup detection</td></tr>
<tr><td>value</td><td>Integer</td><td>1</td><td>Score increment</td></tr>
<tr><td>taken</td><td>Bool</td><td>False</td><td>Prevents double-pickup</td></tr>
</tbody></table></div>

<p>On the <strong>player</strong> (or a dedicated <span class="chip acc">game_state</span> object):</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Type</th><th>Value</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>score</td><td>Integer</td><td>0</td><td>Pumpkins collected</td></tr>
<tr><td>total</td><td>Integer</td><td>&lt;count&gt;</td><td>Win threshold</td></tr>
<tr><td>time_left</td><td>Timer</td><td>90</td><td>Counts down automatically (see slide 26)</td></tr>
</tbody></table></div>

<div class="callout term"><div class="co-label">&#9670 Term — Timer property</div>
<p>A Float that the engine <em>counts</em> automatically — up from 0 (default) or down if you set a positive value. Reads as a plain float in logic and Python. The cheapest possible game clock.</p></div>
` },

{ ch: 5, t: "Collectibles — Pickup Logic (Bricks)", h: `
<h3>The pumpkin&rsquo;s own brain</h3>
<div class="flow">
  <span class="fnode hot">Near or Touch sensor<small>radius 1.2 m / player collision</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Property: taken == False<small>AND gate</small></span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">THEN</span>
    <span class="fnode">Message: "pickup"<small>body: value</small></span>
    <span class="fnode">Edit Object: End self</span>
  </div>
</div>

<h3>Wiring details</h3>
<ol>
<li><strong>Sensor choice:</strong> Touch (physics contact, needs no radius) is cheapest; Near (sphere, works even through thin air) is friendlier — pick &ldquo;generous&rdquo; for collectibles.</li>
<li><strong>Property sensor</strong> <span class="chip acc">taken == False</span> ANDs with it, so the window between touch and end-frame can&rsquo;t double-count.</li>
<li><strong>Message actuator</strong> sends subject <span class="chip acc">pickup</span> to <em>game_state</em> — the scorer doesn&rsquo;t know or care <em>which</em> pumpkin scored (decoupling from Ch. 03).</li>
<li><strong>Edit Object &rarr; End Object</strong> removes the pumpkin this tick.</li>
</ol>

<h3>On game_state (the receiver)</h3>
<ul>
<li>Message sensor (subject: <span class="chip acc">pickup</span>) &rarr; AND &rarr; <strong>Property actuator: Add, score, 1</strong>.</li>
<li>Property sensor <span class="chip acc">score == total</span> &rarr; Scene actuator <em>Set: scene_win</em>.</li>
</ul>
` },

{ ch: 5, t: "The Python Score Controller", h: `
<h3>Same logic, one honest script</h3>
<p>Replace the game_state bricks with a Python controller (module flavor &mdash; Ch. 03 best practice):</p>
<pre data-lang="python"><code># score.py -- module controller on game_state
# Controller type: Module  "score.update"  (Always sensor, level)
import bge

def update():
    cont = bge.logic.getCurrentController()
    own  = cont.owner

    # 1) consume any queued pickup messages
    for msg_sensor in cont.sensors:
        if isinstance(msg_sensor, bge.types.KX_NetworkMessageSensor) and msg_sensor.positive:
            for body in msg_sensor.bodies:
                own["score"] += int(body or 1)
                print("picked up! score =", own["score"])

    # 2) win check
    if own["score"] &gt;= own["total"]:
        bge.logic.sendMessage("game_won")            # listeners react (HUD, music)
        scene = bge.logic.getCurrentScene()
        scene.replace("scene_win")                   # load the win screen</code></pre>

<h3>What this buys over bricks</h3>
<ul>
<li>One readable place for the rules &mdash; scoring changes are edits, not re-wiring.</li>
<li><span class="chip acc">sendMessage</span> keeps systems decoupled exactly like the brick version did.</li>
<li>print() goes to the console &mdash; open <em>Window &rarr; Toggle System Console</em> (Win) to watch it live.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Keep sensors as bricks (they&rsquo;re genuinely good at wiring), but graduate <em>rules</em> to Python early. Bricks encode topology; scripts encode policy.</p></div>
` },

{ ch: 5, t: "Animation — Bobbing Collectibles", h: `
<h3>The 30-second idle animation</h3>
<p>Static pumpkins look dead. A gentle bob + spin is the cheapest possible &ldquo;alive&rdquo;:</p>
<ol>
<li>With <span class="chip acc">prop_pumpkin</span> selected, insert a <strong>Loc keyframe</strong>: frame 1 at Z=0.05.</li>
<li>Frame 15: Z=0.35 &rarr; key. Frame 30: back to Z=0.05 &rarr; key.</li>
<li>Add rotation: frame 1 Z-rot 0&deg;, frame 30 Z-rot 360&deg; &rarr; key (&ldquo;linear&rdquo; interpolation so spin is constant).</li>
<li>Set the action&rsquo;s end frame to 30 and name it <span class="chip acc">act_pickup_bob</span>.</li>
<li>In the IPO/curve editor make the bob curves <em>smooth sine-ish</em> (bezier handles) and the spin <em>linear</em>.</li>
</ol>

<div class="callout note"><div class="co-label">&#9432 Note — object vs. mesh animation</div>
<p>This is <strong>object-level</strong> animation (the whole object transforms). Character limb animation (Ch. 10) is <strong>armature/bone</strong> animation. The Action actuator plays both identically &mdash; the engine doesn&rsquo;t care what the curves drive.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Keyframing a <em>dynamic</em> object: physics and animation fight over the transform (physics writes it every frame). Animated props &rarr; <strong>Ghost</strong> or No-Collision physics. Only one owner per transform.</p></div>
` },

{ ch: 5, t: "Action Actuator — Playback Modes", h: `
<h3>Playing the bob on every pumpkin</h3>
<p>On the pumpkin prefab: <span class="chip acc">Always sensor (level)</span> &rarr; AND &rarr; <strong>Action actuator</strong>:</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Value</th><th>Note</th></tr></thead>
<tbody>
<tr><td>Action</td><td>act_pickup_bob</td><td>By name &mdash; shared across instances</td></tr>
<tr><td>Start / End</td><td>1 / 30</td><td>Sub-range of the clip is legal</td></tr>
<tr><td>Blendin</td><td>5</td><td>Fades between previous pose and this clip</td></tr>
<tr><td>Priority</td><td>0</td><td>Lower wins when two actuators compete</td></tr>
<tr><td>Mode</td><td><strong>Loop End</strong></td><td>See table below</td></tr>
<tr><td>Layer / Layer weight</td><td>0 / 1.0</td><td>Animation layers (Ch. 10 uses 2 layers)</td></tr>
<tr><td>Frame property</td><td>anim_frame</td><td>Optional: writes current frame into a property</td></tr>
</tbody></table></div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Play mode</th><th>Behavior</th><th>Pumpkin?</th></tr></thead>
<tbody>
<tr><td>Play</td><td>Once, stop at end</td><td>&mdash;</td></tr>
<tr><td>Loop End</td><td>Repeat, restart at start</td><td>bob: maybe</td></tr>
<tr><td>Loop Stop</td><td>Repeat, resume where paused</td><td>&mdash;</td></tr>
<tr><td>Flipper (Ping-pong)</td><td>Forward then backward then&hellip;</td><td><strong>bob: yes</strong> (or make it loopable)</td></tr>
<tr><td>Property</td><td>Frame driven by a property value</td><td>Ch. 06 turret aim uses this</td></tr>
</tbody></table></div>
` },

{ ch: 5, t: "Sound — Actuator & 3D Audio", h: `
<h3>Three sounds this game needs</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Event</th><th>Sound</th><th>Trigger</th></tr></thead>
<tbody>
<tr><td>Pickup</td><td>pop.wav (short, bright)</td><td>Same pulse as the End Object actuator</td></tr>
<tr><td>Ambient</td><td>yard_loop.wav (wind, birds)</td><td>Always sensor on game_state, Loop</td></tr>
<tr><td>Win jingle</td><td>win.wav</td><td>Message sensor: game_won</td></tr>
</tbody></table></div>

<h3>Sound actuator anatomy</h3>
<ul>
<li><strong>3D sound:</strong> enable &rarr; the sound plays <em>from the object&rsquo;s position</em> in the listener&rsquo;s (camera&rsquo;s) ears: distance rolloff + (optionally) Doppler and cone.</li>
<li><strong>Modes:</strong> Play (one-shot), Loop End/Stop, Loop Bidirectional. Volume 0&ndash;1, Pitch 0&ndash;1 relative (great for variation: random pitch +0.1&ndash;0.2).</li>
<li>Format note: WAV is the native runtime sample; OGG for music loops (compressed, streamed).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Sounds are <em>feedback</em>, not decoration. Wire pickup sound + the pickup pop animation into the same pulse so they land on the same frame. 30 ms of desync between &ldquo;see it&rdquo; and &ldquo;hear it&rdquo; reads as cheap; same-frame reads as crisp.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Silence in-game despite correct wiring: the sound file wasn&rsquo;t found at runtime (absolute path) or the .wav is a format the mixer rejects (use 16-bit PCM, not 24-bit/exotic). Test sounds in the standalone player too (Ch. 02 packaging rules).</p></div>
` },

{ ch: 5, t: "Game Feel — The Polish Pass", h: `
<h3>Turn &ldquo;works&rdquo; into &ldquo;feels good&rdquo;</h3>
<div class="cols2">
<div>
<h4>Already in place</h4>
<ul>
<li>&#10003 Responsive forces + damping (movement has weight)</li>
<li>&#10003 Bobbing, spinning pickups (world is alive)</li>
<li>&#10003 Same-frame audio (crisp feedback)</li>
<li>&#10003 Warm key + cool ambient (readable depth)</li>
</ul>
</div>
<div>
<h4>The polish checklist</h4>
<ul>
<li><strong>Pickup pop:</strong> a 5-frame scale-up + fade &mdash; a second action played before End Object (Delay sensor 5 ticks after pickup).</li>
<li><strong>Counter HUD:</strong> overlay scene + text object showing <span class="chip acc">score / total</span> (full recipe: Ch. 06).</li>
<li><strong>Timer tension:</strong> wind loop pitch rises in the last 15 s (Property sensor on time_left + Sound actuator pitch).</li>
<li><strong>Spawn celebration:</strong> win scene with camera orbit (Action on a camera rig &mdash; same bob workflow).</li>
</ul>
</div>
</div>

<div class="callout tip"><div class="co-label">&#9733 Tip — the 5-minute playtest rule</div>
<p>Hand the keyboard to someone and <em>say nothing</em>. Where they hesitate, the game failed to communicate. Pumpkin Run&rsquo;s job: within 10 seconds the player should move, see a pumpkin, want it, and get a reward. That loop <em>is</em> the game.</p></div>
` },

{ ch: 5, t: "Performance — This Project&rsquo;s Budget", h: `
<h3>Read your own profiler</h3>
<p>Enable <em>Game &rarr; Show Framerate &amp; Profile</em> and compare against a 16.6 ms frame (Ch. 03):</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Metric</th><th>Healthy for this scene</th><th>If over &rarr;</th></tr></thead>
<tbody>
<tr><td>Logic time</td><td>&lt; 3 ms</td><td>Set Near sensors to Frequency 2&ndash;3; they needn&rsquo;t poll every tick</td></tr>
<tr><td>Physics</td><td>&lt; 3 ms</td><td>Too many dynamic bodies? Pumpkins can be <em>ghost</em> pickups (no sim cost)</td></tr>
<tr><td>Animations</td><td>&lt; 2 ms</td><td>One shared action for all pumpkins; avoid per-instance unique clips</td></tr>
<tr><td>Render</td><td>&lt; 6 ms</td><td>Count draw calls: joined fence = 1; atlas materials = few shader switches</td></tr>
</tbody></table></div>

<h3>Texture memory audit</h3>
<div class="stats">
  <div class="stat"><b>3</b><span>textures</span></div>
  <div class="stat"><b>&lt;7 MB</b><span>VRAM total</span></div>
  <div class="stat"><b>1024&sup2;</b><span>largest map</span></div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>The habits this project installed &mdash; shared meshes, atlas materials, joined runs, one shadowed lamp, frequency-skipped sensors &mdash; are the same habits Chapter 13 formalizes. You&rsquo;re already doing them.</p></div>
` },

{ ch: 5, t: "Exporting the Standalone Player", h: `
<h3>Ship it</h3>
<ol>
<li>Package check: textures packed or relative-pathed, sounds present (Ch. 02 rules).</li>
<li><em>File &rarr; Export &rarr; Save As Runtime</em> &rarr; <span class="chip acc">pumpkin_run.exe</span> (platform-matched player).</li>
<li>Test on a clean machine: fonts, paths, audio device, fullscreen key behaviors.</li>
</ol>

<h3>Runtime facts to know</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Topic</th><th>Fact</th></tr></thead>
<tbody>
<tr><td>Start screen</td><td>Scene order in the scene list defines the first scene; make it a title scene</td></tr>
<tr><td>Fullscreen</td><td>World &rarr; Start New Game Fullscreen / resolution settings bake into the player</td></tr>
<tr><td>Quit</td><td>Keyboard Esc sensor + <em>Game actuator: Quit Game</em> &mdash; the polite exit</td></tr>
<tr><td>Framing</td><td>Camera + scene resolution at export time; don&rsquo;t rely on the editor window size</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Shipping with the <em>hidden prefab layers visible</em> (Ch. 04 lesson, now runtime-critical): every template object on a visible layer goes live at frame one. Pre-export ritual: toggle all layers once, verify only L1 is live.</p></div>
` },

{ ch: 5, t: "Chapter 05 — Pitfalls & Best Practices", h: `
<h3>The complete review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Art before play.</strong> A gorgeous yard with no game loop is a screensaver. Blockout &rarr; play &rarr; art, always in that order.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Physics fighting animation.</strong> Animated pickups must be ghost/no-collision; dynamics must not be keyframed. One owner per transform.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Score bugs from double pickups.</strong> Touch can fire twice before End Object lands. The <span class="chip acc">taken</span> property gate is not optional.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Skating movement.</strong> dLoc with no damping. Move to Servo control or forces + damping; tune, don&rsquo;t tolerate.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Decouple with messages:</strong> pickups announce, the scorer decides. Adding a coin type later = one more sender, zero scorer changes.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Shared everything:</strong> one pumpkin mesh, one bob action, one atlas texture, one material &mdash; instanced N times.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Warm key + cool ambient</strong> as the default outdoor lighting recipe; add fills one at a time.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Playtest silently</strong> every milestone; fix communication first, visuals second.</p></div>
</div>
</div>
` },

{ ch: 5, t: "Chapter 05 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Second collectible:</strong> golden pumpkin (value 5) with its own mesh/material but the <em>same</em> pickup logic &mdash; prove your decoupling by not touching the scorer.</li>
<li><strong>Timed mode:</strong> use the Timer property to end the game at 0 with a &ldquo;time up&rdquo; scene. Bonus: show remaining seconds on an overlay HUD.</li>
<li><strong>Sprint key:</strong> Shift doubles the servo target speed (5&rarr;9 m/s) while held &mdash; one Property + one extra actuator column.</li>
<li><strong>Day-night:</strong> animate the Sun&rsquo;s rotation with an Action; the yard&rsquo;s shadows sweep like time-lapse.</li>
<li><strong>Refactor:</strong> port the player&rsquo;s four brick columns to a single Python module (<span class="chip acc">player.update()</span>) reading <span class="chip acc">bge.logic.keyboard</span> directly.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Block out, model, and instance a complete game environment &#10003;</li>
<li>Author GLSL-era materials with diffuse + normal channels &#10003;</li>
<li>Light with a key/fill/ambient system and runtime shadows &#10003;</li>
<li>Build physics-driven player control with forces and servo &#10003;</li>
<li>Wire pickups, scoring, actions, and 3D sound &mdash; and export a playable &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 06 aims down a tube: model loading, a gun that follows your mouse, projectiles, spawning enemies, and state machines. Your first shooter &mdash; mechanically deeper, same architecture.</p></div>
` }

);
