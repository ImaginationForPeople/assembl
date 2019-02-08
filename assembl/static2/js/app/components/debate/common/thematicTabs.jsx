// @flow
import * as React from 'react';
import { I18n } from 'react-redux-i18n';
import { Tabs, Tab } from 'react-bootstrap';
import classnames from 'classnames';
// Component imports
import { ANNOUNCEMENT_TAB_ITEM_ID } from '../../../constants';
import { SemanticAnalysis } from '../../../pages/semanticAnalysis/semanticAnalysis';
import { renderRichtext } from '../../../utils/linkify';
// GraphQL imports
import SemanticAnalysisForThematicQuery from '../../../graphql/SemanticAnalysisForThematicQuery.graphql';

export type Props = {
  guidelinesContent?: React.Node,
  summary: ?string,
  semanticAnalysisForThematicData: SemanticAnalysisForThematicQuery
};

const ThematicTabs = ({ guidelinesContent, summary, semanticAnalysisForThematicData }: Props) => {
  const { topKeywords } = semanticAnalysisForThematicData;
  const topKeywordsLength = topKeywords.length;

  // Translation keys
  const guidelinesTitleKey = 'debate.thread.guidelines';
  const summaryTitleKey = 'administration.tableOfThematics.summaryLabel';
  const semanticAnalysisLongTitleKey = 'debate.semanticAnalysis.long';
  const semanticAnalysisShortTitleKey = 'debate.semanticAnalysis.short';

  // Title contents
  const guidelinesTabTitle = I18n.t(guidelinesTitleKey);
  const summaryTabTitle = I18n.t(summaryTitleKey);
  const semanticAnalysisTabLongTitle = I18n.t(semanticAnalysisLongTitleKey);
  const semanticAnalysisTabShortTitle = I18n.t(semanticAnalysisShortTitleKey);
  // Since 'semantic analysis' is a long composed word, we only display 'analysis' on small devices
  const semanticAnalysisTabTitle = (
    <React.Fragment>
      {semanticAnalysisTabShortTitle}
      <span className="md-only">{semanticAnalysisTabLongTitle}</span>
    </React.Fragment>
  );

  const guidelinesTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.GUIDELINES} title={guidelinesTabTitle}>
      {guidelinesContent}
    </Tab>
  );

  const summaryTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.SUMMARY} title={summaryTabTitle}>
      {summary ? <div className="summary">{renderRichtext(summary)}</div> : null}
    </Tab>
  );

  const semanticAnalysisTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.SEMANTIC_ANALYSIS} title={semanticAnalysisTabTitle}>
      <div id="semantic-analysis-thematic" className="semantic-analysis">
        <SemanticAnalysis semanticAnalysisData={semanticAnalysisForThematicData} />
      </div>
    </Tab>
  );
  const classNameTabs = topKeywordsLength > 0 && guidelinesTabAndContent ? '' : 'single-tab';

  return (
    <Tabs
      id="announcement-tabs-id"
      justified
      defaultActiveKey={ANNOUNCEMENT_TAB_ITEM_ID.GUIDELINES}
      className={classnames('announcement-menu', classNameTabs)}
    >
      {guidelinesTabAndContent}
      {summary ? summaryTabAndContent : null}
      {topKeywordsLength > 0 ? semanticAnalysisTabAndContent : null}
    </Tabs>
  );
};

ThematicTabs.defaultProps = {
  guidelinesContent: <div />,
  summary: null
};

export default ThematicTabs;