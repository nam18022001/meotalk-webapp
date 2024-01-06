import { deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Fragment, useEffect, useState } from 'react';

import { avatarIcon } from '~/assets/icons';
import ProgressCircleBar from '~/components/ProgressCircleBar';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { usePreloadSideBarContext } from '~/contexts/PreloadSideBarProvider';
import { db } from '~/services/FirebaseServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';
import Controls from './components/Controls';

function VoiceGroupCall({ channelName, channelCall, dataCall, hasDialled, isReciever = false }: VoiceCallGroupProps) {
  const { currentUser } = useAuthContext();
  const { listConversation } = usePreloadSideBarContext();

  const [myIndex, setMyIndex] = useState(-1);
  const [myInfo, setMyInfo] = useState<myInfo>({});

  const client = config.settingAgora.useClient();
  const [users, setUsers] = useState<any[]>([]);

  const [trackState, setTrackState] = useState(true);
  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);

  const { ready, track } = config.settingAgora.useMicrophoneTracks();

  const [groupName, setGroupName] = useState('');
  const [timoutCaller, setTimeoutCaller] = useState(60);

  const [statusNetwork, setStatusNetwork] = useState<any>(1);
  const [volumesUser, setVolumsUser] = useState<any[]>([]);

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
      client.enableAudioVolumeIndicator();
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'audio') {
          user?.audioTrack?.play();
          setUsers((prevUsers) => {
            if (prevUsers.filter((v) => v.uid === user.uid).length === 0) {
              return [...prevUsers, user];
            } else {
              return [...prevUsers];
            }
          });
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          if (user.audioTrack) user.audioTrack.stop();
        }
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
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

      client.on('volume-indicator', (volumes) => {
        setVolumsUser(volumes.filter((v) => v.uid !== uidCall));
      });

      try {
        await client.join(config.settingAgora.appId, name, tokenCall, uidCall);
      } catch (error) {
        console.log('error');
      }

      if (track) await client.publish([track]);
    };

    if (ready && track) {
      try {
        init(channelCall, myInfo.token ? myInfo.token : '', myInfo.id ? myInfo.id : 0);
      } catch (error) {
        console.log(error);
      }
    }
  }, [myInfo, channelName, client, ready, track]);

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
        track!.close();
        await client.leave();
        client.removeAllListeners();
      }
      name();
    };
  }, [channelName, client, ready, track]);

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
          data: `Cuộc gọi thoại\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
            secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
          }`}`,
          call: true,
          isGroup: true,
          photoSender: dataCall.callerAvatar,
        });
      } else {
        const dataLast = await getlastMessage({ collectChat });
        await addMessage({
          collectChat,
          currentUser: currentUserAlpha,
          data: `Cuộc gọi thoại\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
            secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
          }`}`,
          call: true,
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
    track!.close();
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

  const mute = async () => {
    await track!.setEnabled(!trackState);
    setTrackState((ps) => {
      return !ps;
    });
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
        {hasDialled ? (
          <div className="wrapper-video-widget min-w-[400px]">
            <div className="flex flex-wrap items-center justify-center">
              {users.length > 0 ? (
                users.map((user, i) => {
                  let myIndex = dataCall.recieverId.indexOf(user.uid);
                  return (
                    <div key={i} className="flex flex-col items-center justify-center mx-[10px]">
                      <img
                        className={`w-[150px] h-[150px] rounded-full border-4 border-solid ${
                          volumesUser.length > 0 && volumesUser.filter((v) => v.uid === user.uid).length === 1
                            ? volumesUser.filter((v) => v.uid === user.uid)[0].level >= 40
                              ? 'border-green-400'
                              : ' border-gray-400'
                            : null
                        }`}
                        src={myIndex === -1 ? dataCall.callerAvatar : dataCall.receiverAvatar[myIndex]}
                        alt="avatar"
                      />
                      <div className="mt-[20px] text-[24px] font-medium">
                        {myIndex === -1 ? dataCall.callerName : dataCall.receiverName[myIndex]}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-[30px] font-semibold mr-[10px]"> Wating others</span>
                  <div className={'bouncing-loader-video-widget'}>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="wrapper-video-widget min-w-[400px]">
            <div className={'box-calling-video-widget'}>
              <div className={'img-avt-video-widget'}>
                {dataCall.receiverAvatar.slice(0, 2).map((info: any, index: number) => (
                  <img
                    key={index}
                    className={`avatar-partner-video-widget border-2 border-solid border-black -ml-[20px] ${
                      index === 0 ? 'bottom-0 left-0 z-20' : 'right-0 top-0 z-10'
                    }`}
                    src={info}
                    alt={'avatar'}
                    onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                  />
                ))}
              </div>
              <div className="img-avt-video-widget text-[30px] font-bold">{groupName}</div>
              <div className={`calling-video-widget`}>
                <ProgressCircleBar
                  className="!w-[40px] !h-[40px] mr-[10px]"
                  type="red"
                  unit="s"
                  value={timoutCaller}
                  maxValue={60}
                  fontSizeTextvalue={30}
                />
                <div className={'text-video-widget'}>Dialling</div>
                <div className={'bouncing-loader-video-widget'}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {ready && track && (
          <Controls tracks={track} trackState={trackState} leaveChannel={leaveChannel} mute={mute} voice />
        )}
      </div>
    </Fragment>
  );
}

interface VoiceCallGroupProps {
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
export default VoiceGroupCall;
