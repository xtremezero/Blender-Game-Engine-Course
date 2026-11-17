/* Part I — Chapter 01: Foreword / About This Book (7 slides) */

SLIDES.push(

{ ch: 1, t: "The Complete Game Development Curriculum", k: "cover", h: `
<div class="cover-badge">Interactive Curriculum &middot; 357 Slides &middot; 14 Chapters</div>
<h1>Game Development:<br><span class="hl">From 3D Foundations</span> to Engine Architecture</h1>
<p class="cover-sub">A rigorous, production-minded course built on the classic open-source game-engine curriculum — modeling, real-time materials, logic systems, physics, GLSL shaders, networking, and character animation.</p>
<div class="cover-meta">
  <span class="chip acc">4 Parts &middot; 14 Chapters</span>
  <span class="chip">Logic Bricks &amp; Python</span>
  <span class="chip">Bullet Physics</span>
  <span class="chip">GLSL Shaders</span>
  <span class="chip">Networking</span>
  <span class="chip">Armature Animation</span>
</div>
<div class="cover-hint">Navigate with <kbd>&#8592;</kbd> <kbd>&#8594;</kbd> &middot; <kbd>T</kbd> contents &middot; <kbd>O</kbd> overview &middot; <kbd>?</kbd> help</div>
` },

{ ch: 1, t: "Part I — Foundations & Quickstart", k: "divider", h: `
<div class="div-label">Part</div>
<div class="div-part">I</div>
<div class="div-title">Foundations &amp; Quickstart</div>
<div class="div-chapters">
  <span class="chip acc">01 &middot; Foreword</span>
  <span class="chip">02 &middot; Quickstart</span>
  <span class="chip">03 &middot; Introduction to 3D &amp; Game Engines</span>
  <span class="chip">04 &middot; Blender Basics</span>
</div>
` },

{ ch: 1, t: "Chapter 01 — Foreword", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">01</div>
  <div class="ch-info">
    <h1>Foreword</h1>
    <div class="ch-sub">About This Book — who it is for, where it came from, and how to use it</div>
  </div>
</div>
<div class="ch-goals">
  <h4>In this chapter</h4>
  <ul>
    <li>The origin and philosophy of this curriculum</li>
    <li>A short history of the Blender Game Engine (BGE)</li>
    <li>Where BGE lives today: UPBGE and transferable concepts</li>
    <li>Prerequisites, toolchain, and study conventions</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>7</b> slides</span>
  <span class="ch-stat"><b>0</b> code files</span>
  <span class="ch-stat">difficulty <b>&#9734&#9734&#9734&#9734&#9734</b></span>
</div>
` },

{ ch: 1, t: "About This Curriculum", h: `
<h3>What this is</h3>
<p>A <em>complete, modular course in real-time game development</em> structured after the classic open-source curriculum of the same name — the one that taught thousands of developers to build playable games entirely inside a free 3D suite. Every chapter of the original syllabus is expanded here with modern engineering depth: architecture diagrams, commented code, shader source, physics tuning tables, and performance budgets.</p>

<h3>How it is organized</h3>
<div class="cols2">
  <div class="card">
    <h4>Learn by building</h4>
    <p>Parts I&ndash;III are project-driven. Each chapter ships a playable artifact: a mapped face, a running game, a pinball table, a networked prototype. Theory is introduced at the moment a project needs it.</p>
  </div>
  <div class="card">
    <h4>Reference-grade depth</h4>
    <p>Part IV is a full reference: logic brick catalogs, physics panel tables, the Python API surface, GLSL built-ins, performance checklists, and a glossary — designed for lookup during development.</p>
  </div>
</div>

<div class="callout note"><div class="co-label">&#9432 Note</div>
<p>This deck is an original educational work inspired by the structure of the classic open game-engine curriculum. Engine specifics reference the BGE-era API; Chapter 14 maps every concept to modern engines (UPBGE, Godot, Unity) so nothing you learn here is throwaway.</p></div>
` },

{ ch: 1, t: "The Blender Game Engine — A History", h: `
<h3>From physics demo to production engine</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Year</th><th>Milestone</th><th>Why it mattered</th></tr></thead>
<tbody>
<tr><td>2000</td><td>Erwin Coumans integrates <em>Bullet</em>-style physics into Blender</td><td>Blender gains a real-time physics solver</td></tr>
<tr><td>2005</td><td>BGE reborn as open source after Ton Roosendaal&rsquo;s campaign</td><td>Game engine shipped inside every Blender build</td></tr>
<tr><td>2008</td><td><em>Yo Frankie!</em> (Apricot project) produced on BGE</td><td>Proof that an open pipeline could ship a game</td></tr>
<tr><td>2011&ndash;15</td><td>GLSL pipeline, states, Python 3, 2D filters</td><td>BGE becomes a competent modern runtime</td></tr>
<tr><td>2018</td><td>BGE removed from Blender 2.8</td><td>Community forks continue the lineage</td></tr>
<tr><td>Today</td><td><em>UPBGE</em> maintains and modernizes the engine</td><td>Same concepts: sensors &rarr; controllers &rarr; actuators</td></tr>
</tbody></table></div>

<h3>Why study an engine like this?</h3>
<ul>
<li><strong>Transparency:</strong> the logic-brick model exposes the game loop explicitly — nothing is hidden behind an editor abstraction.</li>
<li><strong>Minimalism:</strong> you learn what every engine actually needs: input, simulation, rendering, audio, and the glue between them.</li>
<li><strong>Transferable architecture:</strong> sensors/controllers/actuators map 1:1 to input polling, behavior logic, and effect dispatch in any engine.</li>
</ul>
` },

{ ch: 1, t: "Legacy and Modern Context", h: `
<h3>Where the technology lives now</h3>
<div class="cols3">
  <div class="card hot"><h4>UPBGE</h4><p>The direct descendant: a Blender fork keeping BGE alive with modern Bullet, GLSL 3.x, and Python 3 API. Everything in this course runs there nearly unchanged.</p></div>
  <div class="card"><h4>Godot</h4><p>Nodes + signals mirror sensors + logic. Its physics and scene instancing map cleanly onto concepts from Chapters 5&ndash;8 and 12.</p></div>
  <div class="card"><h4>Unity / Unreal</h4><p>Components = actuators in disguise. The performance discipline from Chapter 13 applies verbatim: draw calls, texture memory, logic throttling.</p></div>
</div>

<h3>Concepts you will carry to any engine</h3>
<div class="flow">
  <span class="fnode">Game loop</span><span class="farrow">&rarr;</span>
  <span class="fnode">Fixed-step physics</span><span class="farrow">&rarr;</span>
  <span class="fnode">Entity + property model</span><span class="farrow">&rarr;</span>
  <span class="fnode">Event messaging</span><span class="farrow">&rarr;</span>
  <span class="fnode">Shader pipeline</span><span class="farrow">&rarr;</span>
  <span class="fnode">Asset packaging</span>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>When following along historically, use <em>Blender 2.79</em> for pixel-perfect legacy tutorials or <em>UPBGE 0.3x</em> for modern hardware. The <strong>architecture never changes</strong> — only menu locations and Python module names shift slightly.</p></div>
` },

{ ch: 1, t: "Prerequisites, Toolchain & Conventions", h: `
<h3>What you need</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Tool</th><th>Role</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Blender 2.7x / UPBGE</td><td>Modeling + game runtime</td><td>One application builds <em>and</em> runs the game</td></tr>
<tr><td>GIMP or Krita</td><td>2D textures</td><td>Used heavily in Chapter 02 (2D applications)</td></tr>
<tr><td>Audacity</td><td>Sound editing</td><td>Chapters 5 &amp; 7 (game audio)</td></tr>
<tr><td>Python 3 (optional)</td><td>External tooling, network tests</td><td>Chapters 9, 11, 13</td></tr>
<tr><td>Text editor</td><td>Python scripts, GLSL</td><td>Any editor with syntax highlighting</td></tr>
</tbody></table></div>

<h3>Conventions used in this deck</h3>
<ul>
<li><kbd>Key</kbd> marks keyboard input; <span class="chip">Right-click</span> marks mouse actions.</li>
<li>Python is written against the classic <span class="chip acc">bge</span> module (UPBGE-compatible).</li>
<li>GLSL targets the GLSL 1.20-style runtime pipeline of BGE-era hardware shaders.</li>
</ul>

<div class="callout term"><div class="co-label">&#9670 Callout Legend</div>
<ul>
<li><strong>Best Practice</strong> — do this in production code.</li>
<li><strong>Pitfall</strong> — a classic mistake; avoid it.</li>
<li><strong>Tip</strong> — workflow accelerator.</li>
<li><strong>Term</strong> — vocabulary you must own.</li>
</ul></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div>
<p>Skipping Part I because you &ldquo;know Blender.&rdquo; Chapter 03&rsquo;s terminology (normals, UV space, logic model) is load-bearing for every later chapter — the projects assume you own it.</p></div>
` }

);
