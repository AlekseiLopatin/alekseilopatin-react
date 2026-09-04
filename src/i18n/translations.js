/* Плоские ключи вида 'секция.элемент'.
   Оба языка держим рядом, чтобы пропущенный перевод сразу бросался в глаза. */

export const translations = {
  en: {
    'nav.projects': 'Projects',
    'nav.practice': 'Practice',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.skip': 'Skip to content',
    'nav.theme': 'Colour theme',
    'nav.language': 'Language',
    'nav.mainNav': 'Main navigation',

    'projects.heading': 'Projects',
    'projects.count': 'showing {shown} of {total}',
    'projects.filter': 'Filter by tag',
    'projects.all': 'All',
    'projects.empty': 'Nothing matches this tag yet.',
    'projects.showAll': 'Show {n} more',
    'projects.showLess': 'Show less',

    'meta.home.title': 'Aleksei Lopatin — Full-stack developer',
    'meta.home.desc':
      'Projects, React labs and contacts. React, TypeScript, FastAPI and Python.',
    'meta.practice.title': 'Practice Lab — Aleksei Lopatin',
    'meta.practice.desc':
      'Small React exercises: colour picker, OTP generator with a countdown, and an RSVP form.',
    'meta.currency.title': 'Currency Converter — Aleksei Lopatin',
    'meta.currency.desc':
      'Converts 44 currencies on live rates, with search, flags and an offline fallback.',
    'meta.notFound.title': 'Page not found — Aleksei Lopatin',
    'meta.notFound.desc': 'This address does not exist on the site.',
    'meta.games.title': 'Mini Games — Aleksei Lopatin',
    'meta.games.desc':
      'Tic-Tac-Toe and a stopwatch rebuilt in React, plus the original vanilla-JS mini games.',
    'meta.ticTacToe.title': 'Tic-Tac-Toe — Aleksei Lopatin',
    'meta.ticTacToe.desc': 'X and O with win and draw detection, built in React.',
    'meta.stopwatch.title': 'Stopwatch — Aleksei Lopatin',
    'meta.stopwatch.desc': 'A stopwatch with lap history and a countdown timer, built in React.',
    'meta.wheel.title': 'Student Picker — Aleksei Lopatin',
    'meta.wheel.desc':
      'Six ways to pick a random student, rebuilt in React for smoother animation.',

    'notFound.heading': 'This page does not exist',
    'notFound.text':
      'The address below did not match anything on this site. It may be a typo, or a link from the previous version of the site.',
    'notFound.home': 'Go to projects',
    'notFound.legacy': 'Open site v1',

    'about.heading': 'About',
    'about.lead': 'Developer by passion, teacher by profession.',
    'about.p1':
      'I build full-stack web applications and small tools that solve real problems. The school-management portal started as something my own classroom needed; the gradebook behind it is a React + FastAPI + PostgreSQL app I shipped end to end, from the database schema to the deployed domain.',
    'about.p2':
      'I teach maths when I am not writing code, and that shows in what I build: most of my projects come from a problem I actually had, not from a tutorial. I care about clean code, honest UX, and shipping things people use.',
    'about.open':
      'Open to full-stack and back-end engineering roles — remote or relocation.',
    'about.stack.languages': 'Languages',
    'about.stack.frameworks': 'Frameworks',
    'about.stack.tools': 'Tools & platforms',

    'contact.heading': 'Contact',
    'contact.intro':
      'The fastest way to reach me is email. I read everything and reply within a day or two.',
    'contact.copy': 'Copy',
    'contact.copied': 'Copied ✓',

    'practice.heading': 'Practice Lab',
    'practice.intro':
      'Small React exercises, kept here so the patterns stay findable. Each one solved a single problem before it went into the site.',
    'practice.back': '← Back to projects',
    'currency.heading': 'Currency Converter',
    'currency.intro':
      'Live rates for 44 currencies, with a stored table as a fallback when the network is unavailable.',

    'games.heading': 'Mini Games',
    'games.intro':
      'Tic-Tac-Toe, the stopwatch and the student picker are rebuilt in React. Everything else here is the original vanilla JS, unchanged — no reason to rewrite something that already works.',
    'games.back': '← Back to mini games',

    'ticTacToe.heading': 'Tic-Tac-Toe',
    'ticTacToe.intro': 'X and O, win detection, a draw message, and a reset button.',

    'stopwatch.heading': 'Stopwatch',
    'stopwatch.intro':
      'A stopwatch with lap history, and a countdown timer with presets — switch between them above.',

    'wheel.heading': 'Student Picker',
    'wheel.intro':
      "Six modes for picking a random student, all built around the same class rosters. Edit names, pick a mode, hit go.",

    'footer.site': 'Site',
    'footer.elsewhere': 'Elsewhere',
    'footer.archive': 'Archive',
    'footer.projects': 'Projects',
    'footer.practice': 'Practice',
    'footer.currency': 'Currency converter',
    'footer.games': 'Mini games',
    'footer.github': 'GitHub',
    'footer.linkedin': 'LinkedIn',
    'footer.email': 'Email',
    'footer.legacy': 'Site v1 (2024—2026)',
    'footer.source': 'Source of this site',
    'footer.built': 'Built with React, Vite and react-router.',
    'footer.rights': 'All rights reserved.',
  },

  ru: {
    'nav.projects': 'Проекты',
    'nav.practice': 'Практика',
    'nav.about': 'Обо мне',
    'nav.contact': 'Контакты',
    'nav.menu': 'Меню',
    'nav.skip': 'Перейти к содержимому',
    'nav.theme': 'Тема оформления',
    'nav.language': 'Язык',
    'nav.mainNav': 'Основная навигация',

    'projects.heading': 'Проекты',
    'projects.count': 'показано {shown} из {total}',
    'projects.filter': 'Фильтр по тегам',
    'projects.all': 'Все',
    'projects.empty': 'По этому тегу пока ничего нет.',
    'projects.showAll': 'Показать ещё {n}',
    'projects.showLess': 'Свернуть',

    'meta.home.title': 'Aleksei Lopatin — full-stack разработчик',
    'meta.home.desc':
      'Проекты, лаборатория React и контакты. React, TypeScript, FastAPI и Python.',
    'meta.practice.title': 'Практика — Aleksei Lopatin',
    'meta.practice.desc':
      'Маленькие упражнения на React: выбор цвета, генератор OTP с отсчётом и форма RSVP.',
    'meta.currency.title': 'Конвертер валют — Aleksei Lopatin',
    'meta.currency.desc':
      'Конвертирует 44 валюты по живым курсам: поиск, флаги и работа без сети.',
    'meta.notFound.title': 'Страница не найдена — Aleksei Lopatin',
    'meta.notFound.desc': 'Такого адреса на сайте нет.',
    'meta.games.title': 'Мини-игры — Aleksei Lopatin',
    'meta.games.desc':
      'Крестики-нолики и секундомер переписаны на React, остальные мини-игры — оригинальный ванильный JS.',
    'meta.ticTacToe.title': 'Крестики-нолики — Aleksei Lopatin',
    'meta.ticTacToe.desc': 'Крестики и нолики с определением победы и ничьей, на React.',
    'meta.stopwatch.title': 'Секундомер — Aleksei Lopatin',
    'meta.stopwatch.desc': 'Секундомер с историей кругов и таймер обратного отсчёта, на React.',
    'meta.wheel.title': 'Выбор ученика — Aleksei Lopatin',
    'meta.wheel.desc':
      'Шесть способов выбрать случайного ученика, переписано на React ради плавной анимации.',

    'notFound.heading': 'Такой страницы нет',
    'notFound.text':
      'Адрес ниже ничему на сайте не соответствует. Возможно, это опечатка или ссылка со старой версии сайта.',
    'notFound.home': 'К проектам',
    'notFound.legacy': 'Открыть сайт v1',

    'about.heading': 'Обо мне',
    'about.lead': 'Разработчик по призванию, учитель по профессии.',
    'about.p1':
      'Делаю веб-приложения и небольшие инструменты, которые решают настоящие задачи. Школьный портал вырос из того, чего не хватало моему собственному классу, а электронный журнал за ним — это React + FastAPI + PostgreSQL, доведённый мной от схемы базы до задеплоенного домена.',
    'about.p2':
      'Когда не пишу код, преподаю математику, и это заметно по проектам: почти каждый вырос из задачи, с которой я реально столкнулся, а не из туториала. Ценю чистый код, честный интерфейс и то, чем в итоге пользуются люди.',
    'about.open':
      'Открыт к позициям full-stack и back-end — удалённо или с релокацией.',
    'about.stack.languages': 'Языки',
    'about.stack.frameworks': 'Фреймворки',
    'about.stack.tools': 'Инструменты',

    'contact.heading': 'Контакты',
    'contact.intro':
      'Быстрее всего до меня дойти письмом. Читаю всё, отвечаю за день-два.',
    'contact.copy': 'Копировать',
    'contact.copied': 'Скопировано ✓',

    'practice.heading': 'Практика',
    'practice.intro':
      'Маленькие упражнения на React — лежат здесь, чтобы паттерны были под рукой. Каждое решало одну задачу, прежде чем попасть на сайт.',
    'practice.back': '← Назад к проектам',
    'currency.heading': 'Конвертер валют',
    'currency.intro':
      'Живые курсы 44 валют, с запасной таблицей на случай, когда сети нет.',

    'games.heading': 'Мини-игры',
    'games.intro':
      'Крестики-нолики, секундомер и выбор ученика переписаны на React. Всё остальное здесь — оригинальный ванильный JS без изменений: незачем переписывать то, что и так работает.',
    'games.back': '← Назад к мини-играм',

    'ticTacToe.heading': 'Крестики-нолики',
    'ticTacToe.intro': 'Крестики и нолики, определение победы, ничья и кнопка сброса.',

    'stopwatch.heading': 'Секундомер',
    'stopwatch.intro':
      'Секундомер с историей кругов и таймер обратного отсчёта с готовыми интервалами — переключение вкладками выше.',

    'wheel.heading': 'Выбор ученика',
    'wheel.intro':
      'Шесть режимов случайного выбора ученика, все работают с одними и теми же составами классов. Отредактируй имена, выбери режим, жми кнопку.',

    'footer.site': 'Сайт',
    'footer.elsewhere': 'Где ещё',
    'footer.archive': 'Архив',
    'footer.projects': 'Проекты',
    'footer.practice': 'Практика',
    'footer.currency': 'Конвертер валют',
    'footer.games': 'Мини-игры',
    'footer.github': 'GitHub',
    'footer.linkedin': 'LinkedIn',
    'footer.email': 'Почта',
    'footer.legacy': 'Сайт v1 (2024—2026)',
    'footer.source': 'Исходники этого сайта',
    'footer.built': 'Сделано на React, Vite и react-router.',
    'footer.rights': 'Все права защищены.',
  },
};
