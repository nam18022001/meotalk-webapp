import imageCompression from 'browser-image-compression';
import classNames from 'classnames/bind';
import EmojiPicker, { Categories, EmojiStyle, Theme } from 'emoji-picker-react';
import { addDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { memo, useEffect, useRef, useState } from 'react';
import { BsFillEmojiLaughingFill, BsImage } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';

import { cloud } from '~/services/FirebaseServices';
import DialogMessage from '~/components/DialogMessage';
import ModalImage from '~/components/ModalImage';
import { useModal } from '~/hooks';
import { collectChats, docChatRoom } from '~/services/firestoreService';
import styles from './Input.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

function Input({ chatRoomId, autoFocus, onFocusInput }) {
  const { isShowing, toggle } = useModal();
  // state
  const [dataInput, setDataInput] = useState('');
  const [dataImage, setDataImage] = useState();

  const [showEojiPicker, setShowEmojiPicker] = useState(false);
  const [showDialogMessageFileType, setShowDialogMessageFileType] = useState(false);
  //  ref
  const inPutRef = useRef();
  const upLoadImage = useRef();

  //  func
  const handleEmojiShow = () => {
    setShowEmojiPicker(!showEojiPicker);
  };

  const handleEmojiSelected = (emoji) => {
    setDataInput(`${dataInput}${emoji.emoji}`);
  };
  const handleSend = async () => {
    if (dataInput) {
      setDataInput('');
      inPutRef.current.focus();
      // send message

      const collectChat = collectChats(chatRoomId);
      const chatRoom = docChatRoom(chatRoomId);

      const getDocChats = await getDocs(collectChat);

      if (getDocChats.empty) {
        await addDoc(collectChat, {
          isRead: false,
          message: dataInput,
          sendBy: localStorage.getItem('email'),
          stt: 0,
          time: Date.now(),
          type: 'message',
        });
      } else {
        const orderStt = query(collectChat, orderBy('stt', 'desc'));
        const getOrderStt = await getDocs(orderStt);

        const lastVisible = getOrderStt.docs[0];
        const dataLast = lastVisible.data();

        await addDoc(collectChat, {
          isRead: false,
          message: dataInput,
          sendBy: localStorage.getItem('email'),
          stt: dataLast.stt + 1,
          time: Date.now(),
          type: 'message',
        });
      }

      await updateDoc(chatRoom, {
        time: Date.now(),
      });
    } else {
      console.log('error');
      toast.error('Make sure input has your message', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
  };

  const handleUploadImage = () => {
    upLoadImage.current.click();
  };
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];

    const fileExtension = file.name.split('.').pop();
    if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'gif') {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressedImage = await imageCompression(file, options);
        compressedImage.preview = URL.createObjectURL(compressedImage);

        setDataImage(compressedImage);

        toggle();
      } catch (error) {
        console.log(error);
      }
    } else {
      setShowDialogMessageFileType(true);
    }
  };

  const handleSendImage = async () => {
    toggle();
    URL.revokeObjectURL(dataImage.preview);
    delete dataImage.preview;
    // send
    const imgCloudRef = ref(cloud, `${chatRoomId}/${localStorage.getItem('email')}&&${Date.now()}&&${dataImage.name}`);
    uploadBytesResumable(imgCloudRef, dataImage).then((snapshot) => {
      getDownloadURL(snapshot.ref).then(async (downloadURL) => {
        const collectChat = collectChats(chatRoomId);

        const getDocChats = await getDocs(collectChat);

        if (getDocChats.empty) {
          await addDoc(collectChat, {
            isRead: false,
            message: downloadURL,
            sendBy: localStorage.getItem('email'),
            stt: 0,
            time: Date.now(),
            type: 'image',
          });
        } else {
          const orderStt = query(collectChat, orderBy('stt'));
          const getOrderStt = await getDocs(orderStt);

          const lastVisible = getOrderStt.docs[getOrderStt.docs.length - 1];
          const dataLast = lastVisible.data();

          await addDoc(collectChat, {
            isRead: false,
            message: downloadURL,
            sendBy: localStorage.getItem('email'),
            stt: dataLast.stt + 1,
            time: Date.now(),
            type: 'image',
          });
        }
      });
    });
    const chatRoom = docChatRoom(chatRoomId);

    setDataImage();
    upLoadImage.current.value = '';
    await updateDoc(chatRoom, {
      time: Date.now(),
    });
  };

  const handleClosePrevieww = () => {
    toggle();
    URL.revokeObjectURL(dataImage.preview);
    setDataImage();
    upLoadImage.current.value = '';
  };

  const handleInput = (e) => {
    const inputData = e.target.value;
    if (!inputData.startsWith(' ')) {
      setDataInput(inputData);
    }
  };
  // effect
  useEffect(() => {
    let idTimeOutDialogType;
    if (showDialogMessageFileType === true) {
      idTimeOutDialogType = setTimeout(() => {
        setShowDialogMessageFileType(false);
      }, 5500);
    }
    return () => clearTimeout(idTimeOutDialogType);
  }, [showDialogMessageFileType]);

  return (
    <div className={cx('input')}>
      <div className={cx('actions')}>
        <button className={cx('btn-action')} onClick={handleUploadImage}>
          <BsImage className={cx('icon')} />
          <input ref={upLoadImage} hidden type="file" accept=".png, .jpg, .jpeg, .gif" onChange={handleUploadFile} />
        </button>

        {showDialogMessageFileType && (
          <DialogMessage
            type={'error'}
            showDialog={true}
            content={'Sorry about that, we only accept files ending in png, jpg, jpeg, gif'}
          />
        )}
      </div>
      <div className={cx('input-messages')}>
        <input
          ref={inPutRef}
          value={dataInput}
          onChange={handleInput}
          placeholder="Send some messages to your friend... "
          autoFocus={autoFocus}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          onInput={onFocusInput}
        />

        <button onClick={handleEmojiShow} className={cx('emoji')}>
          <BsFillEmojiLaughingFill className={cx('icon')} />
        </button>
        <span className={cx('emoji-picker')}>
          {showEojiPicker && (
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
          )}
        </span>
      </div>
      <div className={cx('send')}>
        <button className={cx('btn-send')} onClick={handleSend}>
          <IoMdSend className={cx('icon')} />
        </button>
      </div>
      {dataImage && (
        <ModalImage
          isShowing={isShowing}
          hide={handleClosePrevieww}
          content={dataImage.preview}
          onClick={handleSendImage}
          upLoadImage
        />
      )}
    </div>
  );
}

export default memo(Input);
