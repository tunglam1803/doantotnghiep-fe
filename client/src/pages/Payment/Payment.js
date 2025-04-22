import styles from './Payment.module.scss';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Input, Space, Select } from 'antd';
import { useCart } from '../Cart/CartProvider';
import { Link } from 'react-router-dom';
import config from '~/config';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const cx = classNames.bind(styles);
const BASE_URL = 'http://localhost:8080';

const Payment = () => {
  const { cart, setCart } = useCart();
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState(null); // Lưu thông tin địa chỉ giao hàng

  useEffect(() => {
    fetchCart();
    fetchShippingAddress();

    // Xử lý kết quả thanh toán từ URL
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status'); // Trạng thái thanh toán
    const messageText = queryParams.get('message'); // Thông báo từ backend

    if (status) {
      if (status === 'success') {
        message.success(messageText || 'Thanh toán thành công!');
        navigate('/profile'); // Điều hướng đến trang hồ sơ hoặc trang khác
      } else if (status === 'failure') {
        message.error(messageText || 'Thanh toán thất bại. Vui lòng thử lại!');
      }
    }
  }, [location]);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setCart(response.data.items);
      setTotalAmount(response.data.totalPrice);
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
    }
  };

  const fetchShippingAddress = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ship/default`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setShippingAddress(response.data); // Lưu thông tin địa chỉ giao hàng
      form.setFieldsValue({
        fullName: response.data.fullName,
        phone: response.data.phone,
        address: response.data.address,
      }); // Đổ dữ liệu vào form
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ giao hàng:', error);
      setShippingAddress(null); // Nếu không có địa chỉ, đặt giá trị null
    }
  };

  const saveShippingInfo = async (values) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/ship/save`, values, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return response.data; // Trả về ID thông tin giao hàng (Long)
    } catch (error) {
      console.error('Lỗi khi lưu thông tin giao hàng:', error);
      setError('Không thể lưu thông tin giao hàng. Vui lòng thử lại.');
      throw error;
    }
  };

  const createOrder = async (shippingId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/orders/createOrder`,
        {
          shippingId,
          paymentMethod: 'VNPAY',
          shippingMethod: 'Standard',
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
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
    try {
      // Lưu thông tin giao hàng
      const shippingId = await saveShippingInfo(values);

      // Tạo đơn hàng
      const createdOrderId = await createOrder(shippingId);

      // Tạo thanh toán
      await createPayment(createdOrderId);
    } catch (error) {
      console.error('Lỗi trong quá trình thanh toán:', error);
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
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input readOnly />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input readOnly />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true }]}>
              <Input readOnly />
            </Form.Item>
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
            >
              <Select placeholder="Chọn phương thức thanh toán">
                <Select.Option value="VNPAY">VNPAY</Select.Option>
                <Select.Option value="COD">Thanh toán khi nhận hàng (COD)</Select.Option>
                <Select.Option value="BANK_TRANSFER">Chuyển khoản ngân hàng</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="shippingMethod"
              label="Phương thức vận chuyển"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức vận chuyển!' }]}
            >
              <Select placeholder="Chọn phương thức vận chuyển">
                <Select.Option value="STANDARD">Giao hàng tiết kiệm</Select.Option>
                <Select.Option value="EXPRESS">Giao hàng nhanh</Select.Option>
                <Select.Option value="SAME_DAY">Giao hàng hỏa tốc</Select.Option>
              </Select>
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
                <Link to={config.routes.shipping}>
                  <Button htmlType="button">
                    Chọn địa chỉ giao hàng khác
                  </Button>
                </Link>
              </Space>
            </Form.Item>
          </Form>
        </div>
        <div className={cx('cart-summary')}>
          <h3>Tóm tắt đơn hàng</h3>
          <div className={cx('summary-item')}>
            <span>Tổng sản phẩm:</span>
            <span>{cart.length}</span>
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
          {error && <p className={cx('error-message')}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Payment;
