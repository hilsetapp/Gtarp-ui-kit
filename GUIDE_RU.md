# 📘 RP UI Kit — руководство «для чайников»

Пошагово и без магии: как взять готовые интерфейсы и заставить их жить на твоём сервере.

---

## 1. Что вообще происходит?

У интерфейсов в RP-серверах каналы связи такие:

```
ВАШ СЕРВЕР (Node.js)        БРАУЗЕР ИГРОКА (CEF)
   │                              │
   │  browser.call("RPUI.receive"│…)  →   события В интерфейс
   │  ←   mp.events.add("rpui:*")        события ИЗ интерфейса
```

RP UI Kit — это готовая страница со стороны «браузера игрока»: она уже умеет
принимать и отправлять такие события. Твоя задача — соединить её с кодом сервера.

## 2. Подключение за 4 шага

**Шаг 1.** Скачай два файла из репозитория:
```
kit/rp-ui-kit.js
kit/rp-ui-kit.css
```
и положи рядом с HTML-страницей твоего CEF (например, `client_packages/cef/` на RAGE MP).

**Шаг 2.** Подключи их на странице:
```html
<link rel="stylesheet" href="rp-ui-kit.css">
<script src="rp-ui-kit.js"></script>
```

**Шаг 3.** Создай компонент и повесь слушателя входящих событий:
```js
const hud = RPUI.HUD();
document.body.appendChild(hud.el);
RPUI.on("hud:update", (d) => hud.update(d));
```

**Шаг 4.** Шли события из игрового кода.

*RAGE MP, клиентская часть (`client_packages`):*
```js
// создаём браузер (об этом уже написано в любом гайде CEF)
const browser = mp.browsers.new("package://cef/index.html");

// каждые ~0.3с обновляем спидометр
setInterval(() => {
  const p = mp.players.local;
  if (!p.vehicle) return;
  const speed = p.vehicle.getSpeed() * 3.6; // м/с → км/ч (зависит от версии API)
  browser.call("RPUI.receive", JSON.stringify({
    ev: "hud:update",
    data: { speed, fuel: 54, street: "Дел Пьерро" },
  }));
}, 300);

// ответы интерфейса ловим так:
mp.events.add("rpui:chat:send", (json) => {
  const { data } = JSON.parse(json);
  mp.events.callRemote("server:chat:send", data.text);
});
```

*alt:V, клиентская часть:*
```js
webView.emit("RPUI.receive", "hud:update", { speed: 88 });
alt.on("rpui:chat:send", ({ data }) => alt.emitServer("chat:send", data.text));
```

## 3. Разработка без запуска игры

Это главный чит-код библиотеки: открой ту же страницу `index.html` **в обычном Chrome**.
Адаптер не найдёт `mp`/`alt` и включит демо-режим:

- все исходящие события падают в консоль DevTools (F12);
- входящие ты вызываешь сам из кода страницы: `RPUI.receive("hud:update", {speed: 42})`;
- верстай и дебажь со всеми инструментами браузера (элемент-инспектор!).

Как всё сделано — закинь файл в проект и заработает в игре **без изменений**.

👉 Полноценный пример такой песочницы — на живом сайте: https://hilsetapp.github.io/rp-ui-kit/

## 4. Все события генератора

| Событие | Срабатывает | Данные |
|---|---|---|
| `inventory:use` | «Использовать» в меню предмета | `{slot, item}` |
| `inventory:move` | Игрок перетащил ячейку | `{from, to}` |
| `inventory:drop` | «Выбросить» в меню предмета | `{slot, item}` |
| `inventory:close` | Кнопка Close | `{}` |
| `chat:send` | Игрок отправил сообщение | `{text}` |
| `phone:close` | Телефон свёрнут | `{}` |
| `phone:sms` | Отправлена СМС | `{to, msg}` |
| `phone:transfer` | Кнопка «Перевести» в банке | `{amount}` |
| `phone:app` | Тап по приложению без встроенного `view` | `{id}` |

Входящие команды удобнее всего маршрутизировать через `RPUI.on(...)` — имена
событий тебе вольно назначать (мы используем `hud:update` просто как конвенцию).

## 5. Кастомизация: цвет, язык, приложения телефона

**Цвет всего сервера** — одна переменная:
```css
:root { --rpui-accent: #ff5340; }
```

**Свои приложения телефона:**
```js
const phone = RPUI.Phone({
  balance: 5000,
  apps: [
    { id: "jobs", icon: "💼", name: "Работы", view(body) { /* своя верстка */ } },
    { id: "gps", icon: "🗺", name: "GPS" }, // без view → прилетит событие phone:app
  ],
});
```

## 6. Проблемы → решения

| Симптом | Причина и лечение |
|---|---|
| Интерфейс чёрный/без стилей | не подключён `rp-ui-kit.css` или неверный путь |
| События из сервера не приходят | в момент `browser.call` браузер может быть не загружен — шли после события `browser.ready` |
| В RAGE события доходят пустыми | `mp.trigger` принимает строки — у нас всё обёрнуто в JSON, проверь `JSON.parse` на клиенте |
| Drag-and-drop не двигается | включён CSS `user-select` на родителе? Форкни и пришли PR — кит это переживёт |

Не нашёлся ответ — [Issues](https://github.com/hilsetapp/rp-ui-kit/issues) с пометкой движка и скрином.

## 7. Как помочь проекту

1. ⭐ звезда в репо — топливо.
2. Рассказал на rp-форуме / в дискорде гильдии.
3. Взял компонент из roadmap и принес PR (см. CONTRIBUTING.md).
