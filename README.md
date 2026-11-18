# drink-cat-vue

Фронтенд Drink Cat на Vue 3 и TypeScript. Пока приложение показывает стартовые страницы Vue: настроены маршрутизация, Pinia, компоненты Element Plus и иконки Lucide.

Договорённости по архитектуре, тестам и Git — в [конституции проекта](CLAUDE.md).

## Запуск для разработки

Нужен Node.js 22.18+ в ветке 22.x или Node.js 24.12 и новее.

```sh
npm ci
npm run dev
```

Открой адрес, который выведет Vite (обычно `http://localhost:5173`). Для VS Code рекомендуются расширения из [настроек проекта](.vscode/extensions.json), в том числе Vue (Official) и Oxc.

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Запускает сервер разработки |
| `npm run type-check` | Проверяет TypeScript, в том числе в `.vue` файлах |
| `npm run lint` | Запускает Oxlint и ESLint, исправляет то, что можно исправить автоматически |
| `npm run format` | Форматирует `src/` через Oxfmt |
| `npx oxfmt --check src/` | Проверяет форматирование без правок |
| `npm run test:unit -- --run` | Запускает тесты Vitest один раз |
| `npm run test:e2e -- --project=chromium` | Запускает сквозные тесты Playwright в Chromium |
| `npm run build` | Проверяет типы и собирает приложение в `dist/` |

Перед первым запуском сквозных тестов установи браузер: `npx playwright install chromium`.

## Где что лежит

| Путь | Что в нём |
| --- | --- |
| `src/main.ts` | Точка входа: Vue, Pinia, роутер и Element Plus |
| `src/router/` и `src/views/` | Маршруты и экраны стартового шаблона |
| `src/components/` и `src/stores/` | Компоненты и пример стора из шаблона Vue |
| `e2e/` | Сценарии Playwright |
| `eslint.config.ts`, `.oxlintrc.json`, `.oxfmtrc.json` | Правила ESLint и FSD, Oxlint и форматирование |

Новый код размещаем по FSD внутри `src/`. Слои и правила импортов описаны в [конституции проекта](CLAUDE.md#архитектура-fsd).
