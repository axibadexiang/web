/* ============================================================
   林默 · 艺术家作品集  ——  原生交互脚本
   粒子星座 / 三语切换 / 移动菜单 / 滚动揭示 / 作品筛选 /
   程序化 SVG 抽象艺术占位图 / 自定义光标辉光 / 数字滚动
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 语言持久化 ---------------- */
  const STORE_KEY = "linmo_lang";
  const LANGS = ["zh", "en", "de"];
  const LANG_BADGE = { zh: "中", en: "EN", de: "DE" };
  let lang = localStorage.getItem(STORE_KEY) || "zh";
  if (!LANGS.includes(lang)) lang = "zh";

  /* ---------------- 主题持久化（白天 / 黑夜） ---------------- */
  const THEME_KEY = "linmo_theme";
  let theme = localStorage.getItem(THEME_KEY) || "dark";
  if (theme !== "light" && theme !== "dark") theme = "dark";
  function applyTheme(t) {
    theme = t;
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);
    const tg = document.getElementById("themeToggle");
    if (tg) tg.setAttribute("aria-pressed", String(t === "light"));
  }
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }
  applyTheme(theme);

  /* ---------------- 应用文案 ---------------- */
  function applyLang(l) {
    document.documentElement.lang = l;
    const dict = I18N[l];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    // 语言按钮徽标
    const cur = document.getElementById("langCurrent");
    if (cur) cur.textContent = LANG_BADGE[l];
    // 菜单高亮
    document.querySelectorAll("#langMenu li").forEach((li) => {
      li.classList.toggle("active", li.dataset.lang === l);
    });
    // 作品 / 展览动态文案
    renderWorks();
    renderTimeline();
  }

  /* ---------------- 程序化抽象艺术（SVG data-uri） ---------------- */
  function artSVG(colors, seed) {
    const [a, b] = colors;
    const r = mulberry(seed);
    let shapes = "";
    // 流动渐变背景
    shapes += `<defs>
      <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/>
        <stop offset="1" stop-color="${b}"/>
      </linearGradient>
      <radialGradient id="r${seed}" cx="${20 + r() * 60}%" cy="${20 + r() * 60}%" r="70%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <filter id="b${seed}"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>`;
    shapes += `<rect width="400" height="500" fill="url(#g${seed})"/>`;
    // 几个柔光斑块
    for (let i = 0; i < 4; i++) {
      const cx = r() * 400, cy = r() * 500, rad = 40 + r() * 120;
      shapes += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${i % 2 ? a : b}" opacity="0.5" filter="url(#b${seed})"/>`;
    }
    // 几何线条
    for (let i = 0; i < 5; i++) {
      const y = r() * 500;
      shapes += `<line x1="0" y1="${y}" x2="400" y2="${y + (r() - 0.5) * 160}" stroke="#ffffff" stroke-opacity="${0.08 + r() * 0.12}" stroke-width="${1 + r() * 2}"/>`;
    }
    // 点缀圆
    for (let i = 0; i < 6; i++) {
      shapes += `<circle cx="${r() * 400}" cy="${r() * 500}" r="${2 + r() * 4}" fill="#ffffff" opacity="${0.2 + r() * 0.5}"/>`;
    }
    shapes += `<rect width="400" height="500" fill="url(#r${seed})"/>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">${shapes}</svg>`
    );
  }
  // 轻量确定性随机
  function mulberry(seed) {
    let t = seed + 0x6d2b79f5;
    return function () {
      t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- 渲染作品 ---------------- */
  const worksGrid = document.getElementById("worksGrid");
  function renderWorks() {
    if (!worksGrid) return;
    worksGrid.innerHTML = WORKS.map((w) => {
      const title = w.title[lang] || w.title.en;
      const catLabel = I18N[lang]["filter." + w.cat] || w.cat;
      return `<article class="work" data-cat="${w.cat}">
        <div class="work__art" style="background:url('${artSVG(w.c, w.id * 97)}') center/cover"></div>
        <span class="work__year">${w.year}</span>
        <div class="work__meta">
          <div class="work__title">${title}</div>
          <div class="work__cat">${catLabel}</div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------------- 渲染展览时间线 ---------------- */
  const timeline = document.getElementById("timeline");
  function renderTimeline() {
    if (!timeline) return;
    timeline.innerHTML = EXHIBITIONS.map((e) => {
      const t = e.title[lang] || e.title.en;
      const p = e.place[lang] || e.place.en;
      return `<div class="tl-item">
        <div class="tl-year">${e.year}</div>
        <div class="tl-title">${t}</div>
        <div class="tl-place">${p}</div>
      </div>`;
    }).join("");
  }

  /* ---------------- 作品筛选 ---------------- */
  const filters = document.getElementById("filters");
  if (filters) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      worksGrid.querySelectorAll(".work").forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("hide", !show);
      });
    });
  }

  /* ---------------- 语言菜单交互 ---------------- */
  const langWrap = document.getElementById("lang");
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  if (langBtn && langMenu) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langWrap.classList.toggle("open");
    });
    langMenu.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      lang = li.dataset.lang;
      localStorage.setItem(STORE_KEY, lang);
      langWrap.classList.remove("open");
      applyLang(lang);
    });
    document.addEventListener("click", () => langWrap.classList.remove("open"));
  }

  /* ---------------- 移动端菜单 ---------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      }
    });
  }

  /* ---------------- 导航滚动态 + 进度条 ---------------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("scrollProgress");
  function onScroll() {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", y > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- 滚动揭示 ---------------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------------- 数字滚动统计 ---------------- */
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1400; const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const statIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { countUp(en.target); statIO.unobserve(en.target); }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => statIO.observe(el));

  /* ---------------- 导航高亮当前区块 ---------------- */
  const sections = ["about", "works", "exhibitions", "contact"].map((id) => document.getElementById(id)).filter(Boolean);
  const navAnchors = navLinks ? navLinks.querySelectorAll("a") : [];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------------- 复制邮箱 ---------------- */
  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const email = "studio@linmo.art";
      navigator.clipboard?.writeText(email).then(() => {
        const old = copyBtn.textContent;
        copyBtn.textContent = I18N[lang]["contact.copied"];
        setTimeout(() => (copyBtn.textContent = old), 1400);
      });
    });
  }

  /* ---------------- 自定义光标辉光 ---------------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      gx += (tx - gx) * 0.18; gy += (ty - gy) * 0.18;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Hero 粒子星座 ---------------- */
  const canvas = document.getElementById("particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, DPR, pts = [];
    const mouse = { x: -999, y: -999 };
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.round((W * H) / 14000);
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        // 鼠标轻微吸引
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 18000) { p.x += dx * 0.0012; p.y += dy * 0.0012; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = theme === "light" ? "rgba(22,20,31,0.5)" : "rgba(255,255,255,0.7)"; ctx.fill();
      }
      // 连线
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const o = (1 - dist / 130) * 0.5;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, "rgba(123,92,255," + o + ")");
            grad.addColorStop(1, "rgba(34,211,238," + o + ")");
            ctx.strokeStyle = grad; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("mouseleave", () => { mouse.x = -999; mouse.y = -999; });
    resize();
    tick();
  }

  /* ---------------- 年份 ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- 启动 ---------------- */
  applyLang(lang);
})();
