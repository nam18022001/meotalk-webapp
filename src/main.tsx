import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-toastify/dist/ReactToastify.css';

import MenuContextProfiver from './contexts/MenuContextProvider.tsx';
import AuthContextProfiver from './contexts/AuthContextProvider.tsx';
import PreloadSideBarProvider from './contexts/PreloadSideBarProvider.tsx';
import CallContextProvider from './contexts/CallContextProvider.tsx';
import MobileVersionProvider from './contexts/MobileVersionContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MobileVersionProvider>
    <AuthContextProfiver>
      <CallContextProvider>
        <MenuContextProfiver>
          <PreloadSideBarProvider>
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </PreloadSideBarProvider>
        </MenuContextProfiver>
      </CallContextProvider>
    </AuthContextProfiver>
  </MobileVersionProvider>,
);
