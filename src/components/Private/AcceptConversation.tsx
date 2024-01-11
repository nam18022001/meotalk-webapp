import { deleteDoc, deleteField, doc, updateDoc } from 'firebase/firestore';
import { Fragment, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '~/configs';
import { decryptAES, encryptAES } from '~/functions/hash';
import { setLocalStorageKey } from '~/functions/private';
import { toastError } from '~/hooks/useToast';
import { db } from '~/services/FirebaseServices';

function AcceptConversation({ infoConversation, loadingConversation }: AcceptConversationProps) {
  const [showPassWord, setShowPassWord] = useState(false);
  const [pass, setPass] = useState('');
  const nav = useNavigate();
  const [inputPassWord, setInputPassWord] = useState({ data: '', show: false });

  const handleShowPassWord = () => {
    const p = decryptAES(infoConversation.key, config.constant.keyPrivate);
    setPass(p!);
    return setShowPassWord(true);
  };
  const handleInputPassWord = (e: any) => {
    const value = e.currentTarget.value;
    setInputPassWord((pre) => ({ data: value, show: pre.show }));
  };
  const handleAgreeandAccept = async () => {
    if (inputPassWord.data.length > 0) {
      if (inputPassWord.data === pass) {
        try {
          await updateDoc(doc(db, 'ChatPrivate', infoConversation.chatRoomID), {
            isAccepted: true,
            key: deleteField(),
          });
          const encryptedPassword = encryptAES(pass, config.constant.keyPrivate);
          setLocalStorageKey(encryptedPassword, infoConversation.chatRoomID);
        } catch (error) {}
      } else {
        toastError('Password incorrect!');
      }
    } else {
      toastError('Entering a password is mandatory.');
    }
  };
  const handleRefuse = async () => {
    const firm = confirm('Decline this conversation?');
    if (firm) {
      await deleteDoc(doc(db, 'ChatPrivate', infoConversation.chatRoomID));
      return nav(config.routes.homePrivate);
    }
  };
  return (
    <Fragment>
      {!loadingConversation && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-2/3 md:w-4/5 px-[10px] sm:w-full">
            <div className="overflow-auto">
              <div className="flex lg:flex-col md:flex-col sm:flex-col items-start justify-start">
                <span className="lg:text-[18px] md:text-[16px] sm:text-[16px]  underline underline-offset-8 font-bold text-[20px] text-danger-color">
                  Important Notes:
                </span>
                <ol className="ml-[25px] list-decimal flex-1 mt-[5px] ">
                  <li className="font-semibold lg:text-[16px] md:text-[14px] sm:text-[14px]">
                    The password is displayed only once when you are on this page. If forgotten or lost, please contact
                    the room creator.
                  </li>
                  <li className="font-semibold lg:text-[16px] md:text-[14px] sm:text-[14px]">
                    You must enter the correct password in the password input field.
                  </li>
                  <li className="font-semibold lg:text-[16px] md:text-[14px] sm:text-[14px]">
                    Once you confirm agreement, the password will be permanently deleted and will not be displayed
                    again.
                  </li>
                  <li className="font-semibold lg:text-[16px] md:text-[14px] sm:text-[14px]">
                    By clicking the 'confirm agreement' button, you acknowledge reading these notes.
                  </li>
                </ol>
              </div>
            </div>
            <div className="mt-[30px] flex flex-col">
              <div className="flex items-center whitespace-nowrap">
                <span className="text-[20px] sm:text-[18px] xs:text-[16px] font-sans font-semibold">Password:</span>
                {showPassWord ? (
                  <span className="px-[5px] bg-slate-100 ml-[10px] h-[20px] rounded-md">{pass}</span>
                ) : (
                  <button
                    onClick={handleShowPassWord}
                    className={showPassWord ? 'ml-[10px]' : 'w-[100px] h-[20px] rounded-md  bg-slate-600 ml-[10px]'}
                  ></button>
                )}
              </div>
              <div className=" flex-1 flex flex-col items-center  px-[20px] sm:px-[10px] my-[20px]">
                <div className="flex w-2/3 md:w-full sm:w-full h-[40px] px-[10px] bg-slate-200 rounded-[10px]">
                  <input
                    type={inputPassWord.show ? 'text' : 'password'}
                    className="w-full h-full"
                    placeholder="Enter Password"
                    onChange={handleInputPassWord}
                  />
                  <button
                    onClick={() => {
                      setInputPassWord((pre) => ({ data: pre.data, show: !pre.show }));
                    }}
                  >
                    {inputPassWord.show ? (
                      <FaEye className="text-[20px] text-warning-color" />
                    ) : (
                      <FaEyeSlash className="text-[20px] text-warning-color" />
                    )}
                  </button>
                </div>
                <div className="w-2/3 md:w-full sm:w-full flex items-center justify-between">
                  <button
                    onClick={handleRefuse}
                    className="flex-1 mx-[10px] py-[10px] px-[10px] rounded-[20px] mt-[10px] font-semibold uppercase whitespace-nowrap bg-danger-color text-white hover:border-danger-color hover:text-danger-color hover:bg-white border border-solid border-transparent"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAgreeandAccept}
                    className="flex-1 mx-[10px] py-[10px] px-[10px] rounded-[20px] mt-[10px] font-semibold uppercase whitespace-nowrap bg-success-color text-white hover:border-success-color hover:text-success-color hover:bg-white border border-solid border-transparent"
                  >
                    Agree and Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
interface AcceptConversationProps {
  infoConversation: any;
  loadingConversation: boolean;
  onClickCall?: () => void;
}
export default AcceptConversation;
