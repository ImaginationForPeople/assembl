// @flow
import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import initStoryshots from '@storybook/addon-storyshots';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
/* eslint-enable */

import CircleAvatar from '../../../../../js/app/components/debate/brightMirror/circleAvatar';
import type { CircleAvatarType } from '../../../../../js/app/components/debate/brightMirror/circleAvatar';

// Separate the snapshots in directories next to each component
// Name should match with the story name
initStoryshots({
  storyKindRegex: /^CircleAvatar$/
});

configure({ adapter: new Adapter() });

const defaultCircleAvatar: CircleAvatarType = {
  username: 'taryn-treutel',
  src: 'https://loremflickr.com/300/300'
};

describe('<CircleAvatar /> - with shallow', () => {
  let wrapper;
  let circleAvatar;

  beforeEach(() => {
    circleAvatar = { ...defaultCircleAvatar };
    wrapper = shallow(<CircleAvatar {...circleAvatar} />);
  });

  it('should render one image tag', () => {
    expect(wrapper.find('img [className="circle-avatar"]')).toHaveLength(1);
  });

  it('should render one image with a custom alt tag', () => {
    expect(wrapper.find('img [alt="taryn-treutel-avatar"]')).toHaveLength(1);
  });

  it('should render one image with a custom image', () => {
    expect(wrapper.find('img [src="https://loremflickr.com/300/300"]')).toHaveLength(1);
  });

  it('should render one image with a default alt tag set to no-username-avatar', () => {
    wrapper.setProps({ username: '', src: '' });
    expect(wrapper.find('img [alt="no-username-avatar"] [src="/static2/img/icons/avatar.png"]')).toHaveLength(1);
  });
});