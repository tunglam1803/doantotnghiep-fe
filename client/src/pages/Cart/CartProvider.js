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
    const requestData = { productVariantId, quantity }; // Đổi productId -> productVariantId

    console.log('Gửi request:', requestData); // Debug request

    const response = await fetch('http://localhost:8080/api/cart/add', {
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
      console.error('Lỗi khi thêm vào giỏ hàng:', response.status);
    }
  };

  return <CartContext.Provider value={{ cart, addToCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
