import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaVideo, FaVideoSlash } from 'react-icons/fa';

function Controls({ mute, leaveChannel, trackState, voice = false }: ControlsProps) {
  return (
    <div className="wrapper-control-video-widget min-w-[400px]">
      <div className="actions-control-video-widget lg:!flex-[0.5] md:!flex-[0.6] sm:!flex-[0.8]">
        <button className="" onClick={() => mute('audio')}>
          {voice ? (
            trackState ? (
              <FaMicrophone className="icon-control-video-widget" />
            ) : (
              <FaMicrophoneSlash className="icon-control-video-widget icon-off-control-video-widget" />
            )
          ) : trackState.audio ? (
            <FaMicrophone className="icon-control-video-widget" />
          ) : (
            <FaMicrophoneSlash className="icon-control-video-widget icon-off-control-video-widget" />
          )}
        </button>
        <button className="btn-phone-control-video-widget" onClick={leaveChannel}>
          <FaPhone className="icon-control-video-widget" />
        </button>
        {voice === false && (
          <button onClick={() => mute('video')}>
            {trackState.video ? (
              <FaVideo className="icon-control-video-widget" />
            ) : (
              <FaVideoSlash className="icon-control-video-widget icon-off-control-video-widget" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
interface ControlsProps {
  tracks?: any;
  mute: (type: any) => void;
  leaveChannel: () => void;
  trackState: any;
  voice?: boolean;
}
export default Controls;
