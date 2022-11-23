import { useRef, useState } from 'react';
import classNames from 'classnames/bind';

import styles from './HomePage.module.scss';
import config from '~/configs';
import FABButton from '~/layouts/MainLayout/components/FABButton';
import { BsFillArrowDownRightCircleFill, BsFillArrowLeftCircleFill } from 'react-icons/bs';

const cx = classNames.bind(styles);

function HomePage() {
  const [openFab, setOpenFab] = useState(false);

  const homeRef = useRef();

  const handleButtonAction = () => {
    setOpenFab(!openFab);
  };
  return (
    <>
      <div ref={homeRef} onClick={() => setOpenFab(false)} className={cx('wrapper')}>
        <div className={cx('content')}>
          <div className={cx('left-message')}>
            <BsFillArrowLeftCircleFill className={cx('icon-left')} />
            <h2> If you have message, choose here for your hello with your friend </h2>
          </div>
          <div className={cx('down-message')}>
            <h2> If you have no message, click here and making friends </h2>
            <BsFillArrowDownRightCircleFill className={cx('icon-down')} />
          </div>
        </div>
      </div>
      <FABButton actions={config.actionsFab} onButtonAction={handleButtonAction} openFab={openFab} />
    </>
  );
}

export default HomePage;
