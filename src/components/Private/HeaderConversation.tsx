import Tippy from '@tippyjs/react';
import { Fragment, memo } from 'react';
import { FaInfo } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa6';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';

function PrivateHeader({ infoConversation, loadingConversation }: HeaderConversationProps) {
  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();

  return (
    <Fragment>
      <div className={`${isMobile ? 'max-h-[60px] flex-nowrap xs:p-[5px]' : ''} header-conversation`}>
        {isMobile && (
          <Link to={config.routes.homePrivate}>
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
              <img
                className="h-full w-full rounded-full object-contain "
                src={infoConversation.usersPhoto.filter((v: any) => v !== currentUser.photoURL)[0]}
                alt={infoConversation.usersDisplayName.filter((v: any) => v !== currentUser.displayName)[0]}
              />
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
              {infoConversation.usersDisplayName.filter((v: any) => v !== currentUser.displayName)[0]}
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
              <Tippy content="More">
                <button
                  className={`${
                    isMobile ? 'w-[40px] h-[40px] xs:w-[30px] xs:h-[30px] p-0 bg-[#8383838a] mx-[5px]' : ''
                  } btn-action-header-conversation`}
                  onClick={() => {}}
                >
                  <FaInfo className={`${isMobile ? 'xs:text-[16px] text-[20px]' : ''} icon-header-conversation`} />
                </button>
              </Tippy>
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
  infoConversation: any;
  loadingConversation: boolean;
  onClickCall?: () => void;
}
export default memo(PrivateHeader);
