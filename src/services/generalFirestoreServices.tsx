import { collection, doc } from 'firebase/firestore';
import { db } from './FirebaseServices';

const docUsers = (uid: string) => {
  return doc(db, 'users', uid);
};

const collectChats = (chatRoomID: string) => {
  return collection(db, 'ChatRoom', chatRoomID, 'chats');
};
const docChatRoom = (idChatRoom: string) => {
  return doc(db, 'ChatRoom', idChatRoom);
};
const docCall = (idCallRoom: string) => {
  return doc(db, 'call', idCallRoom);
};
const collectionFriends = (uid: string) => {
  return collection(db, 'users', uid, 'friends');
};
export { docUsers, collectChats, docChatRoom, docCall, collectionFriends };
