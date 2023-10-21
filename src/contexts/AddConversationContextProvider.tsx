import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';

function AddConversationContextProvider({ children }: AddConversationContextProviderProps) {
  const [addTrue, setAddTrue] = useState<boolean>(false);
  const [users, setUsers] = useState<any>([]);

  return (
    <AddConversationContext.Provider value={{ addTrue, setAddTrue, users, setUsers }}>
      {children}
    </AddConversationContext.Provider>
  );
}

const AddConversationContext = createContext<AddConversationContent>({
  addTrue: false,
  setAddTrue: () => {},
  users: [],
  setUsers: () => {},
});

interface AddConversationContextProviderProps {
  children: ReactNode;
}
type AddConversationContent = {
  addTrue: boolean;
  setAddTrue: Dispatch<SetStateAction<boolean>>;
  users: any[];
  setUsers: Dispatch<SetStateAction<any[]>>;
};
export const useAddConversationContext = () => useContext(AddConversationContext);
export default AddConversationContextProvider;
