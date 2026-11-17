/* Part I — Chapter 02: Quickstart (16 slides) */

SLIDES.push(

{ ch: 2, t: "Chapter 02 — Quickstart", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">02</div>
  <div class="ch-info">
    <h1>Quickstart</h1>
    <div class="ch-sub">Simple Face Mapping &middot; Using 2D Applications — from empty scene to first interactive runtime in one sitting</div>
  </div>
</div>
<div class="ch-goals">
  <h4>In this chapter you will</h4>
  <ul>
    <li>Map a 2D face image onto a 3D mesh (the classic &ldquo;face mapping&rdquo; exercise)</li>
    <li>Meet the UV/Image Editor, materials, and real-time shading modes</li>
    <li>Wire your first logic: a sensor, a controller, and an actuator</li>
    <li>Run the engine with <kbd>P</kbd> and understand what happens when you do</li>
    <li>Use 2D applications (GIMP) to author and alpha-cut textures</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>16</b> slides</span>
  <span class="ch-stat"><b>~45</b> minutes</span>
  <span class="ch-stat">difficulty <b>&#9733&#9734&#9734&#9734&#9734</b></span>
</div>
` },

{ ch: 2, t: "What Is Face Mapping?", h: `
<h3>The core idea</h3>
<p>A 3D model is blind. Surfaces have no idea what color they are until you <em>project a 2D image onto them</em>. <strong>Face mapping</strong> is the simplest possible version of that projection: take a flat image of a face, take a flat mesh (a plane), and glue the image onto the mesh using <em>UV coordinates</em>.</p>

<div class="flow">
  <span class="fnode">2D image<small>pixels in a grid</small></span><span class="farrow">+</span>
  <span class="fnode">UV coordinates<small>per-vertex 2D addresses</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Textured surface<small>rendered in 3D</small></span>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — UV Coordinates</div>
<p>Every mesh vertex can carry a 2D coordinate <em>(u, v)</em> in the range 0&ndash;1 that points into an image, like a street address into a city map. <strong>U</strong> is the horizontal axis, <strong>V</strong> the vertical (W is used for 3D/procedural textures). &ldquo;Unwrapping&rdquo; is the act of computing those addresses.</p></div>

<h3>Why start here?</h3>
<ul>
<li>It exercises the whole pipeline — mesh, image, material, camera, light, logic, runtime — in miniature.</li>
<li>Every production asset you will ever make repeats this exact pattern at larger scale.</li>
</ul>
` },

{ ch: 2, t: "Step 1 — Scene Setup", h: `
<h3>A clean stage</h3>
<ol>
<li>Open a new file (<kbd>Ctrl</kbd>+<kbd>N</kbd>). You get the default scene: a cube, a camera, a lamp.</li>
<li>Select the cube with <kbd>RMB</kbd> and delete it: <kbd>X</kbd> &rarr; <em>Delete</em>.</li>
<li>Keep the camera and lamp — you will reposition them shortly.</li>
</ol>

<h3>Why delete the default cube?</h3>
<p>In the BGE era, <em>everything in visible layers gets processed by the runtime</em> — geometry, lamps, logic. Starting clean builds the habit of shipping scenes that contain only what the game needs.</p>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Save immediately as <span class="chip acc">quickstart_face.blend</span> and hit <kbd>Ctrl</kbd>+<kbd>S</kbd> obsessively. The game engine has no autosave, and a crash mid-logic-wiring loses all unsaved brick setup.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Deleting the <em>camera</em> along with the cube. Without a camera the runtime renders nothing — and beginners often think the engine is broken. The camera is the runtime&rsquo;s single point of view.</p></div>
` },

{ ch: 2, t: "Step 2 — The Plane and the UV Editor", h: `
<h3>Create the canvas</h3>
<ol>
<li><kbd>Shift</kbd>+<kbd>A</kbd> &rarr; <em>Mesh &rarr; Plane</em> — add a plane at the 3D cursor.</li>
<li>The plane has 4 vertices, 4 edges, 1 face: the minimal surface that can carry an image.</li>
</ol>

<h3>Split the screen for 2D work</h3>
<ul>
<li>Drag the editor&rsquo;s corner grip (top-left) to the right, or use the editor-type dropdown and change one editor to <em>UV/Image Editor</em>.</li>
<li>You now have the classic texturing layout: 3D viewport on one side, image space on the other.</li>
</ul>

<div class="cols2">
  <div class="card">
    <h4>3D Viewport</h4>
    <p>Where geometry lives. You will see the plane in perspective with its default gray material.</p>
  </div>
  <div class="card">
    <h4>UV/Image Editor</h4>
    <p>Where texture space lives. Open images here, and view the mesh&rsquo;s flattened UV layout over the image.</p>
  </div>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — UV/Image Editor</div>
<p>The 2D editor that displays texture images and the unwrapped &ldquo;net&rdquo; of your mesh. Editing UVs here while watching the 3D viewport update live is the core texturing workflow of every chapter that follows.</p></div>
` },

{ ch: 2, t: "Step 3 — Load the Face Image", h: `
<h3>Open the image into UV space</h3>
<ol>
<li>In the UV/Image Editor: <em>Image &rarr; Open Image</em> — pick a face photo (front-facing, evenly lit).</li>
<li>The image is now <em>available to the scene</em> but nothing uses it yet — data vs. usage is a distinction that matters everywhere in engine work.</li>
<li>In the 3D viewport, enter Edit Mode with <kbd>Tab</kbd> (all vertices selected by default).</li>
<li>Switch the viewport draw mode to <em>Textured</em> (<kbd>Alt</kbd>+<kbd>Z</kbd>) to preview textures on the mesh.</li>
</ol>

<h3>Image requirements for real-time</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Recommendation</th><th>Reason</th></tr></thead>
<tbody>
<tr><td>Size</td><td>Power of two: 512&times;512, 1024&times;1024</td><td>GPU-friendly mipmapping and tiling</td></tr>
<tr><td>Format</td><td>PNG (lossless, alpha) or JPG (photographic)</td><td>PNG keeps transparency for cut-outs</td></tr>
<tr><td>Aspect</td><td>Square preferred</td><td>The plane is square; avoids stretching</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Name image files for their purpose — <span class="chip acc">face_diffuse_1024.png</span>, not <span class="chip">IMG_0423.png</span>. Every texture you pack follows this convention from day one.</p></div>
` },

{ ch: 2, t: "Step 4 — Unwrap and Material Settings", h: `
<h3>Project the image onto the plane</h3>
<ol>
<li>Still in Edit Mode with everything selected: <kbd>U</kbd> &rarr; <em>Unwrap</em>.</li>
<li>A plane&rsquo;s default UVs already span the full 0&ndash;1 square — the unwrap confirms/normalizes them, so the image fills the face exactly.</li>
<li>In the UV/Image Editor you should now see the face image with the plane&rsquo;s UV outline (a square) over it.</li>
</ol>

<h3>Give the mesh a material that uses UVs</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Value</th><th>Where</th></tr></thead>
<tbody>
<tr><td>New material</td><td><code>MatFace</code></td><td>Properties &rarr; Material</td></tr>
<tr><td>Diffuse color</td><td>white (1,1,1)</td><td>Material &rarr; Diffuse</td></tr>
<tr><td>Texture slot</td><td>Image/Texture type</td><td>Material &rarr; Textures</td></tr>
<tr><td>Texture image</td><td>your face image</td><td>Texture &rarr; Image</td></tr>
<tr><td>Mapping coordinates</td><td><code>UV</code></td><td>Texture &rarr; Mapping</td></tr>
</tbody></table></div>

<p>The chain is strict: <em>material &rarr; texture channel &rarr; image &rarr; UV coordinates from the mesh</em>. Break any link and the surface renders plain gray.</p>
` },

{ ch: 2, t: "Step 5 — Real-Time Shading: Texture Face Mode", h: `
<h3>Teach the runtime to show the texture</h3>
<p>The viewport preview lies; the <em>game engine</em> decides what materials mean at runtime via the scene&rsquo;s shading mode:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mode</th><th>Behavior</th><th>Use when</th></tr></thead>
<tbody>
<tr><td>Texture Face (TexFace)</td><td>Bakes UV image straight onto faces; ignores lights</td><td>Quick previews, billboards, 2D-style games</td></tr>
<tr><td>Multitexture</td><td>Textures + fixed-function lighting</td><td>Simple lit scenes, low-end hardware</td></tr>
<tr><td>GLSL</td><td>Full programmable pipeline, per-pixel lighting</td><td>Production (used from Chapter 05 onward)</td></tr>
</tbody></table></div>

<ol>
<li>Set it in <em>Render Properties (World) &rarr; Game &rarr; Shading</em>.</li>
<li>For the quickstart choose <span class="chip acc">Texture Face</span>: the face renders full-bright, exactly as painted — no lighting setup needed yet.</li>
</ol>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Textured viewport but <em>plain gray at runtime</em>: the shading mode was left on Multitexture/GLSL while the material only has a TexFace image. The engine is not broken — the material pipeline and the preview pipeline are simply different things.</p></div>

<div class="callout term"><div class="co-label">&#9670 Term — Texture Face / TexFace</div>
<p>The fastest material path in BGE: one image per face-set, unlit. In production engines this survives as <em>unlit/emissive</em> material mode — same idea, same performance profile.</p></div>
` },

{ ch: 2, t: "Step 6 — Camera and Sun Lamp", h: `
<h3>Frame the face</h3>
<ol>
<li>Select the camera; move it back and slightly up (<kbd>G</kbd> <kbd>Z</kbd>, then <kbd>G</kbd> <kbd>Y</kbd>).</li>
<li>Aim it: add a <em>Track To</em> constraint targeting the plane, or just rotate manually until the face fills the view.</li>
<li>Check framing through the camera: numpad <kbd>0</kbd>. Golden rule — <em>what the camera sees is what the game shows</em>.</li>
</ol>

<h3>Lighting (for later modes)</h3>
<ul>
<li><kbd>Shift</kbd>+<kbd>A</kbd> &rarr; <em>Lamp &rarr; Sun</em>. A Sun is directional and <em>position-independent</em> — rotation is all that matters.</li>
<li>Rotate it from above-left for natural portrait light. In TexFace mode it does nothing; the moment you switch to Multitexture/GLSL it starts to matter.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Lock the camera early. Wandering cameras are the #1 cause of &ldquo;my game used to look right.&rdquo; In bigger projects (Chapters 5, 6, 8) the camera becomes a gameplay object with its own logic — starting disciplined keeps that logic sane.</p></div>
` },

{ ch: 2, t: "Step 7 — Your First Logic Bricks", h: `
<h3>Sensors &rarr; Controllers &rarr; Actuators</h3>
<p>Logic in this engine is a visible, wirable pipeline. Make the face spin:</p>

<div class="flow">
  <span class="fnode hot">Always<small>Sensor</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND<small>Controller</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Motion<small>Actuator</small></span>
</div>

<ol>
<li>Select the plane, open the <em>Logic Editor</em>.</li>
<li>Add: <span class="chip acc">Sensor &rarr; Always</span>, <span class="chip">Controller &rarr; And</span>, <span class="chip acc">Actuator &rarr; Motion</span>; connect the sockets left&rarr;right.</li>
<li>In the Motion actuator, set <em>Rot: Z = 0.5</em> and choose <strong>Loc/Rot</strong> mode. Since it fires every frame, the plane turns 0.5&deg; per tick.</li>
</ol>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Brick</th><th>Pulse semantics</th><th>Here</th></tr></thead>
<tbody>
<tr><td>Always sensor</td><td>Fires every logic tick (positive pulse each frame)</td><td>Continuous rotation</td></tr>
<tr><td>And controller</td><td>Passes pulse only if <em>all</em> linked sensors are true</td><td>Single input, pure pass-through</td></tr>
<tr><td>Motion actuator</td><td>Applies translation/rotation/force when pulsed</td><td>0.5&deg; Z per frame &asymp; 30&deg;/s at 60 fps</td></tr>
</tbody></table></div>

<div class="callout note"><div class="co-label">&#9432 Note</div>
<p>Rotation per frame is <em>frame-rate dependent</em> — at 120 fps it spins twice as fast. Chapter 13 shows the frame-rate-independent alternatives (Servo control, forces, Python delta-time).</p></div>
` },

{ ch: 2, t: "Step 8 — Press P: Your First Runtime", h: `
<h3>Run it</h3>
<ol>
<li>Hover the mouse over the 3D viewport (the engine needs focus there).</li>
<li>Press <kbd>P</kbd>. The viewport becomes the game: your face, spinning, lit by your setup, shot by your camera.</li>
<li>Exit with <kbd>Esc</kbd> — you return to the editing scene exactly as you left it.</li>
</ol>

<h3>What actually happens when you press P</h3>
<div class="flow">
  <span class="fnode">Scene snapshot<small>objects, bricks, props</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Game loop<small>every frame</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Sensors polled<small>Always = true</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Controllers fire<small>AND passes</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Actuators run<small>rotate plane</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Render<small>camera &rarr; screen</small></span>
</div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Use <em>Game &rarr; Show Framerate &amp; Profile</em> from the first day. Watching the logic/physics/render split of your frame budget from quickstart onward builds the profiling reflex that Chapter 13 demands.</p></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Test in <em>standalone player</em> (<em>Game &rarr; Save As Runtime</em>) before calling anything done. The runtime player behaves slightly differently from the embedded player — fonts, paths, and packed resources all get exercised.</p></div>
` },

{ ch: 2, t: "Using 2D Applications — The Texture Pipeline", h: `
<h3>Why a 2D app is part of your toolchain</h3>
<p>The engine renders pixels; <em>authoring</em> pixels is a 2D craft. The classic workflow pairs the 3D suite with GIMP (or Krita/Photoshop), round-tripping until the asset looks right in-game.</p>

<div class="flow">
  <span class="fnode">Export UV layout<small>.png wireframe</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Paint in GIMP<small>layers under the wires</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Save texture<small>same path, overwrite</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Reload in 3D<small>Alt+T / reopen</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Test in runtime<small>press P</small></span>
</div>

<h3>Exporting the UV layout</h3>
<ul>
<li>UV/Image Editor &rarr; <em>UVs &rarr; Export UV Layout</em> — writes the wireframe net as a transparent PNG.</li>
<li>Paint on <em>layers beneath</em> the wireframe layer; toggle wires off before final export.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Keep textures in a <span class="chip acc">textures/</span> folder beside the .blend with <em>relative paths</em> (<em>File &rarr; External Data &rarr; Make All Paths Relative</em>). Absolute paths break the moment a project moves between machines.</p></div>
` },

{ ch: 2, t: "GIMP Essentials for Game Textures", h: `
<h3>The 20% of GIMP that does 80% of texture work</h3>
<div class="cols2">
<div>
<h4>Layers &amp; masks</h4>
<ul>
<li>Base color / shading / details / decals as separate layers.</li>
<li>Layer masks for non-destructive wear and blends.</li>
</ul>
<h4>Canvas discipline</h4>
<ul>
<li><em>Image &rarr; Canvas Size</em> with power-of-two sizes.</li>
<li><em>Filter &rarr; Map &rarr; Tile</em> previews seamless tiling.</li>
</ul>
</div>
<div>
<h4>Selection tools</h4>
<ul>
<li><em>Select by color</em> and <em>Fuzzy select</em> for cutting shapes out of photos.</li>
<li><em>Feather selection</em> (2&ndash;3 px) before deleting — kills jaggies.</li>
</ul>
<h4>Color operations</h4>
<ul>
<li>Levels/Curves to normalize photo lighting before use as albedo.</li>
<li>Hue-Saturation to unify palette across source photos.</li>
</ul>
</div>
</div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Painting <em>specular highlights into the diffuse map</em>. Baked-in lighting fights the engine&rsquo;s dynamic lights and makes objects glow wrongly at night or in shadow. Diffuse maps stay flat-lit; shine belongs to specular/normal channels (Chapter 05).</p></div>
` },

{ ch: 2, t: "Alpha Channels & Transparency", h: `
<h3>Cut-outs: from rectangle to shape</h3>
<ol>
<li>In GIMP: add an alpha channel (<em>Layer &rarr; Transparency &rarr; Add Alpha Channel</em>).</li>
<li>Erase the background (fuzzy select + <kbd>Del</kbd>), or draw a layer mask.</li>
<li>Export as <strong>PNG</strong> — JPG cannot store alpha.</li>
</ol>

<h3>Two kinds of transparency at runtime</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Type</th><th>Look</th><th>Cost</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td>Alpha clip (binary)</td><td>Pixel fully on/off, hard edge</td><td>Cheapest</td><td>Foliage, fences, grates, cut-out faces</td></tr>
<tr><td>Alpha blend</td><td>Smooth gradient, soft edge</td><td>Sorts polygons, fills overdraw</td><td>Glass, smoke, holograms</td></tr>
</tbody></table></div>

<ul>
<li>In BGE: material <em>Game Settings &rarr; Alpha Blend: Alpha Clip</em> (or Sort/Blend) + <em>Z Transparency</em>.</li>
<li>Alpha Clip is the production default — it disables blending and depth-sorting artifacts.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>For foliage and cut-outs always prefer <strong>clip over blend</strong>. Semi-transparent pixels force the renderer to sort objects every frame — Chapter 13 quantifies exactly how expensive that gets.</p></div>
` },

{ ch: 2, t: "Saving & Packaging Your Project", h: `
<h3>Never lose an asset again</h3>
<h4>Option A — pack resources into the .blend</h4>
<ul>
<li><em>File &rarr; External Data &rarr; Pack into .blend</em>: images travel inside the file.</li>
<li>Perfect for sharing single-file demos; slower saves, bigger files.</li>
</ul>
<h4>Option B — referenced files (production)</h4>
<ul>
<li>Project folder: <span class="chip">blend/ &middot; textures/ &middot; sounds/ &middot; scripts/</span> with relative paths.</li>
<li>Version-control friendly, artists can work in parallel.</li>
</ul>

<h3>Save a runtime (shareable executable)</h3>
<ul>
<li><em>File &rarr; Export &rarr; Save As Runtime</em> produces a standalone player — no install needed on the target machine.</li>
<li>Test the runtime on a machine <em>without</em> your fonts and paths installed; packing bugs surface only there.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Moving the .blend without its textures, then opening it on another machine: magenta/gray placeholders and console errors. Either pack, or keep the folder structure intact — pick one policy per project and enforce it.</p></div>
` },

{ ch: 2, t: "Quickstart — Pitfalls & Best Practices", h: `
<h3>Review the traps you just avoided</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Gray at runtime, textured in viewport.</strong> Shading mode vs. material mismatch — check Game &rarr; Shading first.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Upside-down face.</strong> The plane&rsquo;s UVs are flipped relative to the image. In Edit Mode, flip UVs in the editor (<kbd>U</kbd> menu) rather than rotating the mesh.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Stretched texture.</strong> Non-square image on square plane. Either fix the image or scale UVs to compensate.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Save versions.</strong> <span class="chip acc">face_v01.blend</span>, <span class="chip acc">face_v02.blend</span> — cheap insurance before risky edits.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Test in runtime constantly.</strong> Press <kbd>P</kbd> after every change; never batch 5 edits before testing.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Power-of-two textures</strong>, named by purpose, in a stable relative-path folder.</p></div>
</div>
</div>
` },

{ ch: 2, t: "Quickstart — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Two faces:</strong> add a second plane showing the face from behind (mirror UVs in X) and make the pair spin in opposite directions.</li>
<li><strong>Blink:</strong> paint a closed-eyes variant in GIMP; swap materials at runtime with a <em>Property</em> sensor + <em>Replacement</em> (explored more in Ch. 05) or a short action.</li>
<li><strong>Billboard:</strong> alpha-clip a standing character photo onto the plane; make it always face the camera using a Track-To constraint on the plane.</li>
<li><strong>Speed control:</strong> add a <em>Delay</em> sensor (or Python pulse) so rotation steps 1&deg; every 0.25 s — observe the difference between per-frame and timed logic.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Explain UV coordinates and map an image onto a mesh &#10003;</li>
<li>Configure materials for the real-time shading modes &#10003;</li>
<li>Wire sensor &rarr; controller &rarr; actuator logic &#10003;</li>
<li>Run, inspect, and exit the game runtime &#10003;</li>
<li>Author and package textures with a 2D application &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 03 goes under the hood: axes, vertices, polygons, normals, materials, and the architecture of the game loop that you just invoked with one keystroke.</p></div>
` }

);
