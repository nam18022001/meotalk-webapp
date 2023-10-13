import { addDoc, getDoc, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
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
}: addMessageProps) => {
  return await addDoc(collectChat, {
    isRead: isGroup ? [] : false,
    message: data,
    sendBy: currentUser.email,
    stt: dataLast.stt + 1,
    time: Date.now(),
    type: image ? 'image' : call ? 'call' : callVideo ? 'videoCall' : 'message',
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
}: addFirstMessageProps) => {
  return await addDoc(collectChat, {
    isRead: isGroup ? [] : false,
    message: data,
    sendBy: currentUser.email,
    stt: 0,
    time: Date.now(),
    type: image ? 'image' : call ? 'call' : callVideo ? 'videoCall' : 'message',
  });
};
const getlastMessage = async ({ collectChat }: { collectChat: any }) => {
  const orderStt = query(collectChat, orderBy('stt', 'desc'));
  const getOrderStt = await getDocs(orderStt);

  const lastVisible = getOrderStt.docs[0];
  const dataLast = lastVisible.data();

  return dataLast;
};
export { addFirstMessage, addMessage, getCollectionChatRoom, usersInfo, getlastMessage };

interface addFirstMessageProps {
  collectChat: any;
  data: string;
  currentUser: any;
  isGroup?: boolean;
  image?: boolean;
  call?: boolean;
  callVideo?: boolean;
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
