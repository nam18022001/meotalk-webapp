import Tippy from '@tippyjs/react';
import { Fragment, useEffect } from 'react';
import { IoAdd } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import { chatIcon } from '~/assets/icons';
import config from '~/configs';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';

function HomePage() {
  const { isMobile } = useMobileContext();
  const nav = useNavigate();

  useEffect(() => {
    if (!isMobile && localStorage.getItem('w-l-c')) {
      nav('/conversation/' + localStorage.getItem('w-l-c'));
    }
  }, []);
  return (
    <Fragment>
      <div className="flex-1 h-full flex items-center justify-center relative">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img className="w-1/6 md:w-1/3 " src={chatIcon.icon} alt={chatIcon.alt} />
          <p className="text-[1.2333333vw] md:text-[20px] sm:!text-[16px] font-semibold">
            Select a chat to start messaging
          </p>
        </div>
        <Tippy content="New Conversation">
          <Link
            to={config.routes.newConversation}
            className="absolute bottom-[2vw] right-[2vw] w-[50px] h-[50px] bg-primary-color rounded-full flex items-center justify-center shadow-[0_2px_4px_#2F4F4F] button-add"
          >
            <IoAdd className="text-[30px] text-white " />
          </Link>
        </Tippy>
      </div>
    </Fragment>
  );
}

export default HomePage;
