import { onSnapshot } from 'firebase/firestore';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { getListChat } from '~/services/loadChatRoomServices';
import { useAuthContext } from './AuthContextProvider';

function PreloadSideBarProvider({ children }: PreloadSideBarProviderProps) {
  const { currentUser } = useAuthContext();
  const [listConversation, setListConversation] = useState<{}[]>([]);

  useEffect(() => {
    const getChatRoom = getListChat({ currentUser });
    onSnapshot(getChatRoom, (chatRoomSnap) => {
      const chatRoom: {}[] = [];
      if (chatRoomSnap.empty) {
        //handle no chat
      } else {
        chatRoomSnap.forEach((res) => {
          chatRoom.push(res.data());
        });
        setListConversation(chatRoom);
      }
    });
  }, [currentUser]);
  return (
    <PreloadSideBarContext.Provider value={{ listConversation, setListConversation }}>
      {children}
    </PreloadSideBarContext.Provider>
  );
}

const PreloadSideBarContext = createContext<PreloadSideBarContextContent>({
  listConversation: [{}],
  setListConversation: () => {},
});
type PreloadSideBarContextContent = {
  listConversation: any[];
  setListConversation: Dispatch<SetStateAction<any[]>>;
};
interface PreloadSideBarProviderProps {
  children: ReactNode;
}
export const usePreloadSideBarContext = () => useContext(PreloadSideBarContext);
export default PreloadSideBarProvider;
