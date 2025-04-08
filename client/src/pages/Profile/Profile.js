import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { message, Button, Input, Form, DatePicker, Select, Modal } from 'antd';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate(); // Hook để điều hướng
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeSection, setActiveSection] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false); // Trạng thái mở/đóng modal
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  const addNewAddress = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/ship/save', values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Thêm địa chỉ mới thành công!');
      setIsAddingAddress(false); // Đóng modal
      fetchAddresses(); // Tải lại danh sách địa chỉ
    } catch (error) {
      console.error('Error adding new address:', error);
      message.error('Không thể thêm địa chỉ mới!');
    }
  };

  // Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/ship/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Không thể tải danh sách địa chỉ!');
    }
  };

  // Lấy địa chỉ mặc định
  const fetchDefaultAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/ship/default', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDefaultAddressId(response.data?.id || null);
    } catch (error) {
      console.error('Error fetching default address:', error);
      message.error('Không thể tải địa chỉ mặc định!');
    }
  };

  // Xóa địa chỉ
  const deleteAddress = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/ship/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Xóa địa chỉ thành công!');
      fetchAddresses(); // Tải lại danh sách địa chỉ
    } catch (error) {
      console.error('Error deleting address:', error);
      message.error('Không thể xóa địa chỉ!');
    }
  };

  // Đặt địa chỉ mặc định
  const setDefaultAddress = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/ship/default/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Đặt địa chỉ mặc định thành công!');
      setDefaultAddressId(id);
    } catch (error) {
      console.error('Error setting default address:', error);
      message.error('Không thể đặt địa chỉ mặc định!');
    }
  };

  // Tải dữ liệu khi chuyển sang tab "Sổ địa chỉ"
  useEffect(() => {
    if (activeSection === 'addressBook') {
      fetchAddresses();
      fetchDefaultAddress();
    }
  }, [activeSection]);

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = user?.id; // Lấy userId từ thông tin người dùng
      if (!userId) {
        message.error('Không tìm thấy thông tin người dùng!');
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/orders/getOrderHistory/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderHistory(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      message.error('Không thể tải lịch sử đơn hàng!');
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrderHistory();
    }
  }, [user]);

  const handleChangePassword = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/api/users/changePassword',
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      message.success(response.data || 'Đổi mật khẩu thành công!');

      // Xóa token và điều hướng đến trang đăng nhập
      localStorage.removeItem('token');
      message.info('Vui lòng đăng nhập lại!');
      navigate('/login'); // Điều hướng đến trang đăng nhập
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Không thể đổi mật khẩu!');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.warning('Bạn chưa đăng nhập!');
          return;
        }

        const response = await axios.get('http://localhost:8080/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        message.error('Không thể tải thông tin người dùng!');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:8080/api/users/updateProfile',
        { ...values, id: user.id }, // Gửi ID người dùng để xác định
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      message.success(response.data || 'Cập nhật thông tin thành công!');
      setUser((prevUser) => ({
        ...prevUser,
        ...values,
      })); // Đảm bảo cập nhật đúng dữ liệu
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin!');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={cx('profile-container')}>
      <div className={cx('profile-content')}>
        <div className={cx('profile-sidebar')}>
          <div className={cx('profile-avatar')}>
            <img src="https://pubcdn.ivymoda.com/ivy2//images/v2/assets/user-avatar-placeholder.png" alt="Avatar" />
            <p>Trịnh Tùng Lâm</p>
          </div>
          <ul className={cx('profile-menu')}>
            <li className={cx({ active: activeSection === 'profile' })} onClick={() => setActiveSection('profile')}>
              Thông tin tài khoản
            </li>
            <li
              className={cx({ active: activeSection === 'orderManagement' })}
              onClick={() => setActiveSection('orderManagement')}
            >
              Thông tin đơn hàng
            </li>
            <li
              className={cx({ active: activeSection === 'addressBook' })}
              onClick={() => setActiveSection('addressBook')}
            >
              Thông tin địa chỉ
            </li>
          </ul>
        </div>
        <div className={cx('profile-main')}>
          {activeSection === 'profile' && (
            <div className={cx('profile-header')}>
              <h1 className={cx('profile-title')}>TÀI KHOẢN CỦA TÔI</h1>
              <p className={cx('profile-note')}>
                "Vì chính sách an toàn, bạn không thể thay đổi SĐT, Ngày sinh, Họ tên. Vui lòng liên hệ CSKH: 0123456789
                nếu cần."
              </p>
              <Form
                initialValues={{
                  ...user,
                  dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
                }}
                onFinish={handleUpdateProfile}
                layout="vertical"
                className={cx('profile-form')}
              >
                <Form.Item label="Họ và tên" name="fullName">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
                <Form.Item label="Giới tính" name="gender">
                  <Select>
                    <Select.Option value="NAM">Nam</Select.Option>
                    <Select.Option value="NỮ">Nữ</Select.Option>
                    <Select.Option value="KHÁC">Khác</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Ngày sinh" name="dateOfBirth">
                  <DatePicker format="DD/MM/YYYY" disabled />
                </Form.Item>
                <div className={cx('form-actions')}>
                  <Button type="primary" htmlType="submit" className={cx('update-button')}>
                    CẬP NHẬT
                  </Button>
                  <Button type="default" onClick={() => setIsChangingPassword(true)} className={cx('password-button')}>
                    ĐỔI MẬT KHẨU
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {activeSection === 'orderManagement' && (
            <div className={cx('profile-section')}>
              <h2>THÔNG TIN ĐƠN HÀNG</h2>
              {orderHistory.length > 0 ? (
                <table className={cx('orders-table')}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Ngày đặt hàng</th>
                      <th style={{ width: '110px' }}>Tổng tiền</th>
                      <th>Phí vận chuyển</th>
                      <th>Phương thức vận chuyển</th>
                      <th>Trạng thái thanh toán</th>
                      <th>Trạng thái đơn hàng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((order, index) => (
                      <tr key={order.id}>
                        <td>{index + 1}</td>
                        <td>
                          {moment(order.createdAt).format('DD/MM/YYYY')}
                        </td>
                        <td>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(order.totalPrice)}
                        </td>

                        <td>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(order.shippingFee)}
                        </td>
                        <td>
                          {order.shippingMethod === 'STANDARD'
                            ? 'Giao hàng tiết kiệm'
                            : order.shippingMethod === 'EXPRESS'
                            ? 'Giao hàng nhanh'
                            : 'Giao hàng hỏa tốc'}
                        </td>
                        <td>{order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                        <td>
                          {order.status === 'PENDING'
                            ? 'Đang xử lý'
                            : order.status === 'DELIVERED'
                            ? 'Đang vận chuyển'
                            : order.status === 'SHIPPED'
                            ? 'Đã giao'
                            : 'Đã hủy'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có đơn hàng nào.</p>
              )}
            </div>
          )}

          {activeSection === 'addressBook' && (
            <div className={cx('profile-section')}>
              <h2>THÔNG TIN ĐỊA CHỈ</h2>
              <Button type="primary" onClick={() => setIsAddingAddress(true)} style={{ marginBottom: '10px' }}>
                Thêm Địa Chỉ
              </Button>
              {addresses.length > 0 ? (
                <ul className={cx('address-list')}>
                  {addresses.map((address) => (
                    <li key={address.id} className={cx('address-item')}>
                      <p>
                        <strong>Họ tên:</strong> {address.fullName}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong> {address.phone}
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong> {address.address}
                      </p>
                      <div className={cx('address-actions')}>
                        <Button
                          type="link"
                          onClick={() => setDefaultAddress(address.id)}
                          disabled={defaultAddressId === address.id}
                        >
                          {defaultAddressId === address.id ? 'Mặc định' : 'Đặt làm mặc định'}
                        </Button>
                        <Button type="link" danger onClick={() => deleteAddress(address.id)}>
                          Xóa
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có địa chỉ nào.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal title="Thêm Địa Chỉ Mới" open={isAddingAddress} onCancel={() => setIsAddingAddress(false)} footer={null}>
        <Form onFinish={addNewAddress} layout="vertical">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
            <Input />
          </Form.Item>
          <div className={cx('form-actions')}>
            <Button type="primary" htmlType="submit">
              Thêm Địa Chỉ
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Đổi Mật Khẩu */}
      <Modal title="ĐỔI MẬT KHẨU" open={isChangingPassword} onCancel={() => setIsChangingPassword(false)} footer={null}>
        <Form onFinish={handleChangePassword} layout="vertical" className={cx('password-form')}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <div className={cx('form-actions')}>
            <Button type="primary" htmlType="submit" className={cx('update-button')}>
              CẬP NHẬT
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
