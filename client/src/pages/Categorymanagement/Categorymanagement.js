import classNames from 'classnames/bind';
import styles from './Categorymanagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Dialog from '@mui/material/Dialog';
import CreatedOrUpdatedCategory from '~/components/Layout/components/CreatedOrUpdatedCategory';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:8080/api/products';

function Categorymanagement() {
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [btn, setBtn] = useState('Thêm');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
    axios
      .delete(`${PUBLIC_API_URL}/deleteCategory/${id}`)
      .then((res) => {
        const { success } = res.data;
        if (success) {
          message.success('Xóa danh mục thành công!');
        } else {
          message.error('Có lỗi xảy ra vui lòng thử lại!');
        }
        handleClose();
        fetchCategories();
      })
      .catch((err) => console.log(err));
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setBtn('Cập nhật');
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
  };

  const handleCreatedOrUpdated = (data) => {
    console.log(data);
    setIsSaving(true);
  
    if (isEditing && selectedCategory?.id) {
      // Gọi API cập nhật danh mục
      axios
        .put(`${PUBLIC_API_URL}/updateCategory/${selectedCategory.id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => {
          const { success } = res.data;
          if (success) {
            message.success('Cập nhật danh mục thành công!');
          } else {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
          }
          setBtn('Sửa');
          handleClose();
          fetchCategories();
        })
        .catch((err) => {
          console.error('Error updating category:', err.response?.data || err.message);
          message.error('Không thể cập nhật danh mục. Vui lòng thử lại!');
        })
        .finally(() => setIsSaving(false));
    } else {
      // Gọi API thêm mới danh mục
      axios
        .post(`${PUBLIC_API_URL}/addCategory`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => {
          const { success } = res.data;
          if (success) {
            message.success('Thêm mới danh mục thành công!');
          } else {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
          }
          handleClose();
          fetchCategories();
        })
        .catch((err) => {
          console.error('Error adding category:', err.response?.data || err.message);
          message.error('Không thể thêm danh mục. Vui lòng thử lại!');
        })
        .finally(() => setIsSaving(false));
    }
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={handleClickOpen} className={cx('btn-add')}>
          Thêm danh mục
        </button>
        <Dialog open={open || isEditing} onClose={handleClose} fullWidth maxWidth="sm">
          <CreatedOrUpdatedCategory
            handleCreatedOrUpdated={handleCreatedOrUpdated}
            handleClose={handleClose}
            selectedCategory={selectedCategory}
            isEditing={isEditing}
            btn={btn}
          />
        </Dialog>
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
        <div className={cx('table')}>
          <div className={cx('table-grid')}>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>STT</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Tên danh mục</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mô tả</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày tạo</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày chỉnh sửa</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Giới tính</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Trạng thái</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {categories.length > 0 ? (
            categories
            .filter(
              (category) =>
                category.categoryName.toLowerCase().includes(searchValue.toLowerCase()) ||
                category.gender.toLowerCase().includes(searchValue.toLowerCase()),
            )
            .map((val, index) => {
              return (
                <div key={val.id} className={cx('table-grid', 'item-grid')}>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{index + 1}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{val.categoryName}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{val.description}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{formatDate(val.createAt)}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{formatDate(val.updatedAt)}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{val.gender}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{val.is_deleted == 0 ? 'Đang bán' : 'Ngừng kinh doanh'}</p>
                  </div>
                  <div className={cx('item-site')}>
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
                  </div>
                </div>
              );
            })
          ) : (
            <p className={cx('no-data')}>Không có danh mục nào.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Categorymanagement;
