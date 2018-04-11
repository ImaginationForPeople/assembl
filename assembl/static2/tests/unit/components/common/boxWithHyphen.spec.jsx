import React from 'react';
import renderer from 'react-test-renderer';

import BoxWithHyphen from '../../../../js/app/components/common/boxWithHyphen';
import '../../../helpers/setupTranslations';

describe('BoxWithHyphen component', () => {
  it('should render a box with hyphen with its data', () => {
    const props = {
      additionalContainerClassNames: 'foobar',
      body: 'Lorem ipsum dolor sit amet',
      date: '2017-01-01T21:05:25.085948Z',
      href: 'http://www.example.com/foobar',
      hyphenStyle: {
        borderColorTop: 'red'
      },
      subject: 'Foobar',
      title: 'Synthesis'
    };
    const component = renderer.create(<BoxWithHyphen {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should not render a link that wraps the box if href is empty', () => {
    const props = {
      additionalContainerClassNames: 'foobar',
      body: 'Lorem ipsum dolor sit amet',
      date: '2017-01-01T21:05:25.085948Z',
      href: '',
      hyphenStyle: {
        borderColorTop: 'red'
      },
      subject: 'Foobar',
      title: 'Synthesis'
    };
    const component = renderer.create(<BoxWithHyphen {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});