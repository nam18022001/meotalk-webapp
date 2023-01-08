import { AgoraVideoPlayer } from 'agora-rtc-react';
import { BsCartX } from 'react-icons/bs';
import classNames from 'classnames/bind';
import Draggable from 'react-draggable';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaVideo, FaVideoSlash } from 'react-icons/fa';

import styles from './Video.module.scss';
import { useState } from 'react';
import Image from '~/components/Image';

const cx = classNames.bind(styles);

function Video({ users, tracks, partnerName, partnerAvatar, hasDialled, videoRemoteStatus, trackState }) {
  const [onDrag, setOnDrag] = useState(false);

  return (
    <div className={cx('wrapper')}>
      <div
        className={cx('my-video', {
          drag: onDrag,
        })}
      >
        <Draggable onStart={() => setOnDrag(true)} onStop={() => setOnDrag(false)}>
          <div className={cx('wrap-video')}>
            {trackState.video === true ? (
              <AgoraVideoPlayer videoTrack={tracks[1]} className={cx('video')} />
            ) : (
              <div className={cx('video')}>
                <div className={cx('mute-video')}>
                  <div className={cx('turn-off')}>
                    <Image
                      src={localStorage.getItem('avatar')}
                      alt={localStorage.getItem('displayName')}
                      className={cx('my-avatar')}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className={cx('status')}>
              {trackState.video === true ? <FaVideo /> : <FaVideoSlash />}
              <div style={{ width: '1px', height: '15px', backgroundColor: 'black' }}></div>
              {trackState.audio === true ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </div>
          </div>
        </Draggable>
      </div>

      {hasDialled ? (
        users.length > 0 ? (
          users.map((user) => {
            if (user.videoTrack) {
              return (
                <AgoraVideoPlayer
                  videoTrack={user.videoTrack}
                  key={user.uid}
                  style={{ height: '100%', width: '100%' }}
                />
              );
            } else return null;
          })
        ) : (
          videoRemoteStatus === false && (
            <div className={cx('box-calling')}>
              <div className={cx('img-avt')}>
                <Image src={partnerAvatar} alt={partnerName} className={cx('avatar-partner')} />
              </div>
              <div className={cx('calling')}>
                <div className={cx('text')}>Camera {partnerName} đang tắt</div>
              </div>
            </div>
          )
        )
      ) : (
        <div className={cx('box-calling')}>
          <div className={cx('img-avt')}>
            <Image src={partnerAvatar} alt={partnerName} className={cx('avatar-partner')} />
          </div>
          <div className={cx('calling')}>
            <div className={cx('text')}>Dialling</div>
            <div className={cx('bouncing-loader')}>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Video;
