import { query, where } from 'firebase/firestore';
import { collectionMakeFriends } from './generalFirestoreServices';

export const queryGetMyRequests = (id: string) => {
  return query(collectionMakeFriends(), where('sender', '==', id));
};
export const queryGetFriendRequests = (id: string) => {
  return query(collectionMakeFriends(), where('reciever', '==', id));
};
