import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faSliders } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Product.module.scss';
import Sidebar from '~/components/Layout/components/Sidebar/Sidebar';
import config from '~/config';
import axios from 'axios';
import { Pagination } from 'antd';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:8080';

function Product() {
  const [visible, setVisible] = useState(true);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const [filters, setFilters] = useState({ keyword: '', size: '', color: '', minPrice: '', maxPrice: '' });
  const [selectedVariants] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [pageSize, setPageSize] = useState(visible ? 8 : 10); // Items per page
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    setPageSize(visible ? 8 : 10);
    setCurrentPage(1); // Reset to the first page when pageSize changes
  }, [visible]);

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
      let url = `${PUBLIC_API_URL}/api/products/get-all-product`;
      const params = { ...filters, page: currentPage - 1, size: pageSize }; // Backend expects 0-based page index
      if (Object.values(filters).some((value) => value)) {
        url = `${PUBLIC_API_URL}/api/products/filterProduct`;
      }
  
      console.log('Request URL:', url);
      console.log('Request Params:', params);
  
      const res = await axios.get(url, { params });
      console.log('API Response:', res.data);
  
      const productList = res.data.products;
      if (Array.isArray(productList) && productList.length > 0) {
        setProducts(productList);
        setTotalItems(res.data.totalElements || 0); // Update total items for pagination
  
        const imagePromises = productList.map(async (product) => {
          const images = await fetchProductImages(product.id);
          return { productId: product.id, images };
        });
  
        const imageResults = await Promise.all(imagePromises);
        const imageMap = {};
        imageResults.forEach(({ productId, images }) => {
          imageMap[productId] = images;
        });
  
        setImages(imageMap);
      } else {
        console.warn('No products found:', res.data);
        setProducts([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err.message);
      setProducts([]);
      setTotalItems(0);
    }
  };

  // const fetchProducts = async () => {
  //   try {
  //     let url = `${PUBLIC_API_URL}/api/products/get-all-product`;
  //     const params = { ...filters };
  //     if (Object.values(params).some((value) => value)) {
  //       url = `${PUBLIC_API_URL}/api/products/filterProduct`;
  //     }

  //     const res = await axios.get(url, { params });
  //     setProducts(res.data);

  //     const imagePromises = res.data.map(async (product) => {
  //       const images = await fetchProductImages(product.id);
  //       return { productId: product.id, images };
  //     });

  //     const imageResults = await Promise.all(imagePromises);
  //     const imageMap = {};
  //     imageResults.forEach(({ productId, images }) => {
  //       imageMap[productId] = images;
  //     });

  //     setImages(imageMap);
  //   } catch (err) {
  //     console.error('Lỗi khi lấy danh sách sản phẩm:', err);
  //   }
  // };

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
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  }).format(selectedVariant.promotionalPrice)}
                                  <span className={cx('old-price')}>
                                    {new Intl.NumberFormat('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND',
                                    }).format(selectedVariant.price)}
                                  </span>
                                </>
                              ) : (
                                `${new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(selectedVariant.price)}`
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

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            showSizeChanger
            showQuickJumper
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showTotal={(total) => `Total ${total} items`}
          />
        </main>
      </div>
    </div>
  );
}

export default Product;
