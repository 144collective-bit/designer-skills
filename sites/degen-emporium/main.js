// The Degen Emporium — home page interactions
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var body = document.body;

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  // ----- Preloader & intro -----
  $$(".hero-title .word").forEach(function (w, i) { w.style.setProperty("--i", i); });
  var started = false;
  function start() {
    if (started) return;
    started = true;
    var pre = $("#preloader");
    if (pre) pre.classList.add("done");
    body.classList.remove("is-loading");
    body.classList.add("loaded");
    countUp();
  }
  window.addEventListener("load", function () { setTimeout(start, reduceMotion ? 0 : 700); });
  setTimeout(start, 3000); // never block the page on a slow asset

  // ----- Particle network background -----
  (function network() {
    var canvas = $("#bg-canvas");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    var colors = ["157,255,31", "0,224,255", "226,27,220", "128,0,255"];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, pts = [], mouse = { x: -9999, y: -9999 }, running = true;

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(90, Math.floor((w * h) / 16000));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.6 + 0.6, c: colors[i % colors.length], p: Math.random() * Math.PI * 2
        });
      }
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var link = 130;
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        a.x += a.vx; a.y += a.vy; a.p += 0.03;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        // Gentle pull toward the cursor
        var mdx = mouse.x - a.x, mdy = mouse.y - a.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 180) { a.x += mdx * 0.004; a.y += mdy * 0.004; }

        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < link * link) {
            ctx.strokeStyle = "rgba(" + a.c + "," + (0.16 * (1 - Math.sqrt(d) / link)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (md < 200) {
          ctx.strokeStyle = "rgba(157,255,31," + (0.35 * (1 - md / 200)) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        var glow = 0.55 + Math.sin(a.p) * 0.35;
        ctx.fillStyle = "rgba(" + a.c + "," + glow + ")";
        ctx.shadowColor = "rgba(" + a.c + ",1)";
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
  })();

  // ----- Cursor glow -----
  (function cursorGlow() {
    var el = $("#cursor-glow");
    if (!el || !finePointer || reduceMotion) return;
    var x = 0, y = 0, tx = 0, ty = 0;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; el.classList.add("on"); });
    document.addEventListener("pointerleave", function () { el.classList.remove("on"); });
    (function loop() {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      requestAnimationFrame(loop);
    })();
  })();

  // ----- Scroll: progress bar, header state, back-to-top, hero parallax -----
  var header = $("#site-header");
  var progress = $("#scroll-progress");
  var toTop = $("#to-top");
  var parallax = $("#hero-parallax");
  var mouseShift = { x: 0, y: 0 };
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 900);
    if (parallax && !reduceMotion && y < 900) {
      parallax.style.transform = "translate3d(" + mouseShift.x + "px," + (y * 0.3 + mouseShift.y) + "px,0) scale(1.04)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (parallax && finePointer && !reduceMotion) {
    $("#top").addEventListener("pointermove", function (e) {
      mouseShift.x = (e.clientX / window.innerWidth - 0.5) * -24;
      mouseShift.y = (e.clientY / window.innerHeight - 0.5) * -14;
      onScroll();
    });
  }

  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  // ----- Nav: sliding indicator + active section -----
  var nav = $("#main-nav");
  var navIndicator = $("#nav-indicator");
  var navLinks = $$(".main-nav a");
  var activeLink = null;

  function moveIndicator(link) {
    if (!link || window.innerWidth <= 860) { navIndicator.style.opacity = 0; return; }
    navIndicator.style.opacity = 1;
    navIndicator.style.width = link.offsetWidth + "px";
    navIndicator.style.transform = "translateX(" + link.offsetLeft + "px)";
  }
  navLinks.forEach(function (a) {
    a.addEventListener("mouseenter", function () { moveIndicator(a); });
  });
  nav.addEventListener("mouseleave", function () { moveIndicator(activeLink); });
  window.addEventListener("resize", function () { moveIndicator(activeLink); });

  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        activeLink = null;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("data-section") === id;
          a.classList.toggle("active", on);
          if (on) activeLink = a;
        });
        moveIndicator(activeLink);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["top", "news", "store", "ecosystem", "community"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) secObs.observe(s);
    });
  }

  // ----- Mobile menu -----
  var toggle = $("#menu-toggle");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("open", open);
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });

  // ----- Price ticker -----
  // Live prices from the DexScreener public API (PulseChain pairs). If the request
  // fails, the ticker still renders with "—" placeholders.
  var tokens = [
    { sym: "PLS", addr: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27" }, // WPLS
    { sym: "PLSX", addr: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab" },
    { sym: "HEX", addr: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39" },
    { sym: "INC", addr: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d" }
  ];
  var track = $("#ticker-track");

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
        chg = '<span class="' + (up ? "up" : "down") + '">' + (up ? "▲" : "▼") + " " + Math.abs(t.chg).toFixed(2) + "%</span>";
      }
      var flash = t.flash ? " flash-" + t.flash : "";
      return '<span class="tick"><b>' + t.sym + '</b><span class="px' + flash + '">' + formatPrice(t.px) + "</span>" + chg + "</span>";
    }).join("");
    // Repeat so the loop scrolls seamlessly on wide screens
    track.innerHTML = html + html + html + html;
    setTimeout(function () { $$(".tick .px", track).forEach(function (p) { p.classList.remove("flash-up", "flash-down"); }); }, 900);
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
            var px = parseFloat(best.p.priceUsd);
            t.flash = t.px != null && px !== t.px ? (px > t.px ? "up" : "down") : null;
            t.px = px;
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

  // ----- Stat counters -----
  function countUp() {
    $$("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (reduceMotion || target === 0) { el.textContent = target; return; }
      var t0 = null, dur = 1600;
      setTimeout(function () {
        requestAnimationFrame(function step(ts) {
          if (!t0) t0 = ts;
          var k = Math.min((ts - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        });
      }, 1300);
    });
  }

  // ----- Spotlight glow + 3D tilt -----
  $$(".spot").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (finePointer && !reduceMotion && card.classList.contains("tilt")) {
        var rx = ((y / r.height) - 0.5) * -8;
        var ry = ((x / r.width) - 0.5) * 10;
        card.classList.add("tilting");
        card.style.transform = "perspective(1000px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
      }
    });
    card.addEventListener("pointerleave", function () {
      card.classList.remove("tilting");
      card.style.transform = "";
    });
  });

  // ----- Magnetic buttons -----
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.25 + "px," + y * 0.35 + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  // ----- News filters -----
  var chips = $$(".chip[data-filter]");
  var filterIndicator = $("#filter-indicator");
  var cards = $$(".news-card");

  function moveFilter(chip) {
    filterIndicator.style.width = chip.offsetWidth + "px";
    filterIndicator.style.height = chip.offsetHeight + "px";
    filterIndicator.style.top = chip.offsetTop + "px";
    filterIndicator.style.transform = "translateX(" + chip.offsetLeft + "px)";
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
      });
      moveFilter(chip);
      cards.forEach(function (card, i) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.classList.toggle("is-hidden", !show);
        card.classList.remove("pop");
        if (show) {
          void card.offsetWidth;
          card.style.animationDelay = (i * 0.05) + "s";
          card.classList.add("pop");
        }
      });
    });
  });
  function syncFilter() { var a = $(".chip.is-active"); if (a) moveFilter(a); }
  window.addEventListener("resize", syncFilter);
  window.addEventListener("load", syncFilter);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncFilter);
  syncFilter();

  // ----- Drop countdown (next Friday, 18:00 UTC) -----
  (function countdown() {
    var units = {};
    $$("#countdown [data-unit]").forEach(function (b) { units[b.getAttribute("data-unit")] = b; });
    function nextDrop() {
      var now = new Date();
      var d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 18, 0, 0));
      var add = (5 - d.getUTCDay() + 7) % 7;
      d.setUTCDate(d.getUTCDate() + add);
      if (d <= now) d.setUTCDate(d.getUTCDate() + 7);
      return d;
    }
    var target = nextDrop();
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var diff = Math.max(0, target - new Date());
      if (diff === 0) target = nextDrop();
      var s = Math.floor(diff / 1000);
      units.d.textContent = pad(Math.floor(s / 86400));
      units.h.textContent = pad(Math.floor(s / 3600) % 24);
      units.m.textContent = pad(Math.floor(s / 60) % 60);
      units.s.textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  })();

  // ----- Toasts -----
  var toasts = $("#toasts");
  function toast(msg, icon) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="toast-icon">' + (icon || "✓") + "</span><span></span>";
    t.lastChild.textContent = msg;
    toasts.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 400);
    }, 2400);
  }

  // ----- Cart (front-end only; saved in this browser) -----
  var cart = store("de-cart") || [];
  var FREE_SHIP = 100;
  var drawer = $("#cart");
  var overlay = $("#cart-overlay");
  var openBtn = $("#cart-open");
  var countEl = $("#cart-count");
  var lastFocus = null;

  function cartCount() { return cart.reduce(function (n, i) { return n + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (n, i) { return n + i.qty * i.price; }, 0); }

  function renderCart() {
    var n = cartCount(), total = cartTotal();
    countEl.textContent = n;
    openBtn.setAttribute("aria-label", "Open cart, " + n + (n === 1 ? " item" : " items"));
    drawer.classList.toggle("empty", n === 0);
    $("#cart-total").textContent = "$" + total;
    $("#ship-bar").style.width = Math.min(100, (total / FREE_SHIP) * 100) + "%";
    $("#ship-msg").textContent = total >= FREE_SHIP ? "You've unlocked free shipping 🎉" : "Add $" + (FREE_SHIP - total) + " for free shipping";

    var list = $("#cart-items");
    list.innerHTML = "";
    cart.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML =
        '<div class="cart-thumb prod-' + item.swatch + '"></div>' +
        "<div><h3></h3>" +
        '<div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><span>' + item.qty +
        '</span><button type="button" data-q="1" aria-label="Increase quantity">+</button></div></div>' +
        '<div style="text-align:right"><p class="ci-price">$' + item.price * item.qty + '</p><button type="button" class="ci-remove">Remove</button></div>';
      $("h3", li).textContent = item.name;
      $$("[data-q]", li).forEach(function (b) {
        b.addEventListener("click", function () {
          item.qty += parseInt(b.getAttribute("data-q"), 10);
          if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
          saveCart();
        });
      });
      $(".ci-remove", li).addEventListener("click", function () {
        cart.splice(cart.indexOf(item), 1);
        saveCart();
      });
      list.appendChild(li);
    });
  }
  function saveCart() { store("de-cart", cart); renderCart(); }

  function setDrawer(open) {
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    openBtn.setAttribute("aria-expanded", String(open));
    body.classList.toggle("drawer-open", open);
    if (open) {
      lastFocus = document.activeElement;
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add("show"); });
      setTimeout(function () { $("#cart-close").focus(); }, 50);
    } else {
      overlay.classList.remove("show");
      setTimeout(function () { overlay.hidden = true; }, 400);
      if (lastFocus) lastFocus.focus();
    }
  }
  openBtn.addEventListener("click", function () { setDrawer(true); });
  $("#cart-close").addEventListener("click", function () { setDrawer(false); });
  overlay.addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (drawer.classList.contains("open")) setDrawer(false);
    setMenu(false);
  });
  $("#checkout").addEventListener("click", function () {
    toast(cartCount() ? "Crypto checkout is coming soon. Stay tuned!" : "Your bag is empty.", "⚡");
  });

  function flyToCart(fromEl) {
    if (reduceMotion || !fromEl.animate) return;
    var a = fromEl.getBoundingClientRect(), b = openBtn.getBoundingClientRect();
    var dot = document.createElement("span");
    dot.className = "fly";
    dot.style.left = a.left + a.width / 2 + "px";
    dot.style.top = a.top + a.height / 2 + "px";
    body.appendChild(dot);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2);
    var dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 120) + "px) scale(1.4)", opacity: 1, offset: 0.5 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(0.4)", opacity: 0.6 }
    ], { duration: 750, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = function () { dot.remove(); };
  }

  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var p = btn.closest(".product");
      var id = p.getAttribute("data-id");
      var item = cart.filter(function (i) { return i.id === id; })[0];
      if (item) item.qty += 1;
      else cart.push({ id: id, name: p.getAttribute("data-name"), price: parseFloat(p.getAttribute("data-price")), swatch: p.getAttribute("data-swatch"), qty: 1 });

      flyToCart(btn);
      setTimeout(function () {
        saveCart();
        openBtn.classList.remove("bump");
        void openBtn.offsetWidth;
        openBtn.classList.add("bump");
      }, reduceMotion ? 0 : 700);
      toast(p.getAttribute("data-name") + " added to your bag");

      var label = $("span", btn);
      label.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(function () { label.textContent = "Add to cart"; btn.classList.remove("added"); }, 1400);
    });
  });
  renderCart();

  // ----- Newsletter -----
  var form = $("#signup");
  var msg = $("#form-msg");

  function confetti(originEl) {
    if (reduceMotion) return;
    var r = originEl.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var palette = ["#9dff1f", "#e6ff2e", "#00e0ff", "#8000ff", "#e21bdc", "#ff0a2c"];
    for (var i = 0; i < 70; i++) {
      var c = document.createElement("span");
      c.className = "confetti";
      c.style.left = cx + "px";
      c.style.top = cy + "px";
      c.style.background = palette[i % palette.length];
      c.style.boxShadow = "0 0 8px " + palette[i % palette.length];
      body.appendChild(c);
      var ang = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 220;
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 140;
      c.animate([
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: "translate(" + dx + "px," + (dy + 260) + "px) rotate(" + (Math.random() * 720 - 360) + "deg)", opacity: 0 }
      ], { duration: 1200 + Math.random() * 800, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    msg.className = "form-msg " + (valid ? "ok" : "err");
    msg.textContent = valid ? "You're in, degen. Watch your inbox for the alpha." : "Please enter a valid email address.";
    if (valid) {
      confetti($("button", form));
      form.reset();
    } else {
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    }
  });

  // ----- Scroll reveal (staggered within each group) -----
  var revealEls = $$(".reveal");
  revealEls.forEach(function (el) {
    var siblings = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", (siblings.indexOf(el) * 0.08) + "s");
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // ----- Footer year -----
  $("#year").textContent = new Date().getFullYear();
})();
