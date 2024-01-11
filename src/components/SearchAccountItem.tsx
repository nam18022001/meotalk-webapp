import Tippy from '@tippyjs/react';
import CryptoJS from 'crypto-js';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Fragment, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useNavigate } from 'react-router-dom';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { db } from '~/services/FirebaseServices';
import { acceptFriend, addFriend, makeConversation } from '~/services/searchServices';

function SearchAccountItem({ data, onClick }: SearchAccountItemProps) {
  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();
  const nav = useNavigate();
  //state
  const [showAccountItem, setShowAccountItem] = useState(false);
  const [emailToolTip, setEmailToolTip] = useState(true);

  const [addSent, setAddSent] = useState(false);
  const [isRecieveRequest, setIsRecieveRequest] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const infoRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  // Doc
  const friendsDoc = doc(db, 'users', `${currentUser.uid}`, 'friends', data.uid);
  const makeFriendsDoc = doc(db, 'makeFriends', `${currentUser.uid}_${data.uid}`);
  const recieveFriendDoc = doc(db, 'makeFriends', `${data.uid}_${currentUser.uid}`);

  useEffect(() => {
    const offsetWidthEmailRef: number | undefined = emailRef.current?.offsetWidth;
    const offsetWidthInfoRef: number | undefined = infoRef.current?.offsetWidth;

    if (
      typeof offsetWidthEmailRef === 'number' &&
      typeof offsetWidthInfoRef === 'number' &&
      offsetWidthEmailRef > offsetWidthInfoRef
    ) {
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
      friendSnap.exists() && friendSnap.data().sender === currentUser.uid ? setAddSent(true) : setAddSent(false);

      // check is recieve request friend
      const recieveRequest = query(
        collection(db, 'makeFriends'),
        where('reciever', '==', currentUser.uid),
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
  }, [data]);

  // func
  const handleAdd = async () => {
    await addFriend({ doc: makeFriendsDoc, sender: currentUser, reciever: data });
    setAddSent(true);
  };
  const handleAccept = async () => {
    await acceptFriend({
      friendsDoc: friendsDoc,
      recieveFriendDoc: recieveFriendDoc,
      sender: currentUser,
      reciever: data,
    });
    setIsFriend(true);
  };
  const handleMessage = async () => {
    let hasMessage: boolean = false;

    const checkDoc = [`${currentUser.uid}_${data.uid}`, `${data.uid}_${currentUser.uid}`];
    for (let i = 0; i < checkDoc.length; i++) {
      const chatDoc = collection(db, 'ChatRoom');
      const qChatDoc = query(chatDoc, where('chatRoomID', '==', checkDoc[i]));
      const getChatRoom = await getDocs(qChatDoc);
      if (!getChatRoom.empty) {
        const chatGet = getChatRoom.docs[0];
        hasMessage = true;
        const urlHash = encodeURIComponent(CryptoJS.Rabbit.encrypt(chatGet.id, config.constant.keyHasUrl).toString());
        return nav(`/conversation/${urlHash}`);
      }
    }
    if (!hasMessage) {
      await makeConversation({ currentUser: currentUser, data: data });
      const urlHash = encodeURIComponent(
        CryptoJS.Rabbit.encrypt(`${currentUser.uid}_${data.uid}`, config.constant.keyHasUrl).toString(),
      );
      return nav(`/conversation/${urlHash}`);
    }
  };

  return showAccountItem ? (
    <Fragment>
      <div className="wrapper-search-account-item">
        <div
          className={`item-search-account-item ${isMobile ? 'px-[10px]' : ''}`}
          onClick={() => onClick?.(data, addSent, isRecieveRequest, isFriend)}
        >
          <img
            className={`md:w-[40px] avatar-search-account-item ${isMobile ? 'w-[40px] xs:w-[30px]' : ''}`}
            src={data.photoURL === undefined ? '' : data.photoURL}
            alt={data.displayName}
          />
          <div
            ref={infoRef}
            className={`info-search-account-item  overflow-hidden ${isMobile ? 'pr-[70px]' : 'pr-[80px]'}`}
          >
            <h4 className={`${isMobile ? 'xs:text-[15px] text-[16px]' : 'md:text-[18px] '} name-search-account-item`}>
              <span>{data.displayName}</span>
            </h4>
            {emailToolTip === true ? (
              <Tippy content={data.email}>
                <span
                  className={`${isMobile ? ' text-[14px] xs:text-[12px]' : 'md:text-[14px]'} email-search-account-item`}
                  ref={emailRef}
                >
                  {data.email}
                </span>
              </Tippy>
            ) : (
              <span
                className={`${isMobile ? ' text-[13px] xs:text-[12px]' : 'md:text-[14px]'} email-search-account-item`}
                ref={emailRef}
              >
                {data.email}
              </span>
            )}
          </div>
        </div>
        <div className={`actions-search-account-item `}>
          {isFriend === false ? (
            isRecieveRequest === false ? (
              addSent === false ? (
                <button
                  className={`btn-add-search-account-item  ${isMobile ? 'text-[14px] p-[5px_12px]' : '!p-[5px_20px]'}`}
                  onClick={handleAdd}
                >
                  Add
                </button>
              ) : (
                <div className={`check-icon-search-account-item ${isMobile ? 'min-w-[60px]' : ''}`}>
                  <svg className="checkmark-search-account-item" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark-circle-search-account-item" cx="26" cy="26" r="25" fill="none" />
                    <path
                      className="checkmark-check-search-account-item "
                      fill="none"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    />
                  </svg>
                </div>
              )
            ) : (
              <button
                className={`accept-search-account-item  ${isMobile ? 'text-[14px] ' : ''}`}
                onClick={handleAccept}
              >
                Accept
              </button>
            )
          ) : (
            <button
              className={`btn-add-search-account-item  ${isMobile ? 'text-[14px] ' : ''}`}
              onClick={handleMessage}
            >
              Message
            </button>
          )}
        </div>
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div className="wrapper-search-account-item">
        <div className="item-search-account-item">
          <Skeleton className="md:!w-[40px] md:!h-[40px]" width={50} height={50} circle />
          <div ref={infoRef} className="info-search-account-item pr-[80px] overflow-hidden">
            <Skeleton count={2} />
          </div>
        </div>
        <div className="actions-search-account-item">
          <Skeleton duration={1} borderRadius={20} width={70} height={25} />
        </div>
      </div>
    </Fragment>
  );
}
interface SearchAccountItemProps {
  data: any;
  isFriend?: boolean;
  isRecieveRequest?: boolean;
  addSent?: boolean;
  onClick?: (data?: {}, a?: boolean, b?: boolean, c?: boolean) => void;
}
export default SearchAccountItem;
