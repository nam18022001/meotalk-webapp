import CryptoJS from 'crypto-js';
function encryptAES(message: string, key: string) {
  const encryptedMessage = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(message), key);
  return encryptedMessage.toString();
}

function decryptAES(encryptedMessage: string, key: string) {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
    if (typeof decryptedMessage === 'string' && decryptedMessage.length > 0) {
      return decryptedMessage;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

function encryptAESObject(value: {}, key: string) {
  const message = JSON.stringify(value);
  const encrypted = CryptoJS.AES.encrypt(message, key).toString();
  return encrypted;
}

function decryptAESObject(message: string, key: string) {
  const decryptedMessage = CryptoJS.AES.decrypt(message, key);
  const v = decryptedMessage.toString(CryptoJS.enc.Utf8);
  const decryptedObject = JSON.parse(v);

  return decryptedObject;
}
export { encryptAES, decryptAES, encryptAESObject, decryptAESObject };
