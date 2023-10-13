import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleIcon } from '~/assets/icons';
import config from '~/configs';
import { addUser, login } from '~/services/loginServices';

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
    <Fragment>
      <div className="wrapper-login">
        <h1 className={`title-login sm:text-[40px] xs:text-[30px]`}>Meo Talk</h1>
        <div className="input-wrapper lg:text-[200%] md:text-[150%] sm:w-[90%] xs:w-full sm:text-[30px]">
          <h1 className="placeholder before:sm:text-[18px] before:xs:text-[14px] after:sm:h-[20px] after:sm:!border-r-transparent"></h1>
        </div>
        <button
          onClick={handleLogin}
          className="login-btn lg:w-[50%] xs:!w-[96%] sm:!w-[80%] sm:text-[20px] xs:text-[16px] md:w-[60%] text-[30px] md:!text-[18px] px-[30px] py-[15px] md:px-[10px] md:py-[10px] sm:px-[8px] sm:py-[7px]"
        >
          <img className=" w-[13%]" src={googleIcon.icon} alt={googleIcon.alt} />
          Login With Google
          <img className=" w-[13%] opacity-0" src={googleIcon.icon} alt={googleIcon.alt} />
        </button>
      </div>
    </Fragment>
  );
}

export default LoginPage;
