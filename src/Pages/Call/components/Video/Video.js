import { AgoraVideoPlayer } from 'agora-rtc-react';

function Video({ users, tracks }) {
  console.log(users);
  return (
    <>
      <AgoraVideoPlayer videoTrack={tracks[1]} style={{ height: '100%', width: '100%' }} />
      {users.length > 0 &&
        users.map((user, index) => {
          if (user.videoTrack) {
            return (
              <div key={index}>
                <AgoraVideoPlayer
                  videoTrack={user.videoTrack}
                  key={user.uid}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            );
          } else return null;
        })}
    </>
  );
}

export default Video;
