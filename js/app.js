/* ============================================================
   Deck Engine — vanilla JS, zero dependencies, file:// safe.
   - Renders SLIDES registry one-at-a-time on a scaled 1280x720 canvas
   - TOC sidebar w/ search, overview grid, hash deep-linking
   - Copy buttons + lightweight syntax highlighter
   - Progress persistence (localStorage), print/PDF export
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- state ---------------- */
  const LS_LAST = "bgeDeck.last", LS_VISITED = "bgeDeck.visited";
  let idx = 0;
  let visited = new Set();
  try {
    visited = new Set(JSON.parse(localStorage.getItem(LS_VISITED) || "[]"));
    const saved = parseInt(localStorage.getItem(LS_LAST) || "0", 10);
    if (!isNaN(saved)) idx = saved;
  } catch (e) { /* corrupted storage — start fresh */ }
  const N = () => SLIDES.length;
  const clamp = (i) => Math.max(0, Math.min(N() - 1, i));

  /* ---------------- dom refs ---------------- */
  const slot = document.querySelector("#stage .slide-slot");
  const progressbar = document.getElementById("progressbar");
  const counterEl = document.getElementById("counter");
  const chapterEl = document.getElementById("fchapter");
  const progressEl = document.getElementById("fprogress");
  const tocEl = document.getElementById("toc");
  const tocBody = document.getElementById("toc-body");
  const searchEl = document.getElementById("search");
  const searchInfo = document.getElementById("search-info");
  const tocBackdrop = document.getElementById("toc-backdrop");
  const overviewEl = document.getElementById("overview");
  const ovGrid = document.getElementById("ov-grid");
  const ovSearch = document.getElementById("ov-search");
  const helpEl = document.getElementById("help");

  /* ---------------- helpers ---------------- */
  const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const stripTags = (h) => h.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const chMeta = (ch) => CHAPTERS[ch] || { p: 0, t: "—", s: "" };
  const partLabel = (p) => (PARTS[p] ? PARTS[p].label : "");

  // searchable text index per slide (title + body)
  const searchText = SLIDES.map((s) => (s.t + " " + stripTags(s.h || "")).toLowerCase());

  /* ============================================================
     Syntax highlighter (regex tokenizer, escapes preserved)
     ============================================================ */
  const KW = {
    python: ["and","as","assert","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","in","is","lambda","not","or","pass","raise","return","try","while","with","yield","True","False","None"],
    pybi: ["bge","logic","getCurrentController","getCurrentScene","events","keyboard","mouse","owner","sensors","actuators","cont","scene","addObject","endObject","objects","inactive_objects","KX_GameObject","applyForce","applyImpulse","applyMovement","applyRotation","worldPosition","worldOrientation","localPosition","getVelocity","setVelocity","rayCast","replaceMesh","setVisible","state","group_members","groupObject","sendMessage","addScene","restart","globalDict","expandPath","LogicNodeRandom","mathutils","Vector","Matrix","KX_InputJust","self"],
    glsl: ["attribute","const","uniform","varying","break","continue","do","for","while","if","else","in","out","inout","return","struct","discard","true","false","void","float","int","bool","vec2","vec3","vec4","ivec2","ivec3","ivec4","bvec2","bvec3","bvec4","mat2","mat3","mat4","sampler1D","sampler2D","sampler3D","samplerCube","sampler1DShadow","sampler2DShadow","lowp","mediump","highp","precision","invariant"],
    glslbi: ["gl_Position","gl_FragColor","gl_FragCoord","gl_TexCoord","gl_Vertex","gl_Normal","gl_ModelViewMatrix","gl_ProjectionMatrix","gl_ModelViewProjectionMatrix","gl_NormalMatrix","texture2D","textureCube","gl_FrontColor","gl_Color","clamp","mix","smoothstep","dot","cross","normalize","length","pow","sin","cos","tan","abs","floor","ceil","fract","min","max","exp","sqrt","reflect","refract","distance"],
    js: ["break","case","catch","class","const","continue","debugger","default","delete","do","else","export","extends","finally","for","function","if","import","in","instanceof","let","new","of","return","static","super","switch","this","throw","try","typeof","var","void","while","with","yield","true","false","null","undefined","async","await"],
    jsbi: ["console","document","window","Math","JSON","Object","Array","String","Number","Boolean","Promise","Set","Map","localStorage","setTimeout","setInterval","querySelector","getElementById","addEventListener","classList","innerHTML","style","length","push","forEach","map","filter","join","replace","test","exec"],
    c: ["break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","true","false","include","define"],
    bash: ["if","then","else","elif","fi","for","in","do","done","while","case","esac","function","return","export","local","echo","cd","mkdir","rm","cp","mv","cat","grep","sed","awk","curl","wget","chmod","sudo","apt","git","python","blender","ls"],
  };
  const HASH_CM = { python: false, glsl: true, c: true, js: true, bash: true };

  function highlight(code, lang) {
    const kw = KW[lang] || [], bi = KW[lang + "bi"] || (lang === "python" ? KW.pybi : lang === "glsl" ? KW.glslbi : lang === "js" ? KW.jsbi : lang === "bash" ? [] : []);
    if (!kw.length && !bi.length) return escHtml(code);
    const parts = [];
    let re, type;
    if (lang === "python") {
      re = /(#[^\n]*)|('''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)/g;
      type = (m, g) => (g === 1 ? "tk-c" : g === 2 ? "tk-s" : g === 3 ? "tk-n" : kw.includes(m) ? "tk-k" : bi.includes(m) ? "tk-b" : null);
    } else if (lang === "bash") {
      re = /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:[^'])*')|(\$\w+|\b\d[\d.]*\b)|([A-Za-z_][\w.-]*)/g;
      type = (m, g) => (g === 1 ? "tk-c" : g === 2 ? "tk-s" : g === 3 ? "tk-n" : kw.includes(m) ? "tk-k" : null);
    } else {
      const pre = HASH_CM[lang] ? "|(#[^\n]*)" : "";
      re = new RegExp("(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/" + pre + ")|('(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\")|(\\b0x[0-9a-fA-F]+\\b|\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?f?\\b)|([A-Za-z_]\\w*)", "g");
      type = (m, g) => (g === 1 ? "tk-c" : g === 2 ? "tk-s" : g === 3 ? "tk-n" : kw.includes(m) ? "tk-k" : bi.includes(m) ? "tk-b" : null);
    }
    let last = 0, m;
    while ((m = re.exec(code)) !== null) {
      // find which alternation group matched (1-based index)
      let gi = 0; m.slice(1).forEach((g, i) => { if (g !== undefined && gi === 0) gi = i + 1; });
      const t = type(m[0], gi);
      if (m.index > last) parts.push(escHtml(code.slice(last, m.index)));
      parts.push(t ? '<span class="' + t + '">' + escHtml(m[0]) + "</span>" : escHtml(m[0]));
      last = m.index + m[0].length;
    }
    if (last < code.length) parts.push(escHtml(code.slice(last)));
    return parts.join("");
  }

  /* ---------------- copy to clipboard ---------------- */
  function copyText(text, btn) {
    const done = () => {
      btn.textContent = "Copied \u2713"; btn.classList.add("done");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------------- enhance code blocks in a root element ---------------- */
  function enhanceCode(root) {
    root.querySelectorAll("pre[data-lang]").forEach((pre) => {
      const lang = pre.getAttribute("data-lang");
      const wrap = document.createElement("div"); wrap.className = "codewrap";
      const bar = document.createElement("div"); bar.className = "codebar";
      const label = document.createElement("span"); label.className = "cb-lang"; label.textContent = lang || "text";
      const btn = document.createElement("button"); btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "Copy";
      bar.appendChild(label); bar.appendChild(btn);
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(bar); wrap.appendChild(pre);
      btn.addEventListener("click", () => copyText(pre.textContent, btn));
      // highlight code element content (raw text from textContent)
      const codeEl = pre.querySelector("code") || pre;
      codeEl.innerHTML = highlight(codeEl.textContent, lang);
    });
  }

  /* ============================================================
     Rendering
     ============================================================ */
  function slideHeaderHTML(s, i) {
    const c = chMeta(s.ch);
    const chip = "Chapter " + String(s.ch).padStart(2, "0") + " \u00b7 " + c.t;
    return '<div class="slide-head"><span class="slide-chip">' + escHtml(chip) + "</span>" +
      '<span class="slide-no">' + String(i + 1).padStart(3, "0") + " / " + N() + "</span></div>" +
      '<h1 class="slide-title">' + s.t + "</h1>";
  }

  function buildSlide(s, i) {
    const el = document.createElement("section");
    el.className = "slide" + (s.k ? " k-" + s.k : "");
    if (s.k === "cover" || s.k === "divider") {
      el.innerHTML = s.h; // cover/divider supply their own full layout
    } else if (s.k === "chapter") {
      el.innerHTML = s.h;
    } else {
      el.innerHTML = slideHeaderHTML(s, i) + '<div class="slide-body">' + s.h + "</div>";
    }
    enhanceCode(el);
    return el;
  }

  function render(i, dir) {
    idx = clamp(i);
    const s = SLIDES[idx];
    const el = buildSlide(s, idx);
    el.classList.add(dir === "prev" ? "enter-prev" : "enter-next");
    slot.replaceChildren(el);
    // chrome
    const c = chMeta(s.ch);
    counterEl.innerHTML = "<b>" + (idx + 1) + "</b> / " + N();
    chapterEl.textContent = "Ch " + String(s.ch).padStart(2, "0") + " \u00b7 " + c.t;
    progressbar.style.width = (((idx + 1) / N()) * 100).toFixed(2) + "%";
    // progress tracking
    visited.add(idx);
    try {
      localStorage.setItem(LS_LAST, String(idx));
      localStorage.setItem(LS_VISITED, JSON.stringify([...visited]));
    } catch (e) {}
    const pct = Math.round((visited.size / N()) * 100);
    progressEl.textContent = "\u25CF " + pct + "% viewed";
    history.replaceState(null, "", "#/" + (idx + 1));
    markCurrent();
  }

  function nav(d) { render(idx + d, d > 0 ? "next" : "prev"); }

  /* ---------------- scaling ---------------- */
  function rescale() {
    const s = Math.min(window.innerWidth / 1320, window.innerHeight / 790);
    slot.style.setProperty("--scale", Math.max(0.2, s).toFixed(4));
  }
  window.addEventListener("resize", rescale);

  /* ============================================================
     TOC sidebar
     ============================================================ */
  let tocLinks = []; // {i, li, kindLabel}
  function buildTOC() {
    tocBody.replaceChildren();
    tocLinks = [];
    let curPart = -1, curCh = -1, chDetails = null, slideUl = null, chCount = {};
    SLIDES.forEach((s, i) => { chCount[s.ch] = (chCount[s.ch] || 0) + 1; });
    SLIDES.forEach((s, i) => {
      const c = chMeta(s.ch);
      if (c.p !== curPart && PARTS[c.p]) {
        curPart = c.p;
        const ph = document.createElement("div");
        ph.className = "toc-part"; ph.textContent = PARTS[c.p].label + " \u2014 " + PARTS[c.p].title;
        tocBody.appendChild(ph);
      }
      if (s.ch !== curCh) {
        curCh = s.ch;
        chDetails = document.createElement("details");
        chDetails.className = "toc-ch"; chDetails.dataset.ch = s.ch;
        const sum = document.createElement("summary");
        sum.innerHTML = '<span class="cnum">CH ' + String(s.ch).padStart(2, "0") + "</span>" +
          '<span class="ctitle">' + escHtml(c.t) + '</span><span class="ccount">' + chCount[s.ch] + " sl.</span>";
        chDetails.appendChild(sum);
        slideUl = document.createElement("div"); slideUl.className = "toc-slides";
        chDetails.appendChild(slideUl);
        tocBody.appendChild(chDetails);
      }
      const li = document.createElement("div");
      li.className = "toc-slide" + (s.k === "chapter" || s.k === "divider" || s.k === "cover" ? " kind-" + s.k : "");
      li.innerHTML = '<span class="snum">' + (i + 1) + '</span><span class="stitle">' + escHtml(s.t) + "</span>";
      li.addEventListener("click", () => { closeAll(); render(i, i > idx ? "next" : "prev"); });
      slideUl.appendChild(li);
      tocLinks.push({ i, li, q: (s.t + " " + searchText[i]).toLowerCase() });
    });
  }
  function markCurrent() {
    tocLinks.forEach((l) => l.li.classList.toggle("cur", l.i === idx));
    const open = tocBody.querySelector('details[data-ch="' + SLIDES[idx].ch + '"]');
    if (open && !open.open) open.open = true;
    const cur = tocBody.querySelector(".toc-slide.cur");
    if (cur) cur.scrollIntoView({ block: "nearest" });
    const ovCur = ovGrid.querySelector(".ov-card.cur");
    if (ovCur) ovCur.classList.remove("cur");
    const card = ovGrid.querySelector('.ov-card[data-i="' + idx + '"]');
    if (card) card.classList.add("cur");
  }

  /* ---------------- search ---------------- */
  function runSearch(q) {
    q = q.trim().toLowerCase();
    let hits = 0;
    tocLinks.forEach((l) => {
      const show = !q || l.q.includes(q);
      l.li.classList.toggle("hide", !show);
      if (show) hits++;
    });
    // keep chapters with visible slides open
    tocBody.querySelectorAll("details.toc-ch").forEach((d) => {
      const any = d.querySelectorAll(".toc-slide:not(.hide)").length > 0;
      d.style.display = any ? "" : "none";
      if (q) d.open = any;
    });
    searchInfo.textContent = q ? hits + " of " + N() + " slides match" : "";
  }
  searchEl.addEventListener("input", () => runSearch(searchEl.value));
  searchEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = tocBody.querySelector(".toc-slide:not(.hide)");
      if (first) first.click();
    }
    e.stopPropagation();
  });

  /* ============================================================
     Overview grid
     ============================================================ */
  let ovBuilt = false;
  function buildOverview() {
    if (ovBuilt) return; ovBuilt = true;
    SLIDES.forEach((s, i) => {
      const c = chMeta(s.ch);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "ov-card" + (s.k ? " kind-" + s.k : "");
      card.dataset.i = i;
      card.innerHTML = '<div class="ov-meta"><span>' + partLabel(c.p) + " \u00b7 CH " + String(s.ch).padStart(2, "0") +
        '</span><span>#' + (i + 1) + "</span></div>" +
        '<div class="ov-t">' + escHtml(s.t) + "</div>";
      card.addEventListener("click", () => { closeAll(); render(i, i > idx ? "next" : "prev"); });
      ovGrid.appendChild(card);
    });
    ovSearch.addEventListener("input", () => {
      const q = ovSearch.value.trim().toLowerCase();
      ovGrid.querySelectorAll(".ov-card").forEach((card) => {
        const i = +card.dataset.i;
        card.classList.toggle("hide", !!q && !searchText[i].includes(q));
      });
    });
  }

  /* ============================================================
     Print / PDF export
     ============================================================ */
  let printBuilt = false;
  function buildPrint() {
    if (printBuilt) return; printBuilt = true;
    const root = document.createElement("div"); root.id = "printroot";
    SLIDES.forEach((s, i) => {
      const el = buildSlide(s, i);
      el.classList.remove("enter-next", "enter-prev");
      root.appendChild(el);
    });
    document.body.appendChild(root);
  }
  window.addEventListener("beforeprint", buildPrint);

  /* ============================================================
     Overlays & chrome events
     ============================================================ */
  function anyOpen() {
    return tocEl.classList.contains("open") || overviewEl.classList.contains("open") || helpEl.classList.contains("open");
  }
  function closeAll() {
    tocEl.classList.remove("open"); tocBackdrop.classList.remove("show");
    overviewEl.classList.remove("open"); helpEl.classList.remove("open");
  }
  function toggle(el) {
    const was = el.classList.contains("open");
    closeAll();
    if (!was) {
      el.classList.add("open");
      if (el === tocEl) { tocBackdrop.classList.add("show"); searchEl.focus(); }
      if (el === overviewEl) { buildOverview(); ovSearch.focus(); }
    }
  }

  document.getElementById("nav-prev").addEventListener("click", () => nav(-1));
  document.getElementById("nav-next").addEventListener("click", () => nav(1));
  document.getElementById("btn-toc").addEventListener("click", () => toggle(tocEl));
  document.getElementById("toc-close").addEventListener("click", closeAll);
  tocBackdrop.addEventListener("click", closeAll);
  document.getElementById("btn-overview").addEventListener("click", () => toggle(overviewEl));
  document.getElementById("ov-close").addEventListener("click", closeAll);
  document.getElementById("btn-help").addEventListener("click", () => toggle(helpEl));
  document.getElementById("btn-fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.getElementById("btn-print").addEventListener("click", () => { buildPrint(); setTimeout(() => window.print(), 60); });
  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("Reset viewing progress (slides viewed %)?")) return;
    visited = new Set();
    try { localStorage.removeItem(LS_VISITED); } catch (e) {}
    render(idx, "next");
  });

  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      if (e.key === "Escape") e.target.blur();
      return;
    }
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ":
        e.preventDefault(); nav(1); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp":
        e.preventDefault(); nav(-1); break;
      case "Home": e.preventDefault(); render(0, "prev"); break;
      case "End": e.preventDefault(); render(N() - 1, "next"); break;
      case "t": case "T": toggle(tocEl); break;
      case "o": case "O": toggle(overviewEl); break;
      case "f": case "F":
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        break;
      case "/": e.preventDefault(); toggle(tocEl); break;
      case "?": toggle(helpEl); break;
      case "Escape": closeAll(); break;
    }
  });

  /* live hash routing: deep links / manual hash edits while running */
  window.addEventListener("hashchange", () => {
    const m = location.hash.match(/^#\/(\d+)$/);
    if (!m) return;
    const target = clamp(parseInt(m[1], 10) - 1);
    if (target !== idx) render(target, target > idx ? "next" : "prev");
  });

  /* touch swipe */
  let tx = null;
  window.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 60) nav(dx < 0 ? 1 : -1);
    tx = null;
  }, { passive: true });

  /* ============================================================
     Boot
     ============================================================ */
  function boot() {
    if (!N()) {
      slot.replaceChildren();
      slot.innerHTML = '<section class="slide k-cover"><div class="cover-badge">ERROR</div><h1>No slides registered</h1><p class="cover-sub">Check that js/slides/*.js files load correctly next to index.html.</p></section>';
      return;
    }
    buildTOC();
    rescale();
    let start = idx;
    const m = location.hash.match(/^#\/(\d+)$/);
    if (m) start = clamp(parseInt(m[1], 10) - 1);
    render(start, "next");
  }
  boot();
})();
