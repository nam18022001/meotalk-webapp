import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Dispatch, Fragment, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import CallLayout from '~/layouts/CallLayout';
import PickUp from '~/pages/Calls/PickUp';
import VideoCall from '~/pages/Calls/VideoCall';
import VideoGroupCall from '~/pages/Calls/VideoGroupCall';
import { db } from '~/services/FirebaseServices';
import { getCall } from '~/services/callServices';
import { useAuthContext } from './AuthContextProvider';
import Loading from '~/components/Loading';

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
  const [showVideoReciever, setShowVideoReciever] = useState(false);
  const [showVideoGroupReciever, setShowVideoGroupReciever] = useState(false);

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
            setShowVideoCaller(true);
          } else {
            setShowVideoCaller(false);
          }
        } else {
          setShowVideoCaller(true);
        }
      } else {
        setIsGroupCaller(false);
        setCallerInfo([]);
        setShowVideoCaller(false);
      }
    });
  }, []);

  //reciever info
  useEffect(() => {
    onSnapshot(getCall({ currentUser, reciever: true }), (snapCall) => {
      if (!snapCall.empty === true) {
        const infoCall = snapCall.docs[0].data();

        setRecieverInfo(infoCall);
        setShowPickUp(true);
        setIsGroupReciever(infoCall.isGroup);
      } else {
        setRecieverInfo([]);
        setShowPickUp(false);
        setShowVideoReciever(false);
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
            setShowVideoGroupReciever(true);
          } else {
            setShowVideoGroupReciever(false);
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
      }
    });
  }, []);

  useEffect(() => {
    if (Object.keys(recieverGroupInfo).length > 0) {
    }
  }, [recieverGroupInfo]);

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
      await deleteDoc(doc(db, 'call', recieverInfo.channelName));
      setShowVideoReciever(false);
    }
  };
  const handlePickUp = async () => {
    if (isGroupReciever) {
      setShowVideoGroupReciever(true);
      let slice = recieverGroupInfo.hasDialled.slice();
      if (slice.filter((data: string) => data === currentUser.uid).length === 0) {
        slice.push(currentUser.uid);
      }
      await updateDoc(doc(db, 'call', recieverGroupInfo.channelName), {
        hasDialled: slice,
      });
      setShowPickUpGroup(false);
    } else {
      setShowVideoReciever(true);

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
          <PickUp data={recieverInfo} onPickOut={handlePickOut} onPickUp={handlePickUp} />
        </CallLayout>
      ) : showPickUpGroup ? (
        <CallLayout>
          <PickUp data={recieverGroupInfo} onPickOut={handlePickOut} onPickUp={handlePickUp} isGroup />
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
