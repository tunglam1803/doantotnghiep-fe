import styles from './Order.module.scss';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Input, Space, Select, message, Modal } from 'antd';
import { useCart } from '../Cart/CartProvider';
import { Link } from 'react-router-dom';
import config from '~/config';

const cx = classNames.bind(styles);
const BASE_URL = 'http://localhost:8080';

const Order = () => {
  const { cart, setCart } = useCart();
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const [shippingId, setShippingId] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchCart();
    fetchShippingAddress();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const sendBillToEmail = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/orders/createBill/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      message.success('Hóa đơn đã được gửi về email của bạn!');
    } catch (error) {
      console.error('Lỗi khi gửi hóa đơn:', error);
      message.error('Không thể gửi hóa đơn. Vui lòng thử lại.');
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      console.log('Cart data:', response.data); // Log dữ liệu giỏ hàng

      if (!response.data || !response.data.id) {
        message.error('Không tìm thấy giỏ hàng. Vui lòng thử lại.');
        setCart([]);
        setTotalAmount(0);
        return;
      }

      setCart(response.data); // Lưu toàn bộ dữ liệu giỏ hàng
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
      if (!response.data || !response.data.id) {
        message.error('Không tìm thấy địa chỉ mặc định. Vui lòng chọn địa chỉ giao hàng.');
        setShippingAddress(null);
        return;
      }
      setShippingAddress(response.data);
      setShippingId(response.data.id); // Lưu ID địa chỉ giao hàng
      form.setFieldsValue({
        fullName: response.data.fullName,
        phone: response.data.phone,
        address: response.data.address,
      });
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ giao hàng:', error);
      setShippingAddress(null);
    }
  };

  const createOrder = async (paymentMethod, shippingMethod) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/orders/createOrder`,
        {
          cartId: cart.id,
          shippingId,
          paymentMethod,
          shippingMethod,
          shippingFee,
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      setOrderId(response.data.id);
      message.success('Đơn hàng đã được tạo thành công!');
      return response.data.id; // Trả về orderId
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      setError('Không thể tạo đơn hàng. Vui lòng thử lại.');
      throw error;
    }
  };

  const handleCheckout = async (values) => {
    try {
      if (!cart.id) {
        message.error('Giỏ hàng không hợp lệ. Vui lòng thử lại.');
        return;
      }

      if (!shippingAddress || !shippingAddress.id) {
        message.error('Không có địa chỉ mặc định. Vui lòng chọn địa chỉ giao hàng.');
        return;
      }

      // Tạo đơn hàng
      const createdOrderId = await createOrder(values.paymentMethod, values.shippingMethod);

      // Nếu phương thức thanh toán là VNPAY, gọi API /create_payment
      if (values.paymentMethod === 'VNPAY') {
        const response = await axios.get(`${BASE_URL}/api/payment/create_payment`, {
          params: { orderId: createdOrderId },
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });

        // Chuyển hướng người dùng đến trang thanh toán của VNPAY
        window.location.href = response.data;
      } else {
        // Hiển thị dialog khi tạo đơn hàng thành công
        setOrderId(createdOrderId);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Lỗi trong quá trình tạo đơn hàng:', error);
      message.error('Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className={cx('cart-page')}>
      <h2>Xác nhận đơn đặt hàng</h2>
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
            onValuesChange={(changedValues) => {
              if (changedValues.shippingMethod) {
                switch (changedValues.shippingMethod) {
                  case 'STANDARD':
                    setShippingFee(15000); // Giao hàng tiết kiệm
                    break;
                  case 'EXPRESS':
                    setShippingFee(30000); // Giao hàng nhanh
                    break;
                  case 'SAME_DAY':
                    setShippingFee(50000); // Giao hàng hỏa tốc
                    break;
                  default:
                    setShippingFee(0);
                }
              }
            }}
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
                {/* <Select.Option value="BANK_TRANSFER">Chuyển khoản ngân hàng</Select.Option> */}
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
                  <Button htmlType="button">Chọn địa chỉ giao hàng khác</Button>
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
            <span>{shippingFee.toLocaleString()}đ</span>
          </div>
          <div className={cx('summary-item')}>
            <span>Thành tiền:</span>
            <span>{(totalAmount + shippingFee).toLocaleString()}đ</span>
          </div>
          {error && <p className={cx('error-message')}>{error}</p>}
        </div>
      </div>

      {/* Dialog thông báo */}
      <Modal
        title="Tạo đơn hàng thành công"
        open ={isModalVisible}
        onOk={() => {
          sendBillToEmail();
          setIsModalVisible(false);
        }}
        onCancel={() => setIsModalVisible(false)}
        okText="Gửi hóa đơn qua email"
        cancelText="Đóng"
      >
        <p>Đơn hàng của bạn đã được tạo thành công!</p>
        <p>Bạn có muốn gửi hóa đơn về email không?</p>
      </Modal>
    </div>
  );
};

export default Order;
