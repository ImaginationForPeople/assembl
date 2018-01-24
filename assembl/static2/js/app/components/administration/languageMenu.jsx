import React from 'react';
import { connect } from 'react-redux';
import { OverlayTrigger } from 'react-bootstrap';

import { languageTooltip } from '../common/tooltips';
import { updateEditLocale } from '../../actions/adminActions';
import En from '../svg/flags/en';
import Fr from '../svg/flags/fr';
import Ja from '../svg/flags/ja';
import ZhCN from '../svg/flags/zh_CN';
import Ru from '../svg/flags/ru';

// TO DO get it dynamically
const Flag = ({ locale }) => {
  switch (locale) {
  case 'en':
    return <En />;
  case 'fr':
    return <Fr />;
  case 'ja':
    return <Ja />;
  case 'ru':
    return <Ru />;
  case 'zh_Hans':
    return <ZhCN />;
  default:
    return <span>{locale}</span>;
  }
};

const LanguageMenu = ({ changeLocale, editLocale, discussionPreferences, isHidden }) => {
  if (!isHidden) {
    return (
      <div className="relative">
        <div className="language-menu">
          <OverlayTrigger placement="top" overlay={languageTooltip}>
            <div>
              {discussionPreferences.map((key, index) => (
                <div
                  onClick={() => changeLocale(key)}
                  id={key}
                  className={editLocale === key ? 'flag-container active' : 'flag-container'}
                  key={index}
                >
                  <Flag locale={key} />
                </div>
              ))}
            </div>
          </OverlayTrigger>
        </div>
      </div>
    );
  }

  return <span />;
};

const mapStateToProps = state => ({
  translations: state.i18n.translations,
  editLocale: state.admin.editLocale,
  discussionPreferences: state.admin.discussionLanguagePreferences,
  isHidden: state.admin.displayLanguageMenu
});

const mapDispatchToProps = dispatch => ({
  changeLocale: (newLocale) => {
    dispatch(updateEditLocale(newLocale));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguageMenu);