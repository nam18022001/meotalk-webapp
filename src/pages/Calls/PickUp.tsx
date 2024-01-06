import { Fragment, useEffect, useState } from 'react';
import { FaPhone, FaPhoneSlash, FaVideo } from 'react-icons/fa';
import { avatarIcon } from '~/assets/icons';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { usePreloadSideBarContext } from '~/contexts/PreloadSideBarProvider';

function PickUp({ data, onPickOut, onPickUp, isGroup = false, type }: PickUpProps) {
  const { listConversation } = usePreloadSideBarContext();
  const { currentUser } = useAuthContext();
  const [groupName, setGroupName] = useState('');
  const [partnerAvatar, setPartnerAvatar] = useState<any[]>([]);

  useEffect(() => {
    if (isGroup) {
      const getRoom = listConversation.filter((list) => list.chatRoomID === data.channelName);
      if (getRoom.length === 1 && getRoom[0].chatRoomName !== undefined && getRoom[0].chatRoomName.length > 0) {
        setGroupName(getRoom[0].chatRoomName);
      } else {
        setGroupName(
          data.receiverName.map(
            (v: string, index: number) => v + `${index === data.receiverName.length - 1 ? '' : ', '} `,
          ),
        );
      }

      const myIndex = data.recieverUid.indexOf(currentUser.uid);
      const callerAvatar = data.callerAvatar;
      const recieverAvatar = data.receiverAvatar.filter((_: any, index: number) => index !== myIndex);
      const parnerAva = [callerAvatar, ...recieverAvatar];

      setPartnerAvatar(parnerAva);
    }
  }, [data, isGroup]);

  return (
    <Fragment>
      <div className="wrapper-pick-up bg-grey-opa-color ">
        <div className="box-calling-pick-up lg:w-[80%] md:w-[90%] sm:w-[95%]">
          {isGroup ? (
            <div className="flex items-center">
              {partnerAvatar.length > 0 &&
                partnerAvatar
                  .slice(0, 2)
                  .map((info, index) => (
                    <img
                      key={index}
                      className={`caller-avatar-pick-up border-2 border-solid border-black -ml-[20px] ${
                        index === 0 ? 'bottom-0 left-0 z-20' : 'right-0 top-0 z-10'
                      }`}
                      src={info}
                      alt={'avatar'}
                      onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                    />
                  ))}
            </div>
          ) : (
            <img
              className="caller-avatar-pick-up sm:w-[70px] sm:h-[70px]"
              src={data.callerAvatar}
              alt={data.callerName}
              onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
            />
          )}
          <div className="caller-name-pick-up mt-[10px] sm:text-[20px]">
            <h2>{isGroup ? groupName : data.callerName}</h2>
          </div>
          <div className="threedotloader-pick-up mt-[5px] ">
            <span>Incoming</span>
            <div className="dot-pick-up"></div>
            <div className="dot-pick-up"></div>
            <div className="dot-pick-up"></div>
          </div>
          <div className="actions-pick-up md:w-[50%] sm:w-[60%] xs:w-[90%]">
            <button className="btn-out-pick-up sm:!w-[60px] sm:!h-[60px]" onClick={onPickOut}>
              <FaPhoneSlash className="icon-pick-up" />
            </button>
            <button className="btn-in-pick-up sm:!w-[60px] sm:!h-[60px]" onClick={onPickUp}>
              {type === 'voice' ? (
                <FaPhone className="icon-pick-up icon-in-pick-up" />
              ) : (
                <FaVideo className="icon-pick-up icon-in-pick-up" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
interface PickUpProps {
  data: any;
  onPickOut: () => void;
  onPickUp: () => void;
  isGroup?: boolean;
  type: string;
}
export default PickUp;
