import HeadLessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import CryptoJS from 'crypto-js';
import { getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { BsFillCheckCircleFill, BsTelephone, BsTrash } from 'react-icons/bs';
import { HiOutlineVideoCamera } from 'react-icons/hi';
import { IoIosMore } from 'react-icons/io';

import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import { collectChats, docUsers } from '~/services/firestoreService';
import Image from '../Image';
import styles from './ConverseItem.module.scss';

const cx = classNames.bind(styles);

function ConverseItem({ data }) {
  const menuMore = [
    {
      title: 'Call',
      icon: <BsTelephone className={cx('icon-menu')} />,
    },
    {
      title: 'Video Call',
      icon: <HiOutlineVideoCamera className={cx('icon-menu')} />,
    },
    {
      title: 'Delete this converse',
      icon: <BsTrash className={cx('icon-menu')} />,
      separate: true,
    },
  ];
  const { idChatRoom } = useParams();
  const hashUrlConversation = encodeURIComponent(
    CryptoJS.Rabbit.encrypt(data.chatRoomID, 'hashUrlConversation').toString(),
  );

  const [showMoreBtn, setShowMoreBtn] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [active, setActive] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const [seen, setSeen] = useState(false);
  const [noMessage, setNoMessages] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [time, setTime] = useState('');
  const [dataContent, setDataContent] = useState('');

  const linkRef = useRef();

  useEffect(() => {
    const checkUrl = () => {
      if (idChatRoom) {
        const deHashConver = CryptoJS.Rabbit.decrypt(idChatRoom, 'hashUrlConversation');
        const chatRoomId = CryptoJS.enc.Utf8.stringify(deHashConver);
        if (chatRoomId === data.chatRoomID) {
          setActive(true);
        } else {
          setActive(false);
        }
      }
    };

    const startTime = moment(new Date(data.time).toISOString());
    setTime(startTime.fromNow());

    const userInfo = async () => {
      let uid;
      for (let i = 0; i < data.usersUid.length; i++) {
        if (data.usersUid[i] !== localStorage.getItem('uid')) {
          uid = data.usersUid[i];
        }
      }
      const getUserDoc = docUsers(uid);
      const getUserInfo = await getDoc(getUserDoc);

      getUserInfo.exists() && setUserInfo(getUserInfo.data());
    };

    const getLastContent = () => {
      const coltChats = collectChats(data.chatRoomID);
      const qChats = query(coltChats, orderBy('stt'));
      onSnapshot(qChats, (snapQChat) => {
        if (!snapQChat.empty) {
          setNoMessages(false);

          const lastVisible = snapQChat.docs[snapQChat.docs.length - 1];
          const dataLast = lastVisible.data();

          // check read message
          if (dataLast.sendBy !== localStorage.getItem('email')) {
            setIsMine(false);
            if (dataLast.isRead === false) {
              setSeen(false);
              if (dataLast.type === 'image') {
                setDataContent(' Nhận một hình ảnh');
              } else {
                setDataContent(dataLast.message);
              }
            } else {
              setSeen(true);
              if (dataLast.type === 'image') {
                setDataContent('Nhận một hình ảnh');
              } else {
                setDataContent(dataLast.message);
              }
            }
          } else {
            setIsMine(true);
            if (dataLast.isRead === true) {
              setSeen(true);
              if (dataLast.type === 'image') {
                setDataContent('Gửi một hình ảnh');
              } else {
                setDataContent(`Bạn: ${dataLast.message}`);
              }
            } else {
              setSeen(false);
              if (dataLast.type === 'image') {
                setDataContent('Gửi một hình ảnh');
              } else {
                setDataContent(`Bạn: ${dataLast.message}`);
              }
            }
          }
        } else {
          setNoMessages(true);
          setDataContent('No Messages');
        }
      });
    };

    const handle = async () => {
      checkUrl();
      getLastContent();
      await userInfo();
    };
    handle();
  }, [data, idChatRoom]);

  const handleBtnMore = (e) => {
    setShowMore(!showMore);
  };

  return (
    <div className={cx('wrapper')} onMouseEnter={() => setShowMoreBtn(true)} onMouseLeave={() => setShowMoreBtn(false)}>
      <Link to={active || `/message@${hashUrlConversation}`} ref={linkRef}>
        <div
          className={cx('converse', {
            active: active,
          })}
        >
          <Image className={cx('avatar')} src={userInfo.photoURL} alt={userInfo.displayName} />

          <div className={cx('info')}>
            <div className={cx('converse-name')}>{userInfo.displayName}</div>
            <div className={cx('converse-inbox')}>
              {noMessage === false ? (
                <>
                  <span className={cx('pre-last-message', { 'non-seen': seen === false && isMine === false })}>
                    {dataContent}
                  </span>
                  <span className={cx('converse-time')}>
                    <span>&nbsp;&#183;&nbsp;</span>
                    {time}
                  </span>
                </>
              ) : (
                <span className={cx('pre-last-message', { 'non-seen': seen === false })}>{dataContent}</span>
              )}
            </div>
          </div>
          {noMessage === false && (
            <div className={cx('seen')}>
              {isMine === true &&
                (seen === false ? (
                  <BsFillCheckCircleFill className={cx('seen-icon')} />
                ) : (
                  <Image className={cx('seen-icon')} src={userInfo.photoURL} alt={'seen'} />
                ))}
            </div>
          )}
        </div>
      </Link>

      {showMoreBtn && (
        <HeadLessTippy
          interactive
          visible={showMore}
          onHide={() => setShowMore(false)}
          render={(attrs) => (
            <div className={cx('show-more')} tabIndex="-1" {...attrs}>
              <div className={cx('showmore-content')}>
                {menuMore.map((menu, index) => (
                  <div
                    key={index}
                    className={cx('box-item', {
                      separate: menu.separate,
                    })}
                  >
                    {menu.icon}
                    <span className={cx('content-show-more')}>{menu.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        >
          <button className={cx('btn-more')} onClick={handleBtnMore}>
            <span>
              <IoIosMore className={cx('more-icon')} />
            </span>
          </button>
        </HeadLessTippy>
      )}
    </div>
  );
}

export default ConverseItem;
