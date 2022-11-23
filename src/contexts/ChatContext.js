import { collection } from 'firebase/firestore';
import { createContext, useState, useEffect } from 'react';

import { db } from '~/services/FirebaseServices';

export const ChatContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const docChatRoom = collection(db, 'ChatRoom');

  useEffect(() => {}, []);

  return <ChatContext.Provider>{children}</ChatContext.Provider>;
};
