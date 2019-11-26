import React from 'react';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { FiltersDropdown } from '../../../../../js/app/components/debate/common/postsFilter/filtersDropdown';
import PostsFilterMenu from '../../../../../js/app/components/debate/common/postsFilter/thread/menu';
import {
  defaultDisplayPolicy,
  defaultOrderPolicy,
  defaultPostsFiltersStatus,
  reverseChronologicalTopPolicy,
  summaryDisplayPolicy
} from '../../../../../js/app/components/debate/common/postsFilter/policies';
import {
  postsDisplayPolicies,
  postsFiltersPolicies,
  postsOrderPolicies
} from '../../../../../js/app/components/debate/common/postsFilter/thread/policies';

configure({ adapter: new Adapter() });

jest.mock('../../../../../js/app/utils/globalFunctions', () => ({
  getConnectedUserId: jest.fn(() => '1234567890')
}));

describe('PostsFilterMenu component', () => {
  const mockStore = configureStore();
  const initialState = {
    threadFilter: {
      postsOrderPolicy: defaultOrderPolicy,
      postsFiltersStatus: defaultPostsFiltersStatus,
      postsDisplayPolicy: defaultDisplayPolicy
    }
  };
  const props = {};
  let store;
  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('should render a filter with sort by recently started threads and full display selected', () => {
    const component = renderer.create(<PostsFilterMenu store={store} {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should rollback when reset is clicked', () => {
    const wrapper = mount(<PostsFilterMenu {...props} store={store} />);

    const defaultSortItem = () => wrapper.find('div#postsFilterItem-reverseChronologicalLast');
    const nonDefaultSortItem = () => wrapper.find('div#postsFilterItem-reverseChronologicalTop');
    const defaultDisplayItem = () => wrapper.find('div#postsFilterItem-display-full');
    const nonDefaultDisplayItem = () => wrapper.find('div#postsFilterItem-display-summary');
    const onlyMyPostsItem = () => wrapper.find('div#postsFilterItem-filter-onlyMyPosts');

    const resetButton = () => wrapper.find('button#postsFilter-button-reset');

    nonDefaultSortItem().simulate('click');
    nonDefaultDisplayItem().simulate('click');
    expect(
      nonDefaultSortItem()
        .find('input')
        .props().checked
    ).toBe(true);
    expect(
      nonDefaultDisplayItem()
        .find('input')
        .props().checked
    ).toBe(true);

    resetButton().simulate('click');
    expect(
      nonDefaultSortItem()
        .find('input')
        .props().checked
    ).toBe(false);
    expect(
      nonDefaultDisplayItem()
        .find('input')
        .props().checked
    ).toBe(false);
    expect(
      defaultSortItem()
        .find('input')
        .props().checked
    ).toBe(true);
    expect(
      defaultDisplayItem()
        .find('input')
        .props().checked
    ).toBe(true);
    expect(
      onlyMyPostsItem()
        .find('input')
        .props().checked
    ).toBe(false);
  });

  it('should be saved when saved is clicked', () => {
    const setPostsFilterPolicies = jest.fn();
    const component = (
      <FiltersDropdown
        postsDisplayPolicy={defaultDisplayPolicy}
        postsOrderPolicy={defaultOrderPolicy}
        postsFiltersStatus={defaultPostsFiltersStatus}
        setPostsFilterPolicies={setPostsFilterPolicies}
        postsFiltersPolicies={postsFiltersPolicies}
        postsOrderPolicies={postsOrderPolicies}
        postsDisplayPolicies={postsDisplayPolicies}
      />
    );
    const wrapper = mount(component);

    const nonDefaultSortItem = () => wrapper.find('div#postsFilterItem-reverseChronologicalTop');
    const nonDefaultDisplayItem = () => wrapper.find('div#postsFilterItem-display-summary');
    const onlyMyPostsItem = () => wrapper.find('div#postsFilterItem-filter-onlyMyPosts');
    const saveButton = () => wrapper.find('button#postsFilter-button-save');

    nonDefaultSortItem().simulate('click');
    nonDefaultDisplayItem().simulate('click');
    onlyMyPostsItem().simulate('click');
    saveButton().simulate('click');
    expect(setPostsFilterPolicies).toHaveBeenCalledTimes(1);
    expect(setPostsFilterPolicies).toHaveBeenCalledWith(summaryDisplayPolicy, reverseChronologicalTopPolicy, {
      myPostsAndAnswers: false,
      onlyMyPosts: true
    });
  });
});