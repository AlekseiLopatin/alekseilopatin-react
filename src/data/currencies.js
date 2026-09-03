/* Источник курсов — open.er-api.com (166 валют, без ключа).
   Frankfurter отпал: он строится на данных ЕЦБ, а ЕЦБ не публикует
   курс рубля с марта 2022 года.

   Здесь курируем подмножество: 166 строк в выпадающем списке
   невозможно листать, поэтому берём основные мировые валюты
   плюс постсоветские, которые реально могут понадобиться. */

export const CURRENCY_META = {
  USD: { country: 'us', name: 'US Dollar' },
  EUR: { country: 'eu', name: 'Euro' },
  GBP: { country: 'gb', name: 'British Pound' },
  JPY: { country: 'jp', name: 'Japanese Yen' },
  CHF: { country: 'ch', name: 'Swiss Franc' },
  CAD: { country: 'ca', name: 'Canadian Dollar' },
  AUD: { country: 'au', name: 'Australian Dollar' },
  NZD: { country: 'nz', name: 'New Zealand Dollar' },
  CNY: { country: 'cn', name: 'Chinese Yuan' },
  HKD: { country: 'hk', name: 'Hong Kong Dollar' },
  SGD: { country: 'sg', name: 'Singapore Dollar' },
  KRW: { country: 'kr', name: 'South Korean Won' },
  TWD: { country: 'tw', name: 'Taiwan Dollar' },
  INR: { country: 'in', name: 'Indian Rupee' },
  THB: { country: 'th', name: 'Thai Baht' },
  VND: { country: 'vn', name: 'Vietnamese Dong' },
  IDR: { country: 'id', name: 'Indonesian Rupiah' },
  MYR: { country: 'my', name: 'Malaysian Ringgit' },
  PHP: { country: 'ph', name: 'Philippine Peso' },

  RUB: { country: 'ru', name: 'Russian Ruble' },
  KZT: { country: 'kz', name: 'Kazakhstani Tenge' },
  GEL: { country: 'ge', name: 'Georgian Lari' },
  AMD: { country: 'am', name: 'Armenian Dram' },
  AZN: { country: 'az', name: 'Azerbaijani Manat' },
  UAH: { country: 'ua', name: 'Ukrainian Hryvnia' },
  BYN: { country: 'by', name: 'Belarusian Ruble' },
  UZS: { country: 'uz', name: 'Uzbekistani Som' },
  KGS: { country: 'kg', name: 'Kyrgyzstani Som' },

  TRY: { country: 'tr', name: 'Turkish Lira' },
  PLN: { country: 'pl', name: 'Polish Złoty' },
  CZK: { country: 'cz', name: 'Czech Koruna' },
  HUF: { country: 'hu', name: 'Hungarian Forint' },
  RON: { country: 'ro', name: 'Romanian Leu' },
  SEK: { country: 'se', name: 'Swedish Krona' },
  NOK: { country: 'no', name: 'Norwegian Krone' },
  DKK: { country: 'dk', name: 'Danish Krone' },
  ILS: { country: 'il', name: 'Israeli Shekel' },
  AED: { country: 'ae', name: 'UAE Dirham' },
  SAR: { country: 'sa', name: 'Saudi Riyal' },
  EGP: { country: 'eg', name: 'Egyptian Pound' },
  ZAR: { country: 'za', name: 'South African Rand' },
  BRL: { country: 'br', name: 'Brazilian Real' },
  MXN: { country: 'mx', name: 'Mexican Peso' },
  ARS: { country: 'ar', name: 'Argentine Peso' },
};

/* Флаги — локальные PNG в public/flags: эмодзи-флаги Chrome под
   Windows не рисует и показывает их парой букв ("EU", "RU"). */
export const flagSrc = (code) =>
  `/flags/${CURRENCY_META[code]?.country ?? 'un'}.png`;

/* Порядок в списке: сначала мировые, потом постсоветские и остальные. */
export const CURRENCY_CODES = Object.keys(CURRENCY_META);

/* Запасные курсы к доллару на случай, если запрос не прошёл.
   Снимок от 2026-09-03 — интерфейс честно помечает их как приблизительные. */
export const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.8633,
  GBP: 0.7416,
  JPY: 159.0888,
  CHF: 0.8134,
  CAD: 1.3865,
  AUD: 1.3967,
  NZD: 1.7107,
  CNY: 6.7365,
  HKD: 7.8418,
  SGD: 1.2717,
  KRW: 1361.1392,
  TWD: 31.7576,
  INR: 94.8924,
  THB: 33.2062,
  VND: 26015.6689,
  IDR: 17747.481,
  MYR: 4.0432,
  PHP: 62.5799,
  RUB: 86.961,
  KZT: 455.0921,
  GEL: 2.6178,
  AMD: 363.8944,
  AZN: 1.6997,
  UAH: 44.6096,
  BYN: 3.0832,
  UZS: 11819.6633,
  KGS: 87.4761,
  TRY: 48.333,
  PLN: 3.7376,
  CZK: 20.8873,
  HUF: 317.5693,
  RON: 4.5368,
  SEK: 9.6324,
  NOK: 9.3215,
  DKK: 6.4566,
  ILS: 3.0253,
  AED: 3.6725,
  SAR: 3.75,
  EGP: 51.0904,
  ZAR: 16.0666,
  BRL: 5.1391,
  MXN: 16.991,
  ARS: 1511.6306,
};
