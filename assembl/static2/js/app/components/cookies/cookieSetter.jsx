// @flow
/* global globalAnalytics */
import React from 'react';
import { I18n } from 'react-redux-i18n';
import classnames from 'classnames';

// Components
import Helper from '../common/helper';
import CookieSwitch from './cookieSwitch';

import { COOKIE_TRANSLATION_KEYS, COOKIES_CATEGORIES } from '../../constants';

export type CookieObject = {
  name: string,
  category: string,
  accepted: boolean,
  cookieType: string
};

type Props = {
  handleToggle: Function,
  cookie: CookieObject,
  toggleCookieType: Function,
  locale: string
};

const matomoHost = globalAnalytics.piwik ? globalAnalytics.piwik.host : null;

const CookieSetter = ({ handleToggle, cookie, toggleCookieType, locale }: Props) => {
  const toggleSwitch = () => {
    const { accepted, cookieType } = cookie;
    const updatedCookie = { ...cookie, accepted: !accepted, cookieType: toggleCookieType(cookieType) };
    handleToggle(updatedCookie);
  };

  const { name, category, accepted } = cookie;

  const cookieName = Object.keys(COOKIE_TRANSLATION_KEYS).includes(name) ? I18n.t(`cookies.${name}`) : name;
  const cookieIsMatomo = name === COOKIE_TRANSLATION_KEYS.matomo;
  const matomoOptOutLink = matomoHost ? `https://${matomoHost}/index.php?module=CoreAdminHome&action=optOut&language=${locale}` : null;

  const required = category === COOKIES_CATEGORIES.essential;
  return (
    <div
      className={classnames({
        'cookie-with-link': (cookieIsMatomo && matomoOptOutLink) || required,
        'cookie-toggle': !required && !matomoOptOutLink
      })}
    >
      <div className="cookie-title">
        <span className="dark-title-3 ellipsis">{cookieName}</span>
        <Helper helperText={I18n.t(`cookies.${name}Helper`)} popOverClass="cookie-helper-popover" classname="cookie-helper" />
      </div>
      <CookieSwitch cookieIsMatomo={cookieIsMatomo} matomoOptOutLink={matomoOptOutLink} toggleSwitch={toggleSwitch} accepted={accepted} name={name} required={required} />
    </div>
  );
};

export default CookieSetter;