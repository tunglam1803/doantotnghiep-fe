import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = async (productVariantId, quantity) => {
    if (!productVariantId) {
      console.error('Lỗi: productVariantId bị null!');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Lỗi: Token không tồn tại!');
      return;
    }
  
    const requestData = { productVariantId, quantity };
    console.log('Gửi request:', requestData);
  
    try {
      const response = await fetch('http://localhost:8080/api/cart/addProductToCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Thêm vào giỏ hàng thành công:', data);
      } else {
        const errorData = await response.json();
        console.error('Lỗi khi thêm vào giỏ hàng:', response.status, errorData.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Lỗi khi gửi request:', err.message);
    }
  };

  return <CartContext.Provider value={{ cart, addToCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
