import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';

interface MobileVersionContextProps {
  children: ReactNode;
}
type MobileVersionContextContent = {
  isMobile: boolean;
  setIsMobile: Dispatch<SetStateAction<boolean>>;
};

function MobileVersionProvider({ children }: MobileVersionContextProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 576) {
      setIsMobile(true);
    }
  }, []);

  return <MobileVersionContext.Provider value={{ isMobile, setIsMobile }}>{children}</MobileVersionContext.Provider>;
}

const MobileVersionContext = createContext<MobileVersionContextContent>({
  isMobile: false,
  setIsMobile: () => {},
});
export const useMobileContext = () => useContext(MobileVersionContext);
export default MobileVersionProvider;
