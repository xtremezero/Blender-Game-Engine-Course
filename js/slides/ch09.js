/* Part III — Chapter 09: Blender Basic Network Setup (18 slides incl. Part III divider) */

SLIDES.push(

{ ch: 9, t: "Part III — Advanced Systems & Projects", k: "divider", h: `
<div class="div-label">Part</div>
<div class="div-part">III</div>
<div class="div-title">Advanced Systems &amp; Projects</div>
<div class="div-chapters">
  <span class="chip acc">09 &middot; Network Setup</span>
  <span class="chip">10 &middot; Character Animation</span>
  <span class="chip">11 &middot; Flying Buddha</span>
  <span class="chip">12 &middot; Yo Frankie!</span>
</div>
` },

{ ch: 9, t: "Chapter 09 — Blender Basic Network Setup", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">09</div>
  <div class="ch-info">
    <h1>Basic Network Setup</h1>
    <div class="ch-sub">Server / Client Implementation &mdash; Python sockets, protocols, and syncing a game over the wire</div>
  </div>
</div>
<div class="ch-goals">
  <h4>You will build a working multiplayer layer</h4>
  <ul>
    <li>Understand topologies: client-server vs peer-to-peer</li>
    <li>Write a threaded TCP chat/lobby server in pure Python</li>
    <li>Write the game client: send transforms, receive events</li>
    <li>Design a packet protocol and serialize game state</li>
    <li>Dead reckoning and interpolation to hide latency</li>
    <li>Security, testing, and debugging of game networks</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>18</b> slides</span>
  <span class="ch-stat"><b>~5</b> hours</span>
  <span class="ch-stat">difficulty <b>&#9733&#9733&#9733&#9733&#9734</b></span>
</div>
` },

{ ch: 9, t: "Topologies — Client-Server vs P2P", h: `
<h3>Who talks to whom</h3>
<div class="cols2">
  <div class="card hot">
    <h4>Client-Server <span class="chip acc">this chapter</span></h4>
    <p>All clients connect to one authoritative server. Clients send intents; the server simulates and broadcasts truth.</p>
    <ul>
      <li>&#10003 Authority: one clock, one truth, cheat-resistant</li>
      <li>&#10003 Simple client code</li>
      <li>&#10005 Server costs bandwidth + hosting</li>
      <li>&#10005 One machine&rsquo;s latency affects everyone</li>
    </ul>
  </div>
  <div class="card">
    <h4>Peer-to-Peer</h4>
    <p>Each player&rsquo;s machine talks to every other&rsquo;s directly (full mesh) or via a elected host.</p>
    <ul>
      <li>&#10003 No server to run or pay for</li>
      <li>&#10003 LAN parties: minimal latency</li>
      <li>&#10005 Everyone must trust everyone&rsquo;s simulation</li>
      <li>&#10005 NAT/firewall traversal is its own career</li>
    </ul>
  </div>
</div>

<h3>The vocabulary</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Term</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Authoritative</td><td>Whose simulation is &ldquo;the truth&rdquo; when machines disagree</td></tr>
<tr><td>Tick rate</td><td>How often the server simulates/broadcasts (e.g., 20 Hz)</td></tr>
<tr><td>Latency (ping)</td><td>Round-trip time, ms</td></tr>
<tr><td>Jitter</td><td>Variance of latency &mdash; often hurts more than raw ping</td></tr>
<tr><td>Snapshot</td><td>A serialized copy of relevant world state</td></tr>
</tbody></table></div>
` },

{ ch: 9, t: "The Engine&rsquo;s Network Surface", h: `
<h3>What the runtime gives you (and doesn&rsquo;t)</h3>
<ul>
<li>The BGE <em>era</em> shipped a built-in network feature &mdash; the <strong>NetworkMessage sensors/actuators</strong> &mdash; but it broadcast over the local scene/listeners only; it was never an internet transport.</li>
<li>Real networking happens in <strong>Python</strong>: the runtime&rsquo;s embedded interpreter has the full standard library, including <span class="chip acc">socket</span>, <span class="chip acc">threading</span>, <span class="chip acc">struct</span>, <span class="chip acc">json</span>.</li>
<li>Modern equivalents: Godot&rsquo;s MultiplayerAPI, Unity Netcode, Unreal replication &mdash; all descend from the exact patterns this chapter builds by hand.</li>
</ul>

<h3>The architecture we&rsquo;ll build</h3>
<div class="flow">
  <span class="fnode">Game client<small>game logic (Python in-engine)</small></span><span class="farrow">&harr;</span>
  <span class="fnode hot">net thread<small>sockets, blocking I/O, runs beside the loop</small></span><span class="farrow">&harr;</span>
  <span class="fnode hot">Server<small>standalone Python process</small></span>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p><strong>Never do blocking network I/O inside the game loop.</strong> A <span class="chip acc">recv()</span> that waits 200 ms drops your frame rate to 5 fps. The network runs on its own thread; the game loop exchanges data with it through thread-safe queues (standard <span class="chip acc">queue.Queue</span>).</p></div>
` },

{ ch: 9, t: "Sockets Primer — TCP & UDP", h: `
<h3>The two transports</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>TCP</th><th>UDP</th></tr></thead>
<tbody>
<tr><td>Guarantee</td><td>Every byte arrives, in order, exactly once</td><td>Nothing &mdash; datagrams may vanish, duplicate, reorder</td></tr>
<tr><td>Connection</td><td>Stream (handshake, established)</td><td>Send-and-forget packets</td></tr>
<tr><td>Latency behavior</td><td>Retransmits stall the stream (head-of-line blocking)</td><td>Old packets are simply late &mdash; perfect for stale positions</td></tr>
<tr><td>Game use</td><td><strong>Lobby, chat, login, turns</strong></td><td><strong>Position streams, transient events</strong></td></tr>
</tbody></table></div>

<h3>Sockets in five calls</h3>
<pre data-lang="python"><code>import socket

# TCP server                       # TCP client
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.bind(("0.0.0.0", 9999))        # own the port
srv.listen(4)                      # backlog of waiting clients
conn, addr = srv.accept()          # blocking: wait for one
data = conn.recv(4096)             # read bytes

cli = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
cli.connect(("10.0.0.5", 9999))    # three-way handshake
cli.sendall(b"hello")              # guaranteed delivery

# UDP: same import, SOCK_DGRAM; sendto/recvfrom, no connection
u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
u.sendto(b"pos", ("10.0.0.5", 9998))</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Sending positions over TCP: one lost packet stalls <em>every</em> update behind it while the OS retransmits &mdash; everyone teleports in bursts. Rule of thumb: <strong>state that expires &rarr; UDP; state that must not be lost &rarr; TCP.</strong></p></div>
` },

{ ch: 9, t: "Protocol Design — Packets", h: `
<h3>Define the wire format before writing code</h3>
<p>A protocol is a table: <strong>message id &rarr; fields &rarr; types</strong>. Ours (game: two players collect pumpkins cooperatively!):</p>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>ID</th><th>Message</th><th>Direction</th><th>Fields</th></tr></thead>
<tbody>
<tr><td>1</td><td>HELLO</td><td>C &rarr; S</td><td>name (string), version (int)</td></tr>
<tr><td>2</td><td>WELCOME</td><td>S &rarr; C</td><td>player_id (int), tick_rate (int)</td></tr>
<tr><td>3</td><td>STATE</td><td>S &rarr; C (20 Hz)</td><td>seq (int), players[]: id, x, y, z, ry, anim</td></tr>
<tr><td>4</td><td>MOVE</td><td>C &rarr; S (20 Hz)</td><td>x, y, z, ry (player&rsquo;s believed position)</td></tr>
<tr><td>5</td><td>PICKUP</td><td>S &rarr; C</td><td>item_id, by_player</td></tr>
<tr><td>6</td><td>CHAT</td><td>C &harr; S</td><td>text (string)</td></tr>
</tbody></table></div>

<h3>Why binary beats JSON for state</h3>
<pre data-lang="python"><code>import struct

# STATE for ONE player:  pack -&gt; 21 bytes, unpack -&gt; tuple
# id: unsigned byte, x/y/z: float32, ry: float32, anim: unsigned byte
blob = struct.pack("&lt;BffffB", player_id, x, y, z, rot_y, anim_state)
player_id, x, y, z, rot_y, anim_state = struct.unpack("&lt;BffffB", blob)

# Same data as JSON: ~110 bytes + parse cost. At 20 Hz &times; 8 players
# that difference is 14 KB/s vs 75 KB/s of pure overhead.</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Version the protocol: the HELLO carries <span class="chip acc">version</span>, the server rejects mismatches. Nothing is worse than debugging &ldquo;teleporting players&rdquo; that is actually <em>two clients speaking different protocols</em>.</p></div>
` },

{ ch: 9, t: "Serialization — Pickle & Its Dangers", h: `
<h3>The tempting shortcut</h3>
<pre data-lang="python"><code>import pickle
blob = pickle.dumps({"id": 3, "pos": (1.0, 2.0, 3.0)})   # any object &rarr; bytes
msg  = pickle.loads(blob)                                 # bytes &rarr; object</code></pre>

<div class="cols2">
<div>
<h4>Pickle is great for</h4>
<ul>
<li>Local saves (your own files, trusted)</li>
<li>Tooling between your own processes</li>
<li>Prototyping <em>on a trusted LAN</em></li>
</ul>
</div>
<div>
<h4>Pickle must never see</h4>
<ul>
<li><strong>The public internet.</strong> <span class="chip acc">pickle.loads()</span> on untrusted bytes = <strong>arbitrary code execution</strong> &mdash; it&rsquo;s not &ldquo;hacking,&rdquo; it&rsquo;s the documented feature</li>
<li>Mod-friendly games (any client is an attacker)</li>
</ul>
</div>
</div>

<div class="callout pitfall"><div class="co-label">&#9888 Security — the classic exploit</div>
<p>An attacker sends <span class="chip">pickle</span> data that constructs <span class="chip acc">os.system("...")</span> under your server&rsquo;s privileges. Your authoritative server just executed their command. Production games use explicit binary (struct) or schema&rsquo;d formats (protobuf) &mdash; data can never become code.</p></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>This chapter&rsquo;s rule: <strong>struct for state, JSON only for lobby/chat text</strong> (and size-capped), pickle only in dev tools you control end-to-end.</p></div>
` },

{ ch: 9, t: "Server Architecture — Threads", h: `
<h3>One process, many hands</h3>
<div class="flow">
  <span class="fnode hot">accept loop<small>main thread: handshake, HELLO/WELCOME</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">client thread &times; N<small>read MOVE/CHAT from each client</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">sim thread<small>20 Hz: advance world, build STATE, broadcast</small></span>
</div>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Concern</th><th>Solution</th></tr></thead>
<tbody>
<tr><td>Shared state between threads</td><td>One <span class="chip acc">world</span> dict + a <span class="chip acc">threading.Lock</span> around every access</td></tr>
<tr><td>Dead client detection</td><td>Reader thread exits on error &rarr; sim thread removes player, broadcasts PART</td></tr>
<tr><td>Clean shutdown</td><td>Global <span class="chip acc">running</span> flag; threads are daemons; server socket closes</td></tr>
<tr><td>Broadcast efficiency</td><td>One STATE packet built once, <span class="chip acc">sendall</span> to every client (TCP) &mdash; or one UDP sendto loop</td></tr>
</tbody></table></div>

<div class="callout term"><div class="co-label">&#9670 Term — Lock &amp; race condition</div>
<p>Two threads touching the same dict while one is mid-update = a <strong>race condition</strong> (state tears). A <strong>lock</strong> makes &ldquo;read-modify-write&rdquo; atomic. Rule of thumb for this scale: lock at the <em>statement</em> level, keep critical sections tiny, never call <span class="chip">send()</span> while holding the world lock.</p></div>
` },

{ ch: 9, t: "Server Implementation — Part 1", h: `
<h3>Lobby: accept, hello, welcome</h3>
<pre data-lang="python"><code># server.py -- run with: python server.py   (pure stdlib, no game engine)
import socket, threading, struct, time, queue

HOST, PORT, TICK = "0.0.0.0", 9999, 1.0 / 20.0     # 20 Hz sim tick
world = {"players": {}}                             # id -&gt; dict(pos, ry, anim, name, sock, dirty)
lock  = threading.Lock()
running = True

def send_packet(sock, pkt):
    """Length-prefixed TCP framing: 4-byte length + payload."""
    sock.sendall(struct.pack("&lt;I", len(pkt)) + pkt)

def lobby():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((HOST, PORT)); srv.listen(8)
    print("Server listening on", PORT)
    while running:
        try:
            conn, addr = srv.accept()
        except OSError:
            break
        threading.Thread(target=handshake, args=(conn, addr), daemon=True).start()

def handshake(conn, addr):
    # minimal HELLO/WELCOME over the framed stream, then join the world
    raw = recv_packet(conn)                       # HELLO: id, version, name
    msg_id  = raw[0]                              # == 1
    version = struct.unpack("&lt;I", raw[1:5])[0]
    name    = raw[5:].decode("utf-8", "ignore")
    if version != 1:
        conn.close(); return                      # protocol mismatch (slide 5)
    with lock:
        pid = (max(world["players"]) + 1) if world["players"] else 1
        world["players"][pid] = {"sock": conn, "name": name,
                                 "pos": (0.0, 0.0, 0.0), "ry": 0.0, "anim": 0}
    send_packet(conn, struct.pack("&lt;BiI", 2, pid, 20))   # WELCOME: id, tick rate
    threading.Thread(target=reader, args=(conn, pid), daemon=True).start()</code></pre>
<p class="small">Note the <strong>length prefix</strong>: TCP is a byte stream with no message boundaries &mdash; framing is your job.</p>
` },

{ ch: 9, t: "Server Implementation — Part 2", h: `
<h3>Readers and the simulation tick</h3>
<pre data-lang="python"><code># server.py (continued)
def recv_packet(sock):
    hdr = sock.recv(4)
    if len(hdr) &lt; 4: raise ConnectionError("closed")
    (n,) = struct.unpack("&lt;I", hdr)
    return sock.recv(n)

def reader(conn, pid):
    """Per-client thread: consume MOVE(4) and CHAT(6)."""
    try:
        while running:
            pkt = recv_packet(conn)
            if pkt[0] == 4:                                   # MOVE
                x, y, z, ry = struct.unpack("&lt;ffff", pkt[1:17])
                with lock:
                    p = world["players"][pid]
                    p.update(pos=(x, y, z), ry=ry, anim=pkt[17])
            elif pkt[0] == 6:                                 # CHAT -&gt; relay
                with lock:
                    players = list(world["players"].items())
                for _, q in players:
                    send_packet(q["sock"], pkt)
    except (ConnectionError, OSError, KeyError):
        pass
    finally:
        with lock:
            world["players"].pop(pid, None)
            print("player", pid, "left")

def simulator():
    """20 Hz authoritative tick: build one STATE, send to everyone."""
    seq = 0
    while running:
        t0 = time.time()
        with lock:
            snapshot = [(pid, p["pos"][0], p["pos"][1], p["pos"][2], p["ry"], p["anim"])
                        for pid, p in world["players"].items()]
            targets = [(p["sock"],) for p in world["players"].values()]
        pkt = struct.pack("&lt;BI", 3, seq)
        pkt += struct.pack("&lt;B", len(snapshot))
        for pid, x, y, z, ry, anim in snapshot:
            pkt += struct.pack("&lt;BffffB", pid, x, y, z, ry, anim)
        for (sock,) in targets:
            try: send_packet(sock, pkt)
            except OSError: pass
        seq += 1
        time.sleep(max(0.0, TICK - (time.time() - t0)))    # fixed-rate loop (Ch. 03!)</code></pre>
` },

{ ch: 9, t: "Client Implementation — Part 1", h: `
<h3>The network thread (engine-side)</h3>
<pre data-lang="python"><code># netclient.py -- a text block in the .blend; imported by game logic
import socket, struct, threading, queue

class NetClient:
    def __init__(self, host, port, name):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((host, port))
        self.inbox  = queue.Queue()        # network -&gt; game (thread-safe!)
        self.outbox = queue.Queue()        # game -&gt; network
        self.pid = None
        self.running = True
        self._hello(name)
        threading.Thread(target=self._writer, daemon=True).start()
        threading.Thread(target=self._reader, daemon=True).start()

    def _hello(self, name):
        pkt = struct.pack("&lt;BI", 1, 1) + name.encode("utf-8")   # HELLO, v1
        self._send(pkt)
        msg = self._recv()                                       # WELCOME
        self.pid = struct.unpack("&lt;B", msg[1:2])[0]

    def _writer(self):
        while self.running:
            try: pkt = self.outbox.get(timeout=0.25)
            except queue.Empty: continue
            try: self._send(pkt)
            except OSError: self.running = False

    def _reader(self):
        try:
            while self.running:
                self.inbox.put(self._recv())        # STATE/CHAT/PICKUP land here
        except (ConnectionError, OSError):
            self.running = False</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Queues, not shared variables: the game loop <span class="chip acc">get()</span>s whole packets &mdash; no locks in game code, no torn reads, and a natural place to drop stale packets if the network outruns the frame rate.</p></div>
` },

{ ch: 9, t: "Client Implementation — Part 2", h: `
<h3>Meeting the game loop</h3>
<pre data-lang="python"><code># netgame.py -- module controller (Always sensor on game_state)
import bge, netclient, struct

net = None

def init():                      # runs once (tap Always + property check)
    global net
    net = netclient.NetClient("10.0.0.5", 9999, "player_one")
    bge.logic.globalDict["net"] = net

def update():
    if not (net and net.running):
        return                                   # TODO: show &lsquo;disconnected&rsquo; HUD

    # 1) drain server packets
    try:
        while True:
            pkt = net.inbox.get_nowait()
            if pkt[0] == 3:                      # STATE
                apply_state(pkt)
            elif pkt[0] == 5:                    # PICKUP -&gt; despawn locally
                item_id = struct.unpack("&lt;B", pkt[1:2])[0]
                bge.logic.sendMessage("net_despawn", str(item_id))
    except Exception:
        pass                                     # queue drained

    # 2) send our MOVE at 20 Hz (every 3rd logic tick)
    own = bge.logic.getCurrentScene().objects["player"]
    own["net_t"] -= 1
    if own["net_t"] &lt;= 0:
        own["net_t"] = 3
        x, y, z = own.worldPosition
        _, ry, _ = own.worldOrientation.to_euler()
        net.outbox.put(struct.pack("&lt;BffffB", 4, x, y, z, ry, own["anim"]))

def apply_state(pkt):                             # STATE -&gt; remote players
    scene = bge.logic.getCurrentScene()
    remotes = scene.objects["remotes"]
    count = struct.unpack("&lt;B", pkt[5:6])[0]
    for i in range(count):
        off = 6 + i * 18
        pid, x, y, z, ry, anim = struct.unpack("&lt;BffffB", pkt[off:off+18])
        if pid == net.pid: continue              # skip ourselves
        node = remotes.children.get("remote_%d" % pid) or spawn_remote(pid)
        node["target"] = ((x, y, z), ry)          # interpolation reads this (next slide)</code></pre>
` },

{ ch: 9, t: "Dead Reckoning — Hiding Latency", h: `
<h3>Predict what the server will say</h3>
<p>Between STATE packets (50 ms at 20 Hz) other players are blind spots. Fill them with <strong>dead reckoning</strong>: keep integrating last known velocity.</p>

<pre data-lang="python"><code># the core idea -- integrate last-known motion:
predicted = last_pos + last_vel * dt</code></pre>
<pre data-lang="python"><code># on each remote player, every logic tick:
own.worldPosition += own["last_vel"] * (1.0 / 60.0)</code></pre>

<h3>The correction problem</h3>
<div class="cols2">
<div>
<p><strong>Naive snap:</strong> teleport to the server&rsquo;s truth &mdash; correct, ugly, reads as stutter.</p>
<p><strong>Smooth converge:</strong> steer toward truth at bounded speed:</p>
</div>
<div>
<pre data-lang="python"><code>err = target - own.worldPosition
if err.length &lt; 0.5:
    own.worldPosition += err * 0.2       # small: glide
else:
    own.worldPosition += err * 0.5       # big: catch up fast
    # (and trust the correction's velocity next time)</code></pre>
</div>
</div>

<div class="callout term"><div class="co-label">&#9670 Term — Dead reckoning</div>
<p>Estimating current state from last-known state plus motion: position + velocity (+ acceleration, + turn rate for vehicles &mdash; SubRacer would need all three). Used by every networked game since the 1990s, and by ships for centuries before that.</p></div>
` },

{ ch: 9, t: "Interpolation & Entity Buffering", h: `
<h3>The professional trick: render 100 ms in the past</h3>
<p>Snapshots arrive jittery (20&plusmn;10 ms). Instead of reacting instantly, <strong>buffer them and interpolate between the two most recent past snapshots</strong> &mdash; trading 100 ms of delay for buttery motion:</p>

<pre data-lang="python"><code># remote player controller -- buffer + interpolate
import bge

BUFFER_DELAY = 0.10    # render this far behind the newest data

def update():
    own = bge.logic.getCurrentController().owner
    buf = own["snapshots"]           # list of (t, pos, ry), newest last

    render_t = own["net_clock"] - BUFFER_DELAY
    # find bracketing snapshots s0 &lt; render_t &lt;= s1
    for s0, s1 in zip(buf, buf[1:]):
        if s0[0] &lt;= render_t &lt;= s1[0]:
            a = (render_t - s0[0]) / max(1e-6, s1[0] - s0[0])   # 0..1
            pos = s0[1].lerp(s1[1], a)                # mathutils lerp
            own.worldPosition = pos
            # angle lerp via quaternion slerp for ry (Ch. 03 rotation math)
            break</code></pre>

<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Technique</th><th>Delay cost</th><th>Smoothness</th></tr></thead>
<tbody>
<tr><td>Snap to packet</td><td>0</td><td>Stutter under any jitter</td></tr>
<tr><td>Dead reckoning only</td><td>0</td><td>Smooth, drifts on turns</td></tr>
<tr><td><strong>Buffered interpolation</strong></td><td>~100 ms</td><td>Buttery, standard for remote entities</td></tr>
<tr><td>Prediction + reconciliation (local player)</td><td>0 (predicted)</td><td>Complex; the competitive-FPS standard</td></tr>
</tbody></table></div>
` },

{ ch: 9, t: "Event Messaging — Shots, Hits, Items", h: `
<h3>Discrete events vs continuous state</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>State stream (STATE/MOVE)</th><th>Events (PICKUP, HIT)</th></tr></thead>
<tbody>
<tr><td>Nature</td><td>Continuous, expires</td><td>Discrete, must not be lost</td></tr>
<tr><td>Transport</td><td>UDP (or TCP 20 Hz)</td><td>TCP (or UDP + ack)</td></tr>
<tr><td>Missing one</td><td>Next packet fixes it</td><td>Permanent desync &mdash; needs reliability</td></tr>
</tbody></table></div>

<h3>The golden rule of authoritative events</h3>
<div class="flow">
  <span class="fnode">Client shoots<small>sends INTENT (not &lsquo;hit!&rsquo;)</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">Server validates<small>ammo? cooldown? range? LOS?</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Broadcast SHOT/HIT<small>everyone replays the outcome</small></span>
</div>

<pre data-lang="python"><code># server-side validation sketch (inside a handler)
def on_shot(pid, pkt):
    with lock:
        p = world["players"][pid]
        now = time.time()
        if p["ammo"] &lt;= 0 or now - p["last_shot"] &lt; 0.45:   # cheat checks!
            return                                          # silently drop
        p["ammo"] -= 1; p["last_shot"] = now
    broadcast(struct.pack("&lt;BBff", 7, pid, aim_x, aim_y))  # replayable event</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall — trusting the client</div>
<p>Any message of the form &ldquo;I hit player 3 for 50 damage&rdquo; from a client is an invitation to cheat. Clients send <strong>perceptions and intents</strong>; the server decides <strong>outcomes</strong>. Every competitive exploit in history lives in the gap when developers forget this.</p></div>
` },

{ ch: 9, t: "Latency, Jitter & Compensation", h: `
<h3>Numbers to design against</h3>
<div class="stats">
  <div class="stat"><b>&lt;30 ms</b><span>LAN / good region</span></div>
  <div class="stat"><b>50&ndash;100 ms</b><span>cross-country</span></div>
  <div class="stat"><b>150 ms+</b><span>transcontinental</span></div>
  <div class="stat"><b>&plusmn;30 ms</b><span>typical jitter</span></div>
</div>

<h3>Design moves that survive latency</h3>
<ul>
<li><strong>Predict locally:</strong> your own character moves instantly on your screen (prediction); the server corrects drift silently (reconciliation).</li>
<li><strong>Lag-compensate hits:</strong> server briefly rewinds target positions to the shooter&rsquo;s view time when validating a hit &mdash; the &ldquo;I shot him!&rdquo; feeling, preserved.</li>
<li><strong>Generous hitboxes + forgiveness windows:</strong> easier than rewinding time (Ch. 06&rsquo;s invuln grace is the same mercy, latency-flavored).</li>
<li><strong>Hide it in animation:</strong> 150&ndash;300 ms wind-ups absorb network delay inside anticipation frames &mdash; players literally cannot perceive latency shorter than the animation.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Measure with the <em>player&rsquo;s</em> clock: show a ping readout early in development. You cannot tune what you cannot see, and &ldquo;feels laggy&rdquo; reports without numbers are unactionable.</p></div>
` },

{ ch: 9, t: "Security — The Attacker&rsquo;s View", h: `
<h3>Threat model for a small game server</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Attack</th><th>Vectors</th><th>Mitigation</th></tr></thead>
<tbody>
<tr><td>Protocol abuse</td><td>Forged packets, impossible values (speed 9999, NaN positions)</td><td>Validate every field server-side; clamp; sanitize</td></tr>
<tr><td>Flooding</td><td>PACKET/second storms, giant packets</td><td>Rate limits per connection; max packet size; drop + kick</td></tr>
<tr><td>Code injection</td><td><strong>pickle.loads</strong> on client data</td><td>Never pickle. struct/JSON only (slide 6)</td></tr>
<tr><td>Credential theft</td><td>Passwords over plaintext</td><td>TLS (ssl module wraps sockets) or auth tokens &mdash; even for toys, hash passwords</td></tr>
<tr><td>IP exposure</td><td>Server visible to scanners</td><td>Bind to VPN/LAN for playtests; firewall the port in production</td></tr>
</tbody></table></div>

<pre data-lang="python"><code># hardening snippet: size + rate guard in recv_packet
MAX_PKT = 4096
def recv_packet(sock, budget):
    hdr = sock.recv(4)
    (n,) = struct.unpack("&lt;I", hdr)
    if n &gt; MAX_PKT:                       # size guard
        raise ProtocolError("oversized packet")
    if budget.spend() is False:            # token bucket: N packets/sec
        raise ProtocolError("flooding")
    return sock.recv(n)</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Assume every byte from the network is hostile <em>and malformed</em>. Validation code is not overhead; it is the difference between a crash report and a security incident.</p></div>
` },

{ ch: 9, t: "Testing & Debugging Networks", h: `
<h3>You cannot debug what you cannot observe</h3>
<div class="cols2">
<div>
<h4>Tools</h4>
<ul>
<li><strong>Console logging both sides</strong> &mdash; every packet type, seq, size (print is fine at this scale).</li>
<li><strong>Wireshark</strong> &mdash; see the actual bytes; filter by port; learn to read your own protocol on the wire.</li>
<li><strong>Fault injection:</strong> a proxy script that delays/drops/reorders packets between client and server &mdash; 30 lines, finds 90% of desyncs.</li>
<li><strong>Simulated latency:</strong> <span class="chip acc">time.sleep(random.uniform(0.02, 0.08))</span> before forwarding.</li>
</ul>
</div>
<div>
<h4>The test ladder</h4>
<ol>
<li>Loopback (127.0.0.1) &mdash; logic correctness, zero net effects.</li>
<li>LAN, two machines &mdash; real interfaces, near-zero latency.</li>
<li>Internet + latency injection &mdash; 80/150/300 ms profiles.</li>
<li>Hostile profiles &mdash; 5% loss, 40 ms jitter, packet floods.</li>
<li>Soak test &mdash; clients connected for an hour; watch memory &amp; connections.</li>
</ol>
</div>
</div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Testing only on loopback: everything works at 0 ms/0% loss, nothing does at 90 ms/2% loss. The <em>first</em> test after &ldquo;it runs&rdquo; should be latency injection, while the code is still fresh.</p></div>
` },

{ ch: 9, t: "Chapter 09 — Pitfalls, Best Practices & Summary", h: `
<h3>The network review</h3>
<div class="cols2">
<div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Blocking sockets in the game loop</strong> &mdash; one stalled recv tanks the frame rate. Network thread + queues.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>No TCP framing</strong> &mdash; treating the stream as messages. Length-prefix everything or you will parse half-packets.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Pickle on the wire</strong> &mdash; remote code execution as a service. struct/JSON only.</p></div>
<div class="callout pitfall"><div class="co-label">&#9888 Pitfall</div><p><strong>Trusting client claims</strong> (&ldquo;I hit him&rdquo;). Intents up, outcomes down.</p></div>
</div>
<div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Authoritative server</strong> + clients that render, predict, and forgive.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>UDP for state, TCP for events/lobby;</strong> interpolate remotes ~100 ms in the past.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Versioned protocol,</strong> validation on every field, rate + size caps.</p></div>
<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p><strong>Test with injected latency/loss</strong> from day one &mdash; not on launch week.</p></div>
</div>
</div>

<h3>Exercises</h3>
<ol>
<li>Add <strong>PING/PONG</strong> (id 7/8) and display RTT on the HUD (bge.Message → text object).</li>
<li>Add <strong>UDP position stream</strong> beside the TCP lobby &mdash; the hybrid every real game ships.</li>
<li>Convert Pumpkin Run co-op: pickups broadcast with PICKUP; keep the scorer server-side.</li>
<li>Add a <strong>watchdog</strong>: server kicks players silent for 5 s (reader timeout), broadcasts PART.</li>
</ol>

<div class="callout tip"><div class="co-label">&#9733 Next Up</div>
<p>Chapter 10 animates characters properly: armatures, skinning, weight painting, actions, and playing them all in-engine.</p></div>
` }

);
