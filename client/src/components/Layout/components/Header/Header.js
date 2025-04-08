import { faUser, faCartShopping, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import axios from 'axios';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import { Wrapper as PopperWrapper } from '~/components/Popper';
import config from '~/config';
import styles from './Header.module.scss';
import { message, Menu } from 'antd';
import logo from '~/assets/images/Unet-removebg-preview.svg';
import { useCart } from '~/pages/Cart/CartProvider';
import { useFilter } from '~/components/Layout/components/Header/FilterContext';

const cx = classNames.bind(styles);

const MENU_ITEMS = [
  { title: 'Thông tin cá nhân', to: '/profile' },
  { title: 'Đăng xuất', to: '/login' },
];

function Header() {
  const [currentUser, setCurrentUser] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, setCart } = useCart(); // Lưu danh sách sản phẩm trong giỏ hàng
  const [totalPrice, setTotalPrice] = useState(0); // Tổng giá trị giỏ hàng
  const navigate = useNavigate();
  const [current, setCurrent] = useState('mail');

  const { setCategoryId } = useFilter(); // Lấy hàm cập nhật categoryId từ context

  const handleCategorySelect = (categoryId) => {
    setCategoryId(categoryId); // Cập nhật categoryId vào context
  };

  const [groupedCategories, setGroupedCategories] = useState({}); // Lưu danh mục theo gender

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/products/getAll', {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        });
        const data = response.data;

        // Nhóm danh mục theo gender
        const grouped = data.reduce((acc, category) => {
          const gender = category.gender;
          if (!acc[gender]) {
            acc[gender] = [];
          }
          acc[gender].push(category);
          return acc;
        }, {});

        setGroupedCategories(grouped);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const items = [
    {
      label: 'Danh mục',
      key: 'SubMenu',
      children: Object.keys(groupedCategories).map((gender) => ({
        type: 'group',
        label: gender, // Sử dụng `gender` trực tiếp vì nó là chuỗi
        key: `gender-${gender}`,
        children: groupedCategories[gender].map((category) => ({
          label: category.categoryName, // Hiển thị tên danh mục con
          key: category.id, // Khóa duy nhất cho từng danh mục
        })),
      })),
    },
  ];

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

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchCart = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.warn('Bạn chưa đăng nhập!');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/cart/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data.items || []); // Update cart state
      setTotalPrice(response.data.totalPrice || 0); // Update total price

      if (response.data.items.length === 0) {
        console.info('Giỏ hàng của bạn đang trống.');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          message.warn('Không có quyền truy cập. Chuyển hướng đến trang đăng nhập...');
          window.location.href = '/login';
        } else if (error.response.status === 500) {
          message.error('Lỗi máy chủ: Không thể tải giỏ hàng. Vui lòng thử lại sau.');
        } else {
          message.error(`Lỗi: ${error.response.data.message || 'Đã xảy ra lỗi không xác định.'}`);
        }
      } else {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
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

  return (
    <header className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('logo-link')}>
          <Link to={config.routes.home} style={{ height: '100px' }}>
            <img src={logo} alt="UnetFashion" className={cx('logo')} />
          </Link>
        </div>

        <ul className={cx('pre-desktop-menu')}>
          <Link to={config.routes.home} className={cx('pre-desktop-menu-item')}>
            <button className={cx('dropdown-toggle')}>Trang chủ</button>
          </Link>
          <Link to={config.routes.product} className={cx('pre-desktop-menu-item')}>
            <button className={cx('dropdown-toggle')}>Sản phẩm</button>
          </Link>
          <Menu
            className={cx('dropdown-toggle1')}
            onClick={(e) => {
              const categoryId = e.key; // Lấy categoryId từ key của menu item
              handleCategorySelect(categoryId); // Cập nhật categoryId vào context
            }}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
          />
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
                    <h2 className={cx('title-menu')}>Tài khoản</h2>
                    {MENU_ITEMS.map((item, index) => (
                      <Link
                        className={cx('menu-items')}
                        key={index}
                        to={item.to}
                        onClick={item.title === 'Đăng xuất' ? handleLogout : undefined}
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
              <Link to={config.routes.login}>Đăng nhập</Link>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
