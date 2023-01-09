import { setDoc, doc, collection } from 'firebase/firestore';

import { useCreateKeyWords as fncCreateKeyWords } from '~/hooks';
import { db } from './FirebaseServices';

const addUser = async (currentUser) => {
  const keyWord = fncCreateKeyWords(currentUser.email);
  const userCollect = doc(db, 'users', currentUser.uid);
  const data = {
    uid: currentUser.uid,
    displayName: currentUser.displayName,
    email: currentUser.email,
    photoURL: currentUser.photoURL,
    fcmToken: '',
    keyWord: keyWord,
  };
  try {
    await setDoc(userCollect, data);
  } catch (error) {
    console.error(error);
  }
};

const docUsers = (uid) => {
  return doc(db, 'users', uid);
};
const docChatRoom = (idChatRoom) => {
  return doc(db, 'ChatRoom', idChatRoom);
};

const docCall = (idCallRoom) => {
  return doc(db, 'call', idCallRoom);
};

const collectChats = (chatRoomID) => {
  return collection(db, 'ChatRoom', chatRoomID, 'chats');
};

export { addUser, docUsers, collectChats, docChatRoom, docCall };
