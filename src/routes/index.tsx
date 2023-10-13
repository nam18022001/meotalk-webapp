// Routes Config
import config from '~/configs';

//Pages
import HomePage from '~/pages/Home';
import Conversation from '~/pages/Conversation';
import LoginPage from '~/pages/Login';
import NewConversation from '~/pages/NewConversation';
import Profile from '~/pages/Profile';
import MainLayoutNoSideBar from '~/layouts/MainLayout/MainLayoutNoSideBar';

//Layout

//Public Routes
const publicRoutes: {}[] = [{ path: config.routes.login, component: LoginPage }];

// //Private Routes
const privateRoutes: {}[] = [
  { path: config.routes.home, component: HomePage },
  { path: config.routes.conversation, component: Conversation },
  { path: config.routes.newConversation, component: NewConversation },
  { path: config.routes.profile, component: Profile, layout: MainLayoutNoSideBar },
  //   { path: config.routes.callvideo, component: VideoCall, layout: CallLayout },
  //   { path: config.routes.myFriends, component: MyFriends, layout: OnlyHeaderLayout },
  //   { path: config.routes.friendsRequest, component: FriendsRequest, layout: OnlyHeaderLayout },
  //   { path: config.routes.myRequests, component: MyRequests, layout: OnlyHeaderLayout },
];

export { publicRoutes, privateRoutes };
