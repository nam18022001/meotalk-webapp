import classNames from 'classnames/bind';
import CryptoJS from 'crypto-js';
import { doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { db } from '~/services/FirebaseServices';
import { collectChats, docCall, docChatRoom, docUsers } from '~/services/firestoreService';
import Header from './components/Header';
import Input from './components/Input/Input';
import Message from './components/Message';
import styles from './ConverseBox.module.scss';

const cx = classNames.bind(styles);

function ConverseBox() {
  const { idChatRoom } = useParams();
  const deHashConver = CryptoJS.Rabbit.decrypt(idChatRoom, 'hashUrlConversation');

  const chatRoomId = CryptoJS.enc.Utf8.stringify(deHashConver);

  const [friendId, setFriendId] = useState('');
  const [lastStt, setLastStt] = useState(0);
  const [showConversation, setShowConversation] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  useEffect(() => {
    setShowConversation(false);
    const checkUrlAndGetData = async () => {
      if (chatRoomId) {
        const getCollectionMess = collectChats(chatRoomId);
        const qMess = query(getCollectionMess, orderBy('stt', 'desc'));

        onSnapshot(qMess, (snapGetMessage) => {
          const chats = [];
          const lastSttRead = [];
          snapGetMessage.forEach((res) => {
            if (res.data().isRead === true) {
              lastSttRead.push(res.data().stt);
            }
            chats.push(res.data());
          });
          setLastStt(lastSttRead[0]);
          setMessages(chats);
        });
      }
    };

    const userUid = async () => {
      const chatRoom = docChatRoom(chatRoomId);
      const getUsersUid = await getDoc(chatRoom);
      if (getUsersUid.exists()) {
        for (let i = 0; i < getUsersUid.data().usersUid.length; i++) {
          if (getUsersUid.data().usersUid[i] !== localStorage.getItem('uid')) {
            setFriendId(getUsersUid.data().usersUid[i]);
          }
        }
      }
      if (friendId) {
        const getUserDoc = docUsers(friendId);
        const getUserInfo = await getDoc(getUserDoc);

        setUserInfo(getUserInfo.data());
      }
    };

    let idTimeOut;
    const handle = async () => {
      await checkUrlAndGetData();
      await userUid();
      idTimeOut = setTimeout(() => {
        setShowConversation(true);
      }, 500);
    };
    handle();

    return () => clearTimeout(idTimeOut);
  }, [idChatRoom, chatRoomId, friendId]);

  const handleReadMessages = async () => {
    const getCollectionMess = collectChats(chatRoomId);
    if (userInfo.email) {
      const queryCollect = query(getCollectionMess, where('sendBy', '==', userInfo.email));
      const getDocsMess = await getDocs(queryCollect);
      if (!getDocsMess.empty) {
        getDocsMess.forEach(async (res) => {
          await updateDoc(doc(db, 'ChatRoom', chatRoomId, 'chats', res.id), {
            isRead: true,
          });
        });
      }
    }
  };

  const handleClickCallVideo = async () => {
    // setup window popup
    const width = 1000;
    const height = 600;
    const left = window.screen.width / 2 - (width - 50) / 2;
    const top = window.screen.height / 2 - (height + 50) / 2;

    // set up config token
    const channelName = chatRoomId;

    const uidCaller = Math.floor(Math.random() * 100000);
    const uidReciever = uidCaller + 1000;
    const role = 1;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // build token caller
    let serverUrl = 'https://meotalk-token-agora.vercel.app/rtc/';
    const responseCaller = await fetch(
      serverUrl + channelName + '/' + role + '/uid/' + uidCaller + '/?expiry=' + privilegeExpiredTs,
    );
    const dataCaller = await responseCaller.json();
    const tokenCaller = dataCaller.rtcToken;

    // build token reciever

    const responseReiever = await fetch(
      serverUrl + channelName + '/' + role + '/uid/' + uidReciever + '/?expiry=' + privilegeExpiredTs,
    );
    const dataReciever = await responseReiever.json();
    const tokenReciever = dataReciever.rtcToken;

    const tokenHash = CryptoJS.Rabbit.encrypt(
      channelName + '&&' + tokenCaller + '&&' + uidCaller + '&&' + userInfo.photoUrl + '&&' + userInfo.displayName,
      'tokenHash',
    );
    await setDoc(docCall(chatRoomId), {
      callerId: uidCaller,
      callerUid: localStorage.getItem('uid'),
      callerName: localStorage.getItem('displayName'),
      callerAvatar: localStorage.getItem('avatar'),
      recieverId: uidReciever,
      recieverUid: userInfo.uid,
      receiverName: userInfo.displayName,
      receiverAvatar: userInfo.photoUrl,
      dialling: true,
      hasDialled: false,
      deleteCall: false,
      channelName: channelName,
      tokenCaller: tokenCaller,
      tokenReciever: tokenReciever,
      type: 'video',
    });
    window.open(
      `/video/group@${encodeURIComponent(tokenHash)}`,
      '_blank',
      `height=${height},width=${width},top=${top},left=${left}`,
    );
  };

  return showConversation ? (
    <div className={cx('wrapper')} onMouseDown={handleReadMessages} onFocus={handleReadMessages}>
      <Header data={userInfo} onClickCallVideo={handleClickCallVideo} />
      <div className={cx('messages')}>
        {messages.map((data, index) => (
          <Message
            key={index}
            data={data.message}
            own={data.sendBy === localStorage.getItem('email') ? true : false}
            type={data.type}
            seenImg={userInfo.photoUrl}
            seen={data.stt === lastStt ? true : false}
            isRead={data.isRead}
          />
        ))}
      </div>
      <Input chatRoomId={chatRoomId} autoFocus onFocusInput={handleReadMessages} />
    </div>
  ) : (
    <div className={cx('loader-wrapper')}>
      <div className={cx('loader')}></div>
    </div>
  );
}

export default memo(ConverseBox);
