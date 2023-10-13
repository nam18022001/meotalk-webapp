import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import sizeChange from '~/hooks/useSizeChange';
import { useMobileContext } from './MobileVersionContextProvider';

interface MenuContext {
  children: ReactNode;
}
type MenuContextContent = {
  slideBarCollapse: boolean;
  setSlideBarCollapse: Dispatch<SetStateAction<boolean>>;
};

function MenuContextProfiver({ children }: MenuContext) {
  const { isMobile } = useMobileContext();
  const [slideBarCollapse, setSlideBarCollapse] = useState(false);
  const size = sizeChange();

  useEffect(() => {
    if (isMobile) {
      setSlideBarCollapse(false);
    } else {
      if (size < 768) {
        setSlideBarCollapse(true);
      }
    }
  }, [size]);

  return <MenuContext.Provider value={{ slideBarCollapse, setSlideBarCollapse }}>{children}</MenuContext.Provider>;
}

const MenuContext = createContext<MenuContextContent>({
  slideBarCollapse: false,
  setSlideBarCollapse: () => {},
});
export const useMenuContext = () => useContext(MenuContext);
export default MenuContextProfiver;
