import { Fragment, ReactNode } from 'react';

import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import Header from './components/header';
import './main.css';

function MainLayoutNoSideBar({ children }: MainLayoutNoSideBar) {
  const { isMobile } = useMobileContext();

  return (
    <Fragment>
      <Header />
      <main
        className={`${
          isMobile
            ? 'h-[calc(100vh_-_60px)] top-[60px] w-screen'
            : ' top-header-height h-[calc(100vh_-_var(--default-layout-header-height))]'
        } absolute left-0  w-full flex`}
      >
        {children}
      </main>
    </Fragment>
  );
}
interface MainLayoutNoSideBar {
  children: ReactNode;
}
export default MainLayoutNoSideBar;
