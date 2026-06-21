(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("siteNav");
  const progress = document.getElementById("scrollProgress");
  const typedText = document.getElementById("typedText");
  const dialog = document.getElementById("imageDialog");
  const dialogImage = document.getElementById("dialogImage");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogClose = document.getElementById("dialogClose");
  const canvas = document.getElementById("heroCanvas");

  const phrases = [
    "Data stewardship",
    "Compliance reporting",
    "Power BI and Tableau dashboards",
    "Salesforce CRM analytics",
    "KPI definitions and quality controls",
    "Evidence based recommendations"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function updateProgress() {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  function initNavigation() {
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLAnchorElement)) return;
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }

  function initReveals() {
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("visible"));
      document.querySelectorAll(".flow-step").forEach((step) => {
        step.style.opacity = "1";
        step.style.transform = "none";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function animateCount(element) {
    const end = Number(element.dataset.count || "0");
    const suffix = element.dataset.suffix || "";
    const startTime = performance.now();
    const duration = 900;

    function frame(now) {
      const progressValue = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = `${Math.round(end * eased)}${suffix}`;

      if (progressValue < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    const counters = [...document.querySelectorAll("[data-count]")];
    if (!counters.length) return;

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      counters.forEach((counter) => {
        counter.textContent = `${counter.dataset.count}${counter.dataset.suffix || ""}`;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function typeNext() {
    if (!typedText || prefersReducedMotion.matches) return;

    const phrase = phrases[phraseIndex];
    typedText.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      window.setTimeout(typeNext, 38);
      return;
    }

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      window.setTimeout(typeNext, 1150);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(typeNext, 22);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    window.setTimeout(typeNext, 180);
  }

  function initImageDialog() {
    if (!dialog || !dialogImage || !dialogTitle) return;

    document.querySelectorAll("[data-full-image]").forEach((button) => {
      button.addEventListener("click", () => {
        const src = button.getAttribute("data-full-image");
        const title = button.getAttribute("data-title") || "Preview";
        if (!src) return;

        dialogImage.src = src;
        dialogImage.alt = title;
        dialogTitle.textContent = title;

        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          window.open(src, "_blank", "noopener");
        }
      });
    });

    dialogClose?.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      if (clickedOutside) {
        dialog.close();
      }
    });
  }

  function initActiveNav() {
    const links = [...document.querySelectorAll(".nav-links a[href^='#']")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { threshold: 0.25, rootMargin: "-20% 0px -58% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initCanvas() {
    if (!canvas || prefersReducedMotion.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let nodes = [];
    let animationId = 0;
    let running = true;
    const linkDistance = 120;
    const linkDistanceSq = linkDistance * linkDistance;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.max(24, Math.min(40, Math.floor(width / 28)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        size: 1.2 + Math.random() * 2
      }));
    }

    function draw() {
      if (!running) return;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(238, 248, 241, 0.36)";
      context.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      });

      context.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq > linkDistanceSq) continue;

          const distance = Math.sqrt(distanceSq);
          context.strokeStyle = `rgba(18, 107, 63, ${(1 - distance / linkDistance) * 0.16})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      nodes.forEach((node, index) => {
        context.fillStyle = index % 6 === 0 ? "rgba(13, 148, 136, 0.45)" : "rgba(18, 107, 63, 0.36)";
        context.beginPath();
        context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        context.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(animationId);
    }

    function start() {
      if (running) return;
      running = true;
      draw();
    }

    const heroSection = canvas.closest(".hero-section");
    if (heroSection && "IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.05 }
      );
      visibilityObserver.observe(heroSection);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else if (!heroSection || heroSection.getBoundingClientRect().bottom > 0) {
        start();
      }
    });

    window.addEventListener("resize", resize);
    resize();
    draw();

    prefersReducedMotion.addEventListener("change", stop);
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  initNavigation();
  initReveals();
  initCounters();
  initImageDialog();
  initActiveNav();
  initCanvas();
  updateProgress();
  typeNext();
})();
