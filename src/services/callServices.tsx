import { collection, query, setDoc, where } from 'firebase/firestore';
import { docCall } from './generalFirestoreServices';
import config from '~/configs';
import { db } from './FirebaseServices';

const addCallMessages = async ({
  group = false,
  chatRoomId,
  uidCaller,
  currentUser,
  userInfo,
  channelName,
  tokenCaller,
  tokenReciever,
  uidReciever,
}: addCallMessagesProps) => {
  return group
    ? userInfo.length > 1 && ''
    : // : await setDoc(docCall(chatRoomId), {
      //     callerId: uidCaller,
      //     callerUid: currentUser.uid,
      //     callerName: currentUser.displayName,
      //     callerAvatar: currentUser.photoURL,
      //     recieverId: uidReciever,
      //     recieverUid: [userInfo[0].uid],
      //     receiverName: [userInfo[0].displayName],
      //     receiverAvatar: userInfo[0].photoURL,
      //     hasDialled: false,
      //     deleteCall: false,
      //     channelName: channelName,
      //     tokenCaller: tokenCaller,
      //     tokenReciever: tokenReciever,
      //     type: 'video',
      //   })
      await setDoc(docCall(chatRoomId), {
        callerId: uidCaller,
        callerUid: currentUser.uid,
        callerEmail: currentUser.email,
        callerName: currentUser.displayName,
        callerAvatar: currentUser.photoURL,
        recieverId: uidReciever[0],
        recieverUid: userInfo[0].uid,
        receiverEmail: userInfo[0].email,
        receiverName: userInfo[0].displayName,
        receiverAvatar: userInfo[0].photoURL,
        hasDialled: false,
        deleteCall: false,
        channelName: channelName,
        tokenCaller: tokenCaller,
        tokenReciever: tokenReciever[0],
        type: 'video',
        isGroup: false,
      });
};

const getTokenCallerAndRevicer = async ({ channelName, userInfo }: getTokenCallerAndRevicerProps) => {
  const uidCaller: number = Number(Math.floor(Math.random() * 100000));
  const role = 1;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  let uidReciever: number[] = [];
  let tokenReciever: any[] = [];

  // build token caller
  const responseCaller = await fetch(
    config.settingAgora.serverTokenUrl +
      channelName +
      '/' +
      role +
      '/uid/' +
      uidCaller +
      '/?expiry=' +
      privilegeExpiredTs,
  );
  const dataCaller = await responseCaller.json();
  const tokenCaller = dataCaller.rtcToken;

  // build token reciever
  for (let i = 0; i < userInfo.length; i++) {
    const id = uidCaller + 1000 + i;
    uidReciever.push(id);
    const responseReiever = await fetch(
      config.settingAgora.serverTokenUrl + channelName + '/' + role + '/uid/' + id + '/?expiry=' + privilegeExpiredTs,
    );
    const dataReciever = await responseReiever.json();
    tokenReciever.push(dataReciever.rtcToken);
  }

  return { tokenCaller, tokenReciever, uidCaller, uidReciever };
};

const getCall = ({
  currentUser,
  reciever = false,
  isGroup = false,
}: {
  currentUser: any;
  reciever?: boolean;
  isGroup?: boolean;
}) => {
  const collectCall = collection(db, 'call');
  const qCall = query(
    collectCall,
    where(
      !reciever ? 'callerUid' : 'recieverUid',
      !reciever ? '==' : isGroup ? 'array-contains' : '==',
      currentUser.uid,
    ),
  );
  return qCall;
};

const checkCallExist = ({ isGroup = false, uid }: { isGroup?: boolean; uid: string }) => {
  const collectCall = collection(db, 'call');
  const qCall = isGroup
    ? [
        query(collectCall, where('callerUid', '==', uid)),
        query(collectCall, where('recieverUid', 'array-contains', uid)),
        query(collectCall, where('recieverUid', '==', uid)),
      ]
    : [query(collectCall, where('callerUid', '==', uid)), query(collectCall, where('recieverUid', '==', uid))];

  return qCall;
};

export { addCallMessages, getTokenCallerAndRevicer, getCall, checkCallExist };

interface getTokenCallerAndRevicerProps {
  channelName: string;
  userInfo: any[];
}
interface addCallMessagesProps {
  group?: boolean;
  chatRoomId: string;
  uidCaller: number;
  currentUser: any;
  userInfo: any[];
  channelName: string;
  tokenCaller: string;

  tokenReciever: any[];
  uidReciever: any[];
}
