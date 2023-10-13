import { ReactNode, memo } from 'react';
import { Navigate } from 'react-router-dom';
import config from '~/configs';

function PrivatedRoutes({ user, children }: PrivatedRoutesProps) {
  return user.uid === '' ? <Navigate to={config.routes.login} /> : children;
}

export default memo(PrivatedRoutes);
interface PrivatedRoutesProps {
  user: any;
  children: ReactNode;
}
