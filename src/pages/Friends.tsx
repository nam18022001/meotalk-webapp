import CryptoJS from 'crypto-js';
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { Dispatch, Fragment, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ToolTip from '@tippyjs/react';
import { BsArrowLeft } from 'react-icons/bs';

import { CurrentUserContents, useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { db } from '~/services/FirebaseServices';
import { queryGetFriendRequests, queryGetMyRequests } from '~/services/friendServices';
import { collectListFriend } from '~/services/generalFirestoreServices';
import { makeConversation } from '~/services/searchServices';
import config from '~/configs';

function Friends() {
  const { search } = useLocation();
  const { currentUser } = useAuthContext();
  const { isMobile } = useMobileContext();

  const nav = useNavigate();
  const [param, setParam] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [listfriendData, setListFriendData] = useState<any[]>([]);
  const [myRequestData, setMyRequestData] = useState<any[]>([]);
  const [friendRequestData, setFriendRequestData] = useState<any[]>([]);

  useEffect(() => {
    const query = search.replace('?q=', '');
    if (
      search !== undefined &&
      search.length > 0 &&
      search.startsWith('?q=') &&
      (query === 'listfriend' || query === 'friendsrequest' || query === 'myrequests')
    ) {
      setParam(query);
    } else {
      nav(-1);
    }
  }, [search]);

  useEffect(() => {
    onSnapshot(collectListFriend(currentUser!.uid!), (snapData) => {
      if (!snapData.empty) {
        let listfriend: any[] = [];
        snapData.docs.map((data) => listfriend.push(data.data()));
        setListFriendData(listfriend);
      } else {
        setListFriendData([]);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    onSnapshot(queryGetMyRequests(currentUser!.uid!), (snapData) => {
      if (!snapData.empty) {
        let myrequest: any[] = [];
        snapData.docs.map((data) => myrequest.push(data.data()));
        setMyRequestData(myrequest);
      } else {
        setMyRequestData([]);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    onSnapshot(queryGetFriendRequests(currentUser!.uid!), (snapData) => {
      if (!snapData.empty) {
        let friendsRequest: any[] = [];
        snapData.docs.map((data) => friendsRequest.push(data.data()));
        setFriendRequestData(friendsRequest);
      } else {
        setFriendRequestData([]);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    switch (param) {
      case 'listfriend':
        return setActiveTab(1);
      case 'myrequests':
        return setActiveTab(2);
      case 'friendsrequest':
        return setActiveTab(3);
      default:
        return setActiveTab(1);
    }
  }, [param]);

  const render = () => {
    const Layout = ({ children }: { children: ReactNode }) => (
      <div className="xl:max-w-[50%] lg:max-w-[70%] w-full h-full overflow-x-hidden overflow-y-auto">{children}</div>
    );
    if (param.length > 0) {
      switch (param) {
        case 'listfriend':
          return (
            <Layout>
              <ListFriend data={listfriendData} isMobile={isMobile} currentUser={currentUser} />
            </Layout>
          );
        case 'friendsrequest':
          return (
            <Layout>
              <FriendsRequest data={friendRequestData} currentUser={currentUser} />
            </Layout>
          );
        case 'myrequests':
          return (
            <Layout>
              <MyRequests data={myRequestData} currentUser={currentUser} />
            </Layout>
          );

        default:
          break;
      }
    }
  };
  const handleGoBack = () => {
    nav(config.routes.home);
  };

  return (
    <Fragment>
      <div className="w-screen h-full min-w-[282px] overflow-hidden flex flex-col items-center p-[20px_10px]">
        <div className="xl:w-1/2 lg:w-1/2 md:w-2/3 sm:w-full mb-[30px]">
          <ToolTip content="Back to home" placement="right" arrow>
            <button className="icon-goback-profile static xs:left-[10px]" onClick={handleGoBack}>
              <BsArrowLeft />
            </button>
          </ToolTip>
        </div>
        <Tabs activeTab={activeTab} setActiveTab={setParam} />
        {render()}
      </div>
    </Fragment>
  );
}

const ListFriend = ({ data, isMobile, currentUser }: data) => {
  const nav = useNavigate();

  const handleMessage = async (dataUser: CurrentUserContents) => {
    let hasMessage: boolean = false;

    const checkDoc = [`${currentUser.uid}_${dataUser.uid}`, `${dataUser.uid}_${currentUser.uid}`];
    for (let i = 0; i < checkDoc.length; i++) {
      const chatDoc = collection(db, 'ChatRoom');
      const qChatDoc = query(chatDoc, where('chatRoomID', '==', checkDoc[i]));
      const getChatRoom = await getDocs(qChatDoc);

      if (!getChatRoom.empty) {
        const chatGet = getChatRoom.docs[0];
        hasMessage = true;
        const urlHash = encodeURIComponent(CryptoJS.Rabbit.encrypt(chatGet.id, 'hashUrlConversation').toString());
        return nav(`/conversation/${urlHash}`);
      }
    }

    if (!hasMessage) {
      await makeConversation({ currentUser: currentUser, data: dataUser });
      const urlHash = encodeURIComponent(
        CryptoJS.Rabbit.encrypt(`${currentUser.uid}_${dataUser.uid}`, 'hashUrlConversation').toString(),
      );
      return nav(`/conversation/${urlHash}`);
    }
  };
  return data.map((v: any, index: number) => (
    <Link
      to={`/profile/${encodeURIComponent(CryptoJS.Rabbit.encrypt(v.uid, 'hashUrlProfile').toString())}`}
      state={{ data: v, addSent: false, isRecieveRequest: false, isFriend: true }}
      key={index}
      className="h-[80px] sm:h-[60px] flex items-center justify-between my-[5px] px-[10px] rounded-xl hover:bg-primary-opacity-color"
    >
      <img className="w-[50px] h-[50px] sm:w-[40px] sm:h-[40px] rounded-full object-cover" src={v.photoURL} />
      <div className="flex-1 flex flex-col justify-between ml-[10px] whitespace-nowrap  text-ellipsis overflow-x-hidden">
        <div className="font-semibold text-[20px] sm:text-[18px] ">{v.displayName}</div>
        <div className="sm:text-[14px]">{v.email}</div>
      </div>
      <button
        className={`btn-add-search-account-item  ${isMobile ? 'text-[14px] ' : ''}`}
        onClick={() => handleMessage(v)}
      >
        Message
      </button>
    </Link>
  ));
};
const FriendsRequest = ({ data, isMobile, currentUser }: data) => {
  const handleAccept = async (dataUser: any) => {
    const friendsDoc = doc(db, 'users', `${currentUser.uid}`, 'friends', dataUser.sender);
    const senderfriendsDoc = doc(db, 'users', `${dataUser.sender}`, 'friends', `${currentUser.uid}`);
    const recieveFriendDoc = doc(db, 'makeFriends', `${dataUser.sender}_${currentUser.uid}`);

    await setDoc(friendsDoc, {
      uid: dataUser.sender,
      displayName: dataUser.nameSender,
      email: dataUser.emailSender,
      photoURL: dataUser.photoSender,
    });
    await setDoc(senderfriendsDoc, {
      uid: dataUser.reciever,
      displayName: dataUser.nameReciever,
      email: dataUser.emailReciever,
      photoURL: dataUser.photoReciever,
    });
    await deleteDoc(recieveFriendDoc);
  };
  const handleCancel = async (dataUser: any) => {
    const recieveFriendDoc = doc(db, 'makeFriends', `${dataUser.sender}_${currentUser.uid}`);

    await deleteDoc(recieveFriendDoc);
  };
  return data.length > 0 ? (
    data.map((v: any, index: number) => (
      <Link
        to={`/profile/${encodeURIComponent(CryptoJS.Rabbit.encrypt(v.sender, 'hashUrlProfile').toString())}`}
        state={{
          data: { uid: v.sender, displayName: v.nameSender, photoURL: v.photoSender, email: v.emailSender },
          addSent: false,
          isRecieveRequest: true,
          isFriend: false,
        }}
        key={index}
        className="h-[80px] sm:h-[60px] flex items-center justify-between my-[5px] px-[10px] rounded-xl hover:bg-primary-opacity-color"
      >
        <img className="w-[50px] h-[50px] sm:w-[40px] sm:h-[40px] rounded-full object-cover" src={v.photoSender} />
        <div className="flex-1 flex flex-col justify-between ml-[10px] whitespace-nowrap  text-ellipsis overflow-x-hidden">
          <div className="font-semibold text-[20px] sm:text-[18px] ">{v.nameSender}</div>
          <div className="sm:text-[14px]">{v.emailSender}</div>
        </div>
        <div className="flex items-center">
          <button
            className={`btn-add-search-account-item  ${isMobile ? 'text-[14px] ' : ''}`}
            onClick={() => handleAccept(v)}
          >
            Accept
          </button>
          <button
            className={`accept-search-account-item text-danger-color ml-[5px]  ${isMobile ? 'text-[14px] ' : ''}`}
            onClick={() => handleCancel(v)}
          >
            Refuse
          </button>
        </div>
      </Link>
    ))
  ) : (
    <p className="text-center font-bold text-[24px] text-warning-color">No request yet!</p>
  );
};
const MyRequests = ({ data, isMobile, currentUser }: data) => {
  const handleCancel = async (dataUser: any) => {
    const recieveFriendDoc = doc(db, 'makeFriends', `${currentUser.uid}_${dataUser.reciever}`);
    await deleteDoc(recieveFriendDoc);
  };
  return data.length > 0 ? (
    data.map((v: any, index: number) => (
      <Link
        to={`/profile/${encodeURIComponent(CryptoJS.Rabbit.encrypt(v.reciever, 'hashUrlProfile').toString())}`}
        state={{
          data: { uid: v.reciever, displayName: v.nameReciever, photoURL: v.photoReciever, email: v.emailReciever },
          addSent: true,
          isRecieveRequest: false,
          isFriend: false,
        }}
        key={index}
        className="h-[80px] sm:h-[60px] flex items-center justify-between my-[5px] px-[10px] rounded-xl hover:bg-primary-opacity-color"
      >
        <img className="w-[50px] h-[50px] sm:w-[40px] sm:h-[40px] rounded-full object-cover" src={v.photoReciever} />
        <div className="flex-1 flex flex-col justify-between ml-[10px] whitespace-nowrap  text-ellipsis overflow-x-hidden">
          <div className="font-semibold text-[20px] sm:text-[18px] ">{v.nameReciever}</div>
          <div className="sm:text-[14px]">{v.emailReciever}</div>
        </div>
        <button
          className={`accept-search-account-item text-danger-color  ${isMobile ? 'text-[14px] ' : ''}`}
          onClick={() => handleCancel(v)}
        >
          Cancel
        </button>
      </Link>
    ))
  ) : (
    <p className="text-center font-bold text-[24px] text-warning-color">No request yet!</p>
  );
};

const Tabs = ({ activeTab }: TabsProps) => {
  const indicateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabWidth = indicateRef?.current?.offsetWidth;
    const transformValue = `translateX(${(activeTab - 1) * tabWidth!}px)`;
    indicateRef!.current!.style.transform = transformValue;
  }, [activeTab]);

  return (
    <div className="xl:w-1/2 lg:w-1/2 md:w-2/3 sm:w-full mb-[30px]">
      <div className="tab-container relative sm:text-[14px] whitespace-nowrap">
        <div>
          <Link to={'/friends?q=listfriend'} className={`tab-btn ${activeTab === 1 && 'active'}`}>
            My Friends
          </Link>
        </div>
        <div>
          <Link to={'/friends?q=myrequests'} className={`tab-btn ${activeTab === 2 && 'active'}`}>
            My Requests
          </Link>
        </div>
        <div>
          <Link to={'/friends?q=friendsrequest'} className={`tab-btn ${activeTab === 3 && 'active'}`}>
            Friends Request
          </Link>
        </div>
        <div ref={indicateRef} className="tab-indicate -bottom-[5px]">
          <div className="w-1/2 bg-primary-color h-full rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

interface TabsProps {
  activeTab: any;
  setActiveTab: Dispatch<SetStateAction<any>>;
}
interface data {
  data: any;
  isMobile?: boolean;
  currentUser: CurrentUserContents;
}
export default Friends;
