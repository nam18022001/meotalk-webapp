import { collection, deleteDoc, doc, query, setDoc, where } from 'firebase/firestore';
import { db } from './FirebaseServices';

const searchUser = (value: string) => {
  const q = query(collection(db, 'users'), where('keyWord', 'array-contains', value));
  return q;
};
const addFriend = async ({ doc, sender, reciever }: addFriendProps) => {
  return await setDoc(doc, {
    emailSender: sender.email,
    photoSender: sender.photoURL,
    nameSender: sender.displayName,
    sender: sender.uid,
    reciever: reciever.uid,
    emailReciever: reciever.email,
    photoReciever: reciever.photoURL,
    nameReciever: reciever.displayName,
  });
};
const acceptFriend = async ({ friendsDoc, recieveFriendDoc, sender, reciever }: acceptFriendProps) => {
  await setDoc(friendsDoc, {
    uid: reciever.uid,
    displayName: reciever.displayName,
    email: reciever.email,
    photoURL: reciever.photoURL,
  });
  await setDoc(
    doc(
      db,
      'users',
      typeof reciever.uid === 'string' ? reciever.uid : '',
      'friends',
      typeof sender.uid === 'string' ? sender.uid : '',
    ),
    {
      uid: sender.uid,
      displayName: sender.displayName,
      email: sender.email,
      photoURL: sender.photoURL,
    },
  );
  await deleteDoc(recieveFriendDoc);
};

const makeConversation = async ({ currentUser, data, isGroup = false }: makeConversationProps) => {
  await setDoc(doc(db, 'ChatRoom', `${currentUser.uid}_${data.uid}`), {
    chatRoomID: `${currentUser.uid}_${data.uid}`,
    time: Date.now(),
    isGroup: isGroup,
    usersEmail: [currentUser.email, data.email],
    usersUid: [currentUser.uid, data.uid],
  });
};
export { searchUser, addFriend, acceptFriend, makeConversation };

interface addFriendProps {
  doc: any;
  sender: {
    email: string | null;
    photoURL: string | null;
    displayName: string | null;
    uid: string | null;
  };
  reciever: {
    email: string | null;
    photoURL: string | null;
    displayName: string | null;
    uid: string | null;
  };
}
interface acceptFriendProps {
  friendsDoc: any;
  recieveFriendDoc: any;
  sender: {
    email: string | null | '';
    photoURL: string | null | '';
    displayName: string | null | '';
    uid: string | null | '';
  };
  reciever: {
    email: string | null | '';
    photoURL: string | null | '';
    displayName: string | null | '';
    uid: string | null | '';
  };
}
interface makeConversationProps {
  isGroup?: boolean;
  currentUser: {
    email: string | null | '';
    photoURL: string | null | '';
    displayName: string | null | '';
    uid: string | null | '';
  };
  data: {
    email: string | null | '';
    photoURL: string | null | '';
    displayName: string | null | '';
    uid: string | null | '';
  };
}
