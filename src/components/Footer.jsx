import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { EMAIL } from './Contact';
import './Footer.css';

/* Только то, что реально существует: мёртвых ссылок в футере
   быть не должно, особенно на сайте-портфолио. */
const columns = [
  {
    id: 'site',
    headingKey: 'footer.site',
    links: [
      { key: 'footer.projects', to: '/' },
      { key: 'footer.practice', to: '/practice' },
      { key: 'footer.currency', to: '/currency' },
    ],
  },
  {
    id: 'elsewhere',
    headingKey: 'footer.elsewhere',
    links: [
      { key: 'footer.github', href: 'https://github.com/AlekseiLopatin' },
      {
        key: 'footer.linkedin',
        href: 'https://www.linkedin.com/in/aleksei-lopatin-5019722a4',
      },
      { key: 'footer.email', href: `mailto:${EMAIL}` },
    ],
  },
  {
    id: 'archive',
    headingKey: 'footer.archive',
    links: [
      { key: 'footer.legacy', href: 'https://legacy.alekseilopatin.com' },
      {
        key: 'footer.source',
        href: 'https://github.com/AlekseiLopatin/alekseilopatin-react',
      },
    ],
  },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="footer-columns">
        {columns.map(({ id, headingKey, links }) => (
          <nav className="footer-column" key={id}>
            <h3>{t(headingKey)}</h3>
            <ul>
              {links.map(({ key, to, href }) => (
                <li key={key}>
                  {to ? (
                    <Link to={to}>{t(key)}</Link>
                  ) : (
                    <a
                      href={href}
                      target={href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                    >
                      {t(key)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <p className="footer-built">{t('footer.built')}</p>
        <p>
          &copy; {new Date().getFullYear()} Aleksei Lopatin. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
