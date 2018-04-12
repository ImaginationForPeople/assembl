import React from 'react';
import renderer from 'react-test-renderer';

import { DumbPageForm } from '../../../../../js/app/components/administration/resourcesCenter/pageForm';
import '../../../../helpers/setupTranslations';

describe('DumbPageForm component', () => {
  it('should render a form to update the resources center page title and header', () => {
    const handleHeaderImageChangeSpy = jest.fn(() => {});
    const handlePageTitleChangeSpy = jest.fn(() => {});
    const props = {
      handleHeaderImageChange: handleHeaderImageChangeSpy,
      handlePageTitleChange: handlePageTitleChangeSpy,
      headerMimeType: 'image/jpeg',
      headerUrl: 'http://www.example.com/documents/myimage/data',
      editLocale: 'fr',
      title: 'Centre de ressources',
      disabled: false
    };
    const component = renderer.create(<DumbPageForm {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});