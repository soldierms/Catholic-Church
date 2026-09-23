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
var path = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach(function (link) {
var href = link.getAttribute("href");
if (href === path || (path === "" && href === "index.html")) {
link.classList.add("active");
}
});
var revealEls = document.querySelectorAll(
".card, .timeline-item, .min-item, .staff-card, .mass-row, .contact-card, .reason-chip, .gallery-item"
);
if ("IntersectionObserver" in window && revealEls.length) {
revealEls.forEach(function (el) {
var siblings = Array.prototype.slice.call(el.parentElement.children);
var index = siblings.indexOf(el);
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
window.requestAnimationFrame(function () {
panel.style.setProperty("--mx", px + "%");
panel.style.setProperty("--my", py + "%");
queued = false;
});
});
});
document.querySelectorAll("img.photo-slot").forEach(function (img) {
var frame = img.parentElement;
function photoLoaded() {
if (frame) frame.classList.add("has-photo");
}
function photoMissing() {
img.remove();
}
if (img.complete) {
if (img.naturalWidth > 0) photoLoaded();
else photoMissing();
return;
}
img.addEventListener("load", photoLoaded);
img.addEventListener("error", photoMissing);
});
if (document.querySelector(".gallery-grid")) {
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
var MAX_SCALE = 4;
var DOUBLE_TAP_SCALE = 2.4;
var scale = 1;
var panX = 0;
var panY = 0;
var isPanning = false;
var panStartX = 0;
var panStartY = 0;
var pinchStartDist = 0;
var pinchStartScale = 1;
var lastTapTime = 0;
function applyTransform() {
lightboxImg.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + scale + ")";
lightboxImg.style.cursor = scale > 1 ? "grab" : "zoom-in";
}
function resetZoom() {
scale = 1;
panX = 0;
panY = 0;
isPanning = false;
applyTransform();
}
function setZoom(nextScale) {
scale = Math.min(MAX_SCALE, Math.max(1, nextScale));
if (scale === 1) {
panX = 0;
panY = 0;
}
applyTransform();
}
function toggleZoom() {
setZoom(scale > 1 ? 1 : DOUBLE_TAP_SCALE);
}
function touchDistance(t1, t2) {
var dx = t1.clientX - t2.clientX;
var dy = t1.clientY - t2.clientY;
return Math.sqrt(dx * dx + dy * dy);
}
function openLightbox(tile) {
var img = tile.querySelector("img");
var caption = tile.querySelector("span");
if (!img) return;
lightboxImg.src = img.currentSrc || img.src;
lightboxImg.alt = img.alt || "";
lightboxCaption.textContent = caption ? caption.textContent : "";
resetZoom();
lastFocused = document.activeElement;
document.body.classList.add("lightbox-open");
lightbox.classList.add("open");
lightboxClose.focus();
}
function closeLightbox() {
lightbox.classList.remove("open");
document.body.classList.remove("lightbox-open");
resetZoom();
if (lastFocused && lastFocused.focus) lastFocused.focus();
}
lightbox.addEventListener(
"wheel",
function (event) {
if (!lightbox.classList.contains("open")) return;
event.preventDefault();
setZoom(scale + (event.deltaY < 0 ? 0.35 : -0.35));
},
{ passive: false }
);
lightboxImg.addEventListener("dblclick", function (event) {
event.preventDefault();
toggleZoom();
});
lightboxImg.addEventListener("mousedown", function (event) {
if (scale <= 1) return;
event.preventDefault();
isPanning = true;
panStartX = event.clientX - panX;
panStartY = event.clientY - panY;
lightboxImg.classList.add("panning");
lightboxImg.style.cursor = "grabbing";
});
window.addEventListener("mousemove", function (event) {
if (!isPanning) return;
panX = event.clientX - panStartX;
panY = event.clientY - panStartY;
applyTransform();
});
window.addEventListener("mouseup", function () {
if (!isPanning) return;
isPanning = false;
lightboxImg.classList.remove("panning");
lightboxImg.style.cursor = scale > 1 ? "grab" : "zoom-in";
});
lightboxImg.addEventListener(
"touchstart",
function (event) {
if (event.touches.length === 2) {
lightboxImg.classList.add("panning");
pinchStartDist = touchDistance(event.touches[0], event.touches[1]);
pinchStartScale = scale;
} else if (event.touches.length === 1) {
if (scale > 1) {
isPanning = true;
lightboxImg.classList.add("panning");
panStartX = event.touches[0].clientX - panX;
panStartY = event.touches[0].clientY - panY;
}
var now = Date.now();
if (now - lastTapTime < 300) toggleZoom();
lastTapTime = now;
}
},
{ passive: true }
);
lightboxImg.addEventListener(
"touchmove",
function (event) {
if (event.touches.length === 2) {
event.preventDefault();
var dist = touchDistance(event.touches[0], event.touches[1]);
if (pinchStartDist > 0) setZoom(pinchStartScale * (dist / pinchStartDist));
} else if (event.touches.length === 1 && isPanning) {
event.preventDefault();
panX = event.touches[0].clientX - panStartX;
panY = event.touches[0].clientY - panStartY;
applyTransform();
}
},
{ passive: false }
);
lightboxImg.addEventListener("touchend", function (event) {
if (event.touches.length === 0) {
isPanning = false;
lightboxImg.classList.remove("panning");
}
});
window.GCCWireGalleryTiles = function () {
document
.querySelectorAll(".gallery-item.has-photo:not([data-lightbox-wired])")
.forEach(function (tile) {
tile.setAttribute("data-lightbox-wired", "true");
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
};
window.GCCWireGalleryTiles();
lightbox.addEventListener("click", function (event) {
if (event.target === lightbox) closeLightbox();
});
lightboxClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", function (event) {
if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});
}
var footerGrid = document.querySelector(".footer-grid");
if (footerGrid) {
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
}
document.querySelectorAll("a.social-slot").forEach(function (link) {
var href = link.getAttribute("href");
if (!href || href === "#") link.remove();
});
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
});