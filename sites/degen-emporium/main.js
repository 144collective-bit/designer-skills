// The Degen Emporium — home page interactions
(function () {
  // ----- Price ticker -----
  // Live prices from the DexScreener public API (PulseChain pairs). If the request
  // fails, the ticker still renders with "—" placeholders.
  var tokens = [
    { sym: "PLS", addr: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27" }, // WPLS
    { sym: "PLSX", addr: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab" },
    { sym: "HEX", addr: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39" },
    { sym: "INC", addr: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d" }
  ];

  var track = document.getElementById("ticker-track");

  function formatPrice(n) {
    if (n == null || isNaN(n)) return "—";
    if (n >= 1) return "$" + n.toFixed(2);
    if (n >= 0.01) return "$" + n.toFixed(4);
    return "$" + n.toPrecision(3);
  }

  function renderTicker() {
    var html = tokens.map(function (t) {
      var chg = "";
      if (typeof t.chg === "number") {
        var up = t.chg >= 0;
        chg = '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲" : "▼") + " " +
          Math.abs(t.chg).toFixed(2) + "%</span>";
      }
      return '<span class="tick"><b>' + t.sym + '</b><span class="px">' + formatPrice(t.px) + "</span>" + chg + "</span>";
    }).join("");
    // Repeat so the loop scrolls seamlessly on wide screens
    track.innerHTML = html + html + html + html;
  }

  function loadPrices() {
    var url = "https://api.dexscreener.com/tokens/v1/pulsechain/" + tokens.map(function (t) { return t.addr; }).join(",");
    fetch(url)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (pairs) {
        tokens.forEach(function (t) {
          // Use the most liquid pair where this token is the base token
          var best = null;
          pairs.forEach(function (p) {
            if (!p.baseToken || p.baseToken.address.toLowerCase() !== t.addr.toLowerCase()) return;
            var liq = (p.liquidity && p.liquidity.usd) || 0;
            if (!best || liq > best.liq) best = { liq: liq, p: p };
          });
          if (best) {
            t.px = parseFloat(best.p.priceUsd);
            t.chg = best.p.priceChange ? best.p.priceChange.h24 : undefined;
          }
        });
        renderTicker();
      })
      .catch(function () { /* keep placeholders */ });
  }

  if (track) {
    renderTicker();
    loadPrices();
    setInterval(loadPrices, 60000);
  }

  // ----- Mobile menu -----
  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("main-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // ----- News filters -----
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll(".news-card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
      });
      cards.forEach(function (card) {
        card.hidden = f !== "all" && card.getAttribute("data-cat") !== f;
      });
    });
  });

  // ----- Add to cart (front-end only) -----
  var count = 0;
  var countEl = document.getElementById("cart-count");
  var cartBtn = document.querySelector(".cart-btn");
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      count += 1;
      countEl.textContent = count;
      cartBtn.setAttribute("aria-label", "Cart, " + count + (count === 1 ? " item" : " items"));
      countEl.classList.remove("bump");
      void countEl.offsetWidth;
      countEl.classList.add("bump");
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(function () {
        btn.textContent = "Add to cart";
        btn.classList.remove("added");
      }, 1400);
    });
  });

  // ----- Newsletter -----
  var form = document.getElementById("signup");
  var msg = document.getElementById("form-msg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      msg.className = "form-msg " + (valid ? "ok" : "err");
      msg.textContent = valid
        ? "You're in, degen. Watch your inbox for the alpha."
        : "Please enter a valid email address.";
      if (valid) form.reset();
    });
  }

  // ----- Scroll reveal -----
  var revealEls = document.querySelectorAll(".section-head, .news-card, .product, .eco-card, .promo, .newsletter");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // ----- Footer year -----
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
