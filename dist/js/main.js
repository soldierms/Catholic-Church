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
var revealEls = document.querySelectorAll(".card, .timeline-item, .min-item, .staff-card, .mass-row, .contact-card, .reason-chip, .gallery-item");
if ("IntersectionObserver" in window) {
var io = new IntersectionObserver(
function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
var el = entry.target;
el.style.opacity = 1;
el.style.transform = "translateY(0)";
el.addEventListener("transitionend", function handler() {
el.style.transform = "";
el.style.transition = "";
el.removeEventListener("transitionend", handler);
});
io.unobserve(el);
}
});
},
{ threshold: 0.12 }
);
revealEls.forEach(function (el) {
el.style.opacity = 0;
el.style.transform = "translateY(16px)";
el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
io.observe(el);
});
}
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
});