import classNames from 'classnames/bind';
import styles from './AdminLayout.module.scss';
import HeaderAdmin from '../components/HeaderAdmin/HeaderAdmin';
import SidebarAdmin from '../components/SidebarAdmin/SidebarAdmin';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  return (
    <div className={cx('wrapper')}>
      <HeaderAdmin />
      <div className={cx('container')}>
        <SidebarAdmin/>
        <div className={cx('content')}>{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
