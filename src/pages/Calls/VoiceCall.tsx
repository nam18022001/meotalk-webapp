import { deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Fragment, useEffect, useState } from 'react';

import config from '~/configs';
import { db } from '~/services/FirebaseServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';
import Controls from './components/Controls';

function VoiceCall({
  channelName,
  channelCall,
  token,
  uid,
  partnerName,
  partnerAvatar,
  hasDialled,
  dataCall,
  isReciever = false,
}: VoiceCallProps) {
  const client = config.settingAgora.useClient();
  const { ready, track } = config.settingAgora.useMicrophoneTracks();
  const [trackState, setTrackState] = useState(true);

  const [users, setUsers] = useState<any[]>([]);

  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);

  const [statusNetwork, setStatusNetwork] = useState<any>(1);

  const [timoutCaller, setTimeoutCaller] = useState(60);
  const [volumesUser, setVolumsUser] = useState<any[]>([]);

  useEffect(() => {
    let timeinterval: any;
    if (!isReciever && !hasDialled) {
      timeinterval = setInterval(() => {
        setTimeoutCaller((pre) => pre - 1);
      }, 1000);

      if (timoutCaller === 0) {
        setTimeoutCaller(0);
        outCall();
      }
    }

    async function outCall() {
      await deleteDoc(doc(db, 'call', channelName));
    }

    return () => clearInterval(timeinterval);
  }, [isReciever, dataCall, hasDialled, timoutCaller]);

  useEffect(() => {
    let init = async (name: string, tokenCall: string, uidCall: string) => {
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
        // await deleteDoc(doc(db, 'call', channelName));
        // track?.close()
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });

      client.on('network-quality', (state) => {
        setStatusNetwork(state.uplinkNetworkQuality);
      });

      client.on('volume-indicator', (volumes) => {
        setVolumsUser(volumes);
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
        init(channelCall, token, uid);
      } catch (error) {
        console.log(error);
      }
    }
  }, [channelName, channelCall, client, ready, track]);

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
  }, [secondCall, users]);

  useEffect(() => {
    return () => {
      if (ready) {
        leaveChannel();
      }
      setSecondCall(0);
      setMinuteCall(0);
    };
  }, [channelName, client, track, ready]);

  const setLeave = async () => {
    const collectChat = collectChats(dataCall.channelName);
    const chatRoom = docChatRoom(dataCall.channelName);

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
      });
    }
    await updateDoc(chatRoom, {
      time: Date.now(),
    });

    await deleteDoc(doc(db, 'call', channelName));
  };

  const leaveChannel = async () => {
    track!.close();
    await client.leave();
    client.removeAllListeners();
    if (users.length > 0 && hasDialled) {
      await setLeave();
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
      <div className="w-screen h-screen min-w-[400px]">
        <div className="wrapper-video-widget min-w-[400px]">
          <div className="box-calling-video-widget items-center">
            <img
              className={`w-[150px] h-[150px] rounded-full border-4 border-solid ${
                volumesUser.length > 0 && volumesUser.filter((v) => v.uid === dataCall.recieverId).length === 1
                  ? volumesUser.filter((v) => v.uid === dataCall.recieverId)[0].level >= 40
                    ? 'border-green-400'
                    : ' border-gray-400'
                  : null
              }`}
              src={partnerAvatar}
              alt="avatar"
            />
            <div className="mt-[20px] text-[30px] font-semibold">{partnerName}</div>
            {hasDialled ? (
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
            ) : (
              <div className={`calling-video-widget`}>
                <div className={'text-video-widget'}>Dialling</div>
                <div className={'bouncing-loader-video-widget'}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            )}
          </div>
        </div>
        {ready && track && (
          <Controls tracks={track} trackState={trackState} leaveChannel={leaveChannel} mute={mute} voice />
        )}
      </div>
    </Fragment>
  );
}
interface VoiceCallProps {
  dataCall: any;
  channelName: string;
  channelCall: string;
  token: string;
  uid: string;
  partnerName: string;
  partnerAvatar: string;
  hasDialled: boolean;
  isReciever?: boolean;
}
export default VoiceCall;
