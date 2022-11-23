import { collection, query, where } from 'firebase/firestore';

import { db } from './FirebaseServices';

const searchUser = (value) => {
  const q = query(collection(db, 'users'), where('keyWord', 'array-contains', value));
  return q;
};
export default searchUser;
