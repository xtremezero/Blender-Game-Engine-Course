/* Part IV — Chapter 13A: The BGE Reference — Materials & Rendering (26 slides) */

SLIDES.push(

{ ch: 13, t: "Part IV — Reference & Appendix", k: "divider", h: `
<div class="div-label">Part</div>
<div class="div-part">IV</div>
<div class="div-title">Reference &amp; Appendix</div>
<div class="div-chapters">
  <span class="chip acc">13 &middot; The BGE Reference</span>
  <span class="chip">14 &middot; Appendix &amp; Glossary</span>
</div>
` },

{ ch: 13, t: "Chapter 13 — The Reference", k: "chapter", h: `
<div class="ch-row">
  <div class="ch-num">13</div>
  <div class="ch-info">
    <h1>The Blender Game Engine Reference</h1>
    <div class="ch-sub">Materials &middot; Lamps &middot; UV Texturing &middot; Logic &middot; Physics &middot; Sound &middot; Performance &middot; Python &mdash; in two halves</div>
  </div>
</div>
<div class="ch-goals">
  <h4>Designed for daily lookup during real work</h4>
  <ul>
    <li><strong>13A (this half):</strong> materials, textures, UV, baking, lamps, shadows, world settings, 2D filters, GLSL uniforms, and the performance math</li>
    <li><strong>13B (next half):</strong> logic bricks in full, physics panels, Bullet constraints, sound, and the complete Python API surface</li>
    <li>Every table is terminal-accurate for the BGE 2.6&ndash;2.7x era and concept-accurate for UPBGE</li>
  </ul>
</div>
<div class="ch-stats">
  <span class="ch-stat"><b>52</b> slides</span>
  <span class="ch-stat">lookup <b>format</b></span>
</div>
` },

{ ch: 13, t: "Material Panel — Map", h: `
<h3>Where everything lives (Properties &rarr; Material)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Panel</th><th>Controls</th><th>Chapter context</th></tr></thead>
<tbody>
<tr><td>Preview</td><td>Material test sphere/hair previews</td><td>Editor sanity check only</td></tr>
<tr><td>Diffuse</td><td>Color, intensity, shader model (Lambert/Oren-Nayar/Toon/Minnaert)</td><td>Ch. 03, 05</td></tr>
<tr><td>Specular</td><td>Color, intensity, hardness, shader (CookTorr/Phong/Blinn/WardIso)</td><td>Ch. 03, 05</td></tr>
<tr><td>Shading</td><td>Ambient, Emit, Mirror(?), Translucency shadeless toggle</td><td>Ch. 03, 05</td></tr>
<tr><td>Transparency</td><td>Z-mask, alpha slider, ray/mask method</td><td>Ch. 02 alpha</td></tr>
<tr><td>Options / Game Settings</td><td>Backface culling, Alpha Clip/Sort/Blend, Shadow, Face Textures</td><td>Ch. 02, 05, 13</td></tr>
<tr><td>Shadow</td><td>Shadow buffering sizes, bias, clip start/end</td><td>This chapter</td></tr>
<tr><td>Strands / Volume / &hellip;</td><td>Hair/particles &mdash; mostly offline</td><td>&mdash;</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Reading order for a new material</div>
<p>Game Settings first (alpha mode, culling!) &rarr; Diffuse+Specular numbers &rarr; texture channels &rarr; shadow contribution. The Game Settings tab is the one that changes runtime behavior most per click.</p></div>
` },

{ ch: 13, t: "Diffuse Shaders — Reference", h: `
<h3>The four models and their knobs</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Model</th><th>Parameters</th><th>Light response</th><th>Pick for</th></tr></thead>
<tbody>
<tr><td><strong>Lambert</strong></td><td>(none beyond intensity/color)</td><td>dot(N,L) linear falloff</td><td>Default everything; matte surfaces</td></tr>
<tr><td><strong>Oren-Nayar</strong></td><td>Roughness (0&ndash;1)</td><td>Roughness spreads grazing light</td><td>Chalk, clay, concrete, dust</td></tr>
<tr><td><strong>Toon</strong></td><td>Size, Smooth (band widths)</td><td>Two discrete bands</td><td>Stylized/cel-shaded scenes</td></tr>
<tr><td><strong>Minnaert</strong></td><td>Darkness (0&ndash;1)</td><td>Edges darken (val < 0.5) or glow</td><td>Velvet, dusty stone, cloth</td></tr>
</tbody></table></div>

<h3>Runtime cost notes</h3>
<ul>
<li>All four are per-vertex in Multitexture; per-pixel in GLSL &mdash; but differences among them are a few ALU ops: choose by <em>look</em>, not cost.</li>
<li><strong>Shadeless</strong> (Shading panel) skips lighting entirely &mdash; the cheapest material alive; the honest version of TexFace in GLSL mode (UI, HUDs, glow props).</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Scene-wide consistency beats per-object cleverness: one diffuse model (Lambert) + varied <em>textures</em> reads more coherent than four shading models fighting for attention.</p></div>
` },

{ ch: 13, t: "Specular Shaders — Reference", h: `
<h3>The highlight quartet</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Model</th><th>Params</th><th>Highlight shape</th><th>Pick for</th></tr></thead>
<tbody>
<tr><td><strong>CookTorr</strong></td><td>Intensity, hardness, (spec color)</td><td>Soft, physically-inspired lobe</td><td>Default metals/plastics</td></tr>
<tr><td><strong>Phong</strong></td><td>Intensity, hardness</td><td>Classic tight round</td><td>Waxy skin, shiny paint (Ch. 05 pumpkin!)</td></tr>
<tr><td><strong>Blinn</strong></td><td>Intensity, hardness, IOR-ish bias</td><td>Phong-like, stabler at grazing angles</td><td>Glass, water, eyes</td></tr>
<tr><td><strong>WardIso</strong></td><td>Intensity, hardness, slope</td><td>Anisotropic streak</td><td>Brushed metal, hair</td></tr>
</tbody></table></div>

<h3>Hardness &rarr; material personality (cheat sheet)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Hardness</th><th>Reads as</th></tr></thead>
<tbody>
<tr><td>1&ndash;10</td><td>Soil, cloth, rubber</td></tr>
<tr><td>15&ndash;40</td><td>Wood, painted metal</td></tr>
<tr><td>50&ndash;100</td><td>Skin, wax, plastic</td></tr>
<tr><td>150&ndash;400</td><td>Chrome, glass, wet surfaces</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>One specular intensity for a whole scene: everything shines equally, nothing does. Vary intensity <em>and</em> hardness across material classes &mdash; that variance is most of &ldquo;material quality&rdquo; at runtime.</p></div>
` },

{ ch: 13, t: "Shading Modes — The Definitive Table", h: `
<h3>Game &rarr; Shading: pick your pipeline</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Capability</th><th>Texture Face</th><th>Multitexture</th><th>GLSL</th></tr></thead>
<tbody>
<tr><td>Texture projection</td><td>Face image only</td><td>Full UV channels</td><td>Full UV channels</td></tr>
<tr><td>Lighting granularity</td><td>None (unlit)</td><td>Per-vertex</td><td>Per-pixel</td></tr>
<tr><td>Diffuse/specular models</td><td>&mdash;</td><td>Approximated</td><td>All, per material</td></tr>
<tr><td>Normal maps</td><td>No</td><td>Dot3 approx. per-vertex</td><td>Yes, tangent-space per-pixel</td></tr>
<tr><td>Shadow receiving</td><td>No</td><td>Buffer shadows (basic)</td><td>Yes, per-pixel</td></tr>
<tr><td>Shadow casting control</td><td>No</td><td>Limited</td><td>Full (material Shadow toggle)</td></tr>
<tr><td>Color ramps / ramps</td><td>No</td><td>No</td><td>Yes (input/output ramps)</td></tr>
<tr><td>Custom shaders / 2D filters</td><td>No</td><td>No</td><td><strong>Yes</strong></td></tr>
<tr><td>Vertex colors</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Hardware floor</td><td>Any GPU</td><td>Any GPU</td><td>GLSL-class GPU</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>Decide on day one and write it into the conventions block. Mixed expectations are the root of every &ldquo;it looked different in game&rdquo; report. Production default: <strong>GLSL</strong>.</p></div>
` },

{ ch: 13, t: "GLSL Material Features — Reference", h: `
<h3>What GLSL mode unlocks on materials</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Feature</th><th>Where</th><th>Effect</th></tr></thead>
<tbody>
<tr><td>Ramps (input/output)</td><td>Shading panel &rarr; Ramps</td><td>Color-remap lighting result (toon banding, terminator tinting)</td></tr>
<tr><td>Color bands per light</td><td>Material &rarr; ramp stops</td><td>Art-directed shading response</td></tr>
<tr><td>Full normal mapping</td><td>Texture influence &rarr; Normal</td><td>Per-pixel detail (Ch. 05)</td></tr>
<tr><td>Specular maps</td><td>Texture influence &rarr; Specular color/intensity</td><td>Per-pixel shine</td></tr>
<tr><td>Hardness maps</td><td>Influence &rarr; Hardness</td><td>Per-pixel highlight size</td></tr>
<tr><td>Ambient occlusion (world AO)</td><td>World &rarr; Ambient Occlusion</td><td>Distance-based contact darkening</td></tr>
<tr><td>Environment lighting</td><td>World &rarr; Environment Lighting</td><td>Sky/gradient ambient contribution</td></tr>
<tr><td>Custom shader override</td><td>Shader node / Python setSource</td><td>Ch. 08 mist &amp; friends</td></tr>
<tr><td>2D filters</td><td>2D Filter actuator / Python</td><td>Fullscreen passes (see this chapter)</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 The one-two punch for &ldquo;why GLSL looks better&rdquo;</div>
<p>Per-pixel <strong>normal maps + ramps</strong>. Cheap, art-directable, transforms flat scenes into rich ones with zero extra geometry. Demonstrate it once and stakeholders never ask to downgrade the pipeline again.</p></div>
` },

{ ch: 13, t: "Texture Slots & Influence — Reference", h: `
<h3>The channel stack</h3>
<h3>Influence checkboxes (what the map writes)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Group</th><th>Targets</th><th>Typical map</th></tr></thead>
<tbody>
<tr><td>Diffuse</td><td>Color, Alpha, Intensity</td><td>albedo.png</td></tr>
<tr><td>Specular</td><td>Color, Intensity</td><td>spec.png</td></tr>
<tr><td>Mirror</td><td>Color, Reflectivity</td><td>env masks</td></tr>
<tr><td>Geometry (normal-side)</td><td><strong>Normal</strong> (space: Tangent/Object/World/Blender), Warp</td><td>normal.png (tangent!)</td></tr>
<tr><td>Geometry (displacement)</td><td>Displacement (offline), &mdash;</td><td>&mdash;</td></tr>
<tr><td>Shading</td><td>Ambient, Emit</td><td>glow.png</td></tr>
<tr><td>Geometry (other)</td><td>Alpha &rarr; used for transparency masks</td><td>leaf_alpha.png</td></tr>
</tbody></table></div>

<h3>Per-slot settings that matter at runtime</h3>
<ul>
<li><strong>Mapping &rarr; Coordinates:</strong> UV (default), Generated, Object, Reflection, Strand, Window (Ch. 03 table).</li>
<li><strong>Blend mode:</strong> Mix, Add, Multiply, Screen, Overlay, Difference, Divide, Lighten, Darken (next slide).</li>
<li><strong>Blend factor:</strong> 0&ndash;1 strength of the channel&rsquo;s contribution (the &ldquo;Opacity&rdquo; of the stack).</li>
<li><strong>Negate / Stencil / RGB&harr;Intensity:</strong> conditional plumbing; use sparingly and document.</li>
</ul>
` },

{ ch: 13, t: "Blend Types — Reference", h: `
<h3>How channels combine</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Blend</th><th>Formula (result per channel)</th><th>Classic use</th></tr></thead>
<tbody>
<tr><td>Mix</td><td>lerp(base, map, factor)</td><td>Everything default</td></tr>
<tr><td>Add</td><td>base + map</td><td>Glow/emit layers, light grime</td></tr>
<tr><td>Multiply</td><td>base &times; map</td><td>Dirt, grunge, AO bake, darkening</td></tr>
<tr><td>Screen</td><td>1 &minus; (1&minus;base)(1&minus;map)</td><td>Soft brightening, fog sheen</td></tr>
<tr><td>Overlay</td><td>contrast-preserving combine</td><td>Material variation, weathering</td></tr>
<tr><td>Divide</td><td>base / map</td><td>Rare; stain edges</td></tr>
<tr><td>Difference</td><td>|base &minus; map|</td><td>Debug/verification patterns</td></tr>
<tr><td>Lighten / Darken</td><td>max / min</td><td>Sparkle masks, shadow masks</td></tr>
</tbody></table></div>

<h3>The three-channel recipe that ships</h3>
<div class="flow">
  <span class="fnode">1&middot; diffuse<small>Mix &middot; 1.0</small></span><span class="farrow">+</span>
  <span class="fnode">2&middot; AO bake<small>Multiply &middot; 0.7</small></span><span class="farrow">+</span>
  <span class="fnode">3&middot; normal<small>Normal (Tangent)</small></span><span class="farrow">&rarr;</span>
  <span class="fnode hot">production material</span>
</div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Keep stacks shallow: 3 channels is plenty, 5 is a smell. Every blend is per-pixel math at runtime &mdash; spend channels where the camera looks, not where the artist was having fun.</p></div>
` },

{ ch: 13, t: "UV Texturing — Workflow Reference", h: `
<h3>The complete loop (consolidated from Chapters 02&ndash;05)</h3>
<div class="flow">
  <span class="fnode">Mark seams<small>Ctrl+R mindset: cut where unseen</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Unwrap<small>U menu</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Checker audit<small>density &amp; distortion</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Pack islands<small>UVs menu</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Export layout<small>paint under wires</small></span><span class="farrow">&rarr;</span>
  <span class="fnode">Paint &amp; reload<small>GIMP round-trip</small></span>
</div>

<h3>UV editor tools you&rsquo;ll actually use</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Operation</th><th>Shortcut / menu</th><th>Job</th></tr></thead>
<tbody>
<tr><td>Unwrap variants</td><td><kbd>U</kbd> in UV editor</td><td>Re-project selected islands</td></tr>
<tr><td>Pin vertices</td><td><kbd>P</kbd> / <kbd>Alt</kbd>+<kbd>P</kbd></td><td>Anchor points during re-unwrap</td></tr>
<tr><td>Live unwrap</td><td>UVs &rarr; Live Unwrap</td><td>Move pins, islands re-solve in real time</td></tr>
<tr><td>Average island scale</td><td>UVs menu</td><td>Equalize texel density across islands</td></tr>
<tr><td>Pack islands</td><td>UVs &rarr; Pack Islands</td><td>Auto-arrange into the square (margin!)</td></tr>
<tr><td>Grid snap / align</td><td>UVs menu</td><td>Straighten island edges</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Texel density rule of thumb</div>
<p>Hero assets (player camera gets close): &ge; 64 px per meter of surface. Background: 8&ndash;16 px/m. &ldquo;Average island scale&rdquo; then enforces it &mdash; the reason two objects textured by two artists still match.</p></div>
` },

{ ch: 13, t: "Unwrap Methods — Reference", h: `
<h3>The <kbd>U</kbd> menu, ranked by usefulness</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Method</th><th>How it flattens</th><th>Perfect for</th></tr></thead>
<tbody>
<tr><td><strong>Unwrap (angle-based)</strong></td><td>Solves stretching via angles between faces</td><td>Organics, most props &mdash; the default</td></tr>
<tr><td><strong>Unwrap (conformal)</strong></td><td>Preserves distances (LSCM-style)</td><td>Flat-ish sheets, machinery panels</td></tr>
<tr><td>Smart UV Project</td><td>Auto-cuts by angle threshold</td><td>Fast blockouts, hard-surface bakes</td></tr>
<tr><td>Lightmap Pack</td><td>Each face gets island space (no shared seams)</td><td>Baking AO/shadows (non-overlapping)</td></tr>
<tr><td>Project from View (Bounds)</td><td>What you see = what you get, scaled to fill</td><td>Ground planes, facades, decals</td></tr>
<tr><td>Cylinder / Sphere Projection</td><td>Wrap around axis</td><td>Tubes, columns, Ch. 06 tube sections</td></tr>
<tr><td>Reset / Average</td><td>Fallbacks</td><td>Recovery steps</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Smart UV Project on a character: hundreds of shredded islands, seams everywhere, painting misery. Auto-methods serve <em>blockouts and bakes</em>; anything you hand-paint deserves hand-marked seams.</p></div>
` },

{ ch: 13, t: "TexFace vs UV Materials — Settling It", h: `
<h3>The two image pipelines, precisely</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>TexFace (Texture Face)</th><th>UV texture channel (material)</th></tr></thead>
<tbody>
<tr><td>Assignment</td><td>Image assigned in UV editor to selected faces</td><td>Texture slot in the material, mapped to UVs</td></tr>
<tr><td>Lighting</td><td>None (unlit) in TexFace mode</td><td>Full material shading</td></tr>
<tr><td>Channels</td><td>One image per face-set</td><td>Full stack (normal/spec/emit/AO&hellip;)</td></tr>
<tr><td>When</td><td>Prototypes, billboards, &ldquo;I need a texture NOW&rdquo;</td><td>Everything shipping</td></tr>
</tbody></table></div>

<h3>The migration path (do this before shipping)</h3>
<ol>
<li>Select TexFace objects &rarr; material &rarr; add material.</li>
<li>Texture slot: type Image, load the TexFace image, Coordinates: UV, Influence: Color.</li>
<li>Enable <em>Face Textures</em> compatibility option <em>or</em> re-assign per-face images properly &mdash; verify in runtime each object kept its image.</li>
<li>Now you have lights, blends, normal maps &mdash; the whole stack.</li>
</ol>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Treat TexFace as scaffolding: great for the first hour of a prototype, converted before anyone else sees the build. &ldquo;It&rsquo;s unlit but we&rsquo;ll fix it later&rdquo; has killed many an art pass deadline.</p></div>
` },

{ ch: 13, t: "Baking — Reference", h: `
<h3>Precompute what doesn&rsquo;t change</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Bake type</th><th>Captures</th><th>Game use</th></tr></thead>
<tbody>
<tr><td><strong>Full Render</strong></td><td>Complete offline shade incl. lights</td><td>Static props in unlit pipelines</td></tr>
<tr><td>Ambient Occlusion</td><td>Corner/contact darkening</td><td>Multiplied AO channel (the classic)</td></tr>
<tr><td>Normals</td><td>High&rarr;low surface slope</td><td>Ch. 05 pumpkin lobes</td></tr>
<tr><td>Texture / Colors</td><td>Base maps flattened</td><td>Atlas consolidation</td></tr>
<tr><td>Shadow</td><td>Cast shadows only</td><td>Faked static sun shadows on mobile-tier</td></tr>
<tr><td>Displacement / Height</td><td>Elevation</td><td>Normal-map source, GLSL effects</td></tr>
</tbody></table></div>

<h3>Bake settings checklist</h3>
<ul>
<li><strong>Selected to Active</strong> for high&rarr;low normals: select high first? No &mdash; select <em>low (active) last</em>; margin 4&ndash;8 px; cage if gaps exist.</li>
<li><strong>Clear Image</strong> before re-baking; bake target = new image with UV-matched size (POT!).</li>
<li>Normal space: <strong>Tangent</strong>, +Y to OpenGL convention (match engine!).</li>
<li>AO: samples 16&ndash;32 for bake speed; bias small; normalize OFF preserves inter-object occlusion strength.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Baking is the original real-time trick (Ch. 03 survival kit): bake <strong>AO into everything static</strong>. It&rsquo;s free at runtime, works in every lighting mode, and alone lifts perceived quality ~20%.</p></div>
` },

{ ch: 13, t: "Lamps — Types Reference", h: `
<h3>The five emitters</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Lamp</th><th>Light shape</th><td>Falloff</th><th>Game behavior notes</th></tr></thead>
<tbody>
<tr><td><strong>Point</strong></td><td>Omnidirectional sphere</td><td>Distance-based (quad/linear)</td><td>The local pool light; GLSL per-pixel</td></tr>
<tr><td><strong>Sun</strong></td><td>Infinite parallel rays</td><td>None &mdash; rotation is everything</td><td>Outdoor key light; only rotation matters (Ch. 05!)</td></tr>
<tr><td><strong>Spot</strong></td><td>Cone (spot size + blend softness)</td><td>Distance</td><td>Flashlights, stage pools; supports buffers</td></tr>
<tr><td><strong>Hemi</strong></td><td>180&deg; sky dome</td><td>None</td><td>Ambient fill (GLSL treats per-vertex-ish; great value)</td></tr>
<tr><td><strong>Area</strong></td><td>Rectangle emitter</td><td>Physical</td><td>Mostly offline; approximated in-game</td></tr>
</tbody></table></div>

<h3>Choosing the outdoor/indoor defaults</h3>
<div class="cols2">
<div><ul><li><strong>Outdoor:</strong> Sun key (shadowed) + Hemi fill + world ambient. One Point for life near doorways.</li></ul></div>
<div><ul><li><strong>Indoor:</strong> Spots over workspaces (shadowed sparingly) + low-radius Points per lamp fixture + Hemi at 0.1 for navigation readability.</li></ul></div>
</div>
` },

{ ch: 13, t: "Lamps — Settings Deep Table", h: `
<h3>Per-lamp fields that survive into the runtime</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Field</th><th>Range</th><th>Effect</th><th>Performance coupling</th></tr></thead>
<tbody>
<tr><td>Energy / Color</td><td>0&ndash;&infin; / RGB</td><td>Intensity &amp; tint</td><td>Free</td></tr>
<tr><td>Distance</td><td>meters</td><td>Cutoff radius (Point/Spot)</td><td>Tighter = fewer lit pixels</td></tr>
<tr><td>Falloff (quad/linear/const)</td><td>enum</td><td>Attenuation curve</td><td>Free (shader math)</td></tr>
<tr><td>Spot Size / Blend</td><td>1&ndash;90&deg; / 0&ndash;1</td><td>Cone angle / edge softness</td><td>Tighter cone = fewer pixels</td></tr>
<tr><td>Negativity</td><td>bool</td><td>Subtracts light (darkmaker)</td><td>Free; eerie effect</td></tr>
<tr><td>Layer restriction</td><td>layers</td><td>Lights only objects on shared layers</td><td>Scene-section control</td></tr>
<tr><td>This layer only / diffuse/specular toggles</td><td>bool</td><td>Channel-level lighting control</td><td>Cheap art direction</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Set <strong>Distance honestly</strong> (the smallest radius that covers the fixture&rsquo;s real reach). Overlapping infinite-radius lamps is the most common &ldquo;washed out + slow&rdquo; scene bug &mdash; both symptoms, one cause.</p></div>
` },

{ ch: 13, t: "Shadows — Real-Time Reference", h: `
<h3>Buffer shadows (the game path)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Values</th><th>Effect &amp; guidance</th></tr></thead>
<tbody>
<tr><td>Shadow &amp; Spot Size</td><td>buffer 512&ndash;4096; cone angle</td><td>Resolution of the depth buffer; 1024 default, 2048 for hero close-ups</td></tr>
<tr><td>Shadow color</td><td>RGB</td><td>Shadow tint (never pure black outdoors &mdash; Ch. 05 cool shadows)</td></tr>
<tr><td>Clip Start / End</td><td>meters</td><td>Near/far of the shadow frustum &mdash; tighten for precision</td></tr>
<tr><td>Buffer type (classic/variance)</td><td>enum</td><td>Variance = soft with blur bias; classic = sharper, bias-sensitive</td></tr>
<tr><td>Bias / Bleed Bias / Soft size / Samples</td><td>small floats / counts</td><td>Acne &amp; peter-panning controls; raise bias until acne stops, no further</td></tr>
<tr><td>Material Shadow toggle</td><td>per material</td><td>Exclude casters (particles, first-person weapon)</td></tr>
</tbody></table></div>

<h3>The two universal shadow bugs</h3>
<ul>
<li><strong>Shadow acne:</strong> stripes on lit surfaces &mdash; bias too low or buffer too coarse.</li>
<li><strong>Peter-panning:</strong> objects floating above their shadows &mdash; bias too high. The dial between them is small; prefer resolution over extreme bias.</li>
</ul>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>One shadow-casting light per scene (the sun or one hero spot). Everything else bakes (previous slide) or fakes (blob shadow = a dark disc texture, era-faithful and free).</p></div>
` },

{ ch: 13, t: "World Settings — Ambient & Environment", h: `
<h3>Properties &rarr; World (mist, stars, ambient)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Effect at runtime</th><th>Tuning</th></tr></thead>
<tbody>
<tr><td>Ambient Color</td><td>Base illumination added to everything</td><td>Low (0.05&ndash;0.15); tinted opposite the key (Ch. 05 recipe)</td></tr>
<tr><td>Environment Lighting (GLSL)</td><td>Sky/gradient ambient contribution</td><td>Energy 0.3&ndash;0.7; Sky Color or white</td></tr>
<tr><td>Ambient Occlusion (GLSL)</td><td>Distance-based contact darkening</td><td>Distance 1&ndash;3 m, Energy 0.5&ndash;1; subtle!</td></tr>
<tr><td>Horizon / Zenith colors</td><td>Sky gradient (sky textures)</td><td>Match fog &amp; ambient for coherence</td></tr>
<tr><td>Stars</td><td>Procedural star field</td><td>Night scenes; cheap</td></tr>
<tr><td>Physics / Gravity</td><td>World physics (see 13B)</td><td>&mdash;</td></tr>
</tbody></table></div>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Ambient Occlusion energy cranked to &ldquo;look next-gen&rdquo;: corners eat the scene. AO is seasoning &mdash; if you notice it, halve it.</p></div>
` },

{ ch: 13, t: "Mist & Fog — Reference", h: `
<h3>World panel &rarr; Mist</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Parameter</th><th>Meaning</th><th>Typical</th></tr></thead>
<tbody>
<tr><td>Mist toggle</td><td>Enable distance fade</td><td>&mdash;</td></tr>
<tr><td>Start</td><td>Distance where fog begins</td><td>Near far-plane &divide; 4</td></tr>
<tr><td>Depth/End</td><td>Fully fogged distance</td><td>Match camera far clip</td></tr>
<tr><td>Height (min/max)</td><td>Vertical band instead of radial</td><td>Ground fog, valleys</td></tr>
<tr><td>Falloff (quad/linear/linear^2)</td><td>Curve between start/end</td><td>Quadratic = natural</td></tr>
<tr><td>Mist color</td><td>Fog color (world&rsquo;s)</td><td>Match horizon/sky</td></tr>
</tbody></table></div>

<h3>Built-in mist vs custom GLSL mist (Ch. 08)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>&nbsp;</th><th>World mist</th><th>GLSL (Ch. 08)</th></tr></thead>
<tbody>
<tr><td>Setup cost</td><td>6 fields</td><td>2 shaders + wiring</td></tr>
<tr><td>Per-material control</td><td>None</td><td>Anything (color ramps, height terms)</td></tr>
<tr><td>Can animate/interact</td><td>No</td><td>Uniforms every frame</td></tr>
<tr><td>Verdict</td><td>Default for depth cueing</td><td>When fog is a <em>feature</em></td></tr>
</tbody></table></div>
` },

{ ch: 13, t: "2D Filters — Reference", h: `
<h3>Fullscreen post-processing</h3>
<h3>The built-ins (2D Filter actuator)</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Filter</th><th>Look</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Blur / Sharpen</td><td>Soft focus / crunchy edges</td><td>Menus, hits</td></tr>
<tr><td>Dilation / Erode</td><td>Bright grows / shrinks</td><td>Glow-ish tricks</td></tr>
<tr><td>Gray Scale / Sepia</td><td>Desaturation / period tone</td><td>Flashbacks, spectator cams</td></tr>
<tr><td>Invert</td><td>Negative</td><td>Damage/flash states</td></tr>
<tr><td>Laplacian / Sobel / Prewitt</td><td>Edge detection</td><td>Cel outlines, &ldquo;detective mode&rdquo;</td></tr>
<tr><td>Twirl / Vignette</td><td>Swirl / edge darkening</td><td>Menace, focus</td></tr>
<tr><td>Custom filter</td><td><strong>Your GLSL fragment program</strong></td><td>Everything else</td></tr>
</tbody></table></div>

<h3>Custom filter wiring</h3>
<ul>
<li>Add a <strong>2D Filter actuator</strong> on any object: mode <em>Custom Filter</em>, pass number 0+, shader source = a GLSL <em>fragment-only</em> text block. Trigger it once with an Always (tap) sensor to enable; &ldquo;Disable Filter&rdquo; / &ldquo;Remove Filter&rdquo; modes turn passes off.</li>
</ul>
<pre data-lang="glsl"><code>// filter_tone.glsl -- custom 2D filter: warm grade + vignette in ONE pass
// The finished frame arrives as this engine-provided sampler:
uniform sampler2D bgl_RenderedTexture;

void main()
{
    vec2 uv = gl_TexCoord[0].xy;
    vec4 c = texture2D(bgl_RenderedTexture, uv);

    // warm grade: push shadows teal, highlights amber (cheap film look)
    c.rgb = mix(c.rgb * vec3(0.95, 1.02, 1.05),
                c.rgb * vec3(1.08, 1.0, 0.9), c.r);

    // vignette by distance from center
    float d = distance(uv, vec2(0.5));
    c.rgb *= smoothstep(0.85, 0.4, d);

    gl_FragColor = c;
}</code></pre>

<div class="callout pitfall"><div class="co-label">&#9888 Common Pitfall</div><p>Every 2D filter is a full-screen pass &mdash; resolution &times; your shader per frame. One is free-ish; three stacked will eat a low-end GPU. Compose in one custom filter when possible (do tone + vignette in a single pass).</p></div>
` },

{ ch: 13, t: "GLSL Built-ins & Uniforms — Reference", h: `
<h3>What the engine hands your shaders</h3>
<h3>Fixed-function compatible bindings</h3>
<pre data-lang="glsl"><code>// Vertex stage inputs (attribute-backed)
gl_Vertex, gl_Normal, gl_Color, gl_MultiTexCoord0..7
// Matrices (uniform, engine-managed)
gl_ModelViewMatrix, gl_ProjectionMatrix, gl_ModelViewProjectionMatrix,
gl_NormalMatrix
// Outputs you write
gl_Position            // clip-space position (mandatory)
gl_FrontColor / gl_BackColor   // per-vertex color
gl_TexCoord[n]         // your varying UVs

// Fragment stage
gl_FragCoord           // window-space position (x, y, z/w depth, 1/w)
gl_Color               // interpolated vertex color
texture2D(sampler, uv) // fetch</code></pre>

<h3>Texture bindings for material shaders</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Uniform name</th><th>Content</th></tr></thead>
<tbody>
<tr><td><span class="chip acc">tex0</span>&hellip;<span class="chip acc">texN</span></td><td>Material&rsquo;s texture slots in order (sampler2D)</td></tr>
<tr><td>Custom uniforms</td><td>setUniform1f/2f/3f/4f from Python (Ch. 08 tuning loop)</td></tr>
<tr><td>Light data</td><td>Fixed gl_LightSource[] bindings where applicable</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Name custom uniforms in camelCase and <em>document them at the shader top</em> &mdash; a comment table of uniforms and ranges is the difference between a reusable shader and a haunted artifact.</p></div>
` },

{ ch: 13, t: "Color Management & Gamma", h: `
<h3>The pipeline&rsquo;s quiet trap</h3>
<ul>
<li>Monitors display with gamma &asymp; 2.2; textures authored on monitors are <em>already</em> encoded. Lighting math, however, is linear.</li>
<li><strong>Double gamma:</strong> linearizing nothing, then gamma-correcting everything = washed, pale renders. <strong>No correction anywhere:</strong> dark mid-tones, oversaturated shadows.</li>
</ul>

<h3>The era-honest settings</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Setting</th><th>Where</th><th>Value</th></tr></thead>
<tbody>
<tr><td>Color management</td><td>Scene &rarr; Color Management</td><td>None/Standard per era build (verify once)</td></tr>
<tr><td>Texture gamma handoff</td><td>Authoring</td><td>Assume sRGB in, square-ish lighting out &mdash; the classic game compromise</td></tr>
<tr><td>GLSL correction</td><td>Your shaders</td><td>pow(color, 1/2.2) at the end of tone work, if you need it artistically</td></tr>
</tbody></table></div>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Don&rsquo;t theorize &mdash; <strong>calibrate with a reference image</strong>: a photo texture on a plane, one sun, camera locked. It should match the raw photo in brightness. If it&rsquo;s visibly darker/paler, fix management settings before art passes begin; after, it&rsquo;s archaeology.</p></div>
` },

{ ch: 13, t: "Performance — Material Best Practices", h: `
<h3>The material-side commandments</h3>
<div class="cols2">
<div>
<ol>
<li><strong>Atlas aggressively:</strong> props sharing one texture = one material switch (the Ch. 05 fence law, generalized).</li>
<li><strong>Shallow stacks:</strong> &le; 3 channels typical, each earning its pixels.</li>
<li><strong>Alpha Clip over Blend</strong> unless you truly need translucency (Ch. 02).</li>
<li><strong>Shadeless for unlit things</strong> &mdash; stop lighting what never sees light (HUDs, glows, sky cards).</li>
</ol>
</div>
<div>
<ol start="5">
<li><strong>Texface is scaffolding</strong> &mdash; convert before ship.</li>
<li><strong>Backface culling ON</strong> for everything closed (halves fragment load on organic meshes).</li>
<li><strong>Cast shadows selectively</strong> &mdash; material Shadow toggle off for particles/small clutter.</li>
<li><strong>One shadowed lamp;</strong> bake the rest.</li>
<li><strong>POT sizes, named files, relative paths</strong> &mdash; ops hygiene is performance hygiene.</li>
</ol>
</div>
</div>

<div class="callout tip"><div class="co-label">&#9733 Quick audit technique</div>
<p>The <em>squint test</em>: screenshot a frame, squint. If three props visually merge, they share material/texture space &mdash; atlas them. If one prop pops while identical siblings don&rsquo;t, someone duplicated a material &mdash; hunt it with the Outliner.</p></div>
` },

{ ch: 13, t: "Performance — Texture Memory Math", h: `
<h3>Know your bytes</h3>
<pre data-lang="text"><code>VRAM per texture (uncompressed RGBA8):
  size            raw          + full mipmap chain (x1.33)
  256 x 256       0.25 MB      ~0.33 MB
  512 x 512       1.00 MB      ~1.33 MB
  1024 x 1024     4.00 MB      ~5.33 MB
  2048 x 2048     16.00 MB     ~21.3 MB

Scene budget example (Pumpkin Run):
  ground_tile 1024    5.3 MB
  props_atlas 1024    5.3 MB
  pumpkin     512     1.3 MB   (+ normal 512  1.3 MB)
  UI/sky      512     1.3 MB
  TOTAL              ~14.5 MB  -- trivial

The failure mode is count, not size:
  100 unique 1024 textures = ~533 MB  -- before meshes, buffers, targets</code></pre>

<h3>The rules that fall out</h3>
<ul>
<li><strong>Budget by scene</strong>: &ldquo;X MB of textures per level&rdquo; in the conventions block &mdash; enforce at review.</li>
<li><strong>One texture, many objects</strong> (atlas) &gt; many textures, one object each.</li>
<li><strong>DDS/DXT for big tiled surfaces</strong> where supported: 4&ndash;8&times; less VRAM, decompressed by hardware.</li>
<li><strong>Mipmaps ON for 3D</strong> (also kills shimmer at distance); OFF only for UI decals.</li>
</ul>
` },

{ ch: 13, t: "Render Pipeline Stages — What Costs What", h: `
<h3>The frame&rsquo;s render anatomy</h3>
<div class="tbl-wrap"><table class="tbl">
<thead><tr><th>Stage</th><th>CPU or GPU</th><th>Scales with</th><th>Control lever</th></tr></thead>
<tbody>
<tr><td>Scene traversal / culling</td><td>CPU</td><td>Object count</td><td>Joining, layers, states</td></tr>
<tr><td>Draw call submission</td><td>CPU</td><td>Material/texture switches</td><td>Atlas, fewer materials</td></tr>
<tr><td>Vertex processing</td><td>GPU</td><td>Vertices &times; shader cost</td><td>Poly budget, LOD</td></tr>
<tr><td>Fragment shading</td><td>GPU</td><td>Pixels &times; lights &times; channels</td><td>Resolution, overdraw, stack depth</td></tr>
<tr><td>Texture sampling</td><td>GPU bandwidth</td><td>Fetches &times; pixels</td><td>Fewer channels, DDS, smaller maps</td></tr>
<tr><td>Blending (alpha)</td><td>GPU</td><td>Overdrawn pixels</td><td>Clip over blend, fewer particles</td></tr>
<tr><td>Shadow pass(es)</td><td>Both</td><td>Casters &times; buffer size</td><td>One lamp, material toggles</td></tr>
<tr><td>2D filter pass</td><td>GPU</td><td>Screen pixels</td><td>Compose filters into one</td></tr>
</tbody></table></div>

<div class="callout tip"><div class="co-label">&#9733 Diagnosis shortcut</div>
<p>fps drops when you <em>look at</em> the busy area &rarr; GPU (fragments/overdraw). fps drops everywhere regardless of view &rarr; CPU (logic/culling/submission) or physics. One glance, half the search space gone.</p></div>
` },

{ ch: 13, t: "FPS Budget Math — Worked Examples", h: `
<h3>Arithmetic on the spot</h3>
<div class="stats">
  <div class="stat"><b>1000/fps</b><span>ms per frame</span></div>
  <div class="stat"><b>16.6</b><span>ms @ 60</span></div>
  <div class="stat"><b>22.2</b><span>ms @ 45</span></div>
  <div class="stat"><b>33.3</b><span>ms @ 30</span></div>
</div>

<h3>Worked examples</h3>
<pre data-lang="text"><code>Q: 200 draw calls at ~0.02 ms submission each -- worth optimizing?
A: 200 x 0.02 = 4 ms = 24% of a 60fps frame. YES.

Q: 40 MB of textures reload per level via LibLoad -- hitch?
A: From disk (HDD ~100 MB/s): 0.4 s freeze -- async load (Ch. 12).

Q: Logic shows 9 ms. 600 sensors, half are Always.
A: Frequency-skip half of them to every 2nd tick: logic ~6 ms. Now you
   have 3 ms back -- the entire physics budget -- for one field edit
   across 300 sensors. Architecture beats micro-optimization.

Q: Fill-rate: 1920x1080 with 3x average overdraw = 6.2M fragments/frame.
   At 60 fps = 373M fragments/s. Low-end target: ~200M/s. Fix?
A: Render at 1600x900 (drop 0.56x pixels) or cut overdraw (particles,
   alpha planes). Numbers choose for you.</code></pre>

<div class="callout best"><div class="co-label">&#10003 Best Practice</div>
<p>Do this math <em>in the design doc</em>, before building: object counts, draw-call estimates, texture MB, target fps on the potato machine. Budgets stated early are architecture; budgets discovered late are apologies.</p></div>
` },

{ ch: 13, t: "The Performance Checklist", h: `
<h3>Ship-gate audit (run before every milestone)</h3>
<div class="cols2">
<div>
<h4>Scene</h4>
<ul>
<li>&#9744 Object count per zone &lt; target (join statics!)</li>
<li>&#9744 Draw calls &lt; target (atlas, shared materials)</li>
<li>&#9744 Texture MB &lt; budget, POT everywhere</li>
<li>&#9744 Tri budget per view respected; LODs on distant heroes</li>
<li>&#9744 Hidden layers clean (no live templates!)</li>
</ul>
<h4>Logic</h4>
<ul>
<li>&#9744 Always-sensors minimized; frequencies set</li>
<li>&#9744 AI sleep states active (Ch. 12)</li>
<li>&#9744 No per-frame playAction re-issues (Ch. 10)</li>
</ul>
</div>
<div>
<h4>Physics</h4>
<ul>
<li>&#9744 Dynamic bodies &lt; 25 alive typical</li>
<li>&#9744 Collision bounds simple shapes</li>
<li>&#9744 Substeps justified (tunneling measured, not vibes)</li>
<li>&#9744 Scale applied (<kbd>Ctrl</kbd>+<kbd>A</kbd>) everywhere</li>
</ul>
<h4>Runtime</h4>
<ul>
<li>&#9744 Profiler green on the potato machine, worst view</li>
<li>&#9744 Standalone build tested (paths, fonts, sounds)</li>
<li>&#9744 Long-session soak: 30 min, memory flat</li>
</ul>
</div>
</div>

<div class="callout tip"><div class="co-label">&#9733 Next: 13B</div>
<p>Materials and rendering are half the engine. 13B indexes the other half: every logic brick, physics panels, Bullet constraints, the sound system, and the full Python API.</p></div>
` }

);
