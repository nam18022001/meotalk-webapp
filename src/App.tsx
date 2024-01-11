import { Fragment } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import './App.css';
import { useAuthContext } from './contexts/AuthContextProvider';
import LoginLayout from './layouts/LoginLayout';
import MainLayout from './layouts/MainLayout';
import RedirectErrorPage from './pages/errors/404';
import PrivatedRoutes from './protects/PrivatedRoutes';
import PublicRoutes from './protects/PublicRoutes';
import { privateRoutes, publicRoutes } from './routes';

function App() {
  const { currentUser } = useAuthContext();

  return (
    <Router>
      <Routes>
        {/* Private Route */}
        {privateRoutes.map((route: any, index: number) => {
          let Layout: any = MainLayout;
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
                <PrivatedRoutes user={currentUser}>
                  <Layout>
                    <Page />
                  </Layout>
                </PrivatedRoutes>
              }
            />
          );
        })}
        {/* Public Route */}
        {publicRoutes.map((route: any, index: number) => {
          const Page = route.component;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <PublicRoutes user={currentUser}>
                  <LoginLayout>
                    <Page />
                  </LoginLayout>
                </PublicRoutes>
              }
            />
          );
        })}
        <Route path="*" element={<RedirectErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
