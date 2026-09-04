/* Карточки хаба /games. Три вида ссылок:
   - "react": внутренний маршрут этого приложения (<Link>)
   - "static": статичный HTML в public/games/<slug>/, ванильный
     JS как есть, открывается обычной ссылкой (полная загрузка)
   - "external": чужой домен (legacy-сайт), новая вкладка */

export const games = [
  {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    kind: 'react',
    href: '/games/tic-tac-toe',
    description: {
      en: 'X and O, built fresh for this site — win detection and a draw message.',
      ru: 'Крестики-нолики, написаны заново для этого сайта: определение победы и ничьей.',
    },
    tags: ['React'],
  },
  {
    id: 'stopwatch',
    title: 'Stopwatch',
    kind: 'react',
    href: '/stopwatch',
    description: {
      en: 'Stopwatch with a lap history, plus a countdown timer with presets.',
      ru: 'Секундомер с историей кругов и таймер обратного отсчёта с готовыми интервалами.',
    },
    tags: ['React', 'Timers'],
  },
  {
    id: 'protect-your-friend',
    title: 'Protect Your Friend',
    kind: 'external',
    href: 'https://legacy.alekseilopatin.com/protect-your-friend/',
    description: {
      en: 'Mouse-controlled 2D defense game built in Godot — 40 MB web export, kept on the archived site.',
      ru: '2D-защита с управлением мышью на Godot — веб-сборка весит 40 МБ, поэтому живёт на архивной версии сайта.',
    },
    tags: ['Godot'],
  },
  {
    id: 'dragon-repeller',
    title: 'RPG — Dragon Repeller',
    kind: 'static',
    href: '/games/dragon-repeller/',
    description: {
      en: 'Text RPG with fights, inventory and a shop. Original vanilla JS, unchanged.',
      ru: 'Текстовая RPG с боями, инвентарём и магазином. Оригинальный ванильный JS, без изменений.',
    },
    tags: ['JavaScript'],
  },
  {
    id: 'rock-paper-scissors-lizard-spock',
    title: 'Rock Paper Scissors Lizard Spock',
    kind: 'static',
    href: '/games/rock-paper-scissors-lizard-spock/',
    description: {
      en: 'The extended version from The Big Bang Theory.',
      ru: 'Расширенная версия из «Теории большого взрыва».',
    },
    tags: ['JavaScript'],
  },
  {
    id: 'platformer',
    title: 'Platformer Game',
    kind: 'static',
    href: '/games/platformer/',
    description: {
      en: 'Platformer with jump physics and checkpoints.',
      ru: 'Платформер с физикой прыжков и чекпоинтами.',
    },
    tags: ['Canvas'],
  },
  {
    id: 'advanced-dice-game',
    title: 'Advanced Dice Game',
    kind: 'static',
    href: '/games/advanced-dice-game/',
    description: {
      en: 'Dice poker with combination scoring.',
      ru: 'Покер на кубиках с подсчётом комбинаций.',
    },
    tags: ['JavaScript'],
  },
  {
    id: 'fraction-quiz',
    title: 'Fraction Practice',
    kind: 'static',
    href: '/games/fraction-quiz/',
    description: {
      en: 'Quiz for simplifying fractions, built for my own classroom.',
      ru: 'Тренажёр на сокращение дробей, сделан для моего собственного класса.',
    },
    tags: ['JavaScript', 'Math'],
  },
];
