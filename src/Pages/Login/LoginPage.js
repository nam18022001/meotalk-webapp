import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import Button from '~/components/Button';

import config from '~/configs';
import { login } from '~/services/authServices';
import styles from './Login.module.scss';
import { GoogleIcon } from '~/components/Icons';
import { addUser } from '~/services/firestoreService';

const cx = classNames.bind(styles);

function LoginPage() {
  const nav = useNavigate();
  const handleLogin = async () => {
    try {
      await login().then(async (res) => {
        await addUser(res.user);
      });
      nav(config.routes.home);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={cx('wrapper')}>
      <h1 className={cx('title')}>Meo Talk</h1>
      <div className={cx('input-wrapper')}>
        {/* eslint-disable-next-line */}
        <h1 className={cx('placeholder')}></h1>
      </div>
      <Button
        className={cx('login-btn')}
        leftIcon={<GoogleIcon width="32px" height="32px" />}
        large
        outline
        onClick={handleLogin}
      >
        Login With Google
      </Button>
    </div>
  );
}

export default LoginPage;
