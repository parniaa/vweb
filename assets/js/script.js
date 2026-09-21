"use strict";

const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const sections = Array.from(document.querySelectorAll(".snap-section"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
