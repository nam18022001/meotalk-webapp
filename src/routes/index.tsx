// Routes Config
import config from '~/configs';

//Pages
import Conversation from '~/pages/Conversation';
import Friends from '~/pages/Friends';
import HomePage from '~/pages/Home';
import LoginPage from '~/pages/Login';
import NewConversation from '~/pages/NewConversation';
import Profile from '~/pages/Profile';
import PrivateConversation from '~/pages/PrivateConversation';
import PrivateHomePage from '~/pages/PrivateHome';

//Layout
import MainLayoutNoSideBar from '~/layouts/MainLayout/MainLayoutNoSideBar';

//Public Routes
const publicRoutes: {}[] = [{ path: config.routes.login, component: LoginPage }];

// //Private Routes
const privateRoutes: {}[] = [
  { path: config.routes.home, component: HomePage },
  { path: config.routes.homePrivate, component: PrivateHomePage },
  { path: config.routes.conversation, component: Conversation },
  { path: config.routes.conversationPrivate, component: PrivateConversation },
  { path: config.routes.newConversation, component: NewConversation },
  { path: config.routes.profile, component: Profile, layout: MainLayoutNoSideBar },
  { path: config.routes.friends, component: Friends, layout: MainLayoutNoSideBar },
];

export { privateRoutes, publicRoutes };
