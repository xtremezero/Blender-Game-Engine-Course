/* Part II — Chapter 07: Pinball (22 slides) */

SLIDES.push(

{ ch: 7, t: "Chapter 07 — Pinball", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">07</div>
  <div class="ch-info">
    <h1>Pinball</h1>
    <div class="ch-sub">Bumper Mechanics &middot; Sewer Elements &mdash; a physics game where Bullet is the opponent</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will build a playable pinball table</h4>
  <ul>
    <li>Respect real-world scale so gravity &ldquo;feels right&rdquo;</li>
    <li>Build bumpers: restitution physics + impulse logic</li>
    <li>Model sewer drains: triggers that teleport the ball</li>
    <li>Engineer a plunger launcher with stored energy</li>
    <li>Build flippers with motors and angular velocity control</li>
    <li>Score zones, multi-ball, and impact-driven sound</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>22</b> slides</span>
  <span class="ch-stat"><b>~4</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9733&#9734&#9734</b></span>
</div>
` },

{ ch: 7, t: "Physics First — Gravity & Scale", h: `
<h3>The one rule of physics games</h3>
<div class="callout best" style="margin-top:4px"><div class="co-label">&#10003 The Prime Directive</div>
<p><strong>Model at real-world scale, in real-world units, with real-world masses.</strong> Every physics constant in the engine assumes 1 unit = 1 meter and gravity = 9.8 m/s&sup2;. Fight this and every tuned number fights back.</p></div>

<h3>Pinball&rsquo;s true dimensions</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Element</th><th>Real value</th><th>Game value</th></tr></thead>
<tbody>
<tr><td>Ball diameter</td><td>27 mm</td><td>0.027 m</td></tr>
<tr><td>Ball mass</td><td>80 g</td><td>0.08 kg</td></tr>
<tr><td>Table length</td><td>1.07 m</td><td>1.07 m</td></tr>
<tr><td>Table width</td><td>0.54 m</td><td>0.54 m</td></tr>
<tr><td>Playfield incline</td><td>6.5&deg;</td><td>6.5&deg; (rotate the whole table!)</td></tr>
<tr><td>Gravity</td><td>9.81</td><td>default &mdash; correct already</td></tr>
</tbody></table></div>

<h3>Why tiny objects break solvers</h3>
<ul>
<li>Bullet&rsquo;s contact margins and tolerances are tuned around centimeter-plus geometry. A 2.7 cm ball at default settings jitters, sinks, and tunnels.</li>
<li>Two fixes, in order of preference: (1) tighten world settings (see Ch. 13 physics table), (2) scale the table up &times;10 (ball 0.27 m, gravity 98) and scale mass back &mdash; identical dynamics, friendlier numbers.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Building the table 20 meters wide &ldquo;so the camera sees it,&rdquo; then wondering why the ball falls like a feather. Camera fov and object scale are <em>independent</em>. Fix the camera, not the world.</p></div>
` },

{ ch: 7, t: "World Settings — The Physics Tab", h: `
<h3>Scene-level physics (World properties &rarr; Physics)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Value</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Physics engine</td><td>Bullet</td><td>Default &mdash; correct choice</td></tr>
<tr><td>Gravity</td><td>(0, 0, &minus;9.81)</td><td>Real gravity (down Z)</td></tr>
<tr><td>Physics steps/s (freq)</td><td>60</td><td>Match logic rate &mdash; deterministic contacts</td></tr>
<tr><td>Logic steps/s</td><td>60</td><td>Standard</td></tr>
<tr><td>Substeps (max / fixed)</td><td>1 / 1 (raise if tunneling)</td><td>Cost = &times;N physics; use only when needed</td></tr>
<tr><td>Solver iterations / linear error correction</td><td>5 / 0.8 (defaults)</td><td>Solver &ldquo;stiffness&rdquo; for stacked contacts</td></tr>
</tbody></table></div>

<h3>The incline trick</h3>
<ol>
<li>Keep gravity &minus;Z (world convention). <em>Rotate the table mesh 6.5&deg; around X</em> instead.</li>
<li>Every ramp, wall, bumper sits on the tilted table naturally &mdash; gravity does the incline for free, exactly like a real cabinet.</li>
</ol>

<div class="callout tip"><div class="co-label">&#9733 Tip — physics debug view</div>
<p><em>Game &rarr; Show Physics Visualization</em> draws wireframe bodies, contacts, and velocities in the running game. When the ball misbehaves, this view separates &ldquo;bad collision shape&rdquo; from &ldquo;bad logic&rdquo; in seconds.</p></div>
` },

{ ch: 7, t: "Table Construction — Walls & Funneling", h: `
<h3>Geometry as game design</h3>
<ol>
<li><strong>Deck:</strong> a plane (the playfield) on the 6.5&deg; tilt, <em>static</em> physics, triangle-mesh bounds (it can be concave &mdash; static bodies are allowed trimesh!).</li>
<li><strong>Walls:</strong> extrude a closed outline around the deck; one joined object; static + trimesh, or box-per-wall if flat.</li>
<li><strong>Funnel geometry:</strong> the outlanes and side rails that steer the ball downward &mdash; angle them 15&ndash;25&deg; so misses become near-misses, not instant drains.</li>
</ol>

<h3>Level design = deflection design</h3>
<div class="cols3">
  <div class="card"><h4>Straight wall</h4><p>Binary bounce &mdash; honest, readable, boring in isolation.</p></div>
  <div class="card"><h4>Angled wall</h4><p>Converts downward speed into lateral travel &mdash; the core verb of pinball.</p></div>
  <div class="card"><h4>Curved wall</h4><p>Arc of continuously changing angles &mdash; rails, orbit shots, habitrails.</p></div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Build the table <em>flat</em> (top view), tilt last: all editing happens in clean orthographic views (Ch. 04), and incline is one rotation of a single parent empty &mdash; tunable like the difficulty dial it is.</p></div>
` },

{ ch: 7, t: "Bumpers — Physics Setup", h: `
<h3>Anatomy of a pop bumper</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Part</th><th>Physics</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Bumper body</td><td>Static, Cylinder bounds</td><td>Never moves &mdash; it&rsquo;s terrain</td></tr>
<tr><td>Restitution (bounciness)</td><td>0.95&ndash;1.0</td><td>The material-level bounce</td></tr>
<tr><td>Friction</td><td>0.05</td><td>Glancing hits stay fast</td></tr>
<tr><td>Logic</td><td>Collision sensor + impulse</td><td>The <em>powered</em> part (next slides)</td></tr>
</tbody></table></div>

<h3>Restitution — the physics-material way</h3>
<ul>
<li>Create a <strong>physics material</strong> (<span class="chip acc">phys_bouncy</span>: restitution 1.0, friction 0.05) and assign it to the bumper&rsquo;s material slot.</li>
<li>Combine rules: bounce of a contact = max/average/multiply of the two materials&rsquo; restitution (Ch. 13 table) &mdash; ball&rsquo;s material matters too (ball: restitution 0.5, friction 0.1).</li>
<li>This gives the <em>passive</em> bounce: geometric, believable, but capped at physics speeds.</li>
</ul>

<div class="callout note"><div class="co-label">&#9432 Note — why passive isn&rsquo;t enough</div>
<p>A real pop bumper <em>kicks</em>. Restitution alone only returns existing energy. The signature &ldquo;POP&rdquo; that launches a slow ball away is an <strong>applied impulse</strong> &mdash; game logic layered on physics. That layering is this chapter&rsquo;s whole lesson.</p></div>
` },

{ ch: 7, t: "Bumpers — Impulse via Logic Bricks", h: `
<h3>The kick, brick edition</h3>
<div class="flow">
  <span class="fnode hot">Touch sensor<small>ball property: is_ball</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">POP!</span>
    <span class="fnode">Motion actuator<small>Servo/Force on ball</small></span>
    <span class="fnode">Sound: bumper.wav</span>
    <span class="fnode">Action: bumper_flash 3 fr</span>
    <span class="fnode">Message: score +100</span>
  </div>
</div>

<h3>The problem bricks can&rsquo;t solve</h3>
<ul>
<li>The Motion actuator applies force <em>to its own object</em> (the static bumper) &mdash; useless. To affect the <strong>ball</strong>, the actuator must live on the ball or be done in Python.</li>
<li>Brick workaround: ball carries a <span class="chip acc">Touch: bumper</span> sensor &rarr; applies its own kick force along the contact normal &mdash; but &ldquo;along the normal&rdquo; needs the collision normal, which bricks can&rsquo;t compute.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Insight</div>
<p>This is the general boundary: <strong>bricks excel at wiring, Python excels at math involving contact data</strong> (normals, points, velocities). Pinball is made of contact data &mdash; hence Python-heavy.</p></div>
` },

{ ch: 7, t: "Bumpers — Impulse via Python (The Right Way)", h: `
<h3>applyImpulse on the ball</h3>
<pre data-lang="python"><code># bumper.py -- module controller on the bumper (Touch sensor: is_ball)
import bge

KICK = 3.2          # impulse magnitude, N*s -- tune to taste (0.08 kg ball!)

def update():
    cont = bge.logic.getCurrentController()
    own  = cont.owner
    touch = cont.sensors["Touch"]

    if touch.positive:
        ball = touch.hitObject                    # the colliding ball
        hit_point = touch.hitPosition             # world contact point
        normal   = touch.hitNormal                # world contact normal

        # kick along the contact normal, applied at the contact point
        ball.applyImpulse(normal * KICK, hit_point)

        # presentation: flash + score + sound, same tick
        bge.logic.sendMessage("score", body="100")
        # ... trigger flash Action / Sound actuator via own.actuators</code></pre>

<h3>Why normal &times; impulse &mdash; the physics</h3>
<ul>
<li><strong>Impulse J = &Delta;p</strong> (momentum change) in N&middot;s &mdash; instant velocity change: &Delta;v = J/m. Our 3.2 N&middot;s on an 0.08 kg ball = 40 m/s?? &mdash; no: tune <em>KICK &asymp; 0.3&ndash;0.5</em> for a strong but sane pop (5&ndash;6 m/s).</li>
<li>Applying at <em>hitPosition</em> (not the center) lets the kick impart realistic spin &mdash; off-center pops scatter.</li>
<li>Direction <strong>along the normal</strong> reproduces how a real bumper&rsquo;s rubber ring deflects the ball away from the surface.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Cooldown per bumper (a 5-tick Timer gate): a ball resting on a bumper can fire dozens of contacts per second &mdash; one pop per touch-burst keeps scoring honest and audio sane.</p></div>
` },

{ ch: 7, t: "Sewer Elements — Drains & Traps", h: `
<h3>The table&rsquo;s hazard layer</h3>
<div class="cols3">
  <div class="card hot"><h4>The Drain</h4><p>Bottom slot: ball is lost &rarr; ball-count logic, next ball or game over.</p></div>
  <div class="card"><h4>The Sewer Hole</h4><p>Trap hole: ball falls in &rarr; locked briefly + big points &rarr; teleported to a release lane.</p></div>
  <div class="card"><h4>The Kicker/Saucer</h4><p>Holds the ball, then ejects with impulse &mdash; same architecture as the sewer, inverted.</p></div>
</div>

<h3>The drain (loss) flow</h3>
<div class="flow">
  <span class="fnode hot">drain_zone<small>ghost plane, property: is_drain</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Ball: Collision w/ is_drain</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">LOST</span>
    <span class="fnode">Message: ball_lost &rarr; game_state</span>
    <span class="fnode">End Object (ball)</span>
  </div>
</div>

<h3>Ghost zones vs. real geometry</h3>
<ul>
<li>Trigger volumes are <strong>Ghost</strong> bodies: they overlap without any physical response &mdash; invisible gameplay logic walking through a physical world (Ch. 03 body types).</li>
<li>The <em>visual</em> sewer hole is a dark cylinder + grating mesh; the <em>functional</em> hole is a ghost cylinder with a trigger.</li>
</ul>
` },

{ ch: 7, t: "The Sewer Hole — Capture & Teleport", h: `
<h3>A hole is a state machine</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>State</th><th>Ball does</th><th>Exit condition</th></tr></thead>
<tbody>
<tr><td>1 &middot; Free</td><td>rolls over the hole rim</td><td>Touch sensor on hole fires</td></tr>
<tr><td>2 &middot; Captured</td><td>parented to hole (or position-locked), spinner animation, +2500</td><td>Timer 2.0 s expires</td></tr>
<tr><td>3 &middot; Released</td><td>teleported to the release lane + ejected with impulse</td><td>&mdash;</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># sewer.py -- on the sewer hole (Touch sensor: is_ball)
import bge

def update():
    cont = bge.logic.getCurrentController()
    own  = cont.owner
    touch = cont.sensors["Touch"]

    if touch.positive and not own["busy"]:
        ball = touch.hitObject
        own["busy"] = True
        ball.worldPosition = own.worldPosition + (0, 0, 0.05)  # drop into hole
        ball.worldLinearVelocity = (0, 0, 0)                   # full stop
        ball.suspendDynamics(False)                            # freeze physics!
        own["captive"] = ball
        own["hold_t"] = 2.0                                    # Timer countdown
        bge.logic.sendMessage("score", "2500")

    if own["busy"] and own["hold_t"] &lt;= 0:
        ball = own["captive"]
        lane = bge.logic.getCurrentScene().objects["release_point"]
        ball.restoreDynamics()
        ball.worldPosition = lane.worldPosition
        ball.applyImpulse((0, 0.8, 0), ball.worldPosition)     # eject up-lane
        own["busy"] = False</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Fighting a frozen ball with per-frame velocity zeroing: jitter, energy debt, weird bounces. <span class="chip acc">suspendDynamics()</span> / <span class="chip acc">restoreDynamics()</span> are the sanctioned pause buttons &mdash; clean freeze, clean resume.</p></div>
` },

{ ch: 7, t: "The Plunger — Stored Energy Launcher", h: `
<h3>Charging and release</h3>
<ol>
<li><strong>Launch lane:</strong> a one-way channel on the right wall (check valve: a hinged one-way flap, or simpler &mdash; geometry that&rsquo;s easier to enter than exit).</li>
<li><strong>Plunger:</strong> a small dynamic block behind the ball in the lane.</li>
<li><strong>Charge:</strong> hold <kbd>&darr;</kbd> &rarr; plunger drags back (servo to &minus;X); visualize with a compressed spring mesh (action).</li>
<li><strong>Release:</strong> key up &rarr; plunger&rsquo;s servo target flips forward at high speed &rarr; <em>physical contact</em> launches the ball. The plunger never touches the ball&rsquo;s logic &mdash; pure physics!</li>
</ol>

<h3>Skill throw</h3>
<ul>
<li>Charge time (a Timer property) maps to servo strength: tap = weak lob, full hold = full table orbit.</li>
<li>This makes the launch <strong>diegetic</strong>: the player aims by choosing energy, like a real cabinet.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Prefer <em>physical</em> mechanisms over scripted teleports wherever the fantasy allows. The plunger teaches: when physics can do the drama, let it &mdash; it&rsquo;s more work up front and less code forever (the sewer teleports because a <em>hole</em> genuinely is a teleport).</p></div>
` },

{ ch: 7, t: "Flippers — Hinge Constraints & Motors", h: `
<h3>The heart of the machine</h3>
<h3>Construction</h3>
<ol>
<li>Model one flipper: a tapered box, pivot at the <strong>rotation axis end</strong> (Ch. 03 pivots!).</li>
<li>Physics: <strong>Rigid Body</strong>, box bounds, mass 1.0 (heavier than the ball &mdash; it must win every encounter).</li>
<li>Position at the base of the playfield, mirrored copy for the other side.</li>
</ol>

<h3>The hinge constraint</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Constraint field</th><th>Value</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Type</td><td>Hinge (physics constraint object)</td><td>One axis of rotation only</td></tr>
<tr><td>Axis</td><td>X along the pivot rod (world Z of the table)</td><td>The flipper&rsquo;s spin axis, normal to the deck</td></tr>
<tr><td>Linked to</td><td>world (no target) or a static mount</td><td>Fixed anchor</td></tr>
<tr><td>Limits</td><td>lower 0&deg;, upper 52&deg;</td><td>Rest position to full swing</td></tr>
<tr><td>Motor</td><td>target angular velocity + max torque</td><td>The muscle &mdash; next slide</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Animating flippers with Actions. Keyframed transforms on a physics body = the transform war from Ch. 05, and the ball won&rsquo;t feel a thing (no momentum transfer). Flippers are <strong>motored rigid bodies</strong>, period.</p></div>
` },

{ ch: 7, t: "Flippers — Drive & Control", h: `
<h3>Brick version — motor toggle</h3>
<div class="flow">
  <span class="fnode hot">Keyboard L Shift<small>Right flipper: R Shift</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <span class="fnode">Constraint actuator<small>motor on: 400&deg;/s, torque 30</small></span>
  <span class="farrow">release &rarr;</span>
  <span class="fnode">motor: &minus;80&deg;/s (return spring)</span>
</div>

<ul>
<li><strong>Flick:</strong> pressed = swing up at high angular velocity; released = gentle return. The hinge limits are the stops.</li>
<li>Torque (max force) must be high enough that a resting ball can&rsquo;t stall the flipper mid-swing &mdash; test with the ball resting ON it.</li>
</ul>

<h3>Python version — crisper and tunable</h3>
<pre data-lang="python"><code># flipper.py -- on each flipper (Keyboard sensor "Key")
import bge

UP_SPEED   = 45.0     # rad/s -- the flick
DOWN_SPEED = -6.0     # rad/s -- the return
TORQUE     = 40.0     # max motor torque

def update():
    cont = bge.logic.getCurrentController()
    own  = cont.owner
    key  = cont.sensors["Key"]
    # Direction via torque on the hinge axis (local Z here = the pivot rod).
    # Cleaner alternative: two Constraint actuators (motor up / spring down)
    # pulsed by the same keyboard sensor -- use whichever your build exposes.
    if key.positive:
        own.applyTorque((0, 0, TORQUE), True)          # flick up
    else:
        own.applyTorque((0, 0, -TORQUE * 0.15), True)  # gentle return spring</code></pre>

<div class="callout tip"><div class="co-label">&#9733 Tuning recipe</div>
<p>Flick time from rest to full swing should be <strong>&lt; 60 ms</strong> (4 logic ticks) &mdash; that&rsquo;s what &ldquo;responsive&rdquo; means to human reflexes. Raise speed/torque until a resting ball is launched cleanly, then stop; over-powered flippers make the table unreadable.</p></div>
` },

{ ch: 7, t: "Flipper Geometry — The Skill Surface", h: `
<h3>It&rsquo;s not a paddle, it&rsquo;s an instrument</h3>
<div class="cols2">
<div>
<h4>Shape details that matter</h4>
<ul>
<li><strong>Taper:</strong> thick at the pivot, thin at the tip &mdash; the tip travels faster (same &omega;, larger r) and hits harder where players expect control.</li>
<li><strong>Length:</strong> ~7 cm real (0.07 m in-game). Gap between flippers: ~1.2 ball diameters &mdash; the drain must be <em>possible</em> but never magnetic.</li>
<li><strong>Rubber:</strong> restitution 0.7 physics material on the flipper &mdash; soft catches (trapping the ball) depend on imperfect bounces.</li>
</ul>
</div>
<div>
<h4>Aiming = geometry</h4>
<ul>
<li>Ball hits <strong>near pivot</strong> &rarr; steep, slow deflection up-middle.</li>
<li>Ball hits <strong>mid-face</strong> &rarr; 45&deg; class shots to the ramps.</li>
<li>Ball hits <strong>tip, while flipping</strong> &rarr; maximum speed, widest angle &mdash; the &ldquo;slingshot&rdquo;.</li>
<li>Players learn this physics without being told; your job is making it <em>consistent</em>.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Consistency over realism when forced to choose. If identical inputs produce identical shots, players build skill and forgive everything else. Sources of inconsistency to hunt: jittery contacts (substeps), non-deterministic spawn impulses, and frame-rate-dependent forces.</p></div>
` },

{ ch: 7, t: "Scoring — Zones & Sensors", h: `
<h3>The table talks back</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Element</th><th>Detector</th><th>Points</th></tr></thead>
<tbody>
<tr><td>Pop bumper</td><td>Touch (on bumper)</td><td>100</td></tr>
<tr><td>Slinger (side kickers)</td><td>Touch + impulse</td><td>10</td></tr>
<tr><td>Target (round/standup)</td><td>Touch on target mesh</td><td>500 &middot; combo &times;2 each</td></tr>
<tr><td>Ramp entry</td><td>Ghost zone at the top</td><td>1000</td></tr>
<tr><td>Sewer hole</td><td>Touch (capture)</td><td>2500</td></tr>
<tr><td>Drop target bank (3)</td><td>3 &times; Touch + counter</td><td>5000 bonus + multiplier +1</td></tr>
</tbody></table></div>

<h3>The scoring architecture (reused from Ch. 06)</h3>
<div class="flow">
  <span class="fnode">Any element<small>Message: "score" body=points</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">game_state.score() <small>Python: rulebook lives here</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">HUD text (overlay)</span>
</div>

<ul>
<li>Multiplier logic (2&times;, 3&times;…) lives in the scorer, applied uniformly &mdash; elements never know it exists.</li>
<li>Combos: scorer timestamps identical senders; consecutive ramps within 4 s chain.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Points are a <em>feedback channel</em>: every score change should have a light, a sound, or a number animation attached. A silent 5000 feels like a bug.</p></div>
` },

{ ch: 7, t: "Multi-ball", h: `
<h3>The crowd-pleaser</h3>
<h3>Mechanics</h3>
<ol>
<li>Trigger: bank of 3 drop targets completes &rarr; message <span class="chip acc">multiball</span>.</li>
<li>game_state: <span class="chip acc">balls_to_spawn = 2</span>; the locked balls in the sewer release; plus fresh balls spawn at the plunger.</li>
<li>Balls in play counted by a property on each ball; drain logic: <span class="chip acc">balls_in_play &gt; 1</span> &rarr; lose one silently, else ball lost.</li>
</ol>

<pre data-lang="python"><code># ball_spawner.py -- on game_state (Message sensor: "multiball")
import bge

def spawn_balls(n=2):
    scene = bge.logic.getCurrentScene()
    lane  = scene.objects["release_point"]
    for _ in range(n):
        ball = scene.addObject("ball", lane, 0)
        ball.applyImpulse((0.25, 1.2, 0), ball.worldPosition)
        scene.objects["game_state"]["balls_in_play"] += 1</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Ball-ball tunneling at high closing speeds (two balls crossing). Fixes in order: raise physics substeps to 2, enlarge ball collision margin, or cap max ball speed by damping (&Delta;v clamp in a controller). Also: give each spawned ball its exit (Ch. 06 rule) &mdash; drains end them.</p></div>
` },

{ ch: 7, t: "Camera, Materials & Lighting", h: `
<h3>Readability above beauty</h3>
<div class="cols2">
<div>
<h4>Camera</h4>
<ul>
<li>One locked camera, slightly above the player&rsquo;s eye at the cabinet: fov 45&ndash;50&deg;, whole playfield visible <em>without moving</em>.</li>
<li>No motion = no motion sickness; pinball is about the <em>ball&rsquo;s</em> motion.</li>
<li>Optional: two cameras &mdash; overview + plunger close-up (scene camera switch on launch, Ch. 03 facts).</li>
</ul>
<h4>Materials</h4>
<ul>
<li>Deck: dark, mid-contrast artwork; the <strong>ball must read against it everywhere</strong> (test every zone!).</li>
<li>Ball: high specular + env-map reflection channel &mdash; chrome is 90% specular.</li>
<li>Bumpers/lights: emissive materials that flash (emit animated via Action on material? simplest: swap two meshes, Ch. 06 trick).</li>
</ul>
</div>
<div>
<h4>Lighting</h4>
<ul>
<li>Cabinet metaphor: warm key above, cool rim from the backglass.</li>
<li>Shadow from the ball is the depth cue that makes height readable &mdash; one shadow-casting lamp, tight buffer.</li>
<li>Flash events: Point lamps tied to bumpers (light + sound + score = the full POP).</li>
</ul>
</div>
</div>
` },

{ ch: 7, t: "Sound — Impact-Driven Audio", h: `
<h3>Physics games are musical instruments</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Event</th><th>Sound character</th><th>Trigger</th></tr></thead>
<tbody>
<tr><td>Wall roll</td><td>Quiet looping rattle</td><td>Ball velocity &gt; 0.5 (Property/Python)</td></tr>
<tr><td>Wall impact</td><td>Sharp knock, volume by speed</td><td>Touch on wall + speed read</td></tr>
<tr><td>Flipper</td><td>Mechanical clack (up), softer (down)</td><td>Key press/release</td></tr>
<tr><td>Bumper</td><td>Loud pop + chime layer</td><td>Touch on bumper</td></tr>
<tr><td>Drain</td><td>Descending tumble</td><td>ball_lost message</td></tr>
<tr><td>Jackpot</td><td>Chord + light show</td><td>Score rule (scorer)</td></tr>
</tbody></table></div>

<h3>Velocity-scaled volume (the pro touch)</h3>
<pre data-lang="python"><code># on the ball (Touch sensor "Touch" -- any wall)
def impact():
    cont = bge.logic.getCurrentController()
    speed = cont.owner.worldLinearVelocity.length       # m/s
    vol = min(1.0, speed / 8.0)                          # 8 m/s = full volume
    if vol &gt; 0.08:                                      # ignore micro-contacts
        snd = cont.actuators["Impact"]
        snd.volume = vol
        snd.pitch = 0.9 + (speed % 1.0) * 0.2            # subtle variation
        # activate via controller pulse:
        cont.activate(snd)</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Every audio volume scales with physics intensity &mdash; it turns a simulator into an <em>instrument</em>. Flat volumes are the audio equivalent of baked-in specular (Ch. 02&rsquo;s sin).</p></div>
` },

{ ch: 7, t: "Tuning — The Physics Playbook", h: `
<h3>When the table misbehaves</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Symptom</th><th>Cause</th><th>Fix (in order)</th></tr></thead>
<tbody>
<tr><td>Ball sinks through flipper</td><td>Thin bodies + high speeds</td><td>Substeps &rarr; 2; fatten collision margins; cap ball speed</td></tr>
<tr><td>Ball jitters at rest</td><td>Solver oscillation on tiny contacts</td><td>Ball damping 0.1 linear; sleep thresholds; solver iterations slightly up</td></tr>
<tr><td>Flippers feel mushy</td><td>Motor torque/speed low</td><td>Speed &ge; 40 rad/s, torque until unstallable; verify hinge limits</td></tr>
<tr><td>Bounces feel dead</td><td>Restitution averaging low</td><td>Bounce combine = Maximum; wall material restitution 0.6+</td></tr>
<tr><td>Everything floats</td><td>Wrong scale (Ch. 07 slide 2!)</td><td>Audit units; ball must be 2.7 cm, gravity 9.81</td></tr>

<tr><td>Score double-fires</td><td>Multi-contact bursts</td><td>Cooldown timers on every Touch-driven element</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice — one change at a time</div>
<p>Physics tuning is a control system: change a knob, replay the <em>same</em> shot (drop the ball from a fixed empty with zero velocity), observe, repeat. Ad-hoc &ldquo;play around&rdquo; tuning produces tables nobody can reproduce.</p></div>
` },

{ ch: 7, t: "Chapter 07 — Pitfalls & Best Practices", h: `
<h3>Physics-game review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Wrong scale.</strong> The mother of all physics bugs. Ball 2.7 cm, table 1.07 m, gravity 9.81 &mdash; tape this to your monitor.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Animated flippers.</strong> Actions and physics fight over transforms; the ball feels nothing. Motor-driven rigid bodies only.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Ghost triggers that also push.</strong> A trigger with collision ON physically interrupts the ball before your logic sees it. Ghost ON for zones.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>No cooldowns on Touch logic.</strong> Contact bursts fire logic 10&times; a frame&rsquo;s worth. Timer-gate every bumper, target, slinger.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Impulse along contact normals</strong> for kicks; magnitude tuned in N&middot;s against the ball&rsquo;s actual mass.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>suspend/restoreDynamics</strong> for captures &mdash; never fight physics frame-by-frame.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Physics materials</strong> (restitution/friction + combine rules) for passive behavior; logic only for powered behavior.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Reproducible test shots</strong> from fixed empties &mdash; tune against data, not vibes.</p></div>
</div>
</div>
` },

{ ch: 7, t: "Chapter 07 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Ramp with counter:</strong> build an orbit ramp (curved walls), detect full loops (ghost zone + 1.5 s window), award 1000 &times; loop count.</li>
<li><strong>Drop target bank:</strong> 3 targets that fall (replace mesh &rarr; sunk version) on hit; a Message resets the bank after 5 s. Complete = multiball trigger.</li>
<li><strong>Nudge:</strong> <kbd>Shift</kbd> keys apply a lateral impulse to the <em>ball</em> (or the table root!) &mdash; with a &ldquo;TILT&rdquo; penalty if used more than 3&times; in 5 s (Timer + counter).</li>
<li><strong>Ball trail:</strong> spawn small fading dots at the ball&rsquo;s position every 3 ticks (Ch. 06 projectile pattern as a particle system).</li>
<li><strong>Skill shot:</strong> score 5000 if the plunger&rsquo;s charge strength lands the ball in the top-left lane within 1 s &mdash; detect zone + elapsed Timer.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Set up scene physics with correct scale and step rates &#10003;</li>
<li>Build restitution-based and impulse-powered bumpers &#10003;</li>
<li>Engineer drains, capture holes, and teleports &#10003;</li>
<li>Motor real hinge flippers and a physical plunger &#10003;</li>
<li>Score zones, multiball, and velocity-driven audio &#10003;</li>
<li>Debug and tune a physics game systematically &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 08 dives underwater: SubRacer &mdash; sensor arrays, controllers and actuators working in concert, power-ups, and your first hand-written GLSL shaders (the famous mist).</p></div>
` }

);
