import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import config from '~/config';

const cx = classNames.bind(styles);

function Home() {
  return (
    <section>
      <Link to={config.routes.product} className={cx('container')}>
        <img
          className={cx('thumbnail')}
          src="https://i.pinimg.com/originals/b4/14/01/b4140158f6e7323b6f0ea6fb29fff4ed.jpg"
          alt="THumbnail 2"
        />
        <div className={cx('wrapper-container')}>
          <button className={cx('btn-shopping')}>
            <span className={cx('content-btn')}>Shop now</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </Link>

      {/* Nike */}
      <Link to={config.routes.product} className={cx('container')}>
        <img
          className={cx('thumbnail')}
          src="https://m.media-amazon.com/images/S/al-na-9d5791cf-3faf/6e9a201a-bb31-4749-8ff1-3604a6d73e85._CR0%2C0%2C1500%2C750_SX960_SY480_.jpg"
          alt="Thumbnail to"
        />

        <div className={cx('wrapper-container')}>
          <button className={cx('btn-shopping')}>
            <span className={cx('content-btn')}>Shop now</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </Link>

      {/* New Balance */}
      <Link to={config.routes.product} className={cx('container')}>
        <img
          className={cx('thumbnail')}
          src="https://intphcm.com/data/upload/banner-thoi-trang-nam-tinh.jpg"
          alt="Nam"
        />
        <div className={cx('wrapper-container')}>
          <button className={cx('btn-shopping')}>
            <span className={cx('content-btn')}>Shop now</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </Link>
    </section>
  );
}

export default Home;
