import { isAppleMobile } from './isAppleMobile'

export function getPwaInstallSteps(browser: Navigator) {
  const { userAgent } = browser
  const isMac = /Macintosh/.test(userAgent)

  if (isAppleMobile(browser)) {
    return [
      'Откройте сайт в Safari и нажмите «Поделиться».',
      'Выберите пункт На экран «Домой».',
      'Включите «Открыть как веб-приложение», если этот пункт доступен.',
      'Нажмите «Добавить».',
    ]
  }

  if (/Android/.test(userAgent)) {
    return [
      'Откройте меню ⋮ в Chrome.',
      'Выберите «Установить приложение» или «Установить и создать ярлык».',
      'Подтвердите установку.',
    ]
  }

  if (isMac && /Version\/.*Safari\//.test(userAgent)) {
    return [
      'Откройте меню «Файл» в Safari на macOS Sonoma 14 или новее.',
      'Выберите «Добавить в Dock».',
    ]
  }

  if (/Edg\//.test(userAgent)) {
    return [
      'Откройте меню ⋯ в Edge.',
      'Выберите «Другие инструменты».',
      'Откройте «Приложения».',
      'Нажмите «Установить этот сайт как приложение».',
    ]
  }

  return [
    'Откройте меню ⋮ в Chrome.',
    'Выберите «Трансляция, сохранение и отправка».',
    'Нажмите «Установить страницу как приложение».',
  ]
}
