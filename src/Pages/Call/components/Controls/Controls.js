import classNames from 'classnames/bind';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaVideo, FaVideoSlash } from 'react-icons/fa';

import config from '~/configs';
import { db } from '~/services/FirebaseServices';
import styles from './Controls.module.scss';

const cx = classNames.bind(styles);

function Controls({ tracks, mute, leaveChannel, trackState }) {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('actions')}>
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
    </div>
  );
}

export default Controls;
