/* 702 Notary Plus — site scripts */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  /* ---- Header border on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("nav-open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) setMenu(false);
    });
  }

  /* ---- Subtle reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Google review links ----
     Paste the "Ask for reviews" link from Google Business Profile here
     (it looks like https://g.page/r/XXXXXXXX/review). */
  var GOOGLE_REVIEW_URL = "https://www.google.com/search?q=702+Notary+Plus+reviews";
  document.querySelectorAll("[data-google-review]").forEach(function (a) {
    a.href = GOOGLE_REVIEW_URL;
  });

  /* ---- Contact form ---- */
  var form = document.getElementById("request-form");
  if (!form) return;

  // Pre-select a service when arriving from a "Request this service" link
  var params = new URLSearchParams(window.location.search);
  var service = params.get("service");
  var select = form.querySelector("#service");
  if (service && select) {
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.dataset.key === service) opt.selected = true;
    });
  }

  // Don't allow dates in the past
  var dateInput = form.querySelector("#date");
  if (dateInput) {
    var t = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    dateInput.min = t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
  }

  var validators = {
    firstName: function (v) { return v.trim() ? "" : "Please enter your first name."; },
    lastName: function (v) { return v.trim() ? "" : "Please enter your last name."; },
    phone: function (v) {
      return v.replace(/\D/g, "").length >= 10 ? "" : "Please enter a valid phone number.";
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.";
    }
  };

  function validateField(name) {
    var input = form.elements[name];
    if (!input || !validators[name]) return true;
    var msg = validators[name](input.value);
    var field = input.closest(".field");
    field.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    var err = field.querySelector(".field__error");
    if (err) err.textContent = msg;
    return !msg;
  }

  Object.keys(validators).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener("blur", function () { if (input.value) validateField(name); });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("has-error")) validateField(name);
    });
  });

  function formatTime(v) {
    if (!v) return "";
    var parts = v.split(":");
    var h = parseInt(parts[0], 10);
    var suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + parts[1] + " " + suffix;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var firstInvalid = null;
    Object.keys(validators).forEach(function (name) {
      if (!validateField(name)) {
        ok = false;
        if (!firstInvalid) firstInvalid = form.elements[name];
      }
    });
    if (!ok) {
      firstInvalid.focus();
      return;
    }

    var f = form.elements;
    var lines = [
      "NOTARY SERVICE REQUEST",
      "",
      "Name: " + f.firstName.value.trim() + " " + f.lastName.value.trim(),
      "Phone: " + f.phone.value.trim(),
      "Email: " + f.email.value.trim(),
      "",
      "Service: " + (f.service.value || "Not specified"),
      "Preferred date: " + (f.date.value || "Not specified"),
      "Preferred time: " + (formatTime(f.time.value) || "Not specified"),
      "Document language: " + (f.language.value.trim() || "Not specified"),
      "Number of documents: " + (f.documents.value || "Not specified"),
      "",
      "Additional details:",
      f.message.value.trim() || "—"
    ];

    var subject = "Notary Request — " + f.firstName.value.trim() + " " + f.lastName.value.trim();
    var href =
      "mailto:702notaryplus@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(lines.join("\n"));

    window.location.href = href;

    var status = document.getElementById("form-status");
    if (status) {
      status.classList.add("is-visible");
      status.focus();
    }
  });
})();
