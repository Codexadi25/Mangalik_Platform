import { createContext, useContext, useState } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerData, setHeaderData] = useState({
    title: "",
    subtitle: "",
    searchPlaceholder: "",
    searchValue: "",
    onSearchChange: null,
    actionComponent: null
  });

  return (
    <HeaderContext.Provider value={{ headerData, setHeaderData }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);
