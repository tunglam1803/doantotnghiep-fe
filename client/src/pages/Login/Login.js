import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import Mylogo from '~/assets/images/Unet-removebg-preview.svg';
import { Link, useNavigate } from 'react-router-dom';
import config from '~/config';
import { useState } from 'react';
import axios from 'axios';

const cx = classNames.bind(styles);

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setUsernameError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const validateForm = () => {
    let isValid = true;

    if (!username) {
      setUsernameError('Please enter a username');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter a password');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', {
        userName: username,
        passWord: password,
      });
  
      const token = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true'); // Lưu trạng thái đăng nhập
  
      navigate(config.routes.home);
    } catch (error) {
      setApiError('Invalid username or password');
    }
  };  

  return (
    <div className={cx('wrapper')}>
      <div className={cx('first-Color')}></div>
      <div className={cx('container')}>
        <div className={cx('box-container')}>
          <div className={cx('left-side')}>
            <form className={cx('form')} onSubmit={handleSubmit}>
              <h1 className={cx('form-title')}>Sign in to your account</h1>
              <div className={cx('input-container')}>
                <input
                  placeholder="Enter Username"
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                />
                {usernameError && <p className={cx('error-message')}>{usernameError}</p>}
              </div>
              <div className={cx('input-container')}>
                <input
                  placeholder="Enter password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordError && <p className={cx('error-message')}>{passwordError}</p>}
              </div>
              {apiError && <p className={cx('error-message')}>{apiError}</p>}
              <button className={cx('submit')} type="submit">Sign in</button>
              <p className={cx('signup-link')}>
                No account?
                <Link to={config.routes.register}> Sign up</Link>
              </p>
              <p className={cx('forget-password')}>Forgot your password?</p>
            </form>
          </div>
          <div className={cx('right-side')}>
            <div className={cx('wrapper-img')}>
              <Link to={config.routes.home}>
                <img src={Mylogo} alt="mylogo" className={cx('logo-img')} />
              </Link>
              <p>🌟 Mặc chất – Sống chất! 🌟</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;