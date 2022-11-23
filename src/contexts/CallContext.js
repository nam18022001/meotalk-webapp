import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';

import Pickup from '~/components/Pickup';
import config from '~/configs';
import { db } from '~/services/FirebaseServices';

export const CallContext = createContext();

export const CallContextProvider = ({ children }) => {
  const [callInfo, setCallInfo] = useState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const collectCall = collection(db, 'call');
    const qCall = query(
      collectCall,
      where('recieverUid', '==', localStorage.getItem('uid')),
      where('hasDialled', '==', false),
    );
    onSnapshot(qCall, (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();

        setCallInfo(infoCall);
        setShow(true);
      } else {
        setShow(false);
      }
    });
  }, []);
  useEffect(() => {
    const collectCall = collection(db, 'call');
    const qCall = query(
      collectCall,
      where('recieverUid', '==', localStorage.getItem('uid')),
      where('hasDialled', '==', true),
    );
    onSnapshot(qCall, (snapCall) => {
      if (!snapCall.empty) {
        const infoCall = snapCall.docs[0].data();
        if (infoCall.deleteCall) {
          const deleteCall = async () => {
            await deleteDoc(doc(db, 'call', snapCall.docs[0].id));
          };
          deleteCall();
        }
      }
    });
  }, []);
  const handlePickOut = async () => {
    await updateDoc(doc(db, 'call', callInfo.channelName), {
      deleteCall: true,
    });
  };
  const handlePickUp = async () => {
    await updateDoc(doc(db, 'call', callInfo.channelName), {
      hasDialled: true,
    });
    // setup window popup

    const width = 1000;
    const height = 600;
    const left = window.screen.width / 2 - (width - 50) / 2;
    const top = window.screen.height / 2 - (height + 50) / 2;

    // set up config token

    // const tokenHash = CryptoJS.Rabbit.encrypt(callInfo.channelName + '&&' + token, 'tokenHash');
    // window.open(
    //   `/video/group@${encodeURIComponent(tokenHash)}`,
    //   '_blank',
    //   `height=${height},width=${width},top=${top},left=${left}`,
    // );
    setShow(false);
  };
  return (
    <CallContext.Provider value={show}>
      {children} <Pickup show={show} data={callInfo} onPickOut={handlePickOut} onPickUp={handlePickUp} />
    </CallContext.Provider>
  );
};
