/* eslint-disable */
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';

import { updateEditLocale } from '../actions/adminActions';
import configureStore from './configureStore';
import middlewares from './middlewares';
import rootReducer from '../reducers/rootReducer';
import { getLocale, getTranslations } from '../utils/i18n';
import { getCookieItem } from '../utils/globalFunctions';

export default function createAppStore(initialState) {
  const store = configureStore(initialState, rootReducer, middlewares);
  if (module.hot) {
    module.hot.accept('../reducers/rootReducer', () => {
      const nextRootReducer = require('../reducers/rootReducer').default; // eslint-disable-line
      store.replaceReducer(nextRootReducer);
    });
  }
  const browserLanguage = navigator.language || navigator.userLanguage;
  let storedLocale = getCookieItem('_LOCALE_');
  console.log('storedLocale', storedLocale);
  if (storedLocale === 'zh_CN' || storedLocale === 'zh_Hans') {
    storedLocale = 'zh-CN';
  }
  if (storedLocale === 'fr_FR' || storedLocale === 'fr_CA') {
    storedLocale = 'fr';
  }
  if (storedLocale === 'en_GB' || storedLocale === 'en_CA') {
    storedLocale = 'en';
  }
  if (storedLocale === 'no') {
    storedLocale = 'nb';
  }
  const isLocaleStored = !!storedLocale;
  const userLocale = isLocaleStored ? storedLocale : getLocale(browserLanguage);
  console.log('userLocale', userLocale);

  syncTranslationWithStore(store);
  store.dispatch(loadTranslations(getTranslations()));
  store.dispatch(setLocale(userLocale));
  store.dispatch(updateEditLocale(userLocale));
  return store;
}
