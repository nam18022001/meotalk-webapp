import Tippy from '@tippyjs/react';
import moment from 'moment';
import { Fragment, memo, useState } from 'react';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import Skeleton from 'react-loading-skeleton';

import useModal from '~/hooks/useModal';
import ModalImage from '../ModalImage';

function PrivateMessage({
  time,
  data,
  type = 'message',
  own,
  isRead,
  seen,
  seenImg,
  loadingConversation,
}: PrivateMessageProps) {
  const { isShowing, toggle } = useModal();
  const handleShowImage = () => {
    toggle();
  };

  const [loadedImage, setLoadedImage] = useState(false);

  return !loadingConversation ? (
    type !== 'notification' ? (
      <Fragment>
        <div
          className={`wrapper-message-conversation 
      ${own ? 'own-message-conversation' : ''}`}
        >
          <Fragment>
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
                className={`content-message-conversation xs:max-w-[200px]
            ${own && type === 'message' ? 'content-own-message-conversation' : ''} 
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
                ) : (
                  data
                )}
              </div>
            </Tippy>
          </Fragment>

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
      <div className="wrapper-message-conversation justify-center text-[14px] font-semibold text-warning-color">
        {data}
      </div>
    )
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
interface PrivateMessageProps {
  data: string;
  time?: number;
  type?: string;
  own?: boolean;
  isRead?: boolean;
  seen?: boolean;
  seenImg?: string;
  loadingConversation?: boolean;
}
export default memo(PrivateMessage);
