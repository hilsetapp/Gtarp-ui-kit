[Русский](README.md) | [English](README.en.md) | [Español](README.es.md) | **Português**

<div align="center">

<img src="assets/logo.png" width="120" alt="Logo do RP UI Kit">

# RP UI Kit

**Interfaces web prontas para servidores de GTA RP. Qualquer engine: RAGE MP, alt:V, NUI ou um navegador comum.**

[![Playground](https://img.shields.io/badge/Playground-hilsetapp.github.io%2FGtarp--ui--kit-ff8a2a?style=for-the-badge)](https://hilsetapp.github.io/Gtarp-ui-kit/)
[![Licenca: MIT](https://img.shields.io/badge/Licenca-MIT-9ef24d?style=for-the-badge)](LICENSE)

![Banner do RP UI Kit](assets/og-banner.png)

</div>

---

## O que e isso?

Todo servidor RP reescreve a mesma coisa: inventario, telefone, velocimetro, chat.
Sao semanas de encanamento de UI em vez do seu proprio gameplay.

**RP UI Kit** e uma biblioteca aberta de interfaces prontas em **dois arquivos**:
sem frameworks, sem build, sem `node_modules`. Copie para sua pasta CEF, ligue os eventos e funciona.

### O que tem na v0.2

| Componente | O que voce recebe |
|---|---|
| 🎒 **Inventario** | grade com drag-and-drop de verdade (funciona em CEF antigo), contadores, peso, menu de usar/jogar fora com clique direito |
| 🚗 **HUD** | velocimetro com marchas automaticas, barra de combustivel com alerta, luzes de cinto e motor, placa de rua |
| 💬 **Chat** | mensagens com tags, tags coloridas (admin/sistema), desvanecimento automatico, campo de escrita |
| 📱 **Telefone** | notch, tela inicial e apps funcionais: SMS, transferencia bancaria, notas (persistentes), ajustes de tema e seus proprios apps |

### Independente de engine por design

Um unico `RPUI.bridge` descobre onde esta rodando:

| Onde | Eventos de saida | Eventos de entrada |
|---|---|---|
| **RAGE MP** | `mp.trigger("rpui:*", json)` | `browser.call("RPUI.receive", json)` |
| **alt:V** | `alt.emit("rpui:*", data)` | `webView.emit("RPUI.receive", …)` |
| **navegador** | console e listeners JS | `RPUI.receive(ev, data)` |

A mesma pagina roda **no navegador** (modo demo com log de eventos)
e vai para o jogo **sem nenhuma alteracao**.

## 🚀 Teste o playground

> **https://hilsetapp.github.io/Gtarp-ui-kit/**

Sandbox interativo: arraste itens, acelere, abra o telefone e veja
ao vivo o fluxo de eventos que seu servidor receberia.

## Inicio rapido (4 passos)

```bash
# 1. copie os arquivos
kit/rp-ui-kit.js  +  kit/rp-ui-kit.css  →  sua pasta CEF
```

```html
<!-- 2. inclua -->
<link rel="stylesheet" href="rp-ui-kit.css">
<script src="rp-ui-kit.js"></script>
```

```js
// 3. crie
const hud = RPUI.HUD();
document.body.appendChild(hud.el);
RPUI.on("hud:update", (d) => hud.update(d));
```

```js
// 4. lado cliente do RAGE MP
browser.call("RPUI.receive", JSON.stringify({ ev: "hud:update", data: { speed: 88, fuel: 54 } }));
```

## Tema, em uma linha

```css
:root { --rpui-accent: #4da6ff; } /* todos os componentes herdam */
```

## Skins: tres estilos por componente (v0.2.0)

Cada componente tem presets de estilo, trocados por uma opcao `skin`:

| Componente | Skins |
|---|---|
| 🎒 Inventario | `panel` (padrao) · `tight` · `huge` |
| 🚗 HUD | `cluster` (padrao) · `naked` · `pro` (+barra de RPM) |
| 💬 Chat | `stream` (padrao) · `bubble` · `console` |
| 📱 Telefone | `onyx` (padrao) · `arctic` · `bubblegum` |

```js
RPUI.Inventory({ skin: "huge", ... });
```

Teste todos no playground: os chips de skin ficam logo acima dos controles de demo.

Fontes, fundo, raios e cores de alerta tambem sao variaveis: veja o topo de `rp-ui-kit.css`.

## Cola da API

| Fabrica | Emite | Metodos |
|---|---|---|
| `RPUI.Inventory({columns, rows, items, maxWeight})` | `inventory:use · :move · :drop · :close` | `setItems(l)` `updateItem(slot, item?)` `close()` `show()` |
| `RPUI.HUD()` | - | `update({speed,gear,fuel,belt,engine,street})` |
| `RPUI.Chat({fadeMs, input, max})` | `chat:send` | `push({tag,nick,text,cls})` `clear()` |
| `RPUI.Phone({balance, apps})` | `phone:close · :sms · :transfer · :app` | `open()` `close()` `setBalance(n)` |

A descricao completa dos eventos e a integracao com o **RedAge** estao em
[GUIDE_RU.md (em russo, passo a passo)](GUIDE_RU.md).

## Planos

- 🧍 Tela de registro/lobby (v0.2)
- 🗺 Moldura de minimapa e alertas por zona (v0.2)
- 🧾 Toasts de notificacao (v0.2)
- Falta algo? [Escreva em Issues](https://github.com/hilsetapp/Gtarp-ui-kit/issues) ou mande um PR, veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licenca

MIT: faca o que quiser, so mantenha o aviso. [LICENSE](LICENSE).
