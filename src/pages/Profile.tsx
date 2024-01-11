import CryptoJS from 'crypto-js';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ToolTip from '@tippyjs/react';
import { BsArrowLeft, BsThreeDots } from 'react-icons/bs';

import { collection, deleteDoc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { avatarIcon } from '~/assets/icons';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { db } from '~/services/FirebaseServices';
import {
  collectionFriends,
  collectionMakeFriends,
  docMakeFriends,
  docMyFriends,
  docUsers,
  makeDocMakeFriends,
} from '~/services/generalFirestoreServices';
import { logout } from '~/services/loginServices';
import { addFriend, makeConversation } from '~/services/searchServices';
function Profile() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { currentUser } = useAuthContext();
  const { uidProfile } = useParams();

  let deHash: any;
  let uidPar: string = '';
  let makeFriendsDoc: any;

  const [dataUser, setDataUser] = useState<{
    uid: string | null | '';
    displayName: string | null | '';
    email: string | null | '';
    photoURL: string | null | '';
  }>({
    uid: '',
    displayName: '',
    email: '',
    photoURL: '',
  });

  try {
    deHash = CryptoJS.Rabbit.decrypt(uidProfile!.toString(), 'hashUrlProfile');
    uidPar = CryptoJS.enc.Utf8.stringify(deHash);
    // Doc
    // friendsDoc = makeDocMakeFriends(currentUser, dataUser);
    makeFriendsDoc = makeDocMakeFriends(currentUser, dataUser);
    // const recieveFriendDoc = doc(db, 'makeFriends', `${data.uid}_${currentUser.uid}`);
  } catch (error) {}

  const [addSent, setAddSent] = useState(false);
  const [isRecieveRequest, setIsRecieveRequest] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const [numFr, setNumFr] = useState(0);
  const [photoFriends, setPhotoFriends] = useState<any[]>([]);

  useEffect(() => {
    const checkURl = async () => {
      const check = await getDoc(docUsers(uidPar));
      if (check.exists()) {
        if (currentUser.uid === uidPar) {
          const qFriends = collectionFriends(uidPar);

          onSnapshot(qFriends, (snapGetFriends) => {
            if (!snapGetFriends.empty) {
              setNumFr(snapGetFriends.size);
              let avatarFriends: {}[] = [];
              snapGetFriends.forEach((resFr) => {
                avatarFriends.push(resFr.data().photoURL);
              });

              setPhotoFriends(avatarFriends.slice(0, 5));
            }
          });
          setDataUser(currentUser);
        } else if (state === undefined || state === null) {
          const hastUrlProfile = CryptoJS.Rabbit.encrypt(currentUser!.uid!, 'hashUrlProfile').toString();
          nav('/profile/' + encodeURIComponent(hastUrlProfile));
        } else {
          setAddSent(state.addSent);
          setIsFriend(state.isFriend);
          setIsRecieveRequest(state.isRecieveRequest);
          setDataUser(state.data);
          const qFriends = collectionFriends(uidPar);
          onSnapshot(qFriends, (snapGetFriends) => {
            if (!snapGetFriends.empty) {
              setNumFr(snapGetFriends.size);
              let avatarFriends: {}[] = [];
              snapGetFriends.forEach((resFr) => {
                avatarFriends.push(resFr.data().photoURL);
              });

              setPhotoFriends(avatarFriends.slice(0, 5));
            }
          });
        }
      } else {
        nav(config.routes.home);
      }
    };
    if (uidPar !== '') {
      checkURl();
    } else {
      nav(config.routes.home);
    }
  }, [uidPar, state]);

  const handleGoBack = () => {
    nav(-1);
  };
  const handleLogOut = async () => {
    await logout();
  };

  const handleCancelAdd = async () => {
    const qAdd = query(
      collectionMakeFriends(),
      where('sender', '==', currentUser.uid),
      where('reciever', '==', dataUser.uid),
    );
    const getSend = await getDocs(qAdd);
    const idAddSend = getSend.docs[0].id;
    window.history.replaceState({}, document.title);
    await deleteDoc(docMakeFriends(idAddSend));
    return setAddSent(false);
  };
  const handleRefuse = async () => {
    const qAdd = query(
      collectionMakeFriends(),
      where('reciever', '==', currentUser.uid),
      where('sender', '==', dataUser.uid),
    );
    const getSend = await getDocs(qAdd);
    const idAddSend = getSend.docs[0].id;
    window.history.replaceState({}, document.title);
    await deleteDoc(docMakeFriends(idAddSend));
    return setIsRecieveRequest(false);
  };
  const handleUnFriend = async () => {
    window.history.replaceState({}, document.title);
    await deleteDoc(docMyFriends(currentUser!.uid!, dataUser!.uid!));
    await deleteDoc(docMyFriends(dataUser!.uid!, currentUser!.uid!));
    return setIsFriend(false);
  };
  const handleMessage = async () => {
    let hasMessage: boolean = false;

    const checkDoc = [`${currentUser.uid}_${dataUser.uid}`, `${dataUser.uid}_${currentUser.uid}`];
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
      await makeConversation({ currentUser: currentUser, data: dataUser });
      const urlHash = encodeURIComponent(
        CryptoJS.Rabbit.encrypt(`${currentUser.uid}_${dataUser.uid}`, config.constant.keyHasUrl).toString(),
      );
      return nav(`/conversation/${urlHash}`);
    }
  };
  const handleAdd = async () => {
    await addFriend({ doc: makeFriendsDoc, sender: currentUser, reciever: dataUser });
    return setAddSent(true);
  };
  return (
    <Fragment>
      <div className="wrapper-profile">
        <div className="box-profile lg:flex-[0.8] md:flex-[0.9] sm:flex-[0.9] sm:p-[5px_10px]">
          <ToolTip content="Back" placement="right" arrow>
            <button className="icon-goback-profile xs:left-[10px]" onClick={handleGoBack}>
              <BsArrowLeft />
            </button>
          </ToolTip>
          <div className="content-profile sm:flex-1">
            <div className="infomation-profile">
              <img
                src={dataUser!.photoURL!}
                alt="avatar"
                className="avatar-profile sm:w-[80px] sm:h-[80px] xs:w-[50px] xs:h-[50px] border-[1px]"
                onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
              />
              <div className="personal-profile  sm:ml-[10px]">
                <div className="name-profile">
                  <span className="display-name-profile sm:text-[16px] xs:text-[14px] whitespace-nowrap">
                    {dataUser.displayName}
                  </span>
                  <span className="sm:text-[14px] xs:text-[12px]">{dataUser.email}</span>
                </div>
                {currentUser.uid === uidPar && (
                  <button
                    className="xs:border-[1px] xs:text-[14px] xs:p-[1px] sm:text-[16px] sm:p-[5px] rounded-[5px] p-[5px_10px] text-[18px] font-medium text-danger-color bg-white border-[2px] border-solid border-primary-color hover:text-white hover:bg-danger-color hover:border-danger-color"
                    onClick={handleLogOut}
                  >
                    LogOut
                  </button>
                )}
                {state && addSent === true && (
                  <button
                    className="xs:border-[1px] xs:text-[14px] xs:p-[1px] sm:text-[16px] sm:p-[5px] rounded-[5px] p-[5px_10px] text-[18px] font-medium text-danger-color bg-white border-[2px] border-solid border-danger-color hover:text-white hover:bg-danger-color hover:border-danger-color"
                    onClick={handleCancelAdd}
                  >
                    Cancel Add
                  </button>
                )}
                {state && isRecieveRequest === true && (
                  <button
                    className="xs:border-[1px] xs:text-[14px] xs:p-[1px] sm:text-[16px] sm:p-[5px] rounded-[5px] p-[5px_10px] text-[18px] font-medium text-danger-color bg-white border-[2px] border-solid border-danger-color hover:text-white hover:bg-danger-color hover:border-danger-color"
                    onClick={handleRefuse}
                  >
                    Refuse
                  </button>
                )}
                {state &&
                  (isFriend === true ? (
                    <button
                      className="xs:border-[1px] xs:text-[14px] xs:p-[1px] sm:text-[16px] sm:p-[5px] rounded-[5px] p-[5px_10px] text-[18px] font-medium text-danger-color bg-white border-[2px] border-solid border-danger-color hover:text-white hover:bg-danger-color hover:border-danger-color"
                      onClick={handleUnFriend}
                    >
                      UnFriend
                    </button>
                  ) : (
                    addSent === false &&
                    isRecieveRequest === false && (
                      <button
                        className="text-primary-color bg-white border-[2px] border-solid border-primary-color hover:text-white hover:bg-primary-color hover:border-white xs:border-[1px] xs:text-[14px] xs:p-[1px] sm:text-[16px] sm:p-[5px] rounded-[5px] p-[5px_10px] text-[18px] font-medium"
                        onClick={handleAdd}
                      >
                        Add
                      </button>
                    )
                  ))}
              </div>
            </div>
            {currentUser.uid !== uidPar && (
              <button
                className="text-white bg-primary-color hover:text-primary-color hover:bg-white hover:border-primary-color border border-solid border-transparent mt-[20px] w-[50%] sm:w-[80%] xs:mt-[10px] xs:border-[1px] xs:text-[14px] xs:p-[1px] sm:text-[16px] sm:p-[5px] rounded-[5px] p-[5px_10px] text-[18px] font-medium "
                onClick={handleMessage}
              >
                Message
              </button>
            )}
            <div className="spec-profile md:w-[60%] sm:w-[70%] xs:w-[80%] "></div>
            <Link
              to={config.routes.friends + '?q=listfriend'}
              className="box-friends-profile sm:min-w-[90%] sm:max-w-full xs:p-[5px]"
            >
              <div className="count-friends-profile sm:text-[16px]">{numFr} bạn bè</div>
              <div className="friends-profile">
                {photoFriends.length > 0 &&
                  photoFriends.map((result, index) => (
                    <div key={index} className="friends-avatar-profile xs:w-[30px] xs:-ml-[15px]">
                      <img src={result} alt="friends" className={'friends-photo-profile'} />
                      {photoFriends.length === 5 && index === photoFriends.length - 1 && (
                        <div className="icon-more-profile xs:w-[30px] xs:h-[30px]">
                          <BsThreeDots />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default Profile;
