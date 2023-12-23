// Routes Config
import config from '~/configs';

//Pages
import HomePage from '~/pages/Home';
import Conversation from '~/pages/Conversation';
import LoginPage from '~/pages/Login';
import NewConversation from '~/pages/NewConversation';
import Profile from '~/pages/Profile';
import Friends from '~/pages/Friends';

//Layout
import MainLayoutNoSideBar from '~/layouts/MainLayout/MainLayoutNoSideBar';

//Public Routes
const publicRoutes: {}[] = [{ path: config.routes.login, component: LoginPage }];

// //Private Routes
const privateRoutes: {}[] = [
  { path: config.routes.home, component: HomePage },
  { path: config.routes.conversation, component: Conversation },
  { path: config.routes.newConversation, component: NewConversation },
  { path: config.routes.profile, component: Profile, layout: MainLayoutNoSideBar },
  { path: config.routes.friends, component: Friends, layout: MainLayoutNoSideBar },
];

export { publicRoutes, privateRoutes };
