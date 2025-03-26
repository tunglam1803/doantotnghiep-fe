import styles from './Payment.module.scss';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Input, Space } from 'antd';

const cx = classNames.bind(styles);
const BASE_URL = 'http://localhost:8080';

const Payment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCart();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const [cartItemId, setCartItemId] = useState(null); // Thêm trạng thái để lưu cartItemId

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      console.log('API /api/cart/ response:', response.data);
      setCartItems(response.data.items);
      setTotalAmount(response.data.totalPrice);
      setCartItemId(response.data.cartId); // Lưu cartItemId từ API
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      setError(error.response?.data?.message || 'Không thể tải giỏ hàng. Vui lòng thử lại.');
    }
  };

  const saveShippingInfo = async (values) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/ship/save`, values, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return response.data; // Trả về ID thông tin giao hàng
    } catch (error) {
      console.error('Lỗi khi lưu thông tin giao hàng:', error);
      setError(error.response?.data?.message || 'Không thể lưu thông tin giao hàng. Vui lòng thử lại.');
      throw error;
    }
  };

  const createOrder = async (shippingId) => {
    if (!cartItemId) {
      setError('Không tìm thấy giỏ hàng. Vui lòng thử lại.');
      throw new Error('cartItemId is null');
    }
  
    try {
      const response = await axios.post(
        `${BASE_URL}/api/orders/createOrder`,
        {
          cartId: cartItemId, // Sử dụng cartItemId từ trạng thái
          shippingId: parseInt(shippingId), // Đảm bảo shippingId là số
          paymentMethod: 'VNPAY',
          shippingMethod: 'Standard',
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      setOrderId(response.data.id); // Lưu ID đơn hàng
      return response.data.id;
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      setError('Không thể tạo đơn hàng. Vui lòng thử lại.');
      throw error;
    }
  };

  const createPayment = async (orderId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/payment/create_payment`, {
        params: { orderId },
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      window.location.href = response.data; // Chuyển hướng đến URL thanh toán
    } catch (error) {
      console.error('Lỗi khi tạo thanh toán:', error);
      setError('Không thể tạo thanh toán. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async (values) => {
    if (!cartItemId) {
      setError('Không tìm thấy giỏ hàng. Đang tải lại giỏ hàng...');
      console.error('cartItemId is null, attempting to re-fetch cart.');
      try {
        const response = await axios.get(`${BASE_URL}/api/cart/`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        console.log('API /api/cart/ response:', response.data);
        const updatedCartItemId = response.data.cartId; // Access cartItemId directly from response
        setCartItems(response.data.items);
        setTotalAmount(response.data.totalPrice);
        setCartItemId(updatedCartItemId);
        console.log('cartItemId after re-fetch:', updatedCartItemId); // Log updated cartItemId
        if (!updatedCartItemId) {
          setError('Không thể tìm thấy giỏ hàng sau khi tải lại. Vui lòng thử lại.');
          return;
        }
      } catch (error) {
        console.error('Lỗi khi tải lại giỏ hàng:', error);
        setError('Không thể tải lại giỏ hàng. Vui lòng thử lại.');
        return;
      }
    }
  
    try {
      // Lưu thông tin giao hàng
      const shippingId = await saveShippingInfo(values);
  
      // Tạo đơn hàng
      const createdOrderId = await createOrder(shippingId);
  
      // Tạo thanh toán
      await createPayment(createdOrderId);
    } catch (error) {
      if (error.response) {
        // Lỗi từ API
        console.error('Lỗi từ API:', error.response.data);
        setError(error.response.data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      } else {
        // Lỗi khác
        console.error('Lỗi không xác định:', error);
        setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className={cx('cart-page')}>
      <h2>Thanh toán</h2>
      <div className={cx('cart-content')}>
        <div className={cx('cart-items-container')}>
          <Form
            {...{
              labelCol: { span: 8 },
              wrapperCol: { span: 16 },
            }}
            form={form}
            name="control-hooks"
            onFinish={handleCheckout}
            style={{ maxWidth: 600 }}
          >
            <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  Xác nhận
                </Button>
                <Button htmlType="button" onClick={() => form.resetFields()}>
                  Nhập lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
        <div className={cx('cart-summary')}>
          <h3>Tóm tắt đơn hàng</h3>
          <div className={cx('summary-item')}>
            <span>Tổng sản phẩm:</span>
            <span>{cartItems.length}</span>
          </div>
          <div className={cx('summary-item')}>
            <span>Tổng tiền hàng:</span>
            <span>{totalAmount.toLocaleString()}đ</span>
          </div>
          <div className={cx('summary-item')}>
            <span>Phí vận chuyển:</span>
            <span>0đ</span>
          </div>
          <div className={cx('summary-item')}>
            <span>Thành tiền:</span>
            <span>{totalAmount.toLocaleString()}đ</span>
          </div>
          {error && <p className={cx('error-message')}>{typeof error === 'string' ? error : error.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Payment;
