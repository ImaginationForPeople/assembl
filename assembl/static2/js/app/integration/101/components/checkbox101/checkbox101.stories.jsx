// @flow
import React from 'react';
/* eslint-disable */
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
/* eslint-enable */

import Checkbox101 from './checkbox101';
import type { Checkbox101Type } from './checkbox101';

const actions: { [name: string]: Function } = {
  onChangeHandler: action('onChangeHandler')
};

export const defaultCheckbox: Checkbox101Type = {
  onChangeHandler: actions.onChangeHandler
};

const checkedCheckbox: Checkbox101Type = {
  ...defaultCheckbox,
  isDone: true
};

const customLabelCheckbox: Checkbox101Type = {
  ...defaultCheckbox,
  label: 'Custom Label'
};

const playground: Object = {
  label: 'Playground label',
  isDone: true
};

storiesOf('Checkbox101', module)
  .addDecorator(withKnobs)
  .add('default', () => <Checkbox101 {...defaultCheckbox} />)
  .add('checked', () => <Checkbox101 {...checkedCheckbox} />)
  .add('custom label', () => <Checkbox101 {...customLabelCheckbox} />)
  .add('playground', () => <Checkbox101 label={text('label', playground.label)} isDone={boolean('isDone', playground.isDone)} onChangeHandler={actions.onChangeHandler} />);