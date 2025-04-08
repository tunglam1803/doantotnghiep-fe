import classNames from 'classnames/bind';
import styles from './HeaderAdmin.module.scss';
import logo from '~/assets/images/Unet-removebg-preview.svg';

import { Link } from 'react-router-dom';
import config from '~/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
function HeaderAdmin() {
  return (
    <header className={cx('wrapper')}>
      <div className={cx('inner')}>
        <Link to={config.routes.home} className={cx('logo-link')}>
          <img src={logo} alt="UnetFashion" className={cx('logo')} />
        </Link>

        <div className={cx('site-user')}>
          <div className={cx('profile-user')}>
            <p className={cx('name-user')}>Admin</p>
            <p className={cx('avatar-user')}>
              <FontAwesomeIcon icon={faUser} />
            </p>
          </div>
          <Link to={config.routes.login} className={cx('logout')}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default HeaderAdmin;
