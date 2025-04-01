import { faUser, faCartShopping, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import axios from 'axios';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import { Wrapper as PopperWrapper } from '~/components/Popper';
import config from '~/config';
import styles from './Header.module.scss';
import { message } from 'antd';
import logo from '~/assets/images/Unet-removebg-preview.svg';
import { useCart } from '~/pages/Cart/CartProvider';

const cx = classNames.bind(styles);

const MENU_ITEMS = [
  { title: 'Profile', to: '/profile' },
  { title: 'Orders', to: '/orders' },
  { title: 'Favourites', to: '/favourites' },
  { title: 'Inbox', to: '/inbox' },
  { title: 'Experiences', to: '/experiences' },
  { title: 'Account Settings', to: '/accountsetting' },
  { title: 'Admin', to: '/customermanagement' },
  { title: 'Log Out', to: '/login' },
];

function Header() {
  const [currentUser, setCurrentUser] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, setCart } = useCart(); // Lưu danh sách sản phẩm trong giỏ hàng
  const [totalPrice, setTotalPrice] = useState(0); // Tổng giá trị giỏ hàng
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart(); // Đóng giỏ hàng
    navigate(config.routes.cart); // Chuyển trang
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setCurrentUser(isLoggedIn);
    if (isLoggedIn) {
      fetchCart(); // Gọi API khi user đăng nhập
    }
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.warn('Người dùng chưa đăng nhập!');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/cart/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data.items || []); // Cập nhật trạng thái giỏ hàng
      setTotalPrice(response.data.totalPrice || 0); // Cập nhật tổng giá trị
    } catch (error) {
      if (error.response && error.response.status === 403) {
        message.warn('Không có quyền truy cập. Chuyển hướng đến trang đăng nhập...');
        window.location.href = '/login';
      } else {
        message.error('Lỗi khi lấy giỏ hàng:', error);
      }
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return; // Không cho giảm dưới 1

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:8080/api/cart/updateCartItemQuantity',
        { id, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCart(response.data.items); // Cập nhật trạng thái giỏ hàng
      setTotalPrice(response.data.totalPrice); // Cập nhật tổng giá trị
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error.response?.data || error.message);
      alert('Không thể cập nhật số lượng. Vui lòng thử lại sau.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  useEffect(() => {
    console.log('Giỏ hàng trong Header đã được cập nhật:', cart);
  }, [cart]);

  return (
    <header className={cx('wrapper')}>
      <div className={cx('inner')}>
        <Link to={config.routes.home} className={cx('logo-link')}>
          <img src={logo} alt="UnetFashion" className={cx('logo')} />
        </Link>

        <ul className={cx('pre-desktop-menu')}>
          <Link to={config.routes.home} className={cx('pre-desktop-menu-item')}>
            <button className={cx('dropdown-toggle')}>Trang chủ</button>
          </Link>
          <Link to={config.routes.product} className={cx('pre-desktop-menu-item')}>
            <button className={cx('dropdown-toggle')}>Sản phẩm</button>
          </Link>
          <Link to={config.routes.productItem} className={cx('pre-desktop-menu-item')}>
            <button className={cx('dropdown-toggle')}>Danh mục</button>
          </Link>
        </ul>

        <div className={cx('search-place')}>
          <div className={cx('header-cart')}>
            <button className={cx('dropdown-toggle')} onClick={toggleCart}>
              <FontAwesomeIcon className={cx('product-card_btn-shopping')} icon={faCartShopping} />
            </button>
            <span className={cx('header-cart_count')}>{cart.length}</span>
          </div>

          {isCartOpen && (
            <div className={cx('cart-sidebar')}>
              <div className={cx('cart-content')}>
                <button className={cx('cart-close-btn')} onClick={toggleCart}>
                  ×
                </button>
                <h2>Giỏ hàng</h2>
                {cart.length === 0 ? (
                  <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
                ) : (
                  <div>
                    {cart.map((item) => (
                      <div key={item.id} className={cx('cart-item')}>
                        <img
                          src={`http://localhost:8080${item.imageUrl}`}
                          alt={item.nameProduct}
                          className={cx('cart-item-image')}
                        />

                        <div className={cx('cart-item-info')}>
                          <p>{item.nameProduct}</p>

                          <p>{item.price.toLocaleString()} VND</p>
                          <div className={cx('cart-item-actions')}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <h3>Tổng tiền: {totalPrice.toLocaleString()} VND</h3>
                    <button className={cx('checkout-btn')} onClick={handleCheckout}>
                      Xem giỏ hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentUser ? (
            <Tippy
              interactive
              placement="bottom-end"
              render={(attrs) => (
                <div className={cx('content')} tabIndex="-1" {...attrs}>
                  <PopperWrapper>
                    <h2 className={cx('title-menu')}>Account</h2>
                    {MENU_ITEMS.map((item, index) => (
                      <Link
                        className={cx('menu-items')}
                        key={index}
                        to={item.to}
                        onClick={item.title === 'Log Out' ? handleLogout : undefined}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </PopperWrapper>
                </div>
              )}
            >
              <button className={cx('user')}>
                <FontAwesomeIcon icon={faUser} />
              </button>
            </Tippy>
          ) : (
            <button className={cx('login-btn')}>
              <Link to={config.routes.login}>Log in</Link>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
