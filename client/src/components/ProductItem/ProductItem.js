import classNames from 'classnames/bind';
import styles from './ProductItem.module.scss';

const cx = classNames.bind(styles);

function ProductItem() {
  return (
    <div className={cx('wrapper')}>
      <img
        className={cx('product-avatar')}
        src="https://assets.adidas.com/images/w_280,h_280,f_auto,q_auto/3dee265667c549e3a0d0af7b00a2229a_9366/gz5159.jpg"
        alt="Ultraboost light"
      />
      <div className={cx('info')}>
        <p className={cx('type')}>Running</p>
        <span className={cx('product-name')}>Ultraboost light</span>
        <div className={cx('price')}>5.200.000 ₫</div>
      </div>
    </div>
  );
}

export default ProductItem;
