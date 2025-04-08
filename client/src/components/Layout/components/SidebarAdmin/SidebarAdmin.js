import classNames from 'classnames/bind';
import styles from './SidebarAdmin.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faBoxesPacking,
  faFileInvoice,
  faFilePdf,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '~/config';

const cx = classNames.bind(styles);

function SidebarAdmin() {
  const [activeItem, setActiveItem] = useState('customer');

  const handleItemClick = (item) => {
    setActiveItem((prevItem) => (prevItem === item ? null : item));
  };
  return (
    <div className={cx('nav-wrapper')}>
      <ul className={cx('nax-side')}>
        <li className={cx('nav-items')}>
          <Link
            to={config.routes.customermanagement}
            className={cx('nav-link', `${activeItem === 'customer' ? 'active' : ''}`)}
            onClick={() => handleItemClick('customer')}
            disabled={activeItem === 'customer'}
          >
            <div className={cx('nav-icon')}>
              <FontAwesomeIcon icon={faList} />
            </div>
            <span className={cx('nav-title')}>Quản lý tài khoản</span>
          </Link>
        </li>
        <li className={cx('nav-items')}>
          <Link
            to={config.routes.categorymanagement}
            className={cx('nav-link', `${activeItem === 'category' ? 'active' : ''}`)}
            onClick={() => handleItemClick('category')}
          >
            <div className={cx('nav-icon')}>
              <FontAwesomeIcon icon={faBoxesPacking} />
            </div>
            <span className={cx('nav-title')}>Quản lý danh mục</span>
          </Link>
        </li>
        <li className={cx('nav-items')}>
          <Link
            to={config.routes.productmanagement}
            className={cx('nav-link', `${activeItem === 'product' ? 'active' : ''}`)}
            onClick={() => handleItemClick('product')}
          >
            <div className={cx('nav-icon')}>
              <FontAwesomeIcon icon={faBook} />
            </div>
            <span className={cx('nav-title')}>Quản lý sản phẩm</span>
          </Link>
        </li>
        <li className={cx('nav-items')}>
          <Link
            to={config.routes.ordermanagement}
            className={cx('nav-link', `${activeItem === 'invoice' ? 'active' : ''}`)}
            onClick={() => handleItemClick('invoice')}
          >
            <div className={cx('nav-icon')}>
              <FontAwesomeIcon icon={faFileInvoice} />
            </div>
            <span className={cx('nav-title')}>Quản lý đơn hàng</span>
          </Link>
        </li>
        <li className={cx('nav-items')}>
          <Link
            to={config.routes.report}
            className={cx('nav-link', `${activeItem === 'report' ? 'active' : ''}`)}
            onClick={() => handleItemClick('report')}
          >
            <div className={cx('nav-icon')}>
              <FontAwesomeIcon icon={faFilePdf} />
            </div>
            <span className={cx('nav-title')}>Thống kê doang thu</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default SidebarAdmin;
