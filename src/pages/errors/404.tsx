import { Link } from 'react-router-dom';
import { redirectErrorIcon } from '~/assets/icons';
import config from '~/configs';

function RedirectErrorPage() {
  return (
    <div className="container-error-page">
      <div className="chat-icon-error">
        <img className="w-full h-full" src={redirectErrorIcon.icon} alt="icon" />
      </div>
      <h1 className="sm:!text-[20px] xs:!text-[18px]">Oops! The page you are looking for does not exist.</h1>
      <p className="sm:!text-[16px] xs:!text-[14px]">Please go back to the home page or check the URL again.</p>
      <Link to={config.routes.home} className="btn-error">
        Home Page
      </Link>
    </div>
  );
}

export default RedirectErrorPage;
