import classNames from 'classnames/bind';
import styles from './BrandManagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Dialog from '@mui/material/Dialog';
import axios from 'axios';
import { message } from 'antd';
import CreatedOrUpdatedBrand from '~/components/Layout/components/CreatedOrUpdatedBrand';

const cx = classNames.bind(styles);

const PUBLIC_API_URL = 'http://localhost:5252/open-api/v1/brand';

function BrandManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [brands, setBrands] = useState([]);
  const [btn, setBtn] = useState('Thêm');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [open, setOpen] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    axios
      .get(`${PUBLIC_API_URL}/get-all`)
      .then((res) => {
        console.log(res);
        setBrands(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteBrand = (id) => {
    axios
      .delete(`${PUBLIC_API_URL}/${id}`)
      .then((res) => {
        const { success } = res.data;
          if (success) {
            message.success('Xóa thương hiệu thành công!');
          } else {
            message.error('Có lỗi xảy ra vui lòng thử lại!');
          }
          handleClose();
          fetchBrands();
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

  const handleEditClick = (brand) => {
    setSelectedBrand(brand);
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
    try {
      if (isEditing) {
        axios.put(`${PUBLIC_API_URL}`, data).then((res) => {
          const { success } = res.data;
          if (success) {
            message.success('Cập nhật thương hiệu thành công!');
          } else {
            message.error('Có lỗi xảy ra vui lòng thử lại!');
          }
          setBtn('Thêm');
          handleClose();
          fetchBrands();
        });
      } else {
        axios.post(`${PUBLIC_API_URL}`, data).then((res) => {
          const { success } = res.data;
          if (success) {
            message.success('Thêm mới thương hiệu thành công!');
          } else {
            message.error('Có lỗi xảy ra vui lòng thử lại!');
          }
          handleClose();
          fetchBrands();
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={handleClickOpen} className={cx('btn-add')}>
          Thêm thương hiệu
        </button>
        <Dialog open={open || isEditing} onClose={handleClose}>
          <CreatedOrUpdatedBrand
            handleCreatedOrUpdated={handleCreatedOrUpdated}
            handleClose={handleClose}
            selectedBrand={selectedBrand}
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
              <h5 className={cx('row-title')}>id</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Tên thương hiệu</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Số điện thoại</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mô tả</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Địa chỉ</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Logo</h5>
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
          {brands.map((val, key) => {
            return (
              <div key={key} className={cx('table-grid', 'item-grid')}>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.id}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.name}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.phone_number}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.description}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.address}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.image_path}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.created_date}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{val.updated_date}</p>
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
                      onClick={() => handleDeleteBrand(val.id)}
                    />
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

export default BrandManagement;
