/* Part III — Chapter 11: Flying Buddha (20 slides) */

SLIDES.push(

{ ch: 11, t: "Chapter 11 — Flying Buddha", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">11</div>
  <div class="ch-info">
    <h1>Flying Buddha</h1>
    <div class="ch-sub">A Memory Game &middot; Logic Bricks &middot; Message Architecture &middot; The Shuffle Python Script</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will build a complete memory game</h4>
  <ul>
    <li>Design a matching-pairs board as a logic system</li>
    <li>Master the message bus: cards, referee, HUD all decoupled</li>
    <li>Implement mouse-picked card flipping with animation</li>
    <li>Detect matches two ways: bricks and Python</li>
    <li>Write the shuffle script &mdash; randomness done right</li>
    <li>Structure intro / playing / won states and scoring</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>20</b> slides</span>
  <span class="ch-stat"><b>~3</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9734&#9734&#9734</b></span>
</div>
` },

{ ch: 11, t: "Design — The Memory Game", h: `
<h3>Rules in one breath</h3>
<p><em>16 flying buddha cards face down (8 pairs). Flip two. Match? They stay revealed (+100). No match? They flip back after a second. Clear the board before the timer dies; fewer mistakes = higher score.</em></p>

<div class="cols3">
  <div class="card"><h4>Core loop</h4><p>Observe &rarr; remember &rarr; flip &rarr; resolve (match/miss) &rarr; repeat. 3-second iterations, pure information gameplay.</p></div>
  <div class="card"><h4>Systems</h4><p>Cards (identical!), a referee (turn logic), the board (layout), HUD (score/time/moves), states (intro/play/won/lost).</p></div>
  <div class="card"><h4>Why this project</h4><p>Zero physics, zero enemies &mdash; the purest possible exercise in <strong>logic architecture</strong>: states, messages, and data.</p></div>
</div>

<h3>The entity list (everything in the game)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Object</th><th>Count</th><th>Role</th></tr></thead>
<tbody>
<tr><td>card (group instance!)</td><td>16</td><td>One shared prefab: mesh + flip logic + properties</td></tr>
<tr><td>referee</td><td>1</td><td>Turn state machine: picks, matches, misses (invisible)</td></tr>
<tr><td>board_root</td><td>1</td><td>4&times;4 grid parent; shuffler repositions children</td></tr>
<tr><td>game_state / HUD scene</td><td>1 + overlay</td><td>Score, timer, moves (Ch. 06 overlay pattern)</td></tr>
</tbody></table></div>
` },

{ ch: 11, t: "Scene & Asset Plan", h: `
<h3>The board</h3>
<ol>
<li><strong>Card back:</strong> 1&times;1.4 m plane, ornate texture (all 16 identical &mdash; information hides in the flip, not the back).</li>
<li><strong>Card face:</strong> 8 buddha pose images (mirror the plane, face material swapped or texture swapped at runtime).</li>
<li><strong>Grid:</strong> board_root empty; cards parented at 1.2 m spacing (4&times;4). Camera: orthographic-ish front view (Ch. 03 projections) &mdash; a board game wants a flat, readable frame.</li>
</ol>

<h3>The famous &ldquo;flying&rdquo; part</h3>
<ul>
<li>Cards hover: gentle bob + tilt (the Ch. 05 bob action, per-card offset so they don&rsquo;t bob in unison &mdash; offset via per-instance start frame).</li>
<li>Flip = the interaction drama; match = cards float UP and fade (despawn celebration); miss = shake then flip back.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Make <strong>one</strong> card prefab (group) and instance 15 copies &mdash; Ch. 06&rsquo;s doctrine, and this game&rsquo;s sanity: fix a bug in the group once, all 16 cards are fixed. Sixteen hand-built cards are sixteen future inconsistencies.</p></div>

<div class="callout term"><div class="co-label">&#9670 Term — Group instance</div>
<p>A placed copy of a grouped object set that stays linked to the group&rsquo;s contents: edit the group, every instance updates. The era&rsquo;s closest native &ldquo;prefab.&rdquo;</p></div>
` },

{ ch: 11, t: "The Message System — Primer", h: `
<h3>The engine&rsquo;s postal service</h3>
<div class="flow">
  <span class="fnode hot">Message actuator<small>subject: "flip"&nbsp; body: "card_07"</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">next logic tick<small>delivered asynchronously</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Message sensor<small>subject filter: "flip"</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">logic fires<small>body read in Python</small></span>
</div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Actuator (send)</th><th>Sensor (receive)</th></tr></thead>
<tbody>
<tr><td>Subject</td><td>Required &mdash; the &ldquo;address&rdquo;</td><td>Filter: only this subject triggers (blank = any)</td></tr>
<tr><td>Body</td><td>Optional payload string</td><td><span class="chip acc">msg.bodies</span> list in Python</td></tr>
<tr><td>To</td><td>Everybody / named object / property filter</td><td>&mdash;</td></tr>
</tbody></table></div>

<h3>The three messaging laws</h3>
<ol>
<li><strong>Asynchronous:</strong> messages sent this tick arrive <em>next</em> tick. Plan one-frame delays (they&rsquo;re usually a feature: natural input debounce).</li>
<li><strong>Broadcast by default:</strong> any object can listen &mdash; HUD, sound, debug log, all subscribed to the same event. That&rsquo; the decoupling superpower.</li>
<li><strong>Strings only:</strong> bodies are text. Numbers must be serialized (and validated &mdash; Ch. 09 habits).</li>
</ol>
` },

{ ch: 11, t: "Card Objects — Properties & Face-Down Logic", h: `
<h3>The card&rsquo;s data model (on the group)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Property</th><th>Type</th><th>Example</th><th>Read by</th></tr></thead>
<tbody>
<tr><td>face_id</td><td>Int</td><td>0&ndash;7</td><td>Referee match check</td></tr>
<tr><td>card_id</td><td>Int</td><td>0&ndash;15</td><td>Messages name cards precisely</td></tr>
<tr><td>state</td><td>String</td><td>"down" | "flipping" | "up" | "matched"</td><td>Every rule gates on this</td></tr>
<tr><td>flip_t</td><td>Timer</td><td>&mdash;</td><td>Miss-delay bookkeeping</td></tr>
</tbody></table></div>

<h3>Face-down rendering</h3>
<ul>
<li><strong>Two-sided card trick:</strong> card back on one plane (normal +Z), face on a mirrored plane (&minus;Z, backface-culled &mdash; Ch. 03 normals) &mdash; flipping the parent shows one and hides the other automatically.</li>
<li><strong>Alternative:</strong> single plane, <em>replaceMesh</em> on flip (Ch. 06 actuator) or texture swap in Python.</li>
<li><strong>Visibility actuator</strong> (Ch. 03 table) toggles children for the match-float celebration.</li>
</ul>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Stateless cards (only a &ldquo;flipped&rdquo; bool): double-clicks, mid-flip re-flips, and matched cards flipping again are <em>guaranteed</em> bugs. The <span class="chip acc">state</span> string is the bouncer at every logic door &mdash; no state, no entry.</p></div>
` },

{ ch: 11, t: "Interaction — Mouse Picking", h: `
<h3>Click a card in 3D</h3>
<div class="flow">
  <div class="fgroup"><span class="glabel">CARD</span>
    <span class="fnode hot">Mouse Over<small>fires when cursor is over THIS card</small></span>
    <span class="farrow">&rarr;</span>
    <span class="fnode">AND</span>
    <span class="farrow">&rarr;</span>
    <span class="fnode hot">Highlight<small>hover glow: emit bump / cursor color</small></span>
  </div>
</div>
<div class="flow">
  <span class="fnode">Mouse Over (still over)</span><span class="farrow">+</span>
  <span class="fnode">Left Button (tap)</span><span class="farrow">&rarr;</span>
  <span class="fnode">AND + state == "down"</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Message: "pick" body=card_id &rarr; referee</span>
</div>

<h3>Why the card messages the referee (instead of flipping itself)</h3>
<ul>
<li>The <strong>referee owns turn rules</strong>: is the board accepting picks? Is this the first or second pick?</li>
<li>The card is a dumb, reusable terminal: input &rarr; message. All policy centralizes &mdash; the strategy-pattern lesson of Ch. 06, applied to UI.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p><strong>Hover feedback is not decoration:</strong> a card that visibly responds before the click teaches the affordance. Emit bump on hover, cursor change, or a 5% scale &mdash; players must know what&rsquo;s clickable from across the room.</p></div>
` },

{ ch: 11, t: "The Flip — Animation & Message Round-Trip", h: `
<h3>The referee&rsquo;s reply</h3>
<div class="flow">
  <span class="fnode">Card: "pick" &rarr;</span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Referee<small>validates: state playing, picks &lt; 2</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Message "reveal" &rarr; that card<small>body: card_id</small></span>
  <span class="farrow">&rarr;</span>
  <span class="fnode hot">Card: Action act_flip (Play, 10 fr)</span>
  <span class="farrow">&rarr;</span>
  <span class="fnode">state = "up"</span>
</div>

<h3>Wiring the reply on the card</h3>
<ul>
<li>Message sensor (subject <span class="chip acc">reveal</span>) &rarr; AND &rarr; <strong>Action actuator: act_flip</strong> (Play, blendin 4) + Property actuator <span class="chip acc">state = "flipping"</span>.</li>
<li>Flip ends (frame 10): the action&rsquo;s last frame sets <span class="chip acc">state = "up"</span> &mdash; via the Frame Property (<span class="chip acc">anim_frame</span>) + Property sensor, or a 10-tick Delay. Then the card <em>messages back</em>: <span class="chip acc">"revealed" body=card_id,face_id</span>.</li>
<li>The referee now knows the flip <em>completed</em> &mdash; animations and rules stay in sync even if you retime the flip later (animation-as-data, Ch. 10).</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip — the round-trip pattern</div>
<p>Request &rarr; validate &rarr; act &rarr; <strong>acknowledge</strong>. The ack (&ldquo;revealed&rdquo;) is what makes the system robust to retiming. Any multi-step interaction (dialogs, purchases, crafting) is this same shape.</p></div>
` },

{ ch: 11, t: "Match Detection — Brick Edition", h: `
<h3>The referee as a state machine of properties</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Referee property</th><th>Type</th><th>Role</th></tr></thead>
<tbody>
<tr><td>picks</td><td>Int 0&ndash;2</td><td>How many cards currently face up</td></tr>
<tr><td>first_id / first_face</td><td>Int</td><td>The first pick&rsquo;s identity</td></tr>
<tr><td>second_face</td><td>Int</td><td>For the comparison</td></tr>
<tr><td>resolve_t</td><td>Timer</td><td>Miss display delay (1.0 s)</td></tr>
<tr><td>matches / moves</td><td>Int</td><td>Score + HUD</td></tr>
</tbody></table></div>

<h3>The comparison column (bricks)</h3>
<div class="flow">
  <span class="fnode hot">Message: "revealed" (2nd)</span><span class="farrow">&rarr;</span>
  <span class="fnode">Property: first_face == second_face</span><span class="farrow">&rarr;</span>
  <span class="fnode">MATCH branch: "match" &rarr; both cards</span>
  <span class="farrow">else &rarr;</span>
  <span class="fnode">MISS branch: resolve_t = 1.0</span>
</div>
<ul>
<li><strong>MATCH:</strong> messages both cards (<span class="chip acc">"match" body=card_id</span>) &rarr; each floats up + Visibility-fades; referee: matches +1, picks=0.</li>
<li><strong>MISS:</strong> Timer counts down &rarr; at 0, messages both cards <span class="chip acc">"hide"</span> &rarr; cards play flip-back, state &rarr; "down". picks=0.</li>
</ul>
` },

{ ch: 11, t: "Match Detection — Python Edition", h: `
<h3>The same referee, one honest module</h3>
<pre data-lang="python"><code># referee.py -- Message sensor "revealed" on referee (Always for tick)
import bge

def on_revealed():
    cont = bge.logic.getCurrentController()
    own  = cont.owner
    card_id, face_id = map(int, cont.sensors["revealed"].bodies[-1].split(","))

    if own["picks"] == 0:
        own["first_id"], own["first_face"] = card_id, face_id
        own["picks"] = 1
    else:
        own["moves"] += 1
        own["picks"] = 2
        if face_id == own["first_face"]:
            bge.logic.sendMessage("match", str(own["first_id"]))   # both by id
            bge.logic.sendMessage("match", str(card_id))
            own["matches"] += 1
            own["picks"] = 0
            bge.logic.sendMessage("score", "100")                   # HUD listens
            if own["matches"] == own["pairs_total"]:
                bge.logic.sendMessage("board_clear")               # win state
        else:
            own["miss_t"] = 1.0          # Timer: when it hits 0 -&gt; hide both
            own["second_id"] = card_id

def tick():
    cont = bge.logic.getCurrentController()
    own = cont.owner
    if own["picks"] == 2 and own["miss_t"] &lt;= 0:
        bge.logic.sendMessage("hide", str(own["first_id"]))
        bge.logic.sendMessage("hide", str(own["second_id"]))
        own["picks"] = 0                # board open for the next attempt</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>The Python referee is ~25 lines and replaces 6+ brick columns of property plumbing. Bricks shine for <em>wiring</em> (sensor&darr;message), Python for <em>rules with data</em> &mdash; this game is the cleanest demonstration in the course.</p></div>
` },

{ ch: 11, t: "The Shuffle Script — Complete", h: `
<h3>Fisher-Yates on the board</h3>
<pre data-lang="python"><code># shuffle.py -- on board_root (Message sensor: "deal" / at intro)
import bge, random

PAIRS = 8          # 8 faces -&gt; 16 cards

def deal():
    scene = bge.logic.getCurrentScene()
    board = scene.objects["board_root"]

    # 1) build the deck: [0,0,1,1,2,2,...,7,7]
    deck = [i for i in range(PAIRS) for _ in range(2)]

    # 2) Fisher-Yates shuffle: every permutation equally likely
    for i in range(len(deck) - 1, 0, -1):
        j = random.randint(0, i)
        deck[i], deck[j] = deck[j], deck[i]

    # 3) deal faces to the card instances (grid order)
    cards = sorted(board.children, key=lambda c: c["card_id"])
    for card, face in zip(cards, deck):
        card["face_id"] = face
        card["state"] = "down"
        card.setVisible(True, True)              # reset from any state
        card["flip_t"] = card["miss_t"] = 0

    bge.logic.sendMessage("dealt")               # referee: picks=0, timers reset</code></pre>

<h3>Why Fisher-Yates (and not sort-by-random)</h3>
<ul>
<li><span class="chip acc">deck.sort(key=random)</span> is <em>biased</em> &mdash; not all arrangements are equally likely, so some layouts repeat suspiciously. Fisher-Yates is provably uniform: every one of 16!/(2!)&sup8; layouts is equiprobable.</li>
<li>It&rsquo;s O(n) and 4 lines. There is no excuse for biased shuffles in front of a probability-literate public.</li>
</ul>
` },

{ ch: 11, t: "Randomness & Seeding", h: `
<h3>Controlling chaos</h3>
<div class="cols2">
<div>
<h4>Reproducible builds (debugging!)</h4>
<pre data-lang="python"><code>import random
random.seed(42)      # same seed -&gt; same deck every run
deal()               # bug reproducible at 100% rate</code></pre>
<p>Seed from a debug property: <span class="chip acc">seed != 0 ? seed : None</span> &mdash; QA plays the exact board the bug report came from.</p>
</div>
<div>
<h4>True entropy when shipping</h4>
<pre data-lang="python"><code>random.seed()        # OS entropy (default on first import)
# or explicit: random.seed(time.time() + os.getpid())</code></pre>
<p>Watch for the classic: seeding with <span class="chip">time.time()</span> at second resolution &mdash; two players starting in the same second share a board.</p>
</div>
</div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Function</th><th>Returns</th><th>Game use</th></tr></thead>
<tbody>
<tr><td>random.randint(a, b)</td><td>Int, inclusive</td><td>Index picking</td></tr>
<tr><td>random.uniform(a, b)</td><td>Float</td><td>Variation (pitch, offset)</td></tr>
<tr><td>random.choice(seq)</td><td>Element</td><td>Power-up rolls</td></tr>
<tr><td>random.choices(w)</td><td>Weighted element</td><td>Ch. 06 spawn tables</td></tr>
<tr><td>random.shuffle(lst)</td><td>In-place</td><td>The deck (Fisher-Yates internally!)</td></tr>
</tbody></table></div>

<div class="callout note"><div class="co-label">&#9432 Note</div>
<p><span class="chip acc">random.shuffle(deck)</span> is the stdlib&rsquo;s Fisher-Yates &mdash; writing it out (previous slide) is for learning; shipping code may call it directly.</p></div>
` },

{ ch: 11, t: "Board Reset & Replayability", h: `
<h3>&ldquo;Play again&rdquo; as an architecture test</h3>
<div class="flow">
  <span class="fnode hot">Win / retry<small>Message: "deal"</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">shuffle.deal()<small>faces re-rolled, states reset</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">referee reset<small>picks, matches, moves, timers</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">HUD reset<small>score, timer</small></span>
</div>

<ul>
<li>Because every subsystem resets on <em>messages</em>, no system knows which others exist &mdash; adding a &ldquo;streak&rdquo; bonus means subscribing to existing events, not touching the referee.</li>
</ul>

<h3>Replayability upgrades (cheap, this architecture)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Feature</th><th>Change</th></tr></thead>
<tbody>
<tr><td>Difficulty tiers</td><td>PAIRS = 6/8/12 &mdash; one constant + board layout table</td></tr>
<tr><td>Peek power-up</td><td>Message &ldquo;reveal_all 2s&rdquo; &mdash; cards listen; referee pauses picks</td></tr>
<tr><td>Combo scoring</td><td>Matches without a miss multiply (referee state, message to HUD)</td></tr>
<tr><td>Best-score persistence</td><td><span class="chip acc">bge.logic.globalDict</span> + save file (Ch. 13)</td></tr>
</tbody></table></div>
` },

{ ch: 11, t: "Game States — Intro / Playing / Won / Lost", h: `
<h3>The scene-level machine (Ch. 12&rsquo;s warm-up)</h3>
<div class="flow">
  <span class="fnode hot">SCENE_INTRO<small>title, difficulty pick</small></span><span class="farrow">click &rarr;</span>
  <span class="fnode hot">SCENE_GAME<small>board + HUD overlay</small></span><span class="farrow">timer&le;0 &rarr;</span>
  <span class="fnode hot">SCENE_LOST<small>score, retry</small></span>
</div>
<div class="flow">
  <span class="fnode">SCENE_GAME</span><span class="farrow">board_clear &rarr;</span>
  <span class="fnode hot">SCENE_WON<small>time bonus, next tier</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">harder SCENE_GAME</span>
</div>

<h3>Implementation notes</h3>
<ul>
<li><strong>Timer lost condition:</strong> Timer property <span class="chip acc">time_left</span> &le; 0 &rarr; Property sensor &rarr; Scene actuator <em>Set</em> (Ch. 06&rsquo;s graph, reused verbatim).</li>
<li><strong>Input lock in transitions:</strong> the referee ignores <span class="chip acc">"pick"</span> unless <span class="chip acc">accepting = True</span> &mdash; set false on win/lose messages. Players <em>will</em> click during the transition; policy must be explicit.</li>
<li><strong>State as scene structure</strong> (separate scenes) is the coarsest, most robust machine; object-level states (next chapter) are for machines inside one scene.</li>
</ul>
` },

{ ch: 11, t: "Score, Timer & HUD", h: `
<h3>The overlay (Ch. 06 pattern, third use)</h3>
<pre data-lang="python"><code># hud.py -- on HUD text objects (Message sensor "score" / Always for timer)
import bge

def on_score():
    cont = bge.logic.getCurrentController()
    own = cont.owner
    for body in cont.sensors["score"].bodies:
        own["score"] += int(body)
    own.text = "SCORE %05d" % own["score"]

def on_moves():
    own = bge.logic.getCurrentController().owner
    own.text = "MOVES %02d" % own["moves"]      # fed by referee message

def on_timer():                                  # Always, on the clock text
    gs = bge.logic.getCurrentScene().objects["game_state"]
    t = max(0, gs["time_left"])
    own.text = "%d:%02d" % (t // 60, t % 60)
    if t &lt;= 10:
        own.color = (1.0, 0.3, 0.2, 1.0)        # last-10s warning color
    else:
        own.color = (1.0, 1.0, 1.0, 1.0)</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>HUD objects are <em>readers</em>: they subscribe to messages and render text &mdash; they never contain rules. When the design adds a combo multiplier, the scorer changes; the HUD doesn&rsquo;t even notice.</p></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Text objects re-generating meshes every tick (always-on updates): update <span class="chip acc">own.text</span> only when the value changes (compare before writing) &mdash; text mesh rebuild is real CPU.</p></div>
` },

{ ch: 11, t: "Audio Feedback", h: `
<h3>Sound as the memory aid</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Event (subject)</th><th>Sound</th><th>Wiring</th></tr></thead>
<tbody>
<tr><td>hover</td><td>soft tick</td><td>Card Mouse Over &rarr; Sound actuator</td></tr>
<tr><td>pick</td><td>page turn</td><td>Card pick message pulse</td></tr>
<tr><td>match</td><td>chime (rises with combo)</td><td>Referee "match" &rarr; HUD-scene player</td></tr>
<tr><td>miss</td><td>dull thud</td><td>Referee miss branch</td></tr>
<tr><td>board_clear</td><td>victory arpeggio</td><td>Referee win</td></tr>
<tr><td>time &lt; 10 s</td><td>tick-tock loop</td><td>Property sensor on time_left</td></tr>
</tbody></table></div>

<ul>
<li>Distinct <em>face identities</em> could even get distinct pitch signatures &mdash; an audio-easter-egg memory aid (players discover it around hour two; they love it).</li>
<li>Same-frame rule from Ch. 05: the chime lands the tick the match fires &mdash; via the same message, not a parallel timer.</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Tip</div>
<p>Every sound in this table hangs off an <em>existing message subject</em> &mdash; zero new logic. That&rsquo;s the dividend of the message architecture: new listeners are free.</p></div>
` },

{ ch: 11, t: "Polish — Game Feel for a Quiet Game", h: `
<h3>Juice without explosions</h3>
<div class="cols2">
<div>
<ul>
<li><strong>Stagger:</strong> intro deal lays cards with 0.05 s cascade (Delay chain or frame offsets) &mdash; the board &ldquo;builds itself.&rdquo;</li>
<li><strong>Anticipation:</strong> second-card flip is 30% slower than the first &mdash; tension is duration (Ch. 10 principles).</li>
<li><strong>Match float:</strong> matched pair rises + glows + fades over 0.6 s; the eye tracks the reward.</li>
<li><strong>Miss shake:</strong> 4-frame lateral wobble before flip-back &mdash; the &ldquo;no&rdquo; reads before the state change.</li>
</ul>
</div>
<div>
<ul>
<li><strong>Idle board:</strong> cards bob out-of-phase (slide 3) &mdash; the board breathes while you think.</li>
<li><strong>Camera drift:</strong> ±0.5&deg; slow sway (action on the camera) &mdash; flying serenity.</li>
<li><strong>Combo text:</strong> floating &ldquo;+200 STREAK!&rdquo; spawned at the matched card (addObject, Ch. 06).</li>
<li><strong>Last pair:</strong> slow-mo (timeScale via Python) for the final match &mdash; the bow on the run.</li>
</ul>
</div>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>A meditative game still needs <em>feedback density</em> &mdash; just softer. Every player action earns at least two responses (sound + motion) and every state change announces itself (HUD + board). Loud or quiet is style; present or absent is quality.</p></div>
` },

{ ch: 11, t: "Chapter 11 — Pitfalls & Best Practices", h: `
<h3>Logic-architecture review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Stateless cards.</strong> Without the state string, re-flips and double-picks run the board into undefined territory.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Cards making policy.</strong> The card that decides &ldquo;this counts as a match&rdquo; can&rsquo;t see the other card. Terminals report; referees decide.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Biased shuffle.</strong> sort-by-random produces suspicious boards. Fisher-Yates (or <span class="chip">random.shuffle</span>).</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Forgetting the reset path.</strong> A game that can&rsquo;t cleanly restart is a demo, not a game. &ldquo;Deal again&rdquo; is a first-class feature.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Messages as the API:</strong> subjects are your game&rsquo;s event catalog &mdash; write them down in the conventions block (pick/reveal/revealed/match/hide/deal/score).</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>One prefab, sixteen instances;</strong> groups keep the board uniform by construction.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Request&rarr;validate&rarr;act&rarr;acknowledge</strong> for every multi-step interaction.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Seeds for debugging, entropy for shipping</strong> &mdash; and know which one is active.</p></div>
</div>
</div>
` },

{ ch: 11, t: "Chapter 11 — Exercises & Summary", h: `
<h3>Exercises</h3>
<ol>
<li><strong>Three-of-a-kind mode:</strong> 18 cards, triples; referee holds two picks open &mdash; a data-structure change (picks list), not a new game.</li>
<li><strong>Sudden death:</strong> any miss ends the run &mdash; how little of the referee changes? (One branch.)</li>
<li><strong>Hint system:</strong> 3 uses per game; reveals one matching pair&rsquo;s locations for 1.5 s. Implement as a message the cards listen to.</li>
<li><strong>Seeded daily challenge:</strong> seed = the date (YYYYMMDD as int) &mdash; everyone plays the same board that day; persist best score per day in globalDict.</li>
<li><strong>Port to bricks only:</strong> replace referee.py with pure logic bricks. Count columns. Then explain to a colleague which version you&rsquo;d maintain and why.</li>
</ol>

<h3>You can now</h3>
<ul>
<li>Design a complete game as a message architecture &#10003;</li>
<li>Build reusable interactive prefabs (group instances) &#10003;</li>
<li>Implement mouse picking, flip animation, and round-trip protocols &#10003;</li>
<li>Write correct shuffles and manage randomness/seeding &#10003;</li>
<li>Structure scene-level states, HUDs, and audio feedback &#10003;</li>
</ul>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 12 studies a production: Yo Frankie! &mdash; the open game project&rsquo;s licensing, logic sharing, the State system, level construction, split-screen, and hard-won performance lessons.</p></div>
` }

);
