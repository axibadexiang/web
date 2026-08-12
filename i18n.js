/* ============================================================
   多语言字典 —— 中 / 英 / 德
   i18n[lang][key] 通过 data-i18n 属性绑定到 DOM
   ============================================================ */
const I18N = {
  zh: {
    "nav.about": "关于",
    "nav.works": "作品",
    "nav.exhibitions": "展览",
    "nav.contact": "联系",
    "hero.role": "视觉艺术家 · 混合媒介创作者",
    "hero.name": "林 默",
    "hero.tagline": "用光、色与静默，在画布与代码之间造一座桥。",
    "hero.cta": "进入作品",
    "hero.scroll": "向下滚动",
    "about.title": "关于我",
    "about.p1": "我是一名游走于绘画、数字艺术与空间装置之间的独立艺术家。作品关注城市缝隙里的光，以及人如何在喧嚣中保留一小片安静。",
    "about.p2": "近年我尝试把算法生成的纹理与传统手绘叠加，让画面既有机又陌生。每一件作品都是一次与偶然的握手。",
    "about.stat1": "展出",
    "about.stat2": "作品",
    "about.stat3": "国家",
    "works.title": "作品合集",
    "works.subtitle": "点击封面进入合集，底部缩略图切换作品。",
    "works.enter": "查看合集 →",
    "filter.all": "全部",
    "filter.painting": "绘画",
    "filter.digital": "数字艺术",
    "filter.sculpture": "雕塑",
    "filter.photography": "摄影",
    "cv.close": "关闭",
    "cv.hint": "拖动 / 滚动 / 方向键，左右浏览作品",
    "cv.count": "{n} 件作品",
    "marquee": "绘画 · 数字艺术 · 雕塑 · 摄影 · 光影 · 静默 · 偶然 · 桥 ·",
    "exhibitions.title": "展览历程",
    "exhibitions.subtitle": "个展与群展精选。",
    "contact.title": "联系我",
    "contact.subtitle": "合作、收藏或只是想打个招呼 —— 都欢迎。",
    "contact.emailLabel": "邮箱",
    "contact.studioLabel": "工作室",
    "contact.copy": "复制",
    "contact.copied": "已复制",
    "footer.rights": "保留所有权利。",
    "footer.made": "以原生 HTML / CSS / JS 手作而成。",
    "lang.label": "语言"
  },
  en: {
    "nav.about": "About",
    "nav.works": "Works",
    "nav.exhibitions": "Exhibitions",
    "nav.contact": "Contact",
    "hero.role": "Visual Artist · Mixed-Media Maker",
    "hero.name": "Lin Mo",
    "hero.tagline": "Building a bridge between canvas and code with light, color and silence.",
    "hero.cta": "Enter Works",
    "hero.scroll": "Scroll down",
    "about.title": "About Me",
    "about.p1": "I'm an independent artist moving between painting, digital art and spatial installation. My work looks at the light in the cracks of the city, and how people keep a small quiet space amid the noise.",
    "about.p2": "Lately I overlay algorithm-generated texture onto hand drawing, so the image feels both organic and strange. Every piece is a handshake with chance.",
    "about.stat1": "Shows",
    "about.stat2": "Works",
    "about.stat3": "Countries",
    "works.title": "Collections",
    "works.subtitle": "Tap a cover to enter, tap thumbnails below to switch artworks.",
    "works.enter": "View set →",
    "filter.all": "All",
    "filter.painting": "Painting",
    "filter.digital": "Digital",
    "filter.sculpture": "Sculpture",
    "filter.photography": "Photo",
    "cv.close": "Close",
    "cv.hint": "Drag / scroll / arrow keys to browse",
    "cv.count": "{n} works",
    "marquee": "PAINTING · DIGITAL · SCULPTURE · PHOTO · LIGHT · SILENCE · CHANCE · BRIDGE ·",
    "exhibitions.title": "Exhibitions",
    "exhibitions.subtitle": "Selected solo and group shows.",
    "contact.title": "Get in Touch",
    "contact.subtitle": "For collaboration, collection, or just a hello — all welcome.",
    "contact.emailLabel": "Email",
    "contact.studioLabel": "Studio",
    "contact.copy": "Copy",
    "contact.copied": "Copied",
    "footer.rights": "All rights reserved.",
    "footer.made": "Handcrafted with vanilla HTML / CSS / JS.",
    "lang.label": "Language"
  },
  de: {
    "nav.about": "Über",
    "nav.works": "Werke",
    "nav.exhibitions": "Ausstellungen",
    "nav.contact": "Kontakt",
    "hero.role": "Visuelle Künstlerin · Mixed-Media",
    "hero.name": "Lin Mo",
    "hero.tagline": "Eine Brücke aus Licht, Farbe und Stille zwischen Leinwand und Code.",
    "hero.cta": "Werke öffnen",
    "hero.scroll": "Nach unten scrollen",
    "about.title": "Über mich",
    "about.p1": "Ich bin eine unabhängige Künstlerin zwischen Malerei, Digitalkunst und Rauminstallation. Meine Arbeit sucht das Licht in den Rissen der Stadt und wie Menschen mitten im Lärm eine kleine stille Stelle bewahren.",
    "about.p2": "Neuerdings lege ich algorithmisch erzeugte Texturen über das Handzeichnen, sodass das Bild zugleich organisch und fremd wirkt. Jedes Stück ist ein Händedruck mit dem Zufall.",
    "about.stat1": "Ausstellungen",
    "about.stat2": "Werke",
    "about.stat3": "Länder",
    "works.title": "Kollektionen",
    "works.subtitle": "Titeldeckel antippen, unten Thumbnails zum Wechseln.",
    "works.enter": "Set öffnen →",
    "filter.all": "Alle",
    "filter.painting": "Malerei",
    "filter.digital": "Digital",
    "filter.sculpture": "Skulptur",
    "filter.photography": "Foto",
    "cv.close": "Schließen",
    "cv.hint": "Ziehen / scrollen / Pfeiltasten zum Blättern",
    "cv.count": "{n} Werke",
    "marquee": "MALEREI · DIGITAL · SKULPTUR · FOTO · LICHT · STILLE · ZUFALL · BRÜCKE ·",
    "exhibitions.title": "Ausstellungen",
    "exhibitions.subtitle": "Ausgewählte Einzel- und Gruppenausstellungen.",
    "contact.title": "Kontakt",
    "contact.subtitle": "Für Zusammenarbeit, Sammlung oder nur ein Hallo — alles willkommen.",
    "contact.emailLabel": "E-Mail",
    "contact.studioLabel": "Atelier",
    "contact.copy": "Kopieren",
    "contact.copied": "Kopiert",
    "footer.rights": "Alle Rechte vorbehalten.",
    "footer.made": "Handgemacht mit Vanilla HTML / CSS / JS.",
    "lang.label": "Sprache"
  }
};

/* 作品合集：每个合集 = 一个封面 + 多件作品（左右滑动浏览） */
const COLLECTIONS = [
  {
    id: "c1", cat: "painting", year: 2023,
    title: { zh: "星夜回响", en: "Echoes of a Starry Night", de: "Echoes einer sternklaren Nacht" },
    coverImg: "imgs/1.jpg",
    cover: ["#ff7a59", "#ffd56b"],
    works: [
      { id: 11, cat: "painting", year: 2023, img: "imgs/1.jpg", c: ["#ff9a76", "#ffd56b"], title: { zh: "初醒", en: "First Awake", de: "Erstes Erwachen" }, desc: { zh: "晨光穿透薄雾的瞬间，画布上第一抹暖色。", en: "The moment dawn light cuts through thin mist — the first warm hue on canvas.", de: "Der Moment, in dem Morgenlicht durch dichten Nebel bricht." } },
      { id: 12, cat: "painting", year: 2023, img: "imgs/2.jpg", c: ["#ff7a59", "#ffb088"], title: { zh: "潮声", en: "Tide Sound", de: "Gezeitenklang" }, desc: { zh: "海浪退去后留在沙滩上的声音，被颜料记录下来。", en: "The sound waves leave on sand, captured in pigment.", de: "Der Klang, den Wellen im Sand zurücklassen, festgehalten in Pigment." } },
      { id: 13, cat: "painting", year: 2022, img: "imgs/3.jpg", c: ["#ffb088", "#ffe29a"], title: { zh: "夜航", en: "Night Voyage", de: "Nachtfahrt" }, desc: { zh: "一艘船在星夜中航行，只有灯塔知道它的方向。", en: "A ship sails under starlight — only the lighthouse knows its heading.", de: "Ein Schiff segelt unter Sternenlicht — nur der Leuchtturm kennt seinen Kurs." } },
      { id: 14, cat: "painting", year: 2023, img: "imgs/4.jpg", c: ["#e2533b", "#ff9a76"], title: { zh: "余烬", en: "Ember", de: "Asche" }, desc: { zh: "火熄灭后最后一点温度，在灰烬中微微发亮。", en: "The last warmth after fire dies — a faint glow among ashes.", de: "Die letzte Wärme nach dem Feuer — ein schwaches Leuchten in der Asche." } },
      { id: 15, cat: "painting", year: 2021, img: "imgs/5.jpg", c: ["#ff8a5c", "#ffd9a0"], title: { zh: "远星", en: "Distant Star", de: "Ferner Stern" }, desc: { zh: "那颗星已经走了很久，但光才刚刚到达你的眼睛。", en: "That star left long ago — its light just reached your eyes.", de: "Jener Stern ist schon lange fort — sein Licht erreicht gerade deine Augen." } }
    ]
  },
  {
    id: "c2", cat: "digital", year: 2024,
    title: { zh: "霓虹裂隙", en: "Neon Rift", de: "Neonriss" },
    coverImg: "imgs/2.jpg",
    cover: ["#7b5cff", "#22d3ee"],
    works: [
      { id: 21, cat: "digital", year: 2024, c: ["#7b5cff", "#22d3ee"], title: { zh: "数据雨", en: "Data Rain", de: "Datentregen" }, desc: { zh: "代码如雨般落下，在屏幕上汇成一条发光的河。", en: "Code falls like rain, converging into a luminous river on screen.", de: "Code fällt wie Regen und wird zu einem leuchtenden Fluss auf dem Bildschirm." } },
      { id: 22, cat: "digital", year: 2024, c: ["#7b5cff", "#a06bff"], title: { zh: "故障之美", en: "Glitch Beauty", de: "Schönheit des Fehlers" }, desc: { zh: "错误不是缺陷，是系统在说一种我们还没学会的语言。", en: "A glitch isn't a bug — it's the system speaking a language we haven't learned.", de: "Ein Fehler ist kein Bug — das System spricht eine Sprache, die wir noch nicht gelernt haben." } },
      { id: 23, cat: "digital", year: 2023, c: ["#22d3ee", "#5cffd0"], title: { zh: "电流", en: "Current", de: "Strom" }, desc: { zh: "看不见的电子在导线中奔涌，被算法可视化成光的脉络。", en: "Invisible electrons surge through wires — algorithms visualize them as veins of light.", de: "Unsichtbare Elektronen strömen durch Drähte — Algorithmen visualisieren sie als Lichtadern." } },
      { id: 24, cat: "digital", year: 2024, c: ["#5c8bff", "#22d3ee"], title: { zh: "像素海", en: "Pixel Sea", de: "Pixelmeer" }, desc: { zh: "无数个方点组成一片海，近看是颗粒，远看是浪潮。", en: "Countless squares form an ocean — up close it's grains, from afar it's waves.", de: "Zahllose Quadrate bilden ein Meer — nah Körner, fern Wellen." } },
      { id: 25, cat: "digital", year: 2024, c: ["#ff5ca8", "#7b5cff"], title: { zh: "合成黎明", en: "Synthetic Dawn", de: "Synthetischer Morgen" }, desc: { zh: "太阳没有升起，但屏幕亮了。这是属于数字时代的黎明。", en: "The sun didn't rise — but screens lit up. A dawn for the digital age.", de: "Die Sonne ist nicht aufgegangen — aber die Bildschirme leuchten. Eine Morgenröte für das digitale Zeitalter." } }
    ]
  },
  {
    id: "c3", cat: "sculpture", year: 2022,
    title: { zh: "静默之形", en: "Form of Silence", de: "Form der Stille" },
    coverImg: "imgs/3.jpg",
    cover: ["#c9a36b", "#7a5a3a"],
    works: [
      { id: 31, cat: "sculpture", year: 2022, c: ["#c9a36b", "#7a5a3a"], title: { zh: "石语", en: "Stone Whisper", de: "Steinflüstern" }, desc: { zh: "这块石头在山里待了三百万年，现在它开始说话。", en: "This stone waited three million years in the mountain — now it speaks.", de: "Dieser Stein wartete drei Millionen Jahre im Gebirge — jetzt spricht er." } },
      { id: 32, cat: "sculpture", year: 2021, c: ["#b9925a", "#5a4023"], title: { zh: "折叠", en: "Fold", de: "Falte" }, desc: { zh: "空间被折叠后，里面藏着一个你从未见过的角度。", en: "When space folds, it hides an angle you've never seen.", de: "Wenn sich Raum faltet, verbirgt er einen Winkel, den du nie gesehen hast." } },
      { id: 33, cat: "sculpture", year: 2023, c: ["#d8b878", "#8a6a3a"], title: { zh: "呼吸的铜", en: "Breathing Bronze", de: "Atmendes Bronze" }, desc: { zh: "铜的表面随温度变化而改变颜色，像是在呼吸。", en: "The bronze surface shifts color with temperature — as if breathing.", de: "Die Bronzenoberfläche ändert ihre Farbe mit der Temperatur — als würde sie atmen." } },
      { id: 34, cat: "sculpture", year: 2022, c: ["#a8895a", "#6b4f2e"], title: { zh: "空壳", en: "Empty Shell", de: "Leere Schale" }, desc: { zh: "外壳还在，里面的东西已经走了。留下的只有形状和回声。", en: "The shell remains; what's inside has gone. Only shape and echo stay.", de: "Die Schale bleibt; was drinnen war, ist fort. Nur Form und Echo bleiben." } }
    ]
  },
  {
    id: "c4", cat: "photography", year: 2023,
    title: { zh: "雾中行者", en: "Walker in the Mist", de: "Wanderer im Nebel" },
    coverImg: "imgs/4.jpg",
    cover: ["#5b7c99", "#c7d6e6"],
    works: [
      { id: 41, cat: "photography", year: 2023, c: ["#5b7c99", "#c7d6e6"], title: { zh: "晨雾", en: "Morning Fog", de: "Morgennebel" }, desc: { zh: "城市还没醒，雾已经把一切包裹在柔软的灰蓝色里。", en: "The city hasn't woken — fog has wrapped everything in soft blue-grey.", de: "Die Stadt ist noch nicht wach — der Nebel hat alles in weiches Blaugrau gehüllt." } },
      { id: 42, cat: "photography", year: 2022, c: ["#6b7f99", "#dfe7f0"], title: { zh: "桥下", en: "Under the Bridge", de: "Unter der Brücke" }, desc: { zh: "桥上的人匆匆走过，没人注意到桥下那片被遗忘的光。", en: "People rush across above — nobody notices the forgotten light beneath.", de: "Leute eilen drüber hinweg — niemand bemerkt das vergessene Licht darunter." } },
      { id: 43, cat: "photography", year: 2023, c: ["#7a8aa0", "#e6ecf3"], title: { zh: "无人街", en: "Empty Street", de: "Leere Straße" }, desc: { zh: "凌晨四点的街道，只有路灯和一只猫知道这里发生了什么。", en: "4 AM street — only streetlights and a cat know what happened here.", de: "4 Uhr morgens — nur Straßenlaternen und eine Katze wissen, was hier geschah." } },
      { id: 44, cat: "photography", year: 2021, c: ["#5e7790", "#d3deea"], title: { zh: "窗", en: "Window", de: "Fenster" }, desc: { zh: "窗户是画框，外面是世界，里面是一个人的秘密。", en: "A window is a frame — outside the world, inside a person's secret.", de: "Ein Fenster ist ein Rahmen — draußen die Welt, drinnen ein Geheimnis." } },
      { id: 45, cat: "photography", year: 2022, c: ["#6f88a3", "#e9eef5"], title: { zh: "倒影", en: "Reflection", de: "Spiegelung" }, desc: { zh: "水面上的倒影比真实更真实，因为它多了一层时间的涟漪。", en: "The reflection on water feels more real than reality — it carries ripples of time.", de: "Das Spiegelbild auf dem Wasser wirkt wirklicher als die Wirklichkeit — es trägt Zeitwellen in sich." } }
    ]
  }
];

/* 展览时间线 */
const EXHIBITIONS = [
  { year: 2024, title: { zh: "个展：边界之外", en: "Solo: Beyond Boundaries", de: "Einzelausstellung: Jenseits der Grenzen" }, place: { zh: "上海当代艺术馆", en: "Shanghai MoCA", de: "Museum für zeitgenössische Kunst, Shanghai" } },
  { year: 2023, title: { zh: "群展：潮湿的信号", en: "Group: Wet Signals", de: "Gruppe: Feuchte Signale" }, place: { zh: "柏林 Kunsthalle", en: "Berlin Kunsthalle", de: "Berlin Kunsthalle" } },
  { year: 2022, title: { zh: "群展：无声生长", en: "Group: Silent Growth", de: "Gruppe: Stilles Wachstum" }, place: { zh: "东京 3331 艺术中心", en: "Tokyo 3331 Arts", de: "Tokio 3331 Arts" } },
  { year: 2021, title: { zh: "个展：第一束光", en: "Solo: First Light", de: "Einzelausstellung: Erstes Licht" }, place: { zh: "成都 麓湖 A4", en: "Chengdu A4", de: "Chengdu A4" } }
];
