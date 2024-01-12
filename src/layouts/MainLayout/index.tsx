import { Fragment, ReactNode } from 'react';

import './main.css';
import Header from './components/header';
import SideBar from './components/sidebar';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import config from '~/configs';
import SideBarPrivate from './components/sidebarprivate';

function MainLayout({ children }: MainLayoutProps) {
  const { isMobile } = useMobileContext();

  return (
    <Fragment>
      {isMobile ? (
        (window.location.pathname === config.routes.home ||
          window.location.pathname.startsWith(config.routes.homePrivate)) && <Header />
      ) : (
        <Header />
      )}
      <main
        className={`${
          isMobile
            ? window.location.pathname === config.routes.home || window.location.pathname === config.routes.homePrivate
              ? 'top-[60px] w-screen h-[calc(100vh_-_60px)]'
              : 'h-[calc(100vh_-_calc(100vh_-_100%))] top-0 w-screen'
            : 'top-header-height h-[calc(100vh_-_var(--default-layout-header-height))]'
        } absolute left-0  w-full flex`}
      >
        {isMobile
          ? window.location.pathname === config.routes.home && <SideBar />
          : !window.location.pathname.startsWith(config.routes.homePrivate) && <SideBar />}
        {isMobile
          ? window.location.pathname === config.routes.homePrivate && <SideBarPrivate />
          : window.location.pathname.startsWith(config.routes.homePrivate) && <SideBarPrivate />}
        {isMobile &&
        (window.location.pathname === config.routes.home || window.location.pathname === config.routes.homePrivate) ? (
          <Fragment></Fragment>
        ) : (
          children
        )}
      </main>
    </Fragment>
  );
}
interface MainLayoutProps {
  children: ReactNode;
}
export default MainLayout;
