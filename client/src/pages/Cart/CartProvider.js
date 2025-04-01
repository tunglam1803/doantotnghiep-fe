import { createContext, useContext, useState } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = async (productVariantId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/cart/addProductToCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productVariantId, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.items); // Cập nhật trạng thái giỏ hàng
      } else {
        const errorData = await response.json();
        message.error('Lỗi khi thêm vào giỏ hàng:', response.status, errorData.message || 'Unknown error');
      }
    } catch (err) {
      message.error('Lỗi khi gửi request:', err.message);
    }
  };

  return <CartContext.Provider value={{ cart, setCart, addToCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
