// @flow
import React from 'react';
import initStoryshots from '@storybook/addon-storyshots';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import SentimentMenu from '../../../../../js/app/components/debate/brightMirror/sentimentMenu';

// Import existing storybook data
import { props } from '../../../../../js/app/stories/components/debate/brightMirror/sentimentMenu.stories'; // eslint-disable-line max-len

// Separate the snapshots in directories next to each component
// Name should match with the story name
initStoryshots({
  storyKindRegex: /^SentimentMenu$/
});

configure({ adapter: new Adapter() });

describe('<SentimentMenu /> - with shallow', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<SentimentMenu {...props} />);
  });

  it('should render 4 inactive icons if no mysentiment', () => {
    wrapper.setProps({
      mySentiment: null
    });
    expect(wrapper.find('div [className="sentiment"]')).toHaveLength(4);
  });

  it('should render 4 icons, 1 active and 3 inactive if there is mySentiment', () => {
    expect(wrapper.find('div [className="sentiment sentiment-active"]')).toHaveLength(1);
    expect(wrapper.find('div [className="sentiment"]')).toHaveLength(3);
  });

  it('should not render counts if none', () => {
    wrapper.setProps({
      sentimentCounts: {
        disagree: 0,
        dontUnderstand: 0,
        like: 0,
        moreInfo: 0
      }
    });
    expect(wrapper.find('div [className="sentiments-count margin-m"]')).toHaveLength(0);
  });

  it('should render counts if there is one at least', () => {
    expect(wrapper.find('div [className="sentiments-count margin-m"]')).toHaveLength(1);
  });

  it('should render counts icons and number corresponding', () => {
    wrapper.setProps({
      sentimentCounts: {
        disagree: 2,
        dontUnderstand: 4,
        like: 1,
        moreInfo: 0
      }
    });
    expect(wrapper.find('div [className="min-sentiment"]')).toHaveLength(3);
    expect(wrapper.find('div [className="txt"]').text()).toEqual('7 réactions');
  });
});