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
      setUsernameError('Vui lòng nhập tên đăng nhập');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const response = await axios.post('http://192.168.189.110:8080/api/users/loginUser', {
        userName: username,
        passWord: password,
      });
  
      const { token, role } = response.data; // Extract token and role from the response
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true'); // Save login state
      localStorage.setItem('role', role); // Save the user's role
  
      if (role === 'ADMIN') {
        navigate(config.routes.customermanagement); // Redirect to admin page
      } else {
        navigate(config.routes.home); // Redirect to home page
      }
    } catch (error) {
      setApiError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;
  
  //   try {
  //     const response = await axios.post('http://192.168.189.110:8080/api/users/loginUser', {
  //       userName: username,
  //       passWord: password,
  //     });
  
  //     const token = response.data;
  //     localStorage.setItem('token', token);
  //     localStorage.setItem('isLoggedIn', 'true'); // Lưu trạng thái đăng nhập
  
  //     navigate(config.routes.home);
  //   } catch (error) {
  //     setApiError('Invalid username or password');
  //   }
  // };  

  return (
    <div className={cx('wrapper')}>
      <div className={cx('first-Color')}></div>
      <div className={cx('container')}>
        <div className={cx('box-container')}>
          <div className={cx('left-side')}>
            <form className={cx('form')} onSubmit={handleSubmit}>
              <h1 className={cx('form-title')}>Đăng nhập</h1>
              <div className={cx('input-container')}>
                <input
                  placeholder="Nhập tên đăng nhập"
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
                  placeholder="Nhập mật khẩu"
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordError && <p className={cx('error-message')}>{passwordError}</p>}
              </div>
              {apiError && <p className={cx('error-message')}>{apiError}</p>}
              <button className={cx('submit')} type="submit">Đăng nhập</button>
              <p className={cx('signup-link')}>
                Chưa có tài khoản?{' '}
                <Link to={config.routes.register}>Đăng ký</Link>
              </p>
              <Link to={config.routes.forgotpass} className={cx('forget-password')}> Quên mật khẩu?</Link>
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