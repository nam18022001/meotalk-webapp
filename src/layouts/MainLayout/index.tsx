import { Fragment, ReactNode } from 'react';

import './main.css';
import Header from './components/header';
import SideBar from './components/sidebar';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import config from '~/configs';

function MainLayout({ children }: MainLayoutProps) {
  const { isMobile } = useMobileContext();

  return (
    <Fragment>
      {isMobile ? window.location.pathname === config.routes.home && <Header /> : <Header />}
      <main
        className={`${
          isMobile
            ? window.location.pathname === config.routes.home
              ? 'top-[60px] w-screen h-[calc(100vh_-_60px)]'
              : 'h-screen top-0 w-screen'
            : ' top-header-height h-[calc(100vh_-_var(--default-layout-header-height))]'
        } absolute left-0  w-full flex`}
      >
        {isMobile ? window.location.pathname === config.routes.home && <SideBar /> : <SideBar />}
        {isMobile && window.location.pathname === config.routes.home ? <Fragment></Fragment> : children}
      </main>
    </Fragment>
  );
}
interface MainLayoutProps {
  children: ReactNode;
}
export default MainLayout;
