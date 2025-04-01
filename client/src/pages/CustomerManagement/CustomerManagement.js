import classNames from 'classnames/bind';
import styles from './CustomerManagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const PUBLIC_API_URL = 'http://localhost:8080';

const cx = classNames.bind(styles);

function CustomerManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const inputRef = useRef();

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

  const handleDeleteUser = (userId) => {
    axios
      .delete(`${PUBLIC_API_URL}/api/users/deleteUser/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        fetchCustomers();
        alert('User deleted successfully.');
      })
      .catch((err) => {
        console.log(err);
        alert('Failed to delete user.');
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
        <div className={cx('table')}>
          <div className={cx('table-grid')}>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>STT</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Tên người dùng</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Email</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Số điện thoại</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Địa chỉ</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày tạo</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày cập nhật</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Trạng thái</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {customers
            .filter(
              (cus) =>
                (cus.userName?.toLowerCase() || '').includes(searchValue) ||
                (cus.email?.toLowerCase() || '').includes(searchValue),
            )
            .map((cus, index) => {
              return (
                <div key={cus.id} className={cx('table-grid', 'item-grid')}>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{index + 1}</p>
                  </div>
                  <div className={cx('item-site1')}>
                    <p className={cx('item-content')}>{cus.username}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{cus.email}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{cus.phone}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{cus.addess}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{formatDate(cus.createAt)}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{formatDate(cus.updatedAt)}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{cus.is_deleted == 0 ? 'Hoạt động' : 'Vô hiệu hóa'}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <div className={cx('wrapper-icon')}>
                      <FontAwesomeIcon
                        className={cx('icon-action')}
                        icon={faTrash}
                        onClick={() => {
                          handleDeleteUser(cus.id);
                        }}
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

export default CustomerManagement;
