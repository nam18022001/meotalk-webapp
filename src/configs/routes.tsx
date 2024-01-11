const routes = {
  home: '/',
  homePrivate: '/security',
  login: '/login',
  profile: '/profile/:uidProfile',
  conversation: '/conversation/:idChatRoom',
  conversationPrivate: '/security/:idChatRoomPrivate',
  newConversation: '/conversation/new',
  newConversationPrivate: '/security/new',
  friends: '/friends',
};
export default routes;
