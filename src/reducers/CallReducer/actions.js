const { DELETE_CALL } = require('./constants');

export const deleteCall = (payload) => {
  return {
    type: DELETE_CALL,
    payload,
  };
};
