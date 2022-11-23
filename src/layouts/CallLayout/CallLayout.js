import classNames from 'classnames/bind';

import styles from './CallLayout.module.scss';

const cx = classNames.bind(styles);

function CallLayout({ children }) {
  return <div className={cx('wrapper')}>{children}</div>;
}

export default CallLayout;
