import { useContext } from 'react';
import { CallContext } from '~/contexts/CallContext';

const useStore = () => {
  const [statecall, dispatchCall] = useContext(CallContext);
  console.log(statecall);
  return [statecall, dispatchCall];
};

export default useStore;
