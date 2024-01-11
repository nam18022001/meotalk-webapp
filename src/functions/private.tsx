import CryptoJS from 'crypto-js';
import config from '~/configs';
import { decryptAES } from './hash';

function setLocalStorageKey(value: string, channel: string) {
  const abc = localStorage.getItem('l-k-p');

  if (abc !== undefined && abc !== null) {
    const getListKeyPrivate = JSON.parse(localStorage.getItem('l-k-p')!.toString());
    getListKeyPrivate[CryptoJS.MD5(channel).toString()] = value;
    return localStorage.setItem('l-k-p', JSON.stringify(getListKeyPrivate));
  } else {
    const md5HasChannel = CryptoJS.MD5(channel).toString();
    const has: any = {};
    has[md5HasChannel] = value;
    return localStorage.setItem('l-k-p', JSON.stringify(has));
  }
}

function getKeyChoosenPrivate(channel: string) {
  const abc = localStorage.getItem('l-k-p');
  if (abc !== undefined && abc !== null) {
    const getListKeyPrivate = JSON.parse(abc);
    const keyChoosen = getListKeyPrivate[CryptoJS.MD5(channel).toString()];
    const keyValue = decryptAES(keyChoosen, config.constant.keyPrivate);
    if (keyValue) {
      return keyValue;
    } else if (keyValue === null) {
      return null;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
export { getKeyChoosenPrivate, setLocalStorageKey };
