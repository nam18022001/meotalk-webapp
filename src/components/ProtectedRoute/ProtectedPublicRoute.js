import { memo } from 'react';
import { Navigate } from 'react-router-dom';
import config from '~/configs';

function ProtectedPublicRoute({ user, children }) {
  return !user ? children : <Navigate to={config.routes.home} />;
}

export default memo(ProtectedPublicRoute);
