**English** | [Русский](README.md) | [Español](README.es.md) | [Português](README.pt.md)

<div align="center">

<img src="assets/logo.png" width="120" alt="RP UI Kit logo">

# RP UI Kit

**Ready-made web interfaces for GTA RP servers. Any engine: RAGE MP, alt:V, NUI - or a plain browser.**

[![Live playground](https://img.shields.io/badge/Playground-hilsetapp.github.io%2FGtarp--ui--kit-ff8a2a?style=for-the-badge)](https://hilsetapp.github.io/Gtarp-ui-kit/)
[![License: MIT](https://img.shields.io/badge/License-MIT-9ef24d?style=for-the-badge)](LICENSE)
[![No build](https://img.shields.io/badge/build-none-e879f9?style=for-the-badge)](#)

![RP UI Kit banner](assets/og-banner.png)

</div>

---

## What is this?

Every RP server re-builds the same muscle: an inventory, a phone, a speed HUD, a chat.
That's weeks of UI plumbing instead of *your* gameplay.

**RP UI Kit** is an open library of polished, production-grade interfaces as **two files** -
no framework, no bundler, no `node_modules`. Drop it into your CEF folder, wire events,
it just works.

### What's inside v0.2

| Component | What you get |
|---|---|
| 🎒 **Inventory** | grid with real pointer drag-and-drop (works in old CEF!), counts, weight bar, right-click *use/toss* menu |
| 🚗 **HUD** | speedometer with auto-gear, fuel bar with low-fuel alarm, belt & check-engine lamps, street label |
| 💬 **Chat** | tagged messages, colored tags (admin/system), auto-fade, own input box |
| 📱 **Phone** | notch → home screen → working apps: SMS threads, bank transfer form, notes (persisted), theme settings + your custom apps |

### Engine-agnostic by design

A single `RPUI.bridge` auto-detects where it's running:

| Where | Outgoing events | Incoming events |
|---|---|---|
| **RAGE MP** | `mp.trigger("rpui:*", json)` | `browser.call("RPUI.receive", json)` |
| **alt:V** | `alt.emit("rpui:*", data)` | `webView.emit("RPUI.receive", …)` |
| **browser** | console + JS listeners | `RPUI.receive(ev, data)` |

The same page can be developed **in your browser** (demo mode with an event log)
and shipped **unchanged** into the game.

## 🚀 Try the playground

> **https://hilsetapp.github.io/Gtarp-ui-kit/**

Interactive sandbox: drag items, press accelerator, open the phone and watch
the event stream your server would receive, live.

## Quick start (4 steps)

```bash
# 1. copy the files
kit/rp-ui-kit.js  +  kit/rp-ui-kit.css  →  your CEF folder
```

```html
<!-- 2. include -->
<link rel="stylesheet" href="rp-ui-kit.css">
<script src="rp-ui-kit.js"></script>
```

```js
// 3. create
const hud = RPUI.HUD();
document.body.appendChild(hud.el);
RPUI.on("hud:update", (d) => hud.update(d));
```

```js
// 4. (RAGE MP server-side client_packages)
browser.call("RPUI.receive", JSON.stringify({ ev: "hud:update", data: { speed: 88, fuel: 54 } }));
```

## Theming, one line

```css
:root { --rpui-accent: #4da6ff; } /* every component picks it up */
```

## Skins: three looks per component (v0.2.0)

Each component ships with built-in style presets, switched by one `skin` option:

| Component | Skins |
|---|---|
| 🎒 Inventory | `panel` (default) · `tight` · `huge` |
| 🚗 HUD | `cluster` (default) · `naked` · `pro` (+RPM bar) |
| 💬 Chat | `stream` (default) · `bubble` · `console` |
| 📱 Phone | `onyx` (default) · `arctic` · `bubblegum` |

```js
RPUI.Inventory({ skin: "huge", ... });
```

Try them all live in the playground: skin-chips sit right above the demo controls.

Fonts, background, radius and danger/ok colors are variables too, see the top of `rp-ui-kit.css`.

## API cheat-sheet

| Factory | Emits | API |
|---|---|---|
| `RPUI.Inventory({columns, rows, items, maxWeight})` | `inventory:use · :move · :drop · :close` | `setItems(l)` `updateItem(slot, item?)` `close()` `show()` |
| `RPUI.HUD()` | - | `update({speed,gear,fuel,belt,engine,street})` |
| `RPUI.Chat({fadeMs, input, max})` | `chat:send` | `push({tag,nick,text,cls})` `clear()` |
| `RPUI.Phone({balance, apps})` | `phone:close · :sms · :transfer · :app` | `open()` `close()` `setBalance(n)` |

Events in **bold camel format** are documented in full inside
[GUIDE (RU, beginner-friendly)](GUIDE_RU.md).

## Roadmap

- 🧍 Character registration/lobby screen (v0.2)
- 🗺 Minimap frame + zone alerts (v0.2)
- 🧾 Notification toasts (v0.2)
- Want one? [Open an issue](https://github.com/hilsetapp/Gtarp-ui-kit/issues) or send a PR, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Why free?

Because every RP developer deserves their weekend back. If the kit saved you hours, [⭐ star the repo](https://github.com/hilsetapp/Gtarp-ui-kit) - that's the whole payment.

## License

MIT: do anything, just keep the notice. See [LICENSE](LICENSE).

---

<div align="center">
Made for the RU RP scene · works everywhere Lua refuses to run · 2026
</div>
