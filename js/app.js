/* =====================================================================
   尤浈棋 · 艺术家作品集  —  交互逻辑
   路由 / 主题 / 三语 / 视差 / 自定义光标 / 入场动画
   ===================================================================== */
(function () {
  "use strict";
  const { I18N, PROJECTS } = window.__SITE_DATA__;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------------- 状态 ---------------- */
  const state = {
    theme: localStorage.getItem("yz-theme") || "dark",
    lang: localStorage.getItem("yz-lang") || "zh",
  };
  let pendingAnchor = null;
  let revealObserver = null;
  let starfieldRAF = null;
  let starfieldResize = null;
  const starMouse = { x: 0, y: 0 };

  /* ---------------- 背景音频 ---------------- */
  const audio = new Audio("./bg.mp3");
  audio.crossOrigin = "anonymous";
  audio.loop = true;
  audio.preload = "metadata";
  audio.muted = localStorage.getItem("yz-music-muted") === "true";
  let musicPlayRequested = localStorage.getItem("yz-music-play") === "true";

  function updateMusicUI() {
    const toggle = $("#musicToggle");
    const mute = $("#musicMute");
    if (!toggle || !mute) return;
    const isPlaying = !audio.paused;
    toggle.setAttribute("data-play", String(isPlaying));
    toggle.setAttribute("aria-label", isPlaying ? "pause" : "play");
    mute.setAttribute("data-mute", String(audio.muted));
    mute.setAttribute("aria-label", audio.muted ? "unmute" : "mute");
  }

  async function tryPlay() {
    try {
      await audio.play();
      musicPlayRequested = true;
      localStorage.setItem("yz-music-play", "true");
    } catch (err) {
      musicPlayRequested = false;
      localStorage.setItem("yz-music-play", "false");
    }
    updateMusicUI();
  }

  function pauseMusic() {
    audio.pause();
    musicPlayRequested = false;
    localStorage.setItem("yz-music-play", "false");
    updateMusicUI();
  }

  function toggleMusic() {
    if (audio.paused) tryPlay();
    else pauseMusic();
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    localStorage.setItem("yz-music-muted", String(audio.muted));
    if (!audio.muted && audio.paused && musicPlayRequested) tryPlay();
    updateMusicUI();
  }

  /* ---------------- 转场遮罩 ---------------- */
  const fade = document.createElement("div");
  fade.className = "page-fade";
  document.body.appendChild(fade);

  /* ---------------- 主题 ---------------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("yz-theme", state.theme);
  }

  /* ---------------- 语言 ---------------- */
  function updateStaticI18n() {
    const t = I18N[state.lang];
    document.documentElement.lang = state.lang;
    $$("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (t[k] != null) el.textContent = t[k];
    });
    $$("#langSwitch button").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.lang === state.lang)
    );
    const titles = { zh: "尤浈棋 · 摄影作品集", en: "Yóu Zhēnqí · Photography", de: "Yóu Zhēnqí · Fotografie" };
    document.title = titles[state.lang] || titles.zh;
  }
  function setLang(lang) {
    if (!I18N[lang] || lang === state.lang) return;
    state.lang = lang;
    localStorage.setItem("yz-lang", lang);
    updateStaticI18n();
    renderRoute(); // 重新渲染内容以切换动态文案
  }

  /* ---------------- 渲染：首页 ---------------- */
  function renderHome() {
    const t = I18N[state.lang];
    const cards = PROJECTS.map((p, i) => `
      <article class="card reveal" style="--i:${i % 3 === 1 ? 1 : 0}; --rot:${i % 2 ? 7 : -7}deg;">
        <a class="card__inner" href="#/project/${p.id}" data-link>
          <span class="card__index">${String(i + 1).padStart(2, "0")}</span>
          <span class="card__plus">+</span>
          <div class="card__img"><img src="${p.cover}" alt="${esc(p.title[state.lang])}" loading="lazy"></div>
          <div class="card__overlay">
            <div class="card__meta">
              <h3>${esc(p.title[state.lang])}</h3>
              <p>${p.year} · ${esc(p.medium[state.lang])}</p>
            </div>
          </div>
        </a>
      </article>`).join("");

    $("#app").innerHTML = `
      <section class="hero" id="hero">
        <div class="hero__bg">
          <span class="hero__orb o1" data-depth="26"></span>
          <span class="hero__orb o2" data-depth="44"></span>
          <canvas class="starfield" id="starfield" aria-hidden="true"></canvas>
        </div>
        <div class="hero__inner" data-depth="10">
          <p class="hero__kicker" data-i18n="hero_kicker">${t.hero_kicker}</p>
          <h1 class="hero__title"><span class="line"><span>${esc(t.hero_title)}</span></span></h1>
          <p class="hero__sub" data-i18n="hero_sub">${t.hero_sub}</p>
        </div>
        <div class="hero__scroll" data-i18n="hero_scroll">${t.hero_scroll}</div>
      </section>

      <section class="section" id="works">
        <div class="section__head">
          <h2 class="section__title reveal"><small>PORTFOLIO</small>${esc(t.works_title)}</h2>
          <p class="section__sub reveal" data-i18n="works_sub">${t.works_sub}</p>
        </div>
        <div class="works-grid">${cards}</div>
      </section>

      <section class="section" id="about">
        <div class="section__head">
          <h2 class="section__title reveal"><small>PROFILE</small><span data-i18n="about_title">${t.about_title}</span></h2>
        </div>
        <div class="about-grid">
          <div class="portrait reveal"><img src="assets/img/p3-cover.svg" alt="portrait" loading="lazy"></div>
          <div class="reveal">
            <p data-i18n="about_text">${t.about_text}</p>
            <p data-i18n="about_text2">${t.about_text2}</p>
          </div>
        </div>
      </section>

      <section class="section" id="contact">
        <div class="section__head">
          <h2 class="section__title reveal"><small>CONTACT</small><span data-i18n="contact_title">${t.contact_title}</span></h2>
        </div>
        <p class="reveal" style="max-width:46ch;color:var(--fg-soft)" data-i18n="contact_text">${t.contact_text}</p>
        <ul class="contact-list reveal">
          <li><span class="k" data-i18n="contact_email">${t.contact_email}</span><span class="v">studio@youzhenqi.art</span></li>
          <li><span class="k" data-i18n="contact_studio">${t.contact_studio}</span><span class="v">Shanghai · 上海</span></li>
        </ul>
      </section>`;
  }

  /* ---------------- 渲染：详情 ---------------- */
  function renderDetail(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) { location.hash = "#/"; return; }
    const t = I18N[state.lang];
    const idx = PROJECTS.findIndex((x) => x.id === id);
    const next = PROJECTS[(idx + 1) % PROJECTS.length];

    const plates = p.gallery.map((g, i) => `
      <figure class="plate reveal" style="--i:${i % 3};">
        <img src="${g.src}" alt="${esc(g.caption[state.lang])}" data-parallax="${i % 2 ? 0.05 : -0.05}" loading="lazy">
        <figcaption class="plate__cap"><span data-i18n="detail_caption">${t.detail_caption}</span> — ${esc(g.caption[state.lang])}</figcaption>
      </figure>`).join("");

    $("#app").innerHTML = `
      <a class="back-btn" href="#/" data-link><span data-i18n="detail_back">${t.detail_back}</span> ←</a>
      <section class="detail">
        <div class="detail__hero">
          <img src="${p.cover}" alt="${esc(p.title[state.lang])}" id="detailCover">
          <div class="detail__herotext">
            <div class="idx">${String(idx + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}</div>
            <h1>${esc(p.title[state.lang])}</h1>
            <div class="m">${p.year} · ${esc(p.medium[state.lang])}</div>
          </div>
        </div>
        <div class="detail__body">
          <aside class="detail__aside">
            <h2 data-i18n="detail_about">${t.detail_about}</h2>
            <p>${esc(p.about[state.lang])}</p>
            <div class="tags">
              <span>${p.year}</span>
              <span>${esc(p.medium[state.lang])}</span>
              <span>${p.gallery.length} plates</span>
            </div>
          </aside>
          <div class="detail__gallery">${plates}</div>
        </div>
        <div class="detail__next">
          <div>
            <div class="lab" data-i18n="detail_next">${t.detail_next}</div>
            <a href="#/project/${next.id}" data-link>${esc(next.title[state.lang])} →</a>
          </div>
        </div>
      </section>`;
  }

  /* ---------------- 路由 ---------------- */
  function renderRoute(opts = {}) {
    const hash = location.hash || "#/";
    if (hash.startsWith("#/project/")) {
      renderDetail(hash.slice("#/project/".length));
    } else {
      renderHome();
      initStarfield();
      if (pendingAnchor) {
        const a = pendingAnchor; pendingAnchor = null;
        requestAnimationFrame(() => scrollToAnchor(a));
      }
    }
    bindScoped();
    setupReveal();
    updateStaticI18n();
    if (opts.scrollTop) window.scrollTo({ top: 0 });
    else if (!pendingAnchor) window.scrollTo({ top: 0, behavior: "auto" });
  }

  function scrollToAnchor(sel) {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fadeTo(href) {
    fade.classList.add("is-on");
    setTimeout(() => { location.hash = href; }, 380);
  }

  /* ---------------- 入场动画 ---------------- */
  function setupReveal() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- 视差（滚动） ---------------- */
  let ticking = false;
  function onScrollParallax() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      $$("[data-parallax]").forEach((img) => {
        const speed = parseFloat(img.dataset.parallax);
        const r = img.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        img.style.transform = `scale(1.1) translateY(${(-center * speed).toFixed(1)}px)`;
      });
      const cover = $("#detailCover");
      if (cover) cover.style.transform = `translateY(${(y * 0.16).toFixed(1)}px) scale(1.04)`;
      ticking = false;
    });
  }

  /* ---------------- 绑定：每次渲染后 ---------------- */
  function bindScoped() {
    // 卡片 3D 倾斜
    $$(".card__inner").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
    // 英雄鼠标视差
    const hero = $("#hero");
    if (hero) {
      hero.addEventListener("mousemove", (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5);
        const cy = (e.clientY / window.innerHeight - 0.5);
        starMouse.x = cx * 2;
        starMouse.y = cy * 2;
        $$("[data-depth]", hero).forEach((el) => {
          const d = parseFloat(el.dataset.depth);
          el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
        });
      });
      hero.addEventListener("mouseleave", () => {
        starMouse.x = 0;
        starMouse.y = 0;
        $$("[data-depth]", hero).forEach((el) => { el.style.transform = ""; });
      });
    }
  }

  /* ---------------- 绑定：全局 ---------------- */
  function bindGlobal() {
    // 导航滚动态
    const nav = $("#nav");
    window.addEventListener("scroll", () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
      onScrollParallax();
    }, { passive: true });

    // 主题切换
    $("#themeToggle").addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
    });

    // 音乐控制
    $("#musicToggle").addEventListener("click", toggleMusic);
    $("#musicMute").addEventListener("click", toggleMute);
    updateMusicUI();
    if (musicPlayRequested) tryPlay();

    // 语言切换
    $$("#langSwitch button").forEach((b) =>
      b.addEventListener("click", () => setLang(b.dataset.lang))
    );

    // 汉堡菜单
    const burger = $("#burger");
    const links = $("#navLinks");
    burger.addEventListener("click", () => {
      burger.classList.toggle("is-open");
      links.classList.toggle("is-open");
    });

    // 链接点击委托
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-link]");
      if (!a) return;
      const href = a.getAttribute("href");
      e.preventDefault();
      burger.classList.remove("is-open"); links.classList.remove("is-open");
      if (href.charAt(1) === "/") {
        if (href === "#/" && (location.hash === "" || location.hash === "#/")) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          fadeTo(href);
        }
      }
    });

    // 锚点导航（作品/关于/联系）
    $$('#navLinks a:not([data-link]), a[href^="#w"], a[href^="#a"], a[href^="#c"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        e.preventDefault();
        burger.classList.remove("is-open"); links.classList.remove("is-open");
        if (location.hash.startsWith("#/project/")) {
          pendingAnchor = href; fadeTo("#/");
        } else {
          scrollToAnchor(href);
        }
      });
    });

    // hash 变化
    window.addEventListener("hashchange", () => {
      renderRoute({ scrollTop: true });
      setTimeout(() => fade.classList.remove("is-on"), 60);
    });

    // 自定义光标
    const cur = $(".cursor");
    if (window.matchMedia("(hover: hover)").matches) {
      window.addEventListener("mousemove", (e) => {
        cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
      document.addEventListener("mouseover", (e) => {
        if (e.target.closest("a, button, .card__inner")) cur.classList.add("is-hover");
      });
      document.addEventListener("mouseout", (e) => {
        if (e.target.closest("a, button, .card__inner")) cur.classList.remove("is-hover");
      });
    }

    // 键盘方向键：详情页翻页
    window.addEventListener("keydown", (e) => {
      if (!location.hash.startsWith("#/project/")) return;
      const id = location.hash.slice("#/project/".length);
      const idx = PROJECTS.findIndex((x) => x.id === id);
      if (e.key === "ArrowRight") {
        const n = PROJECTS[(idx + 1) % PROJECTS.length];
        fadeTo("#/project/" + n.id);
      } else if (e.key === "ArrowLeft") {
        const n = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
        fadeTo("#/project/" + n.id);
      }
    });
  }

  /* ---------------- 星空背景（仅首页 Hero） ---------------- */
  function initStarfield() {
    const canvas = $("#starfield");
    if (!canvas) return;
    if (starfieldRAF) cancelAnimationFrame(starfieldRAF);
    if (starfieldResize) window.removeEventListener("resize", starfieldResize);

    const ctx = canvas.getContext("2d");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    starfieldResize = resize;
    window.addEventListener("resize", starfieldResize, { passive: true });

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    const w = W(), h = H();
    const starCount = Math.min(280, Math.max(80, Math.floor((w * h) / 3200)));
    const palette = ["#ffffff", "#c9dfff", "#ffe9c9", "#e7cfa3"];
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        size: Math.random() * 1.4 + .3,
        baseAlpha: Math.random() * .5 + .2,
        twinkleSpeed: Math.random() * .002 + .0005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }

    const nebulae = [
      { x: w * .25, y: h * .35, r: Math.min(w, h) * .45, dx: .04, dy: -.02, phase: 0, color: [201, 163, 107] },
      { x: w * .8, y: h * .65, r: Math.min(w, h) * .38, dx: -.03, dy: .025, phase: 2, color: [107, 140, 174] },
      { x: w * .55, y: h * .2, r: Math.min(w, h) * .42, dx: .02, dy: .03, phase: 4, color: [138, 107, 200] },
    ];

    const meteors = [];

    const baseResize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    baseResize();
    starfieldResize = baseResize;
    window.addEventListener("resize", starfieldResize, { passive: true });

    let lastT = performance.now();
    function frame(now) {
      if (!document.body.contains(canvas)) return;
      const Wv = W(), Hv = H();
      ctx.clearRect(0, 0, Wv, Hv);

      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const globalAlpha = isLight ? .45 : 1;

      // 星云
      if (!prefersReduced) {
        nebulae.forEach((n) => {
          n.x += n.dx; n.y += n.dy; n.phase += .0004;
          if (n.x < -n.r) n.x = Wv + n.r;
          if (n.x > Wv + n.r) n.x = -n.r;
          if (n.y < -n.r) n.y = Hv + n.r;
          if (n.y > Hv + n.r) n.y = -n.r;
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
          const a = (Math.sin(n.phase) * .012 + .028) * globalAlpha;
          g.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${a})`);
          g.addColorStop(.55, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${a * .35})`);
          g.addColorStop(1, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0)`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, Wv, Hv);
        });
      }

      // 流星生成
      if (!prefersReduced && Math.random() < .018) {
        meteors.push({
          x: Math.random() * Wv * .75 - Wv * .1,
          y: -30 - Math.random() * 80,
          len: 90 + Math.random() * 110,
          speed: 6 + Math.random() * 8,
          angle: Math.PI / 4 + (Math.random() - .5) * .35,
          opacity: .55 + Math.random() * .45,
          life: 1,
        });
      }

      // 星星
      stars.forEach((s) => {
        const tw = Math.sin(now * s.twinkleSpeed + s.twinklePhase) * .3 + 1;
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * tw)) * globalAlpha;
        const mx = prefersReduced ? 0 : -starMouse.x * s.z * 16;
        const my = prefersReduced ? 0 : -starMouse.y * s.z * 10;
        ctx.beginPath();
        ctx.arc(s.x + mx, s.y + my, s.size * (.8 + s.z * .7), 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 流星
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.life -= .0055;
        if (m.life <= 0 || m.x > Wv + 120 || m.y > Hv + 120) { meteors.splice(i, 1); continue; }
        const tailX = m.x - Math.cos(m.angle) * m.len;
        const tailY = m.y - Math.sin(m.angle) * m.len;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        const mo = m.opacity * m.life * globalAlpha;
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, `rgba(255,255,255,${mo})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${mo})`;
        ctx.fill();
      }

      starfieldRAF = requestAnimationFrame(frame);
    }
    starfieldRAF = requestAnimationFrame(frame);
  }

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ---------------- 启动 ---------------- */
  applyTheme();
  bindGlobal();
  if (!location.hash) location.hash = "#/";
  renderRoute({ scrollTop: true });
  updateStaticI18n();
})();
