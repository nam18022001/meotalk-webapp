import { Fragment, ReactNode } from 'react';

function CallLayout({ children }: CallLayoutProps) {
  return (
    <Fragment>
      <div className="w-screen h-screen">{children}</div>
    </Fragment>
  );
}
interface CallLayoutProps {
  children?: ReactNode;
}
export default CallLayout;
