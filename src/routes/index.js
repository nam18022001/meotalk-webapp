// Routes Config
import config from '~/configs';

//Pages
import Home from '~/Pages/Home';
import Login from '~/Pages/Login';
import Profile from '~/Pages/Profile';
import { VideoCall } from '~/Pages/Call';
import ConverseBox from '~/Pages/ConverseBox';

//Layout
import CallLayout from '~/layouts/CallLayout';

//Public Routes
const publicRoutes = [{ path: config.routes.login, component: Login }];

//Private Routes
const privateRoutes = [
  { path: config.routes.home, component: Home },
  { path: config.routes.conversation, component: ConverseBox },
  { path: config.routes.profile, component: Profile },
  { path: config.routes.callvideo, component: VideoCall, layout: CallLayout },
];

export { publicRoutes, privateRoutes };
