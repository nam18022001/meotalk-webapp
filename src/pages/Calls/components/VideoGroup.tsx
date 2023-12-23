import { AgoraVideoPlayer } from 'agora-rtc-react';
import { Fragment, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import Draggable from 'react-draggable';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { avatarIcon } from '~/assets/icons';
import ProgressCircleBar from '~/components/ProgressCircleBar';
import { useAuthContext } from '~/contexts/AuthContextProvider';

function VideoGroup({
  users,
  tracks,
  groupName,
  partnerAvatar,

  hasDialled,

  trackState,
  timeout,
  dataCall,
}: VideoProps) {
  const { currentUser } = useAuthContext();
  const [onDrag, setOnDrag] = useState(false);

  console.log(users);

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
              <AgoraVideoPlayer
                videoTrack={tracks[1]}
                className={'video-video-widget'}
                style={{ objectFit: 'cover' }}
              />
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
          users.length === 1 ? (
            <div className="w-full h-full">
              {users.map((user, index) => {
                if (user.videoTrack) {
                  return (
                    <div className="w-full h-full bg-white" key={index}>
                      <AgoraVideoPlayer videoTrack={user.videoTrack} style={{ width: '100%', height: '100%' }} />
                    </div>
                  );
                } else {
                  let myIndex = dataCall.recieverId.indexOf(user.uid);
                  return (
                    <div className={'box-calling-video-widget w-full h-full items-center justify-center'}>
                      <div className={'img-avt-video-widget'}>
                        <img
                          src={myIndex === -1 ? dataCall.callerAvatar : dataCall.receiverAvatar[myIndex]}
                          alt={'avatar'}
                          className="avatar-partner-video-widget"
                        />
                      </div>
                      <div className={`calling-video-widget`}>
                        <div className={'text-video-widget'}>
                          Camera {myIndex === -1 ? dataCall.callerName : dataCall.receiverName[myIndex]} đang tắt
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="w-full h-full grid grid-cols-video-group md:grid-cols-video-group-md sm:grid-cols-video-group-sm gap-[2px]">
              {users.map((user, index) => {
                if (user.videoTrack) {
                  return (
                    <AgoraVideoPlayer
                      className="w-full h-full border border-white"
                      videoTrack={user.videoTrack}
                      key={index}
                      style={{ width: '100%', height: '100%' }}
                    />
                  );
                } else {
                  let myIndex = dataCall.recieverId.indexOf(user.uid);

                  return (
                    <div className={'box-calling-video-widget w-full h-full items-center justify-center'}>
                      <div className={'img-avt-video-widget'}>
                        <img
                          src={myIndex === -1 ? dataCall.callerAvatar : dataCall.receiverAvatar[myIndex]}
                          alt={'avatar'}
                          className="avatar-partner-video-widget"
                        />
                      </div>
                      <div className={`calling-video-widget`}>
                        <div className={'text-video-widget'}>
                          Camera {myIndex === -1 ? dataCall.callerName : dataCall.receiverName[myIndex]} đang tắt
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )
        ) : null
      ) : (
        <div className={'box-calling-video-widget'}>
          <div className={'img-avt-video-widget'}>
            {partnerAvatar.slice(0, 2).map((info, index) => (
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
              value={timeout}
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
      )}
    </div>
  );
}
interface VideoProps {
  users: any[];
  tracks: any;
  groupName?: string;
  partnerAvatar: string[];
  parnerUid?: number[];
  hasDialled: boolean;
  videoRemoteStatus?: any;
  trackState: any;
  timeout: number;
  dataCall: any;
}
export default VideoGroup;
