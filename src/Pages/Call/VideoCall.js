import classNames from 'classnames/bind';
import CryptoJS from 'crypto-js';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '~/services/FirebaseServices';

import config from '~/configs';
import Controls from './components/Controls';
import Video from './components/Video';
import styles from './VideoCall.module.scss';

const cx = classNames.bind(styles);

function VideoCall() {
  const { tokenCall } = useParams();

  const tokenHash = CryptoJS.Rabbit.decrypt(tokenCall, 'tokenHash');
  const token = CryptoJS.enc.Utf8.stringify(tokenHash);
  const infoInToken = token.split('&&');
  // console.log(infoInToken[0], infoInToken[1]);
  const client = config.settingAgora.useClient();

  const { ready, tracks } = config.settingAgora.useMicrophoneAndCameraTracks();

  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [endCall, setEndCall] = useState(false);
  const [callRoomInfo, setCallRoomInfo] = useState([]);
  const [idDocCall, setIdDocCall] = useState('');

  // console.log(callRoomInfo.hasDialled);

  useEffect(() => {
    let init = async (name, tokenRoom) => {
      client.on('user-joined', async (user) => {
        // New User Enters
        await setUsers((prevUsers) => {
          return [...prevUsers, { uid: user.uid, audio: user.hasAudio, video: user.hasVideo, client: false }];
        });
      });
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
        await deleteDoc(doc(db, 'call', idDocCall));
        setUsers([]);
      });

      try {
        if (callRoomInfo.callerUid === localStorage.getItem('uid')) {
          console.log('caller');
          await client.join(config.settingAgora.config.appId, name, tokenRoom, callRoomInfo.callerId);
          if (tracks) await client.publish([tracks[0], tracks[1]]);
          setStart(true);
        } else if (callRoomInfo.recieverUid === localStorage.getItem('uid')) {
          console.log('reciever');

          await client.join(config.settingAgora.config.appId, name, tokenRoom, callRoomInfo.recieverUid);
          if (tracks) await client.publish([tracks[0], tracks[1]]);
          setStart(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (ready && tracks) {
      try {
        callRoomInfo && init(infoInToken[0], infoInToken[1]);
      } catch (error) {
        console.log(error);
      }
    }
  }, [callRoomInfo, client, ready, tracks, tokenCall]);

  useEffect(() => {
    const collectCall = collection(db, 'call');
    const qCall = query(collectCall, where('channelName', '==', infoInToken[0]));

    onSnapshot(qCall, async (snapCall) => {
      if (!snapCall.empty) {
        const info = snapCall.docs[0].data();
        setCallRoomInfo(info);
        console.log(info);
        setIdDocCall(snapCall.docs[0].id);
      } else {
        window.close();
      }
    });
  }, []);

  // useEffect(() => {
  //   const deleteCall = async () => {
  //     await deleteDoc(doc(db, 'call', callRoomInfo.channelName));
  //   };
  //   endCall && deleteCall();
  //   setEndCall(false);
  // }, [endCall, callRoomInfo]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('video-wrapper')}>{start && tracks && <Video tracks={tracks} users={users} />}</div>
      <div className={cx('control-wrapper')}>
        {ready && tracks && (
          <Controls
            tracks={tracks}
            setStart={setStart}
            setInCall={setInCall}
            idDoc={callRoomInfo.channelName}
            endCall={setEndCall}
          />
        )}
      </div>
    </div>
  );
}

export default VideoCall;
