const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile navigation
const menuToggle = $("#menu-toggle");
const navMenu = $("#nav-menu");
menuToggle.addEventListener("click", () => {
  const opened = navMenu.classList.toggle("active");
  menuToggle.textContent = opened ? "✕" : "☰";
  menuToggle.setAttribute("aria-expanded", String(opened));
  menuToggle.setAttribute("aria-label", opened ? "Tutup navigasi" : "Buka navigasi");
});
$$(".nav-menu a").forEach(link => link.addEventListener("click", () => {
  navMenu.classList.remove("active");
  menuToggle.textContent = "☰";
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Scroll reveal
const revealElements = $$(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("visible"));
}

// Flip memory cards
$$(".memory-card").forEach(card => card.addEventListener("click", () => {
  const flipped = card.classList.toggle("flipped");
  card.setAttribute("aria-pressed", String(flipped));
}));

// Profile tilt
const profileCard = $("#profile-card");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (canHover && !reduceMotion) {
  profileCard.addEventListener("pointermove", event => {
    const rect = profileCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    profileCard.style.transform = `rotateX(${(0.5-y)*14}deg) rotateY(${(x-0.5)*14}deg)`;
  });
  profileCard.addEventListener("pointerleave", () => {
    profileCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

// Flame mode
const flameToggle = $("#flame-toggle");
flameToggle.addEventListener("click", () => {
  const active = document.body.classList.toggle("flame-mode");
  flameToggle.innerHTML = active ? "<span>✦</span> Calm Mode" : "<span>✧</span> Awaken Flame";
  showToast(active ? "Flame awakened. Let your story shine!" : "The flames rest. Your journey continues.");
  if (active) burstStars();
});

// Secret messages
const secretStar = $("#secret-star");
const toast = $("#toast");
const toastMessage = $("#toast-message");
$("#toast-close").addEventListener("click", () => toast.classList.remove("show"));
const secretMessages = [
  "Every journey begins with a single step. ✦",
  "Even the smallest progress deserves to be celebrated.",
  "Your story is still being written. Keep going!",
  "A new dawn always brings a new possibility.",
  "You are more than the challenges you face. ✧"
];
let lastSecret = -1;
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("show");
}
secretStar.addEventListener("click", () => {
  let index = Math.floor(Math.random() * secretMessages.length);
  while (secretMessages.length > 1 && index === lastSecret) {
    index = Math.floor(Math.random() * secretMessages.length);
  }
  lastSecret = index;
  showToast(secretMessages[index]);
  burstStars();
});

// Back to top
const backToTop = $("#back-to-top");
window.addEventListener("scroll", () => backToTop.classList.toggle("show", window.scrollY > 450));
backToTop.addEventListener("click", () => window.scrollTo({
  top: 0, behavior: reduceMotion ? "auto" : "smooth"
}));

// Active navigation
const sections = $$("main section[id]");
const navigationLinks = $$(".nav-menu a[href^='#']");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navigationLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: "-25% 0px -60% 0px" });
  sections.forEach(section => sectionObserver.observe(section));
}

// Animated starfield
const canvas = $("#starfield");
const ctx = canvas.getContext("2d");
let stars = [], width = 0, height = 0, animationId = null, lastFrame = 0;
const mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const amount = Math.min(110, Math.max(35, Math.floor(width / 12)));
  stars = Array.from({ length: amount }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    size: Math.random() * 1.8 + 0.4, speed: Math.random() * 0.22 + 0.04,
    phase: Math.random() * Math.PI * 2
  }));
  drawStars();
}
function drawStars(time = 0) {
  ctx.clearRect(0, 0, width, height);
  const flame = document.body.classList.contains("flame-mode");
  stars.forEach(star => {
    if (!reduceMotion) {
      star.y -= star.speed;
      if (star.y < -4) { star.y = height + 4; star.x = Math.random() * width; }
    }
    const twinkle = reduceMotion ? 0.7 : 0.45 + Math.sin(time * 0.0015 + star.phase) * 0.3;
    const dx = mouse.x - star.x, dy = mouse.y - star.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let radius = star.size;
    if (distance < 100) radius += (1 - distance / 100) * 2;
    ctx.beginPath();
    ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
    ctx.globalAlpha = Math.min(1, twinkle + (flame ? 0.2 : 0));
    ctx.fillStyle = flame ? "#ffe7a2" : (star.size > 1.4 ? "#8ecae6" : "#e7cb8d");
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (mouse.x >= 0 && mouse.y >= 0) {
    stars.forEach(star => {
      const dx = mouse.x - star.x, dy = mouse.y - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 115) {
        ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = flame ? "rgba(255,231,162,.18)" : "rgba(142,202,230,.16)";
        ctx.lineWidth = 0.7; ctx.stroke();
      }
    });
  }
  ctx.globalAlpha = 1;
}
function animateStars(time) {
  animationId = null;
  if (time - lastFrame < 32) { animationId = requestAnimationFrame(animateStars); return; }
  lastFrame = time;
  drawStars(time);
  animationId = requestAnimationFrame(animateStars);
}
function startStarfield() {
  if (reduceMotion || document.hidden) { drawStars(); return; }
  if (animationId === null) animationId = requestAnimationFrame(animateStars);
}
function stopStarfield() {
  if (animationId !== null) { cancelAnimationFrame(animationId); animationId = null; }
}
window.addEventListener("pointermove", event => { mouse.x = event.clientX; mouse.y = event.clientY; });
window.addEventListener("pointerleave", () => { mouse.x = -1000; mouse.y = -1000; });
window.addEventListener("resize", resizeCanvas);
document.addEventListener("visibilitychange", () => document.hidden ? stopStarfield() : startStarfield());

// Star burst
function burstStars() {
  if (reduceMotion) return;
  const originX = window.innerWidth * 0.5, originY = window.innerHeight * 0.45;
  for (let i = 0; i < 22; i++) {
    const star = document.createElement("span");
    star.textContent = Math.random() > 0.5 ? "✦" : "✧";
    star.setAttribute("aria-hidden", "true");
    const angle = Math.random() * Math.PI * 2, distance = 60 + Math.random() * 150;
    const endX = Math.cos(angle) * distance, endY = Math.sin(angle) * distance;
    star.style.position = "fixed"; star.style.left = `${originX}px`; star.style.top = `${originY}px`;
    star.style.zIndex = "120"; star.style.pointerEvents = "none";
    star.style.color = Math.random() > 0.5 ? "#e7cb8d" : "#8ecae6";
    star.style.fontSize = `${12 + Math.random() * 15}px`;
    document.body.appendChild(star);
    const animation = star.animate([
      { transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)", opacity: 1 },
      { transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) scale(1) rotate(160deg)`, opacity: 0 }
    ], { duration: 650 + Math.random() * 450, easing: "cubic-bezier(.15,.65,.3,1)" });
    animation.onfinish = () => star.remove();
  }
}

$("#year").textContent = new Date().getFullYear();
resizeCanvas();
startStarfield();
