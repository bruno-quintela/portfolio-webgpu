import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';

export type ContextType = {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  pieceIndex: number;
  setPieceIndex: Dispatch<SetStateAction<number>>;
  collectionIndex: number;
  setCollectionIndex: Dispatch<SetStateAction<number>>;
};
export const GlobalContext = createContext({} as ContextType);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pieceIndex, setPieceIndex] = useState(0);
  const [collectionIndex, setCollectionIndex] = useState(0);
  return (
    <GlobalContext.Provider value={{ isLoading, setIsLoading, pieceIndex, setPieceIndex, collectionIndex, setCollectionIndex }}>
      {children}
    </GlobalContext.Provider>
  );
};
