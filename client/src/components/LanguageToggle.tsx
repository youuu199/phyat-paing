import { Globe } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export default function LanguageToggle() {
  const { lang, setLang } = useTranslation();

  return (
    <button
      className="language-toggle"
      onClick={() => setLang(lang === 'en' ? 'my' : 'en')}
      aria-label="Switch language"
    >
      <Globe size={14} strokeWidth={1.5} />
      {lang === 'en' ? 'EN' : 'MM'}
    </button>
  );
}
