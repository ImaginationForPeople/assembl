import { fromJS, List, Map } from 'immutable';

import {
  CREATE_RESOURCE,
  UPDATE_RESOURCE_EMBED_CODE,
  UPDATE_RESOURCE_TEXT,
  UPDATE_RESOURCE_TITLE
} from '../../../../js/app/actions/actionTypes';
import * as reducers from '../../../../js/app/reducers/adminReducer/resourcesCenter';

describe('resourcesCenter admin reducers', () => {
  describe('resourcesInOrder reducer', () => {
    const { resourcesInOrder } = reducers;
    it('should return the initial state', () => {
      const action = {};
      expect(resourcesInOrder(undefined, action)).toEqual(List());
    });

    it('should return the current state for other actions', () => {
      const action = { type: 'FOOBAR' };
      const oldState = List(['0', '1']);
      expect(resourcesInOrder(oldState, action)).toEqual(oldState);
    });

    it('should handle CREATE_RESOURCE action type', () => {
      const action = {
        id: '-3344789',
        order: 3,
        type: CREATE_RESOURCE
      };
      const oldState = List(['0', '1']);
      const expected = List(['0', '1', '-3344789']);
      const newState = resourcesInOrder(oldState, action);
      expect(newState).toEqual(expected);
    });
  });

  describe('resourcesById reducer', () => {
    const { resourcesById } = reducers;
    it('should return the initial state', () => {
      const action = {};
      expect(resourcesById(undefined, action)).toEqual(Map());
    });

    it('should return the current state for other actions', () => {
      const action = { type: 'FOOBAR' };
      const oldState = Map({ 1: { id: '1', titleEntries: [] } });
      expect(resourcesById(oldState, action)).toEqual(oldState);
    });

    it('should handle CREATE_RESOURCE action type', () => {
      const action = {
        id: '-3344789',
        order: 3,
        type: 'CREATE_RESOURCE'
      };
      const oldState = fromJS({
        0: {
          id: '0'
        },
        1: {
          id: '1'
        }
      });
      const expected = {
        0: {
          id: '0'
        },
        1: {
          id: '1'
        },
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [],
          textEntries: [],
          embedCode: '',
          order: 3
        }
      };
      const newState = resourcesById(oldState, action);
      expect(newState.toJS()).toEqual(expected);
    });

    it('should handle UPDATE_RESOURCE_EMBED_CODE action type', () => {
      const oldState = fromJS({
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [],
          textEntries: [],
          embedCode: '<iframe ... />',
          order: 3
        }
      });
      const expected = {
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [],
          textEntries: [],
          embedCode: '<iframe src="http://www.example.com/greatslides" />',
          order: 3
        }
      };
      const action = {
        id: '-3344789',
        value: '<iframe src="http://www.example.com/greatslides" />',
        type: UPDATE_RESOURCE_EMBED_CODE
      };
      const actual = resourcesById(oldState, action);
      expect(actual.toJS()).toEqual(expected);
    });

    it('should handle UPDATE_RESOURCE_TEXT action type', () => {
      const oldState = fromJS({
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [],
          textEntries: [{ localeCode: 'fr', value: 'texte en français' }, { localeCode: 'en', value: 'text in english' }],
          embedCode: '',
          order: 3
        }
      });
      const expected = {
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [],
          textEntries: [{ localeCode: 'fr', value: 'nouvelle valeur' }, { localeCode: 'en', value: 'text in english' }],
          embedCode: '',
          order: 3
        }
      };
      const action = {
        id: '-3344789',
        locale: 'fr',
        value: 'nouvelle valeur',
        type: UPDATE_RESOURCE_TEXT
      };
      const actual = resourcesById(oldState, action);
      expect(actual.toJS()).toEqual(expected);
    });

    it('should handle UPDATE_RESOURCE_TITLE action type', () => {
      const oldState = fromJS({
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [{ localeCode: 'fr', value: 'en français' }, { localeCode: 'en', value: 'in english' }],
          textEntries: [],
          embedCode: '',
          order: 3
        }
      });
      const expected = {
        '-3344789': {
          id: '-3344789',
          isNew: true,
          toDelete: false,
          titleEntries: [{ localeCode: 'fr', value: 'nouvelle valeur' }, { localeCode: 'en', value: 'in english' }],
          textEntries: [],
          embedCode: '',
          order: 3
        }
      };
      const action = {
        id: '-3344789',
        locale: 'fr',
        value: 'nouvelle valeur',
        type: UPDATE_RESOURCE_TITLE
      };
      const actual = resourcesById(oldState, action);
      expect(actual.toJS()).toEqual(expected);
    });
  });
});