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
  let musicPlayRequested = localStorage.getItem("yz-music-play") !== "false";

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
      updateMusicUI();
      return true;
    } catch (err) {
      // 被浏览器自动播放策略拦截：保留 intent，等待用户首次交互再启动
      updateMusicUI();
      return false;
    }
  }

  function pauseMusic() {
    audio.pause();
    musicPlayRequested = false;
    localStorage.setItem("yz-music-play", "false");
    updateMusicUI();
  }

  function toggleMusic() {
    if (audio.paused) { musicPlayRequested = true; tryPlay(); }
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
    const titles = {
      zh: "尤浈棋 · 摄影作品集",
      en: "Yóu Zhēnqí · Photography",
      de: "Yóu Zhēnqí · Fotografie",
    };
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
    const cards = PROJECTS.map(
      (p, i) => `
      <article class="card reveal" style="--i:${i % 3 === 1 ? 1 : 0}; --rot:${
        i % 2 ? 7 : -7
      }deg;">
        <a class="card__inner" href="#/project/${p.id}" data-link>
          <span class="card__index">${String(i + 1).padStart(2, "0")}</span>
          <span class="card__plus">+</span>
          <div class="card__img"><img src="${p.cover}" alt="${esc(
        p.title[state.lang]
      )}" loading="lazy"></div>
          <div class="card__overlay">
            <div class="card__meta">
              <h3>${esc(p.title[state.lang])}</h3>
              <p>${p.year} · ${esc(p.medium[state.lang])}</p>
            </div>
          </div>
        </a>
      </article>`
    ).join("");

    $("#app").innerHTML = `
      <section class="hero" id="hero">
        <div class="hero__bg">
          <span class="hero__orb o1" data-depth="26"></span>
          <span class="hero__orb o2" data-depth="44"></span>
          <canvas class="starfield" id="starfield" aria-hidden="true"></canvas>
        </div>
        <div class="hero__inner" data-depth="10">
          <p class="hero__kicker" data-i18n="hero_kicker">${t.hero_kicker}</p>
          <h1 class="hero__title"><span class="line"><span>${esc(
            t.hero_title
          )}</span></span></h1>
          <p class="hero__sub" data-i18n="hero_sub">${t.hero_sub}</p>
        </div>
        <div class="hero__scroll" data-i18n="hero_scroll">${t.hero_scroll}</div>
      </section>

      <section class="section" id="works">
        <div class="section__head">
          <h2 class="section__title reveal"><small>PORTFOLIO</small>${esc(
            t.works_title
          )}</h2>
          <p class="section__sub reveal" data-i18n="works_sub">${
            t.works_sub
          }</p>
        </div>
        <div class="works-grid">${cards}</div>
      </section>

      <section class="section" id="about">
        <div class="section__head">
          <h2 class="section__title reveal"><small>PROFILE</small><span data-i18n="about_title">${
            t.about_title
          }</span></h2>
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
          <h2 class="section__title reveal"><small>CONTACT</small><span data-i18n="contact_title">${
            t.contact_title
          }</span></h2>
        </div>
        <p class="reveal" style="max-width:46ch;color:var(--fg-soft)" data-i18n="contact_text">${
          t.contact_text
        }</p>
        <ul class="contact-list reveal">
          <li><span class="k" data-i18n="contact_email">${
            t.contact_email
          }</span><span class="v">studio@youzhenqi.art</span></li>
          <li><span class="k" data-i18n="contact_studio">${
            t.contact_studio
          }</span><span class="v">Shanghai · 上海</span></li>
        </ul>
      </section>`;
  }

  /* ---------------- 渲染：详情 ---------------- */
  function renderDetail(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) {
      location.hash = "#/";
      return;
    }
    const t = I18N[state.lang];
    const idx = PROJECTS.findIndex((x) => x.id === id);
    const next = PROJECTS[(idx + 1) % PROJECTS.length];

    const plates = p.gallery
      .map(
        (g, i) => `
      <figure class="plate reveal" style="--i:${i % 3};">
        <img src="${g.src}" alt="${esc(
          g.caption[state.lang]
        )}" data-parallax="${i % 2 ? 0.05 : -0.05}" loading="lazy">
        <figcaption class="plate__cap"><span data-i18n="detail_caption">${
          t.detail_caption
        }</span> — ${esc(g.caption[state.lang])}</figcaption>
      </figure>`
      )
      .join("");

    $("#app").innerHTML = `
      <a class="back-btn" href="#/" data-link><span data-i18n="detail_back">${
        t.detail_back
      }</span> ←</a>
      <section class="detail">
        <div class="detail__hero">
          <img src="${p.cover}" alt="${esc(
      p.title[state.lang]
    )}" id="detailCover">
          <div class="detail__herotext">
            <div class="idx">${String(idx + 1).padStart(2, "0")} / ${String(
      PROJECTS.length
    ).padStart(2, "0")}</div>
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
            <a href="#/project/${next.id}" data-link>${esc(
      next.title[state.lang]
    )} →</a>
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
        const a = pendingAnchor;
        pendingAnchor = null;
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
    setTimeout(() => {
      location.hash = href;
    }, 380);
  }

  /* ---------------- 入场动画 ---------------- */
  function setupReveal() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- 视差（滚动） ---------------- */
  let ticking = false;
  function onScrollParallax() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      $$("[data-parallax]").forEach((img) => {
        const speed = parseFloat(img.dataset.parallax);
        const r = img.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        img.style.transform = `scale(1.1) translateY(${(
          -center * speed
        ).toFixed(1)}px)`;
      });
      const cover = $("#detailCover");
      if (cover)
        cover.style.transform = `translateY(${(y * 0.16).toFixed(
          1
        )}px) scale(1.04)`;
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
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
    // 英雄鼠标视差
    const hero = $("#hero");
    if (hero) {
      hero.addEventListener("mousemove", (e) => {
        const cx = e.clientX / window.innerWidth - 0.5;
        const cy = e.clientY / window.innerHeight - 0.5;
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
        $$("[data-depth]", hero).forEach((el) => {
          el.style.transform = "";
        });
      });
    }
  }

  /* ---------------- 绑定：全局 ---------------- */
  function bindGlobal() {
    // 导航滚动态
    const nav = $("#nav");
    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 40);
        onScrollParallax();
      },
      { passive: true }
    );

    // 主题切换
    $("#themeToggle").addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
    });

    // 音乐控制
    $("#musicToggle").addEventListener("click", toggleMusic);
    $("#musicMute").addEventListener("click", toggleMute);
    updateMusicUI();

    // 进入页面尝试自动播放；若被浏览器拦截，则监听用户首次交互（点击/触摸/滚动/按键）再启动
    if (musicPlayRequested) {
      const startOnGesture = () => {
        if (musicPlayRequested && audio.paused) tryPlay();
        window.removeEventListener("pointerdown", startOnGesture);
        window.removeEventListener("touchstart", startOnGesture);
        window.removeEventListener("keydown", startOnGesture);
        window.removeEventListener("scroll", startOnGesture);
      };
      tryPlay().then((ok) => {
        if (!ok && audio.paused) {
          window.addEventListener("pointerdown", startOnGesture);
          window.addEventListener("touchstart", startOnGesture);
          window.addEventListener("keydown", startOnGesture);
          window.addEventListener("scroll", startOnGesture, { passive: true });
        }
      });
    }

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
      burger.classList.remove("is-open");
      links.classList.remove("is-open");
      if (href.charAt(1) === "/") {
        if (href === "#/" && (location.hash === "" || location.hash === "#/")) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          fadeTo(href);
        }
      }
    });

    // 锚点导航（作品/关于/联系）
    $$(
      '#navLinks a:not([data-link]), a[href^="#w"], a[href^="#a"], a[href^="#c"]'
    ).forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        e.preventDefault();
        burger.classList.remove("is-open");
        links.classList.remove("is-open");
        if (location.hash.startsWith("#/project/")) {
          pendingAnchor = href;
          fadeTo("#/");
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
        if (e.target.closest("a, button, .card__inner"))
          cur.classList.add("is-hover");
      });
      document.addEventListener("mouseout", (e) => {
        if (e.target.closest("a, button, .card__inner"))
          cur.classList.remove("is-hover");
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

  /* ---------------- 首页 Hero 背景：上半星空 + 下半黑夜大海 ---------------- */
  function initStarfield() {
    const canvas = $("#starfield");
    if (!canvas) return;
    if (starfieldRAF) cancelAnimationFrame(starfieldRAF);
    if (starfieldResize) window.removeEventListener("resize", starfieldResize);

    const ctx = canvas.getContext("2d");
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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

    const w = W(),
      h = H();
    const horizon = h * 0.58; // 海平线

    const starCount = Math.min(
      260,
      Math.max(60, Math.floor((w * horizon) / 4200))
    );
    const palette = ["#ffffff", "#c9dfff", "#ffe9c9", "#e7cfa3"];
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      const y = Math.random() * (horizon + 10);
      stars.push({
        x: Math.random() * w,
        y,
        z: Math.random(),
        size: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.002 + 0.0005,
        twinklePhase: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        reflection: y > horizon * 0.55 && Math.random() < 0.22,
      });
    }

    const nebulae = [
      {
        x: w * 0.22,
        y: horizon * 0.25,
        r: Math.min(w, horizon) * 0.42,
        dx: 0.03,
        dy: -0.015,
        phase: 0,
        color: [201, 163, 107],
      },
      {
        x: w * 0.78,
        y: horizon * 0.42,
        r: Math.min(w, horizon) * 0.35,
        dx: -0.025,
        dy: 0.02,
        phase: 2,
        color: [107, 140, 174],
      },
      {
        x: w * 0.55,
        y: horizon * 0.15,
        r: Math.min(w, horizon) * 0.4,
        dx: 0.018,
        dy: 0.022,
        phase: 4,
        color: [138, 107, 200],
      },
    ];

    const meteors = [];

    // 海浪层：越远越柔和、越近越明显（振幅加大，起伏更明显）
    const waveLayers = [];
    for (let i = 0; i < 6; i++) {
      const depth = i / 5; // 0 远 -> 1 近
      waveLayers.push({
        yBase: horizon + h * (0.02 + depth * 0.36),
        amplitude: 14 + depth * 34,
        frequency: 0.004 + depth * 0.002,
        speed: 0.22 + depth * 0.3,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.09 + depth * 0.14,
        stroke: depth < 0.5,
      });
    }

    // 船只（数量增多、分布更散）
    const boats = [];
    const boatCount = Math.min(9, Math.max(5, Math.floor(w / 230)));
    for (let i = 0; i < boatCount; i++) {
      boats.push({
        x: Math.random() * w,
        y: horizon + h * (0.06 + Math.random() * 0.34),
        size: 10 + Math.random() * 18,
        speed: 0.05 + Math.random() * 0.09,
        dir: Math.random() < 0.5 ? 1 : -1,
        phase: Math.random() * Math.PI * 2,
        bobSpeed: 0.7 + Math.random() * 0.7,
        sailColor:
          Math.random() < 0.5
            ? "rgba(220,230,245,0.9)"
            : "rgba(200,215,235,0.85)",
      });
    }

    // 星光在水面的倒影
    const reflections = stars
      .filter((s) => s.reflection)
      .map((s) => ({
        x: s.x,
        yBase: horizon + (horizon - s.y) * (0.15 + Math.random() * 0.25),
        alpha: s.baseAlpha * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0015 + Math.random() * 0.002,
        width: 8 + Math.random() * 24,
      }));

    let lastT = performance.now();

    function drawBoat(x, y, size, dir, sailColor, isLight) {
      ctx.save();
      ctx.globalAlpha = isLight ? 0.55 : 1;
      ctx.translate(x, y);
      ctx.scale(dir, 1);

      // 船身
      ctx.fillStyle = "#05080e";
      ctx.beginPath();
      ctx.moveTo(-size, -size * 0.25);
      ctx.quadraticCurveTo(
        -size * 0.3,
        size * 0.55,
        size * 0.35,
        size * 0.55
      );
      ctx.quadraticCurveTo(
        size * 0.9,
        size * 0.45,
        size,
        -size * 0.25
      );
      ctx.closePath();
      ctx.fill();

      // 桅杆
      ctx.strokeStyle = "rgba(200,210,230,0.7)";
      ctx.lineWidth = Math.max(1, size * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, size * 0.4);
      ctx.lineTo(0, -size * 1.1);
      ctx.stroke();

      // 帆
      ctx.fillStyle = sailColor;
      ctx.beginPath();
      ctx.moveTo(size * 0.08, -size * 1.0);
      ctx.quadraticCurveTo(
        size * 0.72,
        -size * 0.55,
        size * 0.08,
        -size * 0.12
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function frame(now) {
      if (!document.body.contains(canvas)) return;
      const Wv = W(),
        Hv = H();
      const horizon = Hv * 0.58;
      const isLight =
        document.documentElement.getAttribute("data-theme") === "light";
      const globalAlpha = isLight ? 0.45 : 1;
      const seaAlpha = isLight ? 0.55 : 1;
      const dt = (now - lastT) * 0.001;
      lastT = now;

      ctx.clearRect(0, 0, Wv, Hv);
      ctx.globalAlpha = 1;

      // 夜空
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
      skyGrad.addColorStop(0, "#07080c");
      skyGrad.addColorStop(0.5, "#0b0e16");
      skyGrad.addColorStop(1, "#121a2b");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, Wv, horizon);

      // 海平线辉光
      const glowAlpha = 0.35 * globalAlpha;
      const glow = ctx.createLinearGradient(0, horizon - 20, 0, horizon + 45);
      glow.addColorStop(0, "rgba(40,55,85,0)");
      glow.addColorStop(0.5, `rgba(50,70,110,${glowAlpha})`);
      glow.addColorStop(1, "rgba(40,55,85,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizon - 20, Wv, 65);

      // 星云（只在天空区域飘动）
      if (!prefersReduced) {
        nebulae.forEach((n) => {
          n.x += n.dx;
          n.y += n.dy;
          n.phase += 0.0004;
          if (n.x < -n.r) n.x = Wv + n.r;
          if (n.x > Wv + n.r) n.x = -n.r;
          if (n.y < -n.r) n.y = horizon + n.r;
          if (n.y > horizon + n.r) n.y = -n.r;
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
          const a = (Math.sin(n.phase) * 0.012 + 0.028) * globalAlpha;
          g.addColorStop(
            0,
            `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${a})`
          );
          g.addColorStop(
            0.55,
            `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${a * 0.35})`
          );
          g.addColorStop(
            1,
            `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0)`
          );
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, Wv, horizon + 20);
        });
      }

      // 流星生成
      if (!prefersReduced && Math.random() < 0.018) {
        meteors.push({
          x: Math.random() * Wv * 0.75 - Wv * 0.1,
          y: -30 - Math.random() * 80,
          len: 90 + Math.random() * 110,
          speed: 6 + Math.random() * 8,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.35,
          opacity: 0.55 + Math.random() * 0.45,
          life: 1,
        });
      }

      // 星星（只在海平线以上）
      stars.forEach((s) => {
        const tw = Math.sin(now * s.twinkleSpeed + s.twinklePhase) * 0.3 + 1;
        const alpha = Math.max(0, Math.min(1, s.baseAlpha * tw)) * globalAlpha;
        const mx = prefersReduced ? 0 : -starMouse.x * s.z * 16;
        const my = prefersReduced ? 0 : -starMouse.y * s.z * 10;
        const sx = s.x + mx,
          sy = s.y + my;
        if (sy > horizon + 4) return;
        const fade = sy > horizon - 16 ? Math.max(0, (horizon + 4 - sy) / 20) : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size * (0.8 + s.z * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha * fade;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 流星
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.life -= 0.0055;
        if (m.life <= 0 || m.x > Wv + 120 || m.y > Hv + 120) {
          meteors.splice(i, 1);
          continue;
        }
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

      // 大海
      const seaGrad = ctx.createLinearGradient(0, horizon, 0, Hv);
      seaGrad.addColorStop(0, "#0d1522");
      seaGrad.addColorStop(0.35, "#070d18");
      seaGrad.addColorStop(1, "#02040a");
      ctx.globalAlpha = seaAlpha;
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizon, Wv, Hv - horizon);
      ctx.globalAlpha = 1;

      // 星光倒影
      if (!prefersReduced) {
        reflections.forEach((r) => {
          const flicker = Math.sin(now * r.speed + r.phase) * 0.5 + 0.5;
          ctx.globalAlpha = r.alpha * flicker * globalAlpha;
          ctx.fillStyle = "#a9c6e8";
          ctx.fillRect(
            r.x,
            r.yBase + Math.sin(now * 0.001 + r.phase) * 2,
            r.width,
            1
          );
        });
        ctx.globalAlpha = 1;
      }

      // 海浪
      if (!prefersReduced) {
        waveLayers.forEach((wave) => {
          const t = now * 0.001 * wave.speed + wave.phase;
          ctx.beginPath();
          const yBase = wave.yBase + Math.sin(t) * wave.amplitude * 0.5;
          ctx.moveTo(0, Hv);
          ctx.lineTo(0, yBase);
          for (let x = 0; x <= Wv; x += 4) {
            const y =
              yBase +
              Math.sin(x * wave.frequency + t) *
                wave.amplitude *
                (1 + 0.45 * Math.sin(x * 0.01 + t));
            ctx.lineTo(x, y);
          }
          ctx.lineTo(Wv, Hv);
          ctx.closePath();
          if (wave.stroke) {
            ctx.strokeStyle = `rgba(130,155,190,${
              wave.alpha * globalAlpha
            })`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(25,45,75,${wave.alpha * seaAlpha})`;
            ctx.fill();
          }
        });
      }

      // 船只
      boats.forEach((b) => {
        if (!prefersReduced) {
          b.x += b.speed * b.dir * (dt * 60);
          if (b.x > Wv + 80) b.x = -80;
          if (b.x < -80) b.x = Wv + 80;
          b.phase += b.bobSpeed * dt;
        }
        const bob = Math.sin(b.phase + now * 0.001 * b.bobSpeed) * 6;
        const waveY = b.y + bob;
        drawBoat(b.x, waveY, b.size, b.dir, b.sailColor, isLight);
      });

      ctx.globalAlpha = 1;
      starfieldRAF = requestAnimationFrame(frame);
    }
    starfieldRAF = requestAnimationFrame(frame);
  }

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  /* ---------------- 启动 ---------------- */
  applyTheme();
  bindGlobal();
  if (!location.hash) location.hash = "#/";
  renderRoute({ scrollTop: true });
  updateStaticI18n();
})();
