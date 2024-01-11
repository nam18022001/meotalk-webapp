import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiXCircle } from 'react-icons/hi';
import { ImSpinner } from 'react-icons/im';
import { IoMdClose } from 'react-icons/io';
import { IoRemoveOutline } from 'react-icons/io5';
import { RiChatPrivateLine } from 'react-icons/ri';

import config from '~/configs';
import { encryptAES } from '~/functions/hash';
import { setLocalStorageKey } from '~/functions/private';
import useDebounce from '~/hooks/useDebounce';
import { toastError } from '~/hooks/useToast';
import { db } from '~/services/FirebaseServices';
import { makeNewConversationPrivate } from '~/services/newChatServices';
import { searchUser } from '~/services/searchServices';
import { CurrentUserContents, useAuthContext } from './AuthContextProvider';
import { useMobileContext } from './MobileVersionContextProvider';

function AddConversationContextProvider({ children }: AddConversationContextProviderProps) {
  const [addTrue, setAddTrue] = useState<boolean>(false);
  const [users, setUsers] = useState<any>([]);

  const [showModelPrivate, setShowModalPrivate] = useState(false);

  const [show, setShow] = useState(false);

  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();
  // state
  const [searchValue, setSearchValue] = useState('');
  const [searchRsults, setSearchResults] = useState<{}[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // select
  const [selected, setSelected] = useState<{ data?: CurrentUserContents; isSelected: boolean }>({ isSelected: false });
  const [showInputPass, setShowInputPass] = useState(false);

  const [password, setPassWord] = useState({ data: '', show: false });

  // hook make by myseft
  const debounced = useDebounce(searchValue, 600);
  const inputref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!debounced.trim()) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      const users = searchUser(debounced);
      onSnapshot(users, (querySnapshot) => {
        const user: {}[] = [];
        querySnapshot.forEach((res) => {
          user.push(res.data());
        });
        setSearchResults(user);
      });
    };
    search();
  }, [debounced]);

  useEffect(() => {
    if (searchValue.length > 0) {
      setIsLoading(true);
      if (searchRsults.length > 0) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [searchValue, searchRsults]);

  useEffect(() => {
    let timmout: any;
    if (showModelPrivate === false) {
      timmout = setTimeout(() => {
        setShow(false);
      }, 450);
    } else {
      setShow(true);
    }
    return () => clearTimeout(timmout);
  }, [showModelPrivate]);
  useEffect(() => {
    let timmout: any;
    if (selected.isSelected === false) {
      timmout = setTimeout(() => {
        setShowInputPass(false);
      }, 450);
    } else {
      setShowInputPass(true);
    }
    return () => clearTimeout(timmout);
  }, [selected]);

  const handleInput = (e: any) => {
    const searchValue: string = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };
  const handleClickClear = () => {
    setSearchValue('');
    inputref?.current?.focus();
    setSearchResults([]);
    setSelected({ isSelected: false });
  };
  const handleClose = () => {
    setShowModalPrivate(false);
    setSearchValue('');
    setSearchResults([]);
    setSelected({ isSelected: false });
  };
  const handleSelected = (data: any) => {
    setShowInputPass(true);
    setSelected({ isSelected: true, data });
  };
  const handleCloseSelected = () => {
    setSelected({ isSelected: false });
  };

  const handleInputPassWord = (e: any) => {
    const value = e.currentTarget.value;
    setPassWord((pre) => ({ data: value, show: pre.show }));
  };
  const handleMakeConver = async () => {
    if (password.data.length > 3 && password.data.length <= 10) {
      const hasSpace = /\s/.test(password.data);
      if (!hasSpace) {
        if (selected.data !== undefined && Object.keys(selected?.data!).length > 0) {
          const encryptedPassword = encryptAES(password.data, config.constant.keyPrivate);
          const chatRoomId = `${currentUser.uid}_${selected.data.uid}`;
          let usersEmail: any[] = [currentUser.email];
          let usersUid: any[] = [currentUser.uid];
          let usersPhoto: any[] = [currentUser.photoURL];
          let usersDisplayName: any[] = [currentUser.displayName];
          usersEmail.push(selected.data.email);
          usersUid.push(selected.data.uid);
          usersPhoto.push(selected.data.photoURL);
          usersDisplayName.push(selected.data.displayName);
          await makeNewConversationPrivate({
            chatRoomId,
            usersEmail,
            usersUid,
            usersPhoto,
            usersDisplayName,
            reciever: selected.data.uid!,
            sender: currentUser.uid!,
            key: encryptedPassword,
          }).then(async (_) => {
            await addDoc(collection(db, 'ChatPrivate', chatRoomId, 'chats'), {
              isRead: false,
              message: encryptAES(`${currentUser.displayName} has created this room.`, password.data),
              sendBy: currentUser.email,
              time: Date.now(),
              type: 'notification',
            });
            setLocalStorageKey(encryptedPassword, chatRoomId);
            setPassWord({ data: '', show: false });

            handleClose();
          });
        }
      } else {
        toastError('The password must not contain any whitespace characters');
      }
    } else {
      toastError('The password must be longer than and shorter than or equal to 10 characters');
    }
  };

  return (
    <AddConversationContext.Provider value={{ addTrue, setAddTrue, users, setUsers, setShowModalPrivate }}>
      {window.location.pathname.startsWith(config.routes.homePrivate) &&
        ReactDOM.createPortal(
          <Fragment>
            {show && (
              <div className="fixed w-screen h-screen top-0 left-0 z-[1024] bg-overlay-color" onClick={handleClose} />
            )}
            <div
              className={`${
                show ? 'block' : 'hidden'
              } fixed top-1/2 left-1/2 w-fit h-fit -translate-x-1/2 -translate-y-1/2 flex  z-[1025]`}
            >
              <div
                className={`${
                  showModelPrivate ? 'show-add-private' : 'unmount-add-private'
                } w-[calc(100vw_/_1.75)] h-[calc(100vh_/_1.5)] lg:w-[calc(100vw_/_1.4)] sm:px-[10px] xs:px-[5px] md:w-[calc(100vw_/_1.2)] flex flex-col justify-between items-center sm:w-[calc(100vw_/_1.1)] sm:h-[calc(100vh_/_1.1)] xs:w-[calc(100vw_/_1.03)]  bg-white z-50 select-auto rounded-[20px] px-[20px] py-[10px] shadow-[#000000b6] shadow-lg`}
              >
                <div className="w-full flex justify-between items-center">
                  <div></div>
                  <div className="text-[22px] lg:text-[20px] sm:text-[16px] xs:text-[14px] font-mono font-semibold">
                    Make Security Conversation
                  </div>
                  <button
                    onClick={handleClose}
                    className="rounded-full border border-solid border-danger-color p-[10px] sm:p-[5px] xs:p-[3px] text-[20px] hover:bg-danger-color hover:text-white group/close-icon-add-private"
                  >
                    <IoMdClose className="text-danger-color  group-hover/close-icon-add-private:text-white" />
                  </button>
                </div>
                <div className="flex-1 my-[10px] w-full flex flex-col items-center overflow-hidden">
                  <div
                    className={`${
                      isMobile
                        ? 'w-full h-[45px] xs:h-[35px]'
                        : 'w-[60%] lg:w-2/3 md:w-4/5 sm:w-[90%] xs:w-[95%] h-search-sidebar-height sm:h-[40px]'
                    }  rounded-[20px] bg-primary-super-opacity-color px-[10px] xs:px-[5px] relative flex items-center justify-between`}
                  >
                    <input
                      ref={inputref}
                      className={`flex-1 w-full h-full search-input ${isMobile ? 'text-[14px] pr-[10px]' : ''}`}
                      value={searchValue}
                      onChange={(e) => handleInput(e)}
                      spellCheck={false}
                      placeholder="Find your friends by email"
                    />
                    {!!searchValue && !isLoading && searchRsults.length > 0 && (
                      <button
                        className={`${
                          isMobile ? 'text-[14px]' : 'text-[20px] xs:text-[16px]'
                        }  text-search-icon-color `}
                        onClick={handleClickClear}
                      >
                        <HiXCircle />
                      </button>
                    )}
                    {isLoading && searchRsults.length < 1 && (
                      <ImSpinner
                        className={`${
                          isMobile ? 'text-[14px]' : 'text-[20px] xs:text-[16px]'
                        } text-search-icon-color animate-spin`}
                      />
                    )}
                  </div>
                  <div
                    className={`overflow-y-auto flex-1 w-[60%] lg:w-2/3 md:w-4/5 sm:w-[90%] xs:w-[95%] px-[10px] xs:px-[5px] relative`}
                  >
                    {searchRsults.length > 0 &&
                      searchRsults.map((result: any, index) => {
                        if (result.uid !== currentUser.uid)
                          return (
                            <Fragment key={index}>
                              <div className="w-full h-[60px] xs:h-[40px] p-[10px] xs:p-[5px] my-[5px] rounded-[10px] hover:bg-primary-super-opacity-color flex justify-between items-center group/searchResult">
                                <img
                                  className={`md:w-[40px] avatar-search-account-item ${
                                    isMobile ? 'w-[40px] xs:w-[30px]' : 'xs:w-[30px]'
                                  }`}
                                  src={result.photoURL === undefined ? '' : result.photoURL}
                                  alt={result.displayName}
                                />
                                <div
                                  className={`info-search-account-item  overflow-hidden text-ellipsis whitespace-nowrap`}
                                >
                                  <h4
                                    className={`${
                                      isMobile
                                        ? 'xs:text-[15px] text-[16px]'
                                        : 'md:text-[18px]  sm:text-[16px] xs:text-[14px]'
                                    } name-search-account-item`}
                                  >
                                    <span>{result.displayName}</span>
                                  </h4>

                                  <span
                                    className={`${
                                      isMobile
                                        ? ' text-[13px] xs:text-[12px]'
                                        : 'md:text-[14px] sm:text-[14px] xs:text-[12px]'
                                    } email-search-account-item`}
                                  >
                                    {result.email}
                                  </span>
                                </div>
                                <button
                                  className={isMobile ? 'block' : 'hidden group-hover/searchResult:block'}
                                  onClick={() => handleSelected(result)}
                                >
                                  <RiChatPrivateLine className="text-[30px] sm:text-[24px] text-primary-color" />
                                </button>
                              </div>
                            </Fragment>
                          );
                        else return null;
                      })}
                  </div>
                </div>
                <div></div>
              </div>
            </div>
            <div
              className={`${
                showInputPass ? 'block' : 'hidden'
              } fixed top-1/2 left-1/2 w-fit h-fit -translate-x-1/2 -translate-y-1/2 flex  z-[1026]`}
            >
              <div
                className={`${
                  selected.isSelected ? 'show-add-private' : 'unmount-add-private'
                } w-[calc(100vw_/_2)] h-[calc(100vh_/_1.65)] sm:h-[calc(100vh_/_1.5)] sm:px-[10px] xs:px-[5px] md:w-[calc(100vw_/_1.8)] flex flex-col justify-between items-center sm:w-[calc(100vw_/_1.3)] xs:w-[calc(100vw_/_1.1)]  bg-white z-50 select-auto rounded-[20px] px-[20px] py-[10px] shadow-[#000000b6] shadow-lg`}
              >
                <div className="w-full flex justify-between items-center">
                  <div></div>
                  <div className="text-[22px] lg:text-[20px] sm:text-[16px] xs:text-[14px] font-mono font-semibold">
                    Read instructions and input password
                  </div>
                  <button
                    onClick={handleCloseSelected}
                    className="rounded-full border border-solid border-danger-color p-[10px] sm:p-[5px] xs:p-[3px] text-[20px] hover:bg-danger-color hover:text-white group/close-icon-add-private"
                  >
                    <IoRemoveOutline className="text-danger-color  group-hover/close-icon-add-private:text-white" />
                  </button>
                </div>
                <div className="w-full h-full flex flex-col mt-[10px] overflow-hidden">
                  <div className=" overflow-auto">
                    <div className="flex lg:flex-col md:flex-col sm:flex-col items-start justify-start">
                      <span className="lg:text-[18px] md:text-[16px] sm:text-[16px]  underline underline-offset-8 font-bold text-[20px] text-danger-color">
                        Important Notes:
                      </span>
                      <ol className="ml-[25px] list-decimal flex-1 mt-[5px] ">
                        <li className="font-semibold lg:text-[16px] md:text-[14px] sm:text-[14px]">
                          The password for this conversation is secure; you need to keep it stored to access the chat.
                          If you forget or lose the password, there is no way to recover it, and even MeoTalk cannot
                          assist you in retrieving it.
                        </li>
                        <li className="font-semibold lg:text-[16px] md:text-[14px] sm:text-[14px]">
                          Apart from those in this conversation, you are not allowed to provide the password to anyone,
                          including MeoTalk.
                        </li>
                      </ol>
                    </div>
                  </div>
                  <div className=" flex-1 flex flex-col items-center  px-[20px] sm:px-[10px] my-[20px]">
                    <div className="flex w-2/3 md:w-full sm:w-full h-[40px] px-[10px] bg-slate-200 rounded-[10px]">
                      <input
                        type={password.show ? 'text' : 'password'}
                        className="w-full h-full"
                        placeholder="Enter Password"
                        onChange={handleInputPassWord}
                      />
                      <button
                        onClick={() => {
                          setPassWord((pre) => ({ data: pre.data, show: !pre.show }));
                        }}
                      >
                        {password.show ? (
                          <FaEye className="text-[20px] text-warning-color" />
                        ) : (
                          <FaEyeSlash className="text-[20px] text-warning-color" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={handleMakeConver}
                      className="w-2/3 md:w-full sm:w-full py-[10px] px-[10px] rounded-[20px] mt-[10px] font-semibold uppercase whitespace-nowrap bg-success-color text-white hover:border-success-color hover:text-success-color hover:bg-white border border-solid border-transparent"
                    >
                      Create conversation
                    </button>
                  </div>
                  <p className="text-warning-color font-medium sm:text-[14px] xs:text-[12px]">
                    The password accepts all characters except spaces, must be longer than 3 characters, and shorter
                    than or equal to 10 characters.
                  </p>
                </div>
              </div>
            </div>
          </Fragment>,
          document.body,
        )}
      {children}
    </AddConversationContext.Provider>
  );
}

const AddConversationContext = createContext<AddConversationContent>({
  addTrue: false,
  setAddTrue: () => {},
  users: [],
  setUsers: () => {},
  setShowModalPrivate: () => {},
});

interface AddConversationContextProviderProps {
  children: ReactNode;
}
type AddConversationContent = {
  addTrue: boolean;
  setAddTrue: Dispatch<SetStateAction<boolean>>;
  users: any[];
  setUsers: Dispatch<SetStateAction<any[]>>;
  setShowModalPrivate: Dispatch<SetStateAction<boolean>>;
};
export const useAddConversationContext = () => useContext(AddConversationContext);
export default AddConversationContextProvider;
