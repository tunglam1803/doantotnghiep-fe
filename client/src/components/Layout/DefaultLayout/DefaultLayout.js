import classNames from 'classnames/bind';
import styles from './DefaultLayout.module.scss';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
  return (
    <div>
      <div className={cx('wrapper')}>{children}</div>
    </div>
  );
}

export default DefaultLayout;
