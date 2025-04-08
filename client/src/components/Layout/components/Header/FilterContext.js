import { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [categoryId, setCategoryId] = useState(null); // Lưu trữ categoryId được chọn

  return (
    <FilterContext.Provider value={{ categoryId, setCategoryId }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);