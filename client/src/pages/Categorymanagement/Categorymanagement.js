import classNames from 'classnames/bind';
import styles from './Categorymanagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Dialog from '@mui/material/Dialog';
import CreatedOrUpdatedCategory from '~/components/Layout/components/CreatedOrUpdatedCategory';
import axios from 'axios';
import { message } from 'antd';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:5252/open-api/v1/category';
const PUBLIC_API_URL_BRAND = 'http://localhost:5252/open-api/v1/brand';


function Categorymanagement() {
  const [searchValue, setSearchValue] = useState('');
  const [brand, setBrand] = useState([]);
  const [categories, setCategories] = useState([]);
  const [btn, setBtn] = useState('Thêm');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [open, setOpen] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    fetchCategories();
    fetchBrand();
  }, []);

  const fetchCategories = () => {
    axios
      .get(`${PUBLIC_API_URL}/get-all`)
      .then((res) => {
        console.log(res);
        setCategories(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const fetchBrand = () => {
    axios
      .get(`${PUBLIC_API_URL_BRAND}/get-all`)
      .then((res) => {
        console.log(res);
        setBrand(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteCategory = (id) => {
    axios
      .delete(`${PUBLIC_API_URL}/${id}`)
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
    if (isEditing) {
      axios.put(`${PUBLIC_API_URL}`, data).then((res) => {
        const { success } = res.data;
        if (success) {
          message.success('Cập nhật danh mục thành công!');
        } else {
          message.error('Có lỗi xảy ra vui lòng thử lại!');
        }
        setBtn('Thêm');
        handleClose();
        fetchCategories();
      });
    } else {
      axios.post(`${PUBLIC_API_URL}`, data).then((res) => {
        const { success } = res.data;
        if (success) {
          message.success('Thêm mới mục thành công!');
        } else {
          message.error('Có lỗi xảy ra vui lòng thử lại!');
        }
        handleClose();
        fetchCategories();
      }).catch((err) => {
        message.error(err.response.data.message);
      }
      );
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
              brand={brand}
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
              <h5 className={cx('row-title')}>ID</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Tên sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mô tả</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ảnh</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Thương hiệu</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày tạo</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày chỉnh sửa</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {categories.map((val, key) => {
            return (
              <div key={key} className={cx('table-grid', 'item-grid')}>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.id}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.name}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.description}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.image}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.brand_id}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.created_date}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.updated_date}</p>
                </div>
                <div className={cx('item-site')}>
                  <div className={cx('wrapper-icon')}>
                    <FontAwesomeIcon className={cx('icon-action')} icon={faPencil} onClick={() => handleEditClick(val)} />
                    <FontAwesomeIcon className={cx('icon-action')} icon={faTrash} onClick={() => handleDeleteCategory(val.id)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Categorymanagement;
