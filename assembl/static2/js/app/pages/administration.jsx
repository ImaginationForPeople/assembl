import React from 'react';
import { Translate } from 'react-redux-i18n';
import { compose, graphql } from 'react-apollo';
import { filter } from 'graphql-anywhere';
import { Grid, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { updateThematics, displayLanguageMenu } from '../actions/adminActions';
import { updateResources, updateResourcesCenterPage } from '../actions/adminActions/resourcesCenter';
import { updateVoteSessionPage } from '../actions/adminActions/voteSession';
import { updateSections } from '../actions/adminActions/adminSections';
import { updateLegalNoticeAndTerms } from '../actions/adminActions/legalNoticeAndTerms';
import withLoadingIndicator from '../components/common/withLoadingIndicator';
import Menu from '../components/administration/menu';
import LanguageMenu from '../components/administration/languageMenu';
import SaveButton from '../components/administration/saveButton';
import ThematicsQuery from '../graphql/ThematicsQuery.graphql';
import ResourcesQuery from '../graphql/ResourcesQuery.graphql';
import ResourcesCenterPage from '../graphql/ResourcesCenterPage.graphql';
import SectionsQuery from '../graphql/SectionsQuery.graphql';
import TabsConditionQuery from '../graphql/TabsConditionQuery.graphql';
import LegalNoticeAndTermsQuery from '../graphql/LegalNoticeAndTerms.graphql';
import VoteSessionQuery from '../graphql/VoteSession.graphql';
import { convertEntriesToRawContentState } from '../utils/draftjs';
import { getPhaseId } from '../utils/timeline';

export function convertVideoDescriptions(thematics) {
  return thematics.map((t) => {
    if (!t.video) {
      return t;
    }

    return {
      ...t,
      video: {
        ...t.video,
        descriptionEntriesBottom: t.video.descriptionEntriesBottom
          ? convertEntriesToRawContentState(t.video.descriptionEntriesBottom)
          : null,
        descriptionEntriesSide: t.video.descriptionEntriesSide
          ? convertEntriesToRawContentState(t.video.descriptionEntriesSide)
          : null,
        descriptionEntriesTop: t.video.descriptionEntriesTop
          ? convertEntriesToRawContentState(t.video.descriptionEntriesTop)
          : null
      }
    };
  });
}

class Administration extends React.Component {
  constructor(props) {
    super(props);
    this.putResourcesCenterInStore = this.putResourcesCenterInStore.bind(this);
    this.putThematicsInStore = this.putThematicsInStore.bind(this);
    this.putLegalNoticeAndTermsInStore = this.putLegalNoticeAndTermsInStore.bind(this);
    this.putVoteSessionInStore = this.putVoteSessionInStore.bind(this);
  }

  componentDidMount() {
    this.putResourcesCenterInStore(this.props.resourcesCenter);
    this.putResourcesInStore(this.props.resources);
    this.putThematicsInStore(this.props.data);
    this.putSectionsInStore(this.props.sections);
    this.putLegalNoticeAndTermsInStore(this.props.legalNoticeAndTerms);
    this.putVoteSessionInStore(this.props.voteSession);

    const isHidden = this.props.identifier === 'discussion' && this.props.location.query.section === '1';
    this.props.displayLanguageMenu(isHidden);
  }

  componentWillReceiveProps(nextProps) {
    // update thematics in store after a mutation has been executed
    if (nextProps.data.thematics !== this.props.data.thematics) {
      this.putThematicsInStore(nextProps.data);
    }

    if (nextProps.resources !== this.props.resources) {
      this.putResourcesInStore(nextProps.resources);
    }

    if (nextProps.sections !== this.props.sections) {
      this.putSectionsInStore(nextProps.sections);
    }

    if (nextProps.voteSession !== this.props.voteSession) {
      this.putVoteSessionInStore(nextProps.voteSession);
    }

    this.putResourcesCenterInStore(nextProps.resourcesCenter);

    const isHidden = nextProps.identifier === 'discussion' && nextProps.location.query.section === '1';
    this.props.displayLanguageMenu(isHidden);
  }

  putThematicsInStore(data) {
    // filter with the same query to remove stuff like __typename from the structure
    const filteredThematics = filter(ThematicsQuery, data);
    const thematics = convertVideoDescriptions(filteredThematics.thematics);
    this.props.updateThematics(thematics);
  }

  putResourcesInStore(resources) {
    const filteredResources = filter(ResourcesQuery, { resources: resources });
    const resourcesForStore = filteredResources.resources.map(resource => ({
      ...resource,
      textEntries: resource.textEntries ? convertEntriesToRawContentState(resource.textEntries) : null
    }));
    this.props.updateResources(resourcesForStore);
  }

  putResourcesCenterInStore(resourcesCenter) {
    const filteredResourcesCenter = filter(ResourcesCenterPage, { resourcesCenter: resourcesCenter });
    this.props.updateResourcesCenterPage(filteredResourcesCenter.resourcesCenter);
  }

  putVoteSessionInStore(voteSession) {
    const emptyVoteSession = {
      titleEntries: [],
      subTitleEntries: [],
      instructionsSectionTitleEntries: [],
      instructionsSectionContentEntries: [],
      propositionsSectionTitleEntries: [],
      headerImage: {
        externalUrl: '',
        mimeType: '',
        title: ''
      }
    };
    const filteredVoteSession = filter(VoteSessionQuery, { voteSession: voteSession || emptyVoteSession });
    const voteSessionForStore = {
      ...filteredVoteSession.voteSession,
      instructionsSectionContentEntries: filteredVoteSession.voteSession.instructionsSectionContentEntries
        ? convertEntriesToRawContentState(filteredVoteSession.voteSession.instructionsSectionContentEntries)
        : null
    };
    this.props.updateVoteSessionPage(voteSessionForStore);
  }

  putSectionsInStore(sections) {
    const filteredSections = filter(SectionsQuery, {
      sections: sections.filter(section => section.sectionType !== 'ADMINISTRATION')
    });
    this.props.updateSections(filteredSections.sections);
  }

  putLegalNoticeAndTermsInStore(legalNoticeAndTerms) {
    const filtered = filter(LegalNoticeAndTermsQuery, { legalNoticeAndTerms: legalNoticeAndTerms });
    const lnat = filtered.legalNoticeAndTerms;
    const convertedLegalNoticeAndTerms = {
      legalNoticeEntries: lnat.legalNoticeEntries ? convertEntriesToRawContentState(lnat.legalNoticeEntries) : null,
      termsAndConditionsEntries: lnat.termsAndConditionsEntries
        ? convertEntriesToRawContentState(lnat.termsAndConditionsEntries)
        : null
    };
    this.props.updateLegalNoticeAndTerms(convertedLegalNoticeAndTerms);
  }

  render() {
    const {
      children,
      data,
      debate,
      i18n,
      params,
      refetchResources,
      refetchResourcesCenter,
      refetchTabsConditions,
      refetchSections,
      refetchLegalNoticeAndTerms
    } = this.props;
    const { phase } = params;
    const { timeline } = this.props.debate.debateData;
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, {
        locale: i18n.locale
      })
    );

    return (
      <div className="administration">
        <div className="save-bar">
          <div className="max-container">
            <Grid fluid>
              <Row>
                <Col xs={12} md={3} />
                <Col xs={12} md={8}>
                  <SaveButton
                    refetchTabsConditions={refetchTabsConditions}
                    refetchThematics={data.refetch}
                    refetchResources={refetchResources}
                    refetchSections={refetchSections}
                    refetchResourcesCenter={refetchResourcesCenter}
                    refetchLegalNoticeAndTerms={refetchLegalNoticeAndTerms}
                  />
                </Col>
                <Col xs={12} md={1} />
              </Row>
            </Grid>
          </div>
        </div>
        <div className="max-container">
          <Grid fluid>
            <Row>
              <Col xs={12} md={3}>
                <div className="admin-menu-container">
                  <Menu debate={debate} i18n={i18n} requestedPhase={phase} />
                </div>
              </Col>
              <Col xs={12} md={8}>
                {!timeline ? (
                  <div>
                    <Translate value="administration.noTimeline" />
                  </div>
                ) : null}
                {childrenWithProps}
              </Col>
              <Col xs={12} md={1}>
                <LanguageMenu />
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  debate: state.debate,
  i18n: state.i18n
});

const mapDispatchToProps = dispatch => ({
  updateResources: resources => dispatch(updateResources(resources)),
  updateSections: sections => dispatch(updateSections(sections)),
  updateThematics: thematics => dispatch(updateThematics(thematics)),
  updateResourcesCenterPage: ({ titleEntries, headerImage }) => {
    dispatch(updateResourcesCenterPage(titleEntries, headerImage));
  },
  updateVoteSessionPage: voteSession => dispatch(updateVoteSessionPage(voteSession)),
  updateLegalNoticeAndTerms: legalNoticeAndTerms => dispatch(updateLegalNoticeAndTerms(legalNoticeAndTerms)),
  displayLanguageMenu: isHidden => dispatch(displayLanguageMenu(isHidden))
});

const mergeLoadingAndHasErrors = WrappedComponent => (props) => {
  const {
    data,
    resourcesHasErrors,
    resourcesCenterHasErrors,
    resourcesLoading,
    voteSessionHasErrors,
    voteSessionLoading,
    resourcesCenterLoading,
    sectionsHasErrors,
    sectionsLoading,
    tabsConditionsLoading,
    tabsConditionsHasErrors,
    legalNoticeAndTermsLoading,
    legalNoticeAndTermsHasErrors
  } = props;
  const hasErrors =
    voteSessionHasErrors ||
    resourcesHasErrors ||
    resourcesCenterHasErrors ||
    tabsConditionsHasErrors ||
    legalNoticeAndTermsHasErrors ||
    sectionsHasErrors ||
    (data && data.error);
  const loading =
    voteSessionLoading ||
    resourcesLoading ||
    resourcesCenterLoading ||
    tabsConditionsLoading ||
    legalNoticeAndTermsLoading ||
    sectionsLoading ||
    (data && data.loading);

  return <WrappedComponent {...props} hasErrors={hasErrors} loading={loading} />;
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(ThematicsQuery, {
    options: { variables: { identifier: 'survey' } }
  }),
  graphql(TabsConditionQuery, {
    options: ({ i18n }) => ({
      variables: { lang: i18n.locale }
    }),
    // pass refetchTabsConditions to re-render navigation menu if there is a change in resources
    props: ({ data }) => {
      if (data.loading) {
        return {
          tabsConditionsLoading: true
        };
      }
      if (data.error) {
        return {
          tabsConditionsHasErrors: true
        };
      }

      return {
        refetchTabsConditions: data.refetch
      };
    }
  }),
  graphql(VoteSessionQuery, {
    skip: ({ debate }) => typeof getPhaseId(debate.debateData.timeline, 'voteSession') !== 'string',
    options: ({ debate }) => ({
      variables: { discussionPhaseId: getPhaseId(debate.debateData.timeline, 'voteSession') }
    }),
    props: ({ data }) => {
      if (data.loading) {
        return {
          voteSessionLoading: true
        };
      }
      if (data.error) {
        return {
          voteSessionHasErrors: true
        };
      }

      return {
        voteSessionLoading: data.loading,
        voteSessionHasErrors: data.error,
        voteSession: data.voteSession
      };
    }
  }),
  graphql(ResourcesQuery, {
    props: ({ data }) => {
      if (data.loading) {
        return {
          resourcesLoading: true
        };
      }
      if (data.error) {
        return {
          resourcesHasErrors: true
        };
      }

      return {
        resourcesLoading: data.loading,
        resourcesHasErrors: data.error,
        refetchResources: data.refetch,
        resources: data.resources
      };
    }
  }),
  graphql(ResourcesCenterPage, {
    props: ({ data }) => {
      if (data.loading) {
        return {
          resourcesCenterLoading: true
        };
      }
      if (data.error) {
        return {
          resourcesCenterHasErrors: true
        };
      }

      const { headerImage, titleEntries } = data.resourcesCenter;
      return {
        resourcesCenterLoading: data.loading,
        resourcesCenterHasErrors: data.error,
        refetchResourcesCenter: data.refetch,
        resourcesCenter: {
          headerImage: headerImage,
          titleEntries: titleEntries
        }
      };
    }
  }),
  graphql(SectionsQuery, {
    props: ({ data }) => {
      if (data.loading) {
        return {
          sectionsLoading: true
        };
      }

      if (data.error) {
        return {
          sectionsHasErrors: true
        };
      }

      return {
        sectionsLoading: data.loading,
        sectionsHasErrors: data.error,
        refetchSections: data.refetch,
        sections: data.sections
      };
    }
  }),
  graphql(LegalNoticeAndTermsQuery, {
    props: ({ data }) => {
      if (data.loading) {
        return {
          legalNoticeAndTermsLoading: true
        };
      }
      if (data.error) {
        return {
          legalNoticeAndTermsHasErrors: true
        };
      }

      return {
        legalNoticeAndTermsLoading: data.loading,
        legalNoticeAndTermsHasErrors: data.error,
        refetchLegalNoticeAndTerms: data.refetch,
        legalNoticeAndTerms: data.legalNoticeAndTerms
      };
    }
  }),
  mergeLoadingAndHasErrors,
  withLoadingIndicator()
)(Administration);