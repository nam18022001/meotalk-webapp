import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';

import styles from './Pickup.module.scss';
import Image from '../Image';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';

const cx = classNames.bind(styles);

function Pickup({ show, data, onPickOut, onPickUp }) {
  return (
    show &&
    ReactDOM.createPortal(
      <React.Fragment>
        <div className={cx('wrapper')}>
          <div className={cx('box-calling')}>
            <Image className={cx('caller-avatar')} src={data.callerAvatar} alt={data.callerName} />
            <div className={cx('caller-name', 'mt-10')}>
              <h2>{data.callerName}</h2>
            </div>
            <div className={cx('threedotloader', 'mt-5')}>
              <span>Incoming</span>
              <div className={cx('dot')}></div>
              <div className={cx('dot')}></div>
              <div className={cx('dot')}></div>
            </div>
            <div className={cx('actions')}>
              <button className={cx('btn-out')} onClick={onPickOut}>
                <FaPhoneSlash className={cx('icon')} />
              </button>
              <button className={cx('btn-in')} onClick={onPickUp}>
                <FaPhone className={cx('icon', 'icon-in')} />
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>,
      document.body,
    )
  );
}

export default Pickup;
