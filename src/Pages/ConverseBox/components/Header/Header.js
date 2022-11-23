import classNames from 'classnames/bind';
import { BsFillTelephoneFill } from 'react-icons/bs';
import { FaVideo } from 'react-icons/fa';

import Image from '~/components/Image';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

function Header({ data, onClickCall, onClickCallVideo }) {
  return (
    <div className={cx('header')}>
      <div className={cx('message-info')}>
        <Image className={cx('avatar')} src={data.photoUrl} alt={data.displayName} />
        <span>{data.displayName}</span>
      </div>
      <div className={cx('btn-actions')}>
        <button className={cx('btn-action')} onClick={onClickCall}>
          <BsFillTelephoneFill className={cx('icon')} />
        </button>
        <button className={cx('btn-action')} onClick={onClickCallVideo}>
          <FaVideo className={cx('icon')} />
        </button>
      </div>
    </div>
  );
}

export default Header;
