import classNames from 'classnames/bind';
import styles from './ForgotPass.module.scss';
import Mylogo from '~/assets/images/Unet-removebg-preview.svg';
import { Link, useNavigate } from 'react-router-dom';
import config from '~/config';
import { useState } from 'react';
import axios from 'axios';

const cx = classNames.bind(styles);

function ForgotPass() {
  const [step, setStep] = useState(1); // Quản lý bước hiện tại
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Thêm trạng thái cho thông báo thành công
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setSuccessMessage(''); // Xóa thông báo khi người dùng thay đổi email
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setError('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://192.168.189.110:8080/api/users/forgot-password', { email });
      setSuccessMessage(response.data); // Hiển thị thông báo từ API
      setStep(2); // Chuyển sang bước xác minh OTP
    } catch (error) {
      setError(error.response?.data || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://192.168.189.110:8080/api/users/verify-otp', null, {
        params: { email, otp },
      });
      setStep(3); // Chuyển sang bước đặt lại mật khẩu
    } catch (error) {
      setError('OTP không hợp lệ. Vui lòng thử lại.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://192.168.189.110:8080/api/users/reset-password', null, {
        params: { email, newPassword },
      });
      alert('Đặt lại mật khẩu thành công!');
      navigate(config.routes.login); // Chuyển hướng đến trang đăng nhập
    } catch (error) {
      setError('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('first-Color')}></div>
      <div className={cx('container')}>
        <div className={cx('box-container')}>
          <div className={cx('left-side')}>
            {step === 1 && (
              <form className={cx('form')} onSubmit={handleForgotPassword}>
                <h1 className={cx('form-title')}>Quên mật khẩu</h1>
                <div className={cx('input-container')}>
                  <input
                    placeholder="Nhập email của bạn"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                {successMessage && <p className={cx('success-message')}>{successMessage}</p>} {/* Hiển thị thông báo thành công */}
                {error && <p className={cx('error-message')}>{error}</p>} {/* Hiển thị lỗi */}
                <button className={cx('submit')} type="submit">Gửi yêu cầu</button>
              </form>
            )}

            {step === 2 && (
              <form className={cx('form')} onSubmit={handleVerifyOtp}>
                <h1 className={cx('form-title')}>Xác minh OTP</h1>
                <div className={cx('input-container')}>
                  <input
                    placeholder="Nhập mã OTP"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                  />
                </div>
                {error && <p className={cx('error-message')}>{error}</p>}
                <button className={cx('submit')} type="submit">Xác minh</button>
              </form>
            )}

            {step === 3 && (
              <form className={cx('form')} onSubmit={handleResetPassword}>
                <h1 className={cx('form-title')}>Đặt lại mật khẩu</h1>
                <div className={cx('input-container')}>
                  <input
                    placeholder="Nhập mật khẩu mới"
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    required
                  />
                </div>
                {error && <p className={cx('error-message')}>{error}</p>}
                <button className={cx('submit')} type="submit">Đặt lại mật khẩu</button>
              </form>
            )}
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

export default ForgotPass;