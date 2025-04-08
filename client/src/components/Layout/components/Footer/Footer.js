import React from 'react';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';

const cx = classNames.bind(styles);

const Footer = () => {
    return (
        <footer className={cx('footer')}>
            <div className={cx('grid')}>
                <div className={cx('grid__row')}>

                    {/* Mã sinh viên */}
                    <div className={cx('grid__column-3')}>
                        <div>
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
                    </div>

                    {/* Họ và tên */}
                    <div className={cx('grid__column-3')}>
                        <div>
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
                    </div>

                    {/* Theo dõi tôi */}
                    <div className={cx('grid__column-3')}>
                        <div>
                            <h3 className={cx('footer__heading')}>Theo dõi tôi</h3>
                            <ul className={cx('footer-list')}>
                                <li className={cx('footer-item')}>
                                    <a href="https://www.facebook.com/liLbiScUit203" className={cx('footer-item__link')}>
                                        <i className={cx('footer-item__icon', 'fab', 'fa-facebook')}></i>
                                        Facebook
                                    </a>
                                </li>
                                <li className={cx('footer-item')}>
                                    <a href="https://www.instagram.com/__lil.biscuit__/" className={cx('footer-item__link')}>
                                        <i className={cx('footer-item__icon', 'fab', 'fa-instagram')}></i>
                                        Instagram
                                    </a>
                                </li>
                                <li className={cx('footer-item')}>
                                    <a href="https://www.linkedin.com/in/tr%E1%BB%8Bnh-t%C3%B9ng-l%C3%A2m-483b88330/" className={cx('footer-item__link')}>
                                        <i className={cx('footer-item__icon', 'fab', 'fa-linkedin')}></i>
                                        Linkedin
                                    </a>
                                </li>
                            </ul>
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