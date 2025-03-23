import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faSliders } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Product.module.scss';
import Sidebar from '~/components/Layout/components/Sidebar/Sidebar';
import config from '~/config';
import axios from 'axios';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:8080';

function Product() {
  const [visible, setVisible] = useState(true);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const [filters, setFilters] = useState({ keyword: '', size: '', color: '', minPrice: '', maxPrice: '' });
  const [selectedVariants] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProductImages = async (productId) => {
    try {
      const res = await axios.get(`${PUBLIC_API_URL}/api/products/${productId}/images`);
      return res.data;
    } catch (err) {
      console.error(`Lỗi khi lấy ảnh của sản phẩm ${productId}:`, err);
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      let url = `${PUBLIC_API_URL}/api/products/`;
      const params = { ...filters };
      if (Object.values(params).some((value) => value)) {
        url = `${PUBLIC_API_URL}/api/products/filter`;
      }

      const res = await axios.get(url, { params });
      setProducts(res.data);

      const imagePromises = res.data.map(async (product) => {
        const images = await fetchProductImages(product.id);
        return { productId: product.id, images };
      });

      const imageResults = await Promise.all(imagePromises);
      const imageMap = {};
      imageResults.forEach(({ productId, images }) => {
        imageMap[productId] = images;
      });

      setImages(imageMap);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    }
  };

  return (
    <div className={cx('experience-wrapper')}>
      <div className={cx('sidebar')} style={{ display: visible ? 'block' : 'none' }}>
        <Sidebar onFilterChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))} />
      </div>

      <div className={cx('product-grid', 'sub-product-grid')} style={{ marginLeft: visible ? '356px' : '0px' }}>
        <header className={cx('wall-header')}>
          <nav className={cx('wall-header_nav')}>
            <button className={cx('filters-btn')} onClick={() => setVisible(!visible)}>
              <FontAwesomeIcon icon={faSliders} />
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              name="keyword"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className={cx('search-input')}
            />
          </nav>
        </header>

        <main>
          <section>
            <div className={cx('product-grid_items')}>
              {products.length > 0 ? (
                products.map((product) => {
                  const selectedVariant = selectedVariants[product.id] || product.variants[0] || {};
                  const rawImagePath = images[product.id]?.[0] || '';
                  const imageUrl = rawImagePath.startsWith('/product-photo/')
                    ? `${PUBLIC_API_URL}${rawImagePath}`
                    : rawImagePath
                    ? `${PUBLIC_API_URL}/uploads/${rawImagePath}`
                    : '/default-img.jpg';
                  return (
                    <div key={product.id} className={cx('product-card')}>
                      <Link to={`${config.routes.productItem}/${product.id}`} className={cx('product-card_link')}>
                        <img alt={product.productName} className={cx('product-card_hero-image')} src={imageUrl} />
                      </Link>
                      <div className={cx('product-card_info')}>
                        <p className={cx('product-card_info-title')}>{product.productName}</p>
                        <div className={cx('product-card_info-body-parent')}>
                          <p className={cx('product-card_info-body')}>
                            {' '}
                            {selectedVariant.price ? (
                              selectedVariant.promotionalPrice &&
                              selectedVariant.price !== selectedVariant.promotionalPrice ? (
                                <>
                                  {selectedVariant.promotionalPrice}₫{' '}
                                  <span className={cx('old-price')}>{selectedVariant.price}₫</span>
                                </>
                              ) : (
                                `${selectedVariant.price}₫`
                              )
                            ) : (
                              'Chưa có giá'
                            )}
                          </p>
                          <Link to={`${config.routes.productItem}/${product.id}`}>
                            <button className={cx('product-card_btn')}>
                              <FontAwesomeIcon className={cx('product-card_btn-shopping')} icon={faCartShopping} />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Không có sản phẩm nào.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Product;
