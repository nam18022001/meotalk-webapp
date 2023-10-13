import Tippy from '@tippyjs/react';
import { Fragment, useRef, useState } from 'react';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { PiNotePencilDuotone } from 'react-icons/pi';
import { Link } from 'react-router-dom';

import ConverseItem from '~/components/ConverseItem';
import config from '~/configs';
import { useMenuContext } from '~/contexts/MenuContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { usePreloadSideBarContext } from '~/contexts/PreloadSideBarProvider';

function SideBar() {
  const { isMobile } = useMobileContext();
  const { slideBarCollapse, setSlideBarCollapse } = useMenuContext();
  const { listConversation } = usePreloadSideBarContext();

  const [showBorderTitle, setShowBorderTitle] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  const handleScrolling = () => {
    const scroll: number | undefined = navRef.current?.scrollTop;
    typeof scroll === 'number' && scroll > 30 ? setShowBorderTitle(true) : setShowBorderTitle(false);
  };
  return (
    <Fragment>
      <div
        className={`  ${
          isMobile
            ? 'w-screen border-none'
            : !slideBarCollapse
            ? 'w-sidebar-width sm:w-screen'
            : 'w-sidebar-width-collapse collapse-sidebar sm:!w-[100px] sm:min-w-[100px] '
        } h-full flex flex-col p-[10px] border-r border-r-primary-color bg-white  sm:p-[5px]  ${
          isMobile ? '' : 'sidebar'
        }`}
      >
        {!isMobile && (
          <div className="w-full relative flex items-center justify-end p-[0_10px_10px]">
            <Tippy content="New Conversation">
              <Link to={config.routes.newConversation}>
                <PiNotePencilDuotone className="relative text-[40px] md:text-[30px] md:p-[5px] rounded-full bg-[rgba(22,24,35,.14)] p-[8px] hover:bg-[rgba(22,24,35,.34)] cursor-pointer" />
              </Link>
            </Tippy>
          </div>
        )}
        <div
          className={`flex items-center justify-between p-[0_10px_10px] rounded-[10px] ${
            showBorderTitle ? 'border-title' : ''
          }`}
        >
          <h2 className={` font-bold ${isMobile ? 'text-[20px]' : 'sm:text-[16px] md:text-[20px] text-[24px]'}`}>
            Chats
          </h2>
          {!isMobile ? (
            !slideBarCollapse ? (
              <HiChevronDoubleLeft
                className=" text-[30px] cursor-pointer rounded-full hover:bg-search-icon-color p-[5px]"
                onClick={() => setSlideBarCollapse(true)}
              />
            ) : (
              <HiChevronDoubleRight
                className="md:text-[20px] md:p-[3px] text-[30px] cursor-pointer rounded-full hover:bg-search-icon-color p-[5px]"
                onClick={() => setSlideBarCollapse(false)}
              />
            )
          ) : (
            <Tippy content="New Conversation">
              <Link to={config.routes.newConversation}>
                <PiNotePencilDuotone className=" text-[30px] rounded-full bg-[rgba(22,24,35,.14)] p-[5px] hover:bg-[rgba(22,24,35,.34)] cursor-pointer" />
              </Link>
            </Tippy>
          )}
        </div>
        <div
          ref={navRef}
          className={`chats-list ${isMobile ? 'h-[calc(100vh_-_100px)]' : ''}`}
          onScroll={handleScrolling}
        >
          {listConversation.map((infoRoom: any, index) => (
            <ConverseItem key={index} data={infoRoom} />
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default SideBar;
