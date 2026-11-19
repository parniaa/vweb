"use strict";

const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && "animate" in Element.prototype) {
  const directions = [
    [".section-heading", ["left"]],
    [".company-row a, .brand-grid a", ["left", "right", "below"]],
    ["#work .work-card", ["left", "below", "right"]],
    [".app-card", ["left", "below", "right"]],
    [".timeline-item", ["right", "below", "right"]],
    [".skill-panel", ["left"]],
    [".education-panel", ["right"]],
    [".contact > div:first-child", ["left"]],
    [".contact-actions", ["right"]],
  ];
  const entrances = new Map();
  const active = new Map();
  const compact = window.matchMedia("(max-width: 640px)");

  for (const [selector, sides] of directions) {
    document.querySelectorAll(selector).forEach((element, index) => {
      entrances.set(element, sides[index % sides.length]);
    });
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach(({ target }, index) => {
        revealObserver.unobserve(target);
        if (reducedMotion.matches || target.matches(":focus-within")) return;

        const side = entrances.get(target);
        const distance = compact.matches ? 26 : 64;
        const x = side === "left" ? -distance : side === "right" ? distance : 0;
        const y = side === "below" ? (compact.matches ? 24 : 36) : 10;
        const animation = target.animate(
          [
            { opacity: 0.08, translate: `${x}px ${y}px`, scale: 0.97 },
            { opacity: 1, translate: "0 0", scale: 1 },
          ],
          {
            duration: compact.matches ? 620 : 770,
            delay: Math.min(index, 4) * 55,
            easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
            fill: "backwards",
          }
        );

        active.get(target)?.cancel();
        active.set(target, animation);
        const clear = () => {
          if (active.get(target) === animation) active.delete(target);
        };
        animation.finished.then(clear, clear);
      });
    },
    { threshold: 0.12 }
  );

  const syncMotion = () => {
    if (reducedMotion.matches) {
      revealObserver.disconnect();
      active.forEach((animation) => animation.cancel());
      active.clear();
    } else {
      entrances.forEach((_, element) => revealObserver.observe(element));
    }
  };
  syncMotion();
  reducedMotion.addEventListener?.("change", syncMotion);

  document.addEventListener("focusin", ({ target }) => {
    active.forEach((animation, element) => {
      if (element.contains(target)) animation.cancel();
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (reducedMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const section = document.getElementById(link.hash.slice(1));
      if (!section) return;
      entrances.forEach((_, element) => {
        if (section.contains(element)) revealObserver.observe(element);
      });
    });
  });
}

if ("IntersectionObserver" in window) {
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

  document.querySelectorAll(".snap-section, .contact").forEach((section) => activeObserver.observe(section));
}
