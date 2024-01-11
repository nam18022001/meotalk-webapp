import CryptoJS from 'crypto-js';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { Fragment, useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { hourGlassIcon, lockedIcon, rightArrowIcon } from '~/assets/icons';
import AcceptConversation from '~/components/Private/AcceptConversation';

import PrivateHeader from '~/components/Private/HeaderConversation';
import PrivateInput from '~/components/Private/InputConversation';
import PrivateMessage from '~/components/Private/MessageConversation';

import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { handleReadMessagesPrivate } from '~/functions/conversation';
import { decryptAES, encryptAES } from '~/functions/hash';
import { getKeyChoosenPrivate, setLocalStorageKey } from '~/functions/private';
import { toastError } from '~/hooks/useToast';
import { collectMessagesPrivate, docChatPrivate } from '~/services/generalFirestoreServices';

function PrivateConversation() {
  const { idChatRoomPrivate } = useParams();
  const { currentUser } = useAuthContext();
  // const { isShowing, toggle } = useModal();
  const { isMobile } = useMobileContext();
  const nav = useNavigate();

  const [loadingConversation, setLoadingConversation] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(true);

  const [chatRoomId, setChatRoomId] = useState('');
  const [dataRoom, setDataRoom] = useState<any>({});

  const [isWatingAccept, setIsWatingAccept] = useState(false);
  const [recieverAccept, setRecieverAccept] = useState(false);

  const [hashMessages, sethashMessages] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [lastTimeSeen, setLastTimeSeen] = useState(0);

  const [lockRoom, setLockRoom] = useState(false);
  const [lockPass, setLockPass] = useState('');

  useEffect(() => {
    const checkUrlAndGetData = async () => {
      try {
        const idChat = CryptoJS.enc.Utf8.stringify(
          CryptoJS.Rabbit.decrypt(idChatRoomPrivate!, 'hashUrlConversationPrivate'),
        ).toString();

        if (idChat) {
          onSnapshot(docChatPrivate(idChat), (room) => {
            if (room.exists()) {
              setChatRoomId(idChat);
              setDataRoom(room.data());
              setIsWatingAccept(
                room.data().sender === currentUser.uid && room.data().isAccepted === false ? true : false,
              );
              setRecieverAccept(
                room.data().reciever === currentUser.uid && room.data().isAccepted === false ? true : false,
              );
            } else {
              setDataRoom({});
              setChatRoomId('');
              nav('/404');
            }
          });
        } else {
          nav('/404');
        }
      } catch (error) {
        nav('/404');
      }
    };
    checkUrlAndGetData();
  }, [idChatRoomPrivate]);

  useEffect(() => {
    if (Object.keys(dataRoom).length > 0) {
      onSnapshot(query(collectMessagesPrivate(dataRoom.chatRoomID), orderBy('time', 'desc')), (snap) => {
        if (!snap.empty) {
          let mess: any[] = [];
          snap.docs.map((v) => {
            mess.push(v.data());
          });
          sethashMessages(mess);
        } else {
          sethashMessages([]);
        }
      });
    }
  }, [dataRoom]);

  useEffect(() => {
    if (hashMessages.length > 0 && Object.keys(dataRoom).length > 0) {
      const enPass = getKeyChoosenPrivate(dataRoom.chatRoomID);
      if (enPass !== null && typeof enPass === 'string') {
        setLockRoom(false);
        let contents: any[] = [];
        let timeSeen: any[] = [];
        hashMessages.map((mess) => {
          let a = mess;
          a.message = decryptAES(mess.message, enPass);
          if (mess.isRead === true) {
            timeSeen.push(mess.time);
          }
          setLastTimeSeen(timeSeen[0]);
          return contents.push(a);
        });
        setMessages(contents);
      } else if (enPass === null) {
        setLockRoom(true);
      } else {
        setLockRoom(true);
      }
    } else {
      setLockRoom(false);
    }
  }, [hashMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setLoadingMessage(false);
    }
  }, [hashMessages, messages]);

  useEffect(() => {
    if (hashMessages.length > 0) {
      setLoadingConversation(false);
    }
  }, [hashMessages]);

  const handleInputLockPass = (e: any) => {
    const value = e.currentTarget.value;
    setLockPass(value);
  };

  const handleEnterRoom = () => {
    if (lockRoom && lockPass.length > 0) {
      const message = hashMessages[0].message;
      const checkMessage = decryptAES(message, lockPass);

      if (typeof checkMessage === 'string' && checkMessage !== null) {
        const encryptedPassword = encryptAES(lockPass, config.constant.keyPrivate);
        setLocalStorageKey(encryptedPassword, dataRoom.chatRoomID);
        setLockRoom(false);
      } else {
        toastError('Wrong password!');
      }
    } else {
      toastError('Password is required!');
    }
  };

  return (
    <Fragment>
      {isWatingAccept ? (
        <div className="wrapper-conversation !justify-center !items-center relative">
          {isMobile && (
            <Link to={config.routes.homePrivate} className="absolute top-[20px] left-[20px] z-[99]">
              <FaArrowLeft className="xs:text-[14px] mr-[3px] text-[16px]" />
            </Link>
          )}
          <div className="w-[150px] h-[150px] sm:w-[100px] sm:h-[100px]">
            <img className="icon-flip-animation w-full h-full object-contain" src={hourGlassIcon.icon} alt={'icon'} />
          </div>
          <div className="mt-[20px] uppercase font-mono font-semibold text-[24px] sm:text-[20px] xs:text-[16px]">
            Waiting for acceptance
          </div>
        </div>
      ) : recieverAccept ? (
        <AcceptConversation infoConversation={dataRoom} loadingConversation={loadingConversation} />
      ) : lockRoom ? (
        <div className="wrapper-conversation !justify-center !items-center relative bg-overlay-color">
          {isMobile && (
            <Link to={config.routes.homePrivate} className="absolute top-[20px] left-[20px] z-[99]">
              <FaArrowLeft className="xs:text-[14px] mr-[3px] text-[16px]" />
            </Link>
          )}
          <img className="w-[150px] h-[150px] sm:w-[100px] sm:h-[100px]" src={lockedIcon.icon} alt="ico" />
          <div className="flex items-center">
            <input
              className="w-[400px] h-[60px] sm:w-[90%] sm:h-[40px] my-[20px] bg-white rounded-s-lg px-[10px]"
              type="password"
              placeholder="Enter password"
              onChange={handleInputLockPass}
              onKeyDown={(e) => {
                if (!loadingConversation && e.keyCode == 13 && e.shiftKey == false) {
                  handleEnterRoom();
                }
              }}
            />
            <button
              onClick={handleEnterRoom}
              className=" bg-white h-[60px] w-[60px] sm:w-[40px] sm:h-[40px] rounded-e-lg"
            >
              <img className="w-full h-full" src={rightArrowIcon.icon} alt="ico" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="wrapper-conversation"
          onMouseDown={() =>
            handleReadMessagesPrivate({
              currentUser,
              chatRoomId,
              emailSeen: dataRoom.usersEmail.filter((v: any) => v !== currentUser.email)[0],
              isSender: dataRoom.sender === currentUser.uid ? true : false,
            })
          }
          onFocus={() =>
            handleReadMessagesPrivate({
              currentUser,
              chatRoomId,
              emailSeen: dataRoom.usersEmail.filter((v: any) => v !== currentUser.email)[0],
              isSender: dataRoom.sender === currentUser.uid ? true : false,
            })
          }
        >
          <PrivateHeader infoConversation={dataRoom} loadingConversation={loadingConversation} />
          <div className="messages-conversation xs:p-[5px]">
            {messages.length > 0
              ? messages.map((data: any, index) => (
                  <PrivateMessage
                    key={index}
                    data={data.message}
                    time={data.time}
                    own={data.sendBy === currentUser.email ? true : false}
                    type={data.type}
                    seenImg={dataRoom.usersPhoto.filter((v: any) => v !== currentUser.photoURL)[0]}
                    seen={data.time === lastTimeSeen ? true : false}
                    isRead={data.isRead}
                    loadingConversation={loadingMessage}
                  />
                ))
              : hashMessages.length > 0 &&
                messages.length === 0 &&
                hashMessages.map((data: any, index) => (
                  <PrivateMessage
                    key={index}
                    data={data.message}
                    time={data.time}
                    own={data.sendBy === currentUser.email ? true : false}
                    type={data.type}
                    seenImg={dataRoom.usersPhoto.filter((v: any) => v !== currentUser.photoURL)[0]}
                    seen={data.time === lastTimeSeen ? true : false}
                    isRead={data.isRead}
                    loadingConversation={true}
                  />
                ))}
          </div>
          <PrivateInput
            chatRoomId={chatRoomId}
            loadingConversation={loadingConversation}
            roomData={dataRoom}
            isSender={dataRoom.sender === currentUser.uid ? true : false}
          />
        </div>
      )}
    </Fragment>
  );
}

export default PrivateConversation;
