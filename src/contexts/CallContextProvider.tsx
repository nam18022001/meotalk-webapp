import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import CallLayout from '~/layouts/CallLayout';
import PickUp from '~/pages/Calls/PickUp';
import VideoCall from '~/pages/Calls/VideoCall';
import VideoGroupCall from '~/pages/Calls/VideoGroupCall';
import { db } from '~/services/FirebaseServices';
import { getCall } from '~/services/callServices';
import { useAuthContext } from './AuthContextProvider';

function CallContextProvider({ children }: CallContextProviderProps) {
  const { currentUser } = useAuthContext();

  const [callerInfo, setCallerInfo] = useState<any>({});
  const [recieverInfo, setRecieverInfo] = useState<any>({});
  const [recieverGroupInfo, setRecieverGroupInfo] = useState<any>({});

  const [isGroup, setIsGroup] = useState(false);

  const [showPickUp, setShowPickUp] = useState(false);
  const [showVideoCaller, setShowVideoCaller] = useState(false);
  const [showVideoReciever, setShowVideoReciever] = useState(false);

  const [showGroupPickUp, setGroupShowPickUp] = useState(false);

  const [showGroupVideoReciever, setGroupShowVideoReciever] = useState(false);

  console.log(recieverGroupInfo);
  console.log(showGroupPickUp);

  useEffect(() => {
    onSnapshot(getCall({ currentUser }), (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();
        setCallerInfo(infoCall);
        setIsGroup(infoCall.isGroup);
        setShowVideoCaller(true);
      } else {
        setIsGroup(false);
        setCallerInfo([]);
        setShowVideoCaller(false);
      }
    });
  }, []);

  useEffect(() => {
    onSnapshot(getCall({ currentUser, reciever: true }), (snapCall) => {
      if (!snapCall.empty === true) {
        const infoCall = snapCall.docs[0].data();
        setRecieverInfo(infoCall);
        setShowPickUp(true);
        setIsGroup(infoCall.isGroup);
      } else {
        setRecieverInfo([]);
        setShowPickUp(false);
        setShowVideoReciever(false);
        // asdauhsduahd
        setGroupShowVideoReciever(false);
      }
    });
  }, []);

  useEffect(() => {
    onSnapshot(getCall({ currentUser, reciever: true, isGroup: true }), (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();
        setRecieverGroupInfo(infoCall);
        setGroupShowPickUp(true);
        setIsGroup(infoCall.isGroup);
      } else {
        setIsGroup(false);
        setGroupShowPickUp(false);
        setRecieverGroupInfo([]);
      }
    });
  }, []);

  const handlePickOut = async () => {
    await deleteDoc(doc(db, 'call', recieverInfo.channelName));
    setShowVideoReciever(false);
  };
  const handlePickUp = async () => {
    setShowVideoReciever(true);
    await updateDoc(doc(db, 'call', recieverInfo.channelName), {
      hasDialled: true,
    });

    setShowPickUp(false);
  };

  return (
    <CallContext.Provider value={{ showPickUp, callerInfo, recieverInfo }}>
      {showPickUp ? (
        <CallLayout>
          <PickUp data={recieverInfo} onPickOut={handlePickOut} onPickUp={handlePickUp} />
        </CallLayout>
      ) : showGroupVideoReciever ? (
        <CallLayout></CallLayout>
      ) : showVideoCaller ? (
        <CallLayout>
          {isGroup ? (
            <VideoGroupCall />
          ) : (
            <VideoCall
              channelName={callerInfo.channelName}
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
          {isGroup ? (
            <VideoGroupCall />
          ) : (
            <VideoCall
              channelName={recieverInfo.channelName}
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
      ) : (
        children
      )}
    </CallContext.Provider>
  );
}
const CallContext = createContext<CallContextContent>({
  showPickUp: false,
  callerInfo: {},
  recieverInfo: {},
});
type CallContextContent = {
  showPickUp: boolean;
  callerInfo: {};
  recieverInfo: {};
};
interface CallContextProviderProps {
  children: ReactNode;
}
export const useCallContext = () => useContext(CallContext);
export default CallContextProvider;
