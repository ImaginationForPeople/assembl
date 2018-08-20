import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { connectedUserCan } from '../../../../../js/app/utils/permissions';

import InstructionView from '../../../../../js/app/components/debate/brightMirror/InstructionView';

jest.mock('../../../../../js/app/utils/permissions');

describe('Bright Mirror page', () => {
  it('should match BrightMirror instruction snapshot', () => {
    connectedUserCan.mockImplementation(() => true);

    const timeline = [
      {
        identifier: 'brightMirror',
        start: '1900-01-01T02:00:00Z',
        end: '2200-01-01T00:00:00Z',
        title: { entries: [{ en: 'brightMirror' }] }
      }
    ];
    const props = {
      announcementContent: {
        title: 'Instruction',
        body: 'Participez à la création de fiction'
      },
      isUserConnected: true,
      ideaId: 0,
      refetchIdea: Function,
      posts: [],
      timeline: timeline,
      identifier: 'brightMirror'
    };
    const shallowRenderer = new ShallowRenderer();
    shallowRenderer.render(<InstructionView {...props} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });

  it('timeline is over', () => {
    const timeline = [
      {
        identifier: 'brightMirror',
        start: '1900-01-01T02:00:00Z',
        end: '2000-01-01T00:00:00Z',
        title: { entries: [{ en: 'brightMirror' }] }
      }
    ];
    const props = {
      announcementContent: {
        title: 'Instruction',
        body: 'Participez à la création de fiction'
      },
      isUserConnected: true,
      ideaId: 0,
      refetchIdea: Function,
      posts: [],
      timeline: timeline,
      identifier: 'brightMirror'
    };
    const shallowRenderer = new ShallowRenderer();
    shallowRenderer.render(<InstructionView {...props} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });

  it('user cannot post', () => {
    connectedUserCan.mockImplementation(() => false);

    const timeline = [
      {
        identifier: 'brightMirror',
        start: '1900-01-01T02:00:00Z',
        end: '2200-01-01T00:00:00Z',
        title: { entries: [{ en: 'brightMirror' }] }
      }
    ];
    const props = {
      announcementContent: {
        title: 'Instruction',
        body: 'Participez à la création de fiction'
      },
      isUserConnected: true,
      ideaId: 0,
      refetchIdea: Function,
      posts: [],
      timeline: timeline,
      identifier: 'brightMirror'
    };
    const shallowRenderer = new ShallowRenderer();
    shallowRenderer.render(<InstructionView {...props} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });

  it('user is not connected', () => {
    const timeline = [
      {
        identifier: 'brightMirror',
        start: '1900-01-01T02:00:00Z',
        end: '2000-01-01T00:00:00Z',
        title: { entries: [{ en: 'brightMirror' }] }
      }
    ];
    const props = {
      announcementContent: {
        title: 'Instruction',
        body: 'Participez à la création de fiction'
      },
      isUserConnected: false,
      ideaId: 0,
      refetchIdea: Function,
      posts: [],
      timeline: timeline,
      identifier: 'brightMirror'
    };
    const shallowRenderer = new ShallowRenderer();
    shallowRenderer.render(<InstructionView {...props} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });
});