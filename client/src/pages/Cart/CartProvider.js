import { createContext, useContext, useState } from 'react';
import { message } from 'antd';
import axios from 'axios';

const CartContext = createContext();
const PUBLIC_API_URL = 'http://localhost:8080';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.warn('Người dùng chưa đăng nhập!');
          return;
        }
    
        const response = await axios.get(`${PUBLIC_API_URL}/api/cart/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log('Cart Response:', response.data);
    
        setCart(response.data.items || []); // Update cart state
        setTotalPrice(response.data.totalPrice || 0); // Update total price
      } catch (error) {
        console.error('Error fetching cart:', error);
        message.error('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      }
    };

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
    
        const data = await response.json(); // Lấy dữ liệu từ phản hồi
    
        if (response.ok && data.success) {
          fetchCart(); // Cập nhật giỏ hàng sau khi thêm sản phẩm
          return data; // Trả về dữ liệu nếu thành công
        } else {
          console.error('Error adding to cart:', data.message);
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
