import { addDoc, getDoc, getDocs, orderBy, query, startAfter } from 'firebase/firestore';
import { collectChats, docUsers } from './generalFirestoreServices';

const usersInfo = async ({ data, currentUser }: usersInfoProps) => {
  let infoUsers = [];
  for (let i = 0; i < data.usersUid.length; i++) {
    if (data.usersUid[i] !== currentUser.uid) {
      const uid = data.usersUid[i];
      const getUserDoc = docUsers(uid);
      const getUserInfo = await getDoc(getUserDoc);
      getUserInfo.exists() && infoUsers.push(getUserInfo.data());
    }
  }
  return infoUsers;
};
const getCollectionChatRoom = ({ chatRoomId, start, limit }: getCollectionChatRoomProps) => {
  const getCollectionMess = collectChats(chatRoomId);

  const qMess = start
    ? query(getCollectionMess, orderBy('stt', 'desc'), startAfter(start), limit(20))
    : limit
    ? query(getCollectionMess, orderBy('stt', 'desc'), limit(limit))
    : query(getCollectionMess, orderBy('stt', 'desc'));
  return qMess;
};

const addMessage = async ({
  collectChat,
  data,
  currentUser,
  dataLast,
  image = false,
  call = false,
  isGroup = false,
  callVideo = false,
  photoSender = '',
}: addMessageProps) => {
  return await addDoc(collectChat, {
    isRead: isGroup ? [] : false,
    message: data,
    sendBy: currentUser.email,
    stt: dataLast.stt + 1,
    time: Date.now(),
    type: image ? 'image' : call ? 'call' : callVideo ? 'videoCall' : 'message',
    photoSender: isGroup && photoSender,
  });
};

const addFirstMessage = async ({
  collectChat,
  data,
  currentUser,
  image = false,
  isGroup = false,
  call = false,
  callVideo = false,
  photoSender = '',
}: addFirstMessageProps) => {
  return await addDoc(collectChat, {
    isRead: isGroup ? [] : false,
    message: data,
    sendBy: currentUser.email,
    stt: 0,
    time: Date.now(),
    type: image ? 'image' : call ? 'call' : callVideo ? 'videoCall' : 'message',
    photoSender: isGroup && photoSender,
  });
};
const getlastMessage = async ({ collectChat }: { collectChat: any }) => {
  const orderStt = query(collectChat, orderBy('stt', 'desc'));
  const getOrderStt = await getDocs(orderStt);

  const lastVisible = getOrderStt.docs[0];
  const dataLast = lastVisible.data();

  return dataLast;
};

const addPrivateMessage = async ({
  collectChat,
  data,
  currentUser,
  image = false,
  notification = false,
}: addMessagePrivateProps) => {
  return await addDoc(collectChat, {
    isRead: false,
    message: data,
    sendBy: currentUser.email,
    time: Date.now(),
    type: image ? 'image' : notification ? 'notification' : 'message',
  });
};
export { addFirstMessage, addMessage, getCollectionChatRoom, getlastMessage, usersInfo, addPrivateMessage };

interface addFirstMessageProps {
  collectChat: any;
  data: string;
  currentUser: any;
  isGroup?: boolean;
  image?: boolean;
  call?: boolean;
  callVideo?: boolean;
  photoSender?: string;
}
interface addMessageProps {
  collectChat: any;
  data: string;
  currentUser: any;
  dataLast: any;
  isGroup?: boolean;
  image?: boolean;
  callVideo?: boolean;
  call?: boolean;
  photoSender?: string;
}
interface addMessagePrivateProps {
  collectChat: any;
  data: string;
  currentUser: any;
  notification?: boolean;
  image?: boolean;
}
interface usersInfoProps {
  data: any;
  currentUser: any;
}
interface getCollectionChatRoomProps {
  chatRoomId: string;
  limit?: any;
  start?: any;
}
