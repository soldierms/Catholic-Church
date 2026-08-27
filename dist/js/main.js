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
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
});