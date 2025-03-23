import classNames from 'classnames/bind';
import styles from './MenuItem.module.scss';

const cx = classNames.bind(styles);

function MenuItem({ children }) {
  return <div className={cx('wrapper')}>{children}</div>;
}

export default MenuItem;
