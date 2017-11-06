import { I18n } from 'react-redux-i18n';
import { Map } from 'immutable';

import deepen from './deepen';
import Translations from './translations';
import ja from '../../../translations/ja.json';
import zhCN from '../../../translations/zh_CN.json';

Translations.ja = deepen(ja);
Translations.zh_CN = deepen(zhCN);

const fallbackLocale = 'en';
const myHandleMissingTranslation = function (key, replacements) {
  // We need to use a function, not a arrow function here to be able to use 'this'.
  let translation = '';
  try {
    translation = this._fetchTranslation(this._translations, `${fallbackLocale}.${key}`, replacements.count); // eslint-disable-line
  } catch (err) {
    return `Missing translation: ${key}`;
  }
  return this._replace(translation, replacements); // eslint-disable-line
};
I18n.setHandleMissingTranslation(myHandleMissingTranslation);

export const getTranslations = () => {
  return Translations;
};

export const getLocale = (browserLanguage) => {
  let locale;
  if (browserLanguage === 'zh' || browserLanguage === 'zh-CN') {
    locale = 'zh_CN';
  } else {
    locale = browserLanguage.split('-')[0].toLowerCase();
  }
  if (!Translations[locale]) {
    locale = 'en';
  }
  return locale;
};

export const getAvailableLocales = (locale, translations) => {
  const locArray = [];
  Object.keys(translations).map((key) => {
    if (key !== locale) locArray.push(key);
    return locArray;
  });
  return locArray;
};

/*
  Returns an updater function (see immutable-js) that updates the value of the
  entry with given locale by the given value

  example:
    state.update(
      titleEntries,
      updateInLangstringEntries('fr', 'foobar')
    );

  will change the french value by 'foobar' in titleEntries
*/
export const updateInLangstringEntries = (locale, value) => {
  return (entries) => {
    const entryIndex = entries.findIndex((entry) => {
      return entry.get('localeCode') === locale;
    });

    if (entryIndex === -1) {
      return entries.push(Map({ localeCode: locale, value: value }));
    }

    return entries.setIn([entryIndex, 'value'], value);
  };
};

export const getEntryValueForLocale = (entries, locale, defaultValue = null) => {
  const entry = entries.find((e) => {
    return e.get('localeCode') === locale;
  });

  return entry ? entry.get('value') : defaultValue;
};