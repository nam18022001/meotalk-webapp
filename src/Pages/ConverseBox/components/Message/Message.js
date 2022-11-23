import classNames from 'classnames/bind';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import PropTypes from 'prop-types';

import Image from '~/components/Image';
import ModalImage from '~/components/ModalImage';
import { useModal } from '~/hooks';
import styles from './Message.module.scss';

const cx = classNames.bind(styles);

function Message({ data, type = 'message', own, isRead, seen, seenImg }) {
  const { isShowing, toggle } = useModal();
  const handleShowImage = () => {
    toggle();
  };

  return (
    <div className={cx('wrapper', { own: own })}>
      {!own && <Image className={cx('avatar-friend')} src={seenImg} alt={'avatar'} />}
      <div className={cx('content', { 'content-own': own && type === 'message', 'image-message': type === 'image' })}>
        {type === 'image' ? (
          <Image
            className={cx('mess-image', {
              'cus-mess-image': own,
            })}
            src={data}
            alt={'image-mess'}
            onClick={handleShowImage}
          />
        ) : (
          data
        )}
      </div>
      <div className={cx('seen')}>
        {own ? (
          isRead ? (
            seen && <Image className={cx('avatar-seen')} src={seenImg} alt={'seen'} />
          ) : (
            <BsFillCheckCircleFill className={cx('seen-icon')} />
          )
        ) : (
          <></>
        )}
      </div>
      {type === 'image' && <ModalImage isShowing={isShowing} hide={() => toggle()} content={data} download />}
    </div>
  );
}
Message.propTypes = {
  data: PropTypes.string.isRequired,
  type: PropTypes.string,
  own: PropTypes.bool,
  isRead: PropTypes.bool,
  seen: PropTypes.bool,
  seenImg: PropTypes.string,
};
export default Message;
