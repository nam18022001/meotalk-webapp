import classNames from 'classnames/bind';
import { memo, useEffect, useRef, useState } from 'react';

import { db } from '~/services/FirebaseServices';
import ConverseItem from '~/components/ConverseItem';
import styles from './SideBar.module.scss';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

const cx = classNames.bind(styles);

function SideBar() {
  const [showBorderTitle, setShowBorderTitle] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);
  const [chatRoomInfo, setChatRoomInfo] = useState([]);

  const navRef = useRef();

  useEffect(() => {
    const chatRoomCollection = collection(db, 'ChatRoom');
    const getChatRoom = query(
      chatRoomCollection,
      where('usersEmail', 'array-contains', localStorage.getItem('email')),
      orderBy('time', 'desc'),
    );
    const listChat = () => {
      onSnapshot(getChatRoom, (chatRoomSnap) => {
        const chatRoom = [];
        if (chatRoomSnap.empty) {
          //handle no chat
          setShowSideBar(false);
        } else {
          setShowSideBar(true);
          chatRoomSnap.forEach((res) => {
            chatRoom.push(res.data());
          });
          setChatRoomInfo(chatRoom);
        }
      });
    };
    listChat();
  }, []);

  const handleScrolling = () => {
    showSideBar && navRef.current.scrollTop > 30 ? setShowBorderTitle(true) : setShowBorderTitle(false);
  };

  return (
    <nav
      className={cx('wrapper', {
        widthCus: showSideBar === false,
      })}
    >
      <div
        className={cx('title-chat', {
          'border-title': showBorderTitle,
        })}
      >
        <h2>Chat</h2>
      </div>
      {showSideBar && (
        <div className={cx('chat-list')} ref={navRef} onScroll={handleScrolling}>
          {chatRoomInfo.map((infoRoom, index) => (
            <ConverseItem key={index} data={infoRoom} />
          ))}
        </div>
      )}
    </nav>
  );
}

export default memo(SideBar);
