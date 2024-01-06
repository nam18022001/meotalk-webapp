import { deleteDoc, doc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { Dispatch, Fragment, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';

import Loading from '~/components/Loading';
import CallLayout from '~/layouts/CallLayout';
import PickUp from '~/pages/Calls/PickUp';
import VideoCall from '~/pages/Calls/VideoCall';
import VideoGroupCall from '~/pages/Calls/VideoGroupCall';
import VoiceCall from '~/pages/Calls/VoiceCall';
import VoiceGroupCall from '~/pages/Calls/VoiceGroupCall';
import { db } from '~/services/FirebaseServices';
import { getCall } from '~/services/callServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';
import { useAuthContext } from './AuthContextProvider';

function CallContextProvider({ children }: CallContextProviderProps) {
  const { currentUser } = useAuthContext();

  const [callerInfo, setCallerInfo] = useState<any>({});
  const [recieverInfo, setRecieverInfo] = useState<any>({});
  const [recieverGroupInfo, setRecieverGroupInfo] = useState<any>({});

  const [isGroupCaller, setIsGroupCaller] = useState(false);
  const [isGroupReciever, setIsGroupReciever] = useState(false);

  const [showPickUp, setShowPickUp] = useState(false);
  const [showPickUpGroup, setShowPickUpGroup] = useState(false);
  const [showVideoCaller, setShowVideoCaller] = useState(false);
  const [showVoiceCaller, setShowVoiceCaller] = useState(false);

  const [showVideoReciever, setShowVideoReciever] = useState(false);
  const [showVocieReciever, setShowVoiceReciever] = useState(false);

  const [showVideoGroupReciever, setShowVideoGroupReciever] = useState(false);
  const [showVoiceGroupReciever, setShowVoiceGroupReciever] = useState(false);

  const [pressCall, setPressCall] = useState(false);

  // caller info
  useEffect(() => {
    onSnapshot(getCall({ currentUser }), (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();
        setCallerInfo(infoCall);
        setIsGroupCaller(infoCall.isGroup);

        if (infoCall.isGroup === true && infoCall.cancelDialled !== undefined) {
          if (infoCall.cancelDialled.filter((info: any) => info === currentUser.uid).length === 0) {
            if (infoCall.type === 'voice') {
              setShowVoiceCaller(true);
            } else if (infoCall.type === 'video') {
              setShowVideoCaller(true);
            } else {
              setShowVideoCaller(false);
              setShowVoiceCaller(false);
            }
          } else {
            setShowVideoCaller(false);
            setShowVoiceCaller(false);
          }
        } else if (infoCall.isGroup === false) {
          if (infoCall.deleteCall === false) {
            if (infoCall.type === 'voice') {
              setShowVoiceCaller(true);
            } else if (infoCall.type === 'video') {
              setShowVideoCaller(true);
            }
          } else {
            setShowVideoCaller(false);
            setShowVoiceCaller(false);
          }
        } else {
          setShowVideoCaller(false);
          setShowVoiceCaller(false);
        }
      } else {
        setIsGroupCaller(false);
        setCallerInfo([]);
        setShowVideoCaller(false);
        setShowVoiceCaller(false);
      }
    });
  }, []);

  //reciever info
  useEffect(() => {
    onSnapshot(getCall({ currentUser, reciever: true }), (snapCall) => {
      if (!snapCall.empty === true) {
        const infoCall = snapCall.docs[0].data();

        if (infoCall.deleteCall === false) {
          setRecieverInfo(infoCall);
          setIsGroupReciever(infoCall.isGroup);
          if (infoCall.hasDialled === true) {
            if (infoCall.type === 'video') {
              setShowVideoReciever(true);
            } else {
              setShowVoiceReciever(true);
            }
          } else {
            setShowPickUp(true);
          }
        } else {
          setRecieverInfo([]);
          setShowPickUp(false);
          setShowVideoReciever(false);
          setShowVoiceReciever(false);
        }
      } else {
        setRecieverInfo([]);
        setShowPickUp(false);
        setShowVideoReciever(false);
        setShowVoiceReciever(false);
      }
    });
  }, []);

  //reciever group info
  useEffect(() => {
    onSnapshot(getCall({ currentUser, reciever: true, isGroup: true }), (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();

        if (infoCall.isGroup === true && infoCall.cancelDialled !== undefined) {
          if (
            infoCall.cancelDialled.filter((info: any) => info === currentUser.uid).length === 0 &&
            infoCall.hasDialled.filter((info: any) => info === currentUser.uid).length === 0
          ) {
            setShowPickUpGroup(true);
          } else if (
            infoCall.cancelDialled.filter((info: any) => info === currentUser.uid).length === 0 &&
            infoCall.hasDialled.filter((info: any) => info === currentUser.uid).length === 1
          ) {
            setShowPickUpGroup(false);
            if (infoCall.type === 'video') {
              setShowVideoGroupReciever(true);
            } else {
              setShowVoiceGroupReciever(true);
            }
          } else {
            setShowVideoGroupReciever(false);
            setShowVoiceGroupReciever(false);
            setShowPickUpGroup(false);
          }
        } else {
          setShowPickUpGroup(false);
        }
        setRecieverGroupInfo(infoCall);
        setIsGroupReciever(infoCall.isGroup);
      } else {
        setIsGroupReciever(false);
        setShowPickUpGroup(false);
        setRecieverGroupInfo([]);
        setShowVideoGroupReciever(false);
        setShowVoiceGroupReciever(false);
      }
    });
  }, []);

  const handlePickOut = async () => {
    if (isGroupReciever) {
      let cancelDialled: string[] = recieverGroupInfo.cancelDialled;
      setShowVideoGroupReciever(false);
      if (cancelDialled.filter((v: any) => v === currentUser.uid).length === 0) {
        cancelDialled.push(currentUser!.uid!);
      }
      await updateDoc(doc(db, 'call', recieverGroupInfo.channelName), {
        cancelDialled,
      });
    } else {
      const collectChat = collectChats(recieverInfo.channelName);
      const chatRoom = docChatRoom(recieverInfo.channelName);

      const getDocChats = await getDocs(collectChat);
      let currentUserAlpha = {
        email: recieverInfo.callerEmail,
      };
      if (getDocChats.empty) {
        addFirstMessage({ collectChat, currentUser: currentUserAlpha, data: 'Cuộc gọi nhỡ', callVideo: true });
      } else {
        const dataLast = await getlastMessage({ collectChat });

        addMessage({ collectChat, currentUser: currentUserAlpha, data: 'Cuộc gọi nhỡ', callVideo: true, dataLast });
      }
      await updateDoc(chatRoom, {
        time: Date.now(),
      });
      await deleteDoc(doc(db, 'call', recieverInfo.channelName));
      setShowVideoReciever(false);
    }
  };
  const handlePickUp = async () => {
    if (isGroupReciever) {
      if (recieverGroupInfo.type === 'voice') {
        setShowVoiceGroupReciever(true);
      } else {
        setShowVideoGroupReciever(true);
      }
      let slice = recieverGroupInfo.hasDialled.slice();
      if (slice.filter((data: string) => data === currentUser.uid).length === 0) {
        slice.push(currentUser.uid);
      }
      await updateDoc(doc(db, 'call', recieverGroupInfo.channelName), {
        hasDialled: slice,
      });
      setShowPickUpGroup(false);
    } else {
      if (recieverInfo.type === 'voice') {
        setShowVoiceReciever(true);
      } else {
        setShowVideoReciever(true);
      }
      await updateDoc(doc(db, 'call', recieverInfo.channelName), {
        hasDialled: true,
      });
      setShowPickUp(false);
    }
  };

  return (
    <CallContext.Provider value={{ showPickUp, callerInfo, recieverInfo, pressCall, setPressCall }}>
      {showPickUp ? (
        <CallLayout>
          <PickUp data={recieverInfo} onPickOut={handlePickOut} onPickUp={handlePickUp} type={recieverInfo.type} />
        </CallLayout>
      ) : showPickUpGroup ? (
        <CallLayout>
          <PickUp
            data={recieverGroupInfo}
            onPickOut={handlePickOut}
            onPickUp={handlePickUp}
            isGroup
            type={recieverGroupInfo.type}
          />
        </CallLayout>
      ) : showVideoCaller ? (
        <CallLayout>
          {isGroupCaller ? (
            <VideoGroupCall
              channelName={callerInfo.channelName}
              channelCall={callerInfo.channelCall}
              dataCall={callerInfo}
              hasDialled={callerInfo.hasDialled.filter((v: string) => v !== currentUser.uid).length > 0 ? true : false}
            />
          ) : (
            <VideoCall
              channelName={callerInfo.channelName}
              channelCall={callerInfo.channelCall}
              token={callerInfo.tokenCaller}
              uid={callerInfo.callerId}
              partnerName={callerInfo.receiverName}
              partnerAvatar={callerInfo.receiverAvatar}
              hasDialled={callerInfo.hasDialled}
              dataCall={callerInfo}
            />
          )}
        </CallLayout>
      ) : showVoiceCaller ? (
        <CallLayout>
          {isGroupCaller ? (
            <VoiceGroupCall
              channelName={callerInfo.channelName}
              channelCall={callerInfo.channelCall}
              dataCall={callerInfo}
              hasDialled={callerInfo.hasDialled.filter((v: string) => v !== currentUser.uid).length > 0 ? true : false}
            />
          ) : (
            <VoiceCall
              channelName={callerInfo.channelName}
              channelCall={callerInfo.channelCall}
              token={callerInfo.tokenCaller}
              uid={callerInfo.callerId}
              partnerName={callerInfo.receiverName}
              partnerAvatar={callerInfo.receiverAvatar}
              hasDialled={callerInfo.hasDialled}
              dataCall={callerInfo}
            />
          )}
        </CallLayout>
      ) : showVideoReciever ? (
        <CallLayout>
          {Object.keys(recieverInfo).length > 0 && (
            <VideoCall
              channelName={recieverInfo.channelName}
              channelCall={recieverInfo.channelCall}
              token={recieverInfo.tokenReciever}
              uid={recieverInfo.recieverId}
              partnerName={recieverInfo.callerName}
              partnerAvatar={recieverInfo.callerAvatar}
              hasDialled={recieverInfo.hasDialled}
              dataCall={recieverInfo}
              isReciever={true}
            />
          )}
        </CallLayout>
      ) : showVocieReciever ? (
        <VoiceCall
          channelName={recieverInfo.channelName}
          channelCall={recieverInfo.channelCall}
          token={recieverInfo.tokenReciever}
          uid={recieverInfo.recieverId}
          partnerName={recieverInfo.callerName}
          partnerAvatar={recieverInfo.callerAvatar}
          hasDialled={recieverInfo.hasDialled}
          dataCall={recieverInfo}
          isReciever={true}
        />
      ) : showVideoGroupReciever ? (
        <CallLayout>
          {isGroupReciever && (
            <VideoGroupCall
              channelName={recieverGroupInfo.channelName}
              channelCall={recieverGroupInfo.channelCall}
              dataCall={recieverGroupInfo}
              isReciever={true}
              hasDialled={
                recieverGroupInfo.hasDialled.filter((v: string) => v === currentUser.uid).length > 0 ? true : false
              }
            />
          )}
        </CallLayout>
      ) : showVoiceGroupReciever ? (
        <CallLayout>
          {isGroupReciever && (
            <VoiceGroupCall
              channelName={recieverGroupInfo.channelName}
              channelCall={recieverGroupInfo.channelCall}
              dataCall={recieverGroupInfo}
              isReciever={true}
              hasDialled={
                recieverGroupInfo.hasDialled.filter((v: string) => v === currentUser.uid).length > 0 ? true : false
              }
            />
          )}
        </CallLayout>
      ) : (
        <Fragment>
          {pressCall && (
            <div className="fixed top-0 left-0 z-[9999] bg-overlay-color">
              <Loading />
            </div>
          )}
          {children}
        </Fragment>
      )}
    </CallContext.Provider>
  );
}
const CallContext = createContext<CallContextContent>({
  showPickUp: false,
  pressCall: false,
  setPressCall: () => {},
  callerInfo: {},
  recieverInfo: {},
});
type CallContextContent = {
  showPickUp: boolean;
  pressCall: boolean;
  setPressCall: Dispatch<SetStateAction<boolean>>;
  callerInfo: {};
  recieverInfo: {};
};
interface CallContextProviderProps {
  children: ReactNode;
}
export const useCallContext = () => useContext(CallContext);
export default CallContextProvider;
