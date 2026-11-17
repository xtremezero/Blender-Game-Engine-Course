/* Part IV — Chapter 14: Appendix (16 slides) */

SLIDES.push(

{ ch: 14, t: "Chapter 14 — Appendix", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">14</div>
  <div class="ch-info">
    <h1>Appendix</h1>
    <div class="ch-sub">Installation &middot; Support &middot; Foundation &middot; Community Resources &middot; Migration &middot; Glossary</div>
  </div>
</div>
<div class="ch-goals">
  <h4>In this final chapter</h4>
  <ul>
    <li>Install and configure the toolchain (legacy Blender and UPBGE)</li>
    <li>Troubleshoot the classics &mdash; drivers, audio, portable setups</li>
    <li>Find support channels and community resources that still thrive</li>
    <li>Migrate every concept from this course to modern engines</li>
    <li>Own the complete glossary &mdash; the course&rsquo;s vocabulary, A to Z</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>16</b> slides</span>
  <span class="ch-stat">reference <b>+ ops</b></span>
</div>
` },

{ ch: 14, t: "Installation — Getting the Software", h: `
<h3>Two honest paths</h3>
<div class="cols2">
  <div class="card">
    <h4>Legacy Blender (2.49&ndash;2.79)</h4>
    <ul>
    <li>Download from the release archive (download.blender.org/release) &mdash; pick 2.79b for the final BGE-era build.</li>
    <li><strong>Portable:</strong> the ZIP runs uninstalled &mdash; keep it in a path without spaces, run the exe.</li>
    <li>Best for: pixel-faithful legacy tutorials and this course&rsquo;s brick-by-brick screenshots.</li>
    </ul>
  </div>
  <div class="card hot">
    <h4>UPBGE (the living fork)</h4>
    <ul>
    <li>upbge.org &mdash; a full Blender distribution with the engine maintained and modernized.</li>
    <li>Same installation story: installer or portable archive.</li>
    <li>Best for: <strong>actually building today</strong> &mdash; current hardware, Python 3, active fixes.</li>
    </ul>
  </div>
</div>

<h3>Versioning discipline</h3>
<ul>
<li><strong>One project = one pinned version</strong>, recorded in the conventions block. Mixed-version teams desync subtly (defaults drift between builds).</li>
<li>Keep installers in the project archive &mdash; a 2.79 runtime in 2030 needs a 2.79 player.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Install <em>both</em>: legacy for course fidelity, UPBGE for real work. Portable copies side by side (folders <span class="chip acc">blender279/</span>, <span class="chip acc">upbge/</span>) cost 1 GB and end version anxiety.</p></div>
` },

{ ch: 14, t: "System Requirements", h: `
<h3>What the machine needs (era and modern truth)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Component</th><th>Minimum (era)</th><th>Comfortable</th></tr></thead>
<tbody>
<tr><td>CPU</td><td>Dual-core x86/ARM-emulated era</td><td>4+ cores (physics &amp; logic like cores)</td></tr>
<tr><td>RAM</td><td>2 GB</td><td>8 GB+ (large .blends, texture-heavy scenes)</td></tr>
<tr><td>GPU</td><td>OpenGL 2.1 (Multitexture mode)</td><td>OpenGL 3.3+ / any modern iGPU or dGPU for GLSL</td></tr>
<tr><td>Storage</td><td>500 MB install</td><td>SSD &mdash; LibLoad hitches die on SSDs</td></tr>
<tr><td>Input</td><td>3-button mouse + numpad (or emulation)</td><td>Same, plus gamepad for couch play</td></tr>
<tr><td>OS</td><td>Win 7 / macOS (pre-Catalina era builds) / Linux</td><td>Win 10/11 + Linux (UPBGE current)</td></tr>
</tbody></table></div>

<div class="callout note"><div class="co-label">&#9432 Note — ARM machines (2020s)</div>
<p>Legacy x86 builds run under emulation on ARM laptops &mdash; editor fine, <em>runtime profiling misleading</em> (emulation skews frame times). On ARM, use UPBGE/native builds and profile there.</p></div>

<div class="callout tip"><div class="co-label">&#9733 Tip — the potato machine</div>
<p>Ch. 12&rsquo;s rule, formalized: your <em>minimum</em> target is a machine you own. Budget your frame against it from day one.</p></div>
` },

{ ch: 14, t: "Troubleshooting — The Classics", h: `
<h3>Support triage table</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Symptom</th><th>Probable cause</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>Game runs at 2 fps in editor, fine standalone</td><td>Editor overhead (draw overhead of extra viewports)</td><td>Trust the standalone player&rsquo;s numbers</td></tr>
<tr><td>Black screen on P</td><td>No camera in active layers / camera inactive</td><td>Check active camera + layer visibility</td></tr>
<tr><td>Textures magenta/gray</td><td>Broken image paths (Ch. 02)</td><td>Pack textures or fix relative paths</td></tr>
<tr><td>No sound</td><td>24-bit/exotic WAV, or path issues</td><td>16-bit PCM WAV, verify in standalone</td></tr>
<tr><td>Python errors invisible</td><td>Console closed</td><td>Window &rarr; Toggle System Console</td></tr>
<tr><td>Physics jitter/instability</td><td>Scale unapplied / bad bounds / substeps</td><td>Ch. 07 playbook, in order</td></tr>
<tr><td>GLSL features missing</td><td>Scene in Multitexture mode</td><td>World &rarr; Game &rarr; Shading &rarr; GLSL</td></tr>
<tr><td>Crash on save/runtime</td><td>Corrupt data block / driver bug</td><td>Open fresh, append scene blocks piecemeal; update drivers</td></tr>
<tr><td>Runtime won&rsquo;t start on other PC</td><td>Missing VC runtime / architecture mismatch</td><td>Ship the era-matched runtime + redistributables</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Reproduce crashes with a <strong>minimal .blend</strong>: new file, append suspect blocks one at a time until the crash returns. That block is the bug &mdash; file it, not the whole project.</p></div>
` },

{ ch: 14, t: "Support — Where to Ask", h: `
<h3>The channels that work</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Channel</th><th>Best for</th><th>Era etiquette</th></tr></thead>
<tbody>
<tr><td>UPBGE community (forum/chat)</td><td>Engine bugs, modern workflows</td><td>Repro .blend attached</td></tr>
<tr><td>Blender Stack Exchange</td><td>Searchable Q&amp;A, legacy included</td><td>Version tag your question</td></tr>
<tr><td>Blender Artists forum</td><td>Game-engine threads, art feedback</td><td>Post progress, not just asks</td></tr>
<tr><td>Issue trackers (GitHub)</td><td>Reproducible engine defects</td><td>Steps + file + system info</td></tr>
<tr><td>Discord/Matrix communities</td><td>Live help, jams</td><td>Ask precisely, share solutions</td></tr>
</tbody></table></div>

<h3>Asking the answerable question</h3>
<pre data-lang="text"><code>BAD:  "my game is broken please help"
GOOD:
  Engine/version: UPBGE 0.36 / Blender 2.79
  Expected: press Space -&gt; jump
  Actual: nothing; console shows: KeyError: 'jump_t'
  .blend attached (minimal: player + 3 bricks)
  What I tried: property exists on player, not on armature &lt;-- solved it
                                                              while writing</code></pre>

<div class="callout tip"><div class="co-label">&#9733 Rubber-duck bonus</div>
<p>Writing a good bug report solves ~40% of bugs before you press Post &mdash; you are your own fastest support channel.</p></div>
` },

{ ch: 14, t: "The Blender Foundation & Open Funding", h: `
<h3>Who keeps the lights on</h3>
<ul>
<li>The <strong>Blender Foundation</strong> (Stichting Blender Foundation, NL) stewards Blender: a nonprofit funded by the <strong>Development Fund</strong> (sustaining corporate and individual donations), open-movie/game productions, and certified training.</li>
<li>Every milestone project &mdash; including the game that seeded this course &mdash; was funded openly, produced openly, and <em>published its sources openly</em>: the &ldquo;open content&rdquo; flywheel that this curriculum&rsquo;s files descended from.</li>
<li>The <strong>Blender Institute</strong> ran productions; the <strong>Blender Studio</strong> continues them &mdash; training + assets still flow back to the public.</li>
</ul>

<h3>Why it matters to you as an engineer</h3>
<ul>
<li>Your tools&rsquo; roadmap is public; your voice (donations, patches, bug reports) is structurally welcome.</li>
<li>Open-file culture (Ch. 12&rsquo;s publishing slide) is the norm here &mdash; study any production&rsquo;s sources, then out-perform your resume by shipping remixes.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>If this course&rsquo;s stack paid you back, fund it: a few dollars monthly to the Development Fund is the cheapest tooling license you will ever buy &mdash; and it&rsquo;s tax-deductible where applicable.</p></div>
` },

{ ch: 14, t: "Community Resources — The Reading List", h: `
<h3>Curated, still-alive resources</h3>
<div class="cols2">
<div>
<h4>Documentation &amp; reference</h4>
<ul>
<li><strong>UPBGE docs</strong> &mdash; current engine manual (components, BPY)</li>
<li><strong>Blender manual (2.7x archive)</strong> &mdash; the era&rsquo;s brick/panel truth</li>
<li><strong>BGE/UPBGE Python API reference</strong> &mdash; the types from Ch. 13</li>
<li><strong>Bullet Physics user guide</strong> &mdash; solver concepts (Ch. 07/13)</li>
</ul>
</div>
<div>
<h4>Study material</h4>
<ul>
<li><strong>Yo Frankie! sources</strong> &mdash; the production this course audited (Ch. 12)</li>
<li><strong>Open movie/game .blends</strong> (Elephants Dream &rarr; Charge, Coffee Run&hellip;) &mdash; pipeline archaeology</li>
<li><strong>Game jam archives</strong> &mdash; scope discipline by osmosis</li>
<li><strong>This deck</strong> &mdash; Ch. 13 open while you build; it was designed for exactly that</li>
</ul>
</div>
</div>

<div class="callout tip"><div class="co-label">&#9733 The habit that beats all resources</div>
<p>One finished tiny game per month &gt; one unfinished masterpiece per year. The community&rsquo;s consistent observation: shipped small things teach more than planned big ones &mdash; every project chapter of this course was scoped to prove it.</p></div>
` },

{ ch: 14, t: "The Open-Source Game Ecosystem", h: `
<h3>Where this stack sits today</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Project</th><th>What it is</th><th>Relation to this course</th></tr></thead>
<tbody>
<tr><td><strong>UPBGE</strong></td><td>Blender with the game engine, alive</td><td>Run everything here natively</td></tr>
<tr><td><strong>Godot</strong></td><td>Full open game engine (2D/3D)</td><td>Concepts map ~1:1 (Ch. 03 table)</td></tr>
<tr><td><strong>Armory3D</strong></td><td>Game engine <em>inside</em> modern Blender</td><td>Spiritual successor of the embedded-engine idea</td></tr>
<tr><td><strong>Libraries: SDL, raylib, Bevy</strong></td><td>Framework layer (you own the loop)</td><td>The loop from Ch. 03, by hand</td></tr>
<tr><td><strong>Open assets</strong> (CC0 libraries, Kenney, Poly Haven)</td><td>Textures, models, sounds</td><td>Respect the license table (Ch. 12)</td></tr>
</tbody></table></div>

<div class="callout note"><div class="co-label">&#9432 The strategic view</div>
<p>Open engines win on: auditable tech (this course&rsquo;s whole method), no per-seat licensing, file formats that outlive vendors. Proprietary engines win on: platform certification, console toolchains, big-team support. Senior engineers choose per project &mdash; and read the license either way.</p></div>
` },

{ ch: 14, t: "Migration — UPBGE Deep Map", h: `
<h3>From this course&rsquo;s idioms to UPBGE-native</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>You learned (Ch.)</th><th>UPBGE way</th></tr></thead>
<tbody>
<tr><td>Logic bricks as primary wiring (2&ndash;12)</td><td>Keep for triggers; add <strong>Python Components</strong> (class per object, properties become fields)</td></tr>
<tr><td>Module controllers (3+)</td><td>Same <span class="chip acc">file.function</span>; components supersede for systems</td></tr>
<tr><td>Message bus (11)</td><td>Unchanged; components also talk directly</td></tr>
<tr><td>States (12)</td><td>Unchanged bitmask model</td></tr>
<tr><td>Layers + addObject (6)</td><td>Same; collection-named staging</td></tr>
<tr><td>GLSL 1.2-style shaders (8)</td><td>Same pipeline + GLSL 3.x niceties; still uniform-driven</td></tr>
<tr><td>2D filter actuator (13A)</td><td>Scene filter manager API, same fragment source</td></tr>
<tr><td>Porting checklist</td><td>Test &rarr; rename API deltas &rarr; profile &rarr; ship. The .blend is 90% forward-compatible by design.</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Port <em>one small chapter project</em> (Flying Buddha is ideal: pure logic) to UPBGE components as your graduation exercise. One weekend, and &ldquo;legacy vs modern&rdquo; stops being a category in your head &mdash; it becomes a dropdown.</p></div>
` },

{ ch: 14, t: "Migration — Concepts in Modern Engines", h: `
<h3>The translation dictionary</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>This course</th><th>Godot</th><th>Unity</th><th>Unreal</th></tr></thead>
<tbody>
<tr><td>Object + logic bricks (3)</td><td>Node + script</td><td>GameObject + Components</td><td>Actor + Components/Blueprint</td></tr>
<tr><td>Sensor (3)</td><td>Input / signal / Area3D</td><td>Input System / OnTriggerEnter</td><td>Enhanced Input / overlaps</td></tr>
<tr><td>Controller AND (13B)</td><td>if in _process</td><td>Update() branch</td><td>Tick branch</td></tr>
<tr><td>Actuator (13B)</td><td>Node API call</td><td>Component API / SendMessage</td><td>Blueprint action</td></tr>
<tr><td>Property (3)</td><td>exported var</td><td>serialized field</td><td>UPROPERTY</td></tr>
<tr><td>Group/prefab (12)</td><td>PackedScene</td><td>Prefab</td><td>Blueprint class</td></tr>
<tr><td>State mask (12)</td><td>StateChart / enum</td><td>State machine asset</td><td>Animation state machine</td></tr>
<tr><td>LibLoad streaming (12)</td><td>change_scene / ResourceLoader</td><td>SceneManager / Addressables</td><td>Level streaming</td></tr>
<tr><td>Fixed physics tick (3)</td><td>_physics_process</td><td>FixedUpdate</td><td>TickComponent (physics)</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Interview-grade summary</div>
<p>&ldquo;I built games on an explicit-loop engine: I wired input&rarr;logic&rarr;effects pipelines, managed fixed-step physics, wrote GLSL, networked with threads and snapshots, and shipped within memory/frame budgets.&rdquo; Every clause is a chapter you finished.</p></div>
` },

{ ch: 14, t: "Glossary — A to C", h: `
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>Definition</th></tr></thead>
<tbody>
<tr><td>Actuator</td><td>Logic brick that creates effects: motion, sound, scene changes, messages (Ch. 3, 13B)</td></tr>
<tr><td>Action</td><td>Named, reusable animation clip; played by actuator or playAction (Ch. 5, 10)</td></tr>
<tr><td>Alpha</td><td>Opacity channel; clip (binary) vs blend (gradient) modes (Ch. 2)</td></tr>
<tr><td>AO (Ambient Occlusion)</td><td>Contact/corner darkening; baked into textures at runtime budgets (Ch. 13A)</td></tr>
<tr><td>Armature</td><td>Skeleton object: hierarchy of bones driving skinned meshes (Ch. 10)</td></tr>
<tr><td>Atlas</td><td>Multiple assets&rsquo; UVs packed into one texture to cut material switches (Ch. 5)</td></tr>
<tr><td>Backface culling</td><td>Skip faces pointing away from camera; halves fragment work (Ch. 3, 13A)</td></tr>
<tr><td>Bone</td><td>Armature joint with rest/posed transforms; carries weights (Ch. 10)</td></tr>
<tr><td>Bounding box/volume</td><td>Simple proxy shape for physics or culling (Ch. 13B)</td></tr>
<tr><td>Bounds (collision)</td><td>Box/sphere/cylinder/cone/convex/trimesh body proxies (Ch. 5, 13B)</td></tr>
<tr><td>Bullet</td><td>The open-source rigid body physics engine (Ch. 3, 7, 13B)</td></tr>
<tr><td>Client-server</td><td>Topology: authoritative server broadcasts truth (Ch. 9)</td></tr>
<tr><td>Collision margin</td><td>Padding around collision shapes for stable contacts (Ch. 13B)</td></tr>
<tr><td>Collision sensor</td><td>Fires on physics contact, optionally filtered by property/material (Ch. 13B)</td></tr>
<tr><td>Compound bound</td><td>Children contribute their bounds to one body (Ch. 13B)</td></tr>
<tr><td>Controller</td><td>Decision brick: AND/OR/&hellip; or Python (Ch. 3, 13B)</td></tr>
</tbody></table></div>
` },

{ ch: 14, t: "Glossary — D to I", h: `
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>Definition</th></tr></thead>
<tbody>
<tr><td>Dead reckoning</td><td>Predict remote entity state from last position + velocity (Ch. 9)</td></tr>
<tr><td>Delay sensor</td><td>Timer brick: pulses after N ticks, repeatable &mdash; the rate limiter (Ch. 6, 13B)</td></tr>
<tr><td>Diffuse</td><td>Matte base color response: diffuse &times; max(dot(N,L),0) (Ch. 3, 13A)</td></tr>
<tr><td>Display list / VBO</td><td>GPU-resident geometry upload; the editor&rsquo;s VBO toggle (Ch. 4)</td></tr>
<tr><td>Draw call</td><td>One render submission; the CPU-side budget unit (Ch. 5, 13A)</td></tr>
<tr><td>Dynamic body</td><td>Full rigid body driven by forces and contacts (Ch. 3, 5)</td></tr>
<tr><td>Emit / Emission</td><td>Self-illumination channel; cheap glow, unlit fake (Ch. 3, 5)</td></tr>
<tr><td>Face</td><td>Closed loop of edges bounding a surface; drawn as triangles (Ch. 3)</td></tr>
<tr><td>FK (Forward Kinematics)</td><td>Parent rotations propagate down the chain (Ch. 10)</td></tr>
<tr><td>Flipper mode</td><td>Action playback ping-pong loop (Ch. 5, 13B)</td></tr>
<tr><td>Fragment shader</td><td>Per-pixel program computing final color (Ch. 3, 8)</td></tr>
<tr><td>Frame (time)</td><td>One game-loop pass; 16.6 ms at 60 fps (Ch. 3)</td></tr>
<tr><td>Frustum</td><td>Camera&rsquo;s visible pyramid; culling boundary (Ch. 3)</td></tr>
<tr><td>Ghost</td><td>Physics flag: overlap without response &mdash; triggers&rsquo; superpower (Ch. 6, 7)</td></tr>
<tr><td>GLSL</td><td>OpenGL Shading Language; this course&rsquo;s shader tongue (Ch. 8, 13A)</td></tr>
<tr><td>globalDict</td><td>Persistent cross-scene Python dict (Ch. 6, 13B)</td></tr>
<tr><td>Group instance</td><td>Placed copy of a grouped object set; logic shared &mdash; the prefab (Ch. 11, 12)</td></tr>
<tr><td>Hysteresis</td><td>Reset distance &gt; trigger distance; kills boundary chatter (Ch. 8)</td></tr>
<tr><td>IK (Inverse Kinematics)</td><td>Solve chain poses from a target; editor tool first (Ch. 10)</td></tr>
<tr><td>Impulse</td><td>Instant momentum change J = &Delta;p, N&middot;s (Ch. 7, 13B)</td></tr>
<tr><td>Interpolation</td><td>Blend between samples/keys: linear, bezier, buffered-networked (Ch. 9, 10)</td></tr>
<tr><td>Island (UV)</td><td>Connected UV patch within the unwrap (Ch. 5, 13A)</td></tr>
</tbody></table></div>
` },

{ ch: 14, t: "Glossary — J to P", h: `
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>Definition</th></tr></thead>
<tbody>
<tr><td>Jitter</td><td>Latency variance; hurts feel more than raw ping (Ch. 9)</td></tr>
<tr><td>Joystick sensor</td><td>Gamepad axes/buttons/hats brick (Ch. 8, 13B)</td></tr>
<tr><td>Keyframe</td><td>Stored channel values at a frame; curve endpoints (Ch. 10)</td></tr>
<tr><td>Latency</td><td>Round-trip network time, ms (Ch. 9)</td></tr>
<tr><td>Layer</td><td>Scene partition; hidden layers stage inactive templates (Ch. 4, 6)</td></tr>
<tr><td>LibLoad / LibFree</td><td>Runtime .blend merging/unloading &mdash; streaming (Ch. 12)</td></tr>
<tr><td>Lifetime</td><td>Spawned object&rsquo;s auto-end time; every spawn needs one (Ch. 6)</td></tr>
<tr><td>Lightless (TexFace)</td><td>Unlit face-image rendering mode (Ch. 2)</td></tr>
<tr><td>Logic brick</td><td>Sensor/controller/actuator unit of visual programming (Ch. 3)</td></tr>
<tr><td>Logic tick</td><td>One simulation pass of the logic system (usually 60 Hz) (Ch. 3)</td></tr>
<tr><td>LOD</td><td>Level of detail: distance-based mesh/material swaps (Ch. 12, 13A)</td></tr>
<tr><td>Loop End / Loop Stop</td><td>Action loop modes: finish-then-restart vs halt-instant (Ch. 10, 13B)</td></tr>
<tr><td>Material</td><td>Shading recipe: diffuse/spec/emit/alpha + texture stack (Ch. 3, 13A)</td></tr>
<tr><td>Message</td><td>Async subject+body event between objects/scenes (Ch. 11)</td></tr>
<tr><td>Mipmap</td><td>Pre-scaled texture chain: distance filtering + memory &times;1.33 (Ch. 13A)</td></tr>
<tr><td>Motion actuator</td><td>The movement brick: dLoc/force/velocity/servo/character (Ch. 5, 13B)</td></tr>
<tr><td>Near sensor</td><td>Spherical detection with distance/reset hysteresis (Ch. 8, 13B)</td></tr>
<tr><td>NLA</td><td>Nonlinear animation editor: actions as blended strips/layers (Ch. 10)</td></tr>
<tr><td>Normal</td><td>Surface perpendicular vector; lighting &amp; culling sign (Ch. 3)</td></tr>
<tr><td>Normal map</td><td>Per-pixel slope texture; fake geometric detail (Ch. 5, 13A)</td></tr>
<tr><td>Overlay scene</td><td>Scene rendering above the current one &mdash; HUDs (Ch. 6)</td></tr>
<tr><td>Pickle</td><td>Python object serializer; never on untrusted bytes (Ch. 9)</td></tr>
<tr><td>Pivot</td><td>Object-local origin; rotations/scale anchor (Ch. 3)</td></tr>
<tr><td>PlayAction</td><td>Python API driving animation clips (Ch. 10, 13B)</td></tr>
<tr><td>Property</td><td>Typed per-object game variable; the data model (Ch. 3, 13B)</td></tr>
<tr><td>Pulse</td><td>Positive/negative signal transitions between bricks (Ch. 3, 13B)</td></tr>
</tbody></table></div>
` },

{ ch: 14, t: "Glossary — Q to S", h: `
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>Definition</th></tr></thead>
<tbody>
<tr><td>Quad</td><td>Four-vertex face; the artist&rsquo;s topology currency (Ch. 3)</td></tr>
<tr><td>Radar sensor</td><td>Oriented cone/box detection ahead of an object (Ch. 8, 13B)</td></tr>
<tr><td>Ragdoll</td><td>Physics-driven body replacing animation on death (Ch. 12)</td></tr>
<tr><td>Ray (sensor/API)</td><td>Line query returning first hit + point + normal (Ch. 6, 8, 13B)</td></tr>
<tr><td>Raycast hitscan</td><td>Instant weapon: damage along the ray (Ch. 6)</td></tr>
<tr><td>Restitution</td><td>Bounciness 0&ndash;1; physics-material contact property (Ch. 7)</td></tr>
<tr><td>Rigid body</td><td>Dynamic body + torque response (Ch. 3, 13B)</td></tr>
<tr><td>Servo control</td><td>Closed-loop velocity servo in the Motion actuator (Ch. 5, 13B)</td></tr>
<tr><td>Sensor (brick)</td><td>Input brick: keyboard, mouse, proximity, ray, message, property&hellip; (Ch. 3, 13B)</td></tr>
<tr><td>Sensor (physics)</td><td>&ldquo;Sensor&rdquo; body type: ghost trigger zone (Ch. 7)</td></tr>
<tr><td>Servo PID</td><td>Proportional/Integral/Derivative gains of servo control (Ch. 13B)</td></tr>
<tr><td>Shading mode</td><td>TexFace / Multitexture / GLSL &mdash; the material pipeline pick (Ch. 2, 13A)</td></tr>
<tr><td>Shader</td><td>Programmable GPU stage: vertex or fragment (Ch. 8)</td></tr>
<tr><td>Shuffle (Fisher-Yates)</td><td>Uniform random permutation algorithm (Ch. 11)</td></tr>
<tr><td>Skinned mesh</td><td>Mesh deformed by bones through vertex weights (Ch. 10)</td></tr>
<tr><td>Snapshot</td><td>Serialized world state for networking (Ch. 9)</td></tr>
<tr><td>Soft body</td><td>Deforming physics body (Ch. 3)</td></tr>
<tr><td>Specular</td><td>Mirror-response highlight channel; model + hardness (Ch. 3, 13A)</td></tr>
<tr><td>State (system)</td><td>30 logic states per object; masks select active bricks (Ch. 12, 13B)</td></tr>
<tr><td>Static body</td><td>Immovable physics body; terrain&rsquo;s default (Ch. 3)</td></tr>
<tr><td>Suspend/Resume (scene)</td><td>Pause a scene&rsquo;s simulation; pause menus (Ch. 13B)</td></tr>
</tbody></table></div>
` },

{ ch: 14, t: "Glossary — T to Z", h: `
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>Definition</th></tr></thead>
<tbody>
<tr><td>Tangent space</td><td>Surface-local coordinate frame for normal maps (Ch. 5, 13A)</td></tr>
<tr><td>Texel density</td><td>Texture pixels per world meter; consistency metric (Ch. 13A)</td></tr>
<tr><td>TexFace</td><td>Per-face image pipeline; prototype mode (Ch. 2, 13A)</td></tr>
<tr><td>Timer property</td><td>Auto-counting float; up from 0 or down from set value (Ch. 5, 13B)</td></tr>
<tr><td>Track To</td><td>Aim constraint/actuator at a target (Ch. 6, 13B)</td></tr>
<tr><td>Treadmill pattern</td><td>World scrolls past a fixed player; floating origin for free (Ch. 6)</td></tr>
<tr><td>Triangle (tri)</td><td>The rasterizer&rsquo;s only primitive (Ch. 3)</td></tr>
<tr><td>Trimesh bound</td><td>Triangle-mesh collision; static-only, concave-capable (Ch. 7, 13B)</td></tr>
<tr><td>UDP / TCP</td><td>Lossy datagrams vs ordered stream; state vs events (Ch. 9)</td></tr>
<tr><td>Uniform</td><td>Shader input constant, settable per frame from Python (Ch. 8)</td></tr>
<tr><td>UV coordinates</td><td>Per-vertex 2D address (0&ndash;1) into a texture (Ch. 2, 3)</td></tr>
<tr><td>Unwrap</td><td>Computing UVs: seam, flatten, pack (Ch. 5, 13A)</td></tr>
<tr><td>Vertex</td><td>Position + attributes: normal, UV, color, weights (Ch. 3)</td></tr>
<tr><td>Vertex group</td><td>Vertex&rarr;weight map per bone; the skinning database (Ch. 10)</td></tr>
<tr><td>Vertex shader</td><td>Per-vertex program: transform to clip space, pass varyings (Ch. 8)</td></tr>
<tr><td>Vignette</td><td>Edge darkening post-filter (Ch. 13A)</td></tr>
<tr><td>Viewport (render)</td><td>Screen rectangle a camera renders into; split-screen&rsquo;s tool (Ch. 12)</td></tr>
<tr><td>Watertight</td><td>Closed mesh without boundary edges; clean physics &amp; subdivision (Ch. 3)</td></tr>
<tr><td>Weight painting</td><td>Authoring vertex weights by brush (Ch. 10)</td></tr>
<tr><td>World (settings)</td><td>Scene-level environment: ambient, mist, gravity (Ch. 13A/B)</td></tr>
<tr><td>Z-fighting</td><td>Coplanar surfaces flickering; offset by millimeters or decal the cheat (Ch. 4 era wisdom)</td></tr>
<tr><td>Z-transparency</td><td>Depth-tested transparency mode; blend vs clip economics (Ch. 2)</td></tr>
</tbody></table></div>
` },

{ ch: 14, t: "Course Complete — Where to Go Next", h: `
<h3>You now own the whole stack</h3>
<div class="cols2">
<div>
<ul>
<li>&#10003 3D vocabulary, modeling, UVs, materials, lighting</li>
<li>&#10003 The game loop and the sensor/controller/actuator model</li>
<li>&#10003 Physics-driven gameplay and honest tuning</li>
<li>&#10003 Weapons, AI, spawning, HUDs, states, streaming</li>
<li>&#10003 Skeletal animation and runtime composition</li>
</ul>
</div>
<div>
<ul>
<li>&#10003 Networking: sockets, protocols, prediction</li>
<li>&#10003 GLSL vertex/fragment shaders and post effects</li>
<li>&#10003 Profiling, budgets, and shipping standalone builds</li>
<li>&#10003 Licensing, publishing, and reading production sources</li>
<li>&#10003 A reference chapter you&rsquo;ll keep open while building</li>
</ul>
</div>
</div>

<h3>Three roads from here</h3>
<div class="cards3">
  <div class="card hot"><h4>Build (recommended)</h4><p>One month, one tiny game per chapter project list &mdash; start with the exercise you skipped. Ship each on itch with sources (CC-BY): portfolio + practice in one act.</p></div>
  <div class="card"><h4>Specialize</h4><p>Rebuild any chapter project in Godot or Unity using the Ch. 14 dictionary. Same design, new dialect &mdash; the fastest way to make this knowledge engine-portable.</p></div>
  <div class="card"><h4>Go deep</h4><p>Pick the chapter that grabbed you &mdash; physics, shaders, animation, networking &mdash; and rebuild its systems from scratch in a framework (SDL/raylib). Understanding inverts when you write the loop yourself.</p></div>
</div>

<div class="callout tip"><div class="co-label">&#9733 The last word</div>
<p>Press <kbd>P</kbd>. If it runs &mdash; you built it; if it doesn&rsquo;t &mdash; you&rsquo;ll fix it, and the fixing <em>is</em> the skill. Everything else in this deck was just practice for that loop.</p></div>
` }

);
