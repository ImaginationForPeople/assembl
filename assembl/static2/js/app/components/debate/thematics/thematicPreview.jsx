import React from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';

import Statistic from '../../common/statistic';

const ThematicPreview = (props) => {
  const { id, imgUrl, numPosts, numContributors, title, description } = props;
  const { threadLink, subThemesCount, toggleSubThematics, rollover } = props;

  return (
    <div className="illustration illustration-box">
      <div className="image-box" style={{ backgroundImage: `url(${imgUrl})` }} />

      <div className="content-box center">
        <Statistic numPosts={numPosts} numContributors={numContributors} />

        <h3 className="title">{title.toUpperCase()}</h3>
        <h5 className="description">{description && title.toUpperCase()}</h5>
        <h5 className="thread" onClick={() => { window.location.href = threadLink; }}>
          <p className="link">{ I18n.t('debate.thread.accessToDiscussion').toUpperCase() }</p>
        </h5>

        { subThemesCount > 0 && <p className="slash">/</p> }

        <h4 className="sub-themes" onClick={toggleSubThematics}>
          { subThemesCount > 1 && I18n.t('debate.thread.seeSubThematics', { nbr: subThemesCount }).toUpperCase() }
          { subThemesCount === 1 && I18n.t('debate.thread.seeSubThematic').toUpperCase() }
        </h4>

        {
          subThemesCount > 0 && <p
            className="sub-themes-arrow assembl-icon-down-open"
            onClick={() => { toggleSubThematics(id); }}
          />
        }
      </div>

      <div className={`color-box transparent ${rollover ? 'rollover' : null}`}>&nbsp</div>
      <div className="box-hyphen transparent">&nbsp</div>
      <div className="box-hyphen rotate-hyphen transparent">&nbsp</div>
    </div>
  );
};

ThematicPreview.propTypes = {
  imgUrl: PropTypes.string,
  numPosts: PropTypes.number.isRequired,
  numContributors: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  threadLink: PropTypes.string.isRequired,
  subThemesCount: PropTypes.number.isRequired,
  toggleSubThematics: PropTypes.func.isRequired
};

export default ThematicPreview;