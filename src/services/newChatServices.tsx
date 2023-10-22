import { doc, setDoc } from 'firebase/firestore';
import { db } from './FirebaseServices';

const makeNewConversation = async ({ usersEmail, usersUid, chatRoomId, isGroup = false }: makeConversationProps) => {
  return await setDoc(doc(db, 'ChatRoom', `${chatRoomId}`), {
    chatRoomID: `${chatRoomId}`,
    chatRoomName: isGroup && '',
    time: Date.now(),
    isGroup: isGroup,
    usersEmail: usersEmail,
    usersUid: usersUid,
  });
};
export { makeNewConversation };

interface makeConversationProps {
  isGroup?: boolean;
  chatRoomId: string;
  usersEmail: any[];
  usersUid: any[];
}
