// @flow
import React, { Component } from 'react';
import { Grid } from 'react-bootstrap';
// Helper imports
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
// Type imports
import type { OperationComponent } from 'react-apollo';
import type { State } from '../../../reducers/rootReducer';
// Graphql imports
import SemanticAnalysisForDiscussionQuery from '../../../graphql/SemanticAnalysisForDiscussionQuery.graphql';
// Component imports
import manageErrorAndLoading, { TYPE } from '../../../components/common/manageErrorAndLoading';
import { SemanticAnalysis, type Props as SemanticAnalysisProps } from '../semanticAnalysis';
import Loader, { LOADER_TYPE } from '../../../components/common/loader/loader';

export type Props = SemanticAnalysisForDiscussionQuery;

export class SemanticAnalysisForDiscussion extends Component<Props> {
  render() {
    const { semanticAnalysisForDiscussionData } = this.props;
    const { topKeywords } = semanticAnalysisForDiscussionData;
    const topKeywordsCount = topKeywords.length;

    const semanticAnalysisProps: SemanticAnalysisProps = {
      semanticAnalysisData: semanticAnalysisForDiscussionData
    };

    // Display content only when there are top keywords defined
    const content =
      topKeywordsCount > 0 ? <SemanticAnalysis {...semanticAnalysisProps} /> : <Loader type={LOADER_TYPE.NO_DATA} />;

    return (
      <div className="semantic-analysis-container">
        <div className="banner">
          <Grid className="margin-lr">
            <h1>Analyse sémantique</h1>
          </Grid>
        </div>
        <Grid id="semantic-analysis-discussion" className="semantic-analysis">
          {content}
        </Grid>
      </div>
    );
  }
}

const mapStateToProps: State => DiscussionDataQueryVariables = state => ({
  lang: state.i18n.locale
});

const semanticAnalysisForDiscussionQuery: OperationComponent<SemanticAnalysisForDiscussionQuery,
  DiscussionDataQueryVariables,
  Props> = graphql(SemanticAnalysisForDiscussionQuery, {
    props: ({ data }) => data
  });

export default compose(
  connect(mapStateToProps),
  semanticAnalysisForDiscussionQuery,
  manageErrorAndLoading({ displayLoader: true, loaderType: TYPE.SEMANTIC_ANALYSIS })
)(SemanticAnalysisForDiscussion);