import { collection, orderBy, query, where } from 'firebase/firestore';
import { db } from './FirebaseServices';

const getListChat = ({ currentUser }: getChatRoomProps) =>
  query(collection(db, 'ChatRoom'), where('usersEmail', 'array-contains', currentUser.email), orderBy('time', 'desc'));

interface getChatRoomProps {
  currentUser: {
    email: string | null | '';
    photoURL: string | null | '';
    displayName: string | null | '';
    uid: string | null | '';
  };
}
export { getListChat };
