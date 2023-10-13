import { onAuthStateChanged } from 'firebase/auth';
import { Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import Loading from '~/components/Loading';
import { auth } from '~/services/FirebaseServices';

function AuthContextProfiver({ children }: AuthContextProfiverProps) {
  const [currentUser, setCurrentUser] = useState<{
    uid: string | null | '';
    displayName: string | null | '';
    email: string | null | '';
    photoURL: string | null | '';
  }>({
    uid: '',
    displayName: '',
    email: '',
    photoURL: '',
  });
  const [show, setShow] = useState(false);
  console.log(currentUser);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL });
        setShow(true);
      } else {
        setCurrentUser({ uid: '', displayName: '', email: '', photoURL: '' });
        setShow(true);
      }
    });
  }, []);

  return show ? (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>{children}</AuthContext.Provider>
  ) : (
    <Loading />
  );
}
const AuthContext = createContext<AuthContextContent>({
  currentUser: {
    uid: '',
    displayName: '',
    email: '',
    photoURL: '',
  },
  setCurrentUser: () => {},
});

interface AuthContextProfiverProps {
  children: ReactNode;
}
type AuthContextContent = {
  currentUser: {
    uid: string | null | '';
    displayName: string | null | '';
    email: string | null | '';
    photoURL: string | null | '';
  };
  setCurrentUser: Dispatch<
    SetStateAction<{
      uid: string | null | '';
      displayName: string | null | '';
      email: string | null | '';
      photoURL: string | null | '';
    }>
  >;
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthContextProfiver;
