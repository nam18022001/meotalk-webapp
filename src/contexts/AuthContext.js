import { createContext, useState, useEffect } from 'react';
import { auth } from '~/services/FirebaseServices';
import { onAuthStateChanged } from 'firebase/auth';
import Loading from '~/layouts/MainLayout/components/Loading';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const currentUser = async () => {
      await onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('uid', user.uid);
          localStorage.setItem('displayName', user.displayName);
          localStorage.setItem('email', user.email);
          localStorage.setItem('avatar', user.photoURL);
          console.log(user);
        } else {
          console.log('no user');
          setCurrentUser();
          localStorage.clear();
        }
      });
    };
    let timeOutLoading;

    const handle = async () => {
      await currentUser();
      timeOutLoading = setTimeout(() => {
        setShow(true);
      }, 1000);
    };
    handle();
    return () => {
      clearTimeout(timeOutLoading);
      console.log('Clean up');
    };
  }, []);

  return show ? <AuthContext.Provider value={{ currentUser }}>{children}</AuthContext.Provider> : <Loading />;
};
