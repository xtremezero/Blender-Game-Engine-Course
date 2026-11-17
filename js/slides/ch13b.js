/* Part IV — Chapter 13B: The BGE Reference — Logic, Physics, Sound, Python (26 slides) */

SLIDES.push(

{ ch: 13, t: "Logic Editor — Panel Anatomy", h: `
<h3>Reading the wiring diagram</h3>
<div class="flow">
  <div class="fgroup"><span class="glabel">COL</span>
    <span class="fnode">Object name + states grid<br><small>which object &amp; which state you edit</small></span>
  </div>
  <span class="farrow">&rarr;</span>
  <span class="fnode hot">Sensors<small>left column</small></span>
  <span class="farrow">&rarr;</span>
  <span class="fnode">Controllers<small>middle</small></span>
  <span class="farrow">&rarr;</span>
  <span class="fnode hot">Actuators<small>right</small></span>
</div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>UI element</th><th>Does</th></tr></thead>
<tbody>
<tr><td>Link sockets (&#9679;&mdash;&mdash;&#9679;)</td><td>Drag to wire sensor&rarr;controller, controller&rarr;actuator</td></tr>
<tr><td>Column headers</td><td>Add (Sensors/Controllers/Actuators menus), properties shortcut</td></tr>
<tr><td>Brick name field</td><td>Python access: <span class="chip acc">cont.sensors["name"]</span> &mdash; named bricks or [0] indexing</td></tr>
<tr><td>State grid (header)</td><td>30 states; click to edit that state&rsquo;s bricks (Ch. 12)</td></tr>
<tr><td>Active-state highlight</td><td>Green dot = states active at runtime</td></tr>
<tr><td>&#9881 on bricks</td><td>Show/hide advanced fields</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Name every brick you touch from Python. <span class="chip acc">sensors["Key"]</span> survives re-ordering; <span class="chip acc">sensors[0]</span> breaks silently when someone adds a sensor above it.</p></div>
` },

{ ch: 13, t: "Sensors — Common Settings", h: `
<h3>The shared header of every sensor</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Effect</th><th>Reference use</th></tr></thead>
<tbody>
<tr><td><strong>Frequency (Freq / pulse skip)</td><td>Poll every Nth logic tick</td><td>N=2&ndash;5 for radars/nears; N=1 only when needed</td></tr>
<tr><td><strong>Invert (Inv)</strong></td><td>Flips the sensor&rsquo;s true/false</td><td>&ldquo;when NOT holding X&rdquo;; free NOT gate</td></tr>
<tr><td><strong>Level</strong></td><td>Fire pulses on true&harr;false <em>transitions</em> by default; Level = continuous state pulses</td><td>Level for held behaviors (thrust), edge for taps (menu)</td></tr>
<tr><td><strong>Tap</strong></td><td>One positive pulse per true period, even if held</td><td>Jump/interact keys</td></tr>
<tr><td><strong>True/False level triggering</strong></td><td>(build-dependent pair with Level)</td><td>Precision input wiring</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 The mental model that ends pulse confusion</div>
<p>Sensors don&rsquo;t &ldquo;do things&rdquo; &mdash; they&rsquo;re <strong>booleans with timing rules</strong>. Controller gates read the booleans; pulses are just &ldquo;the boolean changed / is being held.&rdquo; Diagnose any brick bug by asking: what is each sensor&rsquo;s boolean <em>right now</em>, and which pulse rule fired?</p></div>
` },

{ ch: 13, t: "Sensors — Input Reference", h: `
<h3>Keyboard / Mouse / Joystick fields</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Sensor</th><th>Fields</th><th>Python access</th></tr></thead>
<tbody>
<tr><td><strong>Keyboard</strong></td><td>Key (any), All keys toggle, LogToggle field</td><td><span class="chip">bge.logic.keyboard.events[keycode]</span> &rarr; status int</td></tr>
<tr><td><strong>Mouse</strong></td><td>Event (LMB/MMB/RMB/Movement/WheelUp/Dn), Target (this object or any)</td><td><span class="chip">bge.logic.mouse.events[...]</span>, <span class="chip">mouse.position</span></td></tr>
<tr><td><strong>Mouse Over (Any)</strong></td><td>Property/Material filter, X-Ray</td><td><span class="chip">sensor.hitObject / hitPosition / hitNormal</span></td></tr>
<tr><td><strong>Joystick</strong></td><td>Index, event type (axis/button/hat), threshold</td><td>via sensor fields in controller scripts</td></tr>
</tbody></table></div>

<h3>Key status constants (memorize these four)</h3>
<pre data-lang="python"><code>import bge
bge.logic.KX_INPUT_NONE            # 0  not pressed
bge.logic.KX_INPUT_JUST_ACTIVATED # 1  went down this tick  (edge)
bge.logic.KX_INPUT_ACTIVE         # 2  held
bge.logic.KX_INPUT_JUST_RELEASED  # 3  came up this tick   (edge)</code></pre>
` },

{ ch: 13, t: "Sensors — Proximity & Contact Reference", h: `
<h3>Near / Radar / Collision / Touch</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Sensor</th><th>Shape</th><th>Key fields</th><th>Requires</th></tr></thead>
<tbody>
<tr><td><strong>Near</strong></td><td>Sphere</td><td>Distance (trigger), ResetDistance (release), Property</td><td>Actor on self and target</td></tr>
<tr><td><strong>Radar</strong></td><td>Cone or Box</td><td>Radar type, Angle, Distance, Axis, Property</td><td>Actor; orientation = sensor object&rsquo;s local axis</td></tr>
<tr><td><strong>Collision</strong></td><td>Body shape</td><td>Property / Material (optional)</td><td>Dynamic/Rigid self (receives contacts)</td></tr>
<tr><td><strong>Touch</strong></td><td>Body shape</td><td>Property / Material</td><td>Works on <em>static</em> colliders too &mdash; cheap triggers</td></tr>
<tr><td><strong>Ray</strong></td><td>Line</td><td>Range, Axis, X-Ray, Property/Material</td><td>Nothing (pure query)</td></tr>
</tbody></table></div>

<h3>Python-side payload fields</h3>
<pre data-lang="python"><code>col = cont.sensors["Collision"]
if col.positive:
    ob    = col.hitObject        # (near/radar: hitObjectList)
    point = col.hitPosition      # world contact point
    n     = col.hitNormal        # world normal (impulses! Ch. 07)

ray = cont.sensors["Ray"]
obj, point, normal = ray.hitObject, ray.hitPosition, ray.hitNormal</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Near/Radar need <strong>Actor</strong> on both sides &mdash; a radar on a non-actor senses nothing, silently. First debug step for &ldquo;my sensor never fires&rdquo;: physics tab &rarr; Actor checked?</p></div>
` },

{ ch: 13, t: "Sensors — Special Reference", h: `
<h3>Property / Message / Always / Delay / Random</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Sensor</th><th>Fields</th><th>Behaves like</th></tr></thead>
<tbody>
<tr><td><strong>Property</strong></td><td>Property, Type (Equal/Changed/Less/Greater/Interval), Value</td><td>A watch expression &mdash; fires when true (or on change)</td></tr>
<tr><td><strong>Message</strong></td><td>Subject filter (blank = all)</td><td>Event subscription; bodies in Python</td></tr>
<tr><td><strong>Always</strong></td><td>(pulse options)</td><td>Tick generator; with Tap = once at startup</td></tr>
<tr><td><strong>Delay</strong></td><td>Delay (ticks), Duration (0=one pulse), Repeat</td><td>Timer/oscillator &mdash; Ch. 06 fire rate</td></tr>
<tr><td><strong>Random</strong></td><td>Seed, start/end</td><td>Writes random number <em>to a property</em> when pulsed</td></tr>
<tr><td><strong>Game / Scene (via actuators mostly)</strong></td><td>&mdash;</td><td>See actuator side</td></tr>
</tbody></table></div>

<h3>Composition patterns (the reference grammar)</h3>
<ul>
<li><strong>Always(level) + Python</strong> = per-frame behavior module.</li>
<li><strong>Always(tap) + Python</strong> = initializer (run once).</li>
<li><strong>Delay(repeat) + AND + key(level)</strong> = rate-limited held action.</li>
<li><strong>Message + Property gate</strong> = event handler with state check.</li>
</ul>
` },

{ ch: 13, t: "Controllers — Truth Table", h: `
<h3>The gates, formally</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>XOR</th><th>NAND</th><th>NOR</th><th>XNOR</th></tr></thead>
<tbody>
<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>
<tr><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td></tr>
<tr><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td></tr>
</tbody></table></div>

<h3>Field notes</h3>
<ul>
<li>Gates see <strong>current sensor states</strong> (not pulses) &mdash; a held key + level semantics keeps AND true every tick.</li>
<li><strong>XOR with 3+ sensors:</strong> true when an <em>odd number</em> are true (parity), not &ldquo;exactly one.&rdquo;</li>
<li>An <em>inverted</em> sensor feeding a gate = free NOT (sensor Inv flag) &mdash; cleaner than NAND topology in practice.</li>
<li><strong>Python controller:</strong> runs its script/module when linked sensor(s) give it a positive pulse (see next slide).</li>
</ul>
` },

{ ch: 13, t: "Python Controller — Script vs Module", h: `
<h3>Two execution models</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>Script</th><th>Module</th></tr></thead>
<tbody>
<tr><td>Reference</td><td>Text block name, runs whole file</td><td><span class="chip acc">file.function</span></td></tr>
<tr><td>Compile behavior</td><td>Re-executed line-by-line each pulse (classic) / recompiled</td><td>Module imported <strong>once</strong>; only the function runs per pulse</td></tr>
<tr><td>Persistent state</td><td>GlobalDict / properties only</td><td>Module-level variables survive between pulses (Ch. 06 scroll speed)</td></tr>
<tr><td>Speed</td><td>Slower (setup each run)</td><td>Faster; supports imports cleanly</td></tr>
<tr><td>Verdict</td><td>Quick tests</td><td><strong>Production default</strong> (used all course)</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># The canonical module skeleton (every project chapter used this shape)
import bge

def update():                       # wired as:  mymodule.update
    cont = bge.logic.getCurrentController()
    own  = cont.owner
    # sensors/actuators by name:
    key = cont.sensors["Key"]
    muz = cont.actuators["Motion"]
    if key.positive:
        cont.activate(muz)          # fire an actuator from code
    else:
        cont.deactivate(muz)</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Script flavor + module-style state: works until a domain reload resets it. If state must survive, either Module flavor or properties/globalDict &mdash; never &ldquo;it usually persists.&rdquo;</p></div>
` },

{ ch: 13, t: "Actuators — Motion Reference", h: `
<h3>Every mode and field</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mode</th><th>Fields</th><th>Semantics</th></tr></thead>
<tbody>
<tr><td>Simple Motion</td><td>dLoc, dRot (with L toggles)</td><td>Teleport-step per pulse; frame-rate dependent (avoid!)</td></tr>
<tr><td>Simple Motion</td><td>Linear/Angular velocity (L)</td><td>Set velocity directly; frame-rate safe</td></tr>
<tr><td>Force</td><td>F, Torque (L toggles)</td><td>Continuous N / N&middot;m integrated through mass</td></tr>
<tr><td>Add</td><td>dLoc/dRot variants</td><td>Same as Simple, additive framing</td></tr>
<tr><td>Servo Control</td><td>ref object, linV (L), max force, PID gains (P/I/D), damp</td><td>Closed-loop velocity servo &mdash; the movement gold standard</td></tr>
<tr><td>Character Motion</td><td>walk/run wrappers, jump</td><td>Character-physics companion</td></tr>
</tbody></table></div>

<h3>Servo PID in one breath</h3>
<ul>
<li><strong>P (proportional)</strong>: push proportional to velocity error &mdash; the muscle.</li>
<li><strong>I (integral)</strong>: corrects steady-state error (never quite reaching speed).</li>
<li><strong>D (derivative)</strong>: damping on approach &mdash; kills overshoot oscillation.</li>
<li>Start P=30..60, I=0, D=&lt;P/10&gt;; raise I only if it never reaches target speed.</li>
</ul>
` },

{ ch: 13, t: "Actuators — Action & Animation Reference", h: `
<h3>Playing clips (Ch. 10 summary + the rest)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Type/Values</th><th>Note</th></tr></thead>
<tbody>
<tr><td>Action</td><td>clip name</td><td>From the .blend&rsquo;s action list</td></tr>
<tr><td>Start/End</td><td>frames</td><td>Sub-window legal</td></tr>
<tr><td>Blend In</td><td>frames</td><td>Cross-fade duration</td></tr>
<tr><td>Mode</td><td>Play / Loop End / Loop Stop / Flipper / Property</td><td>Ch. 05 table; Property = frame follows a property</td></tr>
<tr><td>Layer / Weight</td><td>0&ndash;7 / 0&ndash;1</td><td>Composition (Ch. 10)</td></tr>
<tr><td>Priority</td><td>int (low wins)</td><td>Conflict resolution per layer</td></tr>
<tr><td>Frame Property</td><td>prop name</td><td>Publishes current frame &mdash; game logic reads it</td></tr>
</tbody></table></div>

<h3>Related Python surface (Ch. 10 recap)</h3>
<pre data-lang="python"><code>own.playAction(name, start, end, layer, play_mode, layer_weight,
               blendin, blend_mode, speed, priority)
own.stopAction(layer)          own.isPlayingAction(layer)
own.getActionName(layer)       own.getActionFrame(layer)
own.setActionFrame(f, layer)   own.setActionFramePercentage(p, layer)</code></pre>
` },

{ ch: 13, t: "Actuators — Edit Object / Constraint / Camera", h: `
<h3>The transformers</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Actuator</th><th>Modes &amp; fields</th><th>Course use</th></tr></thead>
<tbody>
<tr><td><strong>Edit Object</strong></td><td>Add (object, time, linV), End, Replace Mesh (mesh, Gfx/Phys), Track To (target, axis, time, 3D)</td><td>Ch. 06 spawning, deaths, turrets</td></tr>
<tr><td><strong>Constraint</strong></td><td>Constraint type (Location/Rotation/Orientation/Dist/Force), target object, min/max, influence, local/global, time</td><td>Aim rigs, keep-in-zone, fake springs</td></tr>
<tr><td><strong>Camera</strong></td><td>Object to follow, Height, Min/Max distance, Damping, Axis</td><td>The engine&rsquo;s chase cam (Ch. 05 options)</td></tr>
<tr><td><strong>Visibility</strong></td><td>Visibility, Occlusion, Children (recursive)</td><td>HUD reveals, Ch. 11 celebrations</td></tr>
<tr><td><strong>Parent</strong></td><td>Set/Remove parent, to object/bone (!), compound, ghost</td><td>Grabbing props, riding platforms</td></tr>
<tr><td><strong>Armature</strong></td><td>Run armature constraint per bone</td><td>Advanced rigs (Ch. 10 control)</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Parent-to-bone</div>
<p>The <strong>Parent actuator can parent to a specific bone</strong> &mdash; hand-in-hand with weapons, shoulder-mounted gear: the prop rides the animation perfectly. Era feature, still magic to watch work.</p></div>
` },

{ ch: 13, t: "Actuators — Scene / Message / State / Sound / Random", h: `
<h3>The directors</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Actuator</th><th>Modes &amp; fields</th><th>Course use</th></tr></thead>
<tbody>
<tr><td><strong>Scene</strong></td><td>Restart, Set, Add (overlay/background), Remove, Suspend, Resume</td><td>Ch. 06 flows, Ch. 11 states, HUDs</td></tr>
<tr><td><strong>Message</strong></td><td>To (all/object/property), Subject, Body (text or property)</td><td>Ch. 11 architecture</td></tr>
<tr><td><strong>State</strong></td><td>Set / Add / Remove (mask)</td><td>Ch. 12 machines</td></tr>
<tr><td><strong>Sound</strong></td><td>Mode (Play/Loop End/Stop/Loop Bidirectional/Loop Stop), Volume, Pitch, 3D</td><td>Ch. 05, 07</td></tr>
<tr><td><strong>Random</strong></td><td>Seed, Start/End &rarr; writes to property</td><td>Variation without scripts</td></tr>
<tr><td><strong>Game</strong></td><td>Start / Load / Save / Quit</td><td>Quit button, globalDict save/load</td></tr>
<tr><td><strong>Action / 2D Filter / Mouse / Steering</strong></td><td>See their slides; Steering: seek/flee/pathfollow (navmesh era)</td><td>Ch. 10, 13A, 12</td></tr>
</tbody></table></div>

<h3>Scene actuator semantics</h3>
<ul>
<li><strong>Overlay</strong> renders above; <strong>Background</strong> runs beside (no camera) &mdash; split-screen&rsquo;s cousin, sim without view.</li>
<li><strong>Suspend/Resume</strong> pause a scene&rsquo;s logic+physics &mdash; pause menus (overlay + suspend current).</li>
</ul>
` },

{ ch: 13, t: "Physics — World Settings Reference", h: `
<h3>Scene properties &rarr; Physics</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Default</th><th>Meaning / when to touch</th></tr></thead>
<tbody>
<tr><td>Physics engine</td><td>Bullet</td><td>(None = logic-only scenes, e.g., menus)</td></tr>
<tr><td>Gravity</td><td>(0, 0, &minus;9.81)</td><td>Space: 0; water games: 0 + drag (Ch. 08)</td></tr>
<tr><td>Physics steps/s</td><td>60</td><td>Fixed sim rate &mdash; determinism (Ch. 03)</td></tr>
<tr><td>Logic steps/s</td><td>60</td><td>Sensor/controller tick rate</td></tr>
<tr><td>Max substeps / substep length</td><td>1 / 0.0166</td><td>Raise substeps for tunneling (Ch. 07)</td></tr>
<tr><td>Solver iterations</td><td>5</td><td>Contact stiffness: stacking/jitter dial</td></tr>
<tr><td>Linear error correction</td><td>0.8</td><td>Penetration recovery speed</td></tr>
<tr><td>Physics deactivation rates</td><td>linear/angular/time</td><td>When bodies sleep &mdash; free perf</td></tr>
<tr><td>Debug physics visualization</td><td>off</td><td>ON while tuning &mdash; the Ch. 07 tool</td></tr>
</tbody></table></div>
` },

{ ch: 13, t: "Physics — Object Settings Reference", h: `
<h3>The object panel, row by row</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Group</th><th>Fields</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Type</td><td>No Collision / Static / Dynamic / Rigid Body / Soft Body / Sensor+NavMesh (era)</td><td>Ch. 03 table</td></tr>
<tr><td>Actor flags</td><td>Actor, Ghost, Portal(?), Invisible</td><td>Actor = sensible by Near/Radar; Invisible = hidden but physical</td></tr>
<tr><td>Forces</td><td>Force X/Y/Z (constant), Torque, Linear/Angular damping, Force field</td><td>Ch. 05/08 damping = the water</td></tr>
<tr><td>Dynamics</td><td>Mass, Radius, Form factor, anisotropic friction (x/y/z, coefficients)</td><td>Mass honest in kg (Ch. 07 law)</td></tr>
<tr><td>Collision</td><td>Bounds, Compound children, Collision margin,ghost bounds</td><td>Next slide</td></tr>
<tr><td>Rot lock / min/max velocity</td><td>axis locks, clamp</td><td>Character upright, anti-tunneling caps</td></tr>
<tr><td>Game karma? &mdash; Attribute flags</td><td>do FH, rot FH (era fields)</td><td>Floating-hover dynamics</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Fill <strong>Mass</strong> honestly (kg) even for props nobody weighs &mdash; every impulse formula (Ch. 07), knockback, and explosion reads it. &ldquo;Mass 1&rdquo; on a car is a lie the physics will keep exposing.</p></div>
` },

{ ch: 13, t: "Collision Bounds — Reference", h: `
<h3>Shapes and when each wins</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Bound</th><th>Cost</th><th>Fidelity</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Box</td><td>&#9733</td><td>&#9733</td><td>Default for crates, players, walls</td></tr>
<tr><td>Sphere</td><td>&#9733</td><td>&#9733+</td><td>Balls, bullets, pickups &mdash; smoothest contacts</td></tr>
<tr><td>Cylinder</td><td>&#9733&#9733;</td><td>&#9733&#9733;</td><td>Characters, columns, cans</td></tr>
<tr><td>Cone</td><td>&#9733&#9733;</td><td>&#9733&#9733;</td><td>Spires, impact markers</td></tr>
<tr><td>Convex Hull</td><td>&#9733&#9733;&#9733;</td><td>&#9733&#9733;&#9733;</td><td>Complex rigid props (sub hull! Ch. 08)</td></tr>
<tr><td>Triangle Mesh</td><td>&#9733&#9733;&#9733;&#9733;</td><td>&#9733&#9733;&#9733;&#9733;</td><td><strong>Static-only</strong> concave geometry (terrain)</td></tr>
<tr><td>Compound</td><td>varies</td><td>&#9733&#9733;&#9733;&#9733;</td><td>Multi-child assemblies: each child contributes its bound</td></tr>
</tbody></table></div>

<ul>
<li><strong>Collision margin</strong> (m): padding for stability &mdash; raise for thin fast objects rather than maxing substeps first.</li>
<li><strong>Compound</strong> + children = the professional multi-part body (a ship: box hull + cylinder turrets) with ONE dynamic root.</li>
<li>Trimesh on a dynamic body = unsupported (Ch. 05) &mdash; the error is silent in some builds: audit at export.</li>
</ul>
` },

{ ch: 13, t: "Bullet Constraints — Reference", h: `
<h3>Joints (Add Object &rarr; Physics &rarr; Constraint)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Constraint</th><th>DOF allowed</th><th>Fields</th><th>Game use</th></tr></thead>
<tbody>
<tr><td>Fixed</td><td>none</td><td>&mdash;</td><td>Weld two bodies (breakable bridges)</td></tr>
<tr><td>Point</td><td>ball rotation</td><td>pivot</td><td>Ropes, chains, lanterns</td></tr>
<tr><td>Hinge</td><td>1 axis + limits</td><td>axis, limits, <strong>motor</strong></td><td>Pinball flippers, doors, wheels (Ch. 07!)</td></tr>
<tr><td>Slider</td><td>1 translation</td><td>axis, limits</td><td>Elevators, pistons, drawers</td></tr>
<tr><td>Piston</td><td>slide + rotation</td><td>both</td><td>Screw drives</td></tr>
<tr><td>Generic (6-DOF)</td><td>everything, per-axis lock/limit + springs</td><td>the works</td><td>Ragdoll shoulders (Ch. 12), suspension</td></tr>
</tbody></table></div>

<h3>Constraint field notes</h3>
<ul>
<li><strong>Target object:</strong> leave empty = world anchor (a door hinge to the map).</li>
<li><strong>Motor</strong> (hinge/slider): target angular/linear velocity + max force &mdash; the flipper&rsquo;s muscle (Ch. 07).</li>
<li><strong>Springs</strong> (generic 6-DOF): stiffness + damping per axis &mdash; bouncy-carts and ragdoll softness.</li>
<li>Constraint objects are <em>scene objects</em>: name them, layer them with their bodies.</li>
</ul>
` },

{ ch: 13, t: "Forces & Impulses — API Reference", h: `
<h3>The body-mover cheatsheet</h3>
<pre data-lang="python"><code># --- continuous forces (integrated through mass, every call) ---
own.applyForce((fx, fy, fz), local=False)     # N
own.applyTorque((tx, ty, tz), local=False)    # N*m

# --- instantaneous velocity changes ---
own.applyImpulse(force_vector, point=own.worldPosition)  # N*s at point
#   dv = J / m ; point off-center adds spin (Ch. 07 bumpers)

# --- direct velocity writes (bypass mass -- use with care) ---
own.localLinearVelocity    = (0, 5, 0)     # write
own.worldLinearVelocity    = Vector
own.localAngularVelocity   / own.worldAngularVelocity

# --- gravity per body: physics panel option, or +Z force of m*g
#     each tick (the Ch. 08 buoyancy trick) ---

# --- transforms & queries ---
own.worldPosition / localPosition          # read/write Vector
own.worldOrientation / localOrientation    # 3x3 Matrix (heading = .col[1]*-1)
own.getVelocity(point) / getVelocity()     # at point / center
own.mass; own.worldScale</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Mixing systems: force <em>and</em> velocity-write on the same body each tick fight each other (velocity writes erase force integration). One body, one motion authority.</p></div>
` },

{ ch: 13, t: "Sound — System Reference", h: `
<h3>Formats, channels, behavior</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Topic</th><th>Facts</th></tr></thead>
<tbody>
<tr><td>Formats</td><td><strong>WAV 16-bit PCM</strong> = native one-shots; <strong>OGG</strong> = music/long loops (compressed)</td></tr>
<tr><td>Sample rates</td><td>44.1/48 kHz; keep consistent; mono for 3D-positioned sounds (!)</td></tr>
<tr><td>3D sound</td><td>Position + rolloff from the <em>listener</em> (active camera); Doppler optional; stereo files don&rsquo;t position well</td></tr>
<tr><td>Sound actuator</td><td>Play / Loop End / Loop Stop / Loop Bidirectional / Stop; Volume 0&ndash;1; Pitch 0&ndash;1 relative</td></tr>
<tr><td>Concurrency</td><td>Same sound rapid-fire = mixer may cut earlier voices; vary pitch (Ch. 07) to hide cuts</td></tr>
</tbody></table></div>

<h3>The production audio prep (Audacity pass)</h3>
<ol>
<li>Normalize peaks to &minus;3 dB (headroom for mixing), not 0.</li>
<li>Trim leading silence &mdash; 30 ms of dead air delays every cue.</li>
<li>Fade-in/out 5 ms to kill clicks at loop points.</li>
<li>Export WAV (fx) / OGG (music) with clear names: <span class="chip acc">sfx_pickup_pop.wav</span>.</li>
</ol>
` },

{ ch: 13, t: "Sound — Python Reference", h: `
<h3>Audiera-style factory playback</h3>
<pre data-lang="python"><code># snd.py -- a tiny sound manager via the aud module
import aud, bge

_device = aud.device()          # construct ONCE -- allocation is the slow part
_factories = {}                 # name -&gt; aud.Factory cache

def play(name, volume=1.0, pitch=1.0, loop=False):
    if name not in _factories:
        path = bge.logic.expandPath("//sounds/" + name)
        f = aud.Factory.file(path)
        if loop:
            f = f.loop(-1)                      # infinite loop factory
        _factories[name] = f
    handle = _device.play(_factories[name])
    handle.volume = volume
    handle.pitch = pitch
    return handle                # keep it if you plan to stop/pause later

def positioned(name, obj, volume=1.0):
    """3D sound tied to an object; update handle.position each tick."""
    h = play(name, volume)
    h.relative = False
    h.position = obj.worldPosition
    return h</code></pre>

<div class="callout note"><div class="co-label">&#9432 Two audio stacks, one rule</div>
<p>The actuator path is declarative (brick + file, instant). The programmatic path (<span class="chip acc">aud</span> module in later builds) gives handles, mixing, custom rolloff. Rule: <strong>actuators for one-shot feedback, aud for music, ducking, and anything continuous</strong> &mdash; and cache factories/devices once, never per frame.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Re-creating sound handles every tick: allocation storm + voice leaks. Construct once (module state), keep handles, stop explicitly.</p></div>
` },

{ ch: 13, t: "BGE Python — Module Map", h: `
<h3>The import surface</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Module</th><th>Contents</th><th>You use it for</th></tr></thead>
<tbody>
<tr><td><span class="chip acc">bge</span> (root)</td><td>logic, render, types, events, texture, audio aliases</td><td>Everything&rsquo;s doorway</td></tr>
<tr><td><span class="chip acc">bge.logic</span></td><td>getCurrentController/Scene, keyboard/mouse, sendMessage, globalDict, expandPath, LibLoad/Free/List, KX_ constants</td><td>The daily driver</td></tr>
<tr><td><span class="chip acc">bge.render</span></td><td>window size, fullscreen, mouse visibility, eye separation, GLSL material hooks (era), setBackgroundColor, showFramerate</td><td>Display control, Ch. 12 viewports</td></tr>
<tr><td><span class="chip acc">bge.types</span></td><td>KX_GameObject, KX_Scene, KX_TouchSensor&hellip; (for isinstance)</td><td>Type checks, subclassing</td></tr>
<tr><td><span class="chip acc">bge.events</span></td><td>Key/mouse code constants (WKEY, LEFTMOUSE&hellip;)</td><td>Input polling</td></tr>
<tr><td><span class="chip acc">bge.texture</span></td><td>Video textures, dynamic texture sources</td><td>Video screens, webcam feed on meshes</td></tr>
<tr><td><span class="chip acc">mathutils</span> (stdlib-adjacent)</td><td>Vector, Matrix, Euler, Quaternion, geometry</td><td>All spatial math</td></tr>
</tbody></table></div>
` },

{ ch: 13, t: "bge.logic — Essentials", h: `
<h3>The functions you call weekly</h3>
<pre data-lang="python"><code>import bge
L = bge.logic

# --- the context trio ---
cont  = L.getCurrentController()
own   = cont.owner
scene = L.getCurrentScene()

# --- input ---
L.keyboard.events[bge.events.SPACEKEY]      # status int (0..3)
L.mouse.position                            # (x, y) normalized
L.mouse.events[bge.events.LEFTMOUSE]

# --- messaging ---
L.sendMessage(subject, body="", to=None)    # to: name or property filter

# --- persistent state ---
L.globalDict            # dict surviving scene switches; save/load via Game actuator
L.saveGlobalDict()      # persist to disk (era API)

# --- scenes ---
scenes = L.getSceneList()

# --- files & streaming ---
L.expandPath("//file.txt")   # "//" = .blend folder
L.LibLoad(path, "Scene", asynchronous=False)
L.LibFree(name);  L.LibList()

# --- time ---
L.getFrameTime()   # seconds since start (this frame)
L.getRealTime()    # wall clock
L.getAverageFrameRate()</code></pre>
` },

{ ch: 13, t: "KX_GameObject — Essentials", h: `
<h3>The object API by category</h3>
<pre data-lang="python"><code># --- transforms ---
own.worldPosition            # Vector, read/write
own.worldOrientation         # 3x3 Matrix; .col[i] = local axis in world
own.worldScale; local* variants of all three
own.applyMovement((x,y,z), local=True)
own.applyRotation((rx,ry,rz), local=True)
own.alignAxisToVect(v, axis=2, factor=1.0)    # steering gem (Ch. 08)
own.getAxisVect((0,1,0))                      # local dir -&gt; world vector
own.getVelocity(point=None)

# --- physics (dynamic bodies) ---
own.mass; own.worldLinearVelocity / worldAngularVelocity
own.applyForce(v, local); own.applyTorque(v, local)
own.applyImpulse(v, point); own.suspendDynamics(); own.restoreDynamics()
own.linearDamping / angularDamping             # writable

# --- lifetime & identity ---
own.name; own.id; own["prop"]                  # game properties
own.endObject(); own.visible = False
own.scene; own.parent; own.children            # dict-like children

# --- spawning / meshes / animation ---
scene.addObject(template_name, reference_obj, time=0)
own.replaceMesh(mesh_name)
own.playAction(...)        # full surface on the Action slide

# --- raycast (the workhorse) ---
obj, point, normal = own.rayCast(to, from, dist,
                                 property="", face=1, xray=0, poly=0)</code></pre>
` },

{ ch: 13, t: "Scene & Objects — API Reference", h: `
<h3>KX_Scene surface</h3>
<pre data-lang="python"><code>scene = bge.logic.getCurrentScene()

scene.name                        # "scene_game"
scene.objects                     # active objects (list-like, get by name!)
scene.objectsInactive             # hidden-layer templates (the warehouse)
scene.objects["player"]           # by name -- None if absent? (KeyError-safe: .get)
scene.active_camera               # current view
scene.addObject(name, ref, time)  # the spawner (Ch. 06)
scene.replace(name)               # switch scene (Ch. 09 net client)
scene.restart()
scene.suspend() / .resume()
# lamps: ordinary objects (iterate scene.objects and filter .type)
# 2D filters: actuator-driven (classic) or scene filter manager (UPBGE)</code></pre>

<h3>Iteration patterns (the safe ones)</h3>
<pre data-lang="python"><code># find by property across the scene
enemies = [o for o in scene.objects if o.get("enemy")]

# spawn-all-then-iterate loops: iterate a COPY -- you may endObject() mid-loop
for ob in list(scene.objects):
    if ob.get("is_bullet") and ob.worldPosition.y &lt; -20:
        ob.endObject()</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Ending objects while iterating <span class="chip acc">scene.objects</span> directly &mdash; collection mutated during iteration. <span class="chip acc">list(...)</span> first; two characters, zero crashes.</p></div>
` },

{ ch: 13, t: "mathutils — Reference", h: `
<h3>The types you live in</h3>
<pre data-lang="python"><code>from mathutils import Vector, Matrix, Euler, Quaternion

v = Vector((1.0, 2.0, 3.0))
v.length; v.normalized(); v.dot(w); v.cross(w)
v + w; v - w; v * 2.0; v * M          # vector-matrix = transform
v.lerp(w, 0.5)                        # interpolation (Ch. 09!)
v.angle(other)                        # radians between
v.xy / v.xzy / v.zyx                  # swizzles (drop Z: vel.xy)

m = own.worldOrientation             # Matrix 3x3
m.col[1] * -1                        # local -Y axis in world (heading!)
Euler((rx, ry, rz), "XYZ").to_matrix()
own.worldOrientation.to_euler()      # readable rotation
q = Quaternion((axis_vec, angle)); own.worldOrientation = q.to_matrix()

# distance idiom you will type a thousand times:
d = (a.worldPosition - b.worldPosition).length</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Never hand-roll vector math on tuples: the <span class="chip acc">Vector</span> class is C-fast and readable. <span class="chip">(a-b).length &lt; r</span> instead of dx&sup2;+dy&sup2;+dz&sup2; &mdash; fewer bugs per feature, forever.</p></div>
` },

{ ch: 13, t: "Python — Common Recipes", h: `
<h3>The snippets that pay rent</h3>
<pre data-lang="python"><code># 1) Heading vector of an object (where its -Y faces):
fwd = own.worldOrientation.col[1] * -1.0

# 2) Grounded check (Ch. 05 jump gate):
hit = own.rayCast(own.worldPosition + (0,0,-1.2), own.worldPosition, 0, "", 1, 1)
grounded = hit[0] is not None

# 3) Move toward a point at speed s (per tick, dt-scaled):
to_t = target - own.worldPosition
own.worldPosition += to_t.normalized() * s * dt

# 4) Smooth follow camera:
cam.worldPosition = cam.worldPosition.lerp(
    target_pos - fwd * 6 + Vector((0,0,3)), 0.08)

# 5) Look at (yaw only):
own.alignAxisToVect(target - own.worldPosition, 1, 0.1)

# 6) Spawn with velocity along heading:
b = scene.addObject("bullet", own, 3)
b.worldLinearVelocity = fwd * 30.0

# 7) Property persistence between scenes:
bge.logic.globalDict["score"] = own["score"]

# 8) Fixed-timestep-safe input:
tick = 1.0 / 60.0
own.applyForce((0, -thrust, 0), True)   # continuous = rate-safe by nature</code></pre>
` },

{ ch: 13, t: "Debugging — Console & Techniques", h: `
<h3>Find the truth, fast</h3>
<div class="cols2">
<div>
<h4>The console is your co-pilot</h4>
<ul>
<li><em>Window &rarr; Toggle System Console</em> (Windows) &mdash; Python tracebacks land here, not in a dialog.</li>
<li><span class="chip acc">print()</span> with discipline: prefix the system (<span class="chip">[AI]</span>, <span class="chip">[NET]</span>).</li>
<li><em>Game &rarr; Record Animation / Show Framerate &amp; Profile</em> &mdash; runtime instrumentation.</li>
</ul>
</div>
<div>
<h4>The debug property trick</h4>
<ul>
<li>Mark properties <strong>debug</strong> (logic panel) &rarr; values overlay on screen while playing.</li>
<li>Named <span class="chip acc">dbg:hp</span> convention &mdash; filter your debug from teammates&rsquo;.</li>
</ul>
</div>
</div>

<h3>The error taxonomy (recognize on sight)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Traceback</th><th>Actual meaning</th></tr></thead>
<tbody>
<tr><td>KeyError: 'score'</td><td>Property missing on the object named in the controller &mdash; typo or wrong object</td></tr>
<tr><td>AttributeError: 'NoneType' has no attribute&hellip;</td><td>objects["name"] found nothing; check spelling/layer activity</td></tr>
<tr><td>Python script error: indentation</td><td>Tabs vs spaces in the text block &mdash; normalize to 4 spaces</td></tr>
<tr><td>IndexError in sensors[0]</td><td>Brick order changed &mdash; use names (this chapter&rsquo;s rule)</td></tr>
</tbody></table></div>
` },

{ ch: 13, t: "Migration — UPBGE & Modern Notes", h: `
<h3>Porting this reference forward</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Classic (this course)</th><th>UPBGE / modern</th></tr></thead>
<tbody>
<tr><td><span class="chip">bge.logic.getCurrentController()</span></td><td>Same, plus class-based components (UPBGE 0.3+)</td></tr>
<tr><td><span class="chip">bge.logic.sendMessage</span></td><td>Unchanged</td></tr>
<tr><td><span class="chip">globalDict</span></td><td>Unchanged (+ real file I/O APIs)</td></tr>
<tr><td>Logic bricks</td><td>Still present; Python components recommended for systems</td></tr>
<tr><td>Layers</td><td>Collections/Views naming; hidden-layer spawning still works</td></tr>
<tr><td>2D filters via actuator</td><td>Scene filter manager + same GLSL</td></tr>
<tr><td>Internal renderer GLSL 1.2-style</td><td>GLSL 3.x-class options; same concepts, fresher syntax</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Your transferable assets, ranked: <strong>(1)</strong> the architecture thinking (sensors/controllers/actuators &rarr; any ECS), <strong>(2)</strong> the Python discipline (modules, queues, contracts), <strong>(3)</strong> the optimization habits, <strong>(4)</strong> the API spellings. Relearn (4) per engine; keep (1)&ndash;(3) forever.</p></div>
` },

{ ch: 13, t: "Chapter 13 — Summary", h: `
<h3>The reference, indexed</h3>
<div class="cols2">
<div>
<h4>13A — Rendering</h4>
<ul>
<li>Material panels, diffuse/specular models &#10003;</li>
<li>Shading modes, GLSL features, texture influence &#10003;</li>
<li>Blend types, UV workflow, unwrap methods, baking &#10003;</li>
<li>Lamps, shadows, world/mist, 2D filters, uniforms &#10003;</li>
<li>Memory math, pipeline stages, budget examples, checklist &#10003;</li>
</ul>
</div>
<div>
<h4>13B — Logic, physics, code</h4>
<ul>
<li>Logic editor anatomy, sensor settings &amp; catalogs &#10003;</li>
<li>Controller truth table, Python controller flavors &#10003;</li>
<li>Every actuator family, field by field &#10003;</li>
<li>World/object physics, bounds, constraints, forces &#10003;</li>
<li>Sound, the full Python API map, recipes, debugging, migration &#10003;</li>
</ul>
</div>
</div>

<div class="callout tip"><div class="co-label">&#9733 How to use a reference</div>
<p>Don&rsquo;t memorize this chapter &mdash; <strong>visit it while building</strong>. Each project chapter&rsquo;s exercises send you back here twice; by the fourth visit the tables you actually use will have memorized themselves.</p></div>

<div class="callout note"><div class="co-label">&#9432 Next Up</div>
<p>Chapter 14 closes the course: installation and troubleshooting, support channels, the Foundation, community resources, migration guides, and the complete glossary.</p></div>
` }

);
