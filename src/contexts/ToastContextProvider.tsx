import { Fragment, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

function ToastContainerContextProvider({ children }: { children: ReactNode }) {
  return (
    <Fragment>
      {children}
      <ToastContainer />
    </Fragment>
  );
}

export default ToastContainerContextProvider;
