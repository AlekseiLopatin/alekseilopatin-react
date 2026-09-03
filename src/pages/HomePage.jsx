import { ProjectsBoard } from '../components/ProjectsBoard';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';

export const HomePage = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageMeta title={t('meta.home.title')} description={t('meta.home.desc')} />
      <section id="projects">
        <ProjectsBoard />
      </section>
      <About />
      <Contact />
    </>
  );
};

export default HomePage;
