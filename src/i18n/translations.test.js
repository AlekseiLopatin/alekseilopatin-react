import { describe, expect, it } from 'vitest';
import { translations } from './translations';
import { projects } from '../data/projects';

/* Пропущенный перевод не роняет сборку — на странице просто
   появляется сырой ключ вроде 'about.lead'. Эти тесты ловят
   такое до деплоя, а не после. */
describe('translations', () => {
  const en = Object.keys(translations.en);
  const ru = Object.keys(translations.ru);

  it('has the same keys in both languages', () => {
    expect(ru.filter((key) => !en.includes(key))).toEqual([]);
    expect(en.filter((key) => !ru.includes(key))).toEqual([]);
  });

  it('has no empty strings', () => {
    for (const lang of ['en', 'ru']) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('');
      }
    }
  });

  it('keeps placeholders identical across languages', () => {
    const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort();

    for (const key of en) {
      expect(placeholders(translations.ru[key]), key).toEqual(
        placeholders(translations.en[key]),
      );
    }
  });
});

describe('projects data', () => {
  it('has unique ids', () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('describes every project in both languages', () => {
    for (const project of projects) {
      expect(project.description.en, project.id).toBeTruthy();
      expect(project.description.ru, project.id).toBeTruthy();
    }
  });

  it('has no links to the old domain left', () => {
    /* Старые проекты переехали на legacy-поддомен: ссылка на
       голый alekseilopatin.com теперь ведёт на новый сайт и
       превратилась бы в 404. */
    for (const project of projects) {
      expect(project.href, project.id).not.toMatch(
        /^https:\/\/(www\.)?alekseilopatin\.com/,
      );
    }
  });

  it('marks internal links so they render as router links', () => {
    for (const project of projects) {
      if (project.href.startsWith('/')) {
        expect(project.internal, project.id).toBe(true);
      }
    }
  });
});
