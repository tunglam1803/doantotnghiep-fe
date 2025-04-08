import classNames from 'classnames/bind';
import styles from './CustomerManagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faTrash, faPencil } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Form, Button, Select, message } from 'antd';

const PUBLIC_API_URL = 'http://localhost:8080';

const cx = classNames.bind(styles);

function CustomerManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Tạo instance của form
  const [isEditing, setIsEditing] = useState(false); // Trạng thái mở/đóng modal
  const [selectedUser, setSelectedUser] = useState(null); // Lưu thông tin người dùng được chọn

  const inputRef = useRef();

  const handleEditUser = (user) => {
    setSelectedUser(user); // Lưu thông tin người dùng được chọn
    setIsEditing(true); // Hiển thị modal
  };

  const handleUpdateUser = (values) => {
    const updatedUser = {
      ...selectedUser,
      ...values,
      is_deleted: values.is_deleted === 'Hoạt động' ? 0 : 1, // Chuyển trạng thái thành số
    };

    axios
      .put(`${PUBLIC_API_URL}/api/users/updateUser/${selectedUser.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        fetchCustomers(); // Tải lại danh sách người dùng
        setIsEditing(false); // Đóng modal
        message.success('Cập nhật thông tin người dùng thành công!', 5);
      })
      .catch((err) => {
        console.error('Error updating user:', err.response?.data || err.message);
        message.error('Không thể cập nhật thông tin người dùng. Vui lòng thử lại!');
      });
  };

  const handleClear = () => {
    setSearchValue('');
    inputRef.current.focus();
  };

  const formatDate = (instant) => {
    if (!instant) return 'N/A'; // Handle null or undefined dates
    try {
      return format(new Date(instant), 'dd/MM/yyyy HH:mm:ss'); // Format as "day/month/year hours:minutes:seconds"
    } catch (error) {
      console.error('Error formatting date:', error, 'Value:', instant);
      return 'Invalid date';
    }
  };

  const handleChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (!localStorage.getItem('token')) {
    alert.error('Vui lòng đăng nhập để tiếp tục.');
    navigate('/login'); // Replace with your login route
  }

  const fetchCustomers = () => {
    axios
      .get(`${PUBLIC_API_URL}/api/users/getAllUsers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        console.log(res);
        setCustomers(res.data); // Assuming the response is a list of users
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteUser = (userId, userType) => {
    if (userType === 'ADMIN') {
      message.warning('Không thể xóa tài khoản ADMIN!', 3);
      return;
    }

    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        axios
          .delete(`${PUBLIC_API_URL}/api/users/deleteUser/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
          .then(() => {
            fetchCustomers(); // Tải lại danh sách người dùng
            message.success('Xóa người dùng thành công!');
          })
          .catch((err) => {
            console.error('Error deleting user:', err.response?.data || err.message);
            message.error('Không thể xóa người dùng. Vui lòng thử lại!');
          });
      },
      onCancel() {
        message.info('Hủy xóa người dùng.');
      },
    });
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <div className={cx('search-site')}>
          <button className={cx('search-btn')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <input
            ref={inputRef}
            className={cx('input-search')}
            name="text"
            placeholder="Vui lòng nhập thông tin tìm kiếm"
            type="search"
            value={searchValue}
            onChange={handleChange}
          />
          <button className={cx('clear')} onClick={handleClear}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>
      </div>
      <div className={cx('table-site')}>
        <table className={cx('table')}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên người dùng</th>
              <th>Ngày sinh</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {customers
              .filter(
                (cus) =>
                  (cus.userName?.toLowerCase() || '').includes(searchValue) ||
                  (cus.email?.toLowerCase() || '').includes(searchValue),
              )
              .map((cus, index) => (
                <tr key={cus.id}>
                  <td>{index + 1}</td>
                  <td>{cus.fullName}</td>
                  <td>{cus.dateOfBirth}</td>
                  <td>{cus.email}</td>
                  <td>{cus.phone}</td>
                  <td>{cus.addess}</td>
                  <td>{formatDate(cus.createAt)}</td>
                  <td>{formatDate(cus.updatedAt)}</td>
                  <td>{cus.is_deleted == 0 ? 'Hoạt động' : 'Vô hiệu hóa'}</td>
                  <td>
                    <div className={cx('wrapper-icon')}>
                      <FontAwesomeIcon
                        className={cx('icon-action')}
                        icon={faPencil}
                        onClick={() => handleEditUser(cus)}
                      />
                      <FontAwesomeIcon
                        className={cx('icon-action')}
                        icon={faTrash}
                        onClick={() => handleDeleteUser(cus.id, cus.type)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditing(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            fullName: selectedUser?.fullName || '',
            phone: selectedUser?.phone || '',
            dateOfBirth: selectedUser?.dateOfBirth || '',
            is_deleted: selectedUser?.is_deleted === 0 ? 'Hoạt động' : 'Vô hiệu hóa',
          }}
          onFinish={handleUpdateUser}
        >
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
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^(0|\+84)[3-9][0-9]{8}$/, message: 'Số điện thoại không hợp lệ!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="is_deleted"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select disabled={selectedUser?.type === 'ADMIN'}>
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Vô hiệu hóa">Vô hiệu hóa</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default CustomerManagement;
