/* ============================================================
   林默 · 艺术家作品集  ——  原生交互脚本
   三语 / 主题 / 粒子星座 / 移动菜单 / 滚动揭示 / 数字滚动 /
   合集封面墙 / 传送门展开 / 作品左右滑动 / 3D 倾斜 / 文字乱码揭示
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
    const cur = document.getElementById("langCurrent");
    if (cur) cur.textContent = LANG_BADGE[l];
    document.querySelectorAll("#langMenu li").forEach((li) => {
      li.classList.toggle("active", li.dataset.lang === l);
    });
    renderCollections();
    renderTimeline();
    // Hero 名字做乱码揭示
    const hn = document.querySelector(".hero__name");
    if (hn) scramble(hn, dict["hero.name"]);
  }

  /* ---------------- 程序化抽象艺术（SVG data-uri） ---------------- */
  function artSVG(colors, seed) {
    const [a, b] = colors;
    const r = mulberry(seed);
    let shapes = "";
    shapes += `<defs>
      <linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient>
      <radialGradient id="r${seed}" cx="${20 + r() * 60}%" cy="${20 + r() * 60}%" r="70%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <filter id="b${seed}"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>`;
    shapes += `<rect width="400" height="500" fill="url(#g${seed})"/>`;
    for (let i = 0; i < 4; i++) {
      const cx = r() * 400, cy = r() * 500, rad = 40 + r() * 120;
      shapes += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${i % 2 ? a : b}" opacity="0.5" filter="url(#b${seed})"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const y = r() * 500;
      shapes += `<line x1="0" y1="${y}" x2="400" y2="${y + (r() - 0.5) * 160}" stroke="#ffffff" stroke-opacity="${0.08 + r() * 0.12}" stroke-width="${1 + r() * 2}"/>`;
    }
    for (let i = 0; i < 6; i++) {
      shapes += `<circle cx="${r() * 400}" cy="${r() * 500}" r="${2 + r() * 4}" fill="#ffffff" opacity="${0.2 + r() * 0.5}"/>`;
    }
    shapes += `<rect width="400" height="500" fill="url(#r${seed})"/>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">${shapes}</svg>`
    );
  }
  function mulberry(seed) {
    let t = seed + 0x6d2b79f5;
    return function () {
      t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- 渲染合集封面墙 ---------------- */
  const worksGrid = document.getElementById("worksGrid");
  function renderCollections() {
    if (!worksGrid) return;
    const enter = I18N[lang]["works.enter"] || "View";
    worksGrid.innerHTML = COLLECTIONS.map((c) => {
      const title = c.title[lang] || c.title.en;
      const catLabel = I18N[lang]["filter." + c.cat] || c.cat;
      const cover = c.coverImg
        ? `url('${c.coverImg}')`
        : `url('${artSVG(c.cover, (c.id.charCodeAt(1) || 7) * 97)}')`;
      return `<article class="work collection" data-id="${c.id}" data-cat="${c.cat}">
        <div class="work__art" style="background:${cover}; background-size:cover; background-position:center"></div>
        <span class="work__year">${c.year}</span>
        <div class="work__meta">
          <div class="work__title">${title}</div>
          <div class="work__cat">${catLabel}</div>
          <div class="work__enter">${enter}</div>
        </div>
      </article>`;
    }).join("");
    worksGrid.querySelectorAll(".collection").forEach((el) => attachTilt(el, 8));
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

  /* ---------------- 合集筛选 ---------------- */
  const filters = document.getElementById("filters");
  if (filters) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      worksGrid.querySelectorAll(".collection").forEach((card) => {
        card.classList.toggle("hide", !(f === "all" || card.dataset.cat === f));
      });
    });
  }

  /* ---------------- 合集详情浮层（画廊查看器：顶部大图 + 弧形缩略图） ---------------- */
  const collectionView = document.getElementById("collectionView");
  const cvCat = document.getElementById("cvCat");
  const cvTitle = document.getElementById("cvTitle");
  const cvYear = document.getElementById("cvYear");
  const cvMainArt = document.getElementById("cvMainArt");
  const cvMainDesc = document.getElementById("cvMainDesc");
  const cvArcTrack = document.getElementById("cvArcTrack");
  const cvClose = document.getElementById("cvClose");
  const cvArcClose = document.getElementById("cvArcClose");
  const cvCounter = document.getElementById("cvCounter");
  let lastX = window.innerWidth / 2, lastY = window.innerHeight / 2;
  let currentWorks = [];   // 当前合集的作品数组
  let currentIndex = 0;    // 当前展示的作品索引

  function openCollection(id, x, y) {
    const col = COLLECTIONS.find((c) => c.id === id);
    if (!col || !collectionView) return;
    lastX = x; lastY = y;
    currentWorks = col.works;
    currentIndex = 0;

    // 头部信息
    cvCat.textContent = I18N[lang]["filter." + col.cat] || col.cat;
    cvTitle.textContent = col.title[lang] || col.title.en;
    cvYear.textContent = col.year;

    // 渲染弧形缩略图
    renderArcThumbs(col.works);

    // 显示第一张
    showWork(0);

    collectionView.classList.add("open");
    collectionView.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");

    // 传送门：从点击点撑开
    collectionView.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      collectionView.style.clipPath = `circle(150% at ${x}px ${y}px)`;
    }));
  }

  /* 渲染弧形缩略图 —— 沿扑克牌扇形排列 */
  function renderArcThumbs(works) {
    if (!cvArcTrack) return;
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7"];

    cvArcTrack.innerHTML = works.map((w, i) => {
      const suit = suits[i % suits.length];
      const rank = ranks[i % ranks.length];
      const isRed = suit === "♥" || suit === "♦";
      const suitColor = isRed ? "#dc2626" : "#0a0a12";
      const artUrl = w.img || artSVG(w.c, w.id * 131);
      return `<button class="cv__thumb${i === 0 ? " active" : ""}" data-idx="${i}"
        style="--rank-color: ${suitColor}"
        aria-label="${w.title[lang] || w.title.en}">
        <span class="cv__thumb-art" style="background:url('${artUrl}') center/cover"></span>
        <span class="cv__thumb-rank">${rank}</span>
        <span class="cv__thumb-suit">${suit}</span>
      </button>`;
    }).join("");

    // 沿半圆弧排列：中心是关闭按钮，缩略图左右对称分布
    const thumbs = cvArcTrack.querySelectorAll(".cv__thumb");
    const count = thumbs.length;
    const radius = count <= 5 ? 160 : count <= 7 ? 200 : 240;
    const startAngle = -80; // 起始角度（左端）
    const endAngle = 80;    // 结束角度（右端）
    const angleStep = count > 1 ? (endAngle - startAngle) / (count - 1) : 0;

    thumbs.forEach((thumb, i) => {
      const angle = startAngle + angleStep * i;
      const rad = (angle * Math.PI) / 180;
      const tx = Math.sin(rad) * radius;
      const ty = -Math.cos(rad) * radius * 0.4; // 压扁 Y 轴让弧更扁平自然
      const tilt = angle * 0.55; // 扑克牌扇形旋转
      thumb.style.setProperty('--tx', `${tx}px`);
      thumb.style.setProperty('--ty', `${ty}px`);
      thumb.style.setProperty('--tilt', `${tilt}deg`);

      // 点击切换
      thumb.addEventListener("click", () => showWork(i));
    });
  }

  /* 切换顶部大图 */
  function showWork(idx) {
    if (idx < 0 || idx >= currentWorks.length) return;
    const prevIdx = currentIndex;
    currentIndex = idx;
    const w = currentWorks[idx];

    // 切换动画
    if (cvMainArt) {
      cvMainArt.classList.add("switching");
      const bigUrl = w.img || artSVG(w.c, w.id * 131 + 99);
      setTimeout(() => {
        cvMainArt.style.backgroundImage = `url('${bigUrl}')`;
        cvMainArt.classList.remove("switching");
      }, 220);
    }

    // 更新信息
    if (cvMainDesc) {
      cvMainDesc.textContent = w.desc ? (w.desc[lang] || w.desc.en || "") : "";
    }

    // 更新计数器
    if (cvCounter) {
      cvCounter.textContent = `${idx + 1} / ${currentWorks.length}`;
    }

    // 更新缩略图 active 状态
    const thumbs = cvArcTrack.querySelectorAll(".cv__thumb");
    thumbs.forEach((t, i) => t.classList.toggle("active", i === idx));
  }

  function closeCollection() {
    if (!collectionView || !collectionView.classList.contains("open")) return;
    collectionView.style.clipPath = `circle(0px at ${lastX}px ${lastY}px)`;
    setTimeout(() => {
      collectionView.classList.remove("open");
      collectionView.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lock");
      currentWorks = []; currentIndex = 0;
    }, 620);
  }

  if (worksGrid) {
    worksGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".collection");
      if (!card) return;
      openCollection(card.dataset.id, e.clientX, e.clientY);
    });
  }
  if (cvClose) cvClose.addEventListener("click", closeCollection);
  if (cvArcClose) cvArcClose.addEventListener("click", closeCollection);
  if (collectionView) {
    collectionView.addEventListener("click", (e) => { if (e.target === collectionView) closeCollection(); });
  }
  // 键盘：Esc 关闭，← → 切换作品
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCollection();
    if (collectionView && collectionView.classList.contains("open")) {
      if (e.key === "ArrowRight") showWork(currentIndex + 1);
      if (e.key === "ArrowLeft") showWork(currentIndex - 1);
    }
  });

  /* ---------------- 3D 倾斜 ---------------- */
  function attachTilt(el, max) {
    el.style.transformStyle = "preserve-3d";
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(8px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }

  /* ---------------- 文字乱码揭示 ---------------- */
  function scramble(el, finalText) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*@/\\<>[]{}=+";
    let frame = 0;
    const total = finalText.length * 2 + 14;
    clearInterval(el._scr);
    el._scr = setInterval(() => {
      let out = "";
      for (let i = 0; i < finalText.length; i++) {
        out += i < frame / 2 ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      frame++;
      if (frame > total) { clearInterval(el._scr); el.textContent = finalText; }
    }, 26);
  }

  /* ---------------- 语言菜单交互 ---------------- */
  const langWrap = document.getElementById("lang");
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  if (langBtn && langMenu) {
    langBtn.addEventListener("click", (e) => { e.stopPropagation(); langWrap.classList.toggle("open"); });
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
      if (e.target.tagName === "A") { navToggle.classList.remove("open"); navLinks.classList.remove("open"); }
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
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------------- 数字滚动统计 ---------------- */
  function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1400, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  const statIO = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { countUp(en.target); statIO.unobserve(en.target); }
    }),
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => statIO.observe(el));

  /* ---------------- 导航高亮当前区块 ---------------- */
  const sections = ["about", "works", "exhibitions", "contact"]
    .map((id) => document.getElementById(id)).filter(Boolean);
  const navAnchors = navLinks ? navLinks.querySelectorAll("a") : [];
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) navAnchors.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }),
    { threshold: 0.5 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------------- 复制邮箱 ---------------- */
  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard?.writeText("studio@linmo.art").then(() => {
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
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 18000) { p.x += dx * 0.0012; p.y += dy * 0.0012; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = theme === "light" ? "rgba(22,20,31,0.5)" : "rgba(255,255,255,0.7)";
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
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
    resize(); tick();
  }

  /* ---------------- 年份 ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- 启动 ---------------- */
  applyLang(lang);
})();
