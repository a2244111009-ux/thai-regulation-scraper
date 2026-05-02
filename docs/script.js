const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const stage1 = document.getElementById("stage1");
const stage2 = document.getElementById("stage2");
const stage3 = document.getElementById("stage3");
const stage4 = document.getElementById("about");
const heroPin = document.querySelector(".hero-pin");
const bgVideo = document.getElementById("bgVideo");
const bgOrange = document.getElementById("bgOrange");
const bgNeon = document.getElementById("bgNeon");
const playBtn = document.getElementById("playToNext");
const recordCircle = document.getElementById("recordCircle");
const countEls = Array.from(document.querySelectorAll("[data-count]"));
const mapPoints = Array.from(document.querySelectorAll(".map-point"));
const newsCards = Array.from(document.querySelectorAll(".news-card"));
const yearDots = Array.from(document.querySelectorAll(".year-dot"));
const yearTitle = document.getElementById("yearTitle");
const yearDesc = document.getElementById("yearDesc");
const walker = document.getElementById("walker");
const joinParticles = document.getElementById("joinParticles");
const sceneBridge = document.getElementById("sceneBridge");
const timelineScene = document.getElementById("timeline");
const bridgeCurrent = document.querySelector(".bridge-current");
const bridgeNext = document.querySelector(".bridge-next");
const bridgeDot = document.querySelector(".bridge-dot");
const bridgeRing = document.querySelector(".bridge-ring");
const timelineContent = document.querySelector(".timeline-content");
const timelineTrack = document.getElementById("timelineTrack");
const stage1TextEls = Array.from(document.querySelectorAll("#stage1 .eyebrow, #stage1 h1, #stage1 .meta"));
const stage2MetricEls = Array.from(document.querySelectorAll("#stage2 .metric"));
const stage3TextEls = Array.from(document.querySelectorAll("#stage3 .record-text h2, #stage3 .record-text li"));
const stage3TipEl = document.querySelector("#stage3 .play-tip");
const stage4TextEls = Array.from(document.querySelectorAll("#about .about-card h2, #about .about-card p"));
const storeHeadingEls = Array.from(document.querySelectorAll(".store-copy h2, .store-copy p"));
const storeAddressEls = Array.from(document.querySelectorAll(".store-addresses p"));
const newsTextEls = Array.from(document.querySelectorAll(".news-head .eyebrow, .news-head h2, .news-card time, .news-card h3, .news-card p"));
const joinTextEls = Array.from(document.querySelectorAll("#join header, #join .join-form"));
let timelineFlowItems = [];

const years = [
  { title: "2011", desc: "品牌启航，首家门店正式开业。" },
  { title: "2013-2015", desc: "主题门店进入核心商圈，模型逐步成熟。" },
  { title: "2016", desc: "首次跨城布局，品牌影响力持续提升。" },
  { title: "2020", desc: "完成数字化升级，强化门店精细化运营。" },
  { title: "2023", desc: "加速拓展，完善区域协同管理体系。" },
  { title: "2024-至今", desc: "7家门店持续发光，进入新增量阶段。" },
];

let currentStage = "";
let hasCounted = false;
let fastTransitionLock = false;
let heroST = null;
let timelineST = null;
let globalSnapST = null;
let sectionSnapLock = false;
let bridgeST = null;
let bridgeActive = false;
let lastTimelineProgress = -1;
let bridgeStartTop = 0;
let bridgeEndTop = 0;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function applyWaveUp(items, progress, options = {}) {
  const { stagger = 0.2, rise = 58 } = options;
  items.forEach((el, idx) => {
    const local = clamp01((progress - idx * stagger) / (1 - Math.min(0.85, stagger * (items.length - 1))));
    gsap.set(el, {
      autoAlpha: local,
      y: (1 - local) * rise,
    });
  });
}

function buildTimelineFlow() {
  if (!timelineScene) return;
  const old = timelineScene.querySelector(".timeline-year-flow");
  if (old) old.remove();

  const flow = document.createElement("div");
  flow.className = "timeline-year-flow";
  years.forEach((item, idx) => {
    const tag = document.createElement("article");
    tag.className = "timeline-year-item";
    if (idx === 0) tag.classList.add("is-main");
    const y = document.createElement("h3");
    y.className = "timeline-year-title";
    y.textContent = item.title;
    const d = document.createElement("p");
    d.className = "timeline-year-desc";
    d.textContent = item.desc;
    tag.appendChild(y);
    tag.appendChild(d);
    flow.appendChild(tag);
  });
  timelineScene.appendChild(flow);
  timelineFlowItems = Array.from(flow.querySelectorAll(".timeline-year-item"));
}

function setNavActive(key) {
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.nav === key));
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  }
}

function setStageState(el, active) {
  if (!el) return;
  el.classList.toggle("is-active", active);
}

function showOnly(target) {
  if (currentStage === target?.id) return;
  currentStage = target?.id || "";
  if (heroPin) {
    heroPin.classList.toggle("mode-stage2", target === stage2);
  }
  [stage1, stage2, stage3, stage4].forEach((el) => {
    if (!el) return;
    const active = el === target;
    setStageState(el, active);
    gsap.set(el, {
      autoAlpha: active ? 1 : 0,
      y: active ? 0 : 24,
    });
  });
}

function animateCount() {
  countEls.forEach((el) => {
    const target = Number(el.dataset.count || 0);
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = `${Math.round(counter.value)}`;
      },
      onComplete: () => {
        el.textContent = `${target}`;
      },
    });
  });
}

function setYear(index) {
  const i = Math.max(0, Math.min(index, years.length - 1));
  yearDots.forEach((dot, idx) => dot.classList.toggle("active", idx === i));
  if (yearTitle && yearDesc) {
    yearTitle.textContent = years[i].title;
    yearDesc.textContent = years[i].desc;
  }
  const dot = yearDots[i];
  if (walker && dot) {
    walker.style.left = `${dot.offsetLeft + dot.offsetWidth / 2}px`;
  }
}

function buildJoinParticles() {
  if (!joinParticles) return;
  const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
  const count = isMobileViewport ? 14 : 24;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "join-particle";
    const size = 3 + Math.random() * 5;
    particle.style.setProperty("--size", `${size}px`);
    joinParticles.appendChild(particle);
  }

  const particles = Array.from(joinParticles.querySelectorAll(".join-particle"));
  particles.forEach((particle, idx) => {
    const delay = (idx % 14) * 0.16;
    const radius = 320 + Math.random() * 500;
    const angle = Math.random() * Math.PI * 2;
    const fromX = Math.cos(angle) * radius;
    const fromY = Math.sin(angle) * radius;
    const toX = (Math.random() - 0.5) * 30;
    const toY = (Math.random() - 0.5) * 30;

    gsap.fromTo(
      particle,
      {
        x: fromX,
        y: fromY,
        opacity: 0,
        scale: 0.45,
      },
      {
        x: toX,
        y: toY,
        opacity: 0.95,
        scale: 1,
        duration: 3.8 + Math.random() * 1.6,
        delay,
        repeat: -1,
        repeatDelay: Math.random() * 0.9,
        ease: "power2.in",
      }
    );
  });
}

yearDots.forEach((dot) => {
  dot.addEventListener("click", () => setYear(Number(dot.dataset.idx || 0)));
});

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
  buildTimelineFlow();

  gsap.set([stage2, stage3, stage4], { autoAlpha: 0 });
  gsap.set([bgOrange, bgNeon], { opacity: 0 });
  gsap.set(recordCircle, { scale: 1, transformOrigin: "center center" });
  if (timelineContent) gsap.set(timelineContent, { autoAlpha: 0 });

  heroST = ScrollTrigger.create({
    trigger: ".hero-pin",
    start: "top top",
    end: "+=2400",
    pin: true,
    scrub: 0.12,
    anticipatePin: 1,
    fastScrollEnd: true,
    snap: {
      snapTo: [0, 0.32, 0.56, 0.84, 1],
      duration: { min: 0.06, max: 0.16 },
      delay: 0.12,
      ease: "power1.out",
      directional: true,
      inertia: true,
    },
    onUpdate: (self) => {
      if (fastTransitionLock) return;
      const p = self.progress;
      const stage1Leave = clamp01((p - 0.1) / 0.08);
      const stage2Wave = clamp01((p - 0.17) / 0.14);
      const stage3Rise = clamp01((p - 0.34) / 0.14);
      const stage4Rise = clamp01((p - 0.58) / 0.16);

      stage1TextEls.forEach((el) => {
        gsap.set(el, {
          autoAlpha: 1 - stage1Leave,
          y: -stage1Leave * 66,
        });
      });

      applyWaveUp(stage2MetricEls, stage2Wave, { stagger: 0.2, rise: 82 });
      applyWaveUp(stage3TextEls, stage3Rise, { stagger: 0.17, rise: 90 });
      applyWaveUp(stage4TextEls, stage4Rise, { stagger: 0.22, rise: 92 });

      if (p < 0.16) {
        showOnly(stage1);
        gsap.set(bgVideo, { opacity: 1 });
        gsap.set(bgOrange, { opacity: 0 });
        gsap.set(bgNeon, { opacity: 0 });
        gsap.set(recordCircle, { scale: 1 });
        setNavActive("home");
        return;
      }

      if (p < 0.40) {
        showOnly(stage2);
        gsap.set(bgVideo, { opacity: 0 });
        gsap.set(bgOrange, { opacity: 1 });
        gsap.set(bgNeon, { opacity: 0 });
        gsap.set(recordCircle, { scale: 1 });
        setNavActive("about");
        if (!hasCounted) {
          hasCounted = true;
          animateCount();
        }
        return;
      }

      if (p < 0.64) {
        showOnly(stage3);
        gsap.set(bgVideo, { opacity: 0 });
        gsap.set(bgOrange, { opacity: 1 });
        gsap.set(bgNeon, { opacity: 0 });
        gsap.set(recordCircle, { scale: 1 });
        gsap.set(stage3, { autoAlpha: 1 });
        gsap.set([...stage3TextEls, stage3TipEl].filter(Boolean), { autoAlpha: 1 });
        setNavActive("about");
        return;
      }

      if (p < 0.82) {
        const t = (p - 0.64) / (0.82 - 0.64);
        showOnly(stage3);
        gsap.set(bgOrange, { opacity: 1 });
        gsap.set(bgNeon, { opacity: 0 });
        gsap.set(recordCircle, { scale: 1 + t * 4.6 });
        gsap.set(stage3, { autoAlpha: 1 });
        gsap.set([...stage3TextEls, stage3TipEl].filter(Boolean), { autoAlpha: 0 });
        gsap.set(stage4, { autoAlpha: 0 });
        setNavActive("about");
        return;
      }

      showOnly(stage4);
      if (bridgeActive) {
        gsap.set(stage4, { autoAlpha: 0, y: 0, scale: 1 });
        return;
      }
      gsap.set(bgVideo, { opacity: 0 });
      gsap.set(bgOrange, { opacity: 0 });
      gsap.set(bgNeon, { opacity: 1 });
      gsap.set(recordCircle, { scale: 1 });
      gsap.set(stage4, { autoAlpha: 1, y: 0 });
      setNavActive("about");
    },
  });

  if (playBtn && recordCircle) {
    playBtn.addEventListener("click", () => {
      fastTransitionLock = true;
      const toTop = heroST.start + (heroST.end - heroST.start) * 0.86;
      gsap
        .timeline({
          onComplete: () => {
            window.scrollTo({ top: toTop, behavior: "smooth" });
            setTimeout(() => {
              fastTransitionLock = false;
            }, 450);
          },
        })
        .to(recordCircle, { scale: 5.2, duration: 0.28, ease: "power3.inOut" })
        .to(stage3, { autoAlpha: 0, duration: 0.18 }, "<+0.06")
        .to(recordCircle, { scale: 1, duration: 0.01 });
    });
  }

  timelineST = ScrollTrigger.create({
    trigger: "#timeline",
    start: "top top",
    end: "+=2200",
    pin: true,
    scrub: 0.32,
    anticipatePin: 1,
    fastScrollEnd: true,
    snap: {
      snapTo: [0, 1],
      duration: { min: 0.08, max: 0.18 },
      delay: 0.1,
      ease: "power1.out",
      directional: true,
      inertia: true,
    },
    onEnter: () => setNavActive("timeline"),
    onUpdate: (self) => {
      if (Math.abs(self.progress - lastTimelineProgress) < 0.0014) return;
      lastTimelineProgress = self.progress;
      const idx = Math.round(self.progress * (years.length - 1));
      const t = self.progress;
      if (timelineFlowItems.length) {
        const spacing = 560;
        const anchorX = window.innerWidth * 0.12;
        const flowProgress = t * (timelineFlowItems.length - 1);
        timelineFlowItems.forEach((el, i) => {
          const y = i === 0 ? 0 : (i % 2 === 1 ? 130 : -130);
          gsap.set(el, { x: anchorX + (i - flowProgress) * spacing, y });
        });
      }
      if (timelineTrack) {
        gsap.set(timelineTrack, { x: 0, autoAlpha: 1 });
      }
      setYear(idx);
    },
  });

  gsap.fromTo(
    mapPoints,
    { y: -220, opacity: 0, scale: 0.28 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1.05,
      stagger: 0.28,
      ease: "bounce.out",
      scrollTrigger: {
        trigger: ".store-scene",
        start: "top 66%",
        onEnter: () => setNavActive("stores"),
      },
    }
  );

  gsap.to(newsCards, {
    opacity: 1,
    y: 0,
    duration: 1.05,
    stagger: 0.16,
    scrollTrigger: {
      trigger: ".news-list",
      start: "top 80%",
    },
  });

  gsap.fromTo(
    storeHeadingEls,
    { y: -160, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.15,
      stagger: 0.12,
      ease: "bounce.out",
      scrollTrigger: {
        trigger: ".store-scene",
        start: "top 68%",
      },
    }
  );

  gsap.fromTo(
    storeAddressEls,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 2.1,
      stagger: 0.16,
      ease: "power1.out",
      scrollTrigger: {
        trigger: ".store-addresses",
        start: "top 80%",
      },
    }
  );

  gsap.fromTo(
    newsTextEls,
    { y: 88, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.045,
      ease: "none",
      scrollTrigger: {
        trigger: "#news",
        start: "top 88%",
        end: "top 54%",
        scrub: true,
      },
    }
  );

  gsap.fromTo(
    joinTextEls,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.8,
      ease: "power1.out",
      scrollTrigger: {
        trigger: "#join",
        start: "top 62%",
        toggleActions: "play none none reverse",
      },
    }
  );

  gsap.to(".invest-content", {
    opacity: 1,
    y: 0,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".invest-scene",
      start: "top 72%",
    },
  });

  ScrollTrigger.create({
    trigger: "#join",
    start: "top 75%",
    onEnter: () => setNavActive("join"),
  });

  if (sceneBridge && timelineScene) {
    gsap.set(sceneBridge, { autoAlpha: 0 });
    gsap.set(timelineScene, { scale: 1, autoAlpha: 1, y: 0 });
    gsap.set([bridgeCurrent, bridgeNext], { scale: 1, autoAlpha: 0, x: 0, y: 0 });
    gsap.set([bridgeDot, bridgeRing], { autoAlpha: 0 });
    bridgeST = ScrollTrigger.create({
      start: heroST.end - 32,
      end: timelineST.start + 32,
      scrub: 0.16,
      snap: {
        snapTo: [0, 1],
        duration: { min: 0.06, max: 0.14 },
        delay: 0.03,
        directional: true,
        ease: "power1.out",
        inertia: true,
      },
      onUpdate: (self) => {
        bridgeActive = true;
        const t = self.progress;
        gsap.set(heroPin, { autoAlpha: 0 });
        gsap.set(stage4, { scale: 1, autoAlpha: 0, transformOrigin: "50% 50%", y: 0 });
        gsap.set(sceneBridge, { autoAlpha: 1 });
        const currentAlpha = t < 0.42 ? 1 : t > 0.58 ? 0 : (0.58 - t) / 0.16;
        const nextAlpha = t < 0.42 ? 0 : t > 0.58 ? 1 : (t - 0.42) / 0.16;
        gsap.set(bridgeCurrent, { autoAlpha: currentAlpha, scale: 1, x: 0, y: 0 });
        gsap.set(bridgeNext, { autoAlpha: nextAlpha, scale: 1, x: 0, y: 0 });
        gsap.set(timelineScene, { scale: 1, autoAlpha: 0, y: 0, transformOrigin: "50% 50%" });
      },
      onLeave: () => {
        bridgeActive = false;
        gsap.set(heroPin, { autoAlpha: 1 });
        gsap.set(stage4, { scale: 1, autoAlpha: 1, y: 0 });
        gsap.set(sceneBridge, { autoAlpha: 0 });
        gsap.set(bridgeCurrent, { autoAlpha: 0, scale: 1, x: 0, y: 0 });
        gsap.set(bridgeNext, { autoAlpha: 0, scale: 1, x: 0, y: 0 });
        gsap.set(timelineScene, { scale: 1, autoAlpha: 1, y: 0 });
      },
      onLeaveBack: () => {
        bridgeActive = false;
        gsap.set(heroPin, { autoAlpha: 1 });
        gsap.set(stage4, { scale: 1, autoAlpha: 1, y: 0 });
        gsap.set(sceneBridge, { autoAlpha: 0 });
        gsap.set(bridgeCurrent, { autoAlpha: 0, scale: 1, x: 0, y: 0 });
        gsap.set(bridgeNext, { autoAlpha: 0, scale: 1, x: 0, y: 0 });
        gsap.set(timelineScene, { scale: 1, autoAlpha: 1, y: 0 });
      },
    });
    bridgeStartTop = heroST.end - 32;
    bridgeEndTop = timelineST.start + 32;
  }

  if (globalSnapST) {
    globalSnapST.kill();
    globalSnapST = null;
  }

  const navTargetByKey = (key) => {
    if (!heroST || !timelineST) return 0;
    if (key === "home") return heroST.start;
    if (key === "about") return heroST.start + (heroST.end - heroST.start) * 0.94;
    if (key === "timeline") return timelineST.start;
    if (key === "stores") return document.querySelector("#stores")?.offsetTop || 0;
    if (key === "join") return document.querySelector("#join")?.offsetTop || 0;
    return 0;
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const key = link.dataset.nav || "home";
      const top = navTargetByKey(key);
      setNavActive(key);
      window.scrollTo({ top, behavior: "smooth" });
      closeMobileMenu();
    });
  });

  const getSnapTops = () => {
    const storesTop = document.querySelector("#stores")?.offsetTop || 0;
    const newsTop = document.querySelector("#news")?.offsetTop || 0;
    const investTop = document.querySelector(".invest-scene")?.offsetTop || 0;
    const joinTop = document.querySelector("#join")?.offsetTop || 0;
    return [timelineST.end, storesTop, newsTop, investTop, joinTop]
      .filter((v, idx, arr) => idx === 0 || Math.abs(v - arr[idx - 1]) > 2);
  };

  const snapTo = (top) => {
    sectionSnapLock = true;
    if (bridgeST) {
      gsap.set(heroPin, { autoAlpha: 1 });
      gsap.set(stage4, { scale: 1, autoAlpha: 1, y: 0 });
      gsap.set(sceneBridge, { autoAlpha: 0 });
      gsap.set(bridgeCurrent, { autoAlpha: 0, scale: 1, x: 0, y: 0 });
      gsap.set(bridgeNext, { autoAlpha: 0, scale: 1, x: 0, y: 0 });
      gsap.set(timelineScene, { scale: 1, autoAlpha: 1, y: 0 });
    }
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => {
      sectionSnapLock = false;
    }, 180);
  };

  let autoSnapTimer = null;
  const scheduleAutoSnap = () => {
    if (autoSnapTimer) clearTimeout(autoSnapTimer);
    autoSnapTimer = setTimeout(() => {
      if (sectionSnapLock || !timelineST) return;
      const y = window.scrollY;
      if (y < timelineST.start - 2) return;
      if (y >= timelineST.start && y <= timelineST.end) return;
      if (bridgeStartTop > 0 && bridgeEndTop > bridgeStartTop && y >= bridgeStartTop && y <= bridgeEndTop) return;
      const tops = getSnapTops();
      if (!tops.length) return;
      const nearest = tops.reduce((best, cur) => (
        Math.abs(cur - y) < Math.abs(best - y) ? cur : best
      ), tops[0]);
      const maxSnapDist = window.innerHeight * 0.46;
      if (Math.abs(nearest - y) <= maxSnapDist) {
        snapTo(nearest);
      }
    }, 95);
  };

  window.addEventListener("wheel", scheduleAutoSnap, { passive: true });
  window.addEventListener("touchend", scheduleAutoSnap, { passive: true });
  window.addEventListener("keyup", scheduleAutoSnap, { passive: true });
}

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.setAttribute("aria-expanded", "false");
  mobileMenuBtn.addEventListener("click", () => {
    const willOpen = !mobileMenu.classList.contains("is-open");
    mobileMenu.classList.toggle("is-open", willOpen);
    mobileMenuBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!mobileMenu.classList.contains("is-open")) return;
    if (mobileMenu.contains(event.target) || mobileMenuBtn.contains(event.target)) return;
    closeMobileMenu();
  });
}

buildJoinParticles();
setNavActive("home");
setYear(0);
window.scrollTo(0, 0);
