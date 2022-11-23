import { useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { memo } from 'react';

function Profile() {
  const { uidProfile } = useParams();
  const deHash = CryptoJS.Rabbit.decrypt(uidProfile, 'hashURL');
  const uid = CryptoJS.enc.Utf8.stringify(deHash);

  return <div>hello: {uid}</div>;
}

export default memo(Profile);
