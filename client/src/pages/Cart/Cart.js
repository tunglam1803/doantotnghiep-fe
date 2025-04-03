import styles from './Cart.module.scss';
import classNames from 'classnames/bind';
import { useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '~/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartProvider';
import { message } from 'antd';

const cx = classNames.bind(styles);
const BASE_URL = 'http://localhost:8080';

const Cart = () => {
  const {cart, setCart} = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/cart/', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setCart(response.data.items);
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await axios.put(
        'http://localhost:8080/api/cart/updateCartItemQuantity',
        {
          // userId = 1,
          id: id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      fetchCart();
    } catch (error) {
      message.error('Lỗi khi cập nhật số lượng:', error);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/cart/removeCartItem/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      fetchCart();
    } catch (error) {
      message.error('Lỗi khi xóa sản phẩm:', error);
    }
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className={cx('cart-page')}>
      <h2>
        Giỏ hàng của bạn có <span className={cx('product-count')}>{cart.length} Sản Phẩm</span>
      </h2>
      <div className={cx('cart-content')}>
        <div className={cx('cart-items-container')}>
          {cart.length === 0 ? (
            <p>Giỏ hàng trống</p>
          ) : (
            <ul className={cx('cart-items')}>
              {cart.map((item) => (
                <li key={item.id} className={cx('cart-item')}>
                  <img src={`${BASE_URL}${item.imageUrl}`} alt={item.nameProduct} className={cx('product-image')} />
                  <div className={cx('product-details')}>
                    <span className={cx('product-name')}>{item.nameProduct}</span>
                    <span className={cx('product-info')}>Màu sắc: {item.color}</span>
                    <span className={cx('product-info')}>Size: {item.size}</span>
                    <span className={cx('discount')}>{item.discount ? `-${item.discount.toLocaleString()}đ` : ''}</span>
                  </div>
                  <div className={cx('quantity-control')}>
                    <button className={cx('quantity-btn')} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </button>
                    <span className={cx('quantity-number')}>{item.quantity}</span>
                    <button className={cx('quantity-btn')} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <span className={cx('total-price')}>{(item.price * item.quantity).toLocaleString()}đ</span>
                  <button onClick={() => removeItem(item.id)} className={cx('remove-button')}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
              <li className={cx('continue-shop-link')}>
                <Link to={config.routes.product}>
                  <span className={cx('continue-shop-title')}>Tiếp tục mua hàng</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
        <div className={cx('cart-summary')}>
          <h3>Tổng tiền giỏ hàng</h3>
          <div className={cx('summary-item')}>
            <span>Tổng sản phẩm:</span>
            <span>{cart.length}</span>
          </div>
          <div className={cx('summary-item')}>
            <span>Tổng tiền hàng:</span>
            <span>{totalAmount.toLocaleString()}đ</span>
          </div>
          <div className={cx('summary-item')}>
            <span>Thành tiền:</span>
            <span>{totalAmount.toLocaleString()}đ</span>
          </div>
          <Link to={config.routes.order}>
            <button className={cx('checkout-button')}>ĐẶT HÀNG</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
