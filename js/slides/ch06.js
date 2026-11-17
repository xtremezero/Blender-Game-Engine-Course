/* Part II — Chapter 06: Tube Cleaner (28 slides) */

SLIDES.push(

{ ch: 6, t: "Chapter 06 — Tube Cleaner", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">06</div>
  <div class="ch-info">
    <h1>Tube Cleaner</h1>
    <div class="ch-sub">Model Loading &middot; Gun Controls &middot; Upward Movement &middot; Shooting Mechanics &middot; Enemy Logic</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will build a vertical-scrolling shooter</h4>
  <ul>
    <li>Load and reuse assets between .blend files (link/append in practice)</li>
    <li>Build a mouse-aimed gun on a pivot rig</li>
    <li>Implement shooting two ways: instant raycast and spawned projectiles</li>
    <li>Scroll the world downward while the player stays framed</li>
    <li>Give enemies spawn timing, wandering motion, and death states</li>
    <li>Write full Python controllers for gun and enemies</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>28</b> slides</span>
  <span class="ch-stat"><b>~5</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9733&#9734&#9734</b></span>
</div>
` },

{ ch: 6, t: "Design — The Tube Runner", h: `
<h3>One screen, one verb pair, escalating pressure</h3>
<p><em>&ldquo;Climb (auto-scroll) a maintenance tube; aim and blast the vermin that infest it; don&rsquo;t get hit.&rdquo;</em></p>

<div class="cols3">
  <div class="card"><h4>Core loop</h4><p>Aim &rarr; shoot &rarr; kill &rarr; score &rarr; harder wave &rarr; repeat. 10 seconds per iteration.</p></div>
  <div class="card"><h4>Player verbs</h4><p>Aim (mouse 2 DOF), shoot (LMB), dodge (the tube wall is a cylinder &mdash; positioning matters).</p></div>
  <div class="card"><h4>Systems needed</h4><p>Scroll rig, gun rig, projectiles, spawner, enemies (3 types), health, HUD.</p></div>
</div>

<h3>The camera is the level</h3>
<ul>
<li>Camera looks <strong>up</strong> the tube; the world scrolls <em>down past</em> a stationary-looking player.</li>
<li>This &ldquo;treadmill&rdquo; pattern (next slides) is the same architecture as endless runners, vertical shmups, and falling-block games &mdash; learn it once, reuse forever.</li>
</ul>

<div class="callout term"><div class="co-label">&#9670 Term — Endless runner (treadmill) pattern</div>
<p>The player stays near the origin; content moves past. Benefits: float precision stays clean forever (no &ldquo;far from origin&rdquo; jitter), level chunks are recycled objects, and difficulty is spawn-rate tuning.</p></div>
` },

{ ch: 6, t: "Model Loading — Link & Append in Practice", h: `
<h3>Building the asset library first</h3>
<p>Tube Cleaner reuses last chapter&rsquo;s discipline at file scale. Create <span class="chip acc">tube_assets.blend</span> containing: tube section, player rig, gun, 3 enemy meshes, bullet, floor grate, greeble kit.</p>

<h3>Two ways into the level file</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>Append (copy in)</th><th>Link (reference)</th></tr></thead>
<tbody>
<tr><td>Edits where?</td><td>In this file, freely</td><td>Only in the library file</td></tr>
<tr><td>Stays in sync?</td><td>No &mdash; snapshot</td><td>Yes &mdash; always latest</td></tr>
<tr><td>Use when</td><td>One-off level variants</td><td>Team asset pipeline / many levels</td></tr>
</tbody></table></div>

<ol>
<li><kbd>Shift</kbd>+<kbd>F1</kbd> (Append) &rarr; browse the library &rarr; take <em>groups</em> (prefab-grade) not loose objects when possible.</li>
<li>For this solo project: <strong>append groups</strong> <span class="chip acc">grp_player</span>, <span class="chip acc">grp_tube_section</span>, <span class="chip acc">grp_enemy_*</span>.</li>
</ol>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Appending loose objects repeatedly: you accumulate <span class="chip">gun.001</span>, <span class="chip">gun.002</span> meshes. Append <strong>whole groups</strong> and audit with the Outliner&rsquo;s data view (Ch. 04) before shipping.</p></div>
` },

{ ch: 6, t: "Scene Scale & Units Contract", h: `
<h3>Nail the numbers before anything moves</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Element</th><th>Value</th><th>Derived fact</th></tr></thead>
<tbody>
<tr><td>Tube diameter</td><td>12 m</td><td>Player has ~&plusmn;4 m dodge room</td></tr>
<tr><td>Tube section length</td><td>10 m</td><td>Chunk = one grid cell of the treadmill</td></tr>
<tr><td>Scroll speed</td><td>3 m/s (ramping to 6)</td><td>One chunk passes every 3.3&ndash;1.7 s</td></tr>
<tr><td>Bullet speed</td><td>30 m/s</td><td>Crosses a chunk in 0.33 s &mdash; feels instant</td></tr>
<tr><td>Enemy size</td><td>0.5&ndash;1.5 m</td><td>Readable at 15 m camera distance</td></tr>
<tr><td>Fire rate</td><td>5 shots/s</td><td>0.2 s &mdash; the delay sensor value later</td></tr>
</tbody></table></div>

<ul>
<li><strong>1 unit = 1 meter</strong>, +Y is up the tube (Blender&rsquo;s Z becomes the tube&rsquo;s &ldquo;forward&rdquo; after we rotate the rig &mdash; keep the <em>rig</em> honest, not the world).</li>
<li>Gravity: <em>zero</em> for this game (World physics tab) &mdash; a tube in space. Deciding &ldquo;what does gravity do here&rdquo; is a design decision, not a default.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Write the scale contract (this table) into the conventions text block. Every tuned number later &mdash; speeds, radii, ranges &mdash; hangs off these six rows.</p></div>
` },

{ ch: 6, t: "The Gun — Modeling & Pivot Rig", h: `
<h3>Model for the pivot, not the picture</h3>
<ol>
<li>Model the gun barrel pointing down <strong>&minus;Y local</strong> (Blender&rsquo;s &ldquo;forward&rdquo;), origin at the <em>breech</em> (where it attaches).</li>
<li>Add an empty at the muzzle&rsquo;s tip: name it <span class="chip acc">gun_muzzle</span>, parent to the gun. Bullets spawn <em>here</em> (logic never guesses offsets).</li>
</ol>

<h3>The aim rig — two empties and a child</h3>
<div class="flow">
  <span class="fnode hot">aim_pivot<small>empty at player&rsquo;s chest, at tube center</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">gun<small>child of aim_pivot</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">gun_muzzle<small>child of gun</small></span>
</div>
<ul>
<li><span class="chip acc">aim_pivot</span> rotates (X: pitch, Z: yaw) &rarr; gun inherits aiming. Ray sensors and bullet spawns all reference the muzzle&rsquo;s <em>world</em> position/orientation.</li>
<li>This rig is Chapter 03&rsquo;s local-space lesson earning its keep: aim math happens in one small frame, everything downstream inherits.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Never aim by rotating the player body. Separate <em>locomotion frame</em> (player) from <em>aim frame</em> (aim_pivot) &mdash; the pattern behind every turret, camera rig, and IK target you will ever build.</p></div>
` },

{ ch: 6, t: "Gun Controls — Mouse Look", h: `
<h3>Mapping screen to sphere</h3>
<p>The mouse aims anywhere on the tube wall: horizontal mouse = yaw around the tube axis, vertical = pitch up the tube.</p>

<h3>Brick version (understand it first)</h3>
<div class="flow">
  <span class="fnode hot">Mouse: Movement X<small>&Delta; each move event</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <span class="fnode">Motion: dRot Z<small>&minus;&Delta; &middot; scale</small></span>
  <span class="farrow">+</span>
  <span class="fnode">Mouse: Movement Y &rarr; dRot X</span>
</div>

<h3>The professional version — Python, one shot</h3>
<pre data-lang="python"><code># gun.py -- module controller on aim_pivot (Always sensor, level)
import bge

SENSITIVITY = 0.0025     # radians per pixel of mouse movement
mouse = bge.logic.mouse

def update():
    own = bge.logic.getCurrentController().owner

    # normalized mouse position: center = (0.5, 0.5)
    x, y = mouse.position
    yaw   = (x - 0.5) * 4.0        # map screen width to ~4 rad of yaw
    pitch = (y - 0.5) * 1.4        # ~80 degrees of pitch

    # write directly -- instant, frame-rate independent, no accumulation
    own.applyRotation([pitch, 0.0, -yaw], False)   # False = world axes? No:
    # ...for a rig, set local rotation instead (see below)</code></pre>

<div class="callout tip"><div class="co-label">&#9733 Tip — direct vs incremental</div><p>Reading <span class="chip acc">mouse.position</span> and writing the rig&rsquo;s rotation <em>directly</em> avoids drift and lost-motion bugs from accumulating deltas. Incremental (&Delta;-based) aiming is for cameras with smoothing; direct is for guns.</p></div>
` },

{ ch: 6, t: "Mouse Sensor — Reference", h: `
<h3>The whole sensor on one slide</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Event</th><th>Fires when</th><th>Fields</th><th>Tube Cleaner use</th></tr></thead>
<tbody>
<tr><td>Left/Right/Middle Button</td><td>Button down (level or tap)</td><td>&mdash;</td><td>LMB = fire (level, for auto-fire)</td></tr>
<tr><td>Movement</td><td>Pointer moves</td><td>Threshold, button filter</td><td>Aim rig (via Python alternative)</td></tr>
<tr><td>Mouse Over</td><td>Ray from camera hits <em>any</em> object under cursor</td><td>&mdash;</td><td>Aim assist target detection</td></tr>
<tr><td>Mouse Over Any</td><td>Same, with target name/property filters</td><td>Property / Material</td><td>&ldquo;Is cursor on an enemy?&rdquo;</td></tr>
</tbody></table></div>

<h3>Reading the mouse in Python (no sensor needed)</h3>
<pre data-lang="python"><code>import bge
mouse = bge.logic.mouse

pos  = mouse.position                  # (x, y) normalized 0..1, origin bottom-left
lmb  = mouse.events[bge.events.LEFTMOUSE]
JUST, ACTIVE = bge.logic.KX_INPUT_JUST_ACTIVATED, bge.logic.KX_INPUT_ACTIVE

if mouse.events[bge.events.LEFTMOUSE] == ACTIVE:
    pass  # firing held

# teleport cursor to center (pointer-lock style aiming):
mouse.position = (0.5, 0.5)</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Expecting the OS cursor to be locked. The engine shows/hides the OS pointer; for FPS-style aiming you <em>re-center it yourself</em> each frame (<span class="chip acc">mouse.position = (0.5, 0.5)</span>) and consume the delta &mdash; that&rsquo;s how pointer-lock works at this layer.</p></div>
` },

{ ch: 6, t: "Shooting I — The Ray Approach", h: `
<h3>Hitscan: instant, cheap, honest</h3>
<p>A <strong>Ray sensor</strong> casts a line from the muzzle along local &minus;Y and reports the first hit. Wire it to damage and you have a laser with zero projectiles in flight.</p>

<div class="flow">
  <span class="fnode hot">Mouse LMB<small>sensor, level</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">FIRE</span>
    <span class="fnode">Ray sensor<small>on gun, X-ray off, range 40</small></span>
    <span class="fnode">Message &rarr; enemy: "damage"</span>
    <span class="fnode">Sound: laser.wav</span>
  </div>
</div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Ray field</th><th>Meaning</th><th>Value here</th></tr></thead>
<tbody>
<tr><td>Range</td><td>Max distance in meters</td><td>40</td></tr>
<tr><td>Axis</td><td>Cast direction (local)</td><td>&minus;Y (barrel axis)</td></tr>
<tr><td>X-Ray</td><td>See through non-matching objects</td><td>ON + property filter <span class="chip acc">enemy</span></td></tr>
<tr><td>Property / Material</td><td>What counts as a hit</td><td>property: enemy</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Hitscan suits fast, flat-trajectory weapons; projectiles (next slide) suit anything you want the player to <em>see travel</em> or dodge. Production games mix both. In Python: <span class="chip acc">ray = own.rayCast(to, from, dist, "enemy")</span> returns (object, point, normal) &mdash; full control.</p></div>
` },

{ ch: 6, t: "Shooting II — Projectile Spawning", h: `
<h3>The visible bolt</h3>
<p>Spawn a bullet object at the muzzle, oriented along the barrel, moving at 30 m/s. The engine&rsquo;s tool: <strong>Edit Object actuator &rarr; Add Object</strong>.</p>

<h3>Set it up</h3>
<ol>
<li><strong>Template:</strong> build <span class="chip acc">bullet</span> on hidden layer 2 &mdash; small elongated cube, <em>Dynamic</em> physics, Box bounds, ghost OFF (it must collide), velocity set by force or initial linV (via Python) &mdash; brick version below.</li>
<li>On <span class="chip acc">gun_muzzle</span>: Mouse LMB (or delay-limited) &rarr; AND &rarr; <strong>Edit Object &rarr; Add Object: bullet, time 3 (s)</strong>.</li>
<li>Add-Object spawns <em>at the actuator&rsquo;s object</em> (the muzzle), oriented like it. The <em>time</em> field auto-deletes after 3 s &mdash; built-in lifetime!</li>
</ol>

<h3>Rate limiting (5 shots/s)</h3>
<div class="flow">
  <span class="fnode">Mouse LMB<small>level</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Delay sensor<small>delay 0, duration 1, rep 12</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <span class="fnode">Add Object</span>
</div>
<ul>
<li>Delay sensor with <em>repeat</em> pulses every N ticks &mdash; 12 ticks @ 60 Hz = 5 Hz fire rate, frame-rate-stable via logic ticks.</li>
</ul>
` },

{ ch: 6, t: "Edit Object Actuator — Reference", h: `
<h3>The spawner&rsquo;s toolbox</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mode</th><th>Effect</th><th>Key fields</th></tr></thead>
<tbody>
<tr><td>Add Object</td><td>Spawn an object from a hidden layer at this object</td><td>Object, Time (auto-end), Linear velocity</td></tr>
<tr><td>End Object</td><td>Delete this object</td><td>&mdash;</td></tr>
<tr><td>Replace Mesh</td><td>Swap the rendered mesh (physics optional)</td><td>Mesh, Gfx/Phys toggles</td></tr>
<tr><td>Track To</td><td>Point this object&rsquo;s axis at a target</td><td>Target object, axis, time</td></tr>
</tbody></table></div>

<h3>Python equivalents (memorize these four)</h3>
<pre data-lang="python"><code>scene = bge.logic.getCurrentScene()

# Add: spawn from a layer-2 template, 5 s lifetime, 30 m/s along -Y local
bullet = scene.addObject("bullet", own, 5)
bullet.worldOrientation = own.worldOrientation   # inherit aim
bullet.applyMovement([0, -30.0, 0], True)        # True = local: -Y barrel axis

# End: bullet removes itself later, or force it now:
#   bullet.endObject()

# Replace mesh:
own.replaceMesh("gun_damaged")

# Track (in a controller): handled by constraints instead -- see Ch. 08</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Spawning from a <em>visible-layer</em> template: the template itself is live in the game (a stray bullet hovering at origin). Templates live on hidden layers &mdash; Ch. 04&rsquo;s layer plan, now with teeth.</p></div>
` },

{ ch: 6, t: "Bullet Objects — Physics & Behavior", h: `
<h3>Anatomy of a projectile</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Aspect</th><th>Choice</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Physics</td><td>Dynamic, ghost <strong>ON</strong></td><td>Ghost + Collision sensor = overlap detection without physical pushing</td></tr>
<tr><td>Bounds</td><td>Sphere (r 0.15)</td><td>Cheapest contact shape; forgiving hitbox</td></tr>
<tr><td>Lifetime</td><td>3 s auto-end</td><td>Never leaks objects (a 5 Hz, 3 s gun = max 15 alive)</td></tr>
<tr><td>Properties</td><td>is_bullet=True, damage=1</td><td>Identifiable by victims and cleanup logic</td></tr>
<tr><td>Visual</td><td>Emissive material, no shadows</td><td>Reads against any background</td></tr>
</tbody></table></div>

<h3>The hit: on the enemy (or bullet) — either side works</h3>
<div class="flow">
  <span class="fnode hot">Collision sensor<small>property: is_bullet</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND + Property: hp &gt; damage</span><span class="farrow">&rarr;</span>
  <span class="fnode">Property actuator: hp &minus;= damage</span>
</div>
<div class="flow">
  <span class="fnode">Property: hp &le; 0</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">DIE</span>
    <span class="fnode">Message "killed" &rarr; scorer</span>
    <span class="fnode">Edit Object: Replace mesh &rarr; debris</span>
    <span class="fnode">Delay 20 ticks &rarr; End Object</span>
  </div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Give <em>every</em> spawned object an exit plan: auto-end time, or explicit death logic. Object leaks are the silent killer of long sessions &mdash; memory climbs, fps falls, and nothing looks wrong in the scene.</p></div>
` },

{ ch: 6, t: "Upward Movement — Treadmill Architecture", h: `
<h3>Who actually moves?</h3>
<div class="cols3">
  <div class="card"><h4>A: Player moves up</h4><p>Honest physics; coordinates grow forever (float precision!); chunks spawn ahead &amp; die behind; camera follows. More work, more general.</p></div>
  <div class="card hot"><h4>B: World scrolls down</h4><p><strong>Chosen.</strong> Player &amp; camera stay near origin; tube sections &amp; enemies flow downward at scroll speed. Endless, stable, simple.</p></div>
  <div class="card"><h4>Hybrid</h4><p>Player moves within a <em>frame</em>; frame drifts to stay near origin (the &ldquo;floating origin&rdquo; technique big worlds use).</p></div>
</div>

<h3>The Tube Cleaner rig</h3>
<div class="flow">
  <span class="fnode hot">tube_root<small>empty, always at origin</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">tube_chunks[6]<small>children, 10 m tall each</small></span><span class="farrow">move &minus;Y at scroll speed</span>
  <span class="farrow">&rarr;</span>
  <span class="fnode">respawn at +60 m when below &minus;15 m</span>
</div>

<ul>
<li>Six 10 m chunks cover the 15&ndash;60 m visible band with one chunk of margin.</li>
<li>Respawn = teleport a chunk 60 m forward when it exits &mdash; the tube is <em>recycled geometry</em>, not infinite geometry.</li>
</ul>

<div class="callout term"><div class="co-label">&#9670 Term — Floating origin</div><p>Keeping gameplay near (0,0,0) forever by periodically re-basing the world. Float32 loses precision far from origin: shadows wobble, physics jitters. Treadmill pattern B gives you floating origin for free.</p></div>
` },

{ ch: 6, t: "The Scroller — Python Implementation", h: `
<h3>Ten lines that power the whole game</h3>
<pre data-lang="python"><code># scroll.py -- module controller on tube_root (Always sensor, level)
import bge

SCROLL_START = 3.0        # m/s
SCROLL_MAX   = 6.0
RAMP_PER_SEC = 0.05       # difficulty ramp
CHUNK_LEN    = 10.0
RECYCLE_Y    = -15.0      # below this, a chunk teleports up

state = {"speed": SCROLL_START}        # module-level state survives between calls

def update():
    dt = 1.0 / 60.0                    # logic tick (see Ch. 13 for true dt)
    state["speed"] = min(state["speed"] + RAMP_PER_SEC * dt, SCROLL_MAX)

    own = bge.logic.getCurrentController().owner
    for chunk in own.children:
        chunk.applyMovement([0, -state["speed"] * dt, 0], False)  # world Y
        if chunk.worldPosition.y &lt; RECYCLE_Y:
            chunk.applyMovement([0, CHUNK_LEN * 6, 0], False)     # send to top</code></pre>

<h3>Why this is clean</h3>
<ul>
<li><strong>Module state</strong> (<span class="chip acc">state</span> dict) persists across ticks &mdash; the module-controller advantage from Ch. 03.</li>
<li>Speed lives in <em>one</em> variable; enemies, spawn rate, and HUD read the same number &mdash; one dial for difficulty.</li>
<li>Recycling is idempotent: order of chunks doesn&rsquo;t matter, just the position test.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Scrolling the chunks with <em>physics</em> (making them dynamic). Chunks are static decor &mdash; move them with logic only. Dynamic chunks would fall (we zeroed gravity, but still), collide with the player, and cost six rigid bodies for nothing.</p></div>
` },

{ ch: 6, t: "Enemy Design — Three Vermin", h: `
<h3>Variety from one architecture</h3>
<div class="cols3">
  <div class="card hot"><h4>The Crawler</h4><p><strong>hp 1, slow, hugs the wall.</strong> Wanders around the tube circumference. Teaches: tracking motion.</p><div class="card-k">teaches: property-driven wander</div></div>
  <div class="card"><h4>The Drifter</h4><p><strong>hp 2, floats across the tube.</strong> Falls (scrolls) with the world, sine-weaves. Teaches: time-based motion.</p><div class="card-k">teaches: sine motion via Timer</div></div>
  <div class="card"><h4>The Spitter</h4><p><strong>hp 3, shoots back.</strong> Stops at mid-tube, fires slow blobs downward. Teaches: enemy attacks + player health.</p><div class="card-k">teaches: enemy projectiles</div></div>
</div>

<h3>Shared enemy contract (every type, no exceptions)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Type</th><th>Role</th></tr></thead>
<tbody>
<tr><td>enemy</td><td>Bool = True</td><td>Identifiable by rays/collisions (the property filter!)</td></tr>
<tr><td>hp</td><td>Integer</td><td>Health; die at 0</td></tr>
<tr><td>value</td><td>Integer</td><td>Score on death</td></tr>
<tr><td>kind</td><td>String</td><td>"crawler" / "drifter" / "spitter"</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Design enemies as <em>numbers first</em> (hp, speed, value, behavior verb), then models. If two enemies differ only visually, they&rsquo;re the same enemy; if they differ in numbers, they&rsquo;re a new type even with a reused mesh.</p></div>
` },

{ ch: 6, t: "Enemy Spawning — Points & Timers", h: `
<h3>The spawner object</h3>
<p>An invisible empty named <span class="chip acc">spawner</span> rides above the visible band, spawning enemies that scroll down into view.</p>

<h3>Brick version</h3>
<div class="flow">
  <span class="fnode hot">Delay sensor<small>duration 1, rep N ticks</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">SPAWN</span>
    <span class="fnode">Random actuator<small>min 30 max 50 &rarr; prop spawn_i</small></span>
    <span class="fnode hot">Property spawn_i &lt; 40</span>
    <span class="fnode">Edit Object: Add crawler</span>
    <span class="fnode">Edit Object: Add drifter (Property &gt;= 40)</span>
  </div>
</div>

<h3>Python version (the one to ship)</h3>
<pre data-lang="python"><code># spawn.py -- module controller on spawner
import bge, random

def update():
    own = bge.logic.getCurrentController().owner
    own["tick"] += 1
    interval = max(20, 90 - own["minute"] * 10)      # spawns get denser over time

    if own["tick"] % interval == 0:
        scene = bge.logic.getCurrentScene()
        kind = random.choices(["crawler", "drifter", "spitter"], weights=[5, 3, 2])[0]
        angle = random.uniform(0, 6.283)
        enemy = scene.addObject(kind, own, 0)        # 0 = manual lifetime
        # place on the tube wall at 5.5 m radius:
        enemy.worldPosition = [__import__("math").cos(angle) * 5.5,
                               48.0,
                               __import__("math").sin(angle) * 5.5]</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Spawning is <em>content pacing</em>: log every spawn (kind + time) during playtests. Distributions you didn&rsquo;t intend (all spitters, 10 s droughts) are invisible while playing and obvious in a log.</p></div>
` },

{ ch: 6, t: "Enemy Motion — Wander & Weave", h: `
<h3>Crawler: walk the circumference</h3>
<pre data-lang="python"><code># inside crawler update -- move along local tangent, flip at random
own["dir"] stays +1 or -1
own.applyMovement([own["dir"] * 0.05, 0, 0], True)     # local X = tangent
if own["flip_t"] &lt;= 0:                                 # Timer property counts down
    own["dir"] *= -1
    own["flip_t"] = random.uniform(2.0, 5.0)</code></pre>

<h3>Drifter: sine weave (Timer as clock)</h3>
<pre data-lang="python"><code># Timer property "t" counts up automatically (Ch. 05)
import math
x = math.sin(own["t"] * 2.0) * 3.0        # +/- 3 m across the tube
own.worldPosition.x = x                    # write position directly</code></pre>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Technique</th><th>Good for</th><th>Gotcha</th></tr></thead>
<tbody>
<tr><td>applyMovement (local)</td><td>Relative steps along facing</td><td>Requires honest rig axes (Ch. 05 slide 5)</td></tr>
<tr><td>worldPosition = (write)</td><td>Parametric paths (sine, orbits)</td><td>Fights physics if body is dynamic &mdash; use ghost</td></tr>
<tr><td>Apply force/torque</td><td>Physical-feeling motion</td><td>Needs damping or it never settles</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Enemies <em>parented to chunks</em> so they recycle 60 m mid-fight. Spawned enemies should be <strong>scene-level objects</strong> moving independently (they scroll themselves or ride a dedicated enemy_root), never children of recycled geometry.</p></div>
` },

{ ch: 6, t: "Enemy Hit & Death — Full Brick Flow", h: `
<h3>Everything on the enemy object (no Python required)</h3>
<div class="flow">
  <span class="fnode hot">Collision: is_bullet</span><span class="farrow">&rarr;</span>
  <span class="fnode">AND</span><span class="farrow">&rarr;</span>
  <span class="fnode">Property: hp &minus;= 1<small>(Add actuator)</small></span>
  <span class="farrow">+</span>
  <span class="fnode">Sound: hit.wav<small>pitch 0.9&ndash;1.1 random</small></span>
</div>
<div class="flow">
  <span class="fnode hot">Property: hp &le; 0</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">DEATH</span>
    <span class="fnode">Message "enemy_killed" &rarr; scorer</span>
    <span class="fnode">Replace Mesh &rarr; debris</span>
    <span class="fnode">Visibility off (or ghost on)</span>
    <span class="fnode">Delay 30 &rarr; End Object</span>
  </div>
</div>

<h3>Why the 30-tick corpse delay</h3>
<ul>
<li>The debris mesh plays a tumble (30 frames), sounds finish, collision sensors of <em>other</em> bullets already in flight resolve against a live body &mdash; ending instantly can pop visible bullets through a corpse.</li>
<li>During death delay: <strong>Ghost ON</strong> (no more hits) + a <span class="chip acc">dead=True</span> property gate so damage can&rsquo;t re-fire.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Death is a <em>state</em>, not an event: alive &rarr; dying (brief) &rarr; gone. Collapsing it to instant deletion is the #1 source of &ldquo;double explosion&rdquo; and &ldquo;bullet hit a ghost&rdquo; bugs.</p></div>
` },

{ ch: 6, t: "Enemy State Machine — Brick States", h: `
<h3>States without the State system (yet)</h3>
<p>With one Bool property per state you can already express &ldquo;different bricks active in different modes&rdquo; &mdash; the brick-level rehearsal of Chapter 12&rsquo;s real State system:</p>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>State (property gates)</th><th>Active logic</th></tr></thead>
<tbody>
<tr><td>alive == True</td><td>Collision handling, movement bricks, Spitter attack loop</td></tr>
<tr><td>dying == True</td><td>Debris tumble action, delay timer, end object</td></tr>
<tr><td>offscreen == True</td><td>(y &lt; &minus;15) &rarr; End Object &mdash; escaped enemies clean themselves</td></tr>
</tbody></table></div>

<h3>The Spitter&rsquo;s attack loop (state practice)</h3>
<div class="flow">
  <span class="fnode">Near sensor: player<small>range 25</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND + alive</span><span class="farrow">&rarr;</span>
  <span class="fnode">Delay (rep 45)</span><span class="farrow">&rarr;</span>
  <span class="fnode">Add Object: spit_blob<small>at own, time 4</small></span>
</div>

<ul>
<li>Spit blob = the <em>same bullet architecture</em> (spawn &rarr; move &rarr; collide &rarr; end) with <span class="chip acc">is_enemy_shot</span> instead of <span class="chip acc">is_bullet</span>.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div><p>When brick-gates multiply past ~3 states and 10 columns, that&rsquo;s your cue to graduate: same machine in Python (next slide), or the native State system (Ch. 12). Bricks teach the topology; code/ states carry the complexity.</p></div>
` },

{ ch: 6, t: "The Python Enemy Controller", h: `
<h3>One module, three behaviors, one state field</h3>
<pre data-lang="python"><code># enemy.py -- module controller on every enemy type
import bge, math, random

def update():
    cont = bge.logic.getCurrentController()
    own  = cont.owner

    if own["dead"]:                      # dying state: just tumble
        own.applyRotation([0.1, 0.05, 0], True)
        return

    kind = own["kind"]

    if kind == "crawler":
        own.applyMovement([own["dir"] * 0.05, 0, 0], True)
        if own["flip_t"] &lt;= 0:
            own["dir"] *= -1
            own["flip_t"] = random.uniform(2, 5)

    elif kind == "drifter":
        own.worldPosition.x = math.sin(own["t"] * 2.0) * 3.0

    elif kind == "spitter":
        own["reload"] -= 1
        player = bge.logic.getCurrentScene().objects.get("player")
        if player and own["reload"] &lt;= 0 and near(own, player, 25.0):
            blob = bge.logic.getCurrentScene().addObject("spit_blob", own, 4)
            aim  = (player.worldPosition - own.worldPosition).normalized()
            blob.worldLinearVelocity = aim * 12.0     # aimed shot, 12 m/s
            own["reload"] = 45                        # 0.75 s at 60 Hz

def near(a, b, dist):
    return (a.worldPosition - b.worldPosition).length &lt; dist</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>One <span class="chip acc">kind</span> property routes to behavior &mdash; the <strong>strategy pattern</strong> in 30 lines. New enemy = new mesh + a new elif. No new logic bricks, no duplicated wiring.</p></div>
` },

{ ch: 6, t: "The Python Gun Controller — Complete", h: `
<h3>Aim, fire, muzzle flash — production-grade</h3>
<pre data-lang="python"><code># gun.py -- module controller on aim_pivot
import bge

FIRE_RATE_TICKS = 12          # 5 shots/s at 60 Hz logic
BULLET_SPEED    = 30.0

def update():
    cont  = bge.logic.getCurrentController()
    own   = cont.owner                        # aim_pivot
    scene = bge.logic.getCurrentScene()
    mouse = bge.logic.mouse

    # --- aim: screen position -&gt; yaw/pitch -------------------------
    import mathutils
    x, y = mouse.position
    yaw   = (0.5 - x) * 4.0                   # screen wide = 4 rad sweep
    pitch = (0.5 - y) * 1.4 + 1.2             # biased up-tube
    # write the rig rotation directly (Euler XYZ) -- instant, drift-free
    own.worldOrientation = mathutils.Euler((pitch, 0.0, yaw), "XYZ")

    # --- fire: rate-limited, spawn at muzzle ------------------------
    lmb = mouse.events[bge.events.LEFTMOUSE]
    own["cooldown"] = max(0, own["cooldown"] - 1)
    if lmb == bge.logic.KX_INPUT_ACTIVE and own["cooldown"] == 0:
        muzzle = scene.objects["gun_muzzle"]
        bullet = scene.addObject("bullet", muzzle, 3)
        bullet.applyMovement([0, -BULLET_SPEED, 0], True)   # local -Y
        own["cooldown"] = FIRE_RATE_TICKS
        # muzzle flash: 3-frame sprite child of muzzle
        scene.addObject("muzzle_flash", muzzle, 0.05)</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Spawning the bullet at the <em>pivot</em> instead of the <em>muzzle</em>: shots emerge from the player&rsquo;s chest and clip the gun. An empty named for its job (<span class="chip acc">gun_muzzle</span>, Ch. 04 naming) makes the right choice obvious.</p></div>
` },

{ ch: 6, t: "Health & Damage — The Player&rsquo;s Side", h: `
<h3>Being hit is a system too</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property (on player)</th><th>Type</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>hp</td><td>Integer = 5</td><td>Hits to lose</td></tr>
<tr><td>invuln</td><td>Timer = 0</td><td>Post-hit grace period (1.5 s)</td></tr>
<tr><td>shield?</td><td>Bool</td><td>Hook for future power-ups (Ch. 08 pattern)</td></tr>
</tbody></table></div>

<h3>The hit flow</h3>
<div class="flow">
  <span class="fnode hot">Collision: is_enemy_shot<small>or enemy body</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">AND + invuln &le; 0</span><span class="farrow">&rarr;</span>
  <div class="fgroup"><span class="glabel">HURT</span>
    <span class="fnode">hp &minus;= 1</span>
    <span class="fnode">invuln = 1.5</span>
    <span class="fnode">Sound: hurt.wav</span>
    <span class="fnode">2D Filter flash? (Ch. 13)</span>
  </div>
</div>

<ul>
<li><strong>Invulnerability windows</strong> are the difference between &ldquo;hard&rdquo; and &ldquo;unfair&rdquo;: three overlapping blobs = one lost heart, not three.</li>
<li>Visual tell during invuln: blink (Visibility actuator toggling) or tint &mdash; players must <em>see</em> the mercy.</li>
<li><span class="chip acc">hp &le; 0</span> &rarr; Scene actuator &rarr; <span class="chip acc">scene_gameover</span> (next slides).</li>
</ul>
` },

{ ch: 6, t: "HUD — Overlay Scenes & Text", h: `
<h3>The standard UI architecture</h3>
<div class="flow">
  <span class="fnode hot">scene_game<small>gameplay</small></span><span class="farrow">+</span>
  <span class="fnode hot">scene_hud<small>overlay: HUD lives here</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">both render; HUD on top</span>
</div>

<ol>
<li>Model the HUD objects (text objects, hearts) in <span class="chip acc">scene_hud</span>, camera framing the screen.</li>
<li>At game start (game_state Always sensor): <strong>Scene actuator &rarr; Add Overlay: scene_hud</strong>.</li>
<li>Cross-scene data: <strong>Message actuator/</strong>sensor or a shared property object &mdash; HUD listens, gameplay talks.</li>
</ol>

<h3>Text objects at runtime</h3>
<pre data-lang="python"><code># on the HUD's score text object (Message sensor: "score_changed")
def update_score():
    own = bge.logic.getCurrentController().owner
    game = bge.logic.getCurrentScene()          # same-file scene lookup:
    state = bge.logic.getSceneList()            # all running scenes
    gs = next(s for s in state if s.name == "scene_game")
    own.text = "SCORE %05d" % gs.objects["game_state"]["score"]</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Never build the HUD into the gameplay scene. Overlays survive scene restarts (reload level = restart game scene only), don&rsquo;t add physics bodies, and stay out of gameplay raycast results. This pattern repeats in Chapters 08 and 12.</p></div>
` },

{ ch: 6, t: "Game Over & Restart Flow", h: `
<h3>The full scene graph</h3>
<div class="flow">
  <span class="fnode hot">scene_title<small>start here</small></span><span class="farrow">&rarr; start &rarr;</span>
  <span class="fnode hot">scene_game<small>+ scene_hud overlay</small></span><span class="farrow">hp&le;0 &rarr;</span>
  <span class="fnode hot">scene_gameover<small>score, retry button</small></span><span class="farrow">&rarr; retry &rarr;</span>
  <span class="fnode">back to scene_game</span>
</div>

<h3>Restart, two ways</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Approach</th><th>How</th><th>Trade-off</th></tr></thead>
<tbody>
<tr><td>Scene Restart actuator</td><td>Restart <span class="chip acc">scene_game</span> &mdash; state resets, overlay persists</td><td>Cleanest; all scene state must be scene-local</td></tr>
<tr><td>Set Scene (re-load)</td><td>Set to a fresh copy / LibLoad a new scene</td><td>Heavier; use when files are split (Ch. 12)</td></tr>
</tbody></table></div>

<ul>
<li>Retry button = Mouse Over Any + LMB sensors on a plane in the gameover scene &rarr; Scene actuator.</li>
<li>Track high score in <span class="chip acc">bge.logic.globalDict</span> &mdash; a persistent dict that survives scene switches (and can be saved to disk; Ch. 13).</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Module-level Python state (like scroll speed!) survives a scene restart &mdash; the module isn&rsquo;t reloaded. Either reset it in an init function on scene start, or read defaults from properties. Ask yourself for every module: <em>who resets this on retry?</em></p></div>
` },

{ ch: 6, t: "Balancing & Difficulty Curves", h: `
<h3>Tuning is design work with numbers</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Dial</th><th>Start</th><th>Max</th><th>Ramp</th></tr></thead>
<tbody>
<tr><td>Scroll speed (m/s)</td><td>3.0</td><td>6.0</td><td>+0.05/s</td></tr>
<tr><td>Spawn interval (ticks)</td><td>90</td><td>20</td><td>&minus;10 per minute</td></tr>
<tr><td>Enemy mix (C:D:S)</td><td>7:3:0</td><td>4:3:3</td><td>weights shift by minute</td></tr>
<tr><td>Player fire rate (Hz)</td><td>5</td><td>5</td><td>fixed &mdash; the reliable skill axis</td></tr>
</tbody></table></div>

<h3>The curve tests</h3>
<ol>
<li><strong>First 30 seconds:</strong> a new player should score their first kill within 10 s. No exceptions.</li>
<li><strong>Minute 2:</strong> the first spitter arrives &mdash; the player must have learned dodge by then (the game taught it with crawlers).</li>
<li><strong>Minute 4:</strong> death is expected &mdash; the run ends, high score posted, retry feels <em>wanted</em>.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Playtest with a spreadsheet open: run 5 sessions, record score/death time/dodges per minute. Difficulty you didn&rsquo;t design <em>will</em> emerge from the numbers &mdash; find it in data, not vibes.</p></div>
` },

{ ch: 6, t: "Chapter 06 — Pitfalls & Best Practices", h: `
<h3>Shooter-grade review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Spawn without a kill switch.</strong> Every addObject must have a lifetime or death condition. 20-minute sessions expose every leak.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Instant-delete deaths</strong> breaking in-flight bullets and queued messages. Dying is a state (Ch. 06 slide 20).</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Aiming with the player body.</strong> Separate aim_pivot from locomotion; rigs keep math sane.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Module state surviving restarts</strong> (difficulty never resets on retry). Init on scene start.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Treadmill architecture</strong> for endless games: stable coordinates, recycled chunks, difficulty = spawn table.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>One projectile architecture</strong> for player bullets, enemy shots, pickups, particles &mdash; spawn/move/collide/end, different properties.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Property contracts</strong> (<span class="chip acc">is_bullet</span>, <span class="chip acc">enemy</span>, <span class="chip acc">kind</span>) make objects queryable without names or links.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>HUD in overlays, state in globalDict,</strong> communication by message &mdash; the UI survives restarts and never touches gameplay scene data.</p></div>
</div>
</div>
` },

{ ch: 6, t: "Chapter 06 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Charged shot:</strong> holding LMB 1 s (Timer property) spawns a big bullet (damage 3, radius 0.5) instead &mdash; reuses the whole projectile pipeline.</li>
<li><strong>Combo system:</strong> kills within 2 s of each other multiply score (Timer + Property arithmetic on game_state; announce via message).</li>
<li><strong>Fourth enemy:</strong> &ldquo;Splitter&rdquo; &mdash; on death spawns two crawlers (death state addObject). Two lines in enemy.py &mdash; prove the strategy pattern pays.</li>
<li><strong>Hit-scan laser:</strong> alternate weapon on RMB using the Ray sensor approach; render the beam as a stretched plane for 2 frames.</li>
<li><strong>Port to Python:</strong> eliminate every enemy logic brick; behavior entirely in <span class="chip acc">enemy.py</span> + property gates. Count your logic editor columns before and after.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Structure a project across .blend files (link/append, groups) &#10003;</li>
<li>Rig mouse aiming and rate-limited firing &#10003;</li>
<li>Implement hitscan and projectile shooting &#10003;</li>
<li>Build a scrolling world with recycled chunks &#10003;</li>
<li>Give enemies spawning, motion, damage, death states, and AI &mdash; in bricks and Python &#10003;</li>
<li>Manage health, HUD overlays, and restart flows &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 07 hands the physics to Bullet itself: a pinball table where bumpers, flippers, and gravity are the gameplay. No scrolling &mdash; just honest rigid-body chaos, tuned like an instrument.</p></div>
` }

);
