// @flow
import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16.3';
/* eslint-enable */

import WordCloud from './wordCloud';

configure({ adapter: new Adapter() });

const propsDefault = {
  keywords: []
};

describe('<WordCloud /> - with shallow', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<WordCloud {...propsDefault} />);
  });

  it('should render no <ReactWordCloud /> if no data is passed', () => {
    expect(wrapper.find('WordCloud')).toHaveLength(0);
  });

  it('should render render a <ReactWordCloud /> if data is passed', () => {
    wrapper.setProps({ keywords: [{ text: 'text', relevance: 0.9, count: 5 }] });
    expect(wrapper.find('WordCloud')).toHaveLength(1);
  });
});