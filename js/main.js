document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      var expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded);
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
      });
    });
  }

  // Mark current page link as active
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // ---- MOTION 1: staggered scroll reveal ----
  // Items cascade in based on their position within their own group. The
  // hidden state is only applied once JS runs (.reveal-ready), so content
  // is never left invisible if scripting is unavailable.
  var revealEls = document.querySelectorAll(
    ".card, .timeline-item, .min-item, .staff-card, .mass-row, .contact-card, .reason-chip, .gallery-item"
  );
  if ("IntersectionObserver" in window && revealEls.length) {
    revealEls.forEach(function (el) {
      var siblings = Array.prototype.slice.call(el.parentElement.children);
      var index = siblings.indexOf(el);
      // Cap the cascade so long lists don't crawl in.
      el.style.setProperty("--reveal-delay", Math.min(index, 6) * 0.08 + "s");
      el.classList.add("reveal-ready");
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  // ---- MOTION 2: pointer-tracked specular sheen on glass surfaces ----
  var glassPanels = document.querySelectorAll(
    ".card, .mass-card, .min-item, .patron, .staff-card, .contact-card, .footer-grid"
  );
  glassPanels.forEach(function (panel) {
    var queued = false;
    var px = 0;
    var py = 0;
    panel.addEventListener("pointermove", function (event) {
      var rect = panel.getBoundingClientRect();
      px = ((event.clientX - rect.left) / rect.width) * 100;
      py = ((event.clientY - rect.top) / rect.height) * 100;
      if (queued) return;
      queued = true;
      // Coalesce into a frame so rapid moves can't thrash style writes.
      window.requestAnimationFrame(function () {
        panel.style.setProperty("--mx", px + "%");
        panel.style.setProperty("--my", py + "%");
        queued = false;
      });
    });
  });

  // Photo slots: drop a real image at the path in the markup and it shows.
  // If the file isn't there yet, remove the <img> so the decorative motif
  // underneath shows through instead of a broken-image icon.
  document.querySelectorAll("img.photo-slot").forEach(function (img) {
    var frame = img.parentElement;

    function photoLoaded() {
      // Hide the decorative motif so it can't sit on top of the photograph.
      if (frame) frame.classList.add("has-photo");
    }
    function photoMissing() {
      img.remove();
    }

    // Load or error may already have fired before this script ran.
    if (img.complete) {
      if (img.naturalWidth > 0) photoLoaded();
      else photoMissing();
      return;
    }
    img.addEventListener("load", photoLoaded);
    img.addEventListener("error", photoMissing);
  });

  // ---- Gallery lightbox ----
  // Any photo tile can be opened larger with a click or Enter/Space.
  var photoTiles = document.querySelectorAll(".gallery-item.has-photo");
  if (photoTiles.length) {
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
      '<img alt="">' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector("img");
    var lightboxCaption = lightbox.querySelector(".lightbox-caption");
    var lightboxClose = lightbox.querySelector(".lightbox-close");
    var lastFocused = null;

    function openLightbox(tile) {
      var img = tile.querySelector("img");
      var caption = tile.querySelector("span");
      if (!img) return;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "";
      lightboxCaption.textContent = caption ? caption.textContent : "";
      lastFocused = document.activeElement;
      document.body.classList.add("lightbox-open");
      lightbox.classList.add("open");
      lightboxClose.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.classList.remove("lightbox-open");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    photoTiles.forEach(function (tile) {
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("role", "button");
      tile.setAttribute("aria-label", "View larger photo");
      tile.addEventListener("click", function () {
        openLightbox(tile);
      });
      tile.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(tile);
        }
      });
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }

  // ---- Footer glass: staggered reveal + pointer-tracked sheen ----
  var footerGrid = document.querySelector(".footer-grid");
  if (footerGrid) {
    // Arm the reveal only now, so the footer is never hidden without JS.
    if ("IntersectionObserver" in window) {
      footerGrid.classList.add("motion-ready");
      var footerIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              footerIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      footerIO.observe(footerGrid);
    }
    // The pointer sheen for .footer-grid is wired up with the other glass
    // panels in MOTION 2 above.
  }

  // ---- Social handles ----
  // Any handle still pointing at the "#" placeholder hasn't been supplied
  // yet, so remove it rather than publish a dead link. Setting a real URL
  // in the markup is all that's needed to make one appear.
  document.querySelectorAll("a.social-slot").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href || href === "#") link.remove();
  });

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
