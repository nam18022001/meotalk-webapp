import { Fragment, useEffect, useState } from 'react';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';

import { deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { usePreloadSideBarContext } from '~/contexts/PreloadSideBarProvider';
import { db } from '~/services/FirebaseServices';
import Controls from './components/Controls';
import VideoGroup from './components/VideoGroup';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';

function VideoGroupCall({ channelName, channelCall, dataCall, hasDialled, isReciever = false }: VideoCallGroupProps) {
  const { currentUser } = useAuthContext();
  const { listConversation } = usePreloadSideBarContext();

  const [myIndex, setMyIndex] = useState(-1);
  const [myInfo, setMyInfo] = useState<myInfo>({});

  const client = config.settingAgora.useClient();
  const [users, setUsers] = useState<any[]>([]);
  const [start, setStart] = useState(false);

  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);

  const { ready, tracks } = config.settingAgora.useMicrophoneAndCameraTracks();

  const [groupName, setGroupName] = useState('');
  const [timoutCaller, setTimeoutCaller] = useState(60);

  const [statusNetwork, setStatusNetwork] = useState<any>(1);

  useEffect(() => {
    let timeinterval: any;
    if (!isReciever && !hasDialled) {
      timeinterval = setInterval(() => {
        setTimeoutCaller((pre) => pre - 1);
      }, 1000);

      if (timoutCaller === 0) {
        setTimeoutCaller(0);
        clearInterval(timeinterval);
        outCall();
      }
    }

    async function outCall() {
      // handle misCall
      await deleteDoc(doc(db, 'call', channelName));
    }

    return () => clearInterval(timeinterval);
  }, [isReciever, dataCall, hasDialled, timoutCaller]);

  useEffect(() => {
    const getRoom = listConversation.filter((list) => list.chatRoomID === dataCall.channelName);
    if (getRoom.length === 1 && getRoom[0].chatRoomName !== undefined && getRoom[0].chatRoomName.length > 0) {
      setGroupName(getRoom[0].chatRoomName);
    } else {
      setGroupName(
        dataCall.receiverName.map(
          (data: string, index: number) => data + `${index === dataCall.receiverName.length - 1 ? '' : ', '} `,
        ),
      );
    }
    if (isReciever) {
      if (Object.keys(dataCall).length > 0) {
        setMyIndex(dataCall.recieverUid.indexOf(currentUser.uid));
      }
    } else {
      setMyIndex(-1);
    }

    if (dataCall.cancelDialled.length === dataCall.recieverId.length) {
      setLeave(true);
    }
  }, [dataCall, channelName, isReciever]);

  useEffect(() => {
    if (myIndex >= 0) {
      let info: myInfo = {};
      info.id = dataCall.recieverId[myIndex];
      info.displayName = dataCall.receiverName[myIndex];
      info.uid = dataCall.recieverUid[myIndex];
      info.photoURL = dataCall.receiverAvatar[myIndex];
      info.token = dataCall.tokenReciever[myIndex];
      setMyInfo(info);
    } else {
      let info: myInfo = {};
      info.id = dataCall.callerId;
      info.displayName = dataCall.callerName;
      info.uid = dataCall.callerUid;
      info.photoURL = dataCall.callerAvatar;
      info.token = dataCall.tokenCaller;
      setMyInfo(info);
    }
  }, [dataCall, myIndex]);

  useEffect(() => {
    let init = async (name: string, tokenCall: string, uidCall: number) => {
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            if (prevUsers.filter((v) => v.uid === user.uid).length === 0) {
              return [...prevUsers, user];
            } else {
              return [...prevUsers];
            }
          });
        }
        if (mediaType === 'audio') {
          user?.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          if (user.audioTrack) user.audioTrack.stop();
        }
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            return [...prevUsers.filter((User) => User.uid !== user.uid), user];
          });
        }
      });

      client.on('user-left', async (user) => {
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });

      client.on('network-quality', (state) => {
        setStatusNetwork(state.uplinkNetworkQuality);
      });

      try {
        await client.join(config.settingAgora.appId, name, tokenCall, uidCall);
      } catch (error) {
        console.error('Error Video Call!');
      }

      if (tracks) await client.publish([tracks[0], tracks[1]]);

      setStart(true);
    };

    if (ready && tracks && Object.keys(myInfo).length > 0) {
      try {
        init(channelCall, myInfo.token ? myInfo.token : '', myInfo.id ? myInfo.id : 0);
      } catch (error) {
        console.log(error);
      }
    }
  }, [myInfo, channelName, client, ready, tracks]);

  useEffect(() => {
    function createIncreament() {
      if (hasDialled) {
        if (secondCall === 59) {
          setSecondCall(0);
          setMinuteCall(minuteCall + 1);
        } else {
          setSecondCall(secondCall + 1);
        }
      }
    }

    let countCalltime = setTimeout(createIncreament, 1000);

    return () => {
      clearTimeout(countCalltime);
    };
  }, [secondCall, hasDialled, users]);

  useEffect(() => {
    return () => {
      setSecondCall(0);
      setMinuteCall(0);
      async function name() {
        tracks![0].close();
        tracks![1].close();
        await client.leave();
        client.removeAllListeners();
      }
      name();
    };
  }, [channelName, client, ready, tracks]);

  const setLeave = async (last = false) => {
    if (last) {
      const collectChat = collectChats(channelName);
      const chatRoom = docChatRoom(channelName);
      let currentUserAlpha: {} = {
        email: dataCall.callerEmail,
      };
      const getDocChats = await getDocs(collectChat);
      if (getDocChats.empty) {
        await addFirstMessage({
          collectChat,
          currentUser: currentUserAlpha,
          data: `Cuộc gọi Video\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
            secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
          }`}`,
          callVideo: true,
          isGroup: true,
          photoSender: dataCall.callerAvatar,
        });
      } else {
        const dataLast = await getlastMessage({ collectChat });
        await addMessage({
          collectChat,
          currentUser: currentUserAlpha,
          data: `Cuộc gọi Video\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
            secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
          }`}`,
          callVideo: true,
          dataLast,
          isGroup: true,
          photoSender: dataCall.callerAvatar,
        });
      }
      await updateDoc(chatRoom, {
        time: Date.now(),
      });
      await deleteDoc(doc(db, 'call', channelName));
    } else {
      let cancelDialled: string[] = dataCall.cancelDialled;
      if (cancelDialled.filter((v: any) => v === currentUser.uid).length === 0) {
        cancelDialled.push(currentUser!.uid!);
      }
      await updateDoc(doc(db, 'call', channelName), {
        cancelDialled,
      });
    }
  };

  const leaveChannel = async () => {
    tracks![0].close();
    tracks![1].close();
    await client.leave();
    client.removeAllListeners();
    if (users.length > 0 && hasDialled) {
      await setLeave();
    } else if (users.length === 0 && hasDialled) {
      await setLeave(true);
    } else {
      await deleteDoc(doc(db, 'call', channelName));
    }
  };

  const mute = async (type: string) => {
    if (type === 'audio') {
      await tracks![0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === 'video') {
      await tracks![1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  return (
    <Fragment>
      <div className="w-full h-full min-w-[400px]">
        {hasDialled && (
          <div className="absolute w-full flex items-center justify-center top-[20px] z-50">
            <div
              className={`text-[16px] ${
                statusNetwork > 0
                  ? statusNetwork < 3
                    ? 'text-success-color'
                    : statusNetwork >= 3 && statusNetwork < 6
                    ? 'text-warning-color'
                    : 'text-danger-color'
                  : 'text-danger-color'
              }`}
            >
              {minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}
              {' : '}
              {secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall}
            </div>
          </div>
        )}

        {start && tracks && (
          <VideoGroup
            tracks={tracks}
            users={users}
            hasDialled={hasDialled}
            groupName={groupName}
            partnerAvatar={dataCall.receiverAvatar}
            trackState={trackState}
            timeout={timoutCaller}
            dataCall={dataCall}
          />
        )}

        {ready && tracks && (
          <Controls tracks={tracks} trackState={trackState} leaveChannel={leaveChannel} mute={mute} />
        )}
      </div>
    </Fragment>
  );
}
interface VideoCallGroupProps {
  dataCall: any;
  channelName: string;
  channelCall: string;
  hasDialled: boolean;
  isReciever?: boolean;
}

interface myInfo {
  id?: number;
  displayName?: string;
  uid?: string;
  photoURL?: string;
  token?: string;
}
export default VideoGroupCall;
