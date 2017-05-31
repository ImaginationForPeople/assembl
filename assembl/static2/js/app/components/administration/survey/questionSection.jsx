import React from 'react';
import { gql, withApollo } from 'react-apollo';
import { Link } from 'react-router';
import { I18n } from 'react-redux-i18n';
import { Row, Col } from 'react-bootstrap';

import VideoForm from './videoForm';
import QuestionsForm from './questionsForm';
import SectionTitle from '../sectionTitle';
import { getDiscussionSlug } from '../../../utils/globalFunctions';

const GetThematics = gql`
{
  thematics(identifier:"survey") {
    id,
    titleEntries {
      localeCode,
      value
    },
    video {
      title,
      description,
      htmlCode
    },
    questions {
      titleEntries {
        localeCode,
        value
      }
    }
  }
}
`;

const QuestionSection = ({ client, i18n, selectedLocale, thematicId }) => {
  const thematicsData = client.readQuery({ query: GetThematics });
  const thematics = thematicsData.thematics || [];
  const slug = getDiscussionSlug();

  return (
    <div className="admin-box">
      <SectionTitle i18n={i18n} phase="survey" tabId="1" annotation={I18n.t('administration.annotation')} />
      <div className="admin-content">
        <Row>
          {thematics.map((thematic, index) => {
            return (
              <Col xs={12} md={Math.round(12 / thematics.length)} key={index}>
                <Link className="tab-title" activeClassName="tab-title-active" to={`/${slug}/administration/survey?section=2&thematic=${thematic.id}`}>
                  {`${I18n.t('administration.thematic')} ${index + 1}`}
                </Link>
              </Col>
            );
          })}
        </Row>
        {thematicId &&
          <Row>
            <VideoForm thematicId={thematicId} selectedLocale={selectedLocale} />
            <QuestionsForm thematicId={thematicId} lang={selectedLocale} />
          </Row>
        }
      </div>
    </div>
  );
};

export default withApollo(QuestionSection);