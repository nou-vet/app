import { Title } from '@solidjs/meta';
import { createTranslator } from '~/i18n';

export default function About() {
  const t = createTranslator('www');
  return (
    <>
      <Title>{t('common.meta.title')}</Title>
      About
    </>
  );
}
