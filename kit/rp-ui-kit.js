/* ═══════════════════════════════════════════════════════════════
   RP UI KIT v0.1.0 — engine-agnostic web UI for GTA RP servers.
   Works in RAGE MP CEF, alt:V CEF, FiveM NUI — and in a plain
   browser (demo mode). Exposes one global: RPUI

   Copy ONE line into your page:
     <link rel="stylesheet" href="rp-ui-kit.css">
     <script src="rp-ui-kit.js"></script>
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─────────── tiny DOM helper ─────────── */
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "class") el.className = attrs[k];
        else if (k === "html") el.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") el.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }
  var $ = function (root, sel) { return root.querySelector(sel); };

  /* ─────────── engine bridge ─────────── */
  function detectEngine() {
    if (window.mp && typeof window.mp.trigger === "function") return "rage";
    if (window.alt && typeof window.alt.emit === "function") return "altv";
    return "browser";
  }
  var ENGINE = detectEngine();
  var listeners = {};

  /**
   * Every component event leaves the page through here.
   * RAGE MP:  mp.trigger("rpui:inventory:use", '{"ev":"inventory:use","data":{...}}')
   * alt:V:    alt.emit("rpui:inventory:use", { ev, data })
   * Browser:  console + JS subscribers (demo mode)
   */
  function emit(ev, data) {
    var wrapped = { ev: ev, data: data };
    if (ENGINE === "rage") {
      window.mp.trigger("rpui:" + ev, JSON.stringify(wrapped));
    } else if (ENGINE === "altv") {
      window.alt.emit("rpui:" + ev, wrapped);
    } else if (window.console && console.log) {
      console.log("[RPUI] " + ev, data);
    }
    fanout(ev, data);
  }

  function fanout(ev, data) {
    (listeners[ev] || []).slice().forEach(function (cb) {
      try { cb(data); } catch (e) { console.error && console.error(e); }
    });
    (listeners["*"] || []).slice().forEach(function (cb) {
      try { cb(ev, data); } catch (e) { console.error && console.error(e); }
    });
  }

  function on(ev, cb) {
    (listeners[ev] = listeners[ev] || []).push(cb);
    return function () { off(ev, cb); };
  }
  function off(ev, cb) {
    var arr = listeners[ev] || [];
    var i = arr.indexOf(cb);
    if (i >= 0) arr.splice(i, 1);
  }

  /**
   * Entry point for engine → page calls.
   * RAGE:   browser.call("RPUI.receive", '{"ev":"hud:update","data":{"speed":88}}')
   * alt:V:  webView.emit("RPUI.receive", "hud:update", { speed: 88 })
   * alt:V also:  alt.on("hud:update", d => RPUI.receive("hud:update", d))
   */
  function receive(evOrJson, data) {
    if (data === undefined && typeof evOrJson === "string" && evOrJson.charAt(0) === "{") {
      try {
        var p = JSON.parse(evOrJson);
        evOrJson = p.ev; data = p.data;
      } catch (e) { return; }
    }
    fanout(String(evOrJson), data);
  }

  /* ═══════════ COMPONENT: Inventory ═══════════ */
  /**
   * const inv = RPUI.Inventory({ columns: 6, rows: 5, maxWeight: 30, items: [...] })
   * events →  inventory:use {slot, item}, inventory:move {from, to},
   *           inventory:drop {slot, item}, inventory:close {}
   */
  function Inventory(opts) {
    opts = opts || {};
    var columns = opts.columns || 6;
    var rows = opts.rows || 5;
    var maxWeight = opts.maxWeight || 30;
    var title = opts.title || "Inventory";
    var items = {}; /* slot -> item */
    (opts.items || []).forEach(function (it) { items[it.slot] = it; });

    function weight() {
      var w = 0;
      for (var s in items) w += (items[s].weight || 0) * (items[s].count || 1);
      return w;
    }

    var cells = {};
    var grid = h("div", { class: "rpui-inv-grid", style: "grid-template-columns: repeat(" + columns + ",1fr)" });
    var wLabel = h("span");
    var wBar = h("span");
    var el = h("div", { class: "rpui-inv rpui-box" }, [
      h("div", { class: "rpui-inv-head" }, [
        h("div", { class: "rpui-inv-title" }, [title]),
        h("div", { class: "rpui-inv-weight" }, [wLabel, h("div", { class: "rpui-bar" }, [wBar])]),
      ]),
      grid,
      h("div", { class: "rpui-inv-actions" }, [
        h("button", { class: "rpui-btn", onclick: function () { api.close(); } }, ["Close"]),
      ]),
    ]);

    function cellInner(it) {
      if (!it) return [];
      var out = [];
      if (it.img) out.push(h("img", { src: it.img, alt: "" }));
      else out.push(document.createTextNode(it.emoji || "📦"));
      if (it.count && it.count > 1) out.push(h("span", { class: "count" }, ["×" + it.count]));
      if (it.name) out.push(h("span", { class: "name" }, [it.name]));
      return out;
    }

    function refreshCell(slot) {
      var c = cells[slot];
      var it = items[slot];
      c.innerHTML = "";
      cellInner(it).forEach(function (n) { c.appendChild(n); });
      c.classList.toggle("empty", !it);
    }

    function refreshWeight() {
      var w = Math.round(weight() * 10) / 10;
      wLabel.textContent = w + " / " + maxWeight + " kg";
      wBar.style.width = Math.min(100, (weight() / maxWeight) * 100) + "%";
    }

    for (var i = 0, total = columns * rows; i < total; i++) {
      (function (slot) {
        var c = h("div", { class: "rpui-cell" });
        c.dataset.slot = slot;
        cells[slot] = c;
        grid.appendChild(c);
      })(i);
    }
    for (var s2 in items) refreshCell(Number(s2));
    refreshWeight();

    /* drag & drop (pointer-based: dependable inside old CEF) */
    var drag = null; /* {from, ghost} */
    grid.addEventListener("pointerdown", function (e) {
      var cell = e.target.closest ? e.target.closest(".rpui-cell") : null;
      if (!cell) return;
      var slot = Number(cell.dataset.slot);
      if (!items[slot]) return;
      e.preventDefault();
      var ghost = h("div", { class: "rpui-inv-ghost" });
      ghost.innerHTML = cell.innerHTML;
      document.body.appendChild(ghost);
      cell.classList.add("drag-src");
      drag = { from: slot, ghost: ghost, cell: cell };
      moveGhost(e.clientX, e.clientY);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    });
    function moveGhost(x, y) {
      drag.ghost.style.left = x - 31 + "px";
      drag.ghost.style.top = y - 31 + "px";
    }
    function onMove(e) {
      if (!drag) return;
      moveGhost(e.clientX, e.clientY);
      var over = document.elementFromPoint(e.clientX, e.clientY);
      grid.querySelectorAll(".drop-hint").forEach(function (c) { c.classList.remove("drop-hint"); });
      if (over && over.closest) {
        var c = over.closest(".rpui-cell");
        if (c && grid.contains(c) && Number(c.dataset.slot) !== drag.from) c.classList.add("drop-hint");
      }
    }
    function onUp(e) {
      window.removeEventListener("pointermove", onMove);
      if (!drag) return;
      var over = document.elementFromPoint(e.clientX, e.clientY);
      var to = null;
      if (over && over.closest) {
        var c = over.closest(".rpui-cell");
        if (c && grid.contains(c)) to = Number(c.dataset.slot);
      }
      grid.querySelectorAll(".drop-hint").forEach(function (x) { x.classList.remove("drop-hint"); });
      drag.cell.classList.remove("drag-src");
      drag.ghost.remove();
      var from = drag.from;
      drag = null;
      if (to == null || to === from) return;
      /* swap semantics: empty cell = move, occupied = swap */
      var tmp = items[to];
      items[to] = items[from];
      items[from] = tmp;
      if (!items[from]) delete items[from];
      if (!items[to]) delete items[to];
      refreshCell(from); refreshCell(to);
      emit("inventory:move", { from: from, to: to });
    }

    /* right-click context menu: use / drop */
    var ctxEl = null;
    function closeCtx() { if (ctxEl) { ctxEl.remove(); ctxEl = null; } }
    grid.addEventListener("contextmenu", function (e) {
      var cell = e.target.closest ? e.target.closest(".rpui-cell") : null;
      if (!cell) return;
      var slot = Number(cell.dataset.slot);
      var it = items[slot];
      if (!it) return;
      e.preventDefault();
      closeCtx();
      ctxEl = h("div", { class: "rpui-ctx rpui-box" }, [
        h("button", { onclick: function () { emit("inventory:use", { slot: slot, item: it }); closeCtx(); } }, ["✔ Use"]),
        h("button", { class: "danger", onclick: function () {
          delete items[slot]; refreshCell(slot); refreshWeight();
          emit("inventory:drop", { slot: slot, item: it }); closeCtx();
        } }, ["🗑 Toss"]),
      ]);
      ctxEl.style.left = Math.min(e.clientX, window.innerWidth - 150) + "px";
      ctxEl.style.top = Math.min(e.clientY, window.innerHeight - 110) + "px";
      document.body.appendChild(ctxEl);
      setTimeout(function () { window.addEventListener("pointerdown", closeCtx, { once: true }); }, 10);
    });

    var api = {
      el: el,
      setItems: function (list) {
        items = {};
        (list || []).forEach(function (it) { items[it.slot] = it; });
        for (var s3 in cells) refreshCell(Number(s3));
        refreshWeight();
      },
      updateItem: function (slot, item) {
        if (item) items[slot] = item; else delete items[slot];
        refreshCell(slot); refreshWeight();
      },
      close: function () {
        el.style.display = "none";
        emit("inventory:close", {});
      },
      show: function () { el.style.display = ""; },
      destroy: function () { el.remove(); },
    };
    return api;
  }

  /* ═══════════ COMPONENT: HUD ═══════════ */
  /**
   * const hud = RPUI.HUD() → hud.update({speed, gear, fuel, belt, engine, street})
   */
  function HUD(opts) {
    opts = opts || {};
    var speedEl = h("span", { class: "rpui-hud-speed" }, ["0", h("small", {}, ["км/ч"])]);
    var gearEl = h("div", { class: "rpui-hud-gear" }, ["N"]);
    var beltEl = h("span", { class: "off" }, ["🪢"]);
    var engEl = h("span", { class: "off" }, ["🔧"]);
    var fuelBar = h("span");
    var fuelWrap = h("div", { class: "rpui-hud-fuel" }, [fuelBar]);
    var streetEl = h("div", { class: "rpui-hud-street" }, ["Los Santos"]);
    var el = h("div", { class: "rpui-hud rpui-box" }, [
      streetEl,
      h("div", { class: "rpui-hud-meter" }, [
        gearEl, speedEl,
        h("div", { class: "rpui-hud-flags" }, [beltEl, engEl]),
        fuelWrap,
        h("div", { class: "rpui-hud-fuellbl" }, ["FUEL"]),
      ]),
    ]);

    function gearFor(sp) {
      if (sp <= 0) return "N";
      if (sp < 45) return "1";
      if (sp < 90) return "2";
      if (sp < 130) return "3";
      if (sp < 175) return "4";
      return "5";
    }

    var api = {
      el: el,
      update: function (d) {
        d = d || {};
        if (d.speed != null) {
          speedEl.firstChild.textContent = Math.round(d.speed);
          if (d.gear == null) gearEl.textContent = gearFor(d.speed);
        }
        if (d.gear != null) gearEl.textContent = d.gear;
        if (d.fuel != null) {
          var f = Math.max(0, Math.min(100, d.fuel));
          fuelBar.style.width = f + "%";
          fuelWrap.classList.toggle("low", f <= 15);
        }
        if (d.belt != null) beltEl.classList.toggle("off", !d.belt);
        /* engine = check-engine warning: true → lamp lit, false → dimmed */
        if (d.engine != null) engEl.classList.toggle("off", !d.engine);
        if (d.street != null) streetEl.textContent = d.street;
      },
      destroy: function () { el.remove(); },
    };
    return api;
  }

  /* ═══════════ COMPONENT: Chat ═══════════ */
  /**
   * const chat = RPUI.Chat({ fadeMs: 9000, input: true })
   * chat.push({tag, nick, text, cls})  | events → chat:send {text}
   */
  function Chat(opts) {
    opts = opts || {};
    var fadeMs = opts.fadeMs == null ? 9000 : opts.fadeMs;
    var maxMsgs = opts.max || 12;
    var list = h("div", { class: "rpui-chat-list" });
    var input = h("input", { placeholder: opts.placeholder || "Сообщение…", maxlength: "140" });
    var form = h("div", { class: "rpui-chat-input" }, [
      input,
      h("button", { class: "rpui-btn primary", onclick: send }, ["➤"]),
    ]);
    if (!opts.input) form.setAttribute("hidden", "hidden");
    var el = h("div", { class: "rpui-chat rpui-box" }, [list, form]);

    function prune() {
      while (list.children.length > maxMsgs) list.firstChild.remove();
    }

    function send() {
      var t = input.value.trim();
      if (!t) return;
      input.value = "";
      emit("chat:send", { text: t });
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });

    var api = {
      el: el,
      push: function (m) {
        m = m || {};
        var node = h("div", { class: "rpui-msg " + (m.cls || "") }, [
          m.tag ? h("span", { class: "tag" }, [m.tag]) : null,
          m.nick ? h("span", { class: "nick" }, [m.nick + ": "]) : null,
          document.createTextNode(m.text || ""),
        ]);
        list.appendChild(node);
        prune();
        if (fadeMs > 0) setTimeout(function () { node.classList.add("fade"); }, fadeMs);
        setTimeout(function () { if (fadeMs > 0) node.remove(); }, fadeMs + 700);
      },
      clear: function () { list.innerHTML = ""; },
      send: send,
      destroy: function () { el.remove(); },
    };
    return api;
  }

  /* ═══════════ COMPONENT: Phone ═══════════ */
  /**
   * const phone = RPUI.Phone({ balance: 12450 })
   * events → phone:close {}, phone:sms {to, msg}, phone:transfer {amount}, phone:app {id}
   * custom apps: RPUI.Phone({ apps: [{id:"gps", icon:"🗺", name:"GPS", view(body){}}] })
   */
  function Phone(opts) {
    opts = opts || {};
    var balance = opts.balance == null ? 0 : opts.balance;

    var timeEl = h("span", {}, ["00:00"]);
    function tick() {
      var d = new Date();
      timeEl.textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }
    tick(); setInterval(tick, 30000);

    var home = h("div", { class: "rpui-phone-home" });
    var appView = h("div", { class: "rpui-phone-appview" });
    var screen = h("div", { class: "rpui-phone-screen" }, [home, appView]);
    var el = h("div", { class: "rpui-phone rpui-box" }, [
      h("div", { class: "rpui-phone-notch" }),
      h("div", { class: "rpui-phone-status" }, [timeEl, h("span", {}, ["📶 🔋"])]) ,
      screen,
    ]);

    function showHome() { appView.classList.remove("on"); appView.innerHTML = ""; }
    function openView(title, body) {
      var head = h("div", { class: "rpui-av-head" }, [
        h("button", { class: "rpui-av-back", onclick: showHome }, ["‹"]), title,
      ]);
      appView.innerHTML = "";
      appView.appendChild(head);
      appView.appendChild(h("div", { class: "rpui-av-body" }, [body]));
      appView.classList.add("on");
    }

    /* built-in: messages */
    var threads = [
      { to: "Макс Дитрих", last: "Ю, гонка сегодня?", msgs: [{ me: 0, t: "Ю, гонка сегодня?" }, { me: 1, t: "Да, в 21:00 у порта" }] },
      { to: "Городской банк", last: "Зарплата: +$4 200", msgs: [{ me: 0, t: "Зарплата: +$4 200" }] },
    ];
    function viewMessages() {
      openView("Сообщения", h("div", { class: "rpui-list" }, threads.map(function (th, i) {
        return h("div", { class: "rpui-item", onclick: function () { viewThread(i); } }, [
          h("b", {}, [th.to]), h("small", {}, [th.last]),
        ]);
      })));
    }
    function viewThread(i) {
      var th = threads[i];
      var threadEl = h("div", { class: "rpui-sms-thread" }, th.msgs.map(function (m) {
        return h("div", { class: "rpui-bubble" + (m.me ? " me" : "") }, [m.t]);
      }));
      var inp = h("input", { placeholder: "Написать…" });
      var body = h("div", { style: "display:flex;flex-direction:column;height:100%" }, [threadEl]);
      var form = h("div", { class: "rpui-sms-form" }, [inp, h("button", { onclick: sendIt }, ["➤"])]);
      function sendIt() {
        var t = inp.value.trim(); if (!t) return; inp.value = "";
        th.msgs.push({ me: 1, t: t });
        threadEl.appendChild(h("div", { class: "rpui-bubble me" }, [t]));
        emit("phone:sms", { to: th.to, msg: t });
      }
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") sendIt(); });
      var head = h("div", { class: "rpui-av-head" }, [
        h("button", { class: "rpui-av-back", onclick: viewMessages }, ["‹"]), th.to,
      ]);
      appView.innerHTML = "";
      appView.appendChild(head);
      appView.appendChild(h("div", { class: "rpui-av-body" }, [body]));
      appView.appendChild(form);
      appView.classList.add("on");
    }

    /* built-in: bank */
    function viewBank() {
      var sum = h("div", { class: "rpui-bank-sum" }, ["$ " + balance.toLocaleString("ru-RU")]);
      var amount = h("input", { placeholder: "Сумма перевода", type: "number", style: "width:100%;padding:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:9px;color:inherit;font:500 13px var(--rpui-font);outline:none" });
      openView("Банк", h("div", {}, [
        h("div", { class: "rpui-bank-sub" }, ["Счёт #0001337 · Majestic Bank"]),
        sum,
        h("div", { class: "rpui-bank-sub" }, ["доступно к переводу"]),
        amount,
        h("button", { class: "rpui-btn primary", style: "margin-top:10px;width:100%", onclick: function () {
          var a = Number(amount.value) || 0;
          if (a > 0) emit("phone:transfer", { amount: a });
        } }, ["Перевести"]),
      ]));
    }

    /* built-in: notes (persisted locally) */
    function viewNotes() {
      var area = h("textarea", { class: "rpui-notes-area", placeholder: "Свободный холст для ролеплея…" });
      try { area.value = localStorage.getItem("rpui-notes") || ""; } catch (e) {}
      area.addEventListener("input", function () { try { localStorage.setItem("rpui-notes", area.value); } catch (e) {} });
      openView("Заметки", area);
    }

    /* built-in: settings (accent + wallpaper) */
    var walls = ["#1c1916", "#243527", "#1e2b3a", "#3a2026", "#3d341d"];
    function viewSettings() {
      var wraps = h("div", { class: "rpui-wall" }, walls.map(function (c) {
        var d = h("div", { style: "background:" + c, onclick: function () {
          screen.style.background = c;
          wraps.querySelectorAll("div").forEach(function (x) { x.classList.remove("on"); });
          d.classList.add("on");
        } });
        return d;
      }));
      var accs = ["#ff8a2a", "#9ef24d", "#4da6ff", "#ff5340", "#e879f9"];
      var accWrap = h("div", { class: "rpui-wall" }, accs.map(function (c) {
        return h("div", { style: "background:" + c, onclick: function () {
          document.documentElement.style.setProperty("--rpui-accent", c);
        } });
      }));
      openView("Настройки", h("div", {}, [
        h("b", { style: "display:block;margin-bottom:4px" }, ["Обои"]), wraps,
        h("b", { style: "display:block;margin:16px 0 4px" }, ["Акцент сервера"]), accWrap,
      ]));
    }

    var builtin = [
      { id: "messages", icon: "💬", name: "СМС", view: viewMessages },
      { id: "bank", icon: "💳", name: "Банк", view: viewBank },
      { id: "notes", icon: "📝", name: "Заметки", view: viewNotes },
      { id: "settings", icon: "⚙️", name: "Тема", view: viewSettings },
    ];

    function addApp(app) {
      var node = h("div", { class: "rpui-app" }, [
        h("div", { class: "ic" }, [app.icon]),
        h("span", {}, [app.name]),
      ]);
      node.addEventListener("click", function () {
        if (app.view) app.view();
        else { emit("phone:app", { id: app.id }); openView(app.name, h("small", {}, ["Открой это приложение со стороны сервера."])); }
      });
      home.appendChild(node);
    }
    builtin.concat(opts.apps || []).forEach(addApp);
    home.appendChild(h("div", { class: "rpui-app", onclick: function () { api.close(); } }, [
      h("div", { class: "ic" }, ["⏻"]), h("span", {}, ["Свернуть"]),
    ]));

    var api = {
      el: el,
      open: function () { el.classList.add("open"); },
      close: function () { el.classList.remove("open"); emit("phone:close", {}); },
      setBalance: function (b) { balance = b; },
      destroy: function () { el.remove(); },
    };
    return api;
  }

  /* ─────────── public API ─────────── */
  window.RPUI = {
    version: "0.1.0",
    engine: ENGINE,
    on: on, off: off, emit: emit, receive: receive,
    Inventory: Inventory, HUD: HUD, Chat: Chat, Phone: Phone,
  };
})();
