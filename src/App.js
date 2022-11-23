import { Fragment, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { publicRoutes, privateRoutes } from '~/routes';
import MainLayout from '~/layouts/MainLayout';
import LoginLayout from '~/layouts/LoginLayout';
import { ProtectedPrivateRoute, ProtectedPublicRoute } from '~/components/ProtectedRoute';
import { AuthContext } from '~/contexts/AuthContext';

function App() {
  const { currentUser } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Private Route */}
          {privateRoutes.map((route, index) => {
            let Layout = MainLayout;
            if (route.layout !== null) {
              Layout = route.layout ? route.layout : MainLayout;
            } else {
              Layout = Fragment;
            }
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <ProtectedPrivateRoute user={currentUser}>
                    <Layout>
                      <Page />
                    </Layout>
                  </ProtectedPrivateRoute>
                }
              />
            );
          })}
          {/* Public Route */}
          {publicRoutes.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <ProtectedPublicRoute user={currentUser}>
                    <LoginLayout>
                      <Page />
                    </LoginLayout>
                  </ProtectedPublicRoute>
                }
              />
            );
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
