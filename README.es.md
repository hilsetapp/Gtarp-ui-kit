[English](README.en.md) | [Русский](README.md) | **Español** | [Português](README.pt.md)

<div align="center">

<img src="assets/logo.png" width="120" alt="Logo de RP UI Kit">

# RP UI Kit

**Interfaces web listas para servidores de GTA RP. Cualquier motor: RAGE MP, alt:V, NUI o un navegador normal.**

[![Playground](https://img.shields.io/badge/Playground-hilsetapp.github.io%2FGtarp--ui--kit-ff8a2a?style=for-the-badge)](https://hilsetapp.github.io/Gtarp-ui-kit/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-9ef24d?style=for-the-badge)](LICENSE)

![Banner de RP UI Kit](assets/og-banner.png)

</div>

---

## Que es esto?

Cada servidor RP reescribe lo mismo: inventario, telefono, velocimetro, chat.
Eso son semanas de fontaneria de UI en lugar de tu propio gameplay.

**RP UI Kit** es una biblioteca abierta de interfaces pulidas en **dos archivos**:
sin frameworks, sin build, sin `node_modules`. La copias a tu carpeta CEF, conectas los eventos y funciona.

### Que hay dentro de la v0.2

| Componente | Que obtienes |
|---|---|
| 🎒 **Inventario** | rejilla con drag-and-drop real (funciona en CEF antiguo), contadores, peso, menu de usar/tirar con clic derecho |
| 🚗 **HUD** | velocimetro con marchas automaticas, barra de combustible con alarma, luces de cinturon y motor, etiqueta de calle |
| 💬 **Chat** | mensajes con etiquetas, etiquetas de color (admin/sistema), desvanecido automatico, campo de escritura |
| 📱 **Telefono** | notch, pantalla de inicio y apps funcionales: SMS, transferencia bancaria, notas (persistentes), ajustes de tema y tus propias apps |

### Independiente del motor por diseño

Un solo `RPUI.bridge` detecta donde se esta ejecutando:

| Donde | Eventos salientes | Eventos entrantes |
|---|---|---|
| **RAGE MP** | `mp.trigger("rpui:*", json)` | `browser.call("RPUI.receive", json)` |
| **alt:V** | `alt.emit("rpui:*", data)` | `webView.emit("RPUI.receive", …)` |
| **navegador** | consola y listeners JS | `RPUI.receive(ev, data)` |

La misma pagina se desarrolla **en el navegador** (modo demo con registro de eventos)
y se lleva al juego **sin cambiar nada**.

## 🚀 Prueba el playground

> **https://hilsetapp.github.io/Gtarp-ui-kit/**

Sandbox interactivo: arrastra objetos, pisa el acelerador, abre el telefono y mira
en vivo el flujo de eventos que recibiria tu servidor.

## Inicio rapido (4 pasos)

```bash
# 1. copia los archivos
kit/rp-ui-kit.js  +  kit/rp-ui-kit.css  →  tu carpeta CEF
```

```html
<!-- 2. incluye -->
<link rel="stylesheet" href="rp-ui-kit.css">
<script src="rp-ui-kit.js"></script>
```

```js
// 3. crea
const hud = RPUI.HUD();
document.body.appendChild(hud.el);
RPUI.on("hud:update", (d) => hud.update(d));
```

```js
// 4. lado del cliente de RAGE MP
browser.call("RPUI.receive", JSON.stringify({ ev: "hud:update", data: { speed: 88, fuel: 54 } }));
```

## Tema, en una linea

```css
:root { --rpui-accent: #4da6ff; } /* todos los componentes lo heredan */
```

## Skins: tres estilos por componente (v0.2.0)

Cada componente trae presets de estilo, se cambian con una opcion `skin`:

| Componente | Skins |
|---|---|
| 🎒 Inventario | `panel` (default) · `tight` · `huge` |
| 🚗 HUD | `cluster` (default) · `naked` · `pro` (+barra RPM) |
| 💬 Chat | `stream` (default) · `bubble` · `console` |
| 📱 Telefono | `onyx` (default) · `arctic` · `bubblegum` |

```js
RPUI.Inventory({ skin: "huge", ... });
```

Pruebalos todos en el playground: los chips de skins estan justo encima de los controles de demo.

Fuentes, fondo, radios y colores de alerta tambien son variables: mira el inicio de `rp-ui-kit.css`.

## Chuleta de la API

| Fabrica | Emite | Metodos |
|---|---|---|
| `RPUI.Inventory({columns, rows, items, maxWeight})` | `inventory:use · :move · :drop · :close` | `setItems(l)` `updateItem(slot, item?)` `close()` `show()` |
| `RPUI.HUD()` | - | `update({speed,gear,fuel,belt,engine,street})` |
| `RPUI.Chat({fadeMs, input, max})` | `chat:send` | `push({tag,nick,text,cls})` `clear()` |
| `RPUI.Phone({balance, apps})` | `phone:close · :sms · :transfer · :app` | `open()` `close()` `setBalance(n)` |

La descripcion completa de eventos y la integracion con **RedAge** estan en
[GUIDE_RU.md (en ruso, paso a paso)](GUIDE_RU.md).

## Planes

- 🧍 Pantalla de registro/lobby (v0.2)
- 🗺 Marco de minimapa y alertas por zona (v0.2)
- 🧾 Toasts de notificaciones (v0.2)
- Falta algo? [Escribe en Issues](https://github.com/hilsetapp/Gtarp-ui-kit/issues) o manda un PR, mira [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

MIT: haz lo que quieras, solo conserva el aviso. [LICENSE](LICENSE).
