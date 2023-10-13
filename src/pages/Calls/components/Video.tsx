import { AgoraVideoPlayer } from 'agora-rtc-react';
import { Fragment, useState } from 'react';
import Draggable from 'react-draggable';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { useAuthContext } from '~/contexts/AuthContextProvider';

function Video({ users, tracks, partnerName, partnerAvatar, hasDialled, videoRemoteStatus, trackState }: VideoProps) {
  const { currentUser } = useAuthContext();
  const [onDrag, setOnDrag] = useState(false);

  return (
    <div className="wrapper-video-widget min-w-[400px]">
      <div
        className={`my-video-video-widget sm:!w-[250px] sm:!h-[200px] lg:!right-0 lg:!bottom-auto lg:!top-0 md:!right-0 md:!bottom-auto md:!top-0 sm:!right-0 sm:!bottom-auto sm:!top-0 ${
          onDrag ? 'drag-video-widget' : ''
        }`}
      >
        <Draggable onStart={() => setOnDrag(true)} onStop={() => setOnDrag(false)}>
          <div className="wrap-video-video-widget">
            {trackState.video === true ? (
              <AgoraVideoPlayer videoTrack={tracks[1]} className={'video-video-widget '} />
            ) : (
              <div className={'video-video-widget '}>
                <div className={'mute-video-video-widget'}>
                  <div className={'turn-off-video-widget'}>
                    <img
                      src={currentUser.photoURL || undefined}
                      alt={currentUser.displayName || undefined}
                      className={`my-avatar-video-widget`}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="status-video-widget">
              {trackState.video === true ? <FaVideo className="text-primary-color" /> : <FaVideoSlash />}
              <div
                className={`w-[1px] h-[15px] ${
                  trackState.video === true && trackState.audio === true ? 'bg-primary-color' : 'bg-warning-color'
                }`}
              ></div>
              {trackState.audio === true ? <FaMicrophone className="text-primary-color" /> : <FaMicrophoneSlash />}
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
                  // className="w-full h-full"
                  videoTrack={user.videoTrack}
                  key={user.uid}
                  style={{ height: '100%', width: '100%' }}
                />
              );
            } else return null;
          })
        ) : (
          videoRemoteStatus === false && (
            <div className={'box-calling-video-widget'}>
              <div className={'img-avt-video-widget'}>
                <img src={partnerAvatar} alt={partnerName} className="avatar-partner-video-widget" />
              </div>
              <div className={`calling-video-widget`}>
                <div className={'text-video-widget'}>Camera {partnerName} đang tắt</div>
              </div>
            </div>
          )
        )
      ) : (
        <div className={'box-calling-video-widget'}>
          <div className={'img-avt-video-widget'}>
            <img src={partnerAvatar} alt={partnerName} className="avatar-partner-video-widget" />
          </div>
          <div className={`calling-video-widget`}>
            <div className={'text-video-widget'}>Dialling</div>
            <div className={'bouncing-loader-video-widget'}>
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
interface VideoProps {
  users: any[];
  tracks: any;
  partnerName?: string;
  partnerAvatar?: string;
  hasDialled: boolean;
  videoRemoteStatus: any;
  trackState: any;
}
export default Video;
