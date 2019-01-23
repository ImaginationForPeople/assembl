// @flow
import React, { Component } from 'react';

import ReactWordCloud from 'react-wordcloud';

import type { Keyword, Keywords } from '../../../integration/semanticAnalysis/dataType';

// Keys provided by Watson
const WORD_COUNT_KEY = 'relevance';
const WORD_KEY = 'text';

export type BaseProps = {
  /** Optional angle value in degrees */
  keywordsAngle: number,
  /** Optional color rgb(x, x, x) only */
  keywordsColor: string,
  /** Optional color when a word is active rgb(x, x, x) only */
  keywordsColorActive: string,
  /** Array of keywords */
  keywords: Keywords,
  /** Optional maximum number of keywords to show */
  numberOfKeywordsToDisplay: number,
  /** Optional callback function called when a word is hovered in */
  onMouseOutWord: (word: Keyword) => void,
  /** Optional callback function called when a word is hovered out */
  onMouseOverWord: (word: Keyword) => void,
  /** Optional callback function called when a word is clicked */
  onWordClick: (word: Keyword) => void
};

export type Props = BaseProps & {
  /** Optional height */
  height: number,
  /** Optional width */
  width: number
};

export const defaultBaseProps = {
  keywordsAngle: 0,
  keywordsColor: 'rgb(0, 0, 0)',
  keywordsColorActive: 'rgb(0, 0, 0)',
  numberOfKeywordsToDisplay: 30,
  onMouseOutWord: () => {},
  onMouseOverWord: () => {},
  onWordClick: () => {}
};

class WordCloud extends Component<Props> {
  static defaultProps = {
    ...defaultBaseProps,
    height: 500,
    width: 400
  };

  shouldComponentUpdate(nextProps: Props) {
    const {
      height,
      keywordsAngle,
      keywordsColor,
      keywordsColorActive,
      keywords,
      numberOfKeywordsToDisplay,
      onMouseOutWord,
      onMouseOverWord,
      onWordClick,
      width
    } = this.props;
    if (
      nextProps.height !== height ||
      nextProps.keywordsAngle !== keywordsAngle ||
      nextProps.keywordsColor !== keywordsColor ||
      nextProps.keywordsColorActive !== keywordsColorActive ||
      nextProps.keywords !== keywords ||
      nextProps.numberOfKeywordsToDisplay !== numberOfKeywordsToDisplay ||
      nextProps.onMouseOutWord !== onMouseOutWord ||
      nextProps.onMouseOverWord !== onMouseOverWord ||
      nextProps.onWordClick !== onWordClick ||
      nextProps.width !== width
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.keywordsColor !== prevProps.keywordsColor ||
      this.props.keywordsColorActive !== prevProps.keywordsColorActive
    ) {
      this.forceUpdate();
    }
  }

  render() {
    const {
      height,
      keywordsAngle,
      keywordsColor,
      keywordsColorActive,
      keywords,
      numberOfKeywordsToDisplay,
      onMouseOutWord,
      onMouseOverWord,
      onWordClick,
      width
    } = this.props;

    const maxAngle = keywordsAngle;
    const minAngle = maxAngle * -1;
    const noData = !keywords.length;

    const interval = {
      max: Math.max(...Array.from(keywords, x => x.relevance)),
      min: Math.min(...Array.from(keywords, x => x.relevance))
    };
    if (interval.max === interval.min) {
      interval.min = 0;
    }

    /**
     * Function to be used with ReactWordCloud which maps each keyword with a color.
     *
     * Takes a color and returns a function depending on a keyword. The function returns
     * the color with an opacity depending on d data.
     *
     * @param {string} color String color in the format rgb(x, x, x).
     *
     * @return {function} Function takes a Keyword as parameter and returns a color with opacity
     * depending on the Keyword parameters.
     */
    const convertColorFromRGBToRGBA = color => d =>
      `rgba(${color.substring(4, color.length - 1)}, ${0.5 +
        0.5 * (d.relevance - interval.min) / (interval.max - interval.min)})`;

    const reactWordCloudProps = {
      colorScale: convertColorFromRGBToRGBA(keywordsColor),
      colorScaleActive: convertColorFromRGBToRGBA(keywordsColorActive),
      fontFamily: 'Lato',
      height: height,
      maxAngle: maxAngle,
      maxWords: numberOfKeywordsToDisplay,
      minAngle: minAngle,
      onMouseOutWord: (word: Keyword) => onMouseOutWord(word),
      onMouseOverWord: (word: Keyword) => onMouseOverWord(word),
      onWordClick: (word: Keyword) => onWordClick(word),
      orientations: 20,
      scale: 'linear',
      tooltipEnabled: false,
      transitionDuration: 1500,
      width: width,
      wordCountKey: WORD_COUNT_KEY,
      wordKey: WORD_KEY,
      words: keywords
    };
    return noData ? (
      <h1>NO DATA</h1>
    ) : (
      <div className="wordcloud">
        <ReactWordCloud {...reactWordCloudProps} />
      </div>
    );
  }
}

export default WordCloud;