import classNames from 'classnames/bind';
import styles from './Categorymanagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Modal, Form, Input, Select, Button, message } from 'antd';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:8080/api/products';

function Categorymanagement() {
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const { confirm } = Modal;
  const [form] = Form.useForm(); // Tạo instance của form
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      alert('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
    } else {
      fetchCategories();
    }
  }, []);

  const fetchCategories = () => {
    axios
      .get(`${PUBLIC_API_URL}/getAll`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        console.log(res);
        setCategories(res.data); // Assuming the response is a list of categories
      })
      .catch((err) => {
        console.error('Error fetching categories:', err.response?.data || err.message);
        if (err.response?.status === 403) {
          message.error('Bạn không có quyền truy cập vào danh mục này.');
        } else {
          message.error('Có lỗi xảy ra, vui lòng thử lại!');
        }
      });
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

  const handleDeleteCategory = (id) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa danh mục này?',
      content: 'Hành động này không thể hoàn tác.',
      duration: 5,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        axios
          .delete(`${PUBLIC_API_URL}/deleteCategory/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
          .then(() => {
            message.success('Xóa danh mục thành công!', 5);
            fetchCategories(); // Tải lại danh sách danh mục
          })
          .catch((err) => {
            console.error('Error deleting category:', err.response?.data || err.message);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
          });
      },
      onCancel() {
        message.info('Hủy xóa danh mục.', 5);
      },
    });
  };

  const handleClear = () => {
    setSearchValue('');
    inputRef.current.focus();
  };

  const handleChange = (e) => {
    const searchValue = e.target.value;
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    form.resetFields(); // Reset form khi mở modal
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setIsModalOpen(true);
    form.setFieldsValue({
      categoryName: category.categoryName,
      description: category.description,
      gender: category.gender,
      is_deleted: category.is_deleted === 0 ? 'Đang bán' : 'Ngừng kinh doanh',
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedCategory(null);
    form.resetFields(); // Reset form khi đóng modal
  };

  const handleSaveCategory = (values) => {
    const data = {
      ...values,
      is_deleted: values.is_deleted === 'Đang bán' ? 0 : 1, // Chuyển trạng thái thành số
    };

    if (isEditing && selectedCategory?.id) {
      // Gọi API cập nhật danh mục
      axios
        .put(`${PUBLIC_API_URL}/updateCategory/${selectedCategory.id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then(() => {
          message.success('Cập nhật danh mục thành công!');
          fetchCategories();
          handleCloseModal();
        })
        .catch((err) => {
          console.error('Error updating category:', err.response?.data || err.message);
          message.error('Không thể cập nhật danh mục. Vui lòng thử lại!');
        });
    } else {
      // Gọi API thêm mới danh mục
      axios
        .post(`${PUBLIC_API_URL}/addCategory`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then(() => {
          message.success('Thêm mới danh mục thành công!');
          fetchCategories();
          handleCloseModal();
        })
        .catch((err) => {
          console.error('Error adding category:', err.response?.data || err.message);
          message.error('Không thể thêm danh mục. Vui lòng thử lại!');
        });
    }
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <Button type="primary" onClick={handleOpenModal} className={cx('btn-add')}>
          Thêm danh mục
        </Button>
        <div className={cx('search-site')}>
          <button className={cx('search-btn')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <input
            ref={inputRef}
            className={cx('input-search')}
            name="text"
            placeholder="Search..."
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
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Ngày chỉnh sửa</th>
              <th>Giới tính</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((val, index) => (
                <tr key={val.id}>
                  <td>{index + 1}</td>
                  <td>{val.categoryName}</td>
                  <td>{val.description}</td>
                  <td>{formatDate(val.createAt)}</td>
                  <td>{formatDate(val.updatedAt)}</td>
                  <td>{val.gender}</td>
                  <td>{val.is_deleted === 0 ? 'Đang bán' : 'Ngừng kinh doanh'}</td>
                  <td>
                    <div className={cx('wrapper-icon')}>
                      <FontAwesomeIcon
                        className={cx('icon-action')}
                        icon={faPencil}
                        onClick={() => handleEditClick(val)}
                      />
                      <FontAwesomeIcon
                        className={cx('icon-action')}
                        icon={faTrash}
                        onClick={() => handleDeleteCategory(val.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={cx('no-data')}>
                  Không có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={() => form.submit()}>
            {isEditing ? 'Cập nhật' : 'Thêm'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCategory}>
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select>
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="is_deleted"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Đang bán">Đang bán</Select.Option>
              <Select.Option value="Ngừng kinh doanh">Ngừng kinh doanh</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default Categorymanagement;
