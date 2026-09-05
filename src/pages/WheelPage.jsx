import { WheelOfNames } from '../components/wheel/WheelOfNames';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';

export const WheelPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageMeta title={t('meta.wheel.title')} description={t('meta.wheel.desc')} />
      <WheelOfNames />
    </>
  );
};

export default WheelPage;
