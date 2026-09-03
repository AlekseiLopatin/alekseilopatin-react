import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './Contact.css';

export const EMAIL = 'aleshkalopatin@gmail.com';

const links = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/AlekseiLopatin' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aleksei-lopatin-5019722a4',
  },
];

export function Contact() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  /* Тот же паттерн, что в лабе с OTP: состояние само себя
     сбрасывает через две секунды, таймер снимается в очистке. */
  useEffect(() => {
    if (!copied) return;

    const timeoutId = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      /* Буфер недоступен (нет https или запрещено) — адрес
         всё равно виден рядом и его можно выделить руками. */
    }
  };

  return (
    <section className="contact" id="contact">
      <h2 className="contact-heading">{t('contact.heading')}</h2>
      <p className="contact-intro">{t('contact.intro')}</p>

      <div className="contact-email">
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <button type="button" onClick={copyEmail} className="contact-copy">
          {copied ? t('contact.copied') : t('contact.copy')}
        </button>
      </div>

      <ul className="contact-links">
        {links.map(({ id, label, href }) => (
          <li key={id}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Contact;
