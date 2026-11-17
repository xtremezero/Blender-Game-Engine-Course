/* Part I — Chapter 03: Introduction to 3D and Game Engines (34 slides) */

SLIDES.push(

{ ch: 3, t: "Chapter 03 — Introduction to 3D & Game Engines", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">03</div>
  <div class="ch-info">
    <h1>Introduction to 3D &amp; Game Engines</h1>
    <div class="ch-sub">Axes &middot; Points &middot; Lines &middot; Polygons &middot; Terminology &middot; Mesh &middot; Primitives &middot; Faces &middot; Materials &middot; Textures &middot; Engine Architecture</div>
  </div>
</div>
<div class="ch-goals">
  <h4>In this chapter you will</h4>
  <ul>
    <li>Own the complete vocabulary of real-time 3D — vertices to viewports</li>
    <li>Understand coordinate systems, spaces, and transformations</li>
    <li>Master the material &rarr; texture &rarr; UV chain and shading models</li>
    <li>Dissect game engine architecture: the loop, the scene, the logic model</li>
    <li>Learn why real-time rendering differs fundamentally from offline rendering</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>34</b> slides</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9734&#9734&#9734</b></span>
  <span class="ch-stat">theory <b>heavy</b></span>
</div>
` },

{ ch: 3, t: "What Is 3D Graphics?", h: `
<h3>The great illusion</h3>
<p>A screen is a flat, glowing grid of pixels. <em>3D graphics</em> is the industrial-scale production of the illusion of depth: describing objects as numerical data, simulating how light would bounce off them, and projecting the result onto that grid — <strong>60+ times per second</strong>.</p>

<div class="flow">
  <span class="fnode">Geometry<small>vertices in space</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Transformation<small>model &rarr; view &rarr; clip</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Rasterization<small>triangles &rarr; pixels</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Shading<small>material + light &rarr; color</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Framebuffer<small>the pixels you see</small></span>
</div>

<h3>Two regimes of the same math</h3>
<div class="cols2">
  <div class="card"><h4>Offline rendering</h4><p>Films, stills: rays traced for minutes or hours per frame. Physical fidelity first, time second.</p></div>
  <div class="card hot"><h4>Real-time rendering</h4><p>Games: a strict budget of ~16.6 ms per frame. Clever approximations, precomputation, and ruthless culling. <em>This course lives here.</em></p></div>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — Frame</div>
<p>One complete pass of the pipeline: input read &rarr; world simulated &rarr; scene drawn &rarr; buffer swapped. Everything in real-time engineering is the art of doing more inside one frame.</p></div>
` },

{ ch: 3, t: "Coordinate Systems & Axes", h: `
<h3>3D space needs three numbers</h3>
<p>Every point in 3D space is addressed by <em>(x, y, z)</em> measured along three perpendicular axes:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Axis</th><th>Blender / BGE</th><th>Color convention</th><th>Positive direction</th></tr></thead>
<tbody>
<tr><td>X</td><td>Left &rarr; right</td><td>Red</td><td>East</td></tr>
<tr><td>Y</td><td>Front &rarr; back</td><td>Green</td><td>Away from you (north)</td></tr>
<tr><td>Z</td><td><strong>Up</strong></td><td>Blue</td><td>Sky</td></tr>
</tbody></table></div>

<ul>
<li>Blender is <strong>Z-up, right-handed</strong>: point fingers from +X to +Y, thumb points to +Z.</li>
<li>Many other engines (Unity, Unreal) are <strong>Y-up</strong>; converting assets between them is mostly a &minus;90&deg; X rotation — a classic import gotcha.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Modeling a character &ldquo;lying down&rdquo; because a Y-up asset was imported into a Z-up world. Always verify axis convention at import, and set forward/up axes explicitly rather than eyeballing rotations.</p></div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Enable axis gizmo colors in your head permanently: <em>X red, Y green, Z blue</em>. Every transform constraint (<kbd>G</kbd> then <kbd>X</kbd>/<kbd>Y</kbd>/<kbd>Z</kbd>), every constraint axis, and half of all physics bugs resolve faster once axis reflexes are automatic.</p></div>
` },

{ ch: 3, t: "Local Space vs World Space", h: `
<h3>Two addresses for every object</h3>
<div class="cols2">
<div>
<h4>World (global) space</h4>
<ul>
<li>The single shared stage: (0,0,0) is the world origin.</li>
<li>Physics, lamps, camera live here.</li>
<li>&ldquo;Where is the chest?&rdquo; &rarr; world position.</li>
</ul>
</div>
<div>
<h4>Local space</h4>
<ul>
<li>Each object&rsquo;s private frame, origin at its own pivot.</li>
<li>Modeling and animation happen here.</li>
<li>&ldquo;Move the chest&rsquo;s lid 2 cm up&rdquo; &rarr; local translation.</li>
</ul>
</div>
</div>

<h3>Parenting builds a space hierarchy</h3>
<div class="flow">
  <span class="fnode">Scene<small>world</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Car<small>parent</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Wheel<small>child</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Hubcap<small>grandchild</small></span>
</div>
<ul>
<li>Child transforms are <em>inherited</em>: move the car, wheels follow; spin a wheel in local space, the hubcap rides along.</li>
<li>This hierarchy is exactly what you exploit in Chapters 5&ndash;8 (turrets on ships, cameras on players).</li>
</ul>

<div class="callout term"><div class="co-label">&#9670 Term — Pivot</div>
<p>The object&rsquo;s local origin — the point rotations and scaling happen around. A door modeled with its pivot at the center spins in place; modeled with the pivot at the hinge edge, it swings open. Pivot placement is a modeling decision with gameplay consequences.</p></div>
` },

{ ch: 3, t: "Points — Vertices", h: `
<h3>The atom of 3D: a position plus metadata</h3>
<p>A <strong>vertex</strong> (plural: vertices) is a point in space, but a <em>game-grade</em> vertex carries a full record:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Attribute</th><th>Typical data</th><th>Consumed by</th></tr></thead>
<tbody>
<tr><td>Position</td><td>3 floats (x, y, z)</td><td>Every stage — geometry exists because of this</td></tr>
<tr><td>Normal</td><td>3 floats, unit length</td><td>Lighting, backface culling</td></tr>
<tr><td>UV coordinate</td><td>2 floats (u, v)</td><td>Texture lookups in the shader</td></tr>
<tr><td>Vertex color</td><td>4 bytes (RGBA)</td><td>Cheap per-vertex tinting, AO baking</td></tr>
<tr><td>Bone weights</td><td>4 indices + 4 weights</td><td>Skeletal deformation (Chapter 10)</td></tr>
</tbody></table></div>

<div class="stats">
  <div class="stat"><b>3 &times; 4B</b><span>position only</span></div>
  <div class="stat"><b>~48 B</b><span>typical game vertex</span></div>
  <div class="stat"><b>1 M verts</b><span>&asymp; 48 MB just vertices</span></div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Vertex count is a memory <em>and</em> bandwidth budget. Real-time targets of this era: keep whole scenes in the low hundreds of thousands of vertices — details belong in normal maps (Ch. 05), not in vertex soup.</p></div>
` },

{ ch: 3, t: "Lines — Edges", h: `
<h3>Edges connect, and describe</h3>
<p>An <strong>edge</strong> is a straight segment joining two vertices. Alone, edges draw wireframes; combined into closed loops they become the scaffolding of faces and the control structure for deformation.</p>

<h3>Edge loops — the ones that matter</h3>
<ul>
<li>An <strong>edge loop</strong> is a chain of edges ringing a surface. Rings around a limb = clean bending under a skeleton (Chapter 10).</li>
<li><em>Edge flow</em> follows anatomy and mechanical function. Good flow deforms well; bad flow pinches and snaps under animation.</li>
<li>Loops also define silhouette density: extra loops where the silhouette curves (face profile), sparse loops on flat plates.</li>
</ul>

<div class="cols2">
  <div class="card hot"><h4>Boundary edge</h4><p>Belongs to exactly one face — the rim of an open mesh (&ldquo;hole&rdquo;). Detectable at runtime; often a modeling bug.</p></div>
  <div class="card"><h4>Interior edge</h4><p>Shared by two faces. Shared edges are what make a mesh <em>watertight</em> — the precondition for clean physics collision and subdivision.</p></div>
</div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Accidental interior faces and duplicate edges from sloppy extrusion. Symptom: shading glitches and physics holes that &ldquo;appear randomly.&rdquo; Fix with <em>Remove Doubles</em> / merge-by-distance and a non-manifold check (<em>Select &rarr; All by Trait &rarr; Non Manifold</em>).</p></div>
` },

{ ch: 3, t: "Polygons — Faces: Tris, Quads, N-gons", h: `
<h3>Surfaces from loops</h3>
<p>A <strong>face</strong> is a closed loop of 3+ edges bounding a surface patch. The GPU only understands one kind:</p>

<div class="cols3">
  <div class="card hot"><h4>Triangle (tri)</h4><p>3 vertices. <em>The only primitive the rasterizer draws.</em> Always planar, always convex — mathematically bulletproof.</p></div>
  <div class="card"><h4>Quad</h4><p>4 vertices. The artist&rsquo;s currency: clean edge flow, subdivides predictably. Internally stored as 2 tris.</p></div>
  <div class="card"><h4>N-gon</h4><p>5+ vertices. Convenient to model, dangerous to deform and shade — triangulation is decided by the importer, not by you.</p></div>
</div>

<h3>The production rule</h3>
<ul>
<li><strong>Model in quads</strong> (with tris where geometry genuinely is triangular).</li>
<li><strong>Let the engine triangulate</strong> at export — but <em>review</em> the triangulation on anything that deforms or catches silhouette light.</li>
<li>N-gons are fine on flat machined surfaces; never across a bend.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Before export, enter Edit Mode and triangulate preview (<kbd>Ctrl</kbd>+<kbd>T</kbd> on a copy, or viewport overlay). If switching to tris changes the silhouette or shading, fix the topology now — in-engine it will change it for the player.</p></div>
` },

{ ch: 3, t: "Normals — The Direction a Surface Faces", h: `
<h3>One bit that changes everything</h3>
<p>Each face has a <strong>normal</strong>: a unit vector perpendicular to its surface, declaring which side is &ldquo;out.&rdquo; The renderer trusts it blindly for two critical decisions:</p>
<ol>
<li><strong>Backface culling:</strong> faces pointing away from the camera are skipped — half your geometry vanishes from the workload for free.</li>
<li><strong>Lighting sign:</strong> <em>diffuse = max(dot(N, L), 0)</em>. A flipped normal makes a surface lit by light behind it — the classic &ldquo;black hole&rdquo; or &ldquo;impossible shadow&rdquo; bug.</li>
</ol>

<h3>Smooth vs flat shading</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mode</th><th>Normal behavior</th><th>Look</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Flat</td><td>One normal per face</td><td>Facetted, crystalline</td><td>Machine parts, gems, low-poly art</td></tr>
<tr><td>Smooth</td><td>Normals averaged per vertex, interpolated across the face</td><td>Continuous curvature</td><td>Organics, vehicles, terrain</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Inverted normals after mirroring or import: the model renders inside-out (you see the far side of its shell). Recalculate with <kbd>Ctrl</kbd>+<kbd>N</kbd> in Edit Mode, and enable <em>Backface Culling</em> in the material while modeling so flipped faces are <em>visible immediately</em>, not discovered at runtime.</p></div>
` },

{ ch: 3, t: "Mesh vs Object — Data and Instance", h: `
<h3>The single most useful distinction in the suite</h3>
<div class="cols2">
  <div class="card hot">
    <h4>Object</h4>
    <p>A <em>placed thing</em> in the scene: name, transform (position/rotation/scale), physics settings, logic bricks, parent. Says <strong>&ldquo;a barrel is HERE.&rdquo;</strong></p>
  </div>
  <div class="card">
    <h4>Mesh (data)</h4>
    <p>The shared geometry datablock: vertices, edges, faces, UVs, material slots. Says <strong>&ldquo;a barrel LOOKS like this.&rdquo;</strong></p>
  </div>
</div>

<h3>Consequences</h3>
<ul>
<li><strong>Many objects can share one mesh</strong> — 50 barrels in the level cost one mesh&rsquo;s worth of memory; each keeps its own transform and logic.</li>
<li><strong>Editing the mesh edits every instance</strong> — powerful and dangerous. &ldquo;Why did all my crates change?&rdquo; has this answer.</li>
<li>Duplicating with <kbd>Alt</kbd>+<kbd>D</kbd> shares the mesh; <kbd>Shift</kbd>+<kbd>D</kbd> copies it. In the game engine, both share rendering data — but linked instances share <em>everything</em>, including logic (Chapter 12&rsquo;s group workflow is built on this).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Environments are built from a kit of shared meshes, not unique art per prop. Target <em>hundreds of instances from dozens of meshes</em> — that ratio is what keeps memory and draw-call budgets survivable (see Ch. 13).</p></div>
` },

{ ch: 3, t: "Primitives — The Starter Kit", h: `
<h3>Every complex model begins as a simple one</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Primitive</th><th>Topology</th><th>Best starting point for</th></tr></thead>
<tbody>
<tr><td>Plane</td><td>4 verts, 1 quad</td><td>Ground, walls, UI quads, image planes</td></tr>
<tr><td>Cube</td><td>8 verts, 6 quads</td><td>Crates, buildings, blockouts, collision proxies</td></tr>
<tr><td>UV Sphere</td><td>Poles + rings</td><td>Balls, planets, pumpkins (Ch. 05)</td></tr>
<tr><td>Ico Sphere</td><td>Uniform triangles</td><td>Debris, stress-even deformation</td></tr>
<tr><td>Cylinder</td><td>Caps + side quads</td><td>Pipes, columns, wheels, torpedoes</td></tr>
<tr><td>Cone</td><td>Tip + base</td><td>Spikes, roofs, impact markers</td></tr>
<tr><td>Torus</td><td>Two ring axes</td><td>Rings, tires, tunnels (Ch. 06!)</td></tr>
<tr><td>Monkey</td><td>Fan favorite</td><td>Test subject for materials &amp; physics</td></tr>
</tbody></table></div>

<h3>Primitive discipline</h3>
<ul>
<li>Add with <kbd>Shift</kbd>+<kbd>A</kbd>, tune segments <em>before</em> leaving the operator panel — or use modifiers afterward instead of dense meshes.</li>
<li>Choose the primitive whose <em>flow</em> matches the target form: a pumpkin starts as a sphere with pole loops; a tunnel section starts as a torus/cylinder ring.</li>
</ul>
` },

{ ch: 3, t: "3D Terminology — Master Recap", h: `
<h3>The vocabulary contract</h3>
<p>Every later chapter uses these terms without re-explaining them. Audit yourself now:</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>One-line definition</th><th>First used in</th></tr></thead>
<tbody>
<tr><td>Vertex</td><td>Point in space + attributes (normal, UV, color, weights)</td><td>everywhere</td></tr>
<tr><td>Edge</td><td>Segment joining two vertices</td><td>Ch. 04 editing</td></tr>
<tr><td>Face / polygon</td><td>Closed loop of edges bounding a surface (drawn as tris)</td><td>Ch. 04&ndash;05</td></tr>
<tr><td>Mesh</td><td>Shared geometry datablock: verts + edges + faces + UVs</td><td>Ch. 04 instancing</td></tr>
<tr><td>Object</td><td>Placed instance with transform, physics, logic</td><td>Ch. 05+</td></tr>
<tr><td>Normal</td><td>Perpendicular direction declaring the outside face</td><td>Ch. 05 materials</td></tr>
<tr><td>UV</td><td>Per-vertex 2D address into a texture image</td><td>Ch. 02, 05</td></tr>
<tr><td>Material</td><td>Shading recipe: how a surface responds to light</td><td>Ch. 05</td></tr>
<tr><td>Texture</td><td>Image (or procedural) sampled by a material</td><td>Ch. 05</td></tr>
<tr><td>Pivot</td><td>Object-local origin; the anchor of rotate/scale</td><td>Ch. 06 turrets</td></tr>
<tr><td>Scene</td><td>World container: objects + world settings + camera(s)</td><td>Ch. 05 overlays</td></tr>
<tr><td>Logic tick</td><td>One pass of the game loop&rsquo;s simulation phase</td><td>Ch. 03, 13</td></tr>
</tbody></table></div>
` },

{ ch: 3, t: "Transformations — Translate, Rotate, Scale", h: `
<h3>The only three things you ever do to an object</h3>
<div class="cols3">
  <div class="card"><h4>Translate <kbd>G</kbd></h4><p>Move along a vector. 3 DOF. Grab, constrain to an axis, type exact values.</p></div>
  <div class="card"><h4>Rotate <kbd>R</kbd></h4><p>Turn around the pivot on a chosen axis. 3 DOF. Order of axes matters (see next slide).</p></div>
  <div class="card"><h4>Scale <kbd>S</kbd></h4><p>Stretch relative to the pivot. 3 DOF — beware non-uniform scale on physics objects.</p></div>
</div>

<h3>Hotkey grammar (reflexes you must build)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Sequence</th><th>Action</th></tr></thead>
<tbody>
<tr><td><kbd>G</kbd> <kbd>X</kbd> <code>3</code></td><td>Move 3 units along world X (then click/Enter)</td></tr>
<tr><td><kbd>R</kbd> <kbd>Z</kbd> <code>45</code></td><td>Rotate 45&deg; around Z</td></tr>
<tr><td><kbd>S</kbd> <kbd>Shift</kbd>+<kbd>Z</kbd></td><td>Scale in X/Y only (exclude Z)</td></tr>
<tr><td><kbd>G</kbd> <kbd>X</kbd> <kbd>X</kbd></td><td>Second press &rarr; <em>local</em> axis constraint</td></tr>
<tr><td><kbd>Alt</kbd>+<kbd>G</kbd> / <kbd>R</kbd> / <kbd>S</kbd></td><td>Clear translation / rotation / scale</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p><strong>Non-uniform scale on physics objects.</strong> Bullet assumes rigid bodies with well-conditioned shapes; squash-stretch scales (2, 1, 0.5) corrupt inertia tensors and produce jittery, sliding contacts. Apply scale (<kbd>Ctrl</kbd>+<kbd>A</kbd>) before enabling physics.</p></div>
` },

{ ch: 3, t: "Transform Math — Why Order Matters", h: `
<h3>Matrix thinking in 4 numbers</h3>
<p>Every object&rsquo;s placement is a single 4&times;4 matrix = translation + rotation + scale composed in a fixed order. The engine always applies them as:</p>

<pre data-lang="text"><code>world_pos = Translate &#8901; Rotate &#8901; Scale &#8901; local_pos
              (T)         (R)        (S)</code></pre>

<ul>
<li><strong>Scale first</strong> (stretches the model about its pivot), <strong>then rotate</strong> (spins the stretched model), <strong>then translate</strong> (carries it into the world).</li>
<li>Change the order and you change the result: rotate-then-scale along world axes smears the model diagonally. This is why &ldquo;apply scale/rotation&rdquo; exists — it bakes R/S into the mesh so the object matrix is a clean translation.</li>
</ul>

<h3>Euler vs quaternion rotation (know they exist)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Representation</th><th>Form</th><th>Strength</th><th>Weakness</th></tr></thead>
<tbody>
<tr><td>Euler XYZ</td><td>3 angles</td><td>Human-readable, great for editors</td><td>Gimbal lock: two axes align &rarr; lost DOF</td></tr>
<tr><td>Quaternion</td><td>4 numbers (x,y,z,w)</td><td>Slerp between any two orientations, no lock</td><td>Not intuitive to hand-edit</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>In BGE Python, <span class="chip acc">object.worldOrientation</span> is a 3&times;3 rotation matrix. Convert to Euler for readability, but interpolate with matrices/quaternions — lerping Euler angles produces spin-out bugs (used in Ch. 09 network smoothing).</p></div>
` },

{ ch: 3, t: "Materials — How Surfaces Respond to Light", h: `
<h3>The material contract</h3>
<p>A <strong>material</strong> is a recipe the renderer follows per pixel (or per vertex, in cheap modes): which colors come from paint (diffuse), which from shine (specular), which from within (emission), and how transparent the surface is. Geometry says <em>shape</em>; material says <em>substance</em>.</p>

<h3>The classic Blinn-Phong decomposition</h3>
<pre data-lang="glsl"><code>finalColor = ambient
            + diffuse   * max(dot(N, L), 0)          // matte body
            + specular  * pow(max(dot(N, H), 0), hardness)  // glossy highlight
            + emission                                // self-glow</code></pre>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Channel</th><th>Question it answers</th><th>Typical range</th></tr></thead>
<tbody>
<tr><td>Diffuse</td><td>What color is the paint?</td><td>RGB, keep saturation moderate</td></tr>
<tr><td>Specular</td><td>How bright is the shine?</td><td>0&ndash;1 scalar or RGB tint</td></tr>
<tr><td>Hardness</td><td>How tight is the highlight?</td><td>1 (plastic) &ndash; 500 (metal/glass)</td></tr>
<tr><td>Ambient</td><td>How much bounce light fills shadow?</td><td>0&ndash;1</td></tr>
<tr><td>Emit</td><td>Does it glow by itself?</td><td>0&ndash;1 (also cheap fake lighting)</td></tr>
<tr><td>Alpha</td><td>How see-through is it?</td><td>0&ndash;1 + blend mode (Ch. 02)</td></tr>
</tbody></table></div>
` },

{ ch: 3, t: "Shading Models — Lambert to Toon", h: `
<h3>Diffuse models — how paint responds to light</h3>
<div class="cols2">
  <div class="card hot"><h4>Lambert</h4><p><em>diffuse &times; dot(N,L)</em>. Matte, paper-like. The default; cheapest correct answer.</p></div>
  <div class="card"><h4>Oren-Nayar</h4><p>Lambert + roughness. Chalk, clay, moon dust — flat surfaces that still scatter.</p></div>
  <div class="card"><h4>Toon</h4><p>dot(N,L) snapped into 2&ndash;3 bands. Cartoon style; the band edges are the style.</p></div>
  <div class="card"><h4>Minnaert</h4><p>Darkens edges facing away — velvet, dusty stone.</p></div>
</div>

<h3>Specular models — the shape of the highlight</h3>
<ul>
<li><strong>CookTorr:</strong> physically-inspired, wide soft lobe — general metal/plastic.</li>
<li><strong>Phong / Blinn:</strong> classic tight highlight; Blinn uses half-vector H = normalize(L+V), cheaper and more stable at grazing angles.</li>
<li><strong>WardIso:</strong> anisotropic — brushed metal, hair (streaked shine).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Defaults win: <strong>Lambert + CookTorr</strong> covers 90% of real-time assets. Reserve exotic models for hero props, and always A/B them <em>in the runtime lighting</em>, not in a viewport that will not exist in the shipped game.</p></div>
` },

{ ch: 3, t: "Textures — Images Feeding Materials", h: `
<h3>Channels of information</h3>
<p>A texture is any data array a material samples — usually an image, sometimes math. Production assets split information across purpose-built maps:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Map</th><th>Stores</th><th>Effect</th></tr></thead>
<tbody>
<tr><td>Diffuse / albedo</td><td>Base paint color (+ baked AO sometimes)</td><td>What the surface <em>is</em></td></tr>
<tr><td>Normal map</td><td>Per-pixel surface slope (RGB-encoded)</td><td>Fake geometric detail — rivets, cloth, pores</td></tr>
<tr><td>Specular map</td><td>Shine intensity/color per pixel</td><td>Wet, oily, metallic patches</td></tr>
<tr><td>Emit map</td><td>Self-illumination mask</td><td>Windows, screens, magic runes</td></tr>
<tr><td>Alpha map</td><td>Opacity per pixel</td><td>Foliage, fences, fading effects</td></tr>
</tbody></table></div>

<div class="stats">
  <div class="stat"><b>1024&sup2;</b><span>hero prop</span></div>
  <div class="stat"><b>512&sup2;</b><span>standard prop</span></div>
  <div class="stat"><b>256&sup2;</b><span>background / tiling detail</span></div>
  <div class="stat"><b>&times;4</b><span>memory per mipmap chain level (RGBA8)</span></div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Memory math is unforgiving: one 1024&times;1024 RGBA texture = 4 MB, and with mipmaps &asymp; 5.3 MB of VRAM. A scene with 100 such textures is over 500 MB before a single mesh loads. Budget texture sizes explicitly per asset class.</p></div>
` },

{ ch: 3, t: "Texture Mapping — Getting Pixels Onto Surfaces", h: `
<h3>Mapping coordinates: how the shader picks UVs</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Coordinates</th><th>Source of (u,v)</th><th>Used for</th></tr></thead>
<tbody>
<tr><td><strong>UV</strong></td><td>Per-vertex unwrap (artist-authored)</td><td>Everything hand-textured — the default</td></tr>
<tr><td>Generated</td><td>Object bounding box (auto)</td><td>Quick procedural tests; breaks under deformation</td></tr>
<tr><td>Object</td><td>Another object&rsquo;s transform</td><td>Projected effects, blending between objects</td></tr>
<tr><td>Reflection / Cube</td><td>View direction reflected off the normal</td><td>Chrome, env sheen</td></tr>
<tr><td>Window</td><td>Screen position</td><td>Screen-space effects (rare in this pipeline)</td></tr>
<tr><td>Strand / Particle</td><td>Per-particle coordinates</td><td>Varying color along particles</td></tr>
</tbody></table></div>

<h3>The projector metaphor</h3>
<ul>
<li>Every mapping mode is a <em>projector</em>: it computes (u,v) for each fragment at render time.</li>
<li>UV mapping is the only mode you fully control per-vertex — which is why production always converges on it.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Texturing with <em>Generated</em> coordinates, then rotating the object at runtime: the texture swims/slidess across the surface because coordinates depend on the object&rsquo;s bounding box. If it will move, animate, or deform — unwrap it.</p></div>
` },

{ ch: 3, t: "UV Mapping Deep Dive", h: `
<h3>Unwrapping = flattening a skin</h3>
<p>Unwrapping computes per-vertex UVs by cutting the mesh into pieces (seams) and flattening them into the 0&ndash;1 texture square with minimal distortion — literally flattening an orange peel onto paper.</p>

<div class="flow">
  <span class="fnode">Mark seams<small>edges to cut</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Unwrap<small>angle-based solver</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Pack islands<small>fill the square</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Paint<small>under the layout</small></span>
</div>

<h3>Craft rules</h3>
<ul>
<li><strong>Cut where the eye doesn&rsquo;t look:</strong> behind limbs, under bases, along hard edges that hide seams.</li>
<li><strong>Scale consistency:</strong> equal world area &rarr; equal texture density. Otherwise paint smears on some parts. Check with a checker texture first.</li>
<li><strong>Islands rotation:</strong> align islands to axes where possible — straight lines compress better and pixel-cache better.</li>
<li><strong>Shared texture space:</strong> multiple objects can share one atlas (Ch. 05 environment pack) — huge draw-call savings.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Always apply a colored checker before painting. Distortion, mirrored islands you didn&rsquo;t intend, and density mismatches pop instantly in checks, saving hours of repainting.</p></div>
` },

{ ch: 3, t: "Image Formats for Real-Time", h: `
<h3>Choose for the GPU, not for the archive</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Format</th><th>Alpha</th><th>Compression</th><th>Real-time verdict</th></tr></thead>
<tbody>
<tr><td>PNG</td><td>Yes</td><td>Lossless ZIP</td><td><strong>Working format of choice</strong> — exact pixels, transparency</td></tr>
<tr><td>JPG</td><td>No</td><td>Lossy</td><td>Photographic backgrounds only; artifacts amplify under normal-mapping</td></tr>
<tr><td>TGA</td><td>Yes</td><td>None/RLE</td><td>Legacy lossless; large files, fine support</td></tr>
<tr><td>DDS</td><td>Yes</td><td>GPU-native (DXT/S3TC)</td><td>Best for large surfaces: compressed <em>in VRAM</em> &asymp; 6&ndash;8&times; smaller</td></tr>
<tr><td>BMP</td><td>Limited</td><td>None</td><td>Never — no advantage, huge files</td></tr>
<tr><td>EXR/HDR</td><td>Yes</td><td>Float</td><td>Offline baking/lighting data only</td></tr>
</tbody></table></div>

<h3>Power-of-two is still law for tiling</h3>
<ul>
<li>256, 512, 1024, 2048&hellip; mipmapping chains cleanly and tiling wraps without seams.</li>
<li>Non-POT works for UI decals on modern hardware, but tiling textures stay POT.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Pipeline: author in layered PNG/Krita &rarr; bake final to PNG (props) or DDS (large tiled surfaces). Keep the layered masters; ship the flat exports.</p></div>
` },

{ ch: 3, t: "Rendering Pipeline — Fixed Function to Programmable", h: `
<h3>Two eras of GPU</h3>
<div class="cols2">
  <div class="card">
    <h4>Fixed-function (pre-2002)</h4>
    <p>The GPU offered a hardwired menu: this lighting model, these blend modes, this fog. Multitexture stage combiners chained a few textures. Fast, rigid — the Multitexture mode of this engine is its living fossil.</p>
  </div>
  <div class="card hot">
    <h4>Programmable (GLSL era)</h4>
    <p>You write the two programs: a <strong>vertex shader</strong> (per-vertex: transforms, lighting setup) and a <strong>fragment/pixel shader</strong> (per-pixel: final color). The menu became a programming language.</p>
  </div>
</div>

<h3>The stages as data flow</h3>
<div class="flow">
  <span class="fnode">Vertex fetch<small>attributes</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Vertex shader<small>your code</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Rasterizer<small>tris &rarr; fragments</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Fragment shader<small>your code</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Blend &amp; depth test<small>framebuffer</small></span>
</div>

<div class="callout note"><div class="co-label">&#9432 Note</div>
<p>BGE&rsquo;s three shading modes (TexFace &rarr; Multitexture &rarr; GLSL) are literally a walk through GPU history. Choosing a mode is choosing <em>which decade of hardware</em> you program for — Chapter 08 writes custom GLSL into this pipeline.</p></div>
` },

{ ch: 3, t: "The Vertex Pipeline in Detail", h: `
<h3>Spaces every vertex crosses</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Space</th><th>Transform</th><th>Question it answers</th></tr></thead>
<tbody>
<tr><td>Model (object) space</td><td>&mdash;</td><td>Where on the mesh is this vertex?</td></tr>
<tr><td>World space</td><td>&times; object matrix</td><td>Where in the scene is it?</td></tr>
<tr><td>View (eye) space</td><td>&times; inverse camera matrix</td><td>Where is it relative to the camera?</td></tr>
<tr><td>Clip space</td><td>&times; projection matrix</td><td>Is it inside the frustum (and at what depth)?</td></tr>
<tr><td>Normalized device coords</td><td>perspective divide</td><td>Where on screen? (x,y in &minus;1&hellip;1)</td></tr>
<tr><td>Window space</td><td>viewport transform</td><td>Which pixel?</td></tr>
</tbody></table></div>

<pre data-lang="glsl"><code>// Vertex shader: the whole job in two lines of GLSL
gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;  // to clip space
gl_TexCoord[0] = gl_MultiTexCoord0;                       // pass UVs along</code></pre>

<div class="callout term"><div class="co-label">&#9670 Term — Frustum</div>
<p>The truncated pyramid of the camera&rsquo;s vision. <strong>Frustum culling</strong> skips objects fully outside it — automatic, and the single most effective performance feature the renderer gives you for free (see Ch. 13).</p></div>
` },

{ ch: 3, t: "What Is a Game Engine?", h: `
<h3>The machine that keeps the illusion alive</h3>
<p>A renderer draws a still image. A <strong>game engine</strong> is the complete machine that produces a <em>living</em> one: it reads players, advances the world by the clock, resolves collisions, plays sound, and orders the renderer around — every frame, forever, without falling behind.</p>

<h3>The canonical subsystems</h3>
<div class="cols3">
  <div class="card"><h4>Platform &amp; I/O</h4><p>Window, input devices, clocks, file system</p></div>
  <div class="card"><h4>Simulation</h4><p>Game logic, scripting, entity state</p></div>
  <div class="card"><h4>Physics</h4><p>Collision detection + rigid body solver (Bullet)</p></div>
  <div class="card"><h4>Rendering</h4><p>Culling, materials, shaders, cameras</p></div>
  <div class="card"><h4>Audio</h4><p>Sample playback, 3D positioning, mixing</p></div>
  <div class="card"><h4>Assets &amp; scene</h4><p>Loading, instancing, lifetime management</p></div>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — Engine vs Framework</div>
<p>An <strong>engine</strong> owns the loop and calls your code at defined moments (logic ticks, collisions). A <strong>framework/library</strong> provides functions <em>you</em> call from a loop you own. BGE is an engine embedded in a DCC tool — you will feel both sides of this contract.</p></div>
` },

{ ch: 3, t: "The Game Loop — Heart of Every Engine", h: `
<h3>One frame, end to end</h3>
<pre data-lang="python"><code># The canonical real-time game loop (every engine you will ever use)
while running:
    frame_start = now()

    pump_events()                     # 1. OS/window/input events in
    dt = now() - last_time            # 2. elapsed time since previous frame

    for sensor in sensors:            # 3. SENSORS - poll world &amp; input
        sensor.poll()

    for controller in controllers:    # 4. CONTROLLERS - decide
        if controller.evaluate():
            controller.trigger_actuators()

    physics.step(fixed_dt)            # 5. PHYSICS - Bullet steps the world
    for message in messages:          # 6. MESSAGES - deliver queued events
        deliver(message)
    audio.update(listener)            # 7. AUDIO - positions &amp; buffers
    render(scene, camera)             # 8. RENDER - cull, draw, swap

    last_time = frame_start           # 9. BOOKKEEPING - profiling, sleep</code></pre>

<h3>Why logic and physics are separate phases</h3>
<ul>
<li><strong>Logic runs at render rate</strong> (every frame, order-sensitive per object).</li>
<li><strong>Physics runs at a fixed rate</strong> (deterministic simulation — required for stable stacking/contacts).</li>
<li>At high fps the loop may run logic twice per physics step; at low fps, physics may sub-step twice to catch up. Design logic to be rate-tolerant from day one.</li>
</ul>
` },

{ ch: 3, t: "BGE Architecture — Scenes, Objects, Properties", h: `
<h3>The runtime world model</h3>
<div class="flow">
  <span class="fnode hot">Scene<small>world: gravity, mist, active camera</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Objects<small>transform + mesh + physics + logic</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Properties<small>game variables per object</small></span>
</div>

<h3>Key architectural facts</h3>
<ul>
<li><strong>Layers = staging areas.</strong> Layers 1&ndash; visible at scene start are live; objects on hidden layers exist but are <em>inactive</em> — the classic spawning pool (Ch. 06 enemies).</li>
<li><strong>Scenes can stack.</strong> A HUD/overlay scene renders above the gameplay scene; multiple scenes may run in parallel (split-screen, Ch. 12).</li>
<li><strong>Properties are the data model.</strong> Typed (Float, Int, String, Bool, Timer), per-object, cheap to read from logic bricks and Python — the glue between art and code.</li>
<li><strong>Cameras are objects.</strong> Any camera + the scene&rsquo;s active camera pointer; switching cameras is a logic actuator away.</li>
</ul>

<div class="callout term"><div class="co-label">&#9670 Term — Overlay Scene</div>
<p>A scene added on top of the current one (Add Scene actuator) that shares the screen — transparent where it draws nothing. The standard architecture for HUDs, menus, and split-screen viewports.</p></div>
` },

{ ch: 3, t: "BGE Architecture — The Logic Model", h: `
<h3>Sensors &rarr; Controllers &rarr; Actuators, formally</h3>
<div class="flow">
  <div class="fgroup"><span class="glabel">INPUT</span>
    <span class="fnode hot">Sensors<small>keyboard, mouse, collision,<br>radar, ray, message, property&hellip;</small></span>
  </div>
  <span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">LOGIC</span>
    <span class="fnode">Controllers<small>AND / OR / XOR / Python</small></span>
  </div>
  <span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">OUTPUT</span>
    <span class="fnode hot">Actuators<small>motion, action, sound, scene,<br>edit object, message, state&hellip;</small></span>
  </div>
</div>

<h3>Pulse semantics — the physics of logic</h3>
<ul>
<li>Every tick, each sensor emits <em>true</em> or <em>false</em>. &ldquo;Firing&rdquo; = a <strong>positive pulse</strong> (false&rarr;true transition).</li>
<li><strong>Level:</strong> fire on <em>edge</em> (transition) or on <em>level</em> (continuous state).</li>
<li><strong>Tap:</strong> fire only once per press, even if held.</li>
<li><strong>Invert:</strong> swap true/false — a NOT gate for free.</li>
<li><strong>Frequency (skip):</strong> poll every N logic ticks — the first and cheapest optimization lever (Ch. 13).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Think in <em>pulses</em>, not in &ldquo;things happening.&rdquo; 90% of beginner logic bugs are level-vs-edge confusion: &ldquo;it fires every frame while I hold the key&rdquo; means you wanted <strong>Tap</strong> or an edge-triggered setup.</p></div>
` },

{ ch: 3, t: "Sensors — The Input Layer", h: `
<h3>Ways the world can poke your objects</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Sensor</th><th>Fires when&hellip;</th><th>Chapter</th></tr></thead>
<tbody>
<tr><td>Keyboard</td><td>Key events (all keys, with Tap/Level modes)</td><td>Ch. 02, 05</td></tr>
<tr><td>Mouse</td><td>Click/Move/Over any object or over <em>this</em> object</td><td>Ch. 06, 11</td></tr>
<tr><td>Collision</td><td>Physics contact with a body (optionally a named prop)</td><td>Ch. 05, 07</td></tr>
<tr><td>Touch</td><td>Static-collider contact (cheap, no dynamics)</td><td>Ch. 07</td></tr>
<tr><td>Near</td><td>Object enters a spherical radius</td><td>Ch. 08</td></tr>
<tr><td>Radar</td><td>Object enters a oriented cone/box FOV</td><td>Ch. 08, 12</td></tr>
<tr><td>Ray</td><td>A cast ray hits something (X-ray option)</td><td>Ch. 06, 08</td></tr>
<tr><td>Message</td><td>A logic message arrives (subject + body)</td><td>Ch. 05, 11</td></tr>
<tr><td>Property</td><td>A property equals / changes / exceeds a value</td><td>Ch. 05&ndash;07</td></tr>
<tr><td>Always / Delay / Random</td><td>Every tick / after N ticks / random chance</td><td>everywhere</td></tr>
<tr><td>Joystick</td><td>Axis / button / hat events</td><td>Ch. 08</td></tr>
</tbody></table></div>
<p>All sensors share the common settings from the previous slide — frequency, invert, level, tap — that is the entire sensor grammar.</p>
` },

{ ch: 3, t: "Controllers — The Decision Layer", h: `
<h3>Boolean glue plus one escape hatch</h3>
<div class="cols2">
<div>
<h4>Logic gates</h4>
<ul>
<li><strong>AND</strong> — all linked sensors true (the default).</li>
<li><strong>OR</strong> — any linked sensor true.</li>
<li><strong>XOR</strong> — exactly one true (odd count of true inputs).</li>
<li><strong>NAND / NOR / XNOR</strong> — the inverted trio.</li>
</ul>
<p>Gates see the <em>instantaneous</em> state of all linked sensors; they hold no memory. Sequences over time need properties or Python.</p>
</div>
<div>
<h4>Python controller</h4>
<p>Two flavors:</p>
<ul>
<li><strong>Script:</strong> file executed top-to-bottom each positive pulse (classic, simple).</li>
<li><strong>Module:</strong> <span class="chip acc">module.function</span> called instead — faster (no recompile), state can live in the module, and imports persist. The production choice.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Keep bricks for <em>wiring</em> and Python for <em>behavior</em>. A healthy project: keyboard/collision sensors + AND gates wired to thin actuators, with one Python module per system (score, spawning, AI). This is the pattern every project chapter of this course uses.</p></div>
` },

{ ch: 3, t: "Actuators — The Effect Layer", h: `
<h3>What logic can actually do</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Actuator</th><th>Effect</th><th>Signature use</th></tr></thead>
<tbody>
<tr><td>Motion</td><td>Forces, torque, translation, rotation, servo</td><td>Player &amp; vehicle control (Ch. 05, 07, 08)</td></tr>
<tr><td>Action</td><td>Play/blend skeletal animation clips</td><td>Characters (Ch. 05, 10)</td></tr>
<tr><td>Edit Object</td><td>Add/End objects, replace mesh, track</td><td>Spawning bullets, pickups (Ch. 06)</td></tr>
<tr><td>Sound</td><td>Play/pitch/loop a sound file, 3D optional</td><td>Feedback (Ch. 05, 07)</td></tr>
<tr><td>Camera</td><td>Follow-target camera behavior</td><td>Chase cameras (Ch. 08)</td></tr>
<tr><td>Constraint</td><td>Runtime constraints (track to, etc.)</td><td>Aiming (Ch. 06)</td></tr>
<tr><td>Scene</td><td>Restart / set / add / remove / suspend scenes</td><td>Levels, HUDs (Ch. 06, 12)</td></tr>
<tr><td>Message</td><td>Send subject+body to objects/scenes</td><td>Decoupled systems (Ch. 11)</td></tr>
<tr><td>Random</td><td>Write a random number into a property</td><td>Variation (Ch. 06)</td></tr>
<tr><td>Visibility</td><td>Show/hide self or children</td><td>Reveal states (Ch. 11)</td></tr>
<tr><td>State</td><td>Switch the object&rsquo;s logic state mask</td><td>AI brains (Ch. 12)</td></tr>
<tr><td>2D Filter / Parent / Armature / Game / Steer</td><td>Specialized</td><td>See Ch. 13 reference</td></tr>
</tbody></table></div>
` },

{ ch: 3, t: "Physics — The Bullet Engine", h: `
<h3>Somebody else&rsquo;s very good math</h3>
<p>BGE delegates simulation to <strong>Bullet Physics</strong> — an open-source rigid-body solver used from games to robotics. You do not write integrators; you configure bodies and constraints, and Bullet advances the world at a fixed timestep.</p>

<h3>What Bullet gives you</h3>
<ul>
<li><strong>Rigid body dynamics:</strong> mass, inertia, forces, impulses, friction, restitution (bounciness), damping.</li>
<li><strong>Collision detection:</strong> broad-phase (sweep and prune) + narrow-phase (GJK/EPA on convex shapes) + contact generation.</li>
<li><strong>Constraints/joints:</strong> fixed, point, hinge, slider, motor, spring — pinball flippers live here (Ch. 07).</li>
<li><strong>Character controllers &amp; vehicles:</strong> specialized solvers on top of the core.</li>
</ul>

<h3>The body-type menu (memorize now)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Type</th><th>Behavior</th><th>Example</th></tr></thead>
<tbody>
<tr><td>None / No collision</td><td>Ignored by physics</td><td>Decor, UI</td></tr>
<tr><td>Static</td><td>Infinite mass, never moves</td><td>Ground, walls</td></tr>
<tr><td>Dynamic</td><td>Full rigid body</td><td>Crates, balls</td></tr>
<tr><td>Rigid body</td><td>Dynamic + torque response</td><td>Debris, ragdolls</td></tr>
<tr><td>Soft body</td><td>Deforming mesh body</td><td>Cloth, jelly</td></tr>
<tr><td>Ghost / Sensor</td><td>Overlaps without pushing</td><td>Triggers, pickups</td></tr>
</tbody></table></div>
` },

{ ch: 3, t: "Real-Time vs Offline Rendering", h: `
<h3>The same math, opposite constraints</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Dimension</th><th>Offline (film/Cycles)</th><th>Real-time (game/GLSL)</th></tr></thead>
<tbody>
<tr><td>Time budget</td><td>Minutes&ndash;hours per frame</td><td>16.6 ms @ 60 fps <em>total</em></td></tr>
<tr><td>Light transport</td><td>Full ray tracing, global illumination</td><td>Rasterization + approximations (per-pixel lights, baked AO)</td></tr>
<tr><td>Shadows</td><td>Accurate area shadows</td><td>Shadow maps (depth from light), fixed resolution</td></tr>
<tr><td>Materials</td><td>Physical BSDFs</td><td>Blinn-Phong-style analytic lobes</td></tr>
<tr><td>Changes after render</td><td>Impossible — re-render</td><td>Everything can move every frame</td></tr>
<tr><td>Failure mode</td><td>Longer render</td><td>Dropped frames &mdash; the game stutters</td></tr>
</tbody></table></div>

<h3>The real-time survival kit (used all course long)</h3>
<ul>
<li><strong>Bake what doesn&rsquo;t move:</strong> lightmaps/AO into textures (Ch. 05).</li>
<li><strong>Approximate what does:</strong> per-pixel Blinn-Phong, blob shadows.</li>
<li><strong>Cull what can&rsquo;t be seen:</strong> frustum, occlusion, layers (Ch. 13).</li>
<li><strong>Cache what repeats:</strong> shared meshes, display lists, vertex buffers.</li>
</ul>
` },

{ ch: 3, t: "Frame Rate & the Performance Budget", h: `
<h3>Arithmetic every engineer must do in their sleep</h3>
<div class="stats">
  <div class="stat"><b>1000 ms</b><span>= 1 s</span></div>
  <div class="stat"><b>16.6 ms</b><span>60 fps frame</span></div>
  <div class="stat"><b>33.3 ms</b><span>30 fps frame</span></div>
  <div class="stat"><b>8.3 ms</b><span>120 fps frame</span></div>
</div>

<h3>A typical 60 fps budget</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Phase</th><th>Budget</th><th>Spends on</th></tr></thead>
<tbody>
<tr><td>Logic</td><td>4 ms</td><td>Sensors, controllers, Python</td></tr>
<tr><td>Physics</td><td>3 ms</td><td>Bullet step, collisions, constraints</td></tr>
<tr><td>Animation</td><td>2 ms</td><td>Armature pose evaluation</td></tr>
<tr><td>Render</td><td>6 ms</td><td>Culling, draw submission, GPU</td></tr>
<tr><td>Audio + OS</td><td>1.6 ms</td><td>Mixing, buffer swaps</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Turn on <em>Game &rarr; Show Framerate and Profile</em> for the whole project lifetime. Optimize only what the profiler names — never intuition. A 40% logic frame is a design smell (too many always-sensors), not a reason to compress textures.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Optimizing at the end. Performance is architectural: layer discipline, sensor frequency, shared meshes, texture budgets — all decided in week one. Chapter 13 turns this list into a checklist.</p></div>
` },

{ ch: 3, t: "Engine Architecture — Data Flow in BGE", h: `
<h3>The full machine on one slide</h3>
<div class="flow">
  <span class="fnode">Input devices<small>keyboard, mouse, joystick</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Logic system<small>sensors &rarr; controllers &rarr; actuators<br>+ Python scripts</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Scene graph<small>objects, parents, properties</small></span>
</div>
<div class="flow">
  <span class="fnode">Scene graph</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Bullet<small>integration &amp; contacts<br>@ fixed 60 Hz</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Animation mixer<small>actions, NLA layers</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Renderer<small>cull &rarr; sort &rarr; GLSL &rarr; framebuffer</small></span>
</div>
<div class="flow">
  <span class="fnode">Renderer</span><span class="farrow">+</span>
  <span class="fnode">Audio<small>3D positioned samples</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Present<small>buffer swap &rarr; next frame</small></span>
  <span class="farrow">&larr;</span>
  <span class="fnode">Messages &amp; scenes<small>deferred to next tick</small></span>
</div>

<h3>Two cross-cutting buses</h3>
<ul>
<li><strong>Message bus:</strong> asynchronous, subject-addressed — effects this tick are delivered next tick (source of &ldquo;one frame delay&rdquo; behaviors).</li>
<li><strong>Property reads:</strong> synchronous within logic evaluation — reading a property is instant, which is why game state lives in properties.</li>
</ul>
` },

{ ch: 3, t: "Comparing Engine Architectures", h: `
<h3>The same skeleton, different organs</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Concept</th><th>BGE / UPBGE</th><th>Godot</th><th>Unity</th><th>Unreal</th></tr></thead>
<tbody>
<tr><td>World unit</td><td>Scene &rarr; Objects</td><td>Scene tree &rarr; Nodes</td><td>Scene &rarr; GameObjects</td><td>Level &rarr; Actors</td></tr>
<tr><td>Behavior</td><td>Logic bricks + Python</td><td>Scripts on nodes + signals</td><td>Components (MonoBehaviour)</td><td>Actor + Blueprint</td></tr>
<tr><td>Events in</td><td>Sensors</td><td>Input / signal callbacks</td><td>Input System / SendMessage</td><td>Enhanced Input / delegates</td></tr>
<tr><td>Effects out</td><td>Actuators</td><td>Node APIs</td><td>Component APIs</td><td>Blueprint actions</td></tr>
<tr><td>Physics</td><td>Bullet</td><td>Godot Physics / Bullet</td><td>PhysX</td><td>Chaos</td></tr>
<tr><td>Shading</td><td>GLSL nodes / text</td><td>GDShader (GLSL-like)</td><td>HLSL / Shader Graph</td><td>HLSL / node graphs</td></tr>
</tbody></table></div>

<div class="callout note"><div class="co-label">&#9432 Note — why this transfers</div>
<p>Strip the brand names and every row is the same role: a world container, a behavior unit, an event-in channel, an effect-out channel, a solver, and a shading language. Learn the <em>roles</em> here and every future engine is a translation exercise.</p></div>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>When porting logic from this course: sensor &rarr; input poll, AND controller &rarr; if-statement, actuator &rarr; API call, property &rarr; member variable, message &rarr; signal/event. The translation is mechanical — the <em>design</em> is what you actually learned.</p></div>
` },

{ ch: 3, t: "Chapter 03 — Pitfalls & Best Practices", h: `
<h3>Foundation-level discipline</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Unit chaos.</strong> One blend mixes meters and centimeters; physics explodes because &ldquo;gravity feels weak.&rdquo; Decide: <em>1 unit = 1 meter</em>, always (Ch. 07 depends on it absolutely).</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Modeling at wrong scale</strong> then scaling objects at runtime. Apply scale (<kbd>Ctrl</kbd>+<kbd>A</kbd>) before physics, parenting, or exporting.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Frame-rate-dependent logic</strong> (per-frame rotation deltas). Use forces, servo control, or delta-time multiplication.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Name everything</strong> — objects, materials, properties, actions. <span class="chip acc">gun_muzzle_empty</span> beats <span class="chip">Empty.007</span> in every debugger ever made.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Model on the origin plane</strong>, pivot at the functional anchor (hinge, muzzle, foot), so logic can assume clean local axes.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Profile from day one;</strong> treat the fps counter as a design tool, not a QA step.</p></div>
</div>
</div>
` },

{ ch: 3, t: "Chapter 03 — Knowledge Check", h: `
<h3>Verify before proceeding</h3>
<ol>
<li>A quad is drawn on the GPU as ______. Why does that matter for deformation?</li>
<li>A character&rsquo;s arm turns black on one side after import. Which vertex attribute do you suspect, and what is the fix?</li>
<li>You rotate 90&deg; around X then 90&deg; around Z. Is that the same as Z-then-X? What does this tell you about the transform matrix?</li>
<li>Name the three logic-brick roles and the pulse semantics of <em>Tap</em> vs <em>Level</em>.</li>
<li>Why does physics step at a fixed rate while logic steps per frame? What breaks if physics used variable dt?</li>
<li>Your frame budget is 16.6 ms. Name the four phases that spend it and one optimization for each.</li>
<li>Translate to another engine: a <em>Property sensor + AND + Motion actuator</em> becomes what in Unity terms?</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Read any mesh like an engineer: verts, edges, faces, normals, UVs &#10003;</li>
<li>Explain materials, textures, shading models, and the real-time pipeline &#10003;</li>
<li>Describe the game loop and BGE&rsquo;s sensor/controller/actuator model &#10003;</li>
<li>Budget a frame and speak engine-agnostic architecture &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 04 puts tools in your hands: the Blender interface, navigation reflexes, object manipulation, Edit Mode, and the preferences that make a machine yours.</p></div>
` }

);
