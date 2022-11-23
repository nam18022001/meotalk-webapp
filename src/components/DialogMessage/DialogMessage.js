import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import styles from './DialogMessage.module.scss';

const cx = classNames.bind(styles);

function DialogMessage({ showDialog, content, type }) {
  const [show, setShow] = useState(showDialog);
  useEffect(() => {
    const id = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(id);
  }, []);
  return (
    <div
      className={cx('dialog-message', {
        show: show === true,
        hide: show === false,
        error: type === 'error',
        success: type === 'success',
      })}
    >
      {content}
    </div>
  );
}
DialogMessage.propTypes = {
  showDialog: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  type: PropTypes.string,
};
export default DialogMessage;
