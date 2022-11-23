import { MdAdd } from 'react-icons/md';
import classNames from 'classnames/bind';
import ToolTip from '@tippyjs/react';

import styles from './FABButton.module.scss';
import { Link } from 'react-router-dom';
const cx = classNames.bind(styles);

function FABButton({ actions, openFab, onButtonAction }) {
  return (
    <div className={cx('fab')}>
      <button className={cx('fab-button', { active: openFab })} onClick={onButtonAction}>
        <MdAdd />
      </button>
      <ul className={cx('action-list')}>
        {actions.map((action, index) => (
          <li
            className={cx('action-icon')}
            key={index}
            style={
              openFab
                ? { transitionDelay: `${index * 100}ms`, marginTop: `-${(index + 1) * 60}px` }
                : { transitionDelay: `${index * 100}ms` }
            }
          >
            <ToolTip content={action.tooltip} placement="right">
              <Link to={action.link}>{action.icon}</Link>
            </ToolTip>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FABButton;
