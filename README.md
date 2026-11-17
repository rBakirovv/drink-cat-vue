# drink-cat-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Форматирование

Используем Oxfmt. Настройки — в `.oxfmtrc.json`: одинарные кавычки, без точек с запятой.
`npm run format` форматирует файлы в `src/`. В VS Code включено форматирование при сохранении
через расширение `oxc.oxc-vscode` (оно есть в рекомендациях проекта).

## Архитектура — FSD

Новый код размещаем по слоям внутри `src/`, сверху вниз:

- `app` — подключение Vue, роутера, Pinia, Element Plus и глобальных стилей.
- `pages` — страницы маршрутов.
- `widgets` — крупные блоки интерфейса.
- `features` — действия пользователя, например добавление напитка.
- `entities` — бизнес-сущности, например напиток.
- `shared` — общие компоненты, функции и конфигурация без бизнес-логики.

Слой может импортировать только нижележащие слои. Независимые слайсы одного слоя
не импортируют друг друга. Слайс — папка отдельной сущности или возможности,
например `entities/drink` или `features/add-drink`.

Внутри слайса используем сегменты: `ui/` для Vue-компонентов, `model/` для состояния
и логики (в том числе Pinia), `api/` для запросов, `lib/` для вспомогательных функций.
Публичный API слайса экспортируем через `index.ts`, например:
`import { DrinkCard } from '@/entities/drink'`. Относительные импорты оставляем внутри слайса.
В `shared` и `app` используем сегменты без слайсов. Пустые слои заранее создавать не нужно.

Правила проверяет `eslint-plugin-fsd-lint` с пресетом `recommended`, как в `vacation`.
Он подключён к TypeScript и Vue-файлам; порядок импортов проверяется с уровнем предупреждения.
Запуск проверки: `npm run lint` (с автоматическим исправлением).

Текущие `components/`, `views/`, `stores/`, `router/` и `assets/` — стартовый шаблон Vue,
ещё не перенесённый в FSD. Правила FSD проверяют импорты между распознаваемыми слоями,
но не требуют автоматически переносить эти каталоги.
