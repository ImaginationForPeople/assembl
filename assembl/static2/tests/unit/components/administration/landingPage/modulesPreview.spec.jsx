import React from 'react';
import renderer from 'react-test-renderer';
import { List } from 'immutable';

import ModulesPreview from '../../../../../js/app/components/administration/landingPage/modulesPreview';
import { enabledModulesInOrder } from './fakeData';
import '../../../../helpers/setupTranslations';

describe('ModulesPreview component', () => {
  it('should render a preview of the enabled modules', () => {
    const moveModuleDownSpy = jest.fn(() => {});
    const moveModuleUpSpy = jest.fn(() => {});
    const props = {
      modules: enabledModulesInOrder,
      moveModuleDown: moveModuleDownSpy,
      moveModuleUp: moveModuleUpSpy
    };
    const component = renderer.create(<ModulesPreview {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display nothing if modules are empty', () => {
    const props = {
      modules: List()
    };
    const component = renderer.create(<ModulesPreview {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});