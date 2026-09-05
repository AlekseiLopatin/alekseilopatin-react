import { Stopwatch } from '../components/Stopwatch';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';

export const StopwatchPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageMeta
        title={t('meta.stopwatch.title')}
        description={t('meta.stopwatch.desc')}
      />
      <Stopwatch />
    </>
  );
};

export default StopwatchPage;
