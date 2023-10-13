import CryptoJS from 'crypto-js';
import { doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import HeaderConversation from '~/components/HeaderConversation';
import InputConversation from '~/components/InputConversation';
import MessageConversation from '~/components/MessageConversation';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import sendNotifiCation from '~/hooks/useSendNotification';
import { toastError } from '~/hooks/useToast';
import { db } from '~/services/FirebaseServices';
import { addCallMessages, checkCallExist, getTokenCallerAndRevicer } from '~/services/callServices';
import { addFirstMessage, addMessage, getCollectionChatRoom, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom, docUsers } from '~/services/generalFirestoreServices';

function Conversation() {
  const { idChatRoom } = useParams();
  const { currentUser } = useAuthContext();
  const nav = useNavigate();

  const chatRoomId = CryptoJS.enc.Utf8.stringify(
    CryptoJS.Rabbit.decrypt(idChatRoom ? idChatRoom : '', 'hashUrlConversation'),
  ).toString();

  const [friendId, setFriendId] = useState<any[]>([]);

  const [lastStt, setLastStt] = useState(0);

  const [messages, setMessages] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [loadingConversation, setLoadingConversation] = useState(true);

  // const [paging, setPaging] = useState(20);
  // console.log(paging);

  // const handleScrolling = () => {
  //   const scrollHeight: number | undefined = messagesRef.current?.scrollHeight;
  //   const scroll: number | undefined = messagesRef.current?.scrollTop;

  //   if (scroll! < -scrollHeight! + 730) {
  //     setPaging((pre) => pre + 20);
  //   }
  // };

  useEffect(() => {
    const checkUrlAndGetData = async () => {
      if (chatRoomId) {
        const a = await getDoc(docChatRoom(chatRoomId));
        if (a.exists()) {
          onSnapshot(getCollectionChatRoom({ chatRoomId }), (snapGetMessage) => {
            let chats: any[] = [];
            let lastSttRead: any[] = [];
            snapGetMessage.forEach((res) => {
              if (res.data().isRead === true) {
                lastSttRead.push(res.data().stt);
              }
              chats.push(res.data());
            });
            setLastStt(lastSttRead[0]);
            setMessages(chats);
          });
        } else {
          nav(config.routes.home);
        }
      }
    };
    const userUid = async () => {
      const chatRoom = docChatRoom(chatRoomId);
      const getUsersUid = await getDoc(chatRoom);
      if (getUsersUid.exists()) {
        let idUsers: {}[] = [];
        for (let i = 0; i < getUsersUid.data().usersUid.length; i++) {
          if (getUsersUid.data().usersUid[i] !== currentUser.uid) {
            idUsers.push(getUsersUid.data().usersUid[i]);
          }
        }
        setFriendId(idUsers);
      }
    };

    const handle = async () => {
      await checkUrlAndGetData();
      await userUid();
    };
    handle();
    return () => {
      setFriendId([]);
      setLastStt(0);
      setMessages([]);
      setUserInfo([]);
    };
  }, [idChatRoom, chatRoomId]);

  useEffect(() => {
    if (friendId.length > 0) {
      async function a() {
        let infoUsers: any[] = [];

        for (let l = 0; l < friendId.length; l++) {
          const getUserDoc = docUsers(friendId[l]);
          const getUserInfo = await getDoc(getUserDoc);
          infoUsers.push(getUserInfo.data());
        }

        setUserInfo(infoUsers);
      }
      a();
    }
  }, [friendId]);

  useEffect(() => {
    if (userInfo.length > 0) {
      setLoadingConversation(false);
    } else {
      setLoadingConversation(true);
    }
  }, [userInfo]);

  const handleReadMessages = async () => {
    const getCollectionMess = collectChats(chatRoomId);
    if (userInfo.length > 0) {
      if (userInfo.length > 1) {
        console.log('read group message');
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
  const handleClickCall = async () => {};
  const handleClickCallVideo = async () => {
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

  return (
    <Fragment>
      <div className="wrapper-conversation" onMouseDown={handleReadMessages} onFocus={handleReadMessages}>
        <HeaderConversation
          infoConversation={userInfo.filter((v) => v.uid !== currentUser.uid)}
          loadingConversation={loadingConversation}
          onClickCallVideo={handleClickCallVideo}
        />
        <div ref={messagesRef} className="messages-conversation xs:p-[5px]">
          {messages.map((data: any, index) => (
            <MessageConversation
              key={index}
              data={data.message}
              time={data.time}
              own={data.sendBy === currentUser.email ? true : false}
              type={data.type}
              seenImg={userInfo.length > 0 ? userInfo[0].photoURL : ''}
              seen={data.stt === lastStt ? true : false}
              isRead={data.isRead}
              loadingConversation={loadingConversation}
              onClickVideoRecall={handleClickCallVideo}
              onClickReCall={handleClickCall}
            />
          ))}
        </div>
        <InputConversation chatRoomId={chatRoomId} loadingConversation={loadingConversation} />
      </div>
    </Fragment>
  );
}

export default memo(Conversation);
