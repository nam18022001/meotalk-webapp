import { Fragment, ReactNode } from 'react';
import './login.css';

function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <Fragment>
      <div className="wrapper">
        <div className="container">
          <main>
            <div className="wave"></div>
            <div className="content">{children}</div>
          </main>
        </div>
      </div>
    </Fragment>
  );
}

interface LoginLayoutProps {
  children: ReactNode;
}

export default LoginLayout;
