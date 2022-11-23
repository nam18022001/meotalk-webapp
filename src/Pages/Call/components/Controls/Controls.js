import classNames from 'classnames/bind';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaVideo, FaVideoSlash } from 'react-icons/fa';

import config from '~/configs';
import { db } from '~/services/FirebaseServices';
import styles from './Controls.module.scss';

const cx = classNames.bind(styles);

function Controls({ tracks, setStart, setInCall, idDoc, endCall }) {
  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const client = config.settingAgora.useClient();

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
    await updateDoc(doc(db, 'call', idDoc), {
      deleteCall: true,
    });
    endCall(true);
    client.removeAllListeners();
    setStart(false);
    setInCall(false);
    // window.close();
  };

  return (
    <div className={cx('wrapper')}>
      <button className={cx('btn-mic')} onClick={() => mute('audio')}>
        {trackState.audio ? (
          <FaMicrophone className={cx('icon')} />
        ) : (
          <FaMicrophoneSlash className={cx('icon', 'icon-off')} />
        )}
      </button>
      <button className={cx('btn-phone')} onClick={() => leaveChannel()}>
        <FaPhone className={cx('icon')} />
      </button>
      <button className={cx('btn-video')} onClick={() => mute('video')}>
        {trackState.video ? <FaVideo className={cx('icon')} /> : <FaVideoSlash className={cx('icon', 'icon-off')} />}
      </button>
    </div>
  );
}

export default Controls;
