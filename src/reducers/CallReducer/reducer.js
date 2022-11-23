import { DELETE_CALL } from './constants';

export const initStateCall = {
  isEndCall: false,
};

const callReducer = (state, action) => {
  switch (action.type) {
    case DELETE_CALL:
      return {
        isEndCall: action.payload,
      };
    default:
      throw new Error('Invalid action');
  }
};

export default callReducer;
