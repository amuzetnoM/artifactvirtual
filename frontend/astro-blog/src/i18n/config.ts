import type { I18nStrings } from './types';
import ENLocale from './locales/en';

export const localeToProfile = {
  en: {
    name: "English",
    messages: ENLocale,
    langTag: "en-US",
    direction: "ltr",
    googleFontName: "IBM+Plex+Mono",
    default: true,
  },
} as const;
