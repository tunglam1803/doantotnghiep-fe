import classNames from 'classnames/bind';
import styles from './Register.module.scss';
// import Mythumb from '~/assets/images/banner-thoi-trang-nam.jpg';
import Mylogo from '~/assets/images/Unet-removebg-preview.svg';
import { useState } from 'react';
import config from '~/config';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { message } from 'antd';

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
    type: 'USER',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu xác nhận
    if (formData.passWord !== formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Mật khẩu xác nhận không khớp.',
      }));
      return; // Dừng việc gửi request nếu mật khẩu không khớp
    }

    // Kiểm tra độ dài mật khẩu
    if (formData.passWord.length < 5) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        passWord: 'Mật khẩu phải có ít nhất 5 ký tự.',
      }));
      return; // Dừng việc gửi request nếu mật khẩu không đủ dài
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Định dạng email cơ bản
    if (!emailRegex.test(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Email không hợp lệ. Vui lòng nhập đúng định dạng.',
      }));
      return; // Dừng việc gửi request nếu email không hợp lệ
    }

    // Kiểm tra ngày sinh
    const today = new Date();
    const dateOfBirth = new Date(formData.dateOfBirth);
    if (dateOfBirth >= today) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dateOfBirth: 'Ngày sinh phải là một ngày trong quá khứ.',
      }));
      return; // Dừng việc gửi request nếu ngày sinh không hợp lệ
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^(\+84|0)[3-9][0-9]{8}$/; // Định dạng số điện thoại Việt Nam
    if (!phoneRegex.test(formData.phone)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.',
      }));
      return; // Dừng việc gửi request nếu số điện thoại không hợp lệ
    }

    try {
      const response = await axios.post('http://localhost:8080/api/users/registerUser', formData);

      if (response.status === 200) {
        message.success('Đăng ký thành công!');
        navigate('/Login');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessages = err.response.data;

        // Kiểm tra nếu lỗi trả về là chuỗi
        if (typeof errorMessages === 'string') {
          // Kiểm tra nội dung lỗi và gán vào trường phù hợp
          if (errorMessages.includes('Tên đăng nhập')) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              userName: errorMessages, // Gán lỗi vào trường userName
            }));
          } else if (errorMessages.includes('Email')) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              email: errorMessages, // Gán lỗi vào trường email
            }));
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              general: errorMessages, // Gán lỗi chung vào trường general
            }));
          }
        } else {
          // Nếu lỗi trả về là đối tượng JSON
          setErrors((prevErrors) => ({
            ...prevErrors,
            ...errorMessages,
          }));
        }
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
                <input
                  placeholder="Nhập email"
                  type="text"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className={cx('error-message')}>{errors.email}</p>}
              </div>

              <div className={cx('input-container')}>
                <input
                  placeholder="Nhập tên tài khoản"
                  type="text"
                  name="userName"
                  required
                  value={formData.userName}
                  onChange={handleChange}
                />
                {errors.userName && <p className={cx('error-message')}>{errors.userName}</p>}
              </div>

              <div className={cx('input-container')}>
                <input
                  placeholder="Nhập mật khẩu"
                  type="password"
                  name="passWord"
                  required
                  value={formData.passWord}
                  onChange={handleChange}
                />
                {errors.passWord && <p className={cx('error-message')}>{errors.passWord}</p>}
              </div>

              <div className={cx('input-container')}>
                <input
                  placeholder="Xác nhận mật khẩu"
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className={cx('error-message')}>{errors.confirmPassword}</p>}
              </div>

              <div className={cx('input-container')}>
                <input
                  placeholder="Nhập số điện thoại"
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className={cx('error-message')}>{errors.phone}</p>}
              </div>

              <div className={cx('split-content')}>
                <div className={cx('w-content')}>
                  <input
                    placeholder="Họ và tên"
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && <p className={cx('error-message')}>{errors.fullName}</p>}
                </div>
                <div className={cx('w-content')}>
                  <input
                    placeholder="Địa chỉ"
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {errors.address && <p className={cx('error-message')}>{errors.address}</p>}
                </div>
              </div>

              <div className={cx('input-container')}>
                <input
                  placeholder="Ngày sinh"
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && <p className={cx('error-message')}>{errors.dateOfBirth}</p>}
              </div>

              <div className={cx('split1-content')}>
                <FormControl>
                  <FormLabel>Giới tính</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={cx('radio-group')}
                  >
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
              <a href="/Login"><u>Đăng nhập?</u></a>
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
