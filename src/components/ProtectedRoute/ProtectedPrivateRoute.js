import { memo } from 'react';
import { Navigate } from 'react-router-dom';
import config from '~/configs';

function ProtectedPrivateRoute({ user, children }) {
  return !user ? <Navigate to={config.routes.login} /> : children;
}

export default memo(ProtectedPrivateRoute);
