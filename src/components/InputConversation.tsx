import HeadLessTippy from '@tippyjs/react/headless';
import imageCompression from 'browser-image-compression';
import CryptoJS from 'crypto-js';
import EmojiPicker, { Categories, EmojiStyle, Theme } from 'emoji-picker-react';
import { getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { BsFillEmojiLaughingFill, BsImage } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import ReactTextareaAutosize from 'react-textarea-autosize';

import { useNavigate } from 'react-router-dom';
import config from '~/configs';
import { useAuthContext } from '~/contexts/AuthContextProvider';
import { useMobileContext } from '~/contexts/MobileVersionContextProvider';
import useModal from '~/hooks/useModal';
import sendNotifiCation from '~/hooks/useSendNotification';
import { toastError, toastWarning } from '~/hooks/useToast';
import { cloud } from '~/services/FirebaseServices';
import { addFirstMessage, addMessage, getlastMessage } from '~/services/conversationServices';
import { collectChats, docChatRoom } from '~/services/generalFirestoreServices';
import { makeNewConversation } from '~/services/newChatServices';
import { makeConversation } from '~/services/searchServices';
import ModalImage from './ModalImage';

function InputConversation({
  from = '',
  newConversation = false,
  dataUserNewConver = [],
  loadingConversation,
  chatRoomId,
  autoFocus,
  onFocusInput,
  infoFriend,
  isGroup = false,
  handleReadMessages,
}: InputConversationProps) {
  const { isMobile } = useMobileContext();
  const { currentUser } = useAuthContext();
  const { isShowing, toggle } = useModal();
  const nav = useNavigate();
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
      toastError('Only accept files ending in png, jpg, jpeg, gif');
    }
  };

  const handleSendImage = async () => {
    toggle();
    URL.revokeObjectURL(dataImage.preview);
    delete dataImage.preview;

    // send
    const imgCloudRef = ref(cloud, `${chatRoomId}/${currentUser.email}&&${Date.now()}&&${dataImage.name}`);
    try {
      uploadBytesResumable(imgCloudRef, dataImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
          if (!newConversation) {
            const collectChat = collectChats(chatRoomId);

            const getDocChats = await getDocs(collectChat);

            if (getDocChats.empty) {
              addFirstMessage({ collectChat, currentUser, image: true, data: downloadURL });
              sendNotifiCation({ currentUser: currentUser, imageUrl: downloadURL, chatRoomId, infoFriend: infoFriend });
            } else {
              const orderStt = query(collectChat, orderBy('stt'));
              const getOrderStt = await getDocs(orderStt);

              const lastVisible = getOrderStt.docs[getOrderStt.docs.length - 1];
              const dataLast = lastVisible.data();

              addMessage({ collectChat, currentUser, data: downloadURL, dataLast, image: true });
            }
            sendNotifiCation({ currentUser: currentUser, imageUrl: downloadURL, chatRoomId, infoFriend: infoFriend });
          } else {
            let usersEmail: any[] = [currentUser.email];
            let usersUid: any[] = [currentUser.uid];

            if (dataUserNewConver.length > 1) {
              dataUserNewConver.forEach((data) => {
                usersEmail.push(data.email);
                usersUid.push(data.uid);
              });

              await makeNewConversation({ chatRoomId, isGroup: true, usersEmail, usersUid }).then(async () => {
                const collectChat = collectChats(chatRoomId);
                await addFirstMessage({
                  collectChat,
                  currentUser,
                  image: true,
                  data: downloadURL,
                  isGroup: true,
                  photoSender: currentUser.photoURL?.toString(),
                });
                sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver, imageUrl: downloadURL });
              });
            } else {
              usersEmail.push(dataUserNewConver[0].email);
              usersUid.push(dataUserNewConver[0].uid);

              await makeConversation({ currentUser, data: dataUserNewConver[0] }).then(async () => {
                const collectChat = collectChats(chatRoomId);
                await addFirstMessage({
                  collectChat,
                  currentUser,
                  image: true,
                  data: downloadURL,
                });
                sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver, imageUrl: downloadURL });
              });
            }
          }
        });
      });

      const chatRoom = docChatRoom(chatRoomId);
      setDataImage({});
      upLoadImage!.current!.value = '';
      await updateDoc(chatRoom, {
        time: Date.now(),
      });
      if (from === 'new' && newConversation === false) {
        const hashUrlConversation = encodeURIComponent(
          CryptoJS.Rabbit.encrypt(chatRoomId, config.constant.keyHasUrl).toString(),
        );
        nav(`/conversation/${hashUrlConversation}`);
      }
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
      if (!newConversation) {
        setDataInput('');
        inPutRef?.current?.focus();
        // send message

        const collectChat = collectChats(chatRoomId);
        const chatRoom = docChatRoom(chatRoomId);
        const getDocChats = await getDocs(collectChat);

        if (isGroup) {
          if (getDocChats.empty) {
            await addFirstMessage({
              collectChat,
              currentUser,
              data: dataInput,
              isGroup: true,
              photoSender: currentUser.photoURL?.toString(),
            });
          } else {
            const dataLast = await getlastMessage({ collectChat });
            addMessage({
              collectChat,
              currentUser,
              data: dataInput,
              isGroup: true,
              photoSender: currentUser.photoURL?.toString(),
              dataLast,
            });
          }
        } else {
          if (getDocChats.empty) {
            addFirstMessage({ collectChat, currentUser, data: dataInput });
          } else {
            const dataLast = await getlastMessage({ collectChat });

            addMessage({ collectChat, currentUser, data: dataInput, dataLast });
          }
        }
        await updateDoc(chatRoom, {
          time: Date.now(),
        });
        console.log(infoFriend);

        sendNotifiCation({ currentUser, chatRoomId, infoFriend });
        if (from === 'new' && newConversation === false) {
          const hashUrlConversation = encodeURIComponent(
            CryptoJS.Rabbit.encrypt(chatRoomId, config.constant.keyHasUrl).toString(),
          );
          nav(`/conversation/${hashUrlConversation}`);
        }
      } else {
        setDataInput('');
        inPutRef?.current?.focus();
        let usersEmail: any[] = [currentUser.email];
        let usersUid: any[] = [currentUser.uid];

        if (dataUserNewConver.length > 1) {
          dataUserNewConver.forEach((data) => {
            usersEmail.push(data.email);
            usersUid.push(data.uid);
          });

          await makeNewConversation({ chatRoomId, isGroup: true, usersEmail, usersUid }).then(async () => {
            const collectChat = collectChats(chatRoomId);
            await addFirstMessage({
              collectChat,
              currentUser,
              data: dataInput,
              isGroup: true,
              photoSender: currentUser.photoURL?.toString(),
            });
            sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
          });
        } else {
          usersEmail.push(dataUserNewConver[0].email);
          usersUid.push(dataUserNewConver[0].uid);

          await makeConversation({ currentUser, data: dataUserNewConver[0] }).then(async () => {
            const collectChat = collectChats(chatRoomId);
            await addFirstMessage({
              collectChat,
              currentUser,
              data: dataInput,
            });
            sendNotifiCation({ currentUser, chatRoomId, infoFriend: dataUserNewConver });
          });
        }
      }
    } else {
      toastWarning('Message must be non-empty');
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
  from?: string;
  newConversation?: boolean;
  dataUserNewConver?: any[];
  loadingConversation?: boolean;
  chatRoomId: string;
  autoFocus?: boolean;
  onFocusInput?: () => void;
  infoFriend?: any[];
  isGroup?: boolean;
  handleReadMessages?: () => void;
}
export default memo(InputConversation);
