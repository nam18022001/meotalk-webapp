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
const makeNewConversationPrivate = async ({
  usersEmail,
  usersUid,
  usersPhoto,
  usersDisplayName,
  chatRoomId,
  sender,
  reciever,
  key,
}: makeConversationPrivateProps) => {
  return await setDoc(doc(db, 'ChatPrivate', `${chatRoomId}`), {
    chatRoomID: `${chatRoomId}`,
    time: Date.now(),
    isGroup: false,
    usersEmail: usersEmail,
    usersUid: usersUid,
    usersPhoto,
    usersDisplayName,
    isAccepted: false,
    sender,
    reciever,
    key,
    unSeenReciever: 1,
    unSeenSender: 0,
  });
};
export { makeNewConversation, makeNewConversationPrivate };

interface makeConversationProps {
  isGroup?: boolean;
  chatRoomId: string;
  usersEmail: any[];
  usersUid: any[];
}
export interface makeConversationPrivateProps {
  isGroup?: boolean;
  chatRoomId: string;
  usersEmail: any[];
  usersPhoto: any[];
  usersDisplayName: any[];
  usersUid: any[];
  sender: string;
  reciever: string;
  key: string;
}
