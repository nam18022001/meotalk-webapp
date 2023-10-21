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
import AddConversationContextProvider from './contexts/AddConversationContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MobileVersionProvider>
    <AuthContextProfiver>
      <CallContextProvider>
        <MenuContextProfiver>
          <PreloadSideBarProvider>
            <AddConversationContextProvider>
              <React.StrictMode>
                <App />
              </React.StrictMode>
            </AddConversationContextProvider>
          </PreloadSideBarProvider>
        </MenuContextProfiver>
      </CallContextProvider>
    </AuthContextProfiver>
  </MobileVersionProvider>,
);
