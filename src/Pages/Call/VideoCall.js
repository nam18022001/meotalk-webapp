import classNames from 'classnames/bind';
import { deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';

import { db } from '~/services/FirebaseServices';
import { config, useClient, useMicrophoneAndCameraTracks } from '~/configs/settings';
import { CallContext } from '~/contexts/CallContext';
import Controls from './components/Controls';
import Video from './components/Video/Video';
import styles from './VideoCall.module.scss';

const cx = classNames.bind(styles);

function VideoCall({ channelName, token, uid, partnerName, partnerAvatar, hasDialled }) {
  console.log(channelName, token, uid);
  const [users, setUsers] = useState([]);

  const [start, setStart] = useState(false);
  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [secondCall, setSecondCall] = useState(0);
  const [minuteCall, setMinuteCall] = useState(0);
  const [videoRemoteStatus, setVideoRemoteStatus] = useState(true);
  useEffect(() => {
    let init = async (name, tokenCall, uidCall) => {
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            return [...prevUsers, user];
          });
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
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
        tracks[0].close();
        tracks[1].close();

        await deleteDoc(doc(db, 'call', channelName));
        setUsers((prevUsers) => {
          return prevUsers.filter((User) => User.uid !== user.uid);
        });
      });
      client.on('user-info-updated', (user, state) => {
        if (state === 'mute-video') {
          setVideoRemoteStatus(false);
        } else if (state === 'unmute-video') {
          setVideoRemoteStatus(true);
        }
      });

      try {
        await client.join(config.appId, name, tokenCall, uidCall);
      } catch (error) {
        console.log('error');
      }

      if (tracks) await client.publish([tracks[0], tracks[1]]);

      setStart(true);
    };

    if (ready && tracks) {
      try {
        init(channelName, token, uid);
      } catch (error) {
        console.log(error);
      }
    }
    return () => leaveChannel();
  }, [channelName, client, ready, tracks]);
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

  const mute = async (type) => {
    if (type === 'audio') {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === 'video') {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const leaveChannel = async () => {
    tracks[0].close();
    tracks[1].close();
    await client.leave();
    client.removeAllListeners();
    await deleteDoc(doc(db, 'call', channelName));
  };

  return (
    <div className={cx('wrapper')}>
      {hasDialled && (
        <div className={cx('time')}>
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
        />
      )}
      {ready && tracks && <Controls tracks={tracks} trackState={trackState} leaveChannel={leaveChannel} mute={mute} />}
    </div>
  );
}

export default VideoCall;
