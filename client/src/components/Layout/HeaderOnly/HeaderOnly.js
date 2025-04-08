import Header from '~/components/Layout/components/Header';
import classNames from 'classnames/bind';
import styles from './HeaderOnly.module.scss';
import Footer from '../components/Footer';
import ChatBox from '../components/Chatbot';

const cx = classNames.bind(styles);

function HeaderOnly({ children }) {
  return (
    <div className={cx('wrapper_pa')}>
      <div className={cx('wrapper')}>
        <Header />
        <div className={cx('container')}>
          <div className={cx('content')}>{children}</div>
        </div>
        <Footer />
      </div>
      <ChatBox />
    </div>
  );
}

export default HeaderOnly;
