import classNames from 'classnames/bind';
import { memo } from 'react';

import styles from './Loading.module.scss';

const cx = classNames.bind(styles);

function Loading() {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('loader')}>
          <div className={cx('loader--dot')}></div>
          <div className={cx('loader--dot')}></div>
          <div className={cx('loader--dot')}></div>
          <div className={cx('loader--dot')}></div>
          <div className={cx('loader--dot')}></div>
          <div className={cx('loader--dot')}></div>
          <div className={cx('loader--text')}></div>
        </div>
      </div>
    </div>
  );
}

export default memo(Loading);
