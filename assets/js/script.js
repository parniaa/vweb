"use strict";

const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const sections = Array.from(document.querySelectorAll(".snap-section"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopSnap = window.matchMedia("(min-width: 900px)");

if (!reducedMotion.matches) {
  document.body.classList.add("motion-ready");
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.26 }
);

sections.forEach((section) => revealObserver.observe(section));

const activeObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-38% 0px -52% 0px",
    threshold: [0.12, 0.35, 0.65],
  }
);

sections.forEach((section) => activeObserver.observe(section));

const getSnapOffset = () => {
  const rawValue = getComputedStyle(document.documentElement).getPropertyValue("--snap-offset");
  return Number.parseFloat(rawValue) || 92;
};

const getCurrentSectionIndex = () => {
  const offset = getSnapOffset();
  return sections.reduce((closestIndex, section, index) => {
    const currentDistance = Math.abs(section.getBoundingClientRect().top - offset);
    const closestDistance = Math.abs(sections[closestIndex].getBoundingClientRect().top - offset);
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);
};

let snapLocked = false;

const snapToSection = (index) => {
  const nextSection = sections[Math.max(0, Math.min(index, sections.length - 1))];

  if (!nextSection) return;

  snapLocked = true;
  nextSection.scrollIntoView({ block: "start", behavior: "smooth" });

  window.setTimeout(() => {
    snapLocked = false;
  }, 820);
};

window.addEventListener(
  "wheel",
  (event) => {
    if (!desktopSnap.matches || reducedMotion.matches || Math.abs(event.deltaY) < 24) return;

    event.preventDefault();

    if (snapLocked) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    snapToSection(getCurrentSectionIndex() + direction);
  },
  { passive: false }
);

window.addEventListener("keydown", (event) => {
  if (!desktopSnap.matches || reducedMotion.matches || snapLocked) return;

  const keys = ["ArrowDown", "PageDown", "ArrowUp", "PageUp"];
  if (!keys.includes(event.key)) return;

  event.preventDefault();
  const direction = event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
  snapToSection(getCurrentSectionIndex() + direction);
});
