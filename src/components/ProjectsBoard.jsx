import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projects, allTags } from '../data/projects';
import { useLanguage } from '../i18n/LanguageContext';
import './ProjectsBoard.css';

const INITIAL_COUNT = 9;

export const ProjectCard = ({
  title,
  description,
  href,
  image,
  tags,
  internal,
  sourceHref,
  action = internal ? 'open' : 'live',
}) => {
  const { lang, t } = useLanguage();

  /* Внутренние страницы открываем через Link (без перезагрузки),
     внешние — обычной ссылкой в новой вкладке. */
  const PrimaryLink = internal ? Link : 'a';
  const linkProps = internal
    ? { to: href }
    : { href, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <article className="project-card">
      <div className="project-media">
        {image ? (
          <img className="project-image" src={image} alt="" loading="lazy" />
        ) : (
          /* Скриншота нет — рисуем заглушку из инициалов,
             чтобы карточка не проваливалась по высоте. */
          <div className="project-placeholder" aria-hidden="true">
            {title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="project-body">
        <h3 className="project-title">
          <span className="code" aria-hidden="true">&lt;</span>
          {title}
          <span className="code" aria-hidden="true">/&gt;</span>
        </h3>
        <p className="project-description">{description[lang]}</p>
        <ul className="project-tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="project-actions">
          <PrimaryLink {...linkProps} aria-label={`${t(`projects.${action}`)}: ${title}`}>
            {t(`projects.${action}`)} <span aria-hidden="true">{internal ? '→' : '↗'}</span>
          </PrimaryLink>
          {sourceHref && (
            <a href={sourceHref} target="_blank" rel="noopener noreferrer"
              aria-label={`${t('projects.source')}: ${title}`}>
              {t('projects.source')} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProjectsBoard = () => {
  const { t } = useLanguage();
  const [activeTag, setActiveTag] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const matching =
    activeTag === 'All'
      ? projects
      : projects.filter((project) => project.tags.includes(activeTag));

  const visible = showAll ? matching : matching.slice(0, INITIAL_COUNT);
  const hasMore = matching.length > INITIAL_COUNT;

  const selectTag = (tag) => {
    setActiveTag(tag);
    setShowAll(false); // новый фильтр — снова показываем первую страницу
  };

  return (
    <div className="projects-board">
      <h2 className="projects-heading">{t('projects.heading')}</h2>
      <p className="projects-subheading">
        {t('projects.count')
          .replace('{shown}', visible.length)
          .replace('{total}', projects.length)}
      </p>

      <details className="projects-filter-disclosure">
        <summary>{t('projects.filters')} · {activeTag === 'All' ? t('projects.all') : activeTag}</summary>
        <div
          className="projects-filter"
          role="group"
          aria-label={t('projects.filter')}
        >
          {['All', ...allTags].map((tag) => (
            <button
              key={tag}
              type="button"
              className="filter-button"
              onClick={() => selectTag(tag)}
              aria-pressed={activeTag === tag}
            >
              {tag === 'All' ? t('projects.all') : tag}
            </button>
          ))}
        </div>
      </details>

      {visible.length === 0 ? (
        <p className="projects-empty">{t('projects.empty')}</p>
      ) : (
        <div className="projects-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          className="btn-show-all"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? t('projects.showLess')
            : t('projects.showAll').replace('{n}', matching.length - INITIAL_COUNT)}
        </button>
      )}
    </div>
  );
};

export default ProjectsBoard;
