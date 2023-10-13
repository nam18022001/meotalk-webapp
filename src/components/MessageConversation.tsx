import Tippy from '@tippyjs/react';
import moment from 'moment';
import { Fragment, useState } from 'react';
import { BsFillCheckCircleFill, BsFillTelephoneFill, BsTelephoneXFill } from 'react-icons/bs';
import Skeleton from 'react-loading-skeleton';

import useModal from '~/hooks/useModal';
import ModalImage from './ModalImage';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';

function MessageConversation({
  time,
  data,
  type = 'message',
  own,
  isRead,
  seen,
  seenImg,
  loadingConversation,
  onClickVideoRecall,
  onClickReCall,
}: MessageConversationProps) {
  const { isShowing, toggle } = useModal();
  const handleShowImage = () => {
    toggle();
  };

  const [loadedImage, setLoadedImage] = useState(false);

  return !loadingConversation ? (
    <Fragment>
      <div className={`wrapper-message-conversation ${own ? 'own-message-conversation' : ''}`}>
        {!own && (
          <img
            className="avatar-friend-message-conversation xs:w-[18px] xs:h-[18px] mr-[5px]"
            src={seenImg}
            alt={'avatar'}
          />
        )}
        <Tippy
          delay={500}
          content={
            moment(time).isSame(new Date(), 'day')
              ? `${moment(time).format('hh:mm a')}`
              : moment(time).isSame(new Date(), 'week')
              ? `${moment(time).format('dddd hh:mma')}`
              : `${moment(time).format('hh:mma, MMMM Do YYYY')}`
          }
          placement="left"
        >
          <div
            className={`content-message-conversation xs:max-w-[200px] ${
              own && type === 'message' ? 'content-own-message-conversation' : ''
            } 
            ${own && type === 'call' ? 'content-own-message-conversation' : ''} 
            ${own && type === 'videoCall' ? 'content-own-message-conversation' : ''} 
            ${type === 'image' ? 'md:w-[250px] sm:!w-[200px] image-message-message-conversation ' : ''}`}
          >
            {type === 'image' ? (
              <Fragment>
                <img
                  className={`${loadedImage ? '' : 'absolute opacity-0 '} mess-image-message-conversation ${
                    own ? 'cus-mess-image-message-conversation' : ''
                  }`}
                  src={data}
                  alt={'image-mess'}
                  onClick={handleShowImage}
                  onLoad={() => setLoadedImage(true)}
                />
                {!loadedImage && (
                  <div className="w-[300px] h-[300px] xs:h-[200px] xs:w-[200px] object-contain bg-[rgba(22,24,35,.24)] rounded-[20px]">
                    <div className="loader-wrapper-conversation">
                      <div className="loader-conversation"></div>
                    </div>
                  </div>
                )}
              </Fragment>
            ) : type === 'videoCall' || type === 'call' ? (
              <div className="w-[150px] h-[60px] flex flex-col items-center justify-center py-[10px]">
                <div className=" text-[16px]">{data}</div>
                <button
                  className={`w-full mt-[10px] rounded-[5px] flex justify-center items-center p-[3px_8px] ${
                    !own ? 'bg-[rgba(130,131,133,0.64)]' : 'bg-[rgba(0,0,0,0.55)]'
                  } `}
                  onClick={type === 'videoCall' ? onClickVideoRecall : onClickReCall}
                >
                  {type === 'videoCall' ? (
                    data === 'Cuộc gọi nhỡ' ? (
                      <FaVideoSlash className={`${!own ? 'text-danger-color' : ''} text-[18px] mr-[10px]`} />
                    ) : (
                      <FaVideo className={` mr-[10px]`} />
                    )
                  ) : data === 'Cuộc gọi nhỡ' ? (
                    <BsTelephoneXFill className={`${!own ? 'text-danger-color' : ''} text-[18px] mr-[10px]`} />
                  ) : (
                    <BsFillTelephoneFill className={` mr-[10px]`} />
                  )}
                  RE CALL
                </button>
              </div>
            ) : (
              data
            )}
          </div>
        </Tippy>
        <div className="seen-message-conversation xs:w-[10px] xs:h-[10px]">
          {own ? (
            isRead ? (
              seen && <img className="avatar-seen-message-conversation" src={seenImg} alt={'seen'} />
            ) : (
              <BsFillCheckCircleFill className="seen-icon-message-conversation" />
            )
          ) : (
            <></>
          )}
        </div>
        {type === 'image' && <ModalImage isShowing={isShowing} hide={() => toggle()} content={data} download />}
      </div>
    </Fragment>
  ) : (
    <div className={`wrapper-message-conversation ${own ? 'own-message-conversation' : ''}`}>
      {!own && <Skeleton className="avatar-friend-message-conversation" circle width={25} height={25} />}
      {type === 'image' ? (
        <Skeleton className={` md:!w-[250px] md:!h-[200px]`} borderRadius={20} width={300} height={400} />
      ) : (
        <Skeleton className={` md:!w-[150px] `} borderRadius={5} width={250} height={35} />
      )}
    </div>
  );
}
interface MessageConversationProps {
  data: string;
  time?: number;
  type?: string;
  own?: boolean;
  isRead?: boolean;
  seen?: boolean;
  seenImg?: string;
  loadingConversation?: boolean;
  onClickVideoRecall: () => void;
  onClickReCall: () => void;
}
export default MessageConversation;
