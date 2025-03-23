import classNames from 'classnames/bind';
import styles from './CustomerManagement.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const PUBLIC_API_URL = 'http://localhost:5252';


const cx = classNames.bind(styles);

function CustomerManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [customers, setCustomers] = useState([]);


  const inputRef = useRef();

  const handleClear = () => {
    setSearchValue('');
    inputRef.current.focus();
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

  const fetchCustomers = () => {
    const request = {
      page: 1,
      size: 100,
    }
    axios
      .post(`${PUBLIC_API_URL}/open-api/v1/users/get-all`, request)
      .then((res) => {
        console.log(res);
        setCustomers(res.data.data.data)
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteProduct = (customer) => {
    axios
      .delete(`${PUBLIC_API_URL}/api/customers/${customer.customer_id}`)
      .then(() => {
        fetchCustomers();
        alert('The action has been successfully executed.');
      })
      .catch((err) => {
        console.log(err);
        alert('The action has been failed executed.');
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
              <h5 className={cx('row-title')}>ID</h5>
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
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {customers.map((cus) => {
            return (
              <div key={cus.id} className={cx('table-grid', 'item-grid')}>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{cus.id}</p>
                </div>
                <div className={cx('item-site1')}>
                  <p className={cx('item-content')}>{cus.first_name} {cus.last_name}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{cus.email}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{cus.phone_number}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{cus.address}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{cus.created_date}</p>
                </div>
                
                <div className={cx('item-site')}>
                  <div className={cx('wrapper-icon')}>
                    <FontAwesomeIcon
                      className={cx('icon-action')}
                      icon={faTrash}
                      onClick={() => {
                        handleDeleteProduct(cus);
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
