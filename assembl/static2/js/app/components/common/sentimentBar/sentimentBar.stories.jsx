// @flow
import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { number, withKnobs } from '@storybook/addon-knobs';
/* eslint-enable */

import SentimentBar from './sentimentBar';

export const defaultSentimentBarProps = {
  value: 0.5
};

const playground = {
  value: 0.5755
};

storiesOf('Semantic Analysis|SentimentBar', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    withInfo()(() => (
      <div
        style={
          { width: '200px' } // eslint-disable-line comma-dangle
        }
      >
        <SentimentBar value={defaultSentimentBarProps.value} />
      </div>
    ))
  )
  .add(
    'playground',
    withInfo()(() => (
      <div
        style={
          { width: '200px' } // eslint-disable-line comma-dangle
        }
      >
        <SentimentBar value={number('value', playground.value)} />
      </div>
    ))
  );