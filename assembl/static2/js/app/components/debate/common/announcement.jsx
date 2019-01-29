// @flow
import * as React from 'react';
import { Translate, I18n } from 'react-redux-i18n';
import { Col, Row, Tabs, Tab, Tooltip } from 'react-bootstrap';
// Components imports
import StatisticsDoughnut from '../common/statisticsDoughnut';
import { sentimentDefinitionsObject, type SentimentDefinition } from './sentimentDefinitions';
import TextAndMedia from '../../common/textAndMedia';
import { CountablePublicationStates, ANNOUNCEMENT_TAB_ITEM_ID, MESSAGE_VIEW } from '../../../constants';
import PostsAndContributorsCount, { Counter } from '../../common/postsAndContributorsCount';
import { SemanticAnalysis } from '../../../pages/semanticAnalysis/semanticAnalysis';
// GraphQL imports
import SemanticAnalysisForThematicQuery from '../../../graphql/SemanticAnalysisForThematicQuery.graphql';

export const createTooltip = (sentiment: SentimentDefinition, count: number) => (
  <Tooltip id={`${sentiment.camelType}Tooltip`} className="no-arrow-tooltip">
    {count} <Translate value={`debate.${sentiment.camelType}`} />
  </Tooltip>
);

type SentimentsCounts = {
  [string]: SentimentDefinition & {
    count: number
  }
};

type Post = {
  node: {
    sentimentCounts: {
      [string]: number
    },
    publicationState: string
  }
};

type Posts = {
  edges: Array<Post>
};

export type AnnouncementContent = {
  body: string,
  title: ?string,
  quote?: ?string
};

type DoughnutElements = {
  Tooltip: React.Node,
  color: string,
  count: number
};

type SurveyAnnouncementProps = {
  announcement: AnnouncementContent,
  semanticAnalysisForThematicData: SemanticAnalysisForThematicQuery,
  firstColor?: string,
  secondColor?: string
};

type Props = {
  announcement: AnnouncementContent,
  idea: {
    numContributors: number,
    numPosts: number,
    posts: Posts,
    messageColumns: IdeaMessageColumns,
    messageViewOverride: ?string
  },
  semanticAnalysisForThematicData: SemanticAnalysisForThematicQuery,
  firstColor?: string,
  secondColor?: string
};

type ColumnsInfoType = { count: ?number, color: ?string, name: ?string };

export const getColumnInfos = (messageColumns: Array<IdeaMessageColumnFragment>): Array<ColumnsInfoType> =>
  messageColumns.map(col => ({ count: col.numPosts, color: col.color, name: col.name }));

export const getSentimentsCount = (posts: Posts) => {
  const counters: SentimentsCounts = { ...sentimentDefinitionsObject };
  Object.keys(counters).forEach((key) => {
    counters[key].count = 0;
  });

  return posts.edges
    .filter(({ node: { publicationState } }) => Object.keys(CountablePublicationStates).indexOf(publicationState) > -1)
    .reduce(
      (result, { node: { sentimentCounts } }) =>
        Object.keys(result).reduce((naziLinter, key) => {
          const postCounts = naziLinter;
          postCounts[key].count += sentimentCounts[key];
          return postCounts;
        }, result),
      counters
    );
};

export const createDoughnutElements = (sentimentCounts: SentimentsCounts): Array<DoughnutElements> =>
  Object.keys(sentimentCounts).map(key => ({
    color: sentimentCounts[key].color,
    count: sentimentCounts[key].count,
    Tooltip: createTooltip(sentimentCounts[key], sentimentCounts[key].count)
  }));

export const SurveyAnnouncement = ({
  announcement,
  semanticAnalysisForThematicData,
  firstColor,
  secondColor
}: SurveyAnnouncementProps) => {
  const { topKeywords } = semanticAnalysisForThematicData;
  const topKeywordsCount = topKeywords.length;

  // Translation keys
  const guidelinesTitleKey = 'debate.thread.guidelines';
  // Uncomment the line below when adding the summary
  // const summaryTitleKey = 'debate.thread.summary';
  const semanticAnalysisLongTitleKey = 'debate.semanticAnalysis.long';
  const semanticAnalysisShortTitleKey = 'debate.semanticAnalysis.short';

  // Title contents
  const guidelinesTabTitle = I18n.t(guidelinesTitleKey);
  // Uncomment the line below when adding the summary
  // const summaryTabTitle = I18n.t(summaryTitleKey);
  const semanticAnalysisTabLongTitle = I18n.t(semanticAnalysisLongTitleKey);
  const semanticAnalysisTabShortTitle = I18n.t(semanticAnalysisShortTitleKey);
  // Since 'semantic analysis' is a long composed word, we only display 'analysis' on small devices
  const semanticAnalysisTabTitle = (
    <React.Fragment>
      {semanticAnalysisTabShortTitle}
      <span className="md-only">{semanticAnalysisTabLongTitle}</span>
    </React.Fragment>
  );

  const instructionContent = (
    <div className="announcement">
      <div className="announcement-title">
        <h3 className="announcement-title-text dark-title-1">
          {announcement.title ? announcement.title : <Translate value="debate.thread.announcement" />}
        </h3>
      </div>
      <Row>
        <TextAndMedia {...announcement} />
      </Row>
    </div>
  );

  const guidelinesTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.GUIDELINES} title={guidelinesTabTitle}>
      {instructionContent}
    </Tab>
  );

  // Uncomment those line below when adding the summary
  // const summaryTabAndContent = (
  //   <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.SUMMARY} title={summaryTabTitle}>
  //     {/** Summary Component and Content */}
  //   </Tab>
  // );

  const semanticAnalysisTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.SEMANTIC_ANALYSIS} title={semanticAnalysisTabTitle}>
      <div id="semantic-analysis-thematic" className="semantic-analysis">
        <SemanticAnalysis
          semanticAnalysisData={semanticAnalysisForThematicData}
          firstColor={firstColor}
          secondColor={secondColor}
        />
      </div>
    </Tab>
  );

  return (
    <div fluid className="background-light instructions-text">
      <div className="max-container">
        <div className="content-section">
          <Tabs
            id="announcement-tabs-id"
            justified
            defaultActiveKey={ANNOUNCEMENT_TAB_ITEM_ID.GUIDELINES}
            className="announcement-menu"
          >
            {guidelinesTabAndContent}
            {/** summaryTabAndContent */}
            {topKeywordsCount > 0 ? semanticAnalysisTabAndContent : null}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export const Announcement = ({ announcement, idea, semanticAnalysisForThematicData, firstColor, secondColor }: Props) => {
  const { numContributors, numPosts, posts, messageColumns, messageViewOverride } = idea;
  const { topKeywords } = semanticAnalysisForThematicData;
  const isMultiColumns = messageViewOverride === MESSAGE_VIEW.messageColumns;
  const sentimentsCount = getSentimentsCount(posts);
  const columnInfos = getColumnInfos(messageColumns);
  const doughnutElements = isMultiColumns ? columnInfos : createDoughnutElements(sentimentsCount);
  const topKeywordsCount = topKeywords.length;

  // Translation keys
  const guidelinesTitleKey = 'debate.thread.guidelines';
  // Uncomment the line below when adding the summary
  // const summaryTitleKey = 'debate.thread.summary';
  const semanticAnalysisLongTitleKey = 'debate.semanticAnalysis.long';
  const semanticAnalysisShortTitleKey = 'debate.semanticAnalysis.short';

  // Title contents
  const guidelinesTabTitle = I18n.t(guidelinesTitleKey);
  // Uncomment the line below when adding the summary
  // const summaryTabTitle = I18n.t(summaryTitleKey);
  const semanticAnalysisTabLongTitle = I18n.t(semanticAnalysisLongTitleKey);
  const semanticAnalysisTabShortTitle = I18n.t(semanticAnalysisShortTitleKey);
  // Since 'semantic analysis' is a long composed word, we only display 'analysis' on small devices
  const semanticAnalysisTabTitle = (
    <React.Fragment>
      {semanticAnalysisTabShortTitle}
      <span className="md-only">{semanticAnalysisTabLongTitle}</span>
    </React.Fragment>
  );

  const instructionContent = (
    <div className="announcement">
      <div className="announcement-title">
        <h3 className="announcement-title-text dark-title-1">
          {announcement.title || <Translate value="debate.thread.announcement" />}
        </h3>
      </div>
      <Col xs={12} md={10} className="announcement-media col-md-push-2 no-padding">
        <TextAndMedia {...announcement} />
      </Col>
      <Col xs={12} md={2} className="col-md-pull-10 announcement-statistics-container">
        <div className="announcement-statistics">
          <div className="announcement-doughnut">
            <StatisticsDoughnut elements={doughnutElements} />
          </div>
          {isMultiColumns ? (
            <div className="announcement-numbers">
              {columnInfos.map((col, index) => (
                <div style={{ color: col.color }} key={`col-${index}`}>
                  {col.count} <span className="col-announcement-count">{col.name}</span>
                </div>
              ))}
              <Counter num={numContributors} className="assembl-icon assembl-icon-profil" />
            </div>
          ) : (
            <PostsAndContributorsCount className="announcement-numbers" numContributors={numContributors} numPosts={numPosts} />
          )}
        </div>
      </Col>
    </div>
  );

  const guidelinesTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.GUIDELINES} title={guidelinesTabTitle}>
      {instructionContent}
    </Tab>
  );

  // Uncomment those line below when adding the summary
  // const summaryTabAndContent = (
  //   <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.SUMMARY} title={summaryTabTitle}>
  //     {/** Summary Component and Content */}
  //   </Tab>
  // );

  const semanticAnalysisTabAndContent = (
    <Tab eventKey={ANNOUNCEMENT_TAB_ITEM_ID.SEMANTIC_ANALYSIS} title={semanticAnalysisTabTitle}>
      <div id="semantic-analysis-thematic" className="semantic-analysis">
        <SemanticAnalysis
          semanticAnalysisData={semanticAnalysisForThematicData}
          firstColor={firstColor}
          secondColor={secondColor}
        />
      </div>
    </Tab>
  );

  return (
    <Tabs
      id="announcement-tabs-id"
      justified
      defaultActiveKey={ANNOUNCEMENT_TAB_ITEM_ID.GUIDELINES}
      className="announcement-menu"
    >
      {guidelinesTabAndContent}
      {/** summaryTabAndContent */}
      {topKeywordsCount > 0 ? semanticAnalysisTabAndContent : null}
    </Tabs>
  );
};

const announcementDefaultProps = {
  semanticAnalysisForThematicData: {
    nlpSentiment: {
      positive: null,
      negative: null,
      count: 0
    },
    title: '',
    topKeywords: []
  },
  firstColor: 'rgb(0,0,0)',
  secondColor: 'rgb(0,0,0)'
};

SurveyAnnouncement.defaultProps = { ...announcementDefaultProps };

Announcement.defaultProps = {
  ...announcementDefaultProps
};

export default Announcement;