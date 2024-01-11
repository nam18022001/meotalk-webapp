import Tippy from '@tippyjs/react';
import { Fragment, memo } from 'react';
import { BsFillTelephoneFill } from 'react-icons/bs';
import { FaPenFancy, FaVideo } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa6';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import config from '~/configs';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';

function HeaderConversation({
  rename,
  nameRoom,
  infoConversation,
  loadingConversation,
  onClickCall,
  onClickCallVideo,
  onClickRenameGroup,
}: HeaderConversationProps) {
  const { isMobile } = useMobileContext();

  return (
    <Fragment>
      <div className={`${isMobile ? 'max-h-[60px] flex-nowrap xs:p-[5px]' : ''} header-conversation`}>
        {isMobile && (
          <Link to={config.routes.home}>
            <FaArrowLeft className="xs:text-[14px] mr-[3px] text-[16px]" />
          </Link>
        )}
        <div
          className={`${
            isMobile
              ? infoConversation.length > 1
                ? 'w-[calc(100vw_-_170px)] xs:w-[calc(100vw_-_150px)]'
                : 'w-[calc(100vw_-_150px)] xs:w-[calc(100vw_-_100px)]'
              : ''
          } message-info-header-conversation h-full`}
        >
          {!loadingConversation ? (
            <div
              className={`${
                isMobile ? 'w-[40px] h-[40px] xs:w-[30px] xs:h-[30px]' : ''
              } avatar-header-conversation h-full`}
            >
              {infoConversation.length > 0 &&
                (infoConversation.length > 1 ? (
                  infoConversation
                    .slice(0, 2)
                    .map((info, index) => (
                      <img
                        key={index}
                        className={`absolute border-[3px] border-solid border-white w-[35px] h-[35px] ${
                          isMobile ? 'w-[30px] h-[30px]  sm:w-[28px] sm:h-[28px] xs:w-[22px] xs:h-[22px]' : ''
                        } object-contain rounded-full  ${index === 0 ? 'bottom-0 left-0 z-20' : 'right-0 top-0 z-10'}`}
                        src={info.photoURL}
                        alt={info.displayName}
                      />
                    ))
                ) : (
                  <img
                    className="h-full w-full rounded-full object-contain "
                    src={infoConversation[0].photoURL}
                    alt={infoConversation[0].displayName}
                  />
                ))}
            </div>
          ) : (
            <Skeleton
              className={`${isMobile ? ' xs:!mx-[0px]' : ''}`}
              width={isMobile ? 40 : 50}
              height={isMobile ? 40 : 50}
              circle
            />
          )}
          {!loadingConversation ? (
            <span className={` ${isMobile ? ' flex-1 !text-[14px] xs:!text-[12px]' : ''} `}>
              {infoConversation.length > 0 && infoConversation.length > 1
                ? rename.length > 0
                  ? rename
                  : nameRoom.length > 0
                  ? nameRoom
                  : infoConversation.map(
                      (info, index) => info.displayName + `${index === infoConversation.length - 1 ? '' : ', '} `,
                    )
                : infoConversation.length > 0 && infoConversation[0].displayName}
            </span>
          ) : (
            <Skeleton
              className={`${isMobile ? '!w-[150px] xs:!w-[100px] xs:!ml-[0px]' : 'sm:!w-[120px] !w-[200px]'}`}
              enableAnimation
            />
          )}
        </div>
        <div className={`${isMobile ? 'mr-0 ' : ''} btn-actions-header-conversation`}>
          {!loadingConversation ? (
            <Fragment>
              <Tippy content="Call" placement="left">
                <button
                  className={`${
                    isMobile ? 'w-[40px] h-[40px] xs:w-[30px] xs:h-[30px] p-0 bg-[#8383838a] mx-[5px]' : ''
                  } btn-action-header-conversation`}
                  onClick={onClickCall}
                >
                  <BsFillTelephoneFill
                    className={`${isMobile ? 'xs:text-[16px] text-[20px]' : ''} icon-header-conversation`}
                  />
                </button>
              </Tippy>
              <Tippy content="Video Call" placement="left">
                <button
                  className={`${
                    isMobile ? 'w-[40px] h-[40px] xs:w-[30px] xs:h-[30px] p-0 bg-[#8383838a]' : ''
                  } btn-action-header-conversation`}
                  onClick={onClickCallVideo}
                >
                  <FaVideo className={`${isMobile ? 'xs:text-[16px] text-[20px]' : ''} icon-header-conversation`} />
                </button>
              </Tippy>

              {infoConversation.length > 1 && (
                <Tippy content="Rename Group" placement="left">
                  <button
                    className={`${
                      isMobile ? 'w-[40px] h-[40px] xs:w-[30px] xs:h-[30px] p-0 bg-[#8383838a]' : ''
                    } btn-action-header-conversation`}
                    onClick={onClickRenameGroup}
                  >
                    <FaPenFancy
                      className={`${isMobile ? 'xs:text-[16px] text-[20px]' : ''} icon-header-conversation`}
                    />
                  </button>
                </Tippy>
              )}
            </Fragment>
          ) : (
            <Fragment>
              <Skeleton
                className="mr-[10px] xs:mr-[5px]"
                width={isMobile ? 30 : 35}
                height={isMobile ? 30 : 35}
                circle
              />
              <Skeleton width={isMobile ? 30 : 35} height={isMobile ? 30 : 35} circle />
            </Fragment>
          )}
        </div>
      </div>
    </Fragment>
  );
}
interface HeaderConversationProps {
  nameRoom: string;
  rename: string;
  infoConversation: any[];
  loadingConversation: boolean;
  onClickCall?: () => void;
  onClickCallVideo?: () => void;
  onClickRenameGroup?: () => void;
}
export default memo(HeaderConversation);
