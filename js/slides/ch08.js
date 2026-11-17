/* Part II — Chapter 08: SubRacer (32 slides) */

SLIDES.push(

{ ch: 8, t: "Chapter 08 — SubRacer", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">08</div>
  <div class="ch-info">
    <h1>SubRacer</h1>
    <div class="ch-sub">Ship Setup &middot; Sensors &middot; Controllers &middot; Actuators &middot; Guns &middot; Game Objects &middot; Power-ups &middot; GLSL Mist</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will build an underwater racing shooter</h4>
  <ul>
    <li>Rig a submarine with believable &ldquo;wet&rdquo; physics</li>
    <li>Master the sensor family: Near, Radar, Ray &mdash; as gameplay organs</li>
    <li>Drive everything through force-based Motion actuators</li>
    <li>Build torpedoes, mines, and chasing enemy subs</li>
    <li>Implement a power-up system (shield, boost, sonar)</li>
    <li>Write your first real GLSL shader: the famous underwater mist</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>32</b> slides</span>
  <span class="ch-stat"><b>~6</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9733&#9733&#9734</b></span>
</div>
` },

{ ch: 8, t: "Design — The Submarine Racer", h: `
<h3>Loop and fantasy</h3>
<p><em>&ldquo;Race your sub through a flooded canyon of tubes and gates; dodge mines, blast rival subs, grab power-ups, beat the clock.&rdquo;</em> Two verbs braided: <strong>fly</strong> (3D movement) and <strong>shoot</strong> (turrets forward), plus the racer&rsquo;s clock pressure.</p>

<div class="cols3">
  <div class="card"><h4>Movement</h4><p>6-DOF submarine: thrust + pitch/yaw/roll, damped like moving through honey.</p></div>
  <div class="card"><h4>Combat</h4><p>Forward torpedoes (slow, heavy), mines (static hazards), enemy subs (chase AI).</p></div>
  <div class="card"><h4>Race</h4><p>Checkpoint gates in order; timer; lap record in globalDict.</p></div>
</div>

<h3>The engineering thesis of this chapter</h3>
<ul>
<li>Chapters 5&ndash;7 used <em>a few</em> sensors/actuators. SubRacer uses them as a <strong>vocabulary</strong>: Near, Radar, and Ray each get a real job, and the Motion actuator&rsquo;s force model gets the deep dive it deserves.</li>
<li>And the visual thesis: <strong>custom GLSL</strong> &mdash; if the whole screen is underwater, fog-by-shader sells it (slides 25&ndash;31).</li>
</ul>
` },

{ ch: 8, t: "Ship Setup — Model & Hierarchy", h: `
<h3>Build the hull for logic, not just looks</h3>
<div class="flow">
  <span class="fnode hot">sub_root<small>empty / physics body (dynamic)</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">hull<small>visual mesh, ghost physics</small></span><span class="farrow">+</span>
  <span class="fnode">turret_pivot<small>empty &rarr; gun barrel &rarr; muzzle</small></span><span class="farrow">+</span>
  <span class="fnode">sensor_rig<small>empties hosting Radar/Ray sensors</small></span>
</div>

<ol>
<li><strong>Hull:</strong> capsule-ish body &mdash; cylinder + half-spheres, 4 m long. Front = local &minus;Y (engine convention from Ch. 06).</li>
<li><strong>Pivot:</strong> sub_root&rsquo;s origin at the center of mass (visual balance and torque sanity).</li>
<li><strong>Sensor rig:</strong> separate empties (<span class="chip acc">sense_front</span>, <span class="chip acc">sense_down</span>) hosting the radar/ray bricks &mdash; logic is placement, placement is editable.</li>
<li>Textures: metal hull with rust streaks (vertical dirt = believable underwater wear), emissive portholes.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>The <em>physics body</em> (sub_root) is minimal and convex; the <em>visual hull</em> is decorative ghost mesh. Simple collision = stable physics + cheap contacts (Ch. 05&rsquo;s two-mesh rule at vehicle scale).</p></div>
` },

{ ch: 8, t: "Ship Physics — The Water Feel", h: `
<h3>Wet dynamics</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Value</th><th>Water rationale</th></tr></thead>
<tbody>
<tr><td>Type</td><td>Dynamic (+ rigid body)</td><td>Torque-responsive steering</td></tr>
<tr><td>Mass</td><td>800 kg</td><td>Heavy enough to feel mechanical</td></tr>
<tr><td>Linear damping</td><td>0.35</td><td>Water drag &mdash; the #1 &ldquo;underwater&rdquo; cue</td></tr>
<tr><td>Angular damping</td><td>0.6</td><td>Turning has resistance; stops spinning when input stops</td></tr>
<tr><td>Bounds</td><td>Convex Hull</td><td>Capsule-accurate without trimesh cost</td></tr>
<tr><td>Gravity</td><td>OFF (Force field &rarr; disable world gravity)</td><td>Buoyancy balances gravity (next slides)</td></tr>
</tbody></table></div>

<h3>Damping is the water</h3>
<ul>
<li>Vacuum = zero damping (space games). Air = ~0.01. <strong>Water = 0.3&ndash;0.5.</strong> The same thrust produces gliding, deliberate motion &mdash; instant fantasy.</li>
<li>Damping also stabilizes your control loops: high thrust + high damping = fast but settled; a PID tuner would call it a well-damped servo.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Gravity ON + buoyancy OFF: the sub sinks like an anchor and &ldquo;swims&rdquo; only under thrust. Either disable gravity for the body or add a continuous +Z force of m&middot;g (7,848 N here) to fake neutral buoyancy.</p></div>
` },

{ ch: 8, t: "Sensors — The Concept", h: `
<h3>Sensors are organs, not buttons</h3>
<p>Chapters so far used sensors as <em>input devices</em> (keys, clicks, touches). The bigger idea: a sensor is any <strong>question the engine asks the world every tick</strong> &mdash; and gameplay is designing good questions:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Question</th><th>Sensor</th><th>SubRacer answers it for&hellip;</th></tr></thead>
<tbody>
<tr><td>&ldquo;Is something within R of me?&rdquo;</td><td><strong>Near</strong></td><td>Power-up attraction, mine proximity warning</td></tr>
<tr><td>&ldquo;Is something in my view cone?&rdquo;</td><td><strong>Radar</strong></td><td>Enemy perception, checkpoint detection, wall avoidance</td></tr>
<tr><td>&ldquo;What is along this line?&rdquo;</td><td><strong>Ray</strong></td><td>Floor depth, torpedo hits, wall warning</td></tr>
<tr><td>&ldquo;Am I touching / overlapping?&rdquo;</td><td>Touch / Collision</td><td>Gate passage, mine detonation</td></tr>
<tr><td>&ldquo;Has a variable changed?&rdquo;</td><td>Property</td><td>State transitions everywhere</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Design lens</div>
<p>Write each mechanic as a question first (&ldquo;is a wall within 20 m of my heading?&rdquo;), then pick the sensor that asks it, then tune the geometry. Sensor-first design beats logic-first: the question is gameplay, the bricks are just plumbing.</p></div>
` },

{ ch: 8, t: "Near Sensor — Reference & Practice", h: `
<h3>Fields</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Meaning</th><th>SubRacer value</th></tr></thead>
<tbody>
<tr><td>Distance</td><td>Radius where the sensor starts detecting (ResetDistance below)</td><td>10 m (attraction range)</td></tr>
<tr><td>Reset Distance</td><td>Hysteresis: distance at which detection <em>stops</em></td><td>12 m &mdash; always slightly larger!</td></tr>
<tr><td>Property</td><td>Only objects with this property trigger</td><td>is_pickup</td></tr>
</tbody></table></div>

<h3>Job 1 — magnet pickups</h3>
<div class="flow">
  <span class="fnode hot">Near: is_pickup<small>10/12 m, on pickup</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <span class="fnode">Edit Object: Track To pickup<small>(pickup does the pulling)</small></span>
</div>
<ul>
<li>On the <strong>pickup</strong> side: Near the player (6 m) &rarr; apply force toward the sub each tick &mdash; the token <em>swims to you</em> like a curious fish.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall — no hysteresis</div>
<p>Distance = ResetDistance makes the sensor chatter at the boundary (in/out/in/out every tick) &mdash; flickering logic, flickering sounds. Always set reset ~20% larger than trigger. The same rule governs Radar and real-world thermostats alike.</p></div>
` },

{ ch: 8, t: "Radar Sensor — Reference & Practice", h: `
<h3>Fields</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Meaning</th><th>Wall-avoid radar</th></tr></thead>
<tbody>
<tr><td>Radar type</td><td>Cone (angle) or Box</td><td>Cone</td></tr>
<tr><td>Angle</td><td>Cone half-angle (degrees)</td><td>15&deg;</td></tr>
<tr><td>Distance</td><td>Range along the axis</td><td>25 m</td></tr>
<tr><td>Axis</td><td>Cast direction (local to sensor object)</td><td>&minus;Y (forward)</td></tr>
<tr><td>Property</td><td>Target filter</td><td>is_wall</td></tr>
</tbody></table></div>

<h3>Job — canyon wall avoidance (both sides)</h3>
<div class="cols2">
<div>
<p><strong>Radar L</strong> (on sense_front, axis rotated 30&deg; left): detects walls before you scrape them.</p>
<div class="flow">
  <span class="fnode hot">Radar L: is_wall</span><span class="farrow">&rarr;</span>
  <span class="fnode">Motion: torque +Z (steer right)</span>
</div>
</div>
<div>
<p><strong>Radar R</strong> mirrors it &rarr; torque &minus;Z. The two together = a <em>breadcrumb autopilot</em>: the sub politely refuses to kiss canyon walls.</p>
<div class="callout tip"><div class="co-label">&#9733 Tip</div><p>Put left/right radars on <em>separate empties</em> angled apart, not one radar &mdash; two cheap cones beat one expensive 120&deg; cone, and the torque direction needs no math.</p></div>
</div>
</div>

<div class="callout note"><div class="co-label">&#9432 Radar vs Near</div>
<p>Near is a sphere (direction-free); Radar is oriented (the object&rsquo;s local axis matters). &ldquo;Do I sense it&rdquo; &rarr; Near. &ldquo;Do I sense it <em>ahead of me</em>&rdquo; &rarr; Radar.</p></div>
` },

{ ch: 8, t: "Ray Sensor — Reference & Practice", h: `
<h3>Fields</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Meaning</th><th>Depth ray</th></tr></thead>
<tbody>
<tr><td>Range</td><td>Max cast distance</td><td>60 m</td></tr>
<tr><td>Axis</td><td>Direction (local)</td><td>&minus;Z (down)</td></tr>
<tr><td>X-Ray</td><td>Pass through non-matching objects</td><td>ON + property <span class="chip acc">is_floor</span></td></tr>
<tr><td>Property/Material</td><td>Hit filter</td><td>is_floor</td></tr>
</tbody></table></div>

<h3>Job 1 — altitude readout (and floor repulsion)</h3>
<pre data-lang="python"><code># sonar.py -- on sense_down (Ray sensor "FloorRay", X-Ray, is_floor)
import bge

def update():
    cont = bge.logic.getCurrentController()
    ray = cont.sensors["FloorRay"]
    own = cont.owner
    if ray.positive:
        dist = (own.worldPosition - ray.hitPosition).length
        own["altitude"] = round(dist, 1)          # HUD reads this
        if dist &lt; 8.0:                             # too low: soft repulsion
            own.applyForce((0, 0, (8.0 - dist) * 60.0), False)
            # 0 N at 8 m, 480 N at 0 m -- a linear "water cushion"</code></pre>

<h3>Job 2 — targeting line (turret)</h3>
<ul>
<li>Ray forward from <span class="chip acc">muzzle</span>, property <span class="chip acc">enemy</span>, X-Ray ON: the first enemy in a straight line gets a lock (Property sensor on target: locked=True &rarr; HUD reticle + homing torpedoes home to it).</li>
</ul>
` },

{ ch: 8, t: "Controllers — Assembling Behavior", h: `
<h3>From signals to decisions</h3>
<h3>Pattern 1 — arbitration (mutually exclusive drives)</h3>
<div class="flow">
  <span class="fnode hot">Radar wall L</span><span class="farrow">&rarr;</span>
  <span class="fnode">NOR gate<small>(not L, not R)</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Normal steering</span>
</div>
<ul>
<li>Wall-avoidance <em>suppresses</em> player steering while active: NOR(avoidL, avoidR) gates the WASD column &mdash; a priority arbiter in two bricks.</li>
</ul>
<h3>Pattern 2 — accumulation (adds up drives)</h3>
<div class="flow">
  <span class="fnode">Thrust key</span><span class="farrow">+</span>
  <span class="fnode">Boost pickup</span><span class="farrow">+</span>
  <span class="fnode">Floor cushion</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">forces sum in physics<small>no gate needed</small></span>
</div>
<ul>
<li>Multiple force actuators on one body simply <em>add</em> &mdash; the physics engine is the adder. This is why force-based control composes cleanly.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Choose per mechanic: <strong>arbitrate</strong> (one winner &mdash; steering, states) with gates and priorities; <strong>accumulate</strong> (parallel pushes &mdash; forces, drag) through physics itself. Most &ldquo;logic fights itself&rdquo; bugs are accumulation where arbitration was needed.</p></div>
` },

{ ch: 8, t: "Actuators — Motion Deep Dive", h: `
<h3>Every field of the Motion actuator, honestly</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mode</th><th>Fields</th><th>Semantics</th><th>Frame-rate safe?</th></tr></thead>
<tbody>
<tr><td>Simple Motion</td><td>dLoc / dRot</td><td>Instant teleport-step each pulse</td><td><strong>No</strong> (per-frame)</td></tr>
<tr><td>Simple Motion</td><td>Linear/Angular velocity</td><td>Sets velocity directly</td><td>Yes</td></tr>
<tr><td>Force</td><td>F, Torque</td><td>Continuous N (N&middot;m) &mdash; physics integrates mass</td><td>Yes</td></tr>
<tr><td>Add</td><td>dLoc/dRot variants</td><td>Same as Simple</td><td>No</td></tr>
<tr><td>Servo Control</td><td>linV target, force cap, PID</td><td>Closed-loop velocity control</td><td>Yes &mdash; best feel</td></tr>
<tr><td>Character Motion</td><td>walk/jump wrapper</td><td>Character-controller style</td><td>Yes</td></tr>
</tbody></table></div>

<h3>SubRacer assignments</h3>
<ul>
<li><strong>Thrust (W/S):</strong> Force local &minus;Y &plusmn;2400 N (3 m/s&sup2; on 800 kg).</li>
<li><strong>Pitch/yaw keys:</strong> Torque local X/Z &plusmn;2200 N&middot;m.</li>
<li><strong>Roll (Q/E):</strong> Torque local Y 1600.</li>
<li><strong>Servo hold (always):</strong> linV max-speed clamp &mdash; the speed limiter that keeps boost meaningful.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Units matter</div>
<p>Force in newtons, torque in newton-meters, against mass in kg. &ldquo;2400 N&rdquo; isn&rsquo;t magic: a = F/m = 3 m/s&sup2;. Every good feel starts as honest arithmetic.</p></div>
` },

{ ch: 8, t: "The Control Rig — Brick Edition", h: `
<h3>The full flight column set</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Input</th><th>Sensor</th><th>Controller</th><th>Actuator</th></tr></thead>
<tbody>
<tr><td>W / S</td><td>Keyboard level</td><td>AND</td><td>Force &minus;Y +2400 / &minus;1400 (brake weaker)</td></tr>
<tr><td>A / D</td><td>Keyboard level</td><td>AND</td><td>Torque Z &plusmn;2200</td></tr>
<tr><td>&uarr; / &darr;</td><td>Keyboard level</td><td>AND</td><td>Torque X &plusmn;2000 (pitch)</td></tr>
<tr><td>Q / E</td><td>Keyboard level</td><td>AND</td><td>Torque Y &plusmn;1600 (roll)</td></tr>
<tr><td>Shift</td><td>Keyboard tap</td><td>AND + boost_charge &gt; 0</td><td>Force &minus;Y 8000 for 2 s (Timer-gated)</td></tr>
<tr><td>&mdash; (always)</td><td>Always level</td><td>AND</td><td>Servo: clamp |linV| &le; 18 m/s</td></tr>
</tbody></table></div>

<h3>Why pitch AND yaw AND roll</h3>
<ul>
<li>A plane needs roll to turn well; a sub needs it to <em>bank into canyon curves</em> (readability!) and to align with sloping tube sections.</li>
<li>Roll is also the player&rsquo;s self-righting tool: with angular damping 0.6, releasing roll torque settles the sub level-ish on its own.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Forgetting to check the <strong>L (local)</strong> toggle on forces/torques: world-axis thrust makes the sub accelerate north no matter where the nose points &mdash; the &ldquo;car on rails&rdquo; bug.</p></div>
` },

{ ch: 8, t: "The Control Rig — Python Edition", h: `
<h3>One module replaces the column farm</h3>
<pre data-lang="python"><code># sub.py -- module controller on sub_root (Always sensor, level)
import bge

THRUST, BRAKE = 2400.0, 1400.0
TORQUE_PITCH, TORQUE_YAW, TORQUE_ROLL = 2000.0, 2200.0, 1600.0
MAX_SPEED = 18.0

def update():
    own = bge.logic.getCurrentController().owner
    key = bge.logic.keyboard
    J, A = bge.logic.KX_INPUT_JUST_ACTIVATED, bge.logic.KX_INPUT_ACTIVE
    k = lambda code: key.events[code] == A          # tiny helper: held?

    # --- forces: accumulate through physics ------------------------
    thrust = (THRUST if k(bge.events.WKEY) else 0) - (BRAKE if k(bge.events.SKEY) else 0)
    own.applyForce((0, -thrust, 0), True)           # local -Y

    own.applyTorque((
        TORQUE_PITCH * ((k(bge.events.UPARROWKEY) - k(bge.events.DOWNARROWKEY))),
        TORQUE_ROLL  * ((k(bge.events.EKEY) - k(bge.events.QKEY))),
        TORQUE_YAW   * ((k(bge.events.DKEY) - k(bge.events.AKEY))),
    ), True)                                        # local axes

    # --- speed limiter (the servo clamp, hand-rolled) ---------------
    v = own.worldLinearVelocity
    if v.length &gt; MAX_SPEED:
        own.worldLinearVelocity = v.normalized() * MAX_SPEED</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Force <em>directions</em> are bool arithmetic: held(&minus;)held = &minus;1, 0, +1. No if-trees, no duplicated actuators, and the gamepad port later is just axis floats replacing bools.</p></div>
` },

{ ch: 8, t: "Depth Control & Buoyancy", h: `
<h3>Six lines of submarine realism</h3>
<pre data-lang="python"><code># buoyancy.py -- continues sub.py's update() (or its own module)
import bge

def update():
    own = bge.logic.getCurrentController().owner
    g = 9.81 * own.mass                 # weight force, N (if gravity on)
    own.applyForce((0, 0, g), False)    # neutral buoyancy: cancels weight

    # optional vertical water cushion near floor (from sonar.py):
    #   floor ray &lt; 8 m -&gt; push up proportional to closeness</code></pre>

<h3>The design layer on top</h3>
<ul>
<li><strong>Depth planes:</strong> pitch + forward speed = climb/dive like a real sub (already emergent from the rig!).</li>
<li><strong>Slight positive buoyancy</strong> (multiply g by 1.02): an idle sub drifts <em>slowly upward</em> &mdash; the subtle &ldquo;alive&rdquo; feeling, and it gently rescues crashed players.</li>
<li><strong>Ballast power-up:</strong> temporarily inverts to 0.9 &mdash; the sub sinks sneakily under mine lines.</li>
</ul>

<div class="callout term"><div class="co-label">&#9670 Term — Emergent mechanics</div>
<p>Behaviors that arise from systems interacting, not from scripted cases: pitch+thrust&harr;depth, damping&harr;drift, cushion&harr;soft crash. Design the systems honestly and you get mechanics &ldquo;for free&rdquo; &mdash; the cheapest content there is.</p></div>
` },

{ ch: 8, t: "Guns — Turret & Torpedoes", h: `
<h3>The weapon rig (Ch. 06&rsquo;s pattern, wetter)</h3>
<div class="flow">
  <span class="fnode">sub_root</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">turret_pivot<small>pitch-only, mouse-aimed</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">barrel &rarr; muzzle<small>spawn point</small></span>
</div>

<h3>Torpedo = slow bullet, honest physics</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Aspect</th><th>Value</th><th>vs Ch. 06 bullet</th></tr></thead>
<tbody>
<tr><td>Speed</td><td>14 m/s</td><td>Slower &mdash; dodging is possible</td></tr>
<tr><td>Mass</td><td>25 kg</td><td>Heavy &mdash; pushes what it hits</td></tr>
<tr><td>Drag</td><td>Damping 0.15</td><td>Decelerates over range &mdash; weapon falloff by physics</td></tr>
<tr><td>Lifetime</td><td>5 s / 70 m</td><td>&mdash;</td></tr>
<tr><td>Visual</td><td>Emissive head + bubble trail particles</td><td>Feedback matters more when slow</td></tr>
</tbody></table></div>

<ul>
<li>Fire: LMB + Delay rate-limit (1.1 Hz) &rarr; <span class="chip acc">addObject("torpedo", muzzle, 5)</span> + applyMovement local &minus;Y 14.</li>
<li>Homing variant: every 3 ticks, torpedo lerps its heading toward the locked target (Ray-sensor lock from slide 8) &mdash; 12 lines of Python, huge feel win.</li>
</ul>
` },

{ ch: 8, t: "Mines & Hazards", h: `
<h3>Static danger, maximal readability</h3>
<div class="cols2">
<div>
<h4>The mine</h4>
<ul>
<li>Spiky sphere, <em>static</em> + ghost trigger (Touch property <span class="chip acc">is_hazard</span>).</li>
<li>Proximity fuse: Near (player, 3/3.6 m hysteresis!) &rarr; detonate.</li>
<li>Detonate = replace mesh (shockwave ring), apply radial impulse to <em>all</em> dynamics in 8 m, sound, end after 0.3 s.</li>
</ul>
<pre data-lang="python"><code># mine.py -- detonation impulse in radius
import bge
def update():
    cont = bge.logic.getCurrentController()
    own = cont.owner
    trig = cont.sensors["Prox"]
    if trig.positive:
        for ob in bge.logic.getCurrentScene().objects:
            if hasattr(ob, "mass") and ob.mass and ob != own:
                d = ob.worldPosition - own.worldPosition
                if d.length &lt; 8.0:
                    ob.applyImpulse(d.normalized() * 900.0 * (1 - d.length/8.0),
                                    ob.worldPosition)
        own["dead"] = True   # triggers boom visuals + end</code></pre>
</div>
<div>
<h4>Design rules for hazards</h4>
<ul>
<li><strong>Telegraph:</strong> the mine blinks 0.5 s before the proximity fuse arms.</li>
<li><strong>Fair warning:</strong> the sub&rsquo;s Near (12 m) triggers a soft ping sound &mdash; danger has an audio radius larger than the kill radius.</li>
<li><strong>Punish, don&rsquo;t kill:</strong> first mine = damage + knockback; death requires stacking mistakes (Ch. 06 invuln discipline).</li>
</ul>
</div>
</div>
` },

{ ch: 8, t: "Game Objects — Managing Entities", h: `
<h3>Scene population as an engineering task</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Population</th><th>Count</th><th>Lives on</th><th>Physics</th></tr></thead>
<tbody>
<tr><td>Sub (player)</td><td>1</td><td>Layer 1</td><td>Dynamic + gravity-off</td></tr>
<tr><td>Canyon/tube geometry</td><td>~40 chunks</td><td>Layer 1</td><td>Static, joined per chunk</td></tr>
<tr><td>Checkpoints</td><td>8</td><td>Layer 1</td><td>Ghost triggers</td></tr>
<tr><td>Mines</td><td>~25</td><td>Layer 1, placed</td><td>Static ghost</td></tr>
<tr><td>Enemy subs</td><td>0&ndash;3 alive</td><td>Spawned from Layer 2 template</td><td>Dynamic</td></tr>
<tr><td>Torpedoes/pickups/particles</td><td>0&ndash;30 alive</td><td>Spawned from Layer 2</td><td>Dynamic ghost</td></tr>
</tbody></table></div>

<h3>Entity contracts (every spawned thing)</h3>
<ul>
<li>Properties: identity (<span class="chip acc">is_*</span>), state, lifetime owner.</li>
<li>An exit path: time end / drain end / consumption.</li>
<li>A cost ceiling: max alive per type (spawn gates: <span class="chip acc">if count_alive &lt; cap</span>).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Keep a <em>population budget table</em> like this one per scene. It converts &ldquo;the game feels heavy later&rdquo; into &ldquo;37 dynamic bodies &gt; 25 budget &mdash; which type leaks?&rdquo; (Answer via the debugger&rsquo;s object list; Ch. 13.)</p></div>
` },

{ ch: 8, t: "Inactive Layers — The Staging Doctrine", h: `
<h3>Layer 2: the warehouse</h3>
<ul>
<li>All spawnable templates live on <strong>layer 2</strong>: torpedo, mine template (for procedural fields!), enemy sub, pickups, particles, explosion.</li>
<li>Hidden-layer objects are <strong>inactive</strong>: not simulated, not rendered, not raycast-visible &mdash; but <span class="chip acc">scene.addObject</span> copies them live in one call.</li>
<li><span class="chip acc">scene.objectsInactive</span> lists the warehouse: verify your templates are there and <em>only</em> there.</li>
</ul>

<h3>Procedural minefield (templates as data)</h3>
<pre data-lang="python"><code># minefield.py -- build once at scene start (Message: "build_level")
import bge, random, math

def build():
    scene = bge.logic.getCurrentScene()
    for i in range(25):
        mine = scene.addObject("mine", scene.objects["spawn_origin"], 0)
        t = i * 12.0                                        # spaced along track
        mine.worldPosition = [random.uniform(-9, 9), t, random.uniform(-8, 4)]
        # ...optionally snap onto the tube walls for &ldquo;attached&rdquo; mines</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Templates left on layer 1 go live at frame one &mdash; 25 mines detonating at origin. The pre-export ritual from Ch. 05 (toggle layers, verify) now also runs <em>at every session start</em>. Automate it: a tiny &ldquo;auditor&rdquo; script counting layer-1 objects ending in &ldquo;_tpl&rdquo;.</p></div>
` },

{ ch: 8, t: "Power-ups — Design", h: `
<h3>Three that change the game, not just the number</h3>
<div class="cols3">
  <div class="card hot"><h4>Shield</h4><p><strong>8 s of invulnerability</strong> with visible bubble. Defensive repositioning; teaches hazard timing.</p><div class="card-k">state: shield_t Timer</div></div>
  <div class="card"><h4>Boost</h4><p><strong>3 s +12000 N</strong> with FOV kick and trail. Racer&rsquo;s currency: save it for straights.</p><div class="card-k">state: boost_t Timer</div></div>
  <div class="card"><h4>Sonar</h4><p><strong>Reveals mines 40 m for 6 s</strong> (mines swap to emissive mesh via message). Information is a power-up.</p><div class="card-k">broadcast: message</div></div>
</div>

<h3>Pickup anatomy</h3>
<ul>
<li>Floating token (Ch. 05 bob action), <span class="chip acc">is_pickup</span> property, Near-magnet toward player (slide 5).</li>
<li>On touch: message <span class="chip acc">"powerup" body=kind</span> &rarr; player &rarr; end object + chime. The player&rsquo;s <em>rulebook</em> decides what the kind does.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Power-ups as <strong>Timers, not flags</strong>: a Timer counts to zero and the effect&rsquo;s Property sensor (level &le; 0) expires it automatically &mdash; no cleanup code, no stuck-forever bugs. Duration balance = editing one init value.</p></div>
` },

{ ch: 8, t: "Power-ups — Logic & Effects", h: `
<h3>The rulebook, brick and Python</h3>
<div class="flow">
  <span class="fnode">Token touch</span><span class="farrow">&rarr;</span>
  <span class="fnode">Message "powerup" body=shield</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">player.Message sensor</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">APPLY</span>
    <span class="fnode">Property: shield_t = 8</span>
    <span class="fnode">Visibility: bubble ON</span>
  </div>
</div>

<pre data-lang="python"><code># powerup.py -- on player (Message sensor "powerup")
import bge

def apply():
    cont = bge.logic.getCurrentController()
    own = cont.owner
    msg = cont.sensors["powerup"]
    for kind in msg.bodies:
        if kind == "shield":
            own["shield_t"] = 8.0            # Timer auto-counts down
            own.children["bubble"].visible = True
        elif kind == "boost":
            own["boost_t"] = 3.0
        elif kind == "sonar":
            bge.logic.sendMessage("reveal_mines")   # mines listen (below)

def tick_effects():    # Always sensor -- effect maintenance
    own = bge.logic.getCurrentController().owner
    if own["shield_t"] &lt;= 0:
        own.children["bubble"].visible = False
    if own["shield_t"] &gt; 0:
        own["invuln"] = True        # damage gate reads this (Ch. 06 flow)
    else:
        own["invuln"] = False</code></pre>

<div class="callout tip"><div class="co-label">&#9733 Tip — the Sonar pattern</div><p>Broadcast effects (<span class="chip acc">reveal_mines</span>) are one-to-many by nature: you don&rsquo;t know which mines exist. Message broadcasting is the right primitive &mdash; each mine decides for itself what &ldquo;revealed&rdquo; means.</p></div>
` },

{ ch: 8, t: "Enemy Subs — Chase AI", h: `
<h3>Perceive &rarr; decide &rarr; act, in 25 lines</h3>
<pre data-lang="python"><code># enemysub.py -- module controller on enemy sub
import bge

SPEED, TURN_RATE, ATTACK_RANGE = 10.0, 1.4, 30.0

def update():
    own  = bge.logic.getCurrentController().owner
    scene = bge.logic.getCurrentScene()
    player = scene.objects.get("sub_root")
    if not player or own["dead"]:
        return

    to_player = player.worldPosition - own.worldPosition
    dist = to_player.length

    # 1) PERCEIVE: is the player inside my forward cone? (dot product test)
    fwd = own.worldOrientation.col[1] * -1.0            # local -Y = my heading
    if to_player.normalized().dot(fwd) &gt; 0.5:          # ~60 deg cone
        own["sees"] = True
    else:
        own["sees"] = False

    # 2) DECIDE + 3) ACT
    if own["sees"] and dist &gt; ATTACK_RANGE:
        own.alignAxisToVect(to_player, 1, TURN_RATE * 0.02)   # steer to player
        own.applyForce((0, -SPEED * 60.0, 0), True)           # pursue (m=60 kg)
    elif not own["sees"]:
        own.applyTorque((0, 0, 900.0), True)                  # search: circle

    if own["sees"] and dist &lt; ATTACK_RANGE and own["reload"] &lt;= 0:
        torp = scene.addObject("enemy_torpedo", own, 4)
        torp.worldLinearVelocity = to_player.normalized() * 12.0
        own["reload"] = 90                                     # 1.5 s @ 60 Hz</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><span class="chip acc">alignAxisToVect(direction, axis, factor)</span> is the engine&rsquo;s steering gem: factor = turn rate (0&ndash;1 per call). Chase, orbit, avoid &mdash; all steering behaviors are this call plus a force.</p></div>
` },

{ ch: 8, t: "Track Design — Tubes & Gates", h: `
<h3>Racing needs a course</h3>
<div class="cols2">
<div>
<h4>Course construction</h4>
<ul>
<li><strong>Tube sections:</strong> 12 m cylinders (open walls or half-pipes), joined per chunk like Ch. 06&rsquo;s treadmill &mdash; but here the <em>player moves</em> (a race has a direction).</li>
<li><strong>Variety grammar:</strong> straight (speed) &middot; curve (banking) &middot; narrow (precision) &middot; open cavern (combat) &middot; vertical rise (climb). Rotate 3-section motifs.</li>
<li><strong>Visual language:</strong> gates and walls get distinct materials &mdash; readability at 18 m/s is a texture problem.</li>
</ul>
</div>
<div>
<h4>The checkpoint gate</h4>
<ul>
<li>Ghost torus/box, <span class="chip acc">is_gate</span>, property <span class="chip acc">index</span> (0&ndash;7).</li>
<li>Player Touch + Property check <span class="chip acc">next_gate == index</span> &rarr; advance, +time bonus, gate flashes.</li>
<li>Lap complete when next_gate wraps to 0 &rarr; lap time recorded, +1 lap.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Place gates so the <em>next</em> one is visible from the current one (sightline chaining). Racing joy = always knowing where to go at speed; when players get lost, the track failed, not the player.</p></div>
` },

{ ch: 8, t: "Checkpoint & Lap Logic", h: `
<h3>The racer&rsquo;s state, in one table</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property (player)</th><th>Type</th><th>Role</th></tr></thead>
<tbody>
<tr><td>next_gate</td><td>Int</td><td>Which gate counts (0&ndash;7, wraps)</td></tr>
<tr><td>lap_time</td><td>Timer</td><td>Counts up since lap start</td></tr>
<tr><td>laps_done</td><td>Int</td><td>Lap counter</td></tr>
<tr><td>best_lap</td><td>Float &rarr; globalDict</td><td>Persisted record</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># race.py -- on player (Touch sensor "Gate", property is_gate)
import bge

GATES = 8

def gate():
    cont = bge.logic.getCurrentController()
    own = cont.owner
    gate = cont.sensors["Gate"].hitObject

    if gate["index"] == own["next_gate"]:
        gate["flash_t"] = 0.4                       # gate's own visual
        own["next_gate"] = (own["next_gate"] + 1) % GATES

        if own["next_gate"] == 0:                   # wrapped = lap done
            own["laps_done"] += 1
            best = bge.logic.globalDict.get("best_lap", 1e9)
            if own["lap_time"] &lt; best:
                bge.logic.globalDict["best_lap"] = own["lap_time"]
                bge.logic.sendMessage("new_record")
            own["lap_time"] = 0.0</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Cheating by driving <em>backward through the finish</em>: gate order must only advance on the expected index (this design already enforces it &mdash; wrong gates are simply ignored). Also gate the final gate behind lap_count for multi-lap races.</p></div>
` },

{ ch: 8, t: "GLSL — Why Custom Shaders", h: `
<h3>The built-ins stop where your world begins</h3>
<div class="cols2">
<div>
<h4>What the fixed pipeline can&rsquo;t do here</h4>
<ul>
<li>Distance fog that <em>tints</em> toward murk green-blue (world fog is one flat color, one model).</li>
<li>Light rays, caustics, depth-based darkening.</li>
<li>Any per-pixel effect tied to <strong>depth</strong>, <strong>view angle</strong>, or <strong>time</strong>.</li>
</ul>
</div>
<div>
<h4>What you get with a fragment program</h4>
<ul>
<li>Every pixel&rsquo;s color = a function you write: <span class="chip acc">color = f(texture, light, depth, time)</span>.</li>
<li>The SubRacer mist: mix toward water color with distance &mdash; 15 lines of GLSL, the entire underwater illusion.</li>
</ul>
</div>
</div>

<h3>The shader contract</h3>
<div class="flow">
  <span class="fnode">Mesh verts<small>+ attributes</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Vertex shader<small>position &rarr; clip space, pass UVs/depth</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Rasterizer<small>fragments</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Fragment shader<small>final pixel color</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Screen</span>
</div>

<div class="callout note"><div class="co-label">&#9432 Where this lives in the engine</div>
<p>Scene must be in <strong>GLSL shading mode</strong> (Ch. 05). Custom shaders attach via the material&rsquo;s shader node / <span class="chip acc">KX_BlenderMaterial</span> or the 2D-filter system for fullscreen effects (Ch. 13).</p></div>
` },

{ ch: 8, t: "GLSL in BGE — The Runtime Pipeline", h: `
<h3>How a material becomes a program</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Stage</th><th>Who controls</th><th>You can&hellip;</th></tr></thead>
<tbody>
<tr><td>Fixed GLSL generation</td><td>Engine (from material/texture settings)</td><td>&mdash; it writes the default shader for you</td></tr>
<tr><td>Custom vertex/fragment</td><td><strong>You</strong> (shader text / node)</td><td>Replace both programs per material</td></tr>
<tr><td>Built-in uniforms</td><td>Engine provides</td><td>Read: matrices, light data, time? (gl-less: pass via uniform)</td></tr>
<tr><td>Custom uniforms</td><td>You define + set from Python</td><td>game time, water color, murk density &mdash; runtime-tunable!</td></tr>
<tr><td>2D filters</td><td>You, post-framebuffer</td><td>Fullscreen passes (sepia, vignette, motion blur) &mdash; Ch. 13</td></tr>
</tbody></table></div>

<h3>Two shader integration routes</h3>
<ol>
<li><strong>Material shader node:</strong> replaces the material&rsquo;s programs &mdash; per-object effects (our mist).</li>
<li><strong>2D filter:</strong> runs on the finished frame &mdash; screen-wide effects (underwater color grade, warp). SubRacer uses <em>both</em>: mist per-material, color-grade fullscreen.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Prototype shaders in a tiny test scene (one object, one lamp) before the canyon. Shader iteration is debugging <em>math</em>; do it where nothing else can interfere.</p></div>
` },

{ ch: 8, t: "GLSL Mist — Vertex Shader", h: `
<h3>Pass what the fragment stage needs</h3>
<pre data-lang="glsl"><code>// mist.vert -- vertex shader for the SubRacer water fog
// Job: transform position, hand UVs AND eye-space depth downstream.

varying vec2 vUV;          // texture coordinates, interpolated per pixel
varying vec3 vViewPos;     // position in EYE space -- depth source!

void main()
{
    // standard transform chain (Ch. 03 spaces), one matrix:
    vec4 viewPos  = gl_ModelViewMatrix * gl_Vertex;
    gl_Position   = gl_ProjectionMatrix * viewPos;

    // pass along the data the fragment shader will sample:
    vUV     = vec2(gl_MultiTexCoord0);   // UV map (Ch. 02/03)
    vViewPos = viewPos.xyz;              // depth = -vViewPos.z (camera looks -Z)
}</code></pre>

<h3>Reading it</h3>
<ul>
<li><strong>varying</strong> = per-vertex values the GPU interpolates across the face before the fragment stage sees them (Ch. 03 shading interpolation, now in your hands).</li>
<li><strong>Why eye space:</strong> the distance from camera is <em>length(vViewPos)</em> &mdash; cheap, correct, and view-dependent, exactly what fog needs.</li>
<li><strong>gl_MultiTexCoord0</strong> = the mesh&rsquo;s first UV layer, provided by the fixed-function-compatible bindings.</li>
</ul>
` },

{ ch: 8, t: "GLSL Mist — Fragment Shader", h: `
<h3>The underwater illusion, complete</h3>
<pre data-lang="glsl"><code>// mist.frag -- distance fog toward murky water color
uniform sampler2D tex0;      // the material texture (set by engine)
uniform vec3  waterColor;    // deep-water tint, e.g. (0.08, 0.22, 0.24)
uniform float fogStart;      // begin fading at this distance (m)
uniform float fogEnd;        // fully water-colored at this distance

varying vec2 vUV;
varying vec3 vViewPos;

void main()
{
    vec4 base = texture2D(tex0, vUV);            // the surface's own color

    float dist = length(vViewPos);               // eye -&gt; fragment distance
    float fog  = clamp((dist - fogStart) / (fogEnd - fogStart), 0.0, 1.0);
    fog = fog * fog;                             // quadratic falloff: murky near, dense far

    // depth cue #2: darker with distance even inside the fog color
    vec3 deepColor = waterColor * (1.0 - 0.5 * fog);

    gl_FragColor = vec4(mix(base.rgb, deepColor, fog), base.a);
}</code></pre>

<h3>Every line earns its place</h3>
<ul>
<li><strong>clamp((d&minus;start)/(end&minus;start))</strong> &mdash; linear ramp 0&rarr;1 between two distances; the tuning knobs of the effect.</li>
<li><strong>fog&sup2;</strong> &mdash; quadratic curve: gentle nearby (gameplay stays readable), dense far (world dissolves into mystery).</li>
<li><strong>mix(base, deep, fog)</strong> &mdash; the lerp: the heart of every blending effect you&rsquo;ll ever write.</li>
</ul>
` },

{ ch: 8, t: "GLSL Mist — Wiring & Runtime Tuning", h: `
<h3>Attach and control from Python</h3>
<pre data-lang="python"><code># shader_setup.py -- on an object using mat_canyon (Always, once)
import bge

VERT = bge.logic.expandPath("//mist.vert")   # shader files next to the .blend
FRAG = bge.logic.expandPath("//mist.frag")

def setup():
    own = bge.logic.getCurrentController().owner
    for mesh in own.meshes:                 # every mesh the object renders
        for mat in mesh.materials:          # every material on the mesh
            sh = mat.getShaderImpl()
            sh.setSource(VERT, FRAG, True)  # True = use engine-provided uniforms

def tune():   # Always sensor -- live-tune the uniforms while playing!
    own = bge.logic.getCurrentController().owner
    for mat in own.meshes[0].materials:
        sh = mat.getShaderImpl()
        if sh.isValid():                    # compiled successfully?
            sh.setUniform3f("waterColor", 0.08, 0.22, 0.24)
            sh.setUniform1f("fogStart", 25.0)
            sh.setUniform1f("fogEnd",   110.0)</code></pre>

<div class="callout tip"><div class="co-label">&#9733 The shader playground loop</div>
<p>Uniforms exist so you can tune <em>live</em>: run the game, adjust fogStart/fogEnd from a debug HUD slider, watch the water change in real time, then bake the winning numbers. Shader iteration at the speed of thought.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Shader compile errors show only in the console &mdash; open <em>Window &rarr; Toggle System Console</em> when a material goes invisible/magenta. A single bad semicolon kills the whole program; the fallback is no shading at all.</p></div>
` },

{ ch: 8, t: "Caustics & Animated Water Effects", h: `
<h3>Two cheap tricks that read as expensive</h3>
<div class="cols2">
<div>
<h4>Caustics (projected light webs)</h4>
<ul>
<li>Animated caustic texture, <em>AngelMap/generated</em> coordinates on the floor material (Ch. 03 mapping table).</li>
<li>Animate by offsetting texture coords over time (Python <span class="chip acc">mat.getShaderImpl()</span> or texture&rsquo;s offset fields).</li>
<li>Additive blend channel &mdash; light webs <em>add</em> onto the floor.</li>
</ul>
<pre data-lang="glsl"><code>// in mist.frag -- animated uv wobble (cheap "flow")
uniform float time;
...
vec2 uv = vUV + 0.02 * vec2(sin(time + vUV.y * 20.0),
                            cos(time + vUV.x * 14.0));
vec4 base = texture2D(tex0, uv);</code></pre>
</div>
<div>
<h4>Wavering light</h4>
<ul>
<li>One Sun + slow <em>caustic cookie</em> feel: put the caustic map in the <em>emit</em> channel of floor materials, animated.</li>
<li>God rays (fake): additive alpha-blended cones from above, slowly rotating (mesh, not shader &mdash; Ch. 12 particles).</li>
<li>Bubble ambience: sparse rising particles along the camera&rsquo;s path (Ch. 06 projectile pattern as ambient).</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Effects stack in <em>layers</em>: mist (depth) &rarr; caustics (surface) &rarr; particles (volume) &rarr; fullscreen grade (mood). Build and tune them in that order; each layer alone looks weak, together they read as &ldquo;underwater&rdquo; instantly.</p></div>
` },

{ ch: 8, t: "Performance — Underwater Budgets", h: `
<h3>What SubRacer spends</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Item</th><th>Budget</th><th>Technique used</th></tr></thead>
<tbody>
<tr><td>Draw calls</td><td>&lt; 120</td><td>Joined tube chunks, atlas materials, ghost visuals off-layer</td></tr>
<tr><td>Dynamic bodies</td><td>&lt; 25 alive</td><td>Population table (slide 17) + spawn caps</td></tr>
<tr><td>Overdraw</td><td>Low</td><td>Mist is <em>in</em> the material, not 20 alpha planes; particles capped</td></tr>
<tr><td>Shader cost</td><td>1 texture fetch + ALU</td><td>Mist is one fetch; caustics add one more</td></tr>
<tr><td>Sensor polls/tick</td><td>&lt; 40</td><td>Frequency:2&ndash;3 on radars/nears; chase AI throttled to every 3rd tick</td></tr>
</tbody></table></div>

<h3>The two heavyweights in any scene</h3>
<ul>
<li><strong>Per-pixel lights &times; pixels:</strong> the 2D-filter pass and mist both scale with resolution. If fps dips when looking down-canyon (many pixels), it&rsquo;s fill-rate: lower render resolution first (cheapest win in the whole engine).</li>
<li><strong>Physics islands:</strong> contacts between stacked/constrained bodies. SubRacer is clean (no stacking) &mdash; Chapter 12&rsquo;s ragdolls are where this returns.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Profile <em>while playing a full race</em>, not in a test pool: entity counts, particle bursts, and view-down-the-canyon fill are all race-time phenomena. The profiler (Game &rarr; Profile) breaks the frame into the same phases you&rsquo;ve been budgeting since Ch. 03.</p></div>
` },

{ ch: 8, t: "Chapter 08 — Pitfalls & Best Practices", h: `
<h3>Systems review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>No hysteresis</strong> on Near/Radar: boundary chatter. Trigger &lt; Reset, always.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Sinking subs:</strong> gravity on, buoyancy forgotten. Cancel weight or disable per-body gravity.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>World-axis forces</strong> on a turning vehicle: the L toggle again &mdash; check it in every Motion column.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Shaders without console open:</strong> silent failures read as &ldquo;broken engine.&rdquo; Console first, panic second.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Design with questions</strong> (Near/Radar/Ray), not with brick counts. The question survives engine migrations.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Accumulate forces, arbitrate steering</strong> &mdash; know which of the two each mechanic needs.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Effects as layers</strong> (mist/caustics/particles/grade), tuned in order.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Live-tunable uniforms</strong> + a debug HUD = shader iteration at design speed.</p></div>
</div>
</div>
` },

{ ch: 8, t: "Chapter 08 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Orbit steering:</strong> make the enemy sub circle the player at 15 m (alignAxisToVect on the tangent, not the direction &mdash; a dot-product away).</li>
<li><strong>Torpedo upgrade:</strong> homing torpedoes that lead the target (aim at predicted position = player pos + velocity &times; travel-time estimate).</li>
<li><strong>Depth zones:</strong> below &minus;20 m the mist darkens and tightens (uniforms driven by player Z from Python) &mdash; the abyss is scarier.</li>
<li><strong>Boost trail:</strong> spawn additive particles along the sub&rsquo;s path while boost_t &gt; 0, fading (Ch. 06 projectile pattern, particle edition).</li>
<li><strong>Full 2D filter:</strong> add a post-process color-grade fragment shader (slight blue shift + vignette by gl_FragCoord distance from center).</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Rig a vehicle with damped, force-based 6-DOF control &#10003;</li>
<li>Deploy Near/Radar/Ray sensors as designed perception organs &#10003;</li>
<li>Build weapons, mines, power-ups, and chase AI &#10003;</li>
<li>Manage entity populations with inactive-layer staging &#10003;</li>
<li>Write, attach, and live-tune vertex + fragment GLSL &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Part II complete — next</div>
<p>Part III goes professional: networking, skeletal animation, a memory game&rsquo;s scripting architecture, and the production lessons of a real open game. Chapter 09 opens sockets.</p></div>
` }

);
