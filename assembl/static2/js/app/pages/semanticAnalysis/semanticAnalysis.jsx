// @flow
import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { I18n } from 'react-redux-i18n';

// Component imports
import ToolbarSlider from '../../components/common/toolbarSlider/toolbarSlider';
import TitleWithTooltip from '../../components/common/titleWithTooltip/titleWithTooltip';
import ResponsiveWordCloud from '../../components/common/wordCloud/responsiveWordCloud';
import KeywordInfo from '../../components/common/keywordInfo/keywordInfo';
import SentimentBar from '../../components/common/sentimentBar/sentimentBar';
import WordCountInformation from '../../components/common/wordCountInformation/wordCountInformation';
import Description from '../../components/common/description/description';
import Title from '../../components/common/title/title';

// Type imports
import type { Keyword, SemanticAnalysisData } from '../../integration/semanticAnalysis/dataType';

import { firstColor, secondColor } from '../../../../css/themes/default/_theme';

export type Props = {
  /** Semantic analysis data */
  semanticAnalysisData: SemanticAnalysisData
};

export type State = {
  keywordSelected: boolean,
  keywordData: Keyword,
  numberOfKeywordsToDisplay: number
};

export class SemanticAnalysis extends Component<Props, State> {
  state = {
    keywordSelected: false,
    keywordData: {
      count: 0,
      score: 0,
      value: 'Pas de mot sélectionné'
    },
    numberOfKeywordsToDisplay: this.NUM_WORDS_DEFAULT
  };

  NUM_WORDS_DEFAULT = 20;

  MIN_WORDS = 10;

  onNumberOfKeywordSliderChangeHandler = (value: number) => {
    this.setState({ numberOfKeywordsToDisplay: value });
  };

  onKeywordClickHandler = (newKeywordData: Keyword) => {
    const { keywordData, keywordSelected } = this.state;
    if (keywordData === newKeywordData) {
      this.setState({ keywordSelected: !keywordSelected });
    } else {
      this.setState({ keywordData: newKeywordData });
    }
  };

  onKeywordOverHandler = (newKeywordData: Keyword) => {
    const { keywordSelected } = this.state;
    if (!keywordSelected) {
      this.setState({ keywordData: newKeywordData });
    }
  };

  onKeywordOutHandler = () => {
    const { keywordSelected } = this.state;
    if (!keywordSelected) {
      this.setState({
        keywordData: {
          count: 0,
          score: 0,
          value: 'Pas de mot sélectionné'
        }
      });
    }
  };

  render() {
    const { keywordData, numberOfKeywordsToDisplay } = this.state;
    const { semanticAnalysisData } = this.props;

    // Semantic analysis
    const { nlpSentiment, topKeywords } = semanticAnalysisData;
    // Computation on sentiment score (can be moved to the backend)
    const { count, negative, positive } = nlpSentiment;
    const score = (positive + negative) / count;
    const sentimentScore = (score + 1) / 2;
    // Format keywords object structure for WordCloud
    const keywords = topKeywords.map(k => ({ count: k.count, score: k.score, value: k.value }));
    const keywordsLength = topKeywords.length;
    // Get wordCount: Should be updated when value is available from the backend
    const wordCount = 0;

    // Translation keys
    const informationKeywordKey = 'debate.semanticAnalysis.informationKeyword';
    const keywordCloudKey = 'debate.semanticAnalysis.keywordCloud';
    const keywordCloudDefinitionKey = 'debate.semanticAnalysis.keywordCloudDefinition';
    const numberKeywordKey = 'debate.semanticAnalysis.numberKeyword';
    const occurenceKey = 'debate.semanticAnalysis.occurence';
    const occurenceDefinitionKey = 'debate.semanticAnalysis.occurenceDefinition';
    const relevanceKey = 'debate.semanticAnalysis.relevance';
    const relevanceDefinitionKey = 'debate.semanticAnalysis.relevanceDefinition';
    const sentimentAnalysisKey = 'debate.semanticAnalysis.sentimentAnalysis';
    const sentimentAnalysisDefinitionKey = 'debate.semanticAnalysis.sentimentAnalysisDefinition';

    // Title contents
    const informationKeywordTitle = I18n.t(informationKeywordKey);
    const keywordCloudTitle = I18n.t(keywordCloudKey);
    const keywordCloudDefinition = I18n.t(keywordCloudDefinitionKey);
    const numberKeywordTitle = I18n.t(numberKeywordKey);
    const occurenceTitle = I18n.t(occurenceKey);
    const occurenceDefinition = I18n.t(occurenceDefinitionKey);
    const relevanceTitle = I18n.t(relevanceKey);
    const relevanceDefinition = I18n.t(relevanceDefinitionKey);
    const sentimentAnalysisTitle = I18n.t(sentimentAnalysisKey);
    const sentimentAnalysisDefinition = I18n.t(sentimentAnalysisDefinitionKey);

    const wordCountInformation = wordCount > 0 ? <WordCountInformation wordCount={wordCount} className="padding-top" /> : null;

    const informationKeywordTooltip = (
      <div>
        <p>
          <strong>{occurenceTitle}:</strong> {occurenceDefinition}
        </p>
        <p>
          <strong>{relevanceTitle}:</strong> {relevanceDefinition}
        </p>
      </div>
    );

    const sentimentAnalysisTooltip = (
      <div>
        <p>{sentimentAnalysisDefinition}</p>
      </div>
    );

    return (
      <div className="semantic-analysis">
        {/** Description section */}
        <Col xs={12} className="no-padding">
          <Title level={1}>{keywordCloudTitle}</Title>
          <Description>
            <p>{keywordCloudDefinition}</p>
          </Description>
          {wordCountInformation}
        </Col>

        {/** WordCloud section */}
        <Col xs={12} md={8} className="no-padding lg-wordcloud-padding sm-margin-m margin-s">
          <ResponsiveWordCloud
            keywordsColor={firstColor}
            keywordsColorActive={secondColor}
            keywords={keywords}
            numberOfKeywordsToDisplay={numberOfKeywordsToDisplay}
            onWordClick={this.onKeywordClickHandler}
            onMouseOverWord={this.onKeywordOverHandler}
            onMouseOutWord={this.onKeywordOutHandler}
          />
        </Col>

        {/** Toolbar section */}
        <Col xs={12} md={4} className="no-padding margin-s">
          <Col xsHidden sm={6} md={12} className="no-padding">
            <TitleWithTooltip level={2} tooltipContent={informationKeywordTooltip}>
              {informationKeywordTitle}
            </TitleWithTooltip>

            <KeywordInfo keyword={keywordData} />
          </Col>

          <Col xsHidden smHidden md={12} className="no-padding">
            <Title level={2}>{numberKeywordTitle}</Title>

            <ToolbarSlider
              color={firstColor}
              defaultValue={this.NUM_WORDS_DEFAULT}
              maxValue={keywordsLength}
              minValue={this.MIN_WORDS}
              onSliderChange={this.onNumberOfKeywordSliderChangeHandler}
            />
          </Col>

          <Col xs={12} sm={6} md={12} smPush={1} mdPush={0} className="no-padding">
            <TitleWithTooltip level={2} tooltipContent={sentimentAnalysisTooltip}>
              {sentimentAnalysisTitle}
            </TitleWithTooltip>

            <SentimentBar value={sentimentScore} />
          </Col>
        </Col>
      </div>
    );
  }
}

export default SemanticAnalysis;