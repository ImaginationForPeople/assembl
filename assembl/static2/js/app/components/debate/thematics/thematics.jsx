import React from 'react';
import PropTypes from 'prop-types';
import { Translate } from 'react-redux-i18n';
import { Grid } from 'react-bootstrap';
import { getDiscussionSlug } from '../../../utils/globalFunctions';

import ThematicList from './thematicList';

const Thematics = (props) => {
  const { thematics, identifier } = props;
  const slug = getDiscussionSlug();
  return (
    <section className="themes-section">
      <Grid fluid className="background-grey">
        <div className="max-container">
          <div className="title-section">
            <div className="title-hyphen">&nbsp;</div>
            <h1 className="dark-title-1">
              <Translate value="debate.survey.themesTitle" />
            </h1>
          </div>
          <div className="content-section">
            { thematics && <ThematicList thematics={thematics} identifier={identifier} slug={slug} /> }
          </div>
        </div>
      </Grid>
    </section>
  );
};

Thematics.propTypes = {
  thematics: PropTypes.array,
  identifier: PropTypes.string.isRequired
};

export default Thematics;