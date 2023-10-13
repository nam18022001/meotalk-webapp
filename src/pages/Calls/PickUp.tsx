import { Fragment } from 'react';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import { avatarIcon } from '~/assets/icons';

function PickUp({ data, onPickOut, onPickUp }: PickUpProps) {
  return (
    <Fragment>
      <div className="wrapper-pick-up bg-grey-opa-color ">
        <div className="box-calling-pick-up lg:w-[80%] md:w-[90%] sm:w-[95%]">
          <img
            className="caller-avatar-pick-up sm:w-[70px] sm:h-[70px]"
            src={data.callerAvatar}
            alt={data.callerName}
            onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
          />
          <div className="caller-name-pick-up mt-[10px] sm:text-[20px]">
            <h2>{data.callerName}</h2>
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
              <FaPhone className="icon-pick-up icon-in-pick-up" />
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
}
export default PickUp;
