/* Единственный источник правды по проектам.
   Добавить проект = добавить объект сюда, разметку трогать не надо.
   description хранит оба языка: { en, ru }. */

export const projects = [
  /* ---------- Внутренние страницы сайта ---------- */
  {
    id: 'currency-converter',
    title: 'Currency Converter',
    description: {
      en: 'Converts between 44 currencies on live rates, with an offline fallback.',
      ru: 'Конвертирует 44 валюты по живым курсам, с запасной таблицей на случай офлайна.',
    },
    href: '/currency',
    internal: true,
    image: '/media/currency.svg',
    tags: ['React', 'API', 'Tool'],
  },

  /* ---------- Новые проекты ---------- */
  {
    id: 'thai-buddy',
    title: 'Thai Buddy',
    description: {
      en: 'Gamified Thai-learning app: skill tree, spaced repetition, tone trainer.',
      ru: 'Геймифицированное приложение для изучения тайского: дерево навыков, интервальные повторения, тренажёр тонов.',
    },
    href: 'https://thai-buddy.vercel.app',
    image: '/media/thai-buddy.png',
    tags: ['Next.js', 'TypeScript', 'Supabase'],
  },
  {
    id: 'gradebook-frontend',
    title: 'Mini-Gradebook · Frontend',
    description: {
      en: 'React + TypeScript client for a full-stack school gradebook.',
      ru: 'React + TypeScript клиент для школьного электронного журнала.',
    },
    href: 'https://gradebook.alekseilopatin.com',
    image: '/media/gradebook-frontend.png',
    tags: ['React', 'TypeScript', 'Full-stack'],
  },
  {
    id: 'gradebook-api',
    title: 'Mini-Gradebook · API',
    description: {
      en: 'FastAPI + SQLAlchemy + PostgreSQL backend with role-based access.',
      ru: 'Бэкенд на FastAPI + SQLAlchemy + PostgreSQL с ролевым доступом.',
    },
    href: 'https://github.com/AlekseiLopatin/school-portal-api',
    image: '/media/gradebook-api.png',
    tags: ['Python', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'macrokin',
    title: 'MacroKin',
    description: {
      en: 'Meal plans filtered to your macros, with a priced grocery list.',
      ru: 'Планы питания под ваши макросы и список покупок с ценами.',
    },
    href: 'https://macro-calculated-meals.vercel.app/',
    image: '/media/macrokin.svg',
    tags: ['TypeScript', 'Next.js', 'API'],
  },
  {
    id: 'school-portal',
    title: 'School Portal',
    description: {
      en: 'School management portal: timetable, grades, roles.',
      ru: 'Портал управления школой: расписание, оценки, роли.',
    },
    href: 'https://school.alekseilopatin.com',
    image: '/media/studyComputer.jpg',
    tags: ['React', 'API', 'Full-stack'],
  },
  {
    id: 'bookshelf',
    title: 'Bookshelf',
    description: {
      en: 'Django app that turns an Excel sheet into a searchable library.',
      ru: 'Django-приложение, превращающее Excel-таблицу в библиотеку с поиском.',
    },
    href: 'https://github.com/AlekseiLopatin/bookshelf',
    image: '/media/bookshelf.png',
    tags: ['Python', 'Django'],
  },
  {
    id: 'dnd-crit-bot',
    title: 'D&D Critical Hit Bot',
    description: {
      en: 'Discord bot that resolves extended critical-hit rules at the table.',
      ru: 'Discord-бот, который разруливает расширенные правила критов прямо за столом.',
    },
    href: 'https://github.com/AlekseiLopatin/dnd-critical-hit-bot',
    image: '/media/dnd-bot.png',
    tags: ['Python', 'Discord', 'TTRPG'],
  },
  {
    id: 'location-generators',
    title: 'Location Generators',
    description: {
      en: 'Procedurally generates fantasy trading posts with 20+ interlocking traits.',
      ru: 'Процедурная генерация фэнтезийных торговых постов: 20+ взаимосвязанных признаков.',
    },
    href: 'https://github.com/AlekseiLopatin/location-generators',
    image: '/media/location-generators.png',
    tags: ['Python', 'Tool', 'TTRPG'],
  },
  /* 10-я по счёту: попадает во "Show more", а не на первый экран —
     это лаборатория упражнений, не отдельный проект. */
  {
    id: 'practice',
    title: 'Practice Lab',
    description: {
      en: 'A shelf of small React exercises: colour picker, OTP generator, RSVP form and whatever comes next.',
      ru: 'Полка с маленькими упражнениями на React: выбор цвета, генератор OTP, форма RSVP и всё, что появится дальше.',
    },
    href: '/practice',
    internal: true,
    image: '/media/practice.svg',
    tags: ['React', 'Lab'],
  },
  {
    id: 'student-picker',
    title: 'Student Picker',
    description: {
      en: 'Single-file random student picker with six animated styles.',
      ru: 'Случайный выбор ученика в одном файле, шесть анимированных режимов.',
    },
    href: 'https://legacy.alekseilopatin.com/wheel/',
    tags: ['JavaScript', 'Tool', 'UI'],
  },
  {
    id: 'protect-your-friend',
    title: 'Protect Your Friend',
    description: {
      en: 'Mouse-controlled 2D defense game built in Godot.',
      ru: '2D-защита с управлением мышью, сделана на Godot.',
    },
    href: 'https://legacy.alekseilopatin.com/protect-your-friend/',
    tags: ['Godot', 'Game'],
  },

  /* ---------- С прежнего сайта ---------- */
  {
    id: 'ember-hunter',
    title: 'Ember Hunter',
    description: {
      en: 'Canvas browser game in the site’s own dark palette.',
      ru: 'Браузерная игра на канвасе в фирменной тёмной палитре.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/emberHunter/ember-hunter.html',
    image: '/media/ember.jpg',
    tags: ['Canvas', 'Game'],
  },
  {
    id: 'spreadsheet',
    title: 'Spreadsheet',
    description: {
      en: 'Spreadsheet with formulas and expression parsing.',
      ru: 'Таблица с формулами и разбором выражений.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/spreadsheet/spreadsheet.html',
    image: '/media/sheet.jpg',
    tags: ['JavaScript', 'Parser'],
  },
  {
    id: 'statistics-calculator',
    title: 'Statistics Calculator',
    description: {
      en: 'Mean, median, mode, variance and standard deviation.',
      ru: 'Среднее, медиана, мода, дисперсия и отклонение.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/statisticsCalculator/statisticsCalculator.html',
    image: '/media/stats.png',
    tags: ['JavaScript', 'Math'],
  },
  {
    id: 'platformer',
    title: 'Platformer Game',
    description: {
      en: 'Platformer with jump physics and checkpoints.',
      ru: 'Платформер с физикой прыжков и чекпоинтами.',
    },
    href: 'https://legacy.alekseilopatin.com/miniGames/platformer/platformer.html',
    image: '/media/mario.jpg',
    tags: ['Canvas', 'Game'],
  },
  {
    id: 'dragon-repeller',
    title: 'RPG — Dragon Repeller',
    description: {
      en: 'Text RPG with fights, inventory and a shop.',
      ru: 'Текстовая RPG с боями, инвентарём и магазином.',
    },
    href: 'https://legacy.alekseilopatin.com/miniGames/dragonRepeller/dragonRepeller.html',
    image: '/media/dragon.webp',
    tags: ['JavaScript', 'Game'],
  },
  {
    id: 'advanced-dice',
    title: 'Advanced Dice Game',
    description: {
      en: 'Dice poker with combination scoring.',
      ru: 'Покер на кубиках с подсчётом комбинаций.',
    },
    href: 'https://legacy.alekseilopatin.com/miniGames/advancedDiceGame/advancedDiceGame.html',
    image: '/media/diceGame.jpg',
    tags: ['JavaScript', 'Game'],
  },
  {
    id: 'rpsls',
    title: 'Rock Paper Scissors Lizard Spock',
    description: {
      en: 'The extended version from The Big Bang Theory.',
      ru: 'Расширенная версия из «Теории большого взрыва».',
    },
    href: 'https://legacy.alekseilopatin.com/miniGames/rockScissorsPaper/rockScissorsPaperLizardSpock.html',
    image: '/media/rockScissorsPaper.jpg',
    tags: ['JavaScript', 'Game'],
  },
  {
    id: 'critical-hits',
    title: 'Critical Hits for D&D',
    description: {
      en: 'Critical-hit generator for tabletop sessions.',
      ru: 'Генератор критических попаданий для настолок.',
    },
    href: 'https://legacy.alekseilopatin.com/rpgTools/criticalHits/criticalHits.html',
    image: '/media/sword.webp',
    tags: ['Tool', 'TTRPG'],
  },
  {
    id: 'operations-generator',
    title: 'Operations Generator',
    description: {
      en: 'Mission generator for Band of Blades.',
      ru: 'Генератор операций для Band of Blades.',
    },
    href: 'https://legacy.alekseilopatin.com/rpgTools/operationGenerator/operationsGenerator.html',
    image: '/media/bandOfBlades.jpg',
    tags: ['Tool', 'TTRPG'],
  },
  {
    id: 'music-player',
    title: 'Music Player',
    description: {
      en: 'Player with playlist, shuffle and repeat.',
      ru: 'Плеер с плейлистом, шафлом и повтором.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/musicPlayer/musicPlayer.html',
    image: '/media/musicPlayer.webp',
    tags: ['JavaScript', 'Audio'],
  },
  {
    id: 'shopping-cart',
    title: 'Shopping Cart',
    description: {
      en: 'Cart with running total and change calculation.',
      ru: 'Корзина с подсчётом суммы и сдачи.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/shoppingCart/shoppingCart.html',
    image: '/media/shopping.webp',
    tags: ['JavaScript', 'UI'],
  },
  {
    id: 'todo-app',
    title: 'Todo App',
    description: {
      en: 'Tasks persisted to localStorage.',
      ru: 'Задачи с сохранением в localStorage.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/todoApp/todoApp.html',
    image: '/media/todoApp.png',
    tags: ['JavaScript', 'Storage'],
  },
  {
    id: 'calorie-counter',
    title: 'Calorie Counter',
    description: {
      en: 'Calorie counter with a daily balance.',
      ru: 'Счётчик калорий с балансом за день.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/calorieCounter/calorieCounter.html',
    image: '/media/calorie.jpg',
    tags: ['JavaScript', 'Forms'],
  },
  {
    id: 'student-cards',
    title: 'Student Cards',
    description: {
      en: 'Student cards for the school portal.',
      ru: 'Карточки учеников для школьного портала.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/studentCards/studentCards.html',
    image: '/media/classroom.jpg',
    tags: ['JavaScript', 'UI'],
  },
  {
    id: 'stopwatch',
    title: 'Stopwatch',
    description: {
      en: 'Stopwatch with laps and accurate timing.',
      ru: 'Секундомер с кругами и точным таймингом.',
    },
    href: 'https://legacy.alekseilopatin.com/stopwatch/',
    image: '/media/stopwatch.webp',
    tags: ['JavaScript', 'Timers'],
  },
  {
    id: 'date-formatter',
    title: 'Date Formatter',
    description: {
      en: 'Converts dates between formats.',
      ru: 'Перевод даты между форматами.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/dateFormatter/dateFormatter.html',
    image: '/media/calender.webp',
    tags: ['JavaScript', 'Dates'],
  },
  {
    id: 'roman-numerals',
    title: 'Roman Numerals Converter',
    description: {
      en: 'Arabic numbers to Roman and back.',
      ru: 'Арабские числа в римские и обратно.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/romanToNumeral/romanToNumeral.html',
    image: '/media/roman.png',
    tags: ['JavaScript', 'Algorithms'],
  },
  {
    id: 'decimal-binary',
    title: 'Decimal to Binary',
    description: {
      en: 'Binary conversion with the recursion visualised.',
      ru: 'Перевод в двоичную с показом рекурсии.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/decimalToBinary/decimalToBinary.html',
    image: '/media/binary.webp',
    tags: ['JavaScript', 'Algorithms'],
  },
  {
    id: 'palindrome',
    title: 'Palindrome Checker',
    description: {
      en: 'Checks whether a string is a palindrome.',
      ru: 'Проверка строки на палиндром.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/palindrome/palindrome.html',
    image: '/media/level.jpg',
    tags: ['JavaScript', 'Algorithms'],
  },
  {
    id: 'phone-validator',
    title: 'Telephone Number Validator',
    description: {
      en: 'Phone-number validation with regular expressions.',
      ru: 'Валидация телефонов регулярными выражениями.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/phoneValidator/phoneValidator.html',
    image: '/media/phone.jpg',
    tags: ['JavaScript', 'Regex'],
  },
  {
    id: 'newspaper-layout',
    title: 'Newspaper Layout',
    description: {
      en: 'Newspaper layout built on CSS columns and grid.',
      ru: 'Газетная вёрстка на колонках и гридах.',
    },
    href: 'https://legacy.alekseilopatin.com/projects/newspaperLayout/newspaperLayout.html',
    image: '/media/classroomAnime.jpg',
    tags: ['CSS', 'Layout'],
  },
];

/* Теги для фильтра собираются из данных, а не пишутся руками —
   значит новый тег появляется в фильтре сам. */
export const allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();
