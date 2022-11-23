import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import { Wrapper as PopperWrapper } from '~/components/Popper';
import PropTypes from 'prop-types';

import MenuItem from './MenuItem';
import styles from './Menu.module.scss';
import Header from './Header';
import { useState } from 'react';

const cx = classNames.bind(styles);

const defaultFn = () => {};

function Menu({ children, items = [], onChange = defaultFn, show, onClickOutSide }) {
  const [history, setHistory] = useState([{ data: items }]);
  const current = history[history.length - 1];

  const renderItems = () => {
    return current.data.map((item, index) => {
      const isParent = !!item.children;

      const handleClickMenuItem = () => {
        if (isParent) {
          setHistory((preHistory) => [...preHistory, item.children]);
        } else {
          onChange(item);
        }
      };

      return <MenuItem key={index} data={item} onClick={item.onClick || handleClickMenuItem} />;
    });
  };

  return (
    <Tippy
      interactive
      visible={show}
      placement="bottom-end"
      offset={[12, 10]}
      render={(attrs) => (
        <div className={cx('menu-list')} tabIndex="-1" {...attrs}>
          <PopperWrapper className={cx('menu-popper')}>
            {history.length > 1 && (
              <Header
                title={current.title}
                onBack={() => {
                  setHistory((prev) => prev.slice(0, prev.length - 1));
                }}
              />
            )}
            <div className={cx('menu-body')}>{renderItems()}</div>
          </PopperWrapper>
        </div>
      )}
      onClickOutside={onClickOutSide}
      onHide={() => {
        setHistory((prev) => prev.slice(0, 1));
      }}
    >
      {children}
    </Tippy>
  );
}
Menu.propTypes = {
  children: PropTypes.node.isRequired,
  items: PropTypes.array,
  show: PropTypes.bool,
  onChange: PropTypes.func,
  onClickOutSide: PropTypes.func,
};
export default Menu;
