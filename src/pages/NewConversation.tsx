import HeadLessTippy from '@tippyjs/react/headless';
import { getDoc, onSnapshot } from 'firebase/firestore';
import { Fragment, useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import { avatarIcon } from '~/assets/icons';
import InputConversation from '~/components/InputConversation';
import MessageConversation from '~/components/MessageConversation';
import config from '~/configs';
import { useAddConversationContext } from '~/contexts/AddConversationContextProvider';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useCallContext } from '~/contexts/CallContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { usePreloadSideBarContext } from '~/contexts/PreloadSideBarProvider';
import { handleClickCall, handleClickCallVideo } from '~/functions/call';
import { handleReadMessages } from '~/functions/conversation';
import generatePermutation from '~/hooks/usePermutation';
import { getCollectionChatRoom } from '~/services/conversationServices';
import { docChatRoom } from '~/services/generalFirestoreServices';
import { searchUser } from '~/services/searchServices';

function NewConversation() {
  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();
  const { setAddTrue, users, setUsers } = useAddConversationContext();
  const { listConversation } = usePreloadSideBarContext();
  const { setPressCall } = useCallContext();

  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchRsults, setSearchResults] = useState<{}[]>([]);

  const [loading, setLoading] = useState(false);
  const [permutaion, setPermutation] = useState<any[]>([]);
  const [hasConver, setHasConver] = useState<any>({});
  const [chatRoomId, setChatRoomId] = useState('');

  const [lastStt, setLastStt] = useState(0);
  const [lastSeenGroup, setLastSeenGroup] = useState([]);
  const [messages, setMessages] = useState<any[]>([]);

  const refInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const search = async () => {
      const usersa = searchUser(searchValue);
      onSnapshot(usersa, (querySnapshot) => {
        const user: {}[] = [];
        querySnapshot.forEach((res) => {
          user.push(res.data());
        });
        setSearchResults(user);
      });
    };
    search();
  }, [searchValue]);

  useEffect(() => {
    if (users.length > 0) {
      setLoading(true);
      let userEmail: any[] = [];
      userEmail.push(currentUser.email);
      for (let i = 0; i < users.length; i++) {
        userEmail.push(users[i].email);
      }
      const finalPermutedArray = generatePermutation(userEmail);
      setPermutation(finalPermutedArray);
    } else {
      setLoading(false);
      setPermutation([]);
      setHasConver({});
    }
  }, [users]);

  useEffect(() => {
    if (permutaion.length > 1) {
      for (let i = 0; i < permutaion.length; i++) {
        let has = false;
        for (let l = 0; l < listConversation.length; l++) {
          if (JSON.stringify(listConversation[l].usersEmail) === JSON.stringify(permutaion[i])) {
            setHasConver(listConversation[l]);
            setChatRoomId(listConversation[l].chatRoomID);
            has = true;
            break;
          }
        }
        if (has === true) {
          break;
        } else {
          setHasConver({});
        }
      }
    }
  }, [permutaion, listConversation]);

  useEffect(() => {
    const check = async () => {
      if (Object.keys(hasConver).length !== 0) {
        const a = await getDoc(docChatRoom(hasConver.chatRoomID));
        if (a.exists()) {
          onSnapshot(getCollectionChatRoom({ chatRoomId: hasConver.chatRoomID }), (snapGetMessage) => {
            if (hasConver.isGroup === false) {
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
              setLoading(false);
            } else {
              let chats: any[] = [];
              let lastSttRead: any[] = [];
              snapGetMessage.forEach((res) => {
                if (res.data().isRead.length > 0) {
                  lastSttRead.push(res.data());
                }
                chats.push(res.data());
              });
              setLastSeenGroup(lastSttRead[0]);
              setLastStt(lastSttRead.length > 0 && lastSttRead[0].stt);

              setMessages(chats);
              setLoading(false);
            }
          });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setMessages([]);
        setLastStt(0);
      }
    };
    check();
  }, [hasConver]);

  useEffect(() => {
    if (users.length > 0 && Object.keys(hasConver).length === 0) {
      let userId = [currentUser.uid];
      users.forEach((id: any) => userId.push(id.uid));
      setChatRoomId(userId.join('_'));
    } else if (users.length === 0 && Object.keys(hasConver).length === 0) {
      setChatRoomId('');
    }
  }, [hasConver, users]);

  useEffect(() => {
    setAddTrue(true);

    return () => {
      setAddTrue(false);
      setUsers([]);
      setChatRoomId('');
    };
  }, []);

  const handleInput = (e: any) => {
    const searchValue: string = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };
  const handleClickAddUser = (value: any) => {
    if (users.filter((abc) => abc.email === value.email).length === 0) {
      setUsers((pre) => [...pre, value]);
      setSearchValue('');
      setShowSearch(false);
    }
  };
  const handleClearUser = (value: any) => {
    if (users.filter((abc) => abc.email === value.email).length === 1) {
      setUsers((pre) => pre.filter((abc) => abc.email !== value.email));
    }
  };

  return (
    <Fragment>
      <div className="wrapper-conversation">
        <div className="w-full min-h-[60px] max-h-screen p-[16px] shadow-bottom-line overflow-hidden">
          <div className="flex w-full h-full items-center flex-wrap">
            {isMobile && (
              <Link to={config.routes.home}>
                <FaArrowLeft className="xs:text-[14px] mr-[3px] text-[16px]" />
              </Link>
            )}
            <div className="">To:&nbsp;</div>
            {users.length > 0 &&
              users.map((u: any, index) => (
                <div
                  key={index}
                  className="xs:mx-[3px] xs:py-[1px] xs:px-[2px] mx-[5px] my-[2px] px-[4px] py-[3px] flex items-start bg-[#4e4e4e] rounded-[8px]"
                >
                  <div className="flex items-center">
                    <span className="text-[#3da7db] xs:text-[12px]">{u.email}</span>
                    <IoCloseSharp
                      onClick={() => handleClearUser(u)}
                      className="xs:text-[20px] xs:p-[2px] text-[30px] mx-[5px] text-[#94d8fa] hover:bg-primary-color rounded-full p-[5px] cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            <HeadLessTippy
              interactive
              visible={showSearch}
              placement={isMobile ? 'bottom' : 'bottom-start'}
              onClickOutside={() => {
                refInput.current?.focus();
                setShowSearch(false);
              }}
              render={(attrs) => (
                <div
                  className={`${
                    isMobile ? 'w-[calc(100vw-30px)]' : ''
                  } w-[328px] h-[350px] max-h-full search-result-headless`}
                  tabIndex={-1}
                  {...attrs}
                >
                  <div className="list-account-headless">
                    {searchRsults.length > 0 &&
                      searchRsults.map((result: any, index) => (
                        <div
                          key={index}
                          className="cursor-pointer flex items-center my-[10px] p-[5px_10px] hover:bg-primary-opacity-color"
                          onClick={() => handleClickAddUser(result)}
                        >
                          <img
                            className="w-[36px] xs:w-[25px] md:w-[30px] rounded-full object-contain"
                            src={result.photoURL}
                            onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                            alt="url"
                          />
                          <div className="ml-[10px] xs:ml-[5px] flex-1 xs:text-[14px] md:text-[16px]">
                            {result.email}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            >
              <input
                ref={refInput}
                onFocus={() => setShowSearch(true)}
                value={searchValue}
                onChange={(e) => handleInput(e)}
                spellCheck={false}
                placeholder="Search with email"
              />
            </HeadLessTippy>
          </div>
        </div>
        {!loading ? (
          users.length > 0 && (
            <Fragment>
              <div
                className="messages-conversation xs:p-[5px]"
                onMouseDown={() => handleReadMessages({ currentUser, chatRoomId, userInfo: users })}
                onFocus={() => handleReadMessages({ currentUser, chatRoomId, userInfo: users })}
              >
                {Object.keys(hasConver).length !== 0 ? (
                  hasConver.isGroup === false ? (
                    messages.map((data: any, index) => (
                      <MessageConversation
                        key={index}
                        data={data.message}
                        time={data.time}
                        own={data.sendBy === currentUser.email ? true : false}
                        type={data.type}
                        seenImg={users.length > 0 ? users[0].photoURL : ''}
                        seen={data.stt === lastStt ? true : false}
                        isRead={data.isRead}
                        onClickVideoRecall={() =>
                          handleClickCallVideo({
                            chatRoomId: hasConver.chatRoomID,
                            currentUser,
                            userInfo: users,
                            setPressCall,
                          })
                        }
                        onClickReCall={() =>
                          handleClickCall({
                            chatRoomId: hasConver.chatRoomID,
                            currentUser,
                            userInfo: users,
                            setPressCall,
                          })
                        }
                      />
                    ))
                  ) : (
                    messages.map((data: any, index) => (
                      <MessageConversation
                        key={index}
                        isGroup={true}
                        data={data.message}
                        time={data.time}
                        own={data.sendBy === currentUser.email ? true : false}
                        type={data.type}
                        seen={data.stt === lastStt ? true : false}
                        photoSender={data.photoSender}
                        seenGroup={lastSeenGroup}
                        onClickVideoRecall={() =>
                          handleClickCallVideo({
                            chatRoomId: hasConver.chatRoomID,
                            currentUser,
                            userInfo: users,
                            setPressCall,
                          })
                        }
                        onClickReCall={() =>
                          handleClickCall({
                            chatRoomId: hasConver.chatRoomID,
                            currentUser,
                            userInfo: users,
                            setPressCall,
                          })
                        }
                      />
                    ))
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {users.length === 1 && (
                      <img
                        className="rounded-full"
                        src={users[0].photoURL}
                        onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                      />
                    )}
                    {users.length > 1 && (
                      <div className="w-ful flex xs:px-[15px] px-[30px] overflow-hidden">
                        {users.map((user, index) => (
                          <img
                            key={index}
                            className="xs:w-[50px] sm:w-[70px] sm:-ml-[20px] xs:-ml-[15px] rounded-full -ml-[30px] border-[2px] border-solid border-black"
                            src={user.photoURL}
                            onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                          />
                        ))}
                      </div>
                    )}
                    {users.length === 1 && (
                      <div className="text-[20px] xs:text-[14px] xs:mt-[10px] mt-[20px]">
                        Tin nhắn mới tới <span className="font-semibold">{users[0].displayName}</span>
                      </div>
                    )}
                    {users.length > 1 && (
                      <div className="w-ful flex px-[30px] xs:px-[15px] overflow-hidden">
                        <div className="text-[20px] xs:text-[14px] mt-[20px] xs:mt-[10px]">
                          Tin nhắn mới tới
                          <span className="font-semibold">
                            {users.map((user, index) =>
                              index !== users.length - 1 ? user.displayName + ', ' : user.displayName,
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <InputConversation
                chatRoomId={Object.keys(hasConver).length !== 0 ? hasConver.chatRoomID : chatRoomId}
                loadingConversation={users.length > 0 ? false : true}
                newConversation={Object.keys(hasConver).length === 0 && users.length > 0 ? true : false}
                dataUserNewConver={users}
                isGroup={Object.keys(hasConver).length !== 0 ? hasConver.isGroup : users.length > 1 ? true : false}
                from="new"
                handleReadMessages={() => handleReadMessages({ currentUser, chatRoomId, userInfo: users })}
                infoFriend={users}
              />
            </Fragment>
          )
        ) : (
          <div className="w-full h-full">
            <div className="loader-wrapper-conversation">
              <div className="loader-conversation"></div>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

export default NewConversation;
