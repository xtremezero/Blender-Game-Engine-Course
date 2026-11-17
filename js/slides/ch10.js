/* Part III — Chapter 10: Game Character Animation Using Armatures (34 slides) */

SLIDES.push(

{ ch: 10, t: "Chapter 10 — Character Animation Using Armatures", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">10</div>
  <div class="ch-info">
    <h1>Character Animation</h1>
    <div class="ch-sub">Armatures &middot; Bones &middot; Hierarchy &middot; Skinning &middot; Vertex Groups &middot; Pose Mode &middot; Weight Editing &middot; Actions &middot; Game Logic</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will rig and animate a full game character</h4>
  <ul>
    <li>Build an armature skeleton with correct hierarchy</li>
    <li>Skin a mesh: vertex groups and weight painting done right</li>
    <li>Diagnose and fix the classic skinning artifacts</li>
    <li>Pose with FK and IK; animate walk and run cycles</li>
    <li>Package animation as Actions and drive them from the engine</li>
    <li>Blend, layer, and query animation at runtime with Python</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>34</b> slides</span>
  <span class="ch-stat"><b>~7</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9733&#9733&#9734</b></span>
</div>
` },

{ ch: 10, t: "Why Skeletal Animation?", h: `
<h3>The alternatives, and why they lose</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Method</th><th>How</th><th>Cost per frame</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>Vertex animation</td><td>Store every vertex position per keyframe (shape keys/morphs)</td><td>Enormous memory (every vertex &times; every frame)</td><td>Faces, cloth wrinkles only</td></tr>
<tr><td>Object animation</td><td>Transform whole objects (Ch. 05&rsquo;s bobbing pumpkin)</td><td>Trivial</td><td>Rigid props, pickups, UI</td></tr>
<tr><td><strong>Skeletal (armature)</strong></td><td>Transform ~20 bones; mesh follows via weights</td><td>Tiny: 20 matrices, GPU or CPU skinning</td><td><strong>Characters. Always.</strong></td></tr>
</tbody></table></div>

<h3>The skinned mesh pipeline</h3>
<div class="flow">
  <span class="fnode hot">Armature<small>hierarchy of bones</small></span><span class="farrow">pose &rarr;</span>
  <span class="fnode">Bone matrices<small>rest &rarr; posed</small></span><span class="farrow">&times;</span>
  <span class="fnode hot">Weights<small>vertex &rarr; bone influence</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Deformed mesh<small>what renders</small></span>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — Skinning</div>
<p>Binding a mesh to a skeleton so mesh vertices follow bone motion. The name predates GPUs: it&rsquo;s &ldquo;skinning&rdquo; a frame with a flexible surface. Every vertex records <em>which bones pull it and how hard</em> &mdash; the weights.</p></div>
` },

{ ch: 10, t: "The Armature Object", h: `
<h3>Bones inside a container</h3>
<p>An <strong>armature</strong> is one object containing a tree of <strong>bones</strong>. Like mesh-vs-object (Ch. 03): the armature is the object (transformable, nameable); bones are its data.</p>

<div class="cols3">
  <div class="card"><h4>Rest position</h4><p>The reference pose &mdash; usually a T or A pose. Bones&rsquo; <em>rest matrices</em> are recorded here and never (lightly) changed.</p></div>
  <div class="card"><h4>Pose position</h4><p>Any deviation from rest. Poses are what animators create and what Actions store.</p></div>
  <div class="card"><h4>Display modes</h4><p>Octahedral (default, shows direction), Stick (clean), B-Bone (segments), Wire. Display never affects deformation.</p></div>
</div>

<h3>Armature facts that matter in-engine</h3>
<ul>
<li>Give it a real name: <span class="chip acc">a_player</span> (Ch. 04 naming grammar &mdash; the engine will reference it).</li>
<li>One armature can drive <strong>several meshes</strong> (body + clothing + gear) via the same vertex groups &mdash; the &ldquo;outfit swap&rdquo; architecture.</li>
<li>The engine deforms meshes <em>at runtime</em> every frame the pose changes &mdash; skinning cost scales with mesh vertex count, not with bone count.</li>
</ul>
` },

{ ch: 10, t: "Creating an Armature — Extruding Bones", h: `
<h3>Skeleton first, then fit it to the mesh</h3>
<ol>
<li><kbd>Shift</kbd>+<kbd>A</kbd> &rarr; <em>Armature</em> (single bone) in Edit Mode, front view (<kbd>1</kbd>).</li>
<li>Position the root at the pelvis center &mdash; the center of mass (Ch. 08&rsquo;s wisdom applies to characters too).</li>
<li>Select the bone&rsquo;s tip and <kbd>E</kbd> <em>extrude</em>: spine &rarr; chest &rarr; neck &rarr; head. Extrusion <strong>parents automatically</strong> &mdash; the chain builds itself.</li>
<li>Branch: reselect chest tip, extrude clavicle &rarr; upper arm &rarr; forearm &rarr; hand. Same for legs from pelvis: thigh &rarr; shin &rarr; foot (+ toe).</li>
</ol>

<h3>The working skeleton (20 bones, game-standard)</h3>
<div class="cols2">
<div>
<ul>
<li>root (pelvis) &middot; spine.01/02 &middot; chest &middot; neck &middot; head</li>
<li>shoulder.L/.R &middot; upper_arm.L/.R &middot; fore_arm.L/.R &middot; hand.L/.R</li>
</ul>
</div>
<div>
<ul>
<li>thigh.L/.R &middot; shin.L/.R &middot; foot.L/.R &middot; toe.L/.R</li>
<li><strong>.L / .R suffixes</strong> are not decoration &mdash; mirroring and engine conventions parse them.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Fit bones <em>inside</em> the mesh like a real skeleton: joints at anatomical pivot points (shoulder ball, elbow hinge, hip socket). Deformation quality is decided here, in Edit Mode &mdash; no amount of weight paint fixes bad joint placement.</p></div>
` },

{ ch: 10, t: "Bone Hierarchy & Parenting", h: `
<h3>The tree is the motion</h3>
<div class="flow">
  <span class="fnode hot">root<small>pelvis</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">spine &rarr; chest &rarr; neck &rarr; head</span><span class="farrow">&rarr;</span>
  <span class="fnode">shoulder &rarr; arm chain</span>
</div>
<div class="flow">
  <span class="fnode">root</span><span class="farrow">&rarr;</span>
  <span class="fnode">thigh &rarr; shin &rarr; foot</span>
</div>

<h3>Parenting mechanics</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Relation</th><th>Behavior</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Connected bone</td><td>Child&rsquo;s head is welded to parent&rsquo;s tip &mdash; a true skeletal chain (elbow can&rsquo;t detach)</td><td>Spine, limbs</td></tr>
<tr><td>Offset bone (unconnected)</td><td>Child moves with parent but floats freely</td><td>Shoulders, fingers, props</td></tr>
</tbody></table></div>

<h3>FK inheritance</h3>
<ul>
<li><strong>Forward kinematics:</strong> rotate a parent &rarr; every descendant follows. Rotate the chest and the whole upper body goes along &mdash; the free complexity that makes skeletal animation economical.</li>
<li>Order of the chain = order of inheritance. A hand parented to the <em>spine</em> instead of the <em>forearm</em> stays behind when the arm swings &mdash; the classic &ldquo;rubber arm&rdquo; wiring bug.</li>
</ul>
` },

{ ch: 10, t: "Bone Properties That Matter", h: `
<h3>Edit-mode bone settings (the checklist)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Default</th><th>Set it for&hellip;</th></tr></thead>
<tbody>
<tr><td>Deform</td><td>ON</td><td>OFF for control-only bones (IK targets, poles) so they never skin the mesh</td></tr>
<tr><td>Connected</td><td>varies</td><td>ON for hinge chains (elbow/knee); OFF where the chain branches</td></tr>
<tr><td>Inherit Rotation / Scale</td><td>ON</td><td>OFF on root-adjacent bones for isolated control (rare, powerful)</td></tr>
<tr><td>Bone layers</td><td>L1</td><td>Separate deform bones from control bones (L1/L2) &mdash; rig hygiene</td></tr>
<tr><td>Name</td><td>Bone/&hellip;</td><td>Anatomical + .L/.R &mdash; every tool keys off names</td></tr>
</tbody></table></div>

<h3>Pose-mode bone constraints (preview &mdash; deep dive slide 16)</h3>
<ul>
<li>Bones can carry <strong>constraints</strong> like objects: IK, Track To, Copy Rotation, Limit.</li>
<li>Constraint stacks evaluate top to bottom; later constraints see earlier results.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Control bones left with <strong>Deform ON</strong>: after skinning, weight-paint operations and automatic weights start bending the mesh toward targets/poles. Turn Deform OFF on non-anatomy bones <em>before</em> parenting the mesh.</p></div>
` },

{ ch: 10, t: "Skinning — Binding Mesh to Armature", h: `
<h3>The parent dance</h3>
<ol>
<li>Select the <strong>mesh</strong>, then <kbd>Shift</kbd>-select the <strong>armature</strong> (armature = active, lighter outline).</li>
<li><kbd>Ctrl</kbd>+<kbd>P</kbd> &rarr; <em>Set Parent To &rarr; Armature Deform</em> &mdash; you get four flavors:</li>
</ol>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Option</th><th>What happens</th><th>When</th></tr></thead>
<tbody>
<tr><td>Automatic Weights</td><td>Bone heat algorithm guesses weights &mdash; surprisingly good baseline</td><td><strong>Start here</strong> for organic characters</td></tr>
<tr><td>Envelope Weights</td><td>Bones&rsquo; envelope volumes define influence &mdash; blocky, coarse</td><td>Hard-surface/robots (you&rsquo;ll refine)</td></tr>
<tr><td>Empty Groups</td><td>Creates the vertex groups, all weights zero &mdash; you paint everything</td><td>Full manual control, mechanical rigs</td></tr>
<tr><td>Don&rsquo;t Create Groups</td><td>Parent only, no skinning data</td><td>Meshes that follow the armature rigidly</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Automatic &rarr; test-pose &rarr; fix the worst three joints with paint (slide 11). Do <strong>not</strong> chase perfection on first pass &mdash; the auto baseline gets you animating today; refinement is iterative and cheap once poses exist.</p></div>
` },

{ ch: 10, t: "Vertex Groups — The Weight Database", h: `
<h3>What skinning actually stores</h3>
<p>For every bone (with Deform ON) the mesh gets a <strong>vertex group</strong> named identically. A group maps vertices &rarr; weights in [0,1]:</p>

<pre data-lang="text"><code>vertex group  "upper_arm.L"
  vertex 412  -&gt;  1.00     fully follows the bone
  vertex 415  -&gt;  0.75     75% arm, 25% (elsewhere, e.g. chest)
  vertex 430  -&gt;  0.00     member but uninfluenced
  ...
deformation per vertex (normalized):
  v' = (w1 * B1 + w2 * B2 + ... ) * v      -- a weighted blend of bone matrices</code></pre>

<h3>Reading it right</h3>
<ul>
<li>A vertex&rsquo;s <strong>weights should sum to 1</strong> across groups &mdash; the engine normalizes, but stored sums &ne; 1 cause double-transform bugs.</li>
<li>Weights &gt; 1 or negative are data corruption: <em>Normalize All</em> fixes (slide 12).</li>
<li>Game GPUs support ~<strong>4 bones per vertex</strong> &mdash; a hand vertex weighted to 6 distant bones wastes the budget and blurs deformation. Keep influences local and few.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Renaming bones <em>after</em> skinning: vertex groups keep the old names &rarr; silent de-skinning (mesh stops following). Rename bones <em>before</em> parenting, or sync group names manually afterward.</p></div>
` },

{ ch: 10, t: "Weight Painting — The Interface", h: `
<h3>Weight Paint mode (mesh selected, mode dropdown)</h3>
<ul>
<li>The mesh turns into a <strong>heatmap</strong>: red = 1.0 (full follow), blue = 0.0 (none); green/yellow the ramp between.</li>
<li>Brushes live in the toolbar: <strong>Add / Subtract / Blur / Average / Smear</strong> &mdash; you&rsquo;ll use Add, Subtract, and Blur 90% of the time.</li>
<li>Brush <kbd>F</kbd> radius, <kbd>Shift</kbd>+<kbd>F</kbd> strength. Front-face-only toggle (default ON) prevents accidentally painting the mesh&rsquo;s back.</li>
</ul>

<h3>The essential trick: pose while painting</h3>
<ol>
<li>Enter Pose Mode on the <strong>armature</strong> in a second viewport (split screen, Ch. 04).</li>
<li>Rotate the joint you&rsquo;re fixing (e.g., elbow bent 90&deg;).</li>
<li>Paint on the posed mesh <em>while watching the crease</em> &mdash; you sculpt the deformation you want, not abstract numbers.</li>
</ol>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Tool</th><th>Job</th></tr></thead>
<tbody>
<tr><td>Add (red brush)</td><td>Grow a bone&rsquo;s influence</td></tr>
<tr><td>Subtract (blue brush)</td><td>Shrink it; take territory from a neighbor</td></tr>
<tr><td>Blur</td><td>Soften a seam &mdash; the anti-crease tool</td></tr>
<tr><td>Weight value + strength</td><td>Paint a flat 0.5 base for shared joints, then refine</td></tr>
<tr><td>Auto Normalize (option)</td><td>Keep sums = 1 automatically &mdash; leave ON</td></tr>
</tbody></table></div>
` },

{ ch: 10, t: "Weight Editing — Joint Recipes", h: `
<h3>The three joints you will fix first</h3>
<div class="cols3">
  <div class="card"><h4>Elbow / Knee</h4><p>Sharp crease: inside vertices ~100% to child bone, a one-ring blur toward the parent. Watch for &ldquo;candy wrapper&rdquo; collapse &mdash; blur more.</p></div>
  <div class="card"><h4>Shoulder / Hip</h4><p>Wide blend: deltoid area ~50/50 chest/upper-arm. Armpit needs a wedge of chest weight or it caves in when the arm raises.</p></div>
  <div class="card"><h4>Neck / Waist</h4><p>Narrow, even ramps. The collar/jacket line is where bad weights show &mdash; test with big head turns and torso twists.</p></div>
</div>

<h3>Test poses (run all before calling a rig done)</h3>
<ul>
<li>Arms straight up (T-pose &rarr; Y-pose) &mdash; shoulders&rsquo; moment of truth.</li>
<li>Deep squat &mdash; hips/glutes.</li>
<li>Spine twist + head look-back &mdash; torso seams.</li>
<li>Extreme mouth-open / jaw (if rigged) &mdash; face territory.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Fix weights <em>only</em> as far as your game&rsquo;s animation range demands. A character who only walks and idles never needs Y-pose perfection &mdash; spend the time on knees instead.</p></div>
` },

{ ch: 10, t: "Normalizing & Cleaning Weights", h: `
<h3>Hygiene pass (5 minutes, saves hours)</h3>
<ol>
<li><em>Weight Paint &rarr; Weights menu:</em></li>
</ol>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Operation</th><th>What it does</th></tr></thead>
<tbody>
<tr><td>Normalize All</td><td>Every vertex&rsquo;s weights sum to exactly 1.0 across groups</td></tr>
<tr><td>Clean All</td><td>Removes weights below a threshold (e.g., &lt; 0.01) &mdash; de-junk the database</td></tr>
<tr><td>Quantize</td><td>Snaps weights to steps (0.1) &mdash; smaller data, smoother engine blending</td></tr>
<tr><td>Limit Total</td><td>Keeps only the N strongest influences per vertex (N=4 for GPU skinning!)</td></tr>
<tr><td>Fix Deforms</td><td>Nudges weights to repair collapsed joints</td></tr>
</tbody></table></div>

<h3>Why Limit Total 4 matters at runtime</h3>
<pre data-lang="text"><code>GPU skinning: per vertex, sum over influences: v' = &Sigma; w_i * (B_i * v)
4 influences -&gt; 4 matrix reads, 4 muls, 1 add.   Cheap.
9 influences -&gt; double cost, same visual.       Waste.</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Pipeline order that never embarrasses you: <strong>Normalize All &rarr; Clean (0.01) &rarr; Limit Total (4)</strong> as the final step before export &mdash; every engine and exporter gets clean, bounded data.</p></div>
` },

{ ch: 10, t: "Common Skinning Artifacts — Diagnosis", h: `
<h3>The five classic deformations gone wrong</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Symptom</th><th>Cause</th><th>Cure</th></tr></thead>
<tbody>
<tr><td>Candy-wrapper (pinch at joints on twist)</td><td>Two influences with a hard seam</td><td>Blur across the joint; add a middle influence (twist bone)</td></tr>
<tr><td>Volume collapse (elbow folds flat)</td><td>All weight on one bone at the crease</td><td>Blend the inner ring toward the parent bone</td></tr>
<tr><td>Burst seam (mesh splits at shoulder)</td><td>Seam vertices weighted differently on each side of an edge</td><td>UV/edge seams must share weights: copy weights across (Vertex Groups &rarr; transfer)</td></tr>
<tr><td>Bone does nothing</td><td>Deform OFF, or no group / empty group</td><td>Check bone property; assign automatic weights again for that bone</td></tr>
<tr><td>Mesh explodes globally</td><td>Weight sum &gt;&gt; 1 (double-transform)</td><td>Normalize All &mdash; immediately</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Tip — reproduce first, then paint</div>
<p>Always deform <em>to the failure pose</em> before painting. Painting a joint at rest is guessing; painting it bent 90&deg; is engineering.</p></div>
` },

{ ch: 10, t: "Pose Mode", h: `
<h3>The animator&rsquo;s cockpit</h3>
<ul>
<li>Select the armature &rarr; <kbd>Ctrl</kbd>+<kbd>Tab</kbd> (or mode dropdown) &rarr; <strong>Pose Mode</strong>. Bones turn blue-blue when selected.</li>
<li><kbd>G</kbd>/<kbd>R</kbd>/<kbd>S</kbd> now pose bones &mdash; rotation is the animator&rsquo;s main verb (bones are hinges, not positioners).</li>
<li>Poses are <em>non-destructive</em>: the rest position (Edit Mode) is the untouched reference under everything.</li>
<li><kbd>Alt</kbd>+<kbd>R</kbd> / <kbd>Alt</kbd>+<kbd>G</kbd> on a bone: clear pose channels back to rest.</li>
</ul>

<h3>Inserting keys</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Key</th><th>Action</th></tr></thead>
<tbody>
<tr><td><kbd>I</kbd> in viewport</td><td>Insert Keyframe menu (Loc / Rot / LocRot / LocRotScale, available per bone)</td></tr>
<tr><td><kbd>I</kbd> in a properties field</td><td>Key that single channel</td></tr>
<tr><td>Auto-key (record button)</td><td>Keys transform changes automatically &mdash; fast, noisy; audit your channels after</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Posing in <strong>Edit Mode</strong> by accident: you&rsquo;re editing the <em>rest skeleton</em>, corrupting the skin&rsquo;s reference frame. The mode indicator (header) says POSE before you touch anything &mdash; glance, always.</p></div>
` },

{ ch: 10, t: "FK Posing Workflow", h: `
<h3>Forward kinematics: rotate down the chain</h3>
<div class="cols2">
<div>
<h4>Blocking a pose (60 seconds)</h4>
<ol>
<li>Root: shift + tilt (weight &amp; balance live here).</li>
<li>Chest: counter-rotate against the hips (contrapposto).</li>
<li>Head: last &mdash; it corrects the gaze after the body decides.</li>
<li>Limbs: rotate parent &rarr; child, adjusting each joint&rsquo;s bend.</li>
</ol>
</div>
<div>
<h4>Why rotation-only</h4>
<ul>
<li>Bones are anatomical pivots: shoulders rotate, they don&rsquo;t slide.</li>
<li>Translated bones stretch/deform weight regions unnaturally and fight the skin.</li>
<li>Scale is for special cases only (cartoon squash, breathing cheat).</li>
</ul>
</div>
</div>

<h3>FK is brilliant at</h3>
<ul>
<li><strong>Follow-through:</strong> rotate the chest and the arm inherits the swing &mdash; arcs for free (Ch. 03 FK inheritance).</li>
<li>Planned, held poses; walk cycles&rsquo; contact extremes (next slides).</li>
<li>Any motion where the <em>chain initiates at its base</em>.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Pose the whole body as a <em>gesture drawing</em> first (30 seconds, rough), then refine. Posing bone-per-bone from zero produces mannequins; gesture-first produces characters.</p></div>
` },

{ ch: 10, t: "IK — Inverse Kinematics", h: `
<h3>Goals instead of rotations</h3>
<p>An <strong>IK constraint</strong> on a chain (e.g., foot) with a target object: drag the target &mdash; the knee/hip solve <em>backward</em> to reach it. Feet that stay planted while the body moves: trivial with IK, torture with FK.</p>

<h3>Constraint anatomy (Pose Mode &rarr; Bone Constraints)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Value (leg)</th><th>Note</th></tr></thead>
<tbody>
<tr><td>Target</td><td>armature</td><td>Then Bone field = a target <em>bone</em> (cleaner than empties for game export)</td></tr>
<tr><td>Chain Length</td><td>2 (thigh+shin)</td><td>Limit the solve to the limb &mdash; 0 lets it eat the spine</td></tr>
<tr><td>Use Tail</td><td>ON</td><td>The constrained bone&rsquo;s tip chases the target</td></tr>
<tr><td>Pole Target</td><td>knee pole bone</td><td>Disambiguates the knee&rsquo;s bend direction (without it: random flips)</td></tr>
<tr><td>Weight / Influence</td><td>1.0</td><td>Blend FK/IK by animating this &mdash; the switch rig</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice — IK is an editor tool first</div>
<p>For runtime: <strong>bake IK to FK keys</strong> (Actions store the solved FK rotations; constraints aren&rsquo;t needed in-engine). Keep runtime IK only where the game truly needs it (foot planting on uneven ground, hand-on-ledge) &mdash; every live constraint is per-frame solve cost and a platform portability risk.</p></div>
` },

{ ch: 10, t: "Constraint Reference for Riggers", h: `
<h3>The rigging toolbox (Pose Mode bone constraints)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Constraint</th><th>Does</th><th>Rig use</th></tr></thead>
<tbody>
<tr><td>IK</td><td>Backward chain solve to a target</td><td>Limbs, planting feet</td></tr>
<tr><td>Copy Rotation / Location / Scale</td><td>Mirror another bone&rsquo;s transform (with axis mapping)</td><td>.L&rarr;.R mirror rigs, follow-bones</td></tr>
<tr><td>Limit Rotation / Location / Distance</td><td>Clamp channels</td><td>Elbows that never hyperextend</td></tr>
<tr><td>Track To</td><td>Aim an axis at a target</td><td>Eyes, head look-at, turret bones</td></tr>
<tr><td>Locked Track</td><td>Aim while keeping one own axis locked</td><td>Horizontal-only head turns</td></tr>
<tr><td>Child Of</td><td>Parent to a bone at runtime-strength influence</td><td>Hand attaches to props</td></tr>
<tr><td>Stretch To</td><td>Lengthen toward a target (volume preserved)</td><td>Cartoon limbs, tails</td></tr>
<tr><td>Transformation</td><td>Map one bone&rsquo; channels onto another&rsquo;s</td><td>Corrective/spaces setups</td></tr>
</tbody></table></div>

<div class="callout note"><div class="co-label">&#9432 Game-rig minimalism</div>
<p>Every constraint that ships costs runtime. The game rig &asymp; deform bones + baked FK + (rarely) IK &mdash; the 40-control editing rig stays in the editing file. Two rigs, one skeleton: <em>editor rig</em> for animators, <em>game rig</em> for the engine.</p></div>
` },

{ ch: 10, t: "Keyframes & Curves", h: `
<h3>Timing is information</h3>
<ul>
<li>A <strong>keyframe</strong> stores selected channels at a frame; the <strong>interpolation</strong> between keys is where motion&rsquo;s character lives.</li>
<li>Interpolation types (Graph Editor, per key or per curve): <strong>Constant</strong> (step &mdash; mechanical/retro), <strong>Linear</strong> (robotic), <strong>Bezier</strong> (default &mdash; smooth with ease), plus <em>Ease</em> variants (dramatic anticipation/settle).</li>
</ul>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Graph shape</th><td>Reads as</th></tr></thead>
<tbody>
<tr><td>S-curve (slow-out slow-in)</td><td>Weighty, organic &mdash; limbs</td></tr>
<tr><td>Linear</td><td>Mechanical &mdash; machinery, snap motions</td></tr>
<tr><td>Sharp attack, long tail</td><td>Impact &mdash; hits, jumps</td></tr>
<tr><td>Flat plateau</td><td>Holds &mdash; readability beats constant wiggling</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p><strong>Key the extremes and the passes.</strong> A walk needs contact-down-pass-up, not 30 keys. Sparse keys = editable timing = better animation under deadline. Dense keys = sculpted mush you can&rsquo;t retime.</p></div>
` },

{ ch: 10, t: "Actions — Animation Containers", h: `
<h3>The unit the engine plays</h3>
<p>An <strong>Action</strong> is a named set of channels (bone rotations, locations) with keys and curves &mdash; <span class="chip acc">act_walk</span>, <span class="chip acc">act_run</span>, <span class="chip acc">act_jump</span>. The Action actuator (Ch. 05) plays them by name; Python plays them by name; the NLA composes them.</p>

<h3>Real-time action conventions (adopt them)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Rule</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Start pose = end pose for loops</td><td>Loop mode needs seamless wrap (walk cycles!)</td></tr>
<tr><td>20&ndash;40 frames per cycle @ 24 fps timing</td><td>Walk &asymp; 24 frames, run &asymp; 12&ndash;16 &mdash; real-time plays them at their own clock</td></tr>
<tr><td>Root bone stays at origin (in-place)</td><td>Locomotion moves via logic; the cycle only animates (slide 31)</td></tr>
<tr><td>One Action, one purpose</td><td>Compositing happens at runtime (blending, layers)</td></tr>
<tr><td>FakeFbx? &mdash; keep actions in the .blend, engine-side</td><td>The engine reads actions directly from the file</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>The &ldquo;sneaky slide&rdquo;: an action with root translation plays on a logic-driven character &mdash; two systems move the root and the character moonwalks. Root bone in-place, always (see slide 31&rsquo;s full treatment).</p></div>
` },

{ ch: 10, t: "NLA — Nonlinear Animation", h: `
<h3>Actions as tracks</h3>
<p>The <strong>NLA Editor</strong> stacks Actions as strips on layers (tracks) with blending ranges &mdash; the audio-multitrack metaphor for animation:</p>
<div class="flow">
  <span class="fnode">Track 1<small>full-body override</small></span><span class="farrow">+</span>
  <span class="fnode">Track 2<small>torso layer</small></span><span class="farrow">+</span>
  <span class="fnode">Track 3<small>base locomotion</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">mixed result</span>
</div>

<h3>What NLA teaches (even if the engine drives blending itself)</h3>
<ul>
<li><strong>Layering:</strong> base walk + upper-body wave = combined motion &mdash; the same layer mechanic as the Action actuator&rsquo;s Layer field.</li>
<li><strong>Blend regions:</strong> strips cross-fade over N frames &mdash; the mental model for Blendin everywhere.</li>
<li><strong>Baking:</strong> collapse a stack into one action &mdash; how IK/editor-rig work becomes a clean FK game clip.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>In-engine you&rsquo;ll usually drive layers from Python/actuators rather than the NLA editor itself &mdash; but design your action set as if it were NLA tracks: <em>base cycle, add-on layers, override states</em>. The discipline transfers directly.</p></div>
` },

{ ch: 10, t: "The Walk Cycle — Part 1: Contact & Down", h: `
<h3>Four keys carry the whole cycle</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Key (frame @ 24f cycle)</th><th>Body</th><th>Legs (right leg shown)</th></tr></thead>
<tbody>
<tr><td><strong>Contact</strong> (1 &amp; 25)</td><td>Root highest of the low points; slight forward lean</td><td>Heel strikes front, leg nearly straight; left toe pushing off rear</td></tr>
<tr><td><strong>Down</strong> (7)</td><td>Root lowest &mdash; weight lands and compresses</td><td>Front foot flat, knee bent under the hip mass</td></tr>
</tbody></table></div>

<h3>Procedure</h3>
<ol>
<li>Frame 1: pose Contact (right heel forward). Key all bones (LocRot).</li>
<li>Frame 13: mirror the same pose to the <em>left</em> leg &mdash; <strong>paste mirrored</strong> (Pose &rarr; Copy/Paste) or mirror the armature&rsquo;s pose &mdash; key.</li>
<li>Frame 7: Down. Frame 19: Down (left). Key.</li>
<li>Playback with loop range 1&ndash;24 &mdash; it already reads as &ldquo;walking&rdquo; even before the in-betweens.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Block all four keys <em>before</em> refining any of them. The cycle&rsquo;s readability is in the extremes&rsquo; silhouettes; polish (arms, head, hips) comes after the machine works.</p></div>
` },

{ ch: 10, t: "The Walk Cycle — Part 2: Pass, Up & Polish", h: `
<h3>The remaining two keys, then the layer cake</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Key</th><th>Body</th><th>Legs</th></tr></thead>
<tbody>
<tr><td><strong>Pass</strong> (10, 22)</td><td>Root mid-height; hips rotate (pelvis tilts over the stance leg)</td><td>Weight leg vertical &amp; straight; swing leg knee lifted, foot under the butt</td></tr>
<tr><td><strong>Up</strong> (4, 16)</td><td>Root highest &mdash; push-off apex</td><td>Rear foot leaving ground, heel up; front thigh swinging through</td></tr>
</tbody></table></div>

<h3>Polish pass (the difference between &ldquo;moves&rdquo; and &ldquo;walks&rdquo;)</h3>
<ul>
<li><strong>Hips:</strong> rotate around Y (pelvis swings forward on the stance side) + drop on the swing side.</li>
<li><strong>Chest:</strong> counter-rotate against hips + slight side-bend.</li>
<li><strong>Arms:</strong> opposite-phase swing to legs; elbows bend most on the forward swing.</li>
<li><strong>Head:</strong> subtle bob compensation &mdash; the eyes want stability.</li>
<li><strong>Feet:</strong> toe-off roll (rotate foot bone at push), heel-strike snap.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip — study loops with props</div>
<p>Drop a grid floor and a reference cube moving at intended speed beside the character: the <em>ground speed vs. foot speed</em> mismatch (slide) is visible instantly &mdash; the #1 cycle bug, caught in 10 seconds.</p></div>
` },

{ ch: 10, t: "The Run Cycle & Exaggeration", h: `
<h3>What changes when you run</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Walk</th><th>Run</th></tr></thead>
<tbody>
<tr><td>Cycle length</td><td>24 frames</td><td>12&ndash;16 frames</td></tr>
<tr><td>Contacts</td><td>Always one foot down</td><td><strong>Flight phase</strong> &mdash; zero feet down at pass</td></tr>
<tr><td>Root height variance</td><td>&plusmn;3%</td><td>&plusmn;8% &mdash; big compression, big air</td></tr>
<tr><td>Torso lean</td><td>&asymp;2&deg;</td><td>10&ndash;15&deg; forward</td></tr>
<tr><td>Arm swing</td><td>Moderate</td><td>Violent, elbows locked ~90&deg;</td></tr>
</tbody></table></div>

<h3>The animation principles at work (12 classics, 4 you use daily)</h3>
<div class="cols2">
<div>
<ul>
<li><strong>Squash &amp; stretch:</strong> compression on landing (scale cheat or pose).</li>
<li><strong>Anticipation:</strong> the crouch before the jump &mdash; the wind-up sells the action.</li>
</ul>
</div>
<div>
<ul>
<li><strong>Follow-through:</strong> hair/arms/tails arrive late.</li>
<li><strong>Exaggeration:</strong> push poses 20% past plausible &mdash; real-time cameras flatten motion; over-animation reads correct.</li>
</ul>
</div>
</div>
` },

{ ch: 10, t: "Exporting Animation for Real-Time", h: `
<h3>The pre-flight checklist</h3>
<ol>
<li><strong>Apply scale/rotation on meshes</strong> (<kbd>Ctrl</kbd>+<kbd>A</kbd>) &mdash; skinning under non-applied transforms skews in-engine (Ch. 04 rule, maximally true here).</li>
<li><strong>Bake IK to FK keys</strong> (Action&rsquo;s curves are plain bone rotations; no live constraints needed in-game).</li>
<li><strong>Loops seamless:</strong> first frame == last frame on all channels (graph editor: endpoints match).</li>
<li><strong>Weights clean:</strong> Normalize &rarr; Clean &rarr; Limit 4 (slide 12).</li>
<li><strong>Actions named and purged:</strong> no <span class="chip">Action.001</span>, no orphan test clips in the file (Outliner audit, Ch. 04).</li>
<li><strong>Armature at world origin, character facing engine-forward</strong> (&minus;Y here).</li>
</ol>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Export as&hellip;</th><th>When</th></tr></thead>
<tbody>
<tr><td>Native .blend (engine reads actions directly)</td><td>This course &mdash; the runtime consumes .blend actions natively</td></tr>
<tr><td>FBX / glTF for other engines</td><td>Unity/Unreal/Godot pipelines &mdash; same checklist applies verbatim</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Mesh at 0.01 scale &ldquo;to make it the right size in-game&rdquo;: skinning amplifies the error into rubbery nightmare deformation. Fix scale at the source, never via object scale on skinned meshes.</p></div>
` },

{ ch: 10, t: "Action Actuator — Deep Dive", h: `
<h3>Every field, game-tested</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>What it does</th><th>Cycle example</th></tr></thead>
<tbody>
<tr><td>Action</td><td>Clip by name</td><td>act_walk</td></tr>
<tr><td>Start / End</td><td>Frame window of the clip to play</td><td>1 / 24</td></tr>
<tr><td>Blend In</td><td>Frames of cross-fade from current pose</td><td>6</td></tr>
<tr><td>Priority</td><td>Lower number wins conflicts on the same layer</td><td>locomotion = 2, attacks = 1</td></tr>
<tr><td>Layer</td><td>Animation layer (0 = base)</td><td>full body = 0</td></tr>
<tr><td>Layer Weight</td><td>0&ndash;1 blend of this layer onto lower layers</td><td>1.0</td></tr>
<tr><td>Frame Property</td><td>Writes current frame into a property</td><td>anim_frame (use it for hit-timing!)</td></tr>
<tr><td>Play modes</td><td>Play / Loop End / Loop Stop / Flipper / Property</td><td>Loop End</td></tr>
</tbody></table></div>

<h3>Play modes demystified</h3>
<ul>
<li><strong>Loop Stop vs Loop End:</strong> when the sensor stops firing, Stop halts <em>instantly</em> (current pose), End finishes the current loop first &mdash; End for locomotion (no mid-stride freezes), Stop for interrupts (hit reactions).</li>
<li><strong>Property mode:</strong> the clip&rsquo;s frame = a property&rsquo;s value &mdash; aim poses steered by aim angle (Ch. 06 turret), throttle-driven engine RPM, one clip = a whole range of poses.</li>
</ul>
` },

{ ch: 10, t: "Blending & Layers — Runtime Composition", h: `
<h3>The two-axis system</h3>
<div class="cols2">
<div>
<h4>Blend In &mdash; time axis</h4>
<ul>
<li>Switching walk &rarr; run without blend = one-frame pose snap.</li>
<li>Blend In 6&ndash;10 frames: cross-fade &mdash; silky transitions everywhere.</li>
<li>Rule: <strong>everything blends except deliberate snaps</strong> (impacts read better instant).</li>
</ul>
</div>
<div>
<h4>Layers &mdash; body-part axis</h4>
<div class="tbl-wrap"><table class="tbl">
<tbody>
<tr><td>Layer 0</td><td>base cycle (legs + root)</td></tr>
<tr><td>Layer 1</td><td>torso add-on: wave, reload</td></tr>
<tr><td>Layer 2</td><td>face/look-at overrides</td></tr>
</tbody></table></div>
<p>A clip on layer 1 containing <em>only torso bone channels</em> adds onto layer 0 &mdash; walk &amp; wave simultaneously (the NLA mental model, driven by two actuators).</p>
</div>
</div>

<h3>The locomotion trio (priority war)</h3>
<ul>
<li>Idle (prio 3, Loop End) &middot; Walk (prio 2) &middot; Run (prio 1) &mdash; whichever fires owns layer 0; speed picks, blending smooths.</li>
<li>Hit reaction (prio 0, Play mode, ~12 frames) overrides all: brief, absolute, then blend back.</li>
</ul>
` },

{ ch: 10, t: "Python — Playing Actions", h: `
<h3>playAction: the whole API</h3>
<pre data-lang="python"><code># char.py -- module controller on the character object
import bge

def play():
    own = bge.logic.getCurrentController().owner

    # the one-liner (defaults are sane):
    own.playAction("act_walk", 1, 24, play_mode=1, blendin=6)
    #                          start end  1 = KX_ACTION_MODE_LOOP

    # full signature (as you&rsquo;ll actually use it):
    own.playAction("act_run", 1, 16,
                   layer=0,                   # animation layer
                   play_mode=bge.logic.KX_ACTION_MODE_LOOP,
                   layer_weight=1.0,          # this layer&rsquo;s dominance
                   blendin=6,                 # crossfade frames
                   blend_mode=1,              # 1 = blend by frame count
                   speed=1.0,                 # playback rate multiplier
                   priority=1)

    # steering playback while playing:
    own.setActionFrame(12, layer=0)            # snap to mid-stride
    own.setActionFramePercentage(0.5, 0)       # or by 0..1 of clip

def stop():
    own = bge.logic.getCurrentController().owner
    own.stopAction(layer=1)      # stop just the torso layer
    # own.stopAction(0)          # stop everything</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Wrap action names in one module constant table (<span class="chip acc">ACTIONS = {"idle": "act_idle", ...}</span>) &mdash; renaming clips later becomes one edit instead of forty brick fields.</p></div>
` },

{ ch: 10, t: "Python — Querying Animation State", h: `
<h3>Read before you decide</h3>
<pre data-lang="python"><code># char_state.py -- reacting to what&rsquo;s actually playing
import bge

def update():
    own = bge.logic.getCurrentController().owner

    # what is playing on layer 0?
    name = own.getActionName(layer=0)          # None if nothing
    if name == "act_jump":
        frame = own.getActionFrame(0)
        # gameplay windows inside the clip (slide 29):
        if 5 &lt;= frame &lt;= 9:
            own["attack_window"] = True        # feet can damage enemies
        if frame &gt;= 14 and not own["landed"]:
            own["can_land"] = True             # allow landing recovery

    # is the clip still running? (Play-mode clips end!)
    if own.isPlayingAction(0) is False:
        own["anim_done"] = True                # chain the next state

    # frame-perfect triggers (alternative: Frame Property + Property sensor):
    own["anim_frame"] = own.getActionFrame(0)  # publish for bricks</code></pre>

<h3>The pattern this enables: animation as data</h3>
<ul>
<li>Hit windows, footstep sounds, spawn points (throw a knife at frame 8!) &mdash; all <em>frame ranges inside actions</em>, read by logic.</li>
<li>Animators retime the clip; gameplay follows automatically. No re-wiring, no code edits.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Frame-counting with an integer <span class="chip">==</span> test: at high logic rates the exact frame can be sampled twice or skipped. Always use <em>ranges</em> (5 &le; f &le; 9), never equality.</p></div>
` },

{ ch: 10, t: "Game Logic — The Locomotion State Machine", h: `
<h3>Tying it together</h3>
<div class="flow">
  <span class="fnode hot">Speed sensor<small>linV.length &gt; 4.5 ?</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">RUN: playAction(act_run, prio 1)</span>
  <span class="farrow">else &gt; 0.3 &rarr;</span>
  <span class="fnode">WALK: playAction(act_walk, prio 2)</span>
  <span class="farrow">else &rarr;</span>
  <span class="fnode">IDLE: playAction(act_idle, prio 3)</span>
</div>

<pre data-lang="python"><code># locomotion.py -- Always sensor on the character
import bge

RUN_CUT, WALK_CUT = 4.5, 0.3

def update():
    own = bge.logic.getCurrentController().owner
    speed = own.worldLinearVelocity.length      # (filter Z for pure horizontal)

    if not own.isPlayingAction(0) or own["loc_dirty"]:
        if speed &gt; RUN_CUT:
            own.playAction("act_run", 1, 16, layer=0, blendin=6, priority=1)
        elif speed &gt; WALK_CUT:
            own.playAction("act_walk", 1, 24, layer=0, blendin=6, priority=2)
        else:
            own.playAction("act_idle", 1, 60, layer=0, blendin=10, priority=3)
        own["loc_dirty"] = False</code></pre>

<div class="callout tip"><div class="co-label">&#9733 The dirty-flag trick</div>
<p>Don&rsquo;t re-issue <span class="chip acc">playAction</span> every tick &mdash; it restarts blending. Set <span class="chip acc">loc_dirty</span> when speed crosses a band (Property sensors), then re-evaluate once. Fewer calls, cleaner blends.</p></div>
` },

{ ch: 10, t: "Animation-Driven Gameplay", h: `
<h3>Let the clips drive the logic (not just the pixels)</h3>
<div class="cols2">
<div>
<h4>Footstep system</h4>
<pre data-lang="python"><code># on the character (reads anim_frame, slide 26)
if anim in ("act_walk", "act_run"):
    # footfalls at contact frames: 1, 13 (walk) / 1, 9 (run)
    for ff in footfall_frames(anim):
        if abs(own["anim_frame"] - ff) &lt; 0.6:
            if own["last_step"] != ff:
                play_footstep(pitch_by=speed)
                own["last_step"] = ff</code></pre>
</div>
<div>
<h4>Attack with windows</h4>
<pre data-lang="python"><code># attack state (brick-triggered):
own.playAction("act_slash", 1, 18, play_mode=0,  # 0 = play once
              blendin=3, priority=0)
# damage window: frames 6-10; recovery: 14-18
f = own.getActionFrame(0)
own["hitbox_on"] = 6 &lt;= f &lt;= 10
own["can_cancel"] = f &gt;= 14     # combo buffer opens</code></pre>
</div>
</div>

<h3>Why this architecture wins</h3>
<ul>
<li><strong>Single source of truth:</strong> timing lives in the clip; logic reads it. Designers retime clips freely.</li>
<li><strong>Cancel windows</strong> = responsive combat (attack&rsquo;s recovery frames accept new input &mdash; the secret of &ldquo;game feel&rdquo; in action games).</li>
<li>Footstep dust, landing squashes, mantle pushes &mdash; the same frame-range pattern everywhere.</li>
</ul>
` },

{ ch: 10, t: "Character Controller — Physics or Logic?", h: `
<h3>Three schools</h3>
<div class="cols3">
  <div class="card"><h4>Dynamic (full physics)</h4><p>Dynamic capsule + forces (Ch. 05). <strong>Pros:</strong> reacts to world (explosions, moving platforms). <strong>Cons:</strong> can be pushed off ledges by whim; harder to feel crisp.</p></div>
  <div class="card hot"><h4>Ghost + scripted</h4><p>Ghost body, logic owns motion; Ray sensors sample ground. <strong>Pros:</strong> pixel-perfect platformer control. <strong>Cons:</strong> every physical interaction is your job.</p></div>
  <div class="card"><h4>Character wrapper</h4><p>Engine&rsquo;s character-physics mode: kinematic stepping, slopes, stairs &mdash; physics for <em>constraints</em>, logic for <em>intent</em>.</p></div>
</div>

<h3>The animation&rsquo;s vote</h3>
<ul>
<li>Locomotion state (idle/walk/run) reads speed &mdash; whichever controller you pick, <strong>publish clean velocity data</strong> to the animation module.</li>
<li>Turn-in-place: rotate the body <em>gradually</em> and let a turn animation cover it &mdash; instant 180&deg; snaps look broken under a walk cycle.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Decide by genre: platformer/fps &rarr; ghost or character wrapper; physics playground &rarr; dynamic. Then <em>keep the animation module ignorant of the choice</em> &mdash; it only needs position deltas. Swap controllers without re-animating.</p></div>
` },

{ ch: 10, t: "Root Motion vs In-Place", h: `
<h3>Who moves the character through the world?</h3>
<div class="cols2">
  <div class="card">
    <h4>In-place cycles (this course&rsquo;s default)</h4>
    <ul>
    <li>Clip animates limbs only; root stays at origin.</li>
    <li><strong>Logic moves the body</strong> (servo/forces); speed &harr; clip chosen by velocity bands.</li>
    <li>&#10003 Trivial blending, retiming, networking (Ch. 09 sends transforms, not clips).</li>
    <li>&#10005 Foot sliding unless speed matches stride &mdash; tune stride rate &harr; velocity.</li>
    </ul>
  </div>
  <div class="card">
    <h4>Root motion</h4>
    <ul>
    <li>Clip drives root translation; engine extracts per-frame delta and applies it.</li>
    <li>&#10003 Perfect foot planting for free; jumps/rolls carry exact distances.</li>
    <li>&#10005 Blending two motions means blending their <em>deltas</em>; networking must replay motion; uneven ground needs warping.</li>
    </ul>
  </div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Hybrid ships most often: in-place locomotion + root motion only for explicit moves (dodge roll, vault, finisher) where exactness matters and blending doesn&rsquo;t.</p></div>
` },

{ ch: 10, t: "Retargeting & Asset Reuse", h: `
<h3>One rig, many characters</h3>
<ul>
<li><strong>Retarget</strong> = transfer actions between skeletons with matching bone names/proportions. Your <span class="chip acc">act_walk</span> on character B = 5 minutes, not 5 hours.</li>
<li>Why conventions (names, .L/.R, rest pose) from slide 5 compound: retargeting quality = naming discipline &times; pose consistency.</li>
</ul>

<h3>Reuse patterns for a small team</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Pattern</th><th>Mechanics</th></tr></thead>
<tbody>
<tr><td>Shared action library</td><td>Library .blend with actions; append per project (Ch. 06 linking)</td></tr>
<tr><td>Animation via NLA remix</td><td>Re-order/blend existing strips into new clips</td></tr>
<tr><td>Proportion re-skin</td><td>Same armature re-fitted (Edit Mode) to a new mesh &mdash; fat/thin/robot variants</td></tr>
<tr><td>Head-swap characters</td><td>Body shares everything; head mesh + face bones differ &mdash; NPC armies</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Build one canonical humanoid rig &rarr; derive everyone. Every rig that deviates is a rig you maintain alone at 2 AM before launch. Standardize skeletons like you standardize naming (Ch. 04).</p></div>
` },

{ ch: 10, t: "Chapter 10 — Pitfalls & Best Practices", h: `
<h3>The rigger&rsquo;s review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Bad joint placement</strong> &mdash; bones at non-anatomical pivots. No weight paint survives it; fix Edit Mode first.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Renaming bones after skinning</strong> &mdash; de-synced vertex groups, silent rubber limbs.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Unapplied scale on skinned meshes</strong> &mdash; the classic exporter bomb. <kbd>Ctrl</kbd>+<kbd>A</kbd> before anything.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Root translation in locomotion clips</strong> &mdash; moonwalk: two systems fight over the root.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Re-issuing playAction every tick</strong> &mdash; blend never completes. Dirty-flag it.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Auto weights &rarr; pose-test &rarr; paint the big three joints;</strong> depth of polish budgeted to actual animation range.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Normalize &rarr; Clean &rarr; Limit 4</strong> as the export ritual.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>IK in the editor, FK in the game;</strong> two rigs, one skeleton.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Blends everywhere, snaps on impacts;</strong> layers for body-part composition.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Animation as data:</strong> frame windows drive gameplay; animators retime freely.</p></div>
</div>
</div>
` },

{ ch: 10, t: "Chapter 10 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Rig a flag:</strong> 4-bone chain, automatic weights, animate a wave loop &mdash; cloth skinning in miniature.</li>
<li><strong>Turn-in-place:</strong> add <span class="chip acc">act_turn_L/R</span> (12 frames); trigger when |yaw error| &gt; 90&deg;; blend 8.</li>
<li><strong>Jump trilogy:</strong> jump_up, apex (hold), fall, land &mdash; state machine selects by velocity Z + grounded ray (Ch. 05).</li>
<li><strong>Layer sandwich:</strong> layer 0 walk, layer 1 a waving loop containing only torso bones &mdash; prove layers compose.</li>
<li><strong>Root-motion roll:</strong> one root-motion dodge roll; extract delta per frame in Python (<span class="chip acc">getActionFrame</span> + curve math) and apply to the body.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Build, skin, and weight-paint a game-ready character rig &#10003;</li>
<li>Diagnose every classic deformation artifact &#10003;</li>
<li>Animate walk and run cycles with correct timing &#10003;</li>
<li>Drive actions from bricks and Python with blending and layers &#10003;</li>
<li>Use animation as gameplay data and choose controllers/root-motion wisely &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 11 keeps the logic bricks honest: Flying Buddha, a memory game built from messages, states &mdash; and the shuffle script that ties randomness to game feel.</p></div>
` }

);
