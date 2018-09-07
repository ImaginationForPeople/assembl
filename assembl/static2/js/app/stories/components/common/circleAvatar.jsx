// @flow
import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withKnobs, text, select } from '@storybook/addon-knobs';
/* eslint-enable */

import CircleAvatar from '../../../components/common/circleAvatar';

const customCircleAvatar = {
  src: 'https://loremflickr.com/300/300'
};

const playgroundButton = {
  size: '34',
  username: 'bright-mirror-author',
  src: ['https://loremflickr.com/300/300', '/static2/img/icons/avatar.png']
};

storiesOf('CircleAvatar', module)
  .addDecorator(withKnobs)
  .add('default', withInfo()(() => <CircleAvatar />))
  .add('custom image', withInfo()(() => <CircleAvatar src={customCircleAvatar.src} />))
  .add('playground', withInfo()(() => (
    <CircleAvatar
      size={text('size', playgroundButton.size)}
      username={text('username', playgroundButton.username)}
      src={select('src', playgroundButton.src)}
    />
  )));