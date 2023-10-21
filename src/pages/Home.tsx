import { Fragment, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatIcon } from '~/assets/icons';
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
      <div className="flex-1 h-full flex items-center justify-center ">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img className="w-1/6 md:w-1/3 " src={chatIcon.icon} alt={chatIcon.alt} />
          <p className="text-[1.2333333vw] md:text-[20px] sm:!text-[16px] font-semibold">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    </Fragment>
  );
}

export default HomePage;
