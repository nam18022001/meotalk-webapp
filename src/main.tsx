import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import './index.css';

import AuthContextProfiver from './contexts/AuthContextProvider.tsx';
import CallContextProvider from './contexts/CallContextProvider.tsx';
import MenuContextProfiver from './contexts/MenuContextProvider.tsx';
import MobileVersionProvider from './contexts/MobileVersionContextProvider.tsx';
import PreloadSideBarProvider from './contexts/PreloadSideBarProvider.tsx';

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
