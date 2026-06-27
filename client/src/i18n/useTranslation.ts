import { useContext } from 'react';
import { LangContext } from './LanguageContext';

export function useTranslation() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useTranslation must be inside LanguageProvider');
  return ctx;
}
