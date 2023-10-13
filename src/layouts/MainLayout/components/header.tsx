import CryptoJS from 'crypto-js';
import { Fragment, useState } from 'react';
import { avatarIcon, logoIcon } from '~/assets/icons';
import Search from './search';

import { AiFillSetting, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaUserAlt, FaUserFriends } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import Menu from '~/components/Menu';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { logout } from '~/services/loginServices';

function Header() {
  const { currentUser } = useAuthContext();
  const { isMobile } = useMobileContext();
  const [showMenu, setShowmenu] = useState(false);
  const hastUrlProfile = CryptoJS.Rabbit.encrypt(currentUser!.uid!, 'hashUrlProfile').toString();

  const Menu_Items = [
    {
      icon: <FaUserAlt style={{ color: '#4d9ac0' }} />,
      title: 'View profile',
      to: `/profile/${encodeURIComponent(hastUrlProfile)}`,
    },
    {
      icon: <FaUserFriends style={{ color: '#4d9ac0' }} />,
      title: 'Friends',
      children: {
        title: 'Friends',
        data: [
          {
            type: 'Friends',
            title: 'Friends List',
            to: '/myfriends',
          },
          {
            type: 'Friends',
            title: 'Friends Request',
            to: '/friendsrequest',
          },
          {
            type: 'Friends',
            title: 'My Request',
            to: '/myrequests',
          },
        ],
      },
    },
    {
      icon: <AiFillSetting style={{ color: '#4d9ac0' }} />,
      title: 'Settings',
      to: '/settings',
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

  const handleMenuChange = (menuItem: any) => {
    switch (menuItem.type) {
      case 'language':
        // Handle change language
        break;
      default:
    }
  };

  return (
    <Fragment>
      <div
        className={`${
          isMobile ? 'h-[60px] w-full px-[10px]' : 'container h-header-height px-default-px'
        }  bg-white shadow-[0_0_2px_var(--primary)] z-50 fixed`}
      >
        <div className="w-full h-full flex items-center justify-between">
          <img
            className="md:w-[50px] sm:!w-[40px] xs:!w-[30px] object-contain"
            src={logoIcon.icon}
            alt={logoIcon.alt}
          />
          <Search />
          <Menu
            items={Menu_Items}
            onChange={handleMenuChange}
            onClickOutSide={() => setShowmenu(false)}
            show={showMenu}
          >
            <div className="header-actions cursor-pointer flex items-center ">
              <img
                className="avatar-header md:w-[50px] sm:!w-[40px] xs:!w-[30px] w-[60px]"
                src={currentUser.photoURL || undefined}
                alt="avatar"
                onError={(e) => (e.currentTarget.src = avatarIcon.icon)}
                onClick={() => setShowmenu(!showMenu)}
              />
            </div>
          </Menu>
        </div>
      </div>
    </Fragment>
  );
}

export default Header;
