import { deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Fragment, memo, useEffect, useState } from 'react';
import config from '~/configs';
import { db } from '~/services/FirebaseServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';
import './call.css';
import Controls from './components/Controls';
import Video from './components/Video';

function VideoCall({
  channelName,
  channelCall,
  token,
  uid,
  partnerName,
  partnerAvatar,
  hasDialled,
  dataCall,
  isReciever = false,
}: VideoCallProps) {
  const [users, setUsers] = useState<any[]>([]);

  const [start, setStart] = useState(false);
  const client = config.settingAgora.useClient();

  const { ready, tracks } = config.settingAgora.useMicrophoneAndCameraTracks();

  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);
  const [videoRemoteStatus, setVideoRemoteStatus] = useState(true);

  const [timoutCaller, setTimeoutCaller] = useState(60);

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
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            return [...prevUsers, user];
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
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        }
      });

      client.on('user-left', async (user) => {
        await deleteDoc(doc(db, 'call', channelName));

        tracks![0].close();
        tracks![1].close();
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });
      client.on('user-info-updated', (user, state) => {
        if (state === 'mute-video') {
          console.log(user, state);
          setVideoRemoteStatus(false);
        } else if (state === 'unmute-video') {
          setVideoRemoteStatus(true);
        }
      });

      try {
        await client.join(config.settingAgora.appId, name, tokenCall, uidCall);
      } catch (error) {
        console.log('error');
      }

      if (tracks) await client.publish([tracks[0], tracks[1]]);

      setStart(true);
    };

    if (ready && tracks) {
      try {
        init(channelCall, token, uid);
      } catch (error) {
        console.log(error);
      }
    }

    return () => {
      setSecondCall(0);
      setMinuteCall(0);
      async function name() {
        tracks![0].close();
        tracks![1].close();
        await client.leave();
        client.removeAllListeners();
        await deleteDoc(doc(db, 'call', channelName));
      }
      name();
    };
  }, [channelName, channelCall, client, ready, tracks]);

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
        callVideo: true,
      });
    } else {
      const dataLast = await getlastMessage({ collectChat });
      await addMessage({
        collectChat,
        currentUser: currentUserAlpha,
        data: `Cuộc gọi thoại\n${`${minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}:${
          secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall
        }`}`,
        callVideo: true,
        dataLast,
      });
    }
    await updateDoc(chatRoom, {
      time: Date.now(),
    });

    await deleteDoc(doc(db, 'call', channelName));
  };

  const leaveChannel = async () => {
    tracks![0].close();
    tracks![1].close();
    await client.leave();
    client.removeAllListeners();
    if (users.length > 0 && hasDialled) {
      await setLeave();
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
            <div style={{ fontSize: 16, color: '#829460' }}>
              {minuteCall === 0 ? '00' : minuteCall < 10 ? '0' + minuteCall : minuteCall}
              {' : '}
              {secondCall === 0 ? '00' : secondCall < 10 ? '0' + secondCall : secondCall}
            </div>
          </div>
        )}
        {start && tracks && (
          <Video
            tracks={tracks}
            users={users}
            hasDialled={hasDialled}
            partnerName={partnerName}
            partnerAvatar={partnerAvatar}
            videoRemoteStatus={videoRemoteStatus}
            trackState={trackState}
            timeout={timoutCaller}
          />
        )}
        {ready && tracks && (
          <Controls tracks={tracks} trackState={trackState} leaveChannel={leaveChannel} mute={mute} />
        )}
      </div>
    </Fragment>
  );
}
interface VideoCallProps {
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
export default memo(VideoCall);
