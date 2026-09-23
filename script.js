// Portfolio interactions: smooth section highlighting, reveal-on-scroll,
// sticky header state, and a lightweight project carousel.

const navLinks = document.querySelectorAll(".navbar nav a");
const sections = document.querySelectorAll("main section[id]");
const navbar = document.querySelector(".navbar");
const revealTargets = document.querySelectorAll(
  ".section-heading, .timeline-item, .project-card, .skills-grid > div, .contact-section > *"
);

// Highlight the section currently in view.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${entry.target.id}`;
      link.style.color = active ? "#171717" : "";
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach((section) => sectionObserver.observe(section));

// Reveal content as it enters the viewport.
revealTargets.forEach((element) => element.classList.add("reveal"));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealTargets.forEach((element) => revealObserver.observe(element));

// Add a subtle shadow after scrolling.
const updateNavbar = () => {
  navbar.classList.toggle("scrolled", window.scrollY > 12);
};

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

// Project carousel.
const carousel = document.getElementById("projectCarousel");
const track = document.getElementById("projectTrack");
const prev = document.getElementById("projectPrev");
const next = document.getElementById("projectNext");
const cards = Array.from(track.querySelectorAll(".project-card"));

let current = 0;
let startX = 0;
let currentX = 0;
let dragging = false;
let dragMoved = false;

function getStep() {
  if (cards.length < 2) return 0;
  return cards[1].offsetLeft - cards[0].offsetLeft;
}

function maxIndex() {
  const visible = window.innerWidth <= 800 ? 1 : 2;
  return Math.max(0, cards.length - visible);
}

function renderCarousel(animate = true) {
  const step = getStep();
  const max = maxIndex();
  current = Math.min(Math.max(current, 0), max);
  track.style.transition = animate ? "" : "none";
  track.style.transform = `translate3d(${-current * step}px, 0, 0)`;
}

prev.addEventListener("click", () => {
  current -= 1;
  renderCarousel();
});

next.addEventListener("click", () => {
  current += 1;
  renderCarousel();
});

carousel.addEventListener("pointerdown", (event) => {
  dragging = true;
  dragMoved = false;
  startX = event.clientX;
  currentX = event.clientX;
  carousel.classList.add("dragging");
  carousel.setPointerCapture(event.pointerId);
  track.style.transition = "none";
});

carousel.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  currentX = event.clientX;
  const delta = currentX - startX;
  if (Math.abs(delta) > 5) dragMoved = true;
  const base = -current * getStep();
  track.style.transform = `translate3d(${base + delta}px, 0, 0)`;
});

function finishDrag(event) {
  if (!dragging) return;
  dragging = false;
  carousel.classList.remove("dragging");

  const delta = currentX - startX;
  const threshold = Math.min(90, carousel.clientWidth * 0.18);

  if (delta < -threshold) current += 1;
  if (delta > threshold) current -= 1;

  renderCarousel(true);

  if (event.pointerId !== undefined) {
    try { carousel.releasePointerCapture(event.pointerId); } catch (_) {}
  }
}

carousel.addEventListener("pointerup", finishDrag);
carousel.addEventListener("pointercancel", finishDrag);
carousel.addEventListener("pointerleave", (event) => {
  if (dragging && event.buttons === 0) finishDrag(event);
});

window.addEventListener("resize", () => renderCarousel(false));

renderCarousel(false);
