import HeadLessTippy from '@tippyjs/react/headless';
import imageCompression from 'browser-image-compression';
import EmojiPicker, { Categories, EmojiStyle, Theme } from 'emoji-picker-react';
import { updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { BsFillEmojiLaughingFill, BsImage } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import ReactTextareaAutosize from 'react-textarea-autosize';

import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import { encryptAES } from '~/functions/hash';
import { getKeyChoosenPrivate } from '~/functions/private';
import useModal from '~/hooks/useModal';
import { toastError, toastWarning } from '~/hooks/useToast';
import { cloud } from '~/services/FirebaseServices';
import { addPrivateMessage } from '~/services/conversationServices';
import { collectMessagesPrivate, docChatPrivate } from '~/services/generalFirestoreServices';
import ModalImage from '../ModalImage';

function PrivateInput({
  roomData,
  isSender,
  loadingConversation,
  chatRoomId,
  autoFocus,
  onFocusInput,
  handleReadMessages,
}: InputConversationProps) {
  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();
  const { isShowing, toggle } = useModal();

  const [showEojiPicker, setShowEmojiPicker] = useState(false);

  // state
  const [dataInput, setDataInput] = useState('');
  const [dataImage, setDataImage] = useState<any>({});

  //  ref
  const inPutRef = useRef<HTMLTextAreaElement>(null);
  const upLoadImage = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      setDataInput('');
      setDataImage({});
    };
  }, [chatRoomId]);

  const handleEmojiShow = () => {
    setShowEmojiPicker(!showEojiPicker);
  };
  const handleEmojiSelected = (emoji: any) => {
    setDataInput(`${dataInput}${emoji.emoji}`);
  };

  const handleUploadImage = () => {
    !loadingConversation && upLoadImage!.current!.click();
  };

  const handleClosePrevieww = () => {
    toggle();
    URL.revokeObjectURL(dataImage.preview);
    setDataImage({});
    upLoadImage!.current!.value = '';
  };

  const handleUploadFile = async (e: any) => {
    const file = e.target.files[0];

    const fileExtension = file.name.split('.').pop();

    if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'gif') {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        toggle();
        const compressedImage: any = await imageCompression(file, options);
        compressedImage.preview = URL.createObjectURL(compressedImage);

        setDataImage(compressedImage);
      } catch (error) {
        console.log(error);
      }
    } else {
      upLoadImage!.current!.value = '';
      toastError('Only accept files ending in png, jpg, jpeg, gif');
    }
  };

  const handleSendImage = async () => {
    toggle();
    URL.revokeObjectURL(dataImage.preview);
    delete dataImage.preview;

    // send
    const imgCloudRef = ref(cloud, `zPrivate-${chatRoomId}/${currentUser.email}&&${Date.now()}&&${dataImage.name}`);
    try {
      uploadBytesResumable(imgCloudRef, dataImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
          const collectChat = collectMessagesPrivate(chatRoomId);
          const chatRoom = docChatPrivate(chatRoomId);
          const passWord = getKeyChoosenPrivate(chatRoomId);
          if (passWord !== null) {
            const data = encryptAES(downloadURL, passWord);

            await addPrivateMessage({ collectChat, currentUser, data, image: true });
            await updateDoc(chatRoom, {
              time: Date.now(),
            });
          } else {
            toastError('There has been an error.');
          }
        });
      });

      setDataImage({});
      upLoadImage!.current!.value = '';
      await updateunSeen();
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyDown = (e: any) => {
    if (!loadingConversation && e.keyCode == 13 && e.shiftKey == false) {
      handleSend();
    } else if (e.keyCode == 13 && e.shiftKey == true) {
      setDataInput((pre) => pre);
    }
  };
  const handleInput = (e: any) => {
    const inputData = e.target.value;
    if (!inputData.startsWith(' ') && !inputData.startsWith('\n')) {
      setDataInput(inputData);
    }
  };
  const handleSend = async () => {
    if (!loadingConversation && dataInput) {
      setDataInput('');
      inPutRef?.current?.focus();
      // send message
      const collectChat = collectMessagesPrivate(chatRoomId);

      const passWord = getKeyChoosenPrivate(chatRoomId);
      if (passWord !== null) {
        const data = encryptAES(dataInput, passWord);

        await addPrivateMessage({ collectChat, currentUser, data });
        await updateunSeen();
      } else {
        toastError('There has been an error.');
      }
    } else {
      toastWarning('Message must be non-empty');
    }
  };

  const updateunSeen = async () => {
    const chatRoom = docChatPrivate(chatRoomId);
    if (isSender) {
      await updateDoc(chatRoom, {
        time: Date.now(),
        unSeenReciever: roomData.unSeenReciever + 1,
      });
    } else {
      await updateDoc(chatRoom, {
        time: Date.now(),
        unSeenSender: roomData.unSeenSender + 1,
      });
    }
  };
  return (
    <Fragment>
      <div
        className={`input-conversation xs:p-[5px] min-h-[30px] ${isMobile ? 'w-screen' : ''}`}
        onMouseDown={handleReadMessages}
        onFocus={handleReadMessages}
      >
        <div className={`actions-input-conversation xs:pr-[5px] `}>
          <button
            className={`${
              isMobile ? 'w-[40px] h-[40px] xs:w-[30px] xs:h-[30px] flex justify-center  items-center p-[5px]' : ''
            } btn-action-input-conversation`}
            onClick={handleUploadImage}
          >
            <BsImage className={`${isMobile ? 'text-[16px] ' : ''} icon-input-conversation`} />
            <input ref={upLoadImage} hidden type="file" accept=".png, .jpg, .jpeg, .gif" onChange={handleUploadFile} />
          </button>
        </div>
        <div
          className={`${
            isMobile ? 'xs:pl-[8px] xs:h-[90%] xs:py-[5px] ' : ''
          } input-messages-input-conversation overflow-hidden`}
        >
          <ReactTextareaAutosize
            ref={inPutRef}
            className={`${
              isMobile ? ' xs:!text-[14px] text-[16px] flex items-end  h-full' : ''
            } sm:placeholder:text-[14px] xs:placeholder:text-[12px]`}
            value={dataInput}
            onChange={handleInput}
            placeholder="Send some messages to your friend... "
            autoFocus={autoFocus}
            onKeyDown={(e) => handleKeyDown(e)}
            onInput={onFocusInput}
          />
          <HeadLessTippy
            interactive
            visible={showEojiPicker}
            onHide={() => setShowEmojiPicker(false)}
            onClickOutside={() => setShowEmojiPicker(false)}
            render={(attrs) => (
              <div className={`${isMobile ? 'mr-0' : ''} emoji-picker-input-conversation`} tabIndex={-1} {...attrs}>
                <EmojiPicker
                  theme={Theme.LIGHT}
                  emojiStyle={EmojiStyle.GOOGLE}
                  onEmojiClick={(emoji) => handleEmojiSelected(emoji)}
                  lazyLoadEmojis
                  categories={[
                    {
                      name: 'Smiles & People',
                      category: Categories.SMILEYS_PEOPLE,
                    },
                  ]}
                />
              </div>
            )}
          >
            <button
              onClick={handleEmojiShow}
              className={`${isMobile ? 'xs:w-[30px] xs:h-[30px] xs:mr-[5px]' : ''} emoji-input-conversation`}
            >
              <BsFillEmojiLaughingFill className="icon-input-conversation" />
            </button>
          </HeadLessTippy>
        </div>
        <div className={`${isMobile ? 'pl-0' : ''} send-input-conversation`}>
          <button className="btn-send-input-conversation" onClick={handleSend}>
            <IoMdSend className="icon-input-conversation" />
          </button>
        </div>
        {dataImage && (
          <ModalImage
            isShowing={isShowing}
            hide={handleClosePrevieww}
            content={dataImage.preview}
            onClickSend={handleSendImage}
            upLoadImage
          />
        )}
      </div>
    </Fragment>
  );
}
interface InputConversationProps {
  roomData: any;
  loadingConversation?: boolean;
  chatRoomId: string;
  autoFocus?: boolean;
  isSender: boolean;
  onFocusInput?: () => void;
  handleReadMessages?: () => void;
}
export default memo(PrivateInput);
