/* Agent Gallery — tiny hash-router, no dependencies. Works from file:// too. */
(function () {
  "use strict";
  var D = window.APP_DATA;
  var main = document.getElementById("main");
  document.getElementById("data-date").textContent = D.updated || "";

  var catsById = {};
  D.categories.forEach(function (c) { catsById[c.id] = c; });
  var appsById = {};
  D.apps.forEach(function (a) { appsById[a.id] = a; });

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function catName(id) { return catsById[id] ? catsById[id].emoji + " " + catsById[id].name : id; }
  function srcUrl(app) { return D.repo + "/tree/main/" + app.path; }
  function levelLabel(l) { return l.charAt(0).toUpperCase() + l.slice(1); }

  function cardHTML(app) {
    return '<article class="card">' +
      '<div class="card-top"><span class="card-emoji" aria-hidden="true">' + app.emoji + '</span>' +
      '<h3><a href="#/app/' + app.id + '">' + esc(app.title) + '</a></h3></div>' +
      '<div class="badges"><span class="badge">' + esc(catName(app.cat)) + '</span>' +
      '<span class="level level-' + app.level + '">' + levelLabel(app.level) + '</span></div>' +
      '<p class="desc">' + esc(app.desc) + '</p>' +
      '<a class="card-link" href="#/app/' + app.id + '">View details →</a>' +
      '</article>';
  }

  // ---------- Home ----------
  function renderHome() {
    setNav("home");
    var total = D.apps.length;
    var counts = {};
    D.apps.forEach(function (a) { counts[a.cat] = (counts[a.cat] || 0) + 1; });
    var local = D.apps.filter(function (a) { return !a.keys || a.keys.length === 0; }).length;

    var feat = D.featured.map(function (id) { return appsById[id]; }).filter(Boolean);
    var catCards = D.categories.map(function (c) {
      return '<a class="cat-card" href="#/browse?cat=' + c.id + '">' +
        '<span class="emoji" aria-hidden="true">' + c.emoji + '</span>' +
        '<h3>' + esc(c.name) + '</h3><p>' + esc(c.blurb) + '</p>' +
        '<span class="count">' + (counts[c.id] || 0) + ' templates →</span></a>';
    }).join("");

    main.innerHTML =
      '<div class="hero"><div class="wrap">' +
      '<h1>100+ open-source AI agents &amp; RAG apps, ready to clone</h1>' +
      '<p class="lede">A friendly gallery of every template in ' +
      '<a href="' + D.repo + '" target="_blank" rel="noopener" style="color:#fff">shubhamsaboo/awesome-llm-apps</a> ' +
      '— starter agents, advanced teams, voice agents, MCP apps, RAG tutorials, and more. ' +
      'All Apache-2.0 licensed: clone them, ship them, sell them.</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="#/browse">Browse all ' + total + ' templates</a>' +
      '<a class="btn btn-ghost" href="' + D.repo + '" target="_blank" rel="noopener">★ Star on GitHub</a>' +
      '</div>' +
      '<div class="key-note"><p><strong>🔑 Bring your own keys:</strong> every template runs with your own model keys — ' +
      '<code>OPENAI_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, <code>GOOGLE_API_KEY</code>, ' +
      'DeepSeek, Grok, Ollama &amp; more. Clone a folder, <code>pip install -r requirements.txt</code>, add your key, run.</p></div>' +
      '</div></div>' +
      '<div class="wrap">' +
      '<ul class="stats" aria-label="Collection stats">' +
      '<li><strong>' + total + '</strong>templates</li>' +
      '<li><strong>' + D.categories.length + '</strong>categories</li>' +
      '<li><strong>' + local + '</strong>run key-free / fully local</li>' +
      '<li><strong>100%</strong>open source (Apache-2.0)</li>' +
      '</ul>' +
      '<section aria-labelledby="feat-h"><h2 id="feat-h">⭐ Featured templates</h2>' +
      '<p class="section-sub">Hand-picked standouts — start here if you are new.</p>' +
      '<div class="grid">' + feat.map(cardHTML).join("") + '</div></section>' +
      '<section aria-labelledby="cat-h"><h2 id="cat-h">Browse by category</h2>' +
      '<p class="section-sub">Eleven collections, from single-file starters to always-on background agents.</p>' +
      '<div class="cat-grid">' + catCards + '</div></section>' +
      '<section class="howto" aria-labelledby="run-h"><h2 id="run-h">🚀 Run any template in 30 seconds</h2>' +
      '<ol><li>Clone the repo: <code class="inline">git clone https://github.com/shubhamsaboo/awesome-llm-apps.git</code></li>' +
      '<li><code class="inline">cd</code> into the template folder (each detail page shows the exact path).</li>' +
      '<li>Install dependencies: <code class="inline">pip install -r requirements.txt</code></li>' +
      '<li>Add your model API key (<code class="inline">export OPENAI_API_KEY=…</code> or as the folder README says).</li>' +
      '<li>Run it — usually <code class="inline">streamlit run app.py</code> (see the folder README for the exact file).</li></ol>' +
      '<p>Agent skills install even faster: <code class="inline">npx skills add &lt;skill-folder-url&gt;</code> then just ask your coding agent to use it.</p></section>' +
      '</div>';
  }

  // ---------- Browse ----------
  var state = { q: "", cat: "all", level: "all", tag: "all" };
  var allTags = [];
  (function () {
    var seen = {};
    D.apps.forEach(function (a) { (a.tags || []).forEach(function (t) { if (!seen[t]) { seen[t] = 1; allTags.push(t); } }); });
    allTags.sort();
  })();

  function filteredApps() {
    var q = state.q.trim().toLowerCase();
    return D.apps.filter(function (a) {
      if (state.cat !== "all" && a.cat !== state.cat) return false;
      if (state.level !== "all" && a.level !== state.level) return false;
      if (state.tag !== "all" && (a.tags || []).indexOf(state.tag) < 0) return false;
      if (q) {
        var hay = (a.title + " " + a.desc + " " + a.summary + " " + (a.tags || []).join(" ")).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function renderBrowse() {
    setNav("browse");
    var catChips = ['<button class="chip" data-f="cat" data-v="all">All</button>'].concat(D.categories.map(function (c) {
      return '<button class="chip" data-f="cat" data-v="' + c.id + '">' + c.emoji + ' ' + esc(c.name) + '</button>';
    })).join("");
    var tagOpts = '<option value="all">All tags</option>' + allTags.map(function (t) {
      return '<option value="' + esc(t) + '">' + esc(t) + '</option>';
    }).join("");

    main.innerHTML =
      '<h1>Browse all templates</h1>' +
      '<p class="section-sub">Search by title, description, or tag — then filter by category, difficulty, or tech.</p>' +
      '<div class="toolbar" role="search">' +
      '<div class="search-row"><label class="sr-only" for="q" style="position:absolute;left:-9999px">Search templates</label>' +
      '<input type="search" id="q" placeholder="Search 119 templates… (e.g. “rag”, “voice”, “finance”)" autocomplete="off"></div>' +
      '<fieldset><legend>Category</legend><div class="filters" id="cat-chips">' + catChips + '</div></fieldset>' +
      '<fieldset><legend>Difficulty</legend><div class="filters" id="lvl-chips">' +
      '<button class="chip" data-f="level" data-v="all">All</button>' +
      '<button class="chip" data-f="level" data-v="beginner">Beginner</button>' +
      '<button class="chip" data-f="level" data-v="intermediate">Intermediate</button>' +
      '<button class="chip" data-f="level" data-v="advanced">Advanced</button>' +
      '</div></fieldset>' +
      '<div class="filters"><label class="group-label" for="tag-sel">Tag</label>' +
      '<select id="tag-sel" style="font-size:.95rem;padding:.4rem .7rem;border-radius:8px;border:2px solid var(--line)">' + tagOpts + '</select></div>' +
      '</div>' +
      '<p class="result-count" id="count" role="status" aria-live="polite"></p>' +
      '<div class="grid" id="results"></div>';

    var q = document.getElementById("q");
    q.value = state.q;
    q.addEventListener("input", function () { state.q = q.value; update(); });
    document.getElementById("tag-sel").value = state.tag;
    document.getElementById("tag-sel").addEventListener("change", function (e) { state.tag = e.target.value; update(); });
    main.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () { state[b.dataset.f] = b.dataset.v; update(); });
    });
    update();
    function update() {
      main.querySelectorAll(".chip").forEach(function (b) {
        b.setAttribute("aria-pressed", state[b.dataset.f] === b.dataset.v ? "true" : "false");
      });
      var list = filteredApps();
      document.getElementById("count").textContent =
        list.length + (list.length === 1 ? " template" : " templates") +
        (state.q || state.cat !== "all" || state.level !== "all" || state.tag !== "all" ? " matching your filters" : " total");
      document.getElementById("results").innerHTML = list.length
        ? list.map(cardHTML).join("")
        : '<div class="empty"><p>No templates match. Try clearing a filter or searching for something else.</p></div>';
    }
  }

  // ---------- Detail ----------
  function renderDetail(id) {
    var app = appsById[id];
    if (!app) {
      setNav("");
      main.innerHTML = '<p><a class="back-link" href="#/browse">← Back to gallery</a></p><h1>Template not found</h1><p>No template with id <code class="inline">' + esc(id) + '</code>. <a href="#/browse">Browse all templates</a>.</p>';
      return;
    }
    setNav("browse");
    var cat = catsById[app.cat];
    var setup = D.setup[app.cat] || D.setup.starter;
    var keys = (app.keys && app.keys.length) ? app.keys : setup.keys;
    var tags = (app.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var feats = (app.highlights || []).map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("");
    var steps = setup.steps.map(function (s) {
      var s2 = esc(s).replace(/&lt;(app_file|skill-folder-url|course)&gt;/g, "<em>&lt;$1&gt;</em>");
      if (/^(git clone|pip install|streamlit run|cd |export |npx )/.test(s)) {
        return "<li><pre class=\"cmd\" style=\"margin:.3rem 0 0\">" + esc(s) + "</pre></li>";
      }
      return "<li>" + s2 + "</li>";
    }).join("");
    var keyItems = keys.length
      ? keys.map(function (k) { return "<li><code>" + esc(k) + "</code></li>"; }).join("")
      : "<li><em>None — runs key-free / fully local.</em></li>";
    var runNote = app.run ? '<p><strong>Run file:</strong> <code>' + esc(app.run) + '</code></p>' : "";

    document.title = app.title + " — Agent Gallery";
    main.innerHTML =
      '<p><a class="back-link" href="#/browse">← Back to gallery</a></p>' +
      '<div class="detail-head"><span class="emoji-big" aria-hidden="true">' + app.emoji + '</span>' +
      '<h1>' + esc(app.title) + '</h1>' +
      '<div class="badges"><span class="badge">' + esc(catName(app.cat)) + '</span>' +
      '<span class="level level-' + app.level + '">' + levelLabel(app.level) + '</span></div>' +
      '<ul class="tag-list" aria-label="Tags">' + tags + '</ul></div>' +
      '<div class="detail-grid"><div>' +
      '<section class="panel" aria-labelledby="what"><h2 id="what">What it does</h2><p>' + esc(app.summary) + '</p>' +
      '<h2>Key features</h2><ul>' + feats + '</ul></section>' +
      '<section class="panel" aria-labelledby="setup" style="margin-top:1.25rem"><h2 id="setup">⚙️ Setup — ' + esc(cat.name) + '</h2>' +
      runNote + '<ol class="setup-steps">' + steps + '</ol>' +
      '<h2>Keys &amp; credentials</h2><ul>' + keyItems + '</ul>' +
      '<p class="section-sub" style="margin-bottom:0">Exact filenames and extra env vars live in the folder README — always check it first.</p></section>' +
      '</div><aside>' +
      '<section class="panel" aria-labelledby="src"><h2 id="src">Source</h2>' +
      '<p style="word-break:break-all"><code>' + esc(app.path) + '</code></p>' +
      '<p><a class="btn btn-primary" href="' + srcUrl(app) + '" target="_blank" rel="noopener">View source on GitHub →</a></p>' +
      '<p class="section-sub" style="margin-bottom:0">Apache-2.0 · free for personal &amp; commercial use.</p></section>' +
      '<section class="panel" style="margin-top:1.25rem" aria-labelledby="rel"><h2 id="rel">More like this</h2>' +
      relatedHTML(app) + '</section>' +
      '</aside></div>';
  }

  function relatedHTML(app) {
    var rel = D.apps.filter(function (a) { return a.id !== app.id && a.cat === app.cat; }).slice(0, 3);
    if (!rel.length) return "<p>Nothing else in this category yet.</p>";
    return "<ul>" + rel.map(function (a) {
      return '<li><a href="#/app/' + a.id + '">' + esc(a.title) + "</a></li>";
    }).join("") + "</ul>";
  }

  function setNav(which) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.dataset.nav === which) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (which !== "detail") document.title = "Agent Gallery — Open-source AI agent & RAG templates from awesome-llm-apps";
  }

  function parseRoute() {
    var h = location.hash || "#/";
    var m = h.match(/^#\/app\/([^\/?]+)/);
    if (m) return { view: "detail", id: decodeURIComponent(m[1]) };
    var b = h.match(/^#\/browse(?:\?(.*))?/);
    if (b) {
      if (b[1]) {
        b[1].split("&").forEach(function (p) {
          var kv = p.split("=");
          if (kv[0] === "cat" && catsById[kv[1]]) state.cat = kv[1];
          if (kv[0] === "q") state.q = decodeURIComponent(kv[1] || "");
        });
      }
      return { view: "browse" };
    }
    return { view: "home" };
  }

  function route() {
    var r = parseRoute();
    if (r.view === "detail") renderDetail(r.id);
    else if (r.view === "browse") renderBrowse();
    else renderHome();
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  route();
})();
