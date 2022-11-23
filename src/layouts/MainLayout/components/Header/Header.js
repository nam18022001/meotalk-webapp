import { memo, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import ToolTip from '@tippyjs/react';
import { FaCoins, FaUserAlt } from 'react-icons/fa';
import { AiFillSetting, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiGlobe, FiLogOut } from 'react-icons/fi';
import { IoIosNotifications } from 'react-icons/io';

import { logoIcon } from '~/assets/icons';
import Image from '~/components/Image';
import Menu from '~/components/Popper/Menu';
import config from '~/configs';
import Search from '../Search';
import styles from './Header.module.scss';
import { logout } from '~/services/authServices';

const cx = classNames.bind(styles);

const Menu_Items = [
  {
    icon: <FaUserAlt style={{ color: '#4d9ac0' }} />,
    title: 'View profile',
    to: '/',
  },
  {
    icon: <FaCoins style={{ color: '#4d9ac0' }} />,
    title: 'Get coins',
    to: '/coin',
  },
  {
    icon: <AiFillSetting style={{ color: '#4d9ac0' }} />,
    title: 'Settings',
    to: '/settings',
  },
  {
    icon: <FiGlobe style={{ color: '#4d9ac0' }} />,
    title: 'English',
    children: {
      title: 'Language',
      data: [
        {
          type: 'Language',
          code: 'en',
          title: 'English',
        },
        {
          type: 'Language',
          code: 'vi',
          title: 'Tiếng Việt',
        },
      ],
    },
  },
  {
    icon: <AiOutlineQuestionCircle style={{ color: '#4d9ac0' }} />,
    title: 'Feedback and help',
    to: '/feedback',
  },
  {
    icon: <FiLogOut style={{ color: '#4d9ac0' }} />,
    title: 'Log out',
    onClick: async () => {
      await logout();
    },
    separate: true,
  },
];

function Header() {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuChange = (menuItem) => {
    switch (menuItem.type) {
      case 'language':
        // Handle change language
        break;
      default:
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('content')}>
        <div className={cx('logo')}>
          <Link to={config.routes.home}>
            <img src={logoIcon.icon} alt={logoIcon.alt} />
          </Link>
        </div>
        <Search />
        <div className={cx('actions')}>
          <ToolTip delay={[0, 200]} content="Notification" placement="bottom" arrow>
            <button className={cx('actions-btn')}>
              <IoIosNotifications className={cx('icon')} />
              <span className={cx('badge')}>12</span>
            </button>
          </ToolTip>
          <Menu
            items={Menu_Items}
            onChange={handleMenuChange}
            onClickOutSide={() => setShowMenu(false)}
            show={showMenu}
          >
            <Image
              className={cx('user-avatar')}
              src={localStorage.getItem('avatar')}
              alt="avatar"
              onClick={() => setShowMenu(!showMenu)}
            />
          </Menu>
        </div>
      </div>
    </div>
  );
}

export default memo(Header);
