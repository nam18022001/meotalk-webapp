import CryptoJS from 'crypto-js';
import { getDoc, onSnapshot } from 'firebase/firestore';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import HeaderConversation from '~/components/HeaderConversation';
import InputConversation from '~/components/InputConversation';
import MessageConversation from '~/components/MessageConversation';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { handleClickCall, handleClickCallVideo } from '~/functions/call';
import { handleReadMessages } from '~/functions/conversation';
import { getCollectionChatRoom } from '~/services/conversationServices';
import { docChatRoom, docUsers } from '~/services/generalFirestoreServices';

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

  const [isGroup, setIsGroup] = useState(false);

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
            if (a.data().isGroup === false) {
              setIsGroup(false);
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
            } else {
              setIsGroup(true);
              let chats: any[] = [];
              let lastSttRead: any[] = [];
              snapGetMessage.forEach((res) => {
                if (res.data().isRead.length > 0) {
                  lastSttRead.push(res.data());
                }
                chats.push(res.data());
              });

              setLastStt(lastSttRead[0].stt);

              setMessages(chats);
            }
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

  return (
    <Fragment>
      <div
        className="wrapper-conversation"
        onMouseDown={() => handleReadMessages({ currentUser, chatRoomId, userInfo })}
        onFocus={() => handleReadMessages({ currentUser, chatRoomId, userInfo })}
      >
        <HeaderConversation
          infoConversation={userInfo.filter((v) => v.uid !== currentUser.uid)}
          loadingConversation={loadingConversation}
          onClickCallVideo={() => handleClickCallVideo({ chatRoomId, userInfo, currentUser })}
        />
        <div ref={messagesRef} className="messages-conversation xs:p-[5px]">
          {!isGroup
            ? messages.map((data: any, index) => (
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
                  onClickVideoRecall={() => handleClickCallVideo({ chatRoomId, userInfo, currentUser })}
                  onClickReCall={() => handleClickCall()}
                />
              ))
            : messages.map((data: any, index) => (
                <MessageConversation
                  key={index}
                  isGroup={true}
                  data={data.message}
                  time={data.time}
                  own={data.sendBy === currentUser.email ? true : false}
                  type={data.type}
                  seen={data.stt === lastStt ? true : false}
                  photoSender={data.photoSender}
                  seenGroup={data.isRead}
                  loadingConversation={loadingConversation}
                  onClickVideoRecall={() => handleClickCallVideo({ chatRoomId, userInfo, currentUser })}
                  onClickReCall={() => handleClickCall()}
                />
              ))}
        </div>
        <InputConversation chatRoomId={chatRoomId} loadingConversation={loadingConversation} isGroup={isGroup} />
      </div>
    </Fragment>
  );
}

export default memo(Conversation);
