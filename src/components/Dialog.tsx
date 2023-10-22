import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { HiXCircle } from 'react-icons/hi';

function Dialog({ isShowing, value, setvalue, hide, content, onClickSend, onClickRemove, placeholder }: DialogProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let timmout: any;
    if (isShowing === false) {
      timmout = setTimeout(() => {
        setShow(false);
      }, 450);
    } else {
      setShow(true);
    }
    return () => clearTimeout(timmout);
  }, [isShowing]);

  return ReactDOM.createPortal(
    <Fragment>
      {show && (
        <div
          className="fixed w-screen h-screen top-0 left-0 z-[1024] bg-overlay-color"
          onClick={isShowing ? hide : () => {}}
        />
      )}
      <div
        className={`${
          show ? 'block' : 'hidden'
        } fixed top-1/2 left-1/2 w-fit h-fit -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-[1025]`}
      >
        <div
          className={`${
            isShowing ? 'show-dialog' : 'dialog-unmount'
          } w-[500px] h-[250px] sm:px-[10px] xs:px-[5px] flex flex-col justify-between items-center sm:w-[calc(100vw_/_1.1)] sm:h-[calc(100vh_/_3)] xs:w-[calc(100vw_/_1.03)]  bg-white z-50 select-auto rounded-[20px] px-[20px] py-[10px] shadow-[#000000b6] shadow-lg`}
        >
          <div className="w-full text-center text-[20px] font-medium sm:text-[18px] xs:text-[16px]">{content}</div>
          <div className="w-full h-[40px] flex bg-grey-opa-color px-[10px] rounded">
            <input
              value={value}
              onChange={(e: any) => setvalue(e.target.value)}
              className="w-full h-full  pr-[5px] placeholder:text-[#3f6d86]"
              placeholder={placeholder}
            />
            {value.length > 0 && (
              <button onClick={() => setvalue('')}>
                <HiXCircle />
              </button>
            )}
          </div>
          <div className="w-full flex justify-between items-center px-[10px] xs:px-[5px]">
            <button
              onClick={hide}
              className="p-[8px_30px] sm:p-[8px_15px] xs:p-[5px_10px] text-[16px] xs:text-[14px] hover:shadow-lg hover:text-danger-color border border-solid hover:border-danger-color hover:bg-white bg-danger-color text-white rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={onClickRemove}
              className="p-[8px_30px] sm:p-[8px_15px] xs:p-[5px_10px] text-[16px] xs:text-[14px] hover:shadow-lg hover:text-warning-color border border-solid hover:border-warning-color hover:bg-white bg-warning-color text-white rounded-full"
            >
              Delete Name
            </button>
            <button
              onClick={onClickSend}
              className="p-[8px_30px] sm:p-[8px_15px] xs:p-[5px_10px] text-[16px] xs:text-[14px] hover:shadow-lg hover:text-primary-color border border-solid hover:border-primary-color hover:bg-white bg-primary-color text-white rounded-full"
            >
              Rename
            </button>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

interface DialogProps {
  isShowing: boolean;
  hide: () => void;
  content: string;
  placeholder: string;
  onClickSend?: () => void;
  onClickRemove?: () => void;
  value: string;
  setvalue: Dispatch<SetStateAction<string>>;
}
export default Dialog;
