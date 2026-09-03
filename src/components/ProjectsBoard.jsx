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
}) => {
  const { lang } = useLanguage();

  /* Внутренние страницы открываем через Link (без перезагрузки),
     внешние — обычной ссылкой в новой вкладке. */
  const Wrapper = internal ? Link : 'a';
  const linkProps = internal
    ? { to: href }
    : { href, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <Wrapper className="project-card" {...linkProps}>
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
        <p className="project-overlay">{description[lang]}</p>
      </div>

      <div className="project-body">
        <h3 className="project-title">
          <span className="code">&lt;</span>
          {title}
          <span className="code">/&gt;</span>
        </h3>
        <ul className="project-tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </Wrapper>
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
