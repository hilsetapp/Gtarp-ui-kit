# Changelog

## [0.1.0] — 2026-10-13

### Added
- 🎉 First release of **RP UI Kit** — engine-agnostic web interfaces for GTA RP servers
- Универсальный мост `RPUI.bridge`: RAGE MP (`mp.trigger`/`browser.call`), alt:V (`alt.emit`), browser demo mode
- 🎒 Inventory: pointer drag-and-drop (old-CEF safe), counts, weight, use/toss context menu
- 🚗 HUD: speedometer + auto-gear, fuel with low alarm, belt/check-engine lamps, street
- 💬 Chat: tags, colored admin/system classes, auto-fade, input box
- 📱 Phone: home screen, SMS threads, bank transfer, persisted notes, accent/wallpaper settings, custom apps hook
- 🏁 Interactive playground (landing page) with live event log + RAGE/alt:V wiring snippets
- Bilingual docs (EN/RU) + beginner guide (GUIDE_RU)

## [0.2.0] — 2026-10-14

### Added
- 🎨 **Skin system** — every component now ships 3 built-in looks switchable by
  one `skin` option: inventory `tight`/`huge`, HUD `naked`/`pro` (+RPM bar),
  chat `bubble`/`console`, phone `arctic`/`bubblegum`. Implemented via local
  CSS-variable overrides — zero runtime cost, easy to fork into your own preset.
- HUD `update({rpm})` support (visible in `pro` skin).
- Playground: skin-chips above demo controls for every component.

### Fixed
- 📱 Phone height no longer overflows small screens (`min(590px, 92vh)`) — on the
  playground stage it could be rendered cropped at the top.
- Doc comment in `rp-ui-kit.js` contained a literal `</script>` — neutralized,
  the file is now safe to inline/bundle.
