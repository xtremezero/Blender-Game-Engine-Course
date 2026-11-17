/* Part I — Chapter 04: Blender Basics (26 slides) */

SLIDES.push(

{ ch: 4, t: "Chapter 04 — Blender Basics", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">04</div>
  <div class="ch-info">
    <h1>Blender Basics</h1>
    <div class="ch-sub">Interface &middot; Navigation &middot; Object Manipulation &middot; Edit Mode &middot; Preferences</div>
  </div>
</div>
<div class="ch-goals">
  <h4>In this chapter you will</h4>
  <ul>
    <li>Read the interface like a native: editors, areas, headers, panels</li>
    <li>Navigate fluidly: orbit, pan, zoom, orthographic viewports</li>
    <li>Manipulate objects with hotkeys and numeric precision</li>
    <li>Edit meshes in Edit Mode: vertices, edges, faces, the core tools</li>
    <li>Configure preferences for speed (and for laptops)</li>
    <li>Organize scenes: layers, outliner, linking and appending</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>26</b> slides</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9734&#9734&#9734</b></span>
  <span class="ch-stat">hands-on <b>heavy</b></span>
</div>
` },

{ ch: 4, t: "The Interface — Screens, Areas, Workspaces", h: `
<h3>One application, many instruments</h3>
<p>Blender&rsquo;s UI is a grid of <strong>editors</strong>. Each rectangular area (a <em>pane</em>) can host any editor type — you compose workspaces like pedalboards.</p>

<div class="cols3">
  <div class="card"><h4>Area</h4><p>One editor instance. Drag its corner grips to split/join areas.</p></div>
  <div class="card"><h4>Header</h4><p>Per-area toolbar: mode selector, tool menus, editor options.</p></div>
  <div class="card"><h4>Workspace / Screen</h4><p>A saved arrangement of areas. Switch with <kbd>Ctrl</kbd>+<kbd>&#8592;</kbd>/<kbd>&#8594;</kbd>.</p></div>
</div>

<h3>The screens a game developer actually uses</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Layout</th><th>Editors</th><th>Job</th></tr></thead>
<tbody>
<tr><td>Modeling</td><td>3D View + Properties + Outliner</td><td>Building meshes</td></tr>
<tr><td>UV/Layout</td><td>3D View + UV/Image Editor</td><td>Unwrapping &amp; texture painting</td></tr>
<tr><td>Logic</td><td>3D View + Logic Editor + Properties</td><td>Wiring gameplay (every project chapter)</td></tr>
<tr><td>Animation</td><td>3D View + Dope Sheet / NLA + Properties</td><td>Keyframes &amp; actions (Ch. 05, 10)</td></tr>
<tr><td>Scripting</td><td>Text Editor + 3D View + Console</td><td>Python modules (Ch. 06, 08, 09, 11)</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Build a <em>Game</em> screen early: 3D View top-left, Logic Editor bottom, Properties right, and stay in it. Project chapters assume you can see logic and viewport simultaneously — context switching kills flow.</p></div>
` },

{ ch: 4, t: "Headers, Menus & Button Conventions", h: `
<h3>Reading the furniture</h3>
<div class="cols2">
<div>
<h4>Header anatomy (3D View)</h4>
<ul>
<li><strong>Mode dropdown</strong> — Object / Edit / Pose / etc. (also <kbd>Tab</kbd>, <kbd>Ctrl</kbd>+<kbd>Tab</kbd>).</li>
<li><strong>View / Add / Object menus</strong> — discoverable versions of every hotkey.</li>
<li><strong>Layer/pivot/proportional-editing controls</strong> on the right.</li>
</ul>
<h4>Editor types</h4>
<ul>
<li>The grid-icon at the far left of any header swaps the area to any editor (how you made the UV editor in Ch. 02).</li>
</ul>
</div>
<div>
<h4>Button grammar</h4>
<ul>
<li><span class="chip">Gray field</span> — click to type a value; <kbd>Tab</kbd> moves between X/Y/Z fields.</li>
<li><span class="chip">Toggle</span> — click on/off.</li>
<li><span class="chip">Dropdown</span> — cycle by click-drag or click to open.</li>
<li><strong>Drag diagonally</strong> across sliders to change many at once (weight painting loves this).</li>
<li><em>Hover + type</em> works on active numeric fields without clicking.</li>
</ul>
</div>
</div>

<div class="callout note"><div class="co-label">&#9432 Note — Tooltips are documentation</div>
<p>Hover any control: the tooltip shows the value range <em>and</em> what it does. In the BGE-era Properties panels, tooltips are the fastest reference this side of Chapter 13.</p></div>
` },

{ ch: 4, t: "Navigation — Orbit, Pan, Zoom", h: `
<h3>Three camera moves, infinite viewpoints</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Action</th><th>Mouse</th><th>Emulated / laptop</th></tr></thead>
<tbody>
<tr><td>Orbit</td><td><kbd>MMB</kbd> drag</td><td><kbd>Alt</kbd>+<kbd>LMB</kbd> drag</td></tr>
<tr><td>Pan</td><td><kbd>Shift</kbd>+<kbd>MMB</kbd> drag</td><td><kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>LMB</kbd> drag</td></tr>
<tr><td>Zoom</td><td><kbd>Wheel</kbd> / <kbd>Ctrl</kbd>+<kbd>MMB</kbd> drag</td><td><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>LMB</kbd> / <kbd>+</kbd><kbd>&minus;</kbd></td></tr>
<tr><td>Fly mode</td><td><kbd>Shift</kbd>+<kbd>F</kbd></td><td>WASD + mouse look, scroll to speed</td></tr>
</tbody></table></div>

<h3>Views that think in projections</h3>
<ul>
<li><strong>Perspective:</strong> parallel lines converge — dramatic, natural, what the game camera usually shows.</li>
<li><strong>Orthographic:</strong> no convergence — measurements read true; modeling alignment happens here (<kbd>Numpad 5</kbd> toggles).</li>
<li>Orbiting past 90&deg; auto-snaps front&harr;back etc.; press <kbd>Numpad 5</kbd> if the flip surprises you.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Model in orthographic quad views (Front <kbd>1</kbd>, Side <kbd>3</kbd>, Top <kbd>7</kbd>), judge silhouettes in perspective. Musicians call this practicing with a metronome — same principle.</p></div>
` },

{ ch: 4, t: "Numpad & View Shortcuts — Reference", h: `
<h3>The view keypad</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Key</th><th>View</th><th>Key</th><th>View</th></tr></thead>
<tbody>
<tr><td><kbd>1</kbd></td><td>Front (orthographic)</td><td><kbd>Ctrl</kbd>+<kbd>1</kbd></td><td>Back</td></tr>
<tr><td><kbd>3</kbd></td><td>Right side</td><td><kbd>Ctrl</kbd>+<kbd>3</kbd></td><td>Left side</td></tr>
<tr><td><kbd>7</kbd></td><td>Top</td><td><kbd>Ctrl</kbd>+<kbd>7</kbd></td><td>Bottom</td></tr>
<tr><td><kbd>0</kbd></td><td>Through the game camera</td><td><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>0</kbd></td><td>Set active camera to view</td></tr>
<tr><td><kbd>2 / 4 / 6 / 8</kbd></td><td>Orbit down/left/right/up</td><td><kbd>9</kbd></td><td>Orbit 180&deg;</td></tr>
<tr><td><kbd>5</kbd></td><td>Perspective &harr; orthographic</td><td><kbd>/</kbd> (numpad)</td><td>Local view (isolate selection)</td></tr>
<tr><td><kbd>.</kbd> (numpad)</td><td>Frame selected</td><td><kbd>Home</kbd></td><td>Frame all</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall — no numpad</div>
<p>Laptops ship without numpads and view keys silently do nothing. Fix once: <em>User Preferences &rarr; Input &rarr; Emulate Numpad</em> (top-row digits become view keys). Do it today; every later chapter assumes it.</p></div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p><strong>Local view</strong> (<kbd>/</kbd>) is the focus mode: hides everything except the selection — ideal for editing a gun turret inside a crowded ship (Ch. 06, 08). Press again to restore.</p></div>
` },

{ ch: 4, t: "Selecting — Click, Box, Circle, Lasso", h: `
<h3>Four ways to say &ldquo;you&rdquo;</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Tool</th><th>Invoke</th><th>Behavior</th></tr></thead>
<tbody>
<tr><td>Click</td><td><kbd>RMB</kbd></td><td>Single object / element (new selection replaces)</td></tr>
<tr><td>Extend</td><td><kbd>Shift</kbd>+<kbd>RMB</kbd></td><td>Add/remove from selection</td></tr>
<tr><td>Select All / None / Invert</td><td><kbd>A</kbd> / <kbd>Alt</kbd>+<kbd>A</kbd> / <kbd>Ctrl</kbd>+<kbd>I</kbd></td><td>Global operations</td></tr>
<tr><td>Box</td><td><kbd>B</kbd> then <kbd>LMB</kbd> drag</td><td>Rectangle — anything touched is selected</td></tr>
<tr><td>Circle</td><td><kbd>C</kbd>, wheel resizes, <kbd>LMB</kbd> paints</td><td>Brush-select; <kbd>MMB</kbd> deselects; <kbd>Esc</kbd>/RMB exits</td></tr>
<tr><td>Lasso</td><td><kbd>Ctrl</kbd>+<kbd>LMB</kbd> drag</td><td>Freehand outline</td></tr>
</tbody></table></div>

<h3>Selection is a modeling tool</h3>
<ul>
<li><strong>Linked selection:</strong> <kbd>Ctrl</kbd>+<kbd>L</kbd> — grow to everything connected; grab a whole hull section in one stroke.</li>
<li><strong>Select by trait:</strong> Select menu &rarr; all by trait (interior faces, wire, loose geometry) — the mesh-hygiene sweep.</li>
<li>In Edit Mode, <kbd>L</kbd> under cursor selects the connected mesh piece — the fastest crate-to-crate edit.</li>
</ul>

<div class="callout note"><div class="co-label">&#9432 Note — LMB vs RMB selection</div>
<p>This course uses the classic <strong>RMB-select</strong> scheme (the game-era default). Left-Select builds exist and work identically — substitute mentally if your build is configured the other way. The LMB still confirms transforms in either scheme.</p></div>
` },

{ ch: 4, t: "Object Manipulation — G/R/S Precision", h: `
<h3>From gesture to exact number</h3>
<ol>
<li><kbd>G</kbd> grabs; move mouse; <kbd>LMB</kbd>/<kbd>Enter</kbd> confirms, <kbd>RMB</kbd>/<kbd>Esc</kbd> cancels.</li>
<li><em>During</em> the grab: type <kbd>X</kbd>/<kbd>Y</kbd>/<kbd>Z</kbd> to constrain; type a number for exactness; <kbd>X</kbd><kbd>X</kbd> for local axes.</li>
<li>Everything applies to <kbd>R</kbd> (rotate) and <kbd>S</kbd> (scale) identically — one grammar, three verbs.</li>
</ol>

<h3>Power modifiers</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Key</th><th>During transform</th><th>Why</th></tr></thead>
<tbody>
<tr><td><kbd>Shift</kbd></td><td>Slow/precise mouse movement</td><td>Fine alignment without zooming in</td></tr>
<tr><td><kbd>Ctrl</kbd></td><td>Snap to increments</td><td>Grid-perfect placement</td></tr>
<tr><td><kbd>Shift</kbd>+axis</td><td>Exclude that axis</td><td>Move in a plane (e.g., floor plan on XY)</td></tr>
<tr><td><kbd>Numpad *</kbd> typed</td><td>Multiply current value</td><td>Iterative sizing</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>For anything gameplay-critical (spawn points, muzzle empties, track-to targets), finish with typed values in the Properties panel or <kbd>N</kbd> sidebar — pixel-perfect placement by mouse is a myth, and logic inherits whatever sloppiness you leave.</p></div>
` },

{ ch: 4, t: "Snapping & Duplicate / Add", h: `
<h3>Snap control</h3>
<ul>
<li><strong>Holding <kbd>Ctrl</kbd> during a transform</strong> snaps to grid increments (or angle steps while rotating).</li>
<li><strong>Snapping modes</strong> (magnet icon / <kbd>Shift</kbd>+<kbd>S</kbd> cursor pie): Grid, Vertex, Face (project onto surfaces), Volume.</li>
<li><strong><kbd>Shift</kbd>+<kbd>S</kbd> pie menu</strong> — the classics: <em>cursor to selected</em>, <em>selection to cursor</em>, <em>cursor to world origin</em>.</li>
</ul>

<h3>Duplication semantics</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Key</th><th>Action</th><th>Shares?</th><th>Use for</th></tr></thead>
<tbody>
<tr><td><kbd>Shift</kbd>+<kbd>D</kbd></td><td>Duplicate object</td><td>Nothing (full copy)</td><td>Variants you will edit independently</td></tr>
<tr><td><kbd>Alt</kbd>+<kbd>D</kbd></td><td>Linked duplicate</td><td>Mesh data</td><td>Armies of identical props — edit one, all update</td></tr>
<tr><td><kbd>Shift</kbd>+<kbd>A</kbd></td><td>Add new primitive/object</td><td>&mdash;</td><td>Fresh geometry</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Environments: <kbd>Alt</kbd>+<kbd>D</kbd> by default, <kbd>Shift</kbd>+<kbd>D</kbd> only when divergence is intended. Review at export: hundreds of <span class="chip">barrel.001&hellip;099</span> meshes from accidental Shift-D is a real memory leak (Ch. 13 quantifies it).</p></div>
` },

{ ch: 4, t: "The 3D Cursor — Your Second Origin", h: `
<h3>The little crosshair that places the world</h3>
<p>The <strong>3D cursor</strong> is a free-floating reference point. New objects spawn <em>at it</em>, and many operators pivot on it. It is not UI decoration — it is a tool.</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Operation</th><th>Keys</th><th>Effect</th></tr></thead>
<tbody>
<tr><td>Place cursor</td><td><kbd>LMB</kbd> click (in 3D view)</td><td>Moves to surface under mouse</td></tr>
<tr><td>Cursor to selected</td><td><kbd>Shift</kbd>+<kbd>S</kbd></td><td>Center of current selection</td></tr>
<tr><td>Selection to cursor</td><td><kbd>Shift</kbd>+<kbd>S</kbd></td><td>Move objects onto cursor</td></tr>
<tr><td>Cursor to world origin</td><td><kbd>Shift</kbd>+<kbd>S</kbd></td><td>Reset the reference</td></tr>
<tr><td>Origin to geometry / geometry to origin</td><td>Object menu &rarr; Transform</td><td>Recenter pivots</td></tr>
</tbody></table></div>

<h3>Game-dev use cases</h3>
<ul>
<li><strong>Spawn points:</strong> place cursor, add empty named <span class="chip acc">spawn_player</span> — Ch. 06.</li>
<li><strong>Repairing pivots:</strong> origin-to-geometry then constrain placement numerically — turrets that rotate about their own axis (Ch. 06).</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>&ldquo;My new object appeared somewhere random.&rdquo; The cursor was left in orbit from a previous click. <kbd>Shift</kbd>+<kbd>S</kbd> &rarr; cursor to origin is the reset you will press a thousand times.</p></div>
` },

{ ch: 4, t: "Layers — Staging Your World", h: `
<h3>Twenty slots, two states</h3>
<p>Each scene has 20 layers. An object occupies one or more; layers are toggled visible or hidden — and <strong>only visible layers go live at runtime start</strong>.</p>

<div class="cols2">
<div>
<h4>The runtime contract</h4>
<ul>
<li>Hidden layer objects: <em>saved but inactive</em> — not simulated, not rendered, not selectable by mouse-over... but spawnable by name.</li>
<li>This is the spawning architecture of every project chapter: bullets and enemies live on hidden layers (e.g., layer 2), the level on layer 1.</li>
</ul>
</div>
<div>
<h4>Organization that scales</h4>
<ul>
<li>L1: gameplay stage &middot; L2: spawnable prefabs &middot; L3: reference/scratch &middot; L4: lighting rig &middot; L5: logic helpers.</li>
<li>Move objects between layers: <kbd>M</kbd> then pick a slot.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Decide the layer plan <em>before</em> building (write it in a comment/text block in the file). Retro-sorting 300 objects across layers is nobody&rsquo;s favorite afternoon.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Accidentally playing with prefab layers visible: thousands of bullets simulate at frame one and the game explodes. If the world self-destructs on <kbd>P</kbd>, <em>check layer visibility first</em>.</p></div>
` },

{ ch: 4, t: "Object Mode vs Edit Mode", h: `
<h3>Two worlds, one <kbd>Tab</kbd></h3>
<div class="cols2">
  <div class="card">
    <h4>Object Mode</h4>
    <p>Objects are atoms: move, rotate, parent, delete whole. Physics and logic bricks attach <em>here</em>. The game runtime treats objects as units.</p>
  </div>
  <div class="card hot">
    <h4>Edit Mode <kbd>Tab</kbd></h4>
    <p>Inside the mesh: select and move vertices/edges/faces, cut, extrude, weld. Changes write to the <em>shared mesh datablock</em> — every linked instance updates.</p>
  </div>
</div>

<h3>Mode matrix (worth memorizing)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mode</th><th>Enter via</th><th>Edits</th><th>Used in</th></tr></thead>
<tbody>
<tr><td>Object</td><td>default / <kbd>Tab</kbd></td><td>Transforms, parenting, logic, physics</td><td>all chapters</td></tr>
<tr><td>Edit</td><td><kbd>Tab</kbd></td><td>Mesh topology, UVs</td><td>Ch. 05&ndash;08 modeling sections</td></tr>
<tr><td>Vertex Paint</td><td>mode dropdown</td><td>Vertex colors</td><td>AO touch-ups</td></tr>
<tr><td>Weight Paint</td><td>mode dropdown</td><td>Bone weights</td><td>Ch. 10 (extensively)</td></tr>
<tr><td>Pose</td><td><kbd>Ctrl</kbd>+<kbd>Tab</kbd> on armature</td><td>Bone rotations</td><td>Ch. 05, 10</td></tr>
<tr><td>Texture Paint</td><td>mode dropdown</td><td>Direct texture painting</td><td>Ch. 05 materials</td></tr>
</tbody></table></div>
` },

{ ch: 4, t: "Edit Mode — Verts, Edges, Faces", h: `
<h3>Three select modes, one key</h3>
<ul>
<li><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> (main row) select <strong>vertex / edge / face</strong> mode — or click the icons in the header.</li>
<li><kbd>Ctrl</kbd>+<kbd>Tab</kbd> in Edit Mode opens the pie with a combined <em>vertex+face</em> mode (select a face, act on its verts).</li>
</ul>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Goal</th><th>Fastest path</th></tr></thead>
<tbody>
<tr><td>Move one corner</td><td>Vert mode &rarr; click &rarr; <kbd>G</kbd></td></tr>
<tr><td>Sharpen a crease</td><td>Edge mode &rarr; edge ring select &rarr; <kbd>Shift</kbd>+<kbd>E</kbd> crease</td></tr>
<tr><td>Delete a wall panel</td><td>Face mode &rarr; select &rarr; <kbd>X</kbd> &rarr; Faces</td></tr>
<tr><td>Fix stray geometry</td><td>Select All by Trait &rarr; Loose Geometry / Interior Faces &rarr; delete</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Switch modes <em>deliberately</em>. Most mesh accidents are edits made in the wrong select mode (dragging a face when you meant a vertex). The mode icons in the header are a live indicator — glance, don&rsquo;t assume.</p></div>
` },

{ ch: 4, t: "Edit Mode — The Core Tools", h: `
<h3>The daily eight</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Tool</th><th>Keys</th><th>What it does</th><th>Watch out</th></tr></thead>
<tbody>
<tr><td>Extrude</td><td><kbd>E</kbd> (axis to constrain)</td><td>Pulls new geometry off the selection</td><td>Cancel with <kbd>RMB</kbd> leaves doubled verts — merge after</td></tr>
<tr><td>Extrude region vs individual</td><td><kbd>E</kbd> vs <kbd>Alt</kbd>+<kbd>E</kbd></td><td>One connected pull vs each face apart</td><td>Fences/grates want Individual</td></tr>
<tr><td>Fill</td><td><kbd>F</kbd></td><td>Bridges selected verts/edges with a face</td><td>Check normals after (flip if dark)</td></tr>
<tr><td>Bevel</td><td><kbd>Ctrl</kbd>+<kbd>B</kbd>, wheel = segments</td><td>Chamfers hard edges</td><td>Game meshes: 1 segment, then normal-map detail</td></tr>
<tr><td>Loop cut</td><td><kbd>Ctrl</kbd>+<kbd>R</kbd>, click to place</td><td>Inserts an edge loop around a face ring</td><td>The deformation tool — Ch. 10 arms/legs</td></tr>
<tr><td>Subdivide</td><td><kbd>W</kbd> menu / right-click menu</td><td>Splits selected faces</td><td>Each level &times;4 the faces — budget!</td></tr>
<tr><td>Merge / Remove doubles</td><td><kbd>Alt</kbd>+<kbd>M</kbd> / Merge by Distance</td><td>Welds coincident vertices</td><td>Imported meshes almost always need it</td></tr>
<tr><td>Rip / Rip-fill</td><td><kbd>V</kbd> / <kbd>Alt</kbd>+<kbd>V</kbd></td><td>Tears the mesh along shared edges</td><td>Creates boundary edges (holes)</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p><kbd>E</kbd> then immediately <kbd>X</kbd>/<kbd>Y</kbd>/<kbd>Z</kbd> — extruding <em>constrained</em> is the single most-used composite in game modeling. Drill it until it is a single gesture in your hands.</p></div>
` },

{ ch: 4, t: "Edit Mode — Shaping Toolkit", h: `
<h3>Beyond the daily eight</h3>
<div class="cols2">
<div>
<ul>
<li><strong>Inset <kbd>I</kbd></strong> — shrinks a face inward, creating a border ring. Panels, windows, hatches.</li>
<li><strong>Poke / Triangulate / Quad-dissolve</strong> — topology reshuffles for export or cleanup.</li>
<li><strong>Spin</strong> — revolves a profile around an axis: vases, chess pieces, <em>propellers</em> (Ch. 08).</li>
<li><strong>Screw</strong> — profile swept along Z with pitch: springs, screws, drill heads.</li>
</ul>
</div>
<div>
<ul>
<li><strong>Knife <kbd>K</kbd></strong> — draw cuts freehand; magnet-snaps to midpoints (<kbd>Ctrl</kbd>) and angles (<kbd>C</kbd>).</li>
<li><strong>Bisect</strong> — planar cut through the whole mesh: slicing pumpkins (Ch. 05).</li>
<li><strong>Shrink/Fatten <kbd>Alt</kbd>+<kbd>S</kbd></strong> — offset along normals: shells, thickness.</li>
<li><strong>Shear <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd></strong> and <strong>To Sphere <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd></strong> — corrective shaping.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice — the 80/20 of game modeling</div>
<p>Loop cut + Extrude + Inset + Bevel produce 80% of hard-surface game assets. Master those four before touching anything exotic; sculpting-heavy flows come much later (and usually end <em>retopologized</em> back into this toolkit anyway).</p></div>
` },

{ ch: 4, t: "Modifiers — Non-Destructive Stacks", h: `
<h3>Instructions, not results</h3>
<p>A modifier is a <em>live operation</em> stacked on the object: the base mesh stays editable, the modifier&rsquo;s effect is computed on top — and baked at export.</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Modifier</th><th>Effect</th><th>Game use</th></tr></thead>
<tbody>
<tr><td>Subdivision Surface</td><td>Smooths by adding loop-interpolated geometry</td><td>Hero props; keep levels &le;2</td></tr>
<tr><td>Mirror</td><td>Reflects across an axis, merges the seam</td><td>Symmetric characters (Ch. 10)</td></tr>
<tr><td>Array</td><td>Repeats geometry with offset/scale per copy</td><td>Fences, chains, tunnels (Ch. 05, 06)</td></tr>
<tr><td>Boolean</td><td>Add/subtract/intersect volumes</td><td>Hard-surface cuts; clean up after!</td></tr>
<tr><td>Decimate</td><td>Reduces triangle count</td><td>LOD generation (Ch. 13)</td></tr>
<tr><td>Cast / Simple Deform</td><td>Bend / taper / twist</td><td>Props with curvature</td></tr>
</tbody></table></div>

<ul>
<li><strong>Apply (<kbd>Ctrl</kbd>+<kbd>A</kbd> in modifier panel)</strong> bakes the stack into the mesh — the game engine sees the <em>evaluated</em> result either way, but applied geometry is what custom collision bounds and exporters expect.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Shipping heavy modifier stacks: the runtime evaluates them every frame? No — it bakes at conversion, but conversion cost and memory balloons on complex stacks. Apply what is final; keep live only what still iterates.</p></div>
` },

{ ch: 4, t: "Preferences — Input", h: `
<h3>Make the machine yours (once)</h3>
<p><em>File &rarr; User Preferences &rarr; Input</em> — the highest-ROI settings screen in the application:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Value</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Emulate Numpad</td><td>ON (laptops)</td><td>Top-row digits become view keys</td></tr>
<tr><td>Emulate 3-Button Mouse</td><td>ON (no MMB)</td><td><kbd>Alt</kbd>+<kbd>LMB</kbd> orbits</td></tr>
<tr><td>Select With</td><td>Left or Right (your pick)</td><td>Consistency matters more than choice</td></tr>
<tr><td>Orbit Style</td><td>Turntable (default) / Trackball</td><td>Turntable keeps Z up in your head</td></tr>
<tr><td>Zoom Style</td><td>Scale / Dolly / Continue</td><td>Personal preference</td></tr>
</tbody></table></div>

<h3>Keymap surgery</h3>
<ul>
<li>Any command is bindable: search in the keymap list, edit, conflict-check.</li>
<li><strong>Export/import preferences</strong> as a .py/config file — carry your setup to every machine (real studios do exactly this via version-controlled config).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Change input settings <em>before</em> starting a project, then freeze them. Rebinding mid-project scrambles muscle memory — yours and your teammates&rsquo;.</p></div>
` },

{ ch: 4, t: "Preferences — System, Files, Themes", h: `
<h3>The quiet performance levers</h3>
<div class="cols2">
<div>
<h4>System</h4>
<ul>
<li><strong>VBOs (vertex buffer objects):</strong> ON — direct GPU geometry upload; the single biggest editor viewport speed-up.</li>
<li><strong>Color bits / mipmaps:</strong> defaults fine; generate mipmaps for game images.</li>
<li><strong>Compute / GPU select:</strong> match your rendering device.</li>
</ul>
<h4>Files</h4>
<ul>
<li>Recent-files list length; auto-save timer (15 min); default save path to your project folder.</li>
</ul>
</div>
<div>
<h4>Themes</h4>
<ul>
<li>Contrast tuned for long sessions — that is their whole job.</li>
<li>Importantly: <strong>object color for selected/unselected</strong> and wire colors affect how clearly you see normals-era meshes.</li>
</ul>
<h4>Addons</h4>
<ul>
<li>Ships with hundreds disabled. Game-era essentials: <em>3D View: Layer Management</em>, <em>Object: BoolTool</em>, import/export formats you need.</li>
</ul>
</div>
</div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Forgetting <strong>Save User Settings</strong> after tweaking preferences — the settings die with the session and &ldquo;randomly&rdquo; revert later. The button exists; click it.</p></div>
` },

{ ch: 4, t: "Laptop & Ergonomics Setup", h: `
<h3>Full power without a full workstation</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Need</th><th>Solution</th></tr></thead>
<tbody>
<tr><td>Orbit without MMB</td><td>Emulate 3-Button Mouse (<kbd>Alt</kbd>+<kbd>LMB</kbd>) or a $3 wheel-mouse — honestly, buy the mouse</td></tr>
<tr><td>View keys without numpad</td><td>Emulate Numpad</td></tr>
<tr><td>Fly mode</td><td><kbd>Shift</kbd>+<kbd>F</kbd>, WASD — also great for scouting your level like a player</td></tr>
<tr><td>Layers without keys</td><td>Layer Management addon panel</td></tr>
<tr><td>Long sessions</td><td>Learn <kbd>Ctrl</kbd>+<kbd>MMB</kbd> zoom-drag; fewer wheel-notches, less RSI</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Tip — the two-minute ritual</div>
<p>On any new machine: Emulate Numpad &rarr; Emulate 3BM (if needed) &rarr; auto-save 15 min &rarr; VBOs on &rarr; default path &rarr; <strong>Save User Settings</strong>. Two minutes that prevent a lost afternoon.</p></div>
` },

{ ch: 4, t: "Save, Load & the .blend File", h: `
<h3>Anatomy of your project file</h3>
<ul>
<li>A <span class="chip acc">.blend</span> is a complete, self-describing database: scenes, objects, meshes, materials, textures, lamps, actions, logic bricks, Python text blocks, packed images — plus version metadata.</li>
<li><strong>Backwards compatibility is honored</strong> (old files open in new builds); forward is best-effort. Pin your engine version for a project&rsquo;s lifetime.</li>
<li><kbd>Ctrl</kbd>+<kbd>S</kbd> saves; <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>S</kbd> / File &rarr; Save Copy for snapshotting without switching files.</li>
</ul>

<h3>The recover safety net</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mechanism</th><th>Covers</th></tr></thead>
<tbody>
<tr><td>Save versions (0&ndash;32)</td><td>Keeps <span class="chip">file.blend1</span>, <span class="chip">.blend2</span>&hellip; on each overwrite</td></tr>
<tr><td>Auto-save temp directory</td><td>Periodic snapshots even after crashes</td></tr>
<tr><td>Recover Last Session</td><td>Reopens the emergency save</td></tr>
<tr><td>Git LFS for .blend</td><td>Team-grade versioning (binary diffing is coarse)</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Version your files with intent: <span class="chip acc">game_ch05_v03.blend</span> at every stable milestone, plus <em>one</em> rolling working file. The engine has no undo across a runtime session — saved states are your only history.</p></div>
` },

{ ch: 4, t: "Linking & Appending — Asset Reuse", h: `
<h3>Borrow from other .blends without copying</h3>
<div class="cols2">
  <div class="card hot">
    <h4>Link <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>L</kbd></h4>
    <p>Reference data <em>in place</em> from a library file. The link is read-only in your scene; edit it only in its source file. The team pattern: one <span class="chip acc">assets.blend</span>, many level files linking from it.</p>
  </div>
  <div class="card">
    <h4>Append <kbd>Shift</kbd>+<kbd>F1</kbd></h4>
    <p>Copy data <em>into</em> your file. Independent from then on. The solo-dev pattern for grabbing a character into a level file.</p>
  </div>
</div>

<h3>Runtime relevance</h3>
<ul>
<li>Linked groups become <strong>group instances</strong> — one editable master, many placed copies, <em>logic shared</em>: the engine&rsquo;s closest thing to a prefab (Ch. 12&rsquo;s Yo Frankie! workflow exactly).</li>
<li>The runtime can also load .blend data dynamically at runtime (<span class="chip acc">LibLoad</span>, Ch. 12 level streaming).</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Appending duplicates you did not know you had: append the <em>same material twice</em> from two libraries and you own two materials named identically that render differently. Audit with the Outliner&rsquo;s orphan/data-block view (see next slide).</p></div>
` },

{ ch: 4, t: "Outliner & Properties — The Two Dashboards", h: `
<h3>Outliner — your scene&rsquo;s file manager</h3>
<ul>
<li>Tree of every object and its children; click to select, double-click to rename, drag to parent.</li>
<li><strong>Visibility / selectability / renderability toggles</strong> per object — temporary work lights and scaffolding belong hidden here, not deleted.</li>
<li>Filters expose <em>data-block links</em>: which mesh/material/action each object uses — the duplicate-detector from the last slide.</li>
</ul>

<h3>Properties editor — the settings wing</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Tab</th><th>Owns</th><th>Game chapters</th></tr></thead>
<tbody>
<tr><td>Render / World</td><td>Engine settings, shading mode, physics world, mist</td><td>Ch. 02, 07, 13</td></tr>
<tr><td>Object</td><td>Transforms, relations, visibility, groups</td><td>everywhere</td></tr>
<tr><td>Physics</td><td>Body type, bounds, forces, damping</td><td>Ch. 05&ndash;08</td></tr>
<tr><td>Material / Texture</td><td>Shading recipe &amp; texture channels</td><td>Ch. 02, 05, 13</td></tr>
<tr><td>Modifiers</td><td>Non-destructive stack</td><td>modeling sections</td></tr>
<tr><td>Data (mesh/armature)</td><td>UV layers, vertex groups, bones</td><td>Ch. 10</td></tr>
<tr><td>Logic is next door</td><td>(Logic Editor instead)</td><td>everywhere</td></tr>
</tbody></table></div>
` },

{ ch: 4, t: "Timeline & Animation Editors", h: `
<h3>Time is an editable dimension</h3>
<div class="cols2">
<div>
<h4>Timeline</h4>
<ul>
<li>Frame ruler, playhead, start/end of scene playback.</li>
<li><kbd>&#9650;</kbd>/<kbd>&#9660;</kbd> jump keyframe-to-keyframe; drag to scrub.</li>
<li>Playback rate here is <em>editor</em> playback; the game runtime has its own clock (fps setting in Render properties).</li>
</ul>
</div>
<div>
<h4>Dope Sheet &amp; Graph Editor</h4>
<ul>
<li><strong>Dope Sheet:</strong> keyframes as musical notes — channel overview, drag-to-retime.</li>
<li><strong>Graph Editor:</strong> curves between keys — interpolation (constant/linear/bezier), easing handles.</li>
<li><strong>NLA Editor:</strong> actions as movable/blended strips — the real-time animation composer (Ch. 10).</li>
</ul>
</div>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — Action</div>
<p>A named, reusable package of animation curves (e.g., <span class="chip acc">walk_cycle</span>, <span class="chip acc">jump</span>). The game engine plays Actions by name through the Action actuator — Chapter 05 uses this on day one.</p></div>
` },

{ ch: 4, t: "Scene Organization — Naming & Structure", h: `
<h3>Order is a feature</h3>
<h3>The naming grammar</h3>
<pre data-lang="text"><code>TYPE_Name_variant        -- prefix by function, keep lowercase variants
env_rock_big             prop_pumpkin_01
gun_turret_head          spawn_enemy_north
cam_main                 lamp_sun_key
a_player (armature)      M_char_body (mesh)</code></pre>

<h3>Structure rules that scale</h3>
<ul>
<li><strong>One parent per logical unit:</strong> <span class="chip acc">ship</span> &rarr; hull, turret, sensor_rig. Parents carry transforms; children stay at local zero.</li>
<li><strong>Empties for logic anchors:</strong> muzzle points, spawn locations, camera targets — invisible objects with meaningful names (they are free at runtime).</li>
<li><strong>Groups for prefabs:</strong> group a pickup with its logic, instance it everywhere (Ch. 05&ndash;06 pattern).</li>
<li><strong>Layers as departments</strong> (Ch. 04 layer plan) &mdash; enforced, not suggested.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Write a <em>project conventions</em> text block in the .blend (Text Editor, kept in-file): prefixes, layer plan, property dictionary. Onboarding a collaborator &mdash; or yourself in three months &mdash; becomes possible.</p></div>
` },

{ ch: 4, t: "Shortcut Master Table", h: `
<h3>Print this slide</h3>
<div class="cols2">
<div>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Keys</th><th>Action</th></tr></thead>
<tbody>
<tr><td><kbd>MMB</kbd> / <kbd>Alt</kbd>+<kbd>LMB</kbd></td><td>Orbit</td></tr>
<tr><td><kbd>Shift</kbd>+<kbd>MMB</kbd></td><td>Pan</td></tr>
<tr><td><kbd>Wheel</kbd></td><td>Zoom</td></tr>
<tr><td><kbd>1 3 7 0 5</kbd></td><td>Front / Side / Top / Camera / Persp</td></tr>
<tr><td><kbd>.</kbd> (numpad)</td><td>Frame selected</td></tr>
<tr><td><kbd>/</kbd> (numpad)</td><td>Local (isolate) view</td></tr>
<tr><td><kbd>A</kbd> / <kbd>Alt</kbd>+<kbd>A</kbd> / <kbd>Ctrl</kbd>+<kbd>I</kbd></td><td>All / None / Invert</td></tr>
<tr><td><kbd>B</kbd> / <kbd>C</kbd></td><td>Box / Circle select</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>L</kbd></td><td>Select linked</td></tr>
<tr><td><kbd>Shift</kbd>+<kbd>D</kbd> / <kbd>Alt</kbd>+<kbd>D</kbd></td><td>Duplicate / Linked duplicate</td></tr>
</tbody></table></div>
</div>
<div>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Keys</th><th>Action</th></tr></thead>
<tbody>
<tr><td><kbd>Shift</kbd>+<kbd>A</kbd></td><td>Add object</td></tr>
<tr><td><kbd>X</kbd> / <kbd>Del</kbd></td><td>Delete (menu)</td></tr>
<tr><td><kbd>Tab</kbd></td><td>Object &harr; Edit mode</td></tr>
<tr><td><kbd>G</kbd> <kbd>R</kbd> <kbd>S</kbd></td><td>Move / Rotate / Scale (+axis)</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>A</kbd></td><td>Apply transform (object mode)</td></tr>
<tr><td><kbd>Shift</kbd>+<kbd>S</kbd></td><td>Cursor snap pie</td></tr>
<tr><td><kbd>M</kbd></td><td>Move to layer</td></tr>
<tr><td><kbd>E</kbd> <kbd>F</kbd> <kbd>I</kbd> <kbd>Ctrl</kbd>+<kbd>R</kbd></td><td>Extrude / Fill / Inset / Loop cut</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>B</kbd> / <kbd>Alt</kbd>+<kbd>M</kbd></td><td>Bevel / Merge</td></tr>
<tr><td><kbd>P</kbd> (in game view)</td><td>Run the game engine</td></tr>
</tbody></table></div>
</div>
</div>
` },

{ ch: 4, t: "Chapter 04 — Pitfalls & Best Practices", h: `
<h3>Interface-level discipline</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Mouse-only modeling.</strong> You are three times slower and ten times less precise. Every tool in this chapter has a hotkey — the table two slides back is the minimum viable set.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Panic-orbiting.</strong> If you get lost in space: <kbd>.</kbd> (frame selected) &rarr; <kbd>1</kbd> &rarr; <kbd>7</kbd>. Recenter, resume. Wandering viewports waste minutes per hour.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Unapplied transforms</strong> entering the game engine: rotations of &ldquo;89.9&deg;&rdquo; and scales of &ldquo;1.002&rdquo; poison parenting, physics and logic assumptions. <kbd>Ctrl</kbd>+<kbd>A</kbd> everything before wiring gameplay.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Save user settings once, back them up</strong> (the config file), and standardize your screens. Consistency compounds: every second not spent finding a panel is a second spent making the game.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Clean as you go:</strong> remove doubles, recalc normals, delete loose geometry before leaving a modeling session. Dirty topology compounds interest too.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Version milestones:</strong> stable .blend snapshot at every working state. Crashes and bad experiments become non-events.</p></div>
</div>
</div>
` },

{ ch: 4, t: "Chapter 04 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Navigation drill:</strong> with the default cube, hit <kbd>1</kbd> <kbd>3</kbd> <kbd>7</kbd> <kbd>Ctrl</kbd>+<kbd>7</kbd> without moving the mouse from center. 60 seconds, no errors.</li>
<li><strong>Precision ladder:</strong> move the cube to exactly (3, &minus;2, 1), rotate Z 15&deg;, scale to (1, 2, 1) — using <em>only</em> typed values during transforms.</li>
<li><strong>Table set:</strong> model a four-legged table using only extrude, loop cut, inset — no other tools. Apply all transforms, name everything, organize into layers.</li>
<li><strong>Linked village:</strong> model one house, <kbd>Alt</kbd>+<kbd>D</kbd> a village of nine, then edit the master&rsquo;s roof and watch all nine update. Now explain why that happened (Ch. 03 terms).</li>
<li><strong>Preference ritual:</strong> set up a new machine profile in under two minutes using your own checklist from this chapter.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Navigate and select at reflex speed &#10003;</li>
<li>Transform objects with numeric precision &#10003;</li>
<li>Edit mesh topology with the core toolset &#10003;</li>
<li>Organize scenes and reuse assets across files &#10003;</li>
<li>Configure the application for any hardware &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Part I complete — next</div>
<p>Everything from here on is building games. Chapter 05 starts Pumpkin Run: a complete environment, real-time materials, lighting, animation, and sound — your first playable.</p></div>
` }

);
