import { createContext, useContext, useState } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { duration } from '@mui/material';

const CartContext = createContext();
const PUBLIC_API_URL = 'http://localhost:8080';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Bạn chưa đăng nhập!', 2);
          return;
        }
    
        const response = await axios.get(`${PUBLIC_API_URL}/api/cart/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setCart(response.data.items || []); // Update cart state
        setTotalPrice(response.data.totalPrice || 0); // Update total price
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    const addToCart = async (productVariantId, quantity) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'Bạn chưa đăng nhập!', duration: 2 }; // Trả về lỗi rõ ràng
        }
    
        console.log('token:', token);
    
        const response = await fetch('http://localhost:8080/api/cart/addProductToCart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productVariantId, quantity }),
        });
    
        const data = await response.json(); // Lấy dữ liệu từ phản hồi
    
        if (response.ok && data.success) {
          fetchCart(); // Cập nhật giỏ hàng sau khi thêm sản phẩm
          return data; // Trả về dữ liệu nếu thành công
        } else {
          console.error('Lỗi khi thêm vào giỏ hàng:', data.message);
          return { success: false, message: data.message || 'Unknown error' }; // Trả về lỗi
        }
      } catch (err) {
        console.error('Error in addToCart:', err);
        return { success: false, message: 'Lỗi khi gửi request!' }; // Trả về lỗi
      }
    };

  return <CartContext.Provider value={{ cart, setCart, addToCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
