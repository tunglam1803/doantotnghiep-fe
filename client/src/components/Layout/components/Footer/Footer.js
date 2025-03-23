import React from 'react';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';

const cx = classNames.bind(styles);

const Footer = () => {
    return (
        <footer className={cx('footer')}>
            <div className={cx('grid')}>
                <div className={cx('grid__row')}>
                    {/* Chăm sóc khách hàng */}
                    <div className={cx('grid__column-2-4')}>
                        <h3 className={cx('footer__heading')}>Chăm sóc khách hàng</h3>
                        <ul className={cx('footer-list')}>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    Trung tâm trợ giúp
                                </a>
                            </li>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    Tùng Lâm Mall
                                </a>
                            </li>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    Hướng dẫn mua hàng
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Mã sinh viên */}
                    <div className={cx('grid__column-2-4')}>
                        <h3 className={cx('footer__heading')}>Mã sinh viên</h3>
                        <ul className={cx('footer-list')}>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    21103100850
                                </a>
                            </li>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    21103100857
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Họ và tên */}
                    <div className={cx('grid__column-2-4')}>
                        <h3 className={cx('footer__heading')}>Họ và tên</h3>
                        <ul className={cx('footer-list')}>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    Trịnh Tùng Lâm
                                </a>
                            </li>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    Nguyễn Thị Hương Giang
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Theo dõi tôi */}
                    <div className={cx('grid__column-2-4')}>
                        <h3 className={cx('footer__heading')}>Theo dõi tôi</h3>
                        <ul className={cx('footer-list')}>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    <i className={cx('footer-item__icon', 'fab', 'fa-facebook')}></i>
                                    Facebook
                                </a>
                            </li>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    <i className={cx('footer-item__icon', 'fab', 'fa-instagram')}></i>
                                    Instagram
                                </a>
                            </li>
                            <li className={cx('footer-item')}>
                                <a href="/" className={cx('footer-item__link')}>
                                    <i className={cx('footer-item__icon', 'fab', 'fa-linkedin')}></i>
                                    Linkedin
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Vào cửa hàng trên ứng dụng */}
                    <div className={cx('grid__column-2-4')}>
                        <h3 className={cx('footer__heading')}>Vào cửa hàng trên ứng dụng</h3>
                        <div className={cx('footer__download')}>
                            <img src="/assets/img/qr.png" alt="Download QR" className={cx('footer__download-qr')} />
                            <div className={cx('footer__download-apps')}>
                                <a href="/" className={cx('footer__download-link')}>
                                    <img
                                        src="/assets/img/ggp.png"
                                        alt="Google Play"
                                        className={cx('footer__download-app-img')}
                                    />
                                </a>
                                <a href="/" className={cx('footer__download-link')}>
                                    <img
                                        src="/assets/img/app.png"
                                        alt="App Store"
                                        className={cx('footer__download-app-img')}
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className={cx('footer__bottom')}>
                <div className={cx('grid')}>
                    <p className={cx('footer__text')}>&copy;2025 - Bản quyền thuộc về Trịnh Tùng Lâm</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;