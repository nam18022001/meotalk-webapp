import Tippy from '@tippyjs/react';
import classNames from 'classnames/bind';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import CryptoJS from 'crypto-js';
import { db } from '~/services/FirebaseServices';
import Button from '../Button';
import Image from '../Image';
import styles from './AccountItem.module.scss';

const cx = classNames.bind(styles);

function AccountItem({ data }) {
  const hashUrl = encodeURIComponent(CryptoJS.Rabbit.encrypt(data.uid, 'hashURL').toString());
  const nav = useNavigate();

  //state
  const [showAccountItem, setShowAccountItem] = useState();
  const [emailToolTip, setEmailToolTip] = useState(true);
  const [addSent, setAddSent] = useState();
  const [isRecieveRequest, setIsRecieveRequest] = useState();
  const [isFriend, setIsFriend] = useState();
  const [hasMessage, setHasMessage] = useState();
  //Ref
  const infoRef = useRef();
  const emailRef = useRef();
  // Doc
  const friendsDoc = doc(db, 'users', `${localStorage.getItem('uid')}`, 'friends', data.uid);
  const makeFriendsDoc = doc(db, 'makeFriends', `${localStorage.getItem('uid')}_${data.uid}`);
  const recieveFriendDoc = doc(db, 'makeFriends', `${data.uid}_${localStorage.getItem('uid')}`);

  useLayoutEffect(() => {
    if (showAccountItem && emailRef.current.offsetWidth > infoRef.current.offsetWidth) {
      setEmailToolTip(true);
    } else {
      setEmailToolTip(false);
    }

    const friend = async () => {
      // check is friend
      const docSnap = await getDoc(friendsDoc);
      if (docSnap.exists()) {
        setIsFriend(true);
      } else {
        setIsFriend(false);
      }

      // check is send request friend
      const friendSnap = await getDoc(makeFriendsDoc);
      friendSnap.exists() && friendSnap.data().sender === localStorage.getItem('uid')
        ? setAddSent(true)
        : setAddSent(false);

      // check is recieve request friend
      const recieveRequest = query(
        collection(db, 'makeFriends'),
        where('reciever', '==', localStorage.getItem('uid')),
        where('sender', '==', data.uid),
      );
      const requestExist = await getDocs(recieveRequest);
      if (!requestExist.empty) {
        setIsRecieveRequest(true);
      } else {
        setIsRecieveRequest(false);
      }
    };
    const handle = async () => {
      await friend();
      setShowAccountItem(true);
    };
    handle();
    // eslint-disable-next-line
  }, [data]);

  // func
  const handleAdd = async () => {
    setAddSent(true);
    await setDoc(makeFriendsDoc, {
      emailSender: localStorage.getItem('email'),
      photoSender: localStorage.getItem('avatar'),
      nameSender: localStorage.getItem('displayName'),
      sender: localStorage.getItem('uid'),
      reciever: data.uid,
      emailReciever: data.email,
      photoReciever: data.photoURL,
      nameReciever: data.displayName,
    });
  };
  const handleAccept = async () => {
    setIsFriend(true);
    await setDoc(friendsDoc, {
      uid: data.uid,
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
    });
    await setDoc(doc(db, 'users', data.uid, 'friends', localStorage.getItem('uid')), {
      uid: localStorage.getItem('uid'),
      displayName: localStorage.getItem('displayName'),
      email: localStorage.getItem('email'),
      photoURL: localStorage.getItem('avatar'),
    });

    await deleteDoc(recieveFriendDoc);
  };
  const handleMessage = async () => {
    const checkDoc = [`${localStorage.getItem('uid')}_${data.uid}`, `${data.uid}_${localStorage.getItem('uid')}`];

    for (let i = 0; i < checkDoc.length; i++) {
      const chatDoc = collection(db, 'ChatRoom');
      const qChatDoc = query(chatDoc, where('chatRoomID', '==', checkDoc[i]));
      const getChatRoom = await getDocs(qChatDoc);

      if (!getChatRoom.empty) {
        const chatGet = getChatRoom.docs[0];
        setHasMessage(true);
        const urlHash = encodeURIComponent(CryptoJS.Rabbit.encrypt(chatGet.id, 'hashUrlConversation'));
        return nav(`/message@${urlHash}`);
      }
    }

    if (!hasMessage) {
      await setDoc(doc(db, 'ChatRoom', `${localStorage.getItem('uid')}_${data.uid}`), {
        chatRoomID: `${localStorage.getItem('uid')}_${data.uid}`,
        time: Date.now(),
        usersEmail: [localStorage.getItem('email'), data.email],
        usersUid: [localStorage.getItem('uid'), data.uid],
      });
      const urlHash = encodeURIComponent(
        CryptoJS.Rabbit.encrypt(`${localStorage.getItem('uid')}_${data.uid}`, 'hashUrlConversation'),
      );
      return nav(`/message@${urlHash}`);
    }
  };
  return (
    showAccountItem && (
      <div className={cx('wrapper')}>
        <Link to={`/@${hashUrl}`} className={cx('item-search')}>
          <Image
            className={cx('avatar')}
            src={data.photoURL === undefined ? '' : data.photoURL}
            alt={data.displayName}
          />
          <div ref={infoRef} className={cx('info')}>
            <h4 className={cx('name')}>
              <span>{data.displayName}</span>
            </h4>
            {emailToolTip === true ? (
              <Tippy content={data.email}>
                <span className={cx('email')} ref={emailRef}>
                  {data.email}
                </span>
              </Tippy>
            ) : (
              <span className={cx('email')} ref={emailRef}>
                {data.email}
              </span>
            )}
          </div>
        </Link>
        <div className={cx('actions')}>
          {isFriend === false ? (
            isRecieveRequest === false ? (
              addSent === false ? (
                <Button className={cx('btn-add')} small onClick={handleAdd}>
                  Add
                </Button>
              ) : (
                <div className={cx('check-icon')}>
                  <svg className={cx('checkmark')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className={cx('checkmark__circle')} cx="26" cy="26" r="25" fill="none" />
                    <path className={cx('checkmark__check')} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
              )
            ) : (
              <Button className={cx('accept')} small text onClick={handleAccept}>
                Accept
              </Button>
            )
          ) : (
            <Button text small className={cx('btn-add')} onClick={handleMessage}>
              Message
            </Button>
          )}
        </div>
      </div>
    )
  );
}

export default AccountItem;
