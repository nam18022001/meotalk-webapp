import { onSnapshot } from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { getListChat, getListChatPrivate } from '~/services/loadChatRoomServices';
import { useAuthContext } from './AuthContextProvider';

function PreloadSideBarProvider({ children }: PreloadSideBarProviderProps) {
  const { currentUser } = useAuthContext();
  const [listConversation, setListConversation] = useState<{}[]>([]);
  const [listPrivateConver, setListPrivateConver] = useState<{}[]>([]);

  const [countUnReadPrivate, setCountUnReadPrivate] = useState(0);

  useEffect(() => {
    const getChatRoom = getListChat({ currentUser });

    onSnapshot(getChatRoom, (chatRoomSnap) => {
      const chatRoom: {}[] = [];
      if (chatRoomSnap.empty) {
        //handle no chat
        setListConversation([]);
      } else {
        chatRoomSnap.docs.map((res) => {
          chatRoom.push(res.data());
        });
        setListConversation(chatRoom);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    const getChatPrivate = getListChatPrivate({ currentUser });
    onSnapshot(getChatPrivate, (chatRoomSnap) => {
      const chatRoom: {}[] = [];
      if (chatRoomSnap.empty) {
        //handle no chat
        setListPrivateConver([]);
      } else {
        let countUnseen = 0;
        chatRoomSnap.docs.map((res) => {
          chatRoom.push(res.data());
          if (res.data().sender === currentUser.uid) {
            countUnseen = countUnseen + res.data().unSeenSender;
          } else if (res.data().reciever === currentUser.uid) {
            countUnseen = countUnseen + res.data().unSeenReciever;
          } else {
            countUnseen = 0;
          }
        });
        setCountUnReadPrivate(countUnseen);
        setListPrivateConver(chatRoom);
      }
    });
  }, [currentUser]);

  return (
    <PreloadSideBarContext.Provider value={{ listConversation, listPrivateConver, countUnReadPrivate }}>
      {children}
    </PreloadSideBarContext.Provider>
  );
}

const PreloadSideBarContext = createContext<PreloadSideBarContextContent>({
  countUnReadPrivate: 0,
  listConversation: [{}],
  listPrivateConver: [{}],
});
type PreloadSideBarContextContent = {
  countUnReadPrivate: number;
  listConversation: any[];
  listPrivateConver: any[];
};
interface PreloadSideBarProviderProps {
  children: ReactNode;
}
export const usePreloadSideBarContext = () => useContext(PreloadSideBarContext);
export default PreloadSideBarProvider;
