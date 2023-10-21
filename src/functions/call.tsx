import { getDocs, updateDoc } from 'firebase/firestore';
import sendNotifiCation from '~/hooks/useSendNotification';
import { toastError } from '~/hooks/useToast';
import { addCallMessages, checkCallExist, getTokenCallerAndRevicer } from '~/services/callServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';

const handleClickCall = async () => {};
const handleClickCallVideo = async ({ chatRoomId, userInfo, currentUser }: VideoCallProps) => {
  const channelName = chatRoomId;

  if (userInfo.length > 1) {
    let parnerInCall: boolean = false;

    for (let i = 0; i < userInfo.length; i++) {
      let check;
      const qCall = checkCallExist({ uid: userInfo[i].uid, isGroup: true });

      for (let i = 0; i < qCall.length; i++) {
        const abc = await getDocs(qCall[i]);
        if (abc.empty === false) {
          parnerInCall = true;
          check = true;
          break;
        }
      }
      if (check === true) {
        break;
      }
    }

    if (!parnerInCall) {
      console.log('call group');
    } else {
      toastError(`Some one in a Call`);
    }
  } else {
    let parnerInCall: boolean = false;

    const qCall = checkCallExist({ uid: userInfo[0].uid });

    for (let i = 0; i < qCall.length; i++) {
      const abc = await getDocs(qCall[i]);
      if (abc.empty === false) {
        parnerInCall = true;
        break;
      }
    }
    if (!parnerInCall) {
      const { tokenCaller, tokenReciever, uidCaller, uidReciever } = await getTokenCallerAndRevicer({
        channelName,
        userInfo,
      });
      await addCallMessages({
        chatRoomId,
        uidCaller,
        uidReciever,
        currentUser,
        tokenCaller,
        tokenReciever,
        channelName,
        userInfo: userInfo,
      });

      sendNotifiCation({ call: 'calling', chatRoomId, infoFriend: userInfo, currentUser });
    } else {
      const collectChat = collectChats(chatRoomId);
      const chatRoom = docChatRoom(chatRoomId);

      const getDocChats = await getDocs(collectChat);

      if (getDocChats.empty) {
        addFirstMessage({ collectChat, currentUser, data: 'Cuộc gọi nhỡ', callVideo: true });
      } else {
        const dataLast = await getlastMessage({ collectChat });

        addMessage({ collectChat, currentUser, data: 'Cuộc gọi nhỡ', callVideo: true, dataLast });
      }

      await updateDoc(chatRoom, {
        time: Date.now(),
      });
      sendNotifiCation({ currentUser, chatRoomId, infoFriend: userInfo });
      toastError(`${userInfo[0].displayName} in a Call`);
    }
  }
};

interface VideoCallProps {
  chatRoomId: string;
  userInfo: any[];
  currentUser: any;
}

export { handleClickCall, handleClickCallVideo };
