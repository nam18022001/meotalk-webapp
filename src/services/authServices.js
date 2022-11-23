import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import config from '~/configs';
import { auth } from './FirebaseServices';

const provider = new GoogleAuthProvider();

export const login = () => signInWithPopup(auth, provider);

export const logout = async () => {
  await signOut(auth);
  <Navigate to={config.routes.home} />;
  localStorage.clear();
};
