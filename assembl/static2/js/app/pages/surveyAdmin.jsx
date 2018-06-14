import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';

import ThemeSection from '../components/administration/survey/themeSection';
import QuestionSection from '../components/administration/survey/questionSection';
import ExportSection from '../components/administration/exportSection';
import Navbar from '../components/administration/navbar';
import SaveButton, { getMutationsPromises, runSerial } from '../components/administration/saveButton';
import createThematicMutation from '../graphql/mutations/createThematic.graphql';
import deleteThematicMutation from '../graphql/mutations/deleteThematic.graphql';
import updateThematicMutation from '../graphql/mutations/updateThematic.graphql';
import DiscussionPreferenceLanguage from '../graphql/DiscussionPreferenceLanguage.graphql';
import { get } from '../utils/routeMap';
import { displayAlert } from '../utils/utilityManager';
import { convertEntriesToHTML } from '../utils/draftjs';

function convertVideoDescriptionsToHTML(video) {
  return {
    ...video,
    descriptionEntriesBottom: convertEntriesToHTML(video.descriptionEntriesBottom),
    descriptionEntriesSide: convertEntriesToHTML(video.descriptionEntriesSide),
    descriptionEntriesTop: convertEntriesToHTML(video.descriptionEntriesTop)
  };
}

const getImageVariable = (item) => {
  // item can be a thematic or any sort of object containing an img key
  const { img } = item;
  const externalUrl = img ? img.externalUrl : null;
  if (externalUrl === 'TO_DELETE') {
    return externalUrl;
  }
  return typeof externalUrl === 'object' ? externalUrl : null;
};

/* Create variables for createThematic and updateThematic mutations */
const createVariablesForThematicMutation = thematic => ({
  identifier: 'survey',
  titleEntries: thematic.titleEntries,
  // If thematic.img.externalUrl is an object, it means it's a File.
  // We need to send image: null if we didn't change the image.
  image: getImageVariable(thematic),
  // if video is null, pass {} to remove all video fields on server side
  video: thematic.video === null ? {} : convertVideoDescriptionsToHTML(thematic.video),
  questions: thematic.questions,
  order: thematic.order
});

const createVariablesForDeleteThematicMutation = thematic => ({
  thematicId: thematic.id
});

class SurveyAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exportLocale: null,
      refetching: false,
      translate: false
    };
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
  }

  componentWillUnmount() {
    this.props.router.setRouteLeaveHook(this.props.route, null);
  }

  routerWillLeave = () => {
    if (this.props.thematicsHaveChanged && !this.state.refetching) {
      return I18n.t('administration.confirmUnsavedChanges');
    }

    return null;
  };

  saveAction = () => {
    const { refetchThematics, thematics, thematicsHaveChanged, createThematic, deleteThematic, updateThematic } = this.props;
    displayAlert('success', `${I18n.t('loading.wait')}...`);
    if (thematicsHaveChanged) {
      const mutationsPromises = getMutationsPromises({
        items: thematics,
        variablesCreator: createVariablesForThematicMutation,
        deleteVariablesCreator: createVariablesForDeleteThematicMutation,
        createMutation: createThematic,
        deleteMutation: deleteThematic,
        updateMutation: updateThematic
      });

      runSerial(mutationsPromises)
        .then(() => {
          this.setState({ refetching: true });
          refetchThematics().then(() => this.setState({ refetching: false }));
          displayAlert('success', I18n.t('administration.successThemeCreation'));
        })
        .catch((error) => {
          displayAlert('danger', error, false, 30000);
        });
    }
  };

  handleExportLocaleChange = (locale) => {
    this.setState({ exportLocale: locale });
  };

  handleTranslationChange = (shouldTranslate) => {
    this.setState({ translate: shouldTranslate });
  };

  render() {
    const { saveButtonRef, section, thematicsHaveChanged, debateId, languages } = this.props;
    const { translate } = this.state;
    const exportLocale = this.state.exportLocale || (languages && languages[0].locale);
    const translation = translate && exportLocale ? `?lang=${exportLocale}` : '?'; // FIXME: using '' instead of '?' does not work
    const exportLink = get('exportSurveyData', { debateId: debateId, translation: translation });
    const currentStep = parseInt(section, 10);
    const saveDisabled = !thematicsHaveChanged;
    return (
      <div className="survey-admin">
        <SaveButton disabled={saveDisabled} saveAction={this.saveAction} saveButtonRef={saveButtonRef} />
        {section === '1' && <ThemeSection {...this.props} />}
        {section === '2' && <QuestionSection {...this.props} />}
        {section === '3' && (
          <ExportSection
            withLanguageOptions
            handleExportLocaleChange={this.handleExportLocaleChange}
            handleTranslationChange={this.handleTranslationChange}
            exportLink={exportLink}
            translate={translate}
            exportLocale={exportLocale}
            languages={languages}
            annotation="surveyAnnotation"
          />
        )}
        {!isNaN(currentStep) && (
          <Navbar currentStep={currentStep} totalSteps={3} phaseIdentifier="survey" beforeChangeSection={this.saveAction} />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ admin: { thematicsById, thematicsHaveChanged }, context, i18n }) => ({
  thematicsHaveChanged: thematicsHaveChanged,
  thematics: thematicsById
    .sortBy(thematic => thematic.get('order'))
    .toList()
    .toJS(),
  debateId: context.debateId,
  i18n: i18n
});

export default compose(
  connect(mapStateToProps),
  graphql(createThematicMutation, {
    name: 'createThematic'
  }),
  graphql(updateThematicMutation, {
    name: 'updateThematic'
  }),
  graphql(deleteThematicMutation, {
    name: 'deleteThematic'
  }),
  graphql(DiscussionPreferenceLanguage, {
    options: ({ i18n: { locale } }) => ({
      variables: {
        inLocale: locale
      }
    }),
    props: ({ data }) => {
      if (data.loading) {
        return {
          loading: true
        };
      }

      if (data.error) {
        return {
          hasErrors: true,
          loading: false
        };
      }
      return {
        hasErrors: false,
        languages: data.discussionPreferences.languages
      };
    }
  })
)(SurveyAdmin);