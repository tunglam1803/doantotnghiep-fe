import classNames from 'classnames/bind';
import styles from './Register.module.scss';
// import Mythumb from '~/assets/images/banner-thoi-trang-nam.jpg';
import Mylogo from '~/assets/images/Unet-removebg-preview.svg';
import { useState } from 'react';
import config from '~/config';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const cx = classNames.bind(styles);

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    passWord: '',
    confirmPassword: '',
    address: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    gender: 'NAM',
    status: 'ACTIVE',
    type: 'USER'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.passWord !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8080/api/users/registerUser', formData);
      
      if (response.status === 200) {
        alert('Đăng ký thành công!');
        navigate('/Login');
      } 
    } catch (err) {
      if (err.response) {
        const errorMessage = err.response.data; // Lấy message từ API
  
        // Kiểm tra nếu lỗi là về userName hoặc email
        if (errorMessage.includes('Tên đăng nhập')) {
          setErrors({ userName: errorMessage });
        } else if (errorMessage.includes('Email')) {
          setErrors({ email: errorMessage });
        } else {
          alert(errorMessage); // Nếu lỗi khác, hiển thị alert
        }
      } else {
        alert('Lỗi kết nối đến server!');
      }
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('first-Color')}></div>
      <div className={cx('container')}>
        <div className={cx('box-container')}>
          <div className={cx('left-side')}>
            <form className={cx('form')} onSubmit={handleSubmit}>
              <h1 className={cx('form-title')}>Đăng ký</h1>

              <div className={cx('input-container')}>
                <input placeholder="Nhập email" type="email" name="email" required value={formData.email} onChange={handleChange} />
                {errors.email && <p className={cx('error-message')}>{errors.email}</p>}
              </div>

              <div className={cx('input-container')}>
                <input placeholder="Nhập tên tài khoản" type="text" name="userName" required value={formData.userName} onChange={handleChange} />
                {errors.userName && <p className={cx('error-message')}>{errors.userName}</p>}
              </div>

              <div className={cx('input-container')}>
                <input placeholder="Nhập mật khẩu" type="password" name="passWord" required value={formData.passWord} onChange={handleChange} />
                {errors.passWord && <p className={cx('error-message')}>{errors.passWord}</p>}
              </div>

              <div className={cx('input-container')}>
                <input placeholder="Xác nhận mật khẩu" type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className={cx('error-message')}>{errors.confirmPassword}</p>}
              </div>

              <div className={cx('input-container')}>
                <input placeholder="Nhập số điện thoại" type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                {errors.phone && <p className={cx('error-message')}>{errors.phone}</p>}
              </div>

              <div className={cx('split-content')}>
                <div className={cx('w-content')}>
                  <input placeholder="Họ và tên" type="text" name="fullName" required value={formData.fullName} onChange={handleChange} />
                  {errors.fullName && <p className={cx('error-message')}>{errors.fullName}</p>}
                </div>
                <div className={cx('w-content')}>
                  <input placeholder="Địa chỉ" type="text" name="address" required value={formData.address} onChange={handleChange} />
                  {errors.address && <p className={cx('error-message')}>{errors.address}</p>}
                </div>
              </div>

              <div className={cx('input-container')}>
                <input placeholder="Ngày sinh" type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} />
                {errors.dateOfBirth && <p className={cx('error-message')}>{errors.dateOfBirth}</p>}
              </div>

              <div className={cx('split1-content')}>
                <FormControl>
                  <FormLabel>Giới tính</FormLabel>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleChange} className={cx('radio-group')}>
                    <FormControlLabel value="NAM" control={<Radio />} label="Nam" />
                    <FormControlLabel value="NỮ" control={<Radio />} label="Nữ" />
                    <FormControlLabel value="KHÁC" control={<Radio />} label="Khác" />
                  </RadioGroup>
                </FormControl>
              </div>

              <button className={cx('submit')} type="submit">
                Đăng ký
              </button>
              <p className={cx('have-account')}>Bạn đã có tài khoản?</p>
              <a href="/Login">Đăng nhập?</a>
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

export default Register;
