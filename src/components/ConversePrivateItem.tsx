import HeadLessTippy from '@tippyjs/react/headless';
import CryptoJS from 'crypto-js';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import moment from 'moment';
import { Fragment, memo, useEffect, useState } from 'react';
import { BsFillCheckCircleFill, BsTrash } from 'react-icons/bs';
import { IoIosMore } from 'react-icons/io';
import { Link, useParams } from 'react-router-dom';

import Skeleton from 'react-loading-skeleton';
import { avatarIcon, hourGlassIcon, keyIcon, newTagIcon } from '~/assets/icons';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMenuContext } from '~/contexts/MenuContextProvider';
import { collectMessagesPrivate } from '~/services/generalFirestoreServices';

const menuMore = [
  //   {
  //     title: 'Call',
  //     icon: <BsTelephone className="icon-menu-converse-item" />,
  //   },
  //   {
  //     title: 'Video Call',
  //     icon: <HiOutlineVideoCamera className="icon-menu-converse-item" />,
  //   },
  {
    title: 'Delete this converse',
    icon: <BsTrash className="icon-menu-converse-item" />,
    separate: false,
  },
];

function ConversePrivateItem({ data }: ConverseItemProps) {
  const { slideBarCollapse } = useMenuContext();
  const { currentUser } = useAuthContext();
  const { idChatRoomPrivate } = useParams();

  const [loadingItem, setLoadingitem] = useState(true);
  const [showMoreBtn, setShowMoreBtn] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [active, setActive] = useState(false);
  const [isMine, setIsMine] = useState(false);
  const [seen, setSeen] = useState(false);
  const [noMessage, setNoMessages] = useState(false);
  const [messageUnread, setMessagesUnread] = useState(0);

  const [isNew, setIsNew] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isWatingAccept, setIsWatingAccept] = useState(false);

  const hashUrlConversation = encodeURIComponent(
    CryptoJS.Rabbit.encrypt(data!.chatRoomID, config.constant.keyHasUrlPrivate).toString(),
  );

  useEffect(() => {
    const checkUrl = () => {
      if (idChatRoomPrivate) {
        const deHashConver = CryptoJS.Rabbit.decrypt(idChatRoomPrivate, config.constant.keyHasUrlPrivate);
        const chatRoomId = CryptoJS.enc.Utf8.stringify(deHashConver);
        if (chatRoomId === data!.chatRoomID && window.location.pathname.startsWith(config.routes.homePrivate)) {
          setActive(true);
        } else {
          setActive(false);
        }
      } else {
        setActive(false);
      }
    };

    const handle = async () => {
      checkUrl();
    };
    handle();
  }, [data, idChatRoomPrivate]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      setLoadingitem(true);
    } else {
      setLoadingitem(false);
    }

    setIsNew(data?.reciever === currentUser.uid && data?.isAccepted === false ? true : false);
    setIsOwner(data?.sender === currentUser.uid && data?.isAccepted === true ? true : false);
    setIsWatingAccept(data?.sender === currentUser.uid && data?.isAccepted === false ? true : false);

    const getLastContent = async () => {
      const coltChats = collectMessagesPrivate(data?.chatRoomID!);
      const qChats = query(coltChats, orderBy('time', 'desc'));
      onSnapshot(qChats, (snapChatMess) => {
        if (!snapChatMess.empty) {
          setIsMine(snapChatMess.docs[0].data().sendBy === currentUser.email ? true : false);
          setSeen(snapChatMess.docs[0].data().isRead);
          setNoMessages(false);
          let countUnRead = 0;
          snapChatMess.docs.map((info) => {
            if (info.data().sendBy !== currentUser.email && info.data().isRead === false) {
              countUnRead++;
            }
          });
          setMessagesUnread(countUnRead);
        } else {
          setNoMessages(true);
        }
      });
    };
    getLastContent();
  }, [data]);

  const handleBtnMore = () => {
    setShowMore(!showMore);
  };

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
      >
        <Link
          to={active ? '' : `/security/${hashUrlConversation}`}
          className={`${active ? 'pointer-events-none' : ''}`}
        >
          <div
            className={`converse-item ${slideBarCollapse ? 'items-end' : 'items-center'} ${
              active ? 'active-converse-item' : ''
            }`}
          >
            <div className="w-fit flex items-center">
              {!slideBarCollapse && isWatingAccept && (
                <img
                  className="icon-flip-animation w-[30px] h-[30px] xs:w-[20px] xs:h-[20px] object-contain mr-[5px]"
                  src={hourGlassIcon.icon}
                  alt={'icon'}
                />
              )}
              {!slideBarCollapse && isNew && (
                <img
                  className=" w-[30px] h-[30px] xs:w-[20px] xs:h-[20px] object-contain mr-[5px]"
                  src={newTagIcon.icon}
                  alt={'icon'}
                />
              )}
              {!slideBarCollapse && isOwner && (
                <img
                  className=" w-[30px] h-[30px] xs:w-[20px] xs:h-[20px] object-contain mr-[5px]"
                  src={keyIcon.icon}
                  alt={'icon'}
                />
              )}
              <div className="avatar-converse-item sm:w-[40px] sm:h-[40px]">
                <img
                  className="h-full w-full rounded-full object-contain "
                  src={data?.usersPhoto.filter((v) => v !== currentUser.photoURL)[0]}
                  alt={data?.usersDisplayName.filter((v) => v !== currentUser.displayName)[0]}
                  onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                />
              </div>
            </div>

            {!slideBarCollapse && (
              <div className="info-converse-item">
                <div className="converse-item-name">
                  {data?.usersDisplayName.filter((v) => v !== currentUser.displayName)[0]}
                </div>
                <div className="converse-item-inbox overflow-hidden">
                  <span className="text-ellipsis overflow-hidden">
                    {data?.usersEmail.filter((v) => v !== currentUser.email)[0]}
                  </span>
                  {!noMessage && (
                    <span className="converse-item-time whitespace-nowrap">
                      <span>&nbsp;&#183;&nbsp;</span>
                      {moment(new Date(data!.time).toISOString()).fromNow()}
                    </span>
                  )}
                </div>
              </div>
            )}
            {noMessage === false && (
              <div className="seen-converse-item">
                {isMine &&
                  (seen ? (
                    <img
                      className="seen-icon-converse-item"
                      src={data?.usersPhoto.filter((v) => v !== currentUser.photoURL)[0]}
                      alt={'seen'}
                      onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                    />
                  ) : (
                    <BsFillCheckCircleFill className="seen-icon-converse-item" />
                  ))}
                {messageUnread > 0 && (
                  <div className="seen-icon-converse-item bg-danger-color flex items-center justify-center">
                    <span className="text-white text-center text-[10px] font-bold">{messageUnread}</span>
                  </div>
                )}
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
        )}
      </div>
    </Fragment>
  );
}
interface ConverseItemProps {
  data?: {
    chatRoomID: string;
    time: number;
    usersUid: [];
    usersPhoto: [];
    usersDisplayName: [];
    usersEmail: [];
    chatRoomName: string;
    isGroup: boolean;
    reciever: string;
    sender: string;
    isAccepted: boolean;
  } | null;
  dataAdd?: any[];
  addConversation?: boolean;
}
export default memo(ConversePrivateItem);
