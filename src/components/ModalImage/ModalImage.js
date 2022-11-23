import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import { AiOutlineSend } from 'react-icons/ai';
import { ref } from 'firebase/storage';
import PropTypes from 'prop-types';

import styles from './ModalImage.module.scss';
import { FiDownload } from 'react-icons/fi';
import { cloud } from '~/services/FirebaseServices';

const cx = classNames.bind(styles);

const ModalImage = ({ isShowing, hide, content, onClick, upLoadImage, download }) => {
  const refImage = ref(cloud, content);
  const fileName = refImage.name.split('&&')[2];

  const downloadFile = async () => {
    const downloadImage = async () => {
      const image = await fetch(content);
      const imageBlog = await image.blob();
      const imageURL = URL.createObjectURL(imageBlog);
      console.log(imageURL);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.download = fileName;
      a.href = imageURL;
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(imageURL);
    };
    const handle = async () => {
      await downloadImage();
      hide();
    };
    handle();
  };
  return isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div className={cx('modal-overlay')} />
          <div className={cx('modal-wrapper')} aria-modal aria-hidden tabIndex={-1} role="dialog">
            <div className={cx('modal')}>
              <div className={cx('modal-header')}>
                <button data-dismiss="modal" aria-label="Close" onClick={hide}>
                  <span aria-hidden="true" className={cx('icon-close')}>
                    &times;
                  </span>
                </button>
                {upLoadImage ? (
                  <button data-dismiss="modal" aria-label="Close" onClick={onClick}>
                    <span aria-hidden="true" className={cx('icon-send')}>
                      <AiOutlineSend />
                    </span>
                  </button>
                ) : (
                  download && (
                    <button data-dismiss="modal" aria-label="Close" onClick={downloadFile}>
                      <span aria-hidden="true" className={cx('icon-download')}>
                        <FiDownload />
                      </span>
                    </button>
                  )
                )}
              </div>
              <img src={content} alt="preview" className={cx('preview')} />
            </div>
          </div>
        </React.Fragment>,
        document.body,
      )
    : null;
};
ModalImage.propTypes = {
  isShowing: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  upLoadImage: PropTypes.bool,
  downloadL: PropTypes.bool,
};
export default ModalImage;
