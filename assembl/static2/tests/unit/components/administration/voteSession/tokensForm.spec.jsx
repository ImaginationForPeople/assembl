/* eslint max-len: ["error", { "ignoreStrings": true }] */
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

import { DumbTokensForm } from '../../../../../js/app/components/administration/voteSession/tokensForm';

describe('tokensForm component', () => {
  const handleInstructionsChangeSpy = jest.fn(() => {});
  const handleTokenVoteTypeNumberChangeSpy = jest.fn(() => {});
  const handleExclusiveCheckboxChangeSpy = jest.fn(() => {});
  it('should render a form to configure a tokens vote, the exclusivity, instructions and number of tokens types but no TokenTypeForm', () => {
    const props = {
      instructions: 'Je vous prie de bien vouloir voter.',
      exclusive: true,
      tokenTypeNumber: 0,
      tokenTypes: {},
      editLocale: 'fr',
      handleInstructionsChange: handleInstructionsChangeSpy,
      handleTokenVoteTypeNumberChange: handleTokenVoteTypeNumberChangeSpy,
      handleExclusiveCheckboxChange: handleExclusiveCheckboxChangeSpy
    };
    const shallowRenderer = new ShallowRenderer();
    shallowRenderer.render(<DumbTokensForm {...props} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });
  it('should render a form to configure a tokens vote, the exclusivity, instructions and number of tokens types and 3 TokenTypeForm', () => {
    const props = {
      instructions: 'Je vous prie de bien vouloir voter.',
      exclusive: true,
      tokenTypeNumber: 3,
      tokenTypes: ['1234', '5678', '9874'],
      editLocale: 'fr',
      handleInstructionsChange: handleInstructionsChangeSpy,
      handleTokenVoteTypeNumberChange: handleTokenVoteTypeNumberChangeSpy,
      handleExclusiveCheckboxChange: handleExclusiveCheckboxChangeSpy
    };
    const shallowRenderer = new ShallowRenderer();
    shallowRenderer.render(<DumbTokensForm {...props} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });
});