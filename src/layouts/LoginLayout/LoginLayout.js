import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import styles from './LoginLayout.module.scss';

const cx = classNames.bind(styles);

function LoginLayout({ children }) {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <main>
          <div className={cx('wave')}></div>
          <div className={cx('content')}>{children}</div>
        </main>
      </div>
    </div>
  );
}
LoginLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LoginLayout;
