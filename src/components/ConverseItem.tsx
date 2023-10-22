import HeadLessTippy from '@tippyjs/react/headless';
import CryptoJS from 'crypto-js';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import moment from 'moment';
import { Fragment, memo, useEffect, useState } from 'react';
import { BsFillCheckCircleFill, BsTelephone, BsTrash } from 'react-icons/bs';
import { HiOutlineVideoCamera } from 'react-icons/hi';
import { IoIosClose, IoIosMore } from 'react-icons/io';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Skeleton from 'react-loading-skeleton';
import { avatarIcon } from '~/assets/icons';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMenuContext } from '~/contexts/MenuContextProvider';
import { usersInfo } from '~/services/conversationServices';
import { collectChats } from '~/services/generalFirestoreServices';

const menuMore = [
  {
    title: 'Call',
    icon: <BsTelephone className="icon-menu-converse-item" />,
  },
  {
    title: 'Video Call',
    icon: <HiOutlineVideoCamera className="icon-menu-converse-item" />,
  },
  {
    title: 'Delete this converse',
    icon: <BsTrash className="icon-menu-converse-item" />,
    separate: true,
  },
];

function ConverseItem({ data, addConversation = false, dataAdd = [] }: ConverseItemProps) {
  const { slideBarCollapse } = useMenuContext();
  const { currentUser } = useAuthContext();
  const { idChatRoom } = useParams();
  const nav = useNavigate();

  const hashUrlConversation = encodeURIComponent(
    CryptoJS.Rabbit.encrypt(addConversation ? '' : data!.chatRoomID, 'hashUrlConversation').toString(),
  );

  const [loadingItem, setLoadingitem] = useState(false);
  const [showMoreBtn, setShowMoreBtn] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [active, setActive] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const [seen, setSeen] = useState(false);
  const [noMessage, setNoMessages] = useState(false);
  const [userInfo, setUserInfo] = useState<any[]>([]);
  const [time, setTime] = useState('');
  const [dataContent, setDataContent] = useState('');

  const [avatarSeenFirstGroup, setAvatarSeenFirstGroup] = useState('');

  useEffect(() => {
    const checkUrl = () => {
      if (idChatRoom) {
        const deHashConver = CryptoJS.Rabbit.decrypt(idChatRoom, 'hashUrlConversation');
        const chatRoomId = CryptoJS.enc.Utf8.stringify(deHashConver);
        if (chatRoomId === data!.chatRoomID) {
          setActive(true);
        } else {
          setActive(false);
        }
      } else {
        setActive(false);
      }
    };

    const startTime: any = !addConversation ? moment(new Date(data!.time).toISOString()) : '';
    setTime(!addConversation ? startTime.fromNow() : '');

    const getUsersInfo = async () => {
      const info = await usersInfo({ data: data, currentUser: currentUser });
      setUserInfo(info);
    };

    const handle = async () => {
      if (!addConversation) {
        checkUrl();
        await getUsersInfo();
      }
    };
    handle();
  }, [data, idChatRoom]);

  useEffect(() => {
    const getLastContent = () => {
      const coltChats = collectChats(data!.chatRoomID);
      const qChats = query(coltChats, orderBy('stt'));
      onSnapshot(qChats, (snapQChat) => {
        if (!snapQChat.empty) {
          setNoMessages(false);

          const lastVisible = snapQChat.docs[snapQChat.docs.length - 1];
          const dataLast: any = lastVisible.data();

          // check read message
          if (dataLast.sendBy !== currentUser.email) {
            setIsMine(false);
            if (data!.isGroup === false) {
              if (dataLast.isRead === false) {
                setSeen(false);
                if (dataLast.type === 'image') {
                  setDataContent('Recieve a image');
                } else {
                  setDataContent(dataLast.message);
                }
              } else {
                setSeen(true);
                if (dataLast.type === 'image') {
                  setDataContent('Recieve a image');
                } else {
                  setDataContent(dataLast.message);
                }
              }
            } else {
              if (dataLast.isRead.filter((read: any) => read.seenBy === currentUser.email).length === 0) {
                setSeen(false);
                if (dataLast.type === 'image') {
                  setDataContent('Recieve a image');
                } else {
                  setDataContent(dataLast.message);
                }
              } else {
                setSeen(true);
                if (dataLast.type === 'image') {
                  setDataContent('Recieve a image');
                } else {
                  setDataContent(dataLast.message);
                }
              }
            }
          } else {
            setIsMine(true);
            if (data!.isGroup === false) {
              if (dataLast.isRead === true) {
                setSeen(true);
                if (dataLast.type === 'image') {
                  setDataContent('You: Send a image');
                } else {
                  setDataContent(`You: ${dataLast.message}`);
                }
              } else {
                setSeen(false);
                if (dataLast.type === 'image') {
                  setDataContent('You: Send a image');
                } else {
                  setDataContent(`You: ${dataLast.message}`);
                }
              }
            } else {
              for (let i = 0; i < userInfo.length; i++) {
                if (dataLast.isRead.filter((read: any) => read.seenBy === userInfo[i].email).length > 0) {
                  setSeen(true);
                  setAvatarSeenFirstGroup(userInfo[i].photoURL);
                  if (dataLast.type === 'image') {
                    setDataContent('You: Send a image');
                  } else {
                    setDataContent(`You: ${dataLast.message}`);
                  }
                  break;
                } else {
                  setSeen(false);
                  if (dataLast.type === 'image') {
                    setDataContent('You: Send a image');
                  } else {
                    setDataContent(`You: ${dataLast.message}`);
                  }
                }
              }
            }
          }
        } else {
          setNoMessages(true);
          setDataContent('No Messages');
        }
      });
    };

    if (userInfo.length > 0) {
      getLastContent();
    }
  }, [data, userInfo]);

  const handleBtnMore = () => {
    setShowMore(!showMore);
  };

  useEffect(() => {
    if (!addConversation) {
      if (userInfo.length > 0 && typeof userInfo[0].uid === 'string' && dataContent.length > 0) {
        setLoadingitem(false);
      } else {
        setLoadingitem(true);
      }
    }
  }, [userInfo, dataContent]);

  useEffect(() => {
    if (addConversation) {
      setActive(true);
    }
  }, [addConversation]);

  return loadingItem ? (
    <div className="wrapper-converse-item">
      <div className="converse-item">
        <Skeleton width={56} height={56} circle />
        <div className="info-converse-item">
          <Skeleton count={2} />
        </div>
      </div>
    </div>
  ) : (
    <Fragment>
      <div
        className="wrapper-converse-item"
        onMouseEnter={() => !slideBarCollapse && setShowMoreBtn(true)}
        onMouseLeave={() => !slideBarCollapse && setShowMoreBtn(false)}
        onClick={() => {
          !addConversation && localStorage.setItem('w-l-c', hashUrlConversation);
        }}
      >
        <Link
          to={active ? '' : `/conversation/${hashUrlConversation}`}
          className={`${active ? 'pointer-events-none' : ''}`}
        >
          <div
            className={`converse-item ${slideBarCollapse ? 'items-end' : 'items-center'} ${
              active ? 'active-converse-item' : ''
            }`}
          >
            <div className="avatar-converse-item sm:w-[40px] sm:h-[40px]">
              {!addConversation ? (
                userInfo.length > 0 && userInfo.length > 1 ? (
                  userInfo
                    .slice(0, 2)
                    .map((info, index) => (
                      <img
                        key={index}
                        className={`absolute border-[3px] border-solid border-white sm:w-[28px] sm:h-[28px] w-[40px] h-[40px] object-contain rounded-full  ${
                          index === 0 ? 'bottom-0 left-0 z-20' : 'right-0 top-0 z-10'
                        }`}
                        src={info.photoURL}
                        alt={info.displayName}
                        onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                      />
                    ))
                ) : (
                  userInfo.map((info, index) => (
                    <img
                      key={index}
                      className="h-full w-full rounded-full object-contain "
                      src={info.photoURL}
                      alt={info.displayName}
                      onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                    />
                  ))
                )
              ) : dataAdd.length === 1 ? (
                <img
                  className="h-full w-full rounded-full object-contain "
                  src={dataAdd[0].photoURL}
                  alt={'avatar'}
                  onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                />
              ) : dataAdd.length > 1 ? (
                dataAdd
                  .slice(0, 2)
                  .map((info, index) => (
                    <img
                      key={index}
                      className={`absolute border-[3px] border-solid border-white sm:w-[28px] sm:h-[28px] w-[40px] h-[40px] object-contain rounded-full  ${
                        index === 0 ? 'bottom-0 left-0 z-20' : 'right-0 top-0 z-10'
                      }`}
                      src={info.photoURL}
                      alt={info.displayName}
                      onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                    />
                  ))
              ) : (
                <img
                  className="h-full w-full rounded-full object-contain "
                  src={avatarIcon.icon}
                  alt={'avatar'}
                  onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                />
              )}
            </div>

            {!slideBarCollapse && (
              <div className="info-converse-item">
                <div className="converse-item-name">
                  {!addConversation
                    ? userInfo.length > 0 && userInfo.length > 1
                      ? data!.chatRoomName && data!.chatRoomName.length > 0
                        ? data!.chatRoomName
                        : userInfo.map(
                            (info, index) => info.displayName + `${index === userInfo.length - 1 ? '' : ', '} `,
                          )
                      : userInfo.length > 0 && userInfo[0].displayName
                    : dataAdd.length > 0 && dataAdd.length > 1
                    ? 'Tin nhắn đến ' +
                      dataAdd.map((info, index) => info.displayName + `${index === dataAdd.length - 1 ? '' : ', '} `)
                    : dataAdd.length === 1
                    ? 'Tin nhắn đến ' + dataAdd[0].displayName
                    : 'Tin nhắn mới'}
                </div>
                <div className="converse-item-inbox">
                  {!addConversation &&
                    (noMessage === false ? (
                      <>
                        <span
                          className={`pre-last-message-converse-item ${
                            seen === false && isMine === false ? 'non-seen-converse-item' : ''
                          }`}
                        >
                          {dataContent}
                        </span>
                        <span className="converse-item-time">
                          <span>&nbsp;&#183;&nbsp;</span>
                          {time}
                        </span>
                      </>
                    ) : (
                      <span className={`pre-last-message-converse-item  non-seen-converse-item`}>{dataContent}</span>
                    ))}
                </div>
              </div>
            )}
            {!addConversation && noMessage === false && (
              <div className="seen-converse-item">
                {isMine === true &&
                  (seen === false ? (
                    <BsFillCheckCircleFill className="seen-icon-converse-item" />
                  ) : userInfo.length > 0 && userInfo.length > 1 ? (
                    <img
                      className="seen-icon-converse-item"
                      src={avatarSeenFirstGroup}
                      alt={'seen'}
                      onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                    />
                  ) : (
                    <img
                      className="seen-icon-converse-item"
                      src={userInfo[0].photoURL}
                      alt={'seen'}
                      onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                    />
                  ))}
              </div>
            )}
          </div>
        </Link>
        {showMoreBtn &&
          (!addConversation ? (
            <HeadLessTippy
              interactive
              visible={showMore}
              onHide={() => setShowMore(false)}
              render={(attrs) => (
                <div className={'show-more-converse-item'} tabIndex={-1} {...attrs}>
                  <div className={'content-show-more-converse-item'}>
                    {menuMore.map((menu, index) => (
                      <div
                        key={index}
                        className={`box-item-converse-item ${menu.separate ? 'separate-converse-item' : ''}`}
                      >
                        {menu.icon}
                        <span className="content-show-more-converse-item">{menu.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            >
              <button className="btn-more-converse-item" onClick={handleBtnMore}>
                <span>
                  <IoIosMore />
                </span>
              </button>
            </HeadLessTippy>
          ) : (
            <button className="btn-more-converse-item" onClick={() => nav(config.routes.home)}>
              <span>
                <IoIosClose />
              </span>
            </button>
          ))}
      </div>
    </Fragment>
  );
}
interface ConverseItemProps {
  data?: { chatRoomID: string; time: number; usersUid: []; chatRoomName: string; isGroup: boolean } | null;
  dataAdd?: any[];
  addConversation?: boolean;
}
export default memo(ConverseItem);
