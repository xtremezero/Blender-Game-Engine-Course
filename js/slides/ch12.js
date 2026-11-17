/* Part III — Chapter 12: "Yo Frankie!" The Open Game Project (26 slides) */

SLIDES.push(

{ ch: 12, t: "Chapter 12 — Yo Frankie! The Open Game Project", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">12</div>
  <div class="ch-info">
    <h1>&ldquo;Yo Frankie!&rdquo; The Open Game Project</h1>
    <div class="ch-sub">Creative Commons &middot; Logic Sharing &middot; States &middot; Levels &middot; Split-screen &middot; Physics &amp; Logic at production scale</div>
  </div>
</div>
<div class="ch-goals">
  <h4>A production case study you can raid for parts</h4>
  <ul>
    <li>Licensing game content: Creative Commons in practice</li>
    <li>Share logic across a level: groups, linking, the librarian&rsquo;s discipline</li>
    <li>Master the State system: one object, thirty brains</li>
    <li>Build modular levels and stream them at runtime</li>
    <li>Implement split-screen: two scenes, two viewports, two players</li>
    <li>Ship-grade physics tuning, AI, particles, and optimization</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>26</b> slides</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9733&#9733&#9734</b></span>
</div>
` },

{ ch: 12, t: "The Open Game Project — History", h: `
<h3>What &ldquo;Yo Frankie!&rdquo; was</h3>
<p>The <strong>Apricot project</strong> (2008): the Blender Foundation&rsquo;s third open movie &mdash; but this time an <em>open game</em>. A small professional team, a community, and one mandate: prove an open pipeline (Blender + BGE + CC assets) could produce a real, playable, distributable game &mdash; and publish <em>everything</em>: sources, rigs, textures, logic.</p>

<div class="stats">
  <div class="stat"><b>2008</b><span>produced</span></div>
  <div class="stat"><b>~6 mo</b><span>production</span></div>
  <div class="stat"><b>CC-BY</b><span>everything, forever</span></div>
  <div class="stat"><b>2</b><span>playable levels shipped</span></div>
</div>

<h3>Why a curriculum studies it</h3>
<ul>
<li>Its <strong>sources are still public</strong> &mdash; every trick in this chapter can be verified by opening the real files. Study production truth, not textbook simplifications.</li>
<li>It stress-tested exactly what this course teaches: logic bricks + Python + states + physics &mdash; at deadline scale.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Read other people&rsquo;s .blends like game-dev literature. Open-movie/game sources (this one, Sintel, Caminandes&hellip;) are masterclasses in organization, naming, and how much logic a shipped game <em>actually</em> needs.</p></div>
` },

{ ch: 12, t: "Creative Commons for Game Assets", h: `
<h3>The license menu</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>License</th><th>Others must&hellip;</th><th>Others may&hellip;</th><th>Game use</th></tr></thead>
<tbody>
<tr><td>CC-BY</td><td>Credit you</td><td>Remix, sell remixes</td><td>Maximum spread &mdash; the Apricot choice</td></tr>
<tr><td>CC-BY-SA</td><td>Credit + share remixes alike</td><td>Remix commercially if SA</td><td>Viral openness; Wikipedia&rsquo;s model</td></tr>
<tr><td>CC-BY-NC</td><td>Credit + <strong>no commercial</strong></td><td>Noncommercial remixes</td><td><em>Poison for games</em> &mdash; defines &ldquo;commercial&rdquo; by case law</td></tr>
<tr><td>CC0 / public domain</td><td>Nothing</td><td>Everything</td><td>Assets you wish to be universal infrastructure</td></tr>
</tbody></table></div>

<h3>Practical licensing discipline</h3>
<ul>
<li><strong>Keep a LICENSE file + CREDITS</strong> alongside the game: asset, author, license, URL &mdash; a spreadsheet you fill <em>at import time</em>, not at ship time.</li>
<li>CC applies to <strong>content</strong>; code usually ships under MIT/GPL instead &mdash; mixing is fine, tracking is mandatory.</li>
<li>Store-and-forward: marketplace distribution rules (console/mobile) may conflict with share-alike clauses &mdash; read before you build on NC/SA assets.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>&ldquo;It&rsquo;s free on the internet.&rdquo; A model ripped from a forum is a legal time bomb in your shipped folder. License <em>clarity</em> is a feature; uncredited assets are a launch blocker in any professional context.</p></div>
` },

{ ch: 12, t: "Production Pipeline Lessons", h: `
<h3>What the project taught about making games in the open</h3>
<div class="cols2">
<div>
<ul>
<li><strong>Deadline forces decisions:</strong> six months shipped two levels, not five &mdash; cut scope, not quality. The shipped cut <em>is</em> the design.</li>
<li><strong>Version everything:</strong> the project&rsquo;s SVN (today: git) held assets, scenes, and docs together. History is a collaboration feature.</li>
<li><strong>Weekly builds:</strong; a runnable build every week keeps integration honest &mdash; broken merges surface in days, not months.</li>
</ul>
</div>
<div>
<ul>
<li><strong>Vertical slice first:</strong> one room, one character, all systems &mdash; then multiply content. (Exactly this course&rsquo;s chapter structure.)</li>
<li><strong>Documentation as you go:</strong; the project blog + dev docs doubled as marketing <em>and</em> onboarding.</li>
<li><strong>Community as QA:</strong> public beta builds found hundreds of bugs the team couldn&rsquo;t reproduce.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Institute <strong>playable-from-day-one</strong>: if the game doesn&rsquo;t run from a clean checkout every single day, fix that before any feature. Broken builds compound like debt &mdash; with interest.</p></div>
` },

{ ch: 12, t: "Logic Sharing — Groups & Linking", h: `
<h3>The scale problem this solves</h3>
<p>One Frankie character = 40+ logic bricks across armature, body, and helper objects. One level has a dozen such entities. Copy-pasting bricks per instance is how productions die &mdash; the project&rsquo;s answer:</p>

<div class="flow">
  <span class="fnode hot">frankie_lib.blend<small>the character, logic included</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">group: grp_frankie</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">level.blend<small>links/appends group instances</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">N enemies, 1 player<small>same brain, shared fixes</small></span>
</div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mechanism</th><th>Shares logic?</th><th>Edit where?</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Group (in-file)</td><td>Across its instances</td><td>The group&rsquo;s objects</td><td>Prefabs (Ch. 11 cards)</td></tr>
<tr><td>Linked group instance</td><td>Across <em>files</em></td><td>The library .blend only</td><td>Team pipelines, many levels</td></tr>
<tr><td>Python module (text block / file)</td><td>Everyone who imports</td><td>The .py / text block</td><td>Behavior rules (the real glue)</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice — the 80/20 of production logic</div>
<p>Shipped-game reality: <strong>bricks for wiring and triggers, groups for reuse, Python for every rule with a branch in it.</strong> Frankie&rsquo;s own files show it &mdash; character bricks are thin; the behavior lives in scripts attached by module controllers.</p></div>
` },

{ ch: 12, t: "Group Instances — The Prefab Discipline", h: `
<h3>Making a group behave like a prefab</h3>
<ol>
<li>Select all objects of the entity (armature, meshes, logic empties).</li>
<li><kbd>Ctrl</kbd>+<kbd>G</kbd> &rarr; name it <span class="chip acc">grp_frankie</span> (grammar: grp_ prefix).</li>
<li>Place instances via <em>Add &rarr; Group instance</em> &mdash; transforms unique, contents shared.</li>
<li>Spawn at runtime: <span class="chip acc">scene.addObject("grp_frankie", spawn_point, 0)</span> spawns the group&rsquo;s objects with logic intact.</li>
</ol>

<h3>The rules that keep groups sane</h3>
<ul>
<li><strong>No absolute references:</strong> bricks inside a group must reference <em>self/own</em> or group members &mdash; never world-named objects (&ldquo;player&rdquo;), or instances fight over one target.</li>
<li><strong>One owner per decision:</strong; duplicate-spawned groups each carry their own properties &mdash; per-instance state comes free, shared state must go through messages/globalDict.</li>
<li><strong>Naming in the group</strong> is local: <span class="chip acc">sense_front</span> inside grp_enemy is fine; two groups both containing sense_front don&rsquo;t collide (group-scoped).</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Logic inside a group reading <span class="chip">scene.objects["player"]</span> by name: every instance targets the same object &mdash; and levels without that exact name crash the sensor. Use group-relative wiring or message-based discovery.</p></div>
` },

{ ch: 12, t: "The State System — Concept", h: `
<h3>Thirty brains for one object</h3>
<p>Until now: one logic setup per object, gated by properties (Ch. 06&rsquo;s rehearsal). The native <strong>State system</strong> formalizes it: an object has 30 logic states; <strong>each state owns a subset of its bricks</strong>; a <em>State mask</em> selects which states are active; bricks fire only when their state is enabled.</p>

<div class="flow">
  <span class="fnode hot">Object<small>40 bricks, sorted into states</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">State 1: PATROL<small>5 bricks live</small></span><span class="farrow">see player &rarr;</span>
  <span class="fnode">State 2: CHASE<small>7 bricks</small></span><span class="farrow">lost him &rarr;</span>
  <span class="fnode">State 4: FLEE<small>4 bricks</small></span>
</div>

<h3>Why states beat property gates at scale</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>Property gates</th><th>State system</th></tr></thead>
<tbody>
<tr><td>Active brick count</td><td>All bricks poll, gates filter</td><td>Only current state&rsquo;s bricks exist</td></tr>
<tr><td>Invalid combinations</td><td>Possible (alive AND dead)</td><td>Impossible by construction</td></tr>
<tr><td>Transitions</td><td>Manual property choreography</td><td>One actuator: set state mask</td></tr>
<tr><td>Readability</td><td>Columns + invisible gates</td><td>Editor literally separates them</td></tr>
</tbody></table></div>
` },

{ ch: 12, t: "States — Setup & Masks", h: `
<h3>Mechanics</h3>
<ol>
<li>Logic editor header: the <strong>state selector grid</strong> (30 buttons). The visible one is being <em>edited</em>.</li>
<li>Every brick belongs to the state you&rsquo;re editing when you create it.</li>
<li><strong>Initial state</strong> set on the object (Object properties &rarr; Game &rarr; Initial State) &mdash; the mask active at spawn.</li>
<li>The <strong>State actuator</strong> switches masks: <em>Set</em> (replace), <em>Add</em>, <em>Remove</em> &mdash; or Python.</li>
</ol>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Mask op</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Set</td><td>Exclusive transitions: PATROL &rarr; CHASE (the common case)</td></tr>
<tr><td>Add</td><td>Overlay a temporary layer: + AIM while keeping LOCOMOTION</td></tr>
<tr><td>Remove</td><td>Drop that layer when aim ends</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># states from Python
own.state = 1 &lt;&lt; 3          # set to state 4 (bit 3)
own.state |= 1 &lt;&lt; 5         # add state 6 (bitwise OR)
own.state &amp;= ~(1 &lt;&lt; 5)      # remove state 6
own.state                      # read: int bitmask (bits 0..29)</code></pre>

<div class="callout tip"><div class="co-label">&#9733 Tip — the mask is a bitmask</div>
<p>States are bits in an int: state N = bit N&minus;1. That&rsquo;s why &ldquo;masks&rdquo; combine with |, &amp;, ~. Once you see the bitmask, the Add/Set/Remove model stops being magic.</p></div>
` },

{ ch: 12, t: "State-Specific Bricks — Editing Rules", h: `
<h3>The workflow that keeps 30 states navigable</h3>
<ul>
<li><strong>One concern per state</strong>: MOVEMENT, ATTACK, HURT, DEAD, TALK &mdash; names from the object&rsquo;s behavioral vocabulary. If a state needs another&rsquo;s brick, that&rsquo;s usually a missing transition, not a copy-paste.</li>
<li><strong>Transitions live in the leaving state:</strong> the HURT state contains the &ldquo;when to stop hurting&rdquo; logic (delay + State actuator back to MOVEMENT).</li>
<li><strong>Sensors can be shared across states</strong> (a brick&rsquo;s state is editable in its dropdown) &mdash; but prefer duplicated cheap sensors over shared confusing ones. Clarity &gt; DRY at brick level.</li>
</ul>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Frankie-style NPC states (real example shape)</th><th>Transition out</th></tr></thead>
<tbody>
<tr><td>1 IDLE</td><td>timer/Near player &rarr; PATROL or CHASE</td></tr>
<tr><td>2 PATROL (walk waypoints)</td><td>Radar player &rarr; CHASE</td></tr>
<tr><td>3 CHASE (run, bark)</td><td>lost player 4 s &rarr; PATROL; bit &rarr; ATTACK</td></tr>
<tr><td>4 ATTACK (lunge anim + hit window)</td><td>anim done &rarr; CHASE</td></tr>
<tr><td>8 HURT (hit reaction, invuln)</td><td>0.4 s &rarr; previous (stored in prop)</td></tr>
<tr><td>16 DEAD (ragdoll/despawn)</td><td>terminal</td></tr>
</tbody></table></div>
` },

{ ch: 12, t: "Building the Character Brain", h: `
<h3>Player character as a state machine (the project&rsquo;s approach)</h3>
<pre data-lang="python"><code># brain.py -- module controller on frankie (Always sensor per state)
import bge

S_GROUND, S_JUMP, S_FALL, S_CLIMB, S_HURT = 1, 2, 3, 4, 8   # state bits

def ground():
    """state 1: run, jump initiation, interact"""
    own = bge.logic.getCurrentController().owner
    grounded = own["ground_sensor"]                # Ray sensor, brick-wired
    move_locomotion(own)                           # Ch. 10 locomotion module

    if jump_key() and grounded:
        apply_jump(own)
        set_state(own, S_JUMP)
    elif not grounded:
        set_state(own, S_FALL)
    elif near_climbable(own):
        set_state(own, S_CLIMB)

def air():
    """states 2+3: shared aerial control (both states call this)"""
    own = bge.logic.getCurrentController().owner
    air_drift(own)                                 # reduced steering
    if own["ground_sensor"]:
        land(own)                                  # dust + sound + squash
        set_state(own, S_GROUND)

def set_state(own, bits):
    own.state = bits          # exclusive switch -- transitions in one place
    bge.logic.sendMessage("state_" + str(bits))    # HUD/audio can listen</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>One <span class="chip acc">set_state()</span> choke point that also <em>announces</em> transitions: debugging gets log lines, audio gets footsteps-vs-wingbeat events, and no other code writes <span class="chip">own.state</span> directly. One door, one bouncer.</p></div>
` },

{ ch: 12, t: "Level Construction — Modular Kits", h: `
<h3>Levels from LEGO</h3>
<div class="cols2">
<div>
<h4>The kit (in assets.blend)</h4>
<ul>
<li><strong>Floor tiles:</strong> 1&times;1, 2&times;2, ramps, stairs &mdash; snap-clean, pivot-cornered (Ch. 04).</li>
<li><strong>Walls:</strong> straight, corner, doorway, arch &mdash; grid-aligned ends.</li>
<li><strong>Props:</strong> trees, rocks, crates (grp_ instances with logic where interactive).</li>
<li><strong>Kit rule:</strong> everything snaps to a 2 m grid &mdash; level design becomes assembly.</li>
</ul>
</div>
<div>
<h4>The assembly discipline</h4>
<ul>
<li>Blockout with gray kit first (Ch. 05), playtest, then art pass <em>replaces</em> modules.</li>
<li>Join static kit pieces per zone into merged meshes (<kbd>Ctrl</kbd>+<kbd>J</kbd>) &mdash; draw-call economics again.</li>
<li><strong>Logic zones as empties:</strong> triggers, spawn points, cameras &mdash; visible, movable, named.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Keep a <strong>kit catalog text block</strong>: every module, its name, dimensions, poly count, texture. Level designers can&rsquo;t use what they can&rsquo;t find &mdash; and 3 months later, neither can you.</p></div>
` },

{ ch: 12, t: "Level Streaming — LibLoad", h: `
<h3>Worlds bigger than memory</h3>
<p><span class="chip acc">bge.logic.LibLoad</span> merges a .blend (or .blend + data) into the running game at runtime &mdash; new scenes, meshes, actions, logic &mdash; without restart:</p>

<pre data-lang="python"><code># stream.py -- on the level loader (Message sensor: "load_level" body=name)
import bge

def load():
    cont  = bge.logic.getCurrentController()
    level = cont.sensors["load_level"].bodies[-1]          # e.g. "level_02"
    path  = bge.logic.expandPath("//levels/" + level + ".blend")

    if level in bge.logic.LibList():                        # idempotency guard
        enter_level(level)
        return

    # async=True loads in a thread; the status is polled by the loading screen
    status = bge.logic.LibLoad(path, "Scene", asynchronous=True)
    status.onFinish = lambda: enter_level(level)

def enter_level(name):
    bge.logic.sendMessage("hide_loading")                   # loading screen off
    bge.logic.getCurrentScene().replace(name)                # or addOverlay etc.</code></pre>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Concern</th><th>Discipline</th></tr></thead>
<tbody>
<tr><td>Memory</td><td><span class="chip acc">LibFree(name)</span> unloads finished levels &mdash; streaming leaks otherwise</td></tr>
<tr><td>Duplicate data</td><td>Shared assets (characters) live in the base file; levels contain only level geometry</td></tr>
<tr><td>Loading UX</td><td>Async + a loading scene with progress (status.progress) &mdash; never a frozen frame</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Streaming a level that <em>also</em> contains the character: duplicate objects with identical names enter the scene. Levels own terrain; the game owns entities. Separate ownership, separate files.</p></div>
` },

{ ch: 12, t: "Split-screen — The Architecture", h: `
<h3>Two players, one machine</h3>
<div class="flow">
  <span class="fnode hot">scene_game<small>P1 + P2 + shared world</small></span><span class="farrow">+</span>
  <span class="fnode">cam_P1<small>viewport: left half</small></span><span class="farrow">+</span>
  <span class="fnode">cam_P2<small>viewport: right half</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Screen: two views of ONE simulation</span>
</div>

<div class="cols2">
<div>
<h3>Two architectures, pick one</h3>
<ul>
<li><strong>One scene, two cameras, viewports</strong> (this course): one simulation &mdash; players genuinely share a world; each camera renders into its rectangle. Simple, fast, honest.</li>
<li><strong>Two scenes overlay</strong> (two simulations): for separate mini-games on one screen &mdash; heavier, rarely what &ldquo;split-screen&rdquo; means.</li>
</ul>
</div>
<div>
<h3>Setup checklist</h3>
<ol>
<li>Two cameras, each parented/tracked to its player (Ch. 05 patterns).</li>
<li>Viewport assignment (next slide).</li>
<li>HUD: either two viewports&rsquo; overlays or one centered shared HUD.</li>
<li>Input split: P1 WASD, P2 arrows (or gamepads &mdash; Joystick sensors).</li>
</ol>
</div>
</div>
` },

{ ch: 12, t: "Split-screen — Viewport Code", h: `
<h3>The renderer&rsquo;s window manager</h3>
<pre data-lang="python"><code># split.py -- runs once at game start (Always + tap)
import bge

def setup():
    r = bge.render                                  # the renderer module

    scene = bge.logic.getCurrentScene()
    cam1 = scene.objects["cam_P1"]
    cam2 = scene.objects["cam_P2"]

    # left half for P1: (left, bottom, right, top) in 0..1
    cam1.setViewport(0, 0, r.getWindowWidth() // 2, r.getWindowHeight())
    cam1.useViewport = True                         # activate!

    # right half for P2
    cam2.setViewport(r.getWindowWidth() // 2, 0, r.getWindowWidth(), r.getWindowHeight())
    cam2.useViewport = True

    # optional divider: a thin plane parented midway, always facing screen</code></pre>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>API</th><th>Does</th></tr></thead>
<tbody>
<tr><td><span class="chip">setViewport(l, b, r, t)</span></td><td>Pixel rectangle this camera renders into (y origin at bottom!)</td></tr>
<tr><td><span class="chip">useViewport = True</span></td><td>Enables viewport rendering for the camera</td></tr>
<tr><td><span class="chip">getWindowWidth/Height()</span></td><td>Actual render size &mdash; query, don&rsquo;t assume</td></tr>
<tr><td><span class="chip">setEyeSeparation()</span> etc.</td><td>Stereo (same viewport machinery, twice)</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Forgetting <span class="chip acc">useViewport = True</span> &mdash; setViewport alone does nothing. Also: both viewports re-render <em>the whole scene&rsquo;s visible set</em> &mdash; split-screen roughly doubles render cost (two passes), so halve your draw-call budget per view (Ch. 13).</p></div>
` },

{ ch: 12, t: "Split-screen — Two Players, One Keyboard", h: `
<h3>Input territory</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Player 1</th><th>Player 2</th></tr></thead>
<tbody>
<tr><td>W A S D &mdash; move</td><td>Arrow keys &mdash; move</td></tr>
<tr><td>L Shift &mdash; sprint</td><td>R Shift / R Ctrl &mdash; sprint</td></tr>
<tr><td>E &mdash; interact</td><td>Right Ctrl / Numpad 0 &mdash; interact</td></tr>
</tbody></table></div>

<ul>
<li>Keyboard rollover is physical: cheap keyboards register ~6 simultaneous keys &mdash; sprint+jump+move for two players <em>will</em> collide on shared membranes. <strong>Gamepads (Joystick sensors) are the real answer</strong> for couch play.</li>
<li>Group-instance both players from <span class="chip acc">grp_frankie</span>; parameterize by a <span class="chip acc">player_id</span> property that selects the sensor columns (state-mask per player or Python keymap table).</li>
</ul>

<pre data-lang="python"><code># input_map.py -- per-player key bindings in one table
import bge

KEYMAP = {
    1: {"fwd": bge.events.WKEY, "back": bge.events.SKEY,
        "left": bge.events.AKEY, "right": bge.events.DKEY},
    2: {"fwd": bge.events.UPARROWKEY, "back": bge.events.DOWNARROWKEY,
        "left": bge.events.LEFTARROWKEY, "right": bge.events.RIGHTARROWKEY},
}
def held(player, action):
    return bge.logic.keyboard.events[KEYMAP[player][action]] == bge.logic.KX_INPUT_ACTIVE</code></pre>
` },

{ ch: 12, t: "Physics Tuning for Characters", h: `
<h3>The shipped-game character recipe</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Frankie-grade value</th><th>Rationale</th></tr></thead>
<tbody>
<tr><td>Body</td><td>Dynamic + character-friendly bounds (capsule/box)</td><td>Stairs/slopes without simulating legs</td></tr>
<tr><td>Mass</td><td>60&ndash;80</td><td>Knockbacks scale sensibly</td></tr>
<tr><td>Form factor bounds</td><td>Cylinder/Capsule where available, else Box</td><td>No edge-catch on tile seams</td></tr>
<tr><td>Angular damping</td><td>1.0 + Z-rotation lock</td><td>Never tumble; orientation owned by logic</td></tr>
<tr><td>Linear damping</td><td>0.1&ndash;0.3</td><td>Snappy stops, tiny glide</td></tr>
<tr><td>Ghost on cosmetic children</td><td>yes</td><td>Tails/cloaks never snag geometry</td></tr>
</tbody></table></div>

<h3>The two great character-physics decisions</h3>
<ol>
<li><strong>Rotation: logic-owned.</strong> Physics rotating characters = unplanned comedy. Lock it; aim with logic (Ch. 06&rsquo;s rigs).</li>
<li><strong>Motion: force/servo, not teleport.</strong> dLoc characters ignore mass &mdash; explosions and moving platforms stop mattering. The player must be a citizen of the physics world (Ch. 05&rsquo;s v2 lesson, now law).</li>
</ol>
` },

{ ch: 12, t: "Ragdolls & Reactions", h: `
<h3>Dying is a mode change</h3>
<div class="flow">
  <span class="fnode hot">State: DEAD<small>brain stops driving</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Disable dynamics constraints<small>armature bones freed</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Ragdoll<small>Bone physics constraints active</small></span><span class="farrow">rest &rarr;</span>
  <span class="fnode">Despawn / respawn</span>
</div>

<h3>The BGE-era ragdoll recipe</h3>
<ol>
<li>Rig duplicate: a physics proxy skeleton (boxes/capsules per bone group, rigid bodies).</li>
<li><strong>Hinge/point constraints</strong> between proxy bones (Ch. 07 flipper constraints, anatomically limited).</li>
<li>On death: hide the animated character; spawn the proxy at the same pose; Copy Location/Rotation constraints map the <em>visual</em> mesh bones to proxy bones each frame.</li>
<li>Alternatively (cheaper, era-faithful): a canned death animation + physics impulse on the whole body &mdash; &ldquo;fake ragdoll&rdquo; shipped in many titles and reads fine at game speed.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Ragdolls are <em>expensive toys</em>: budget them (max 2&ndash;3 active, timer-despawn, sleep allowed) and keep the canned-animation fallback wired &mdash; you&rsquo;ll thank the fallback on the low-end machine at the trade show.</p></div>
` },

{ ch: 12, t: "Enemy AI — Perception", h: `
<h3>What the enemy knows (Ch. 08 sensors, production-sized)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Sense</th><th>Implementation</th><th>Cost control</th></tr></thead>
<tbody>
<tr><td>Sight</td><td>Radar cone (FOV) + Ray (line-of-sight, X-Ray + property <span class="chip acc">player</span>)</td><td>Frequency 3&ndash;5; ray only when radar already sees</td></tr>
<tr><td>Hearing</td><td>Message on loud player actions (jump, bark) with radius check</td><td>Free &mdash; event-driven, no polling</td></tr>
<tr><td>Proximity</td><td>Near (short, 2/2.4 hysteresis)</td><td>Frequency 2</td></tr>
<tr><td>Memory</td><td>Properties: last_seen_pos (vector), alert_t (Timer)</td><td>None &mdash; plain data</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># perceive.py -- every 3rd tick on the enemy (frequency-skipped sensor)
import bge

def tick():
    own = bge.logic.getCurrentController().owner
    player = bge.logic.getCurrentScene().objects.get("player")
    if not player:
        return
    to_p = player.worldPosition - own.worldPosition
    if to_p.length &lt; 20 and sees(own, player, to_p):
        own["last_seen_pos"] = player.worldPosition.copy()
        own["alert_t"] = 6.0        # remember for 6 s after losing sight
        return True
    return False

def sees(own, player, to_p):
    fwd = own.worldOrientation.col[1] * -1
    if to_p.normalized().dot(fwd) &lt; 0.35:      # outside ~70 deg cone
        return False
    hit = own.rayCast(player.worldPosition, own.worldPosition, 0, "player")
    return hit[0] is not None                 # LOS clear (wall blocked -&gt; None)</code></pre>
` },

{ ch: 12, t: "Enemy AI — Navigation", h: `
<h3>Getting from A to B without a middleware license</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Technique</th><th>How</th><th>Best at</th></tr></thead>
<tbody>
<tr><td><strong>Waypoints</strong> (the project&rsquo;s workhorse)</td><td>Named empties in a graph; enemy picks next node toward target, alignAxisToVect + force to it (Ch. 08)</td><td>Outdoor patrol/chase on readable terrain</td></tr>
<tr><td>Steering senses</td><td>Radar whiskers + avoidance torques (Ch. 08 slide 6)</td><td>Local obstacle manners; combine with waypoints</td></tr>
<tr><td>Beacon chase</td><td>Move to remembered position; re-sense on arrival</td><td>Simple, robust &ldquo;search last known&rdquo; behavior</td></tr>
<tr><td>Navmesh pathing</td><td>Marked walkable mesh; A* over faces (modern engines ship this built-in)</td><td>Complex interiors &mdash; use the engine&rsquo;s if available</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># waypoints.py -- graph walk, 8 lines of behavior
def next_node(scene, current, goal):
    # graph = dict of node name -&gt; neighbors (baked into a text block or props)
    return a_star(graph, current, goal)      # classic A*, ~40 lines

def drive(own, target_pos):
    d = target_pos - own.worldPosition
    own.alignAxisToVect(d, 1, 0.08)          # turn toward (Ch. 08 gem)
    own.applyForce((0, own["speed"] * 60.0, 0), True)</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Author waypoints as <em>visible objects</em> (empties, debug-colored). Level designers tune AI by moving empties &mdash; no code, no re-export. Data the designer can touch is worth two algorithm upgrades.</p></div>
` },

{ ch: 12, t: "Particle Effects", h: `
<h3>Three tiers, one budget</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Tier</th><th>Implementation</th><th>Cost</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Scripted spawns</td><td>addObject tiny quads + velocity + auto-end (Ch. 06 pattern)</td><td>Bodies: cheap; logic: per-particle</td><td>Impacts, pickups, bursts &lt; 20</td></tr>
<tr><td>Emitter objects</td><td>One logic-driven emitter spawning timed (Delay) with random velocity cones</td><td>Amortized logic</td><td>Smoke, fire, waterfalls</td></tr>
<tr><td>Texture tricks</td><td>Animated flipbooks / scrolling UVs on ribbons (GLSL from Ch. 08)</td><td>Zero physics</td><td>Flames, rain sheets, sparks</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># burst.py -- spawn N particles in a cone (impacts, explosions)
import bge, random, mathutils

def burst(own, n=12, speed=6.0, life=0.8, name="p_spark"):
    scene = bge.logic.getCurrentScene()
    for _ in range(n):
        p = scene.addObject(name, own, life)
        v = mathutils.Vector((random.uniform(-1, 1),
                              random.uniform(0.2, 1.5),
                              random.uniform(-1, 1))).normalized() * speed
        p.worldLinearVelocity = v
        p["spin"] = random.uniform(-8, 8)      # particle script reads it</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Particles as full dynamic bodies with collision: 30 sparks = 30 contact islands per tick. Ghost ON + no bounds &mdash; particles are pictures with velocity, not physics citizens.</p></div>
` },

{ ch: 12, t: "Optimization — Culling & LOD", h: `
<h3>Don&rsquo;t draw what isn&rsquo;t seen</h3>
<div class="cols2">
<div>
<h4>Automatic (free) &mdash; know it, verify it</h4>
<ul>
<li><strong>Frustum culling:</strong> off-screen objects skipped per camera (Ch. 03) &mdash; split-screen runs it per viewport.</li>
<li><strong>Backface culling:</strong> normals facing away are skipped (Ch. 03) &mdash; material must have it enabled!</li>
<li><strong>Small/large feature culling</strong> (dbvt): tiny/distant objects culled by size thresholds.</li>
</ul>
</div>
<div>
<h4>Manual (earned)</h4>
<ul>
<li><strong>Layer zoning:</strong> distant/interior zones on hidden layers, activated by triggers (scene-section streaming).</li>
<li><strong>LOD (level of detail):</strong> low-poly mesh swap by distance &mdash; <em>ReplaceMesh</em> on distance Property sensors, or the object&rsquo;s LOD list. Decimate to build LOD1/2 (Ch. 04 modifier).</li>
<li><strong>Occluder thinking:</strong> big opaque geometry (cliff, building) hides what&rsquo;s behind it &mdash; design levels so the camera naturally looks <em>past</em> blockers.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Measure culling wins with the profiler&rsquo;s render time on the <em>worst camera angle</em> (the long view down the whole level). Optimizing the easy view is optimizing a screenshot, not the game.</p></div>
` },

{ ch: 12, t: "Optimization — Logic Throttling", h: `
<h3>The CPU side of the frame budget</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Technique</th><th>Mechanism</th><th>Typical saving</th></tr></thead>
<tbody>
<tr><td>Sensor frequency</td><td>Poll every Nth tick (sensor&rsquo;s Freq field)</td><td>60%+ on radar/near farms</td></tr>
<tr><td>State deactivation</td><td>Only current state&rsquo;s bricks exist (this chapter!)</td><td>Enormous on idle enemies</td></tr>
<tr><td>Distance hibernation</td><td>Far enemies &rarr; a low-rate &ldquo;sleeper&rdquo; state (Near sensor only)</td><td>Scales AI with relevance</td></tr>
<tr><td>Event-driven over polled</td><td>Messages instead of per-tick property comparisons</td><td>Constant factor + clarity</td></tr>
<tr><td>Expensive ops amortized</td><td>A* every 0.5 s, not per tick; cache paths</td><td>The difference between AI and slideshow</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># hibernate.py -- the AI budget governor
def tick():
    own = bge.logic.getCurrentController().owner
    player = bge.logic.getCurrentScene().objects.get("player")
    far = player and (player.worldPosition - own.worldPosition).length &gt; 45

    if far and own.state != S_SLEEP:
        set_state(own, S_SLEEP)       # only a 1 Hz Near sensor remains alive
    # S_SLEEP's Near (45/50 hysteresis, freq 30) flips back to PATROL on return</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Give every AI a <strong>sleep state</strong> from day one &mdash; retrofitting hibernation into a mature AI is archaeology. The 45 m threshold should be a named constant your designers argue about in one place.</p></div>
` },

{ ch: 12, t: "Profiling — Where the Frame Goes", h: `
<h3>The loop, instrumented</h3>
<div class="flow">
  <span class="fnode hot">Logic ms<small>sensors/controllers/Python</small></span><span class="farrow">+</span>
  <span class="fnode hot">Physics ms<small>Bullet step</small></span><span class="farrow">+</span>
  <span class="fnode hot">Animations ms<small>action evaluation</small></span><span class="farrow">+</span>
  <span class="fnode hot">Render ms<small>cull + draw + GPU</small></span><span class="farrow">+</span>
  <span class="fnode">Overhead<small>audio, OS, swap</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">= frame time</span>
</div>

<h3>The discipline</h3>
<ol>
<li><em>Game &rarr; Show Framerate &amp; Profile</em> &mdash; always-on during development (Ch. 03).</li>
<li><strong>Budget per phase</strong> (Ch. 03 table): logic 4 / physics 3 / anim 2 / render 6 / other 1.6 ms.</li>
<li>When a phase exceeds: <em>binary-search the cause</em> &mdash; hide half the enemies; still slow? The other half. 6 experiments &le; 20 minutes, always conclusive.</li>
<li>Fix by architecture (counts, frequencies, states) before micro-optimization &mdash; a 5% Python tweak never beats removing 30 polling sensors.</li>
</ol>

<div class="callout tip"><div class="co-label">&#9733 Tip — the two-machine rule</div>
<p>Keep one machine <em>below</em> your target spec. Optimizing on the dev beast hides everything; the potato machine is the frame-budget conscience of the project.</p></div>
` },

{ ch: 12, t: "Publishing Your Open Game", h: `
<h3>Shipping is a feature</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Artifact</th><th>Contents</th><th>License note</th></tr></thead>
<tbody>
<tr><td>Game (runtime)</td><td>Standalone player + data (Ch. 05 export)</td><td>Your code license (MIT/GPL)</td></tr>
<tr><td>Sources .blend</td><td>Everything: assets, logic, scripts</td><td>CC-BY for content (attribution flows)</td></tr>
<tr><td>CREDITS + LICENSE</td><td>Every asset: author, source, license</td><td>Mandatory for CC compliance</td></tr>
<tr><td>README / manual</td><td>Controls, install, troubleshooting</td><td>&mdash;</td></tr>
</tbody></table></div>

<ul>
<li><strong>Distribution:</strong> site + itch/marketplace mirrors; checksums for the archive (open projects get mirrored &mdash; checksums make mirrors verifiable).</li>
<li><strong>Versioning:</strong> tag releases; keep save-file compatibility notes if you persist data (globalDict structures).</li>
<li><strong>The final playtest:</strong> fresh OS account, no dev tools, download-from-scratch install. Anything that only works on your machine doesn&rsquo;t work.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Publishing sources <em>is marketing</em>: the open game&rsquo;s community, tutorials, and ports all come from the .blend being public. Your future collaborators are reading your file structure right now &mdash; all those Ch. 04 naming rules were secretly this slide.</p></div>
` },

{ ch: 12, t: "Chapter 12 — Pitfalls & Best Practices", h: `
<h3>Production-scale review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Absolute-name logic in groups</strong> &mdash; instances fight over one target or crash name-less levels.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>States as decoration.</strong> If every state contains all bricks, you built a slow property-gate farm. States earn their keep by <em>excluding</em> logic.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Streaming without freeing</strong> &mdash; LibLoad leaks; pair every load with a LibFree plan.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Unlicensed assets in the ship folder.</strong> The license audit is a release blocker, not a footnote.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Groups as prefabs, modules as kits,</strong> one brain module per character, transitions in one choke point.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Sleep states + sensor frequency + event-driven logic:</strong> AI cost scales with player attention.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>One scene, two viewports</strong> for split-screen; halve the render budget per view.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Playable-from-day-one, weekly builds, sources published</strong> &mdash; process is a technology.</p></div>
</div>
</div>
` },

{ ch: 12, t: "Chapter 12 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>State audit:</strong> take your Ch. 06 enemy&rsquo;s property-gate columns and port them to a 4-state machine (IDLE/PATROL/CHASE/DEAD). Count live bricks per state before/after.</li>
<li><strong>Couch co-op Pumpkin Run:</strong> two players, one keyboard, viewports side-by-side; shared score, competitive timer.</li>
<li><strong>Streaming level pack:</strong> split Ch. 05&rsquo;s yard into level_01/level_02 files; LibLoad between them with a loading screen; verify memory returns after LibFree.</li>
<li><strong>Hibernation pass:</strong> add sleep states + frequency skips to every AI you&rsquo;ve built in this course; profile the frame time delta and write it down.</li>
<li><strong>Open-source yours:</strong> package any course project as a CC-BY release: runtime, sources, CREDITS, README &mdash; the full artifact set.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>License, credit, and publish an open game correctly &#10003;</li>
<li>Share logic with groups and linked libraries at team scale &#10003;</li>
<li>Design with the State system and manage AI budgets &#10003;</li>
<li>Build modular levels and stream them at runtime &#10003;</li>
<li>Ship split-screen, ragdolls, particles, and profile-driven optimization &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Part III complete — next</div>
<p>Part IV is your desk reference: Chapter 13 indexes the entire engine — materials, lamps, UV, logic bricks, physics, sound, Python, performance — for daily lookup during real work.</p></div>
` }

);
