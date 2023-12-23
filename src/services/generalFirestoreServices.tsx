import { collection, doc } from 'firebase/firestore';
import { db } from './FirebaseServices';

const docUsers = (uid: string) => {
  return doc(db, 'users', uid);
};

const collectChatRoom = () => {
  return collection(db, 'ChatRoom');
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
const docMyFriends = (uid: string, uidFr: string) => {
  return doc(db, 'users', uid, 'friends', uidFr);
};
const collectionMakeFriends = () => {
  return collection(db, 'makeFriends');
};
const docMakeFriends = (id: string) => {
  return doc(db, 'makeFriends', id);
};

const makeDocMakeFriends = (currentUser: any, data: any) => {
  return doc(db, 'makeFriends', `${currentUser.uid}_${data.uid}`);
};

const collectListFriend = (id: string) => {
  return collection(db, 'users', id, 'friends');
};

export {
  docUsers,
  collectChatRoom,
  collectChats,
  docChatRoom,
  docCall,
  collectionFriends,
  collectionMakeFriends,
  docMakeFriends,
  makeDocMakeFriends,
  docMyFriends,
  collectListFriend,
};
