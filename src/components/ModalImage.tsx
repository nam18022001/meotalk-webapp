import { ref } from 'firebase/storage';
import { Fragment, useState } from 'react';
import ReactDOM from 'react-dom';
import { AiOutlineSend } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { toastError } from '~/hooks/useToast';
import { cloud } from '~/services/FirebaseServices';

function ModalImage({ isShowing, hide, content, onClickSend, upLoadImage, download }: ModalImageProps) {
  const [loadedImage, setLoadedImage] = useState(false);
  const refImage = ref(cloud, content);
  const fileName = refImage.name.split('&&')[2];

  const downloadFile = async () => {
    toastError('ad');
    const downloadImage = async () => {
      const image = await fetch(content);
      const imageBlog = await image.blob();
      const imageURL = URL.createObjectURL(imageBlog);
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
        <Fragment>
          <div className="fixed w-screen h-screen top-0 left-0 z-[1024] bg-overlay-color" />
          <div className="fixed w-screen h-screen top-0 left-0 z-[1025] flex items-center justify-center">
            <div className="w-[35%] md:w-[70%] lg:w-[50%] sm:!w-[85%] xs:!w-[95%] sm:max-h-[75%] xs:!max-h-[70%] bg-white max-h-[90%] overflow-y-hidden rounded-[20px]">
              <div className="p-[20px_10px] sm:p-[15px_10px] w-full h-full ">
                <div className="w-full flex items-center justify-between border-b border-b-[rgba(68,70,80,0.12)] py-[10px]">
                  <button
                    className="sm:w-[20px] sm:h-[20px] w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[rgba(56,58,69,0.175)]"
                    onClick={hide}
                  >
                    <IoMdClose className="text-[24px] text-[rgba(231,41,41,0.613)]" />
                  </button>
                  <div className="text-[24px] font-medium sm:text-[18px] xs:text-[14px]">Preview Image</div>
                  {upLoadImage ? (
                    <button
                      onClick={onClickSend}
                      className="sm:w-[20px] sm:h-[20px] w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[rgba(56,58,69,0.175)]"
                    >
                      <AiOutlineSend className="text-[24px] text-[rgba(59,183,213,0.892)]" />
                    </button>
                  ) : (
                    download && (
                      <button
                        className="w-[40px] h-[40px] sm:w-[20px] sm:h-[20px] flex items-center justify-center rounded-full hover:bg-[rgba(56,58,69,0.275)]"
                        onClick={downloadFile}
                      >
                        <FiDownload className="text-[24px] text-[rgba(59,183,213,0.892)]" />
                      </button>
                    )
                  )}
                </div>
                <div className="mt-[10px] w-full xl:max-h-[calc(100vh_-_61px_-_20vh)] overflow-auto  border border-solid border-search-icon-color rounded-[10px] ">
                  <img
                    src={content}
                    alt="preview"
                    className={`${
                      loadedImage ? '' : 'absolute opacity-0 '
                    }h-full w-full rounded-[10px] object-cover overflow-auto`}
                    onLoad={() => setLoadedImage(true)}
                    onError={() => setLoadedImage(false)}
                  />
                </div>
                {!loadedImage && (
                  <div className="w-full h-[400px] bg-[rgba(22,24,35,.24)] rounded-[20px]">
                    <div className="loader-wrapper-conversation">
                      <div className="loader-conversation"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Fragment>,
        document.body,
      )
    : null;
}
interface ModalImageProps {
  isShowing: boolean;
  hide: () => void;
  content: string;
  onClickSend?: () => void;
  upLoadImage?: boolean;
  download?: boolean;
}
export default ModalImage;
