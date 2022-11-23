import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import Header from './components/Header';
import SideBar from './components/SideBar';

import styles from './MainLayout.module.scss';

const cx = classNames.bind(styles);

function MainLayout({ children }) {
  // eslint-disable-next-line

  return (
    <div className={cx('wrapper')}>
      <Header />
      <div className={cx('container')}>
        <SideBar />
        <main>
          <div className={cx('content')}>{children}</div>
        </main>
      </div>
    </div>
  );
}
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
