import { doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '~/services/FirebaseServices';
import { collectChats } from '~/services/generalFirestoreServices';

const handleReadMessages = async ({
  chatRoomId,
  userInfo,
  currentUser,
}: {
  chatRoomId: string;
  userInfo: any[];
  currentUser: any;
}) => {
  const getCollectionMess = collectChats(chatRoomId);
  if (userInfo.length > 0) {
    if (userInfo.length > 1) {
      const queryCollect = query(getCollectionMess, where('sendBy', '!=', currentUser.email));
      const getDocsMess = await getDocs(queryCollect);
      if (!getDocsMess.empty) {
        getDocsMess.forEach(async (res) => {
          if (res.data().isRead.filter((read: any) => read.seenBy === currentUser.email).length === 0) {
            await updateDoc(doc(db, 'ChatRoom', chatRoomId, 'chats', res.id), {
              isRead: [
                ...res.data().isRead,
                {
                  seenBy: currentUser.email,
                  photoURL: currentUser.photoURL,
                },
              ],
            });
          }
        });
      }
    } else {
      const queryCollect = query(getCollectionMess, where('sendBy', '==', userInfo[0].email));
      const getDocsMess = await getDocs(queryCollect);
      if (!getDocsMess.empty) {
        getDocsMess.forEach(async (res) => {
          await updateDoc(doc(db, 'ChatRoom', chatRoomId, 'chats', res.id), {
            isRead: true,
          });
        });
      }
    }
  }
};

export { handleReadMessages };
