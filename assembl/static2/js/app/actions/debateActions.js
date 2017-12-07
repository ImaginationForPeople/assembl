import { getDebateData } from '../services/debateService';

const loadingDebateData = () => ({
  type: 'FETCH_DEBATE_DATA',
  debateData: null
});

const resolvedFetchDebateData = debateData => ({
  type: 'RESOLVED_FETCH_DEBATE_DATA',
  debateData: debateData
});

const failedFetchDebateData = error => ({
  type: 'FAILED_FETCH_DEBATE_DATA',
  debateError: error
});

// In future, if unauthorzed is supposed to be treated differently
const unauthorizedDebateData = {
  type: 'UNAUTHORIZED_DEBATE_DATA'
};

export const fetchDebateData = debateId =>
  function (dispatch) {
    dispatch(loadingDebateData());
    return getDebateData(debateId).then(
      (debateData) => {
        dispatch(resolvedFetchDebateData(debateData));
      },
      (error) => {
        const firstError = error[0];
        if (firstError.status === 401) {
          dispatch(unauthorizedDebateData);
        } else {
          dispatch(failedFetchDebateData(error));
        }
      }
    );
  };