import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames/bind';
// import { useEffect, useRef, useState } from 'react';
import styles from './Home.module.scss';
// import images from '~/assets/images';\
import Chatbot from '~/components/Layout/components/Chatbot';

const cx = classNames.bind(styles);

function Home() {
  return (
    <section>
      <div className={cx('container')}>
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
      </div>

      {/* Nike */}
      <div className={cx('container')}>
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
      </div>

      {/* New Balance */}
      <div className={cx('container')}>
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
      </div>
      <Chatbot/>
    </section>
  );
}

export default Home;
