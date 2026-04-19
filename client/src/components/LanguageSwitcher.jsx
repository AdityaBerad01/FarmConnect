import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' }
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <select
      className="language-switcher"
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      id="language-switcher"
      aria-label="Select language"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}
