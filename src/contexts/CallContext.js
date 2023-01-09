import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import Pickup from '~/components/Pickup';
import config from '~/configs';
import { db } from '~/services/FirebaseServices';
import { VideoCall } from '~/Pages/Call';

export const CallContext = createContext();

export const CallContextProvider = ({ children }) => {
  const [callerInfo, setCallerInfo] = useState();
  const [recieverInfo, setRecieverInfo] = useState();

  const [showPickUp, setShowPickUp] = useState(false);
  const [showVideoCaller, setShowVideoCaller] = useState(false);
  const [showVideoReciever, setShowVideoReciever] = useState(false);

  useEffect(() => {
    const collectCall = collection(db, 'call');
    const qCall = query(collectCall, where('callerUid', '==', localStorage.getItem('uid')));
    onSnapshot(qCall, (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();
        setCallerInfo(infoCall);
        setShowVideoCaller(true);
      } else {
        setCallerInfo([]);
        setShowVideoCaller(false);
      }
    });
  }, []);

  useEffect(() => {
    const collectCall = collection(db, 'call');
    const qCall = query(
      collectCall,
      where('recieverUid', '==', localStorage.getItem('uid')),
      // where('hasDialled', '==', false),
    );
    onSnapshot(qCall, (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();

        setRecieverInfo(infoCall);
        setShowPickUp(true);
      } else {
        setRecieverInfo([]);
        setShowPickUp(false);
        setShowVideoReciever(false);
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

    // setup window popup

    setShowPickUp(false);
  };
  return (
    <CallContext.Provider value={[showPickUp, callerInfo, recieverInfo]}>
      {showPickUp ? (
        <Pickup data={recieverInfo} onPickOut={handlePickOut} onPickUp={handlePickUp} />
      ) : showVideoCaller ? (
        <VideoCall
          channelName={callerInfo.channelName}
          token={callerInfo.tokenCaller}
          uid={callerInfo.callerId}
          partnerName={callerInfo.receiverName}
          partnerAvatar={callerInfo.receiverAvatar}
          hasDialled={callerInfo.hasDialled}
        />
      ) : showVideoReciever ? (
        <VideoCall
          channelName={recieverInfo.channelName}
          token={recieverInfo.tokenReciever}
          uid={recieverInfo.recieverId}
          partnerName={recieverInfo.callerName}
          partnerAvatar={recieverInfo.callerAvatar}
          hasDialled={recieverInfo.hasDialled}
          isReciever
        />
      ) : (
        children
      )}
    </CallContext.Provider>
  );
};
