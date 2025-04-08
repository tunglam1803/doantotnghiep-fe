import { useEffect, useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping,
  faMagnifyingGlass,
  faCircleXmark,
  faChevronDown,
  faChevronUp,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Product.module.scss';
import config from '~/config';
import axios from 'axios';
import { Pagination, Slider, Breadcrumb, message } from 'antd';
import { useFilter } from '~/components/Layout/components/Header/FilterContext';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:8080';

function Product() {
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ price: [], size: [], color: [], keyword: '' });
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [pageSize, setPageSize] = useState(visible ? 8 : 10); // Items per page
  const [totalItems, setTotalItems] = useState(0);
  const [images, setImages] = useState({});
  const inputRef = useRef();
  const [searchValue, setSearchValue] = useState('');

  // Sidebar states
  const [collapsedPrice, setCollapsedPrice] = useState(false);
  const [collapsedSize, setCollapsedSize] = useState(false);
  const [collapsedColor, setCollapsedColor] = useState(false);

  const [selectedPrice, setSelectedPrice] = useState([]);
  const [selectedSize, setSelectedSize] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const { categoryId } = useFilter();
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (categoryId || currentPage || pageSize) {
      fetchProducts();
    }
  }, [categoryId, currentPage, pageSize]);

  useEffect(() => {
    setPageSize(visible ? 8 : 10);
    setCurrentPage(1); // Reset to the first page when pageSize changes
  }, [visible]);

  const token = localStorage.getItem('token');

  const fetchProducts = useCallback(async () => {
    try {
      let url;
      const params = { page: currentPage - 1, pageSize };

      if (categoryId) {
        url = `${PUBLIC_API_URL}/api/products/getAllCategory/${categoryId}`;
      } else {
        url = `${PUBLIC_API_URL}/api/products/get-all-product`;
      }

      if (filters.color && filters.color.length > 0) {
        params.color = filters.color.map((color) => color.toLowerCase()).join(',');
      }
      if (filters.size && filters.size.length > 0) {
        params.size = filters.size.join(',');
      }
      if (filters.price && filters.price.length === 2) {
        params.price = filters.price.join(',');
      }

      if (Object.values(filters).some((value) => value && value.length > 0)) {
        url = `${PUBLIC_API_URL}/api/products/filterProduct`;
      }

      const queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`${url}?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const productList = res.data.products || res.data;

      if (Array.isArray(productList) && productList.length > 0) {
        setProducts(productList);
        setTotalItems(res.data.totalElements || productList.length);

        const firstProduct = productList[0];
        if (firstProduct && firstProduct.category) {
          setCategoryName(firstProduct.category.categoryName);
        }

        const imagePromises = productList.map(async (product) => {
          const res = await axios.get(`${PUBLIC_API_URL}/api/products/${product.id}/images`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return { productId: product.id, images: res.data };
        });

        const imageResults = await Promise.all(imagePromises);
        const imageMap = {};
        imageResults.forEach(({ productId, images }) => {
          imageMap[productId] = images;
        });

        setImages(imageMap);
      } else {
        setProducts([]);
        setTotalItems(0);
        setCategoryName('Danh mục');
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err.message);
      setProducts([]);
      setTotalItems(0);
      setCategoryName('Danh mục');
    }
  }, [categoryId, currentPage, pageSize, filters, token]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value })); // Cập nhật bộ lọc
  };

  const handlePriceChange = (range) => {
    setSelectedPrice(range); // Lưu khoảng giá đã chọn
    handleFilterChange('price', range); // Gửi khoảng giá đến API
  };

  const handleSizeChange = (size) => {
    setSelectedSize((prev) => {
      const updated = prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size];
      handleFilterChange('size', updated);
      return updated;
    });
  };

  const handleColorChange = (color) => {
    setSelectedColor((prev) => {
      const updated = prev.includes(color) ? prev.filter((item) => item !== color) : [...prev, color];
      handleFilterChange('color', updated);
      return updated;
    });
  };

  const handleClear = () => {
    setSearchValue('');
    inputRef.current.focus();
  };

  const handleChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchValue(searchValue);

    if (!searchValue.trim()) {
      // Nếu không có giá trị tìm kiếm, đặt pageSize về 3
      setPageSize(10);
    } else {
      // Nếu có giá trị tìm kiếm, hiển thị tất cả kết quả
      setPageSize(500);
    }

    setCurrentPage(1); // Đặt lại trang hiện tại về 1
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset về trang đầu tiên
    fetchProducts(); // Gọi API để lấy sản phẩm theo bộ lọc
  };

  return (
    <div className={cx('experience-wrapper')}>
      <div className={cx('sidebar')} style={{ display: visible ? 'block' : 'none' }}>
        {/* Price Filter */}
        <div className={cx('Collapsible')}>
          <span className={cx('Collapsible_trigger')}>
            <div className={cx('trigger-content')}>
              <div className={cx('trigger-content_label')}>Giá</div>
              <div>
                <button
                  className={cx('trigger-content_icon', collapsedPrice ? '-is-up' : '-is-down')}
                  onClick={() => setCollapsedPrice(!collapsedPrice)}
                >
                  <FontAwesomeIcon icon={collapsedPrice ? faChevronUp : faChevronDown} />
                </button>
              </div>
            </div>
          </span>
          {collapsedPrice && (
            <div className={cx('filter-item_block')}>
              <Slider
                range
                min={0}
                max={15000000}
                step={10000}
                defaultValue={[0, 1000000]} // Giá trị mặc định
                onChange={handlePriceChange} // Gọi hàm khi giá trị thay đổi
                tooltip={{ formatter: (value) => `${value.toLocaleString()}đ` }} // Hiển thị tooltip với định dạng tiền tệ
              />
              <div className={cx('price-range-display')}>
                <span>{(selectedPrice[0] ?? 0).toLocaleString()}đ</span>
                <span>{(selectedPrice[1] ?? 1000000).toLocaleString()}đ</span>
              </div>
            </div>
          )}
        </div>

        {/* Size Filter */}
        <div className={cx('Collapsible')}>
          <span className={cx('Collapsible_trigger')}>
            <div className={cx('trigger-content')}>
              <div className={cx('trigger-content_label')}>Kích cỡ</div>
              <div>
                <button
                  className={cx('trigger-content_icon', collapsedSize ? '-is-up' : '-is-down')}
                  onClick={() => setCollapsedSize(!collapsedSize)}
                >
                  <FontAwesomeIcon icon={collapsedSize ? faChevronUp : faChevronDown} />
                </button>
              </div>
            </div>
          </span>
          {collapsedSize && (
            <div className={cx('filter-item_block1')}>
              {['S', 'XS', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  className={cx('filter-item-size', { selected: selectedSize.includes(size) })} // Thêm class "selected" nếu size được chọn
                  onClick={() => handleSizeChange(size)}
                >
                  <span className={cx('filter-item_item-label')}>{size}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Filter */}
        <div className={cx('Collapsible')}>
          <span className={cx('Collapsible_trigger')}>
            <div className={cx('trigger-content')}>
              <div className={cx('trigger-content_label')}>Màu</div>
              <div>
                <button
                  className={cx('trigger-content_icon', collapsedColor ? '-is-up' : '-is-down')}
                  onClick={() => setCollapsedColor(!collapsedColor)}
                >
                  <FontAwesomeIcon icon={collapsedColor ? faChevronUp : faChevronDown} />
                </button>
              </div>
            </div>
          </span>
          {collapsedColor && (
            <div className={cx('filter-item_block1')}>
              {[
                { name: 'Black', class: 'is--black' },
                { name: 'Blue', class: 'is--blue' },
                { name: 'Brown', class: 'is--brown' },
                { name: 'Green', class: 'is--green' },
                { name: 'Grey', class: 'is--grey' },
                { name: 'Multi-colour', class: 'is--multi-colour' },
                { name: 'Orange', class: 'is--orange' },
                { name: 'Pink', class: 'is--pink' },
                { name: 'Purple', class: 'is--purple' },
                { name: 'Red', class: 'is--red' },
                { name: 'White', class: 'is--white' },
                { name: 'Yellow', class: 'is--yellow' },
              ].map((color) => (
                <button
                  key={color.name}
                  className={cx('filter-item-colour', { selected: selectedColor.includes(color.name) })} // Thêm class "selected" nếu màu được chọn
                  onClick={() => handleColorChange(color.name)}
                  title={color.name}
                >
                  <div className={cx('filter-item_color-patch', color.class)}></div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={cx('filter-actions')}>
          <button className={cx('filter-btn')} onClick={applyFilters}>
            Lọc
          </button>
          <button
            className={cx('filter-clear-btn')}
            onClick={() => {
              setFilters({ price: [], size: [], color: [], keyword: '' }); // Reset tất cả bộ lọc
              setSelectedPrice([]);
              setSelectedSize([]);
              setSelectedColor([]);
              setCurrentPage(1); // Reset về trang đầu tiên
              fetchProducts(); // Gọi lại API để hiển thị tất cả sản phẩm
            }}
          >
            Bỏ lọc
          </button>
        </div>
      </div>

      <div className={cx('product-grid', 'sub-product-grid')} style={{ marginLeft: visible ? '' : '0px' }}>
        <header className={cx('wall-header')}>
          <nav className={cx('wall-header_nav')}>
            <button className={cx('filters-btn')} onClick={() => setVisible(!visible)}>
              <FontAwesomeIcon icon={faSliders} />
            </button>

            <Breadcrumb
              style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }}
              items={[
                {
                  title: <Link to="/">Trang chủ</Link>,
                },
                {
                  title: (
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
                        if (categoryName !== 'Sản phẩm') {
                          setCategoryName('Sản phẩm'); // Đặt lại tên danh mục
                          setFilters((prevFilters) => {
                            if (
                              prevFilters.price.length === 0 &&
                              prevFilters.size.length === 0 &&
                              prevFilters.color.length === 0 &&
                              prevFilters.keyword === ''
                            ) {
                              return prevFilters; // Không cập nhật nếu bộ lọc đã trống
                            }
                            return { price: [], size: [], color: [], keyword: '' }; // Reset bộ lọc
                          });
                          if (currentPage !== 1) {
                            setCurrentPage(1); // Chỉ reset về trang đầu tiên nếu cần
                          }
                          fetchProducts(); // Gọi API để lấy toàn bộ sản phẩm
                        }
                      }}
                    >
                      Danh mục
                    </Link>
                  ),
                },
                {
                  title: categoryName || 'Sản phẩm',
                },
              ]}
            />

            <div className={cx('search-site')}>
              <button className={cx('search-btn')}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
              <input
                ref={inputRef}
                className={cx('input-search')}
                name="text"
                placeholder="Nhập tên sản phẩm"
                type="search"
                value={searchValue}
                onChange={handleChange}
              />
              <button className={cx('clear')} onClick={handleClear}>
                <FontAwesomeIcon icon={faCircleXmark} />
              </button>
            </div>
          </nav>
        </header>

        <main>
          <section>
            <div className={cx('product-grid_items', { 'product-grid_items--sub': visible })}>
              {products.length > 0 ? (
                products
                  .filter((product) => product.productName.toLowerCase().includes(searchValue.toLowerCase()))
                  .map((product) => {
                    const rawImagePath = images[product.id]?.[0] || '';
                    const secondImagePath = images[product.id]?.[1] || rawImagePath; // Ảnh thứ 2 hoặc fallback về ảnh đầu tiên
                    const imageUrl =
                      hoveredProductId === product.id
                        ? `${PUBLIC_API_URL}${secondImagePath}`
                        : `${PUBLIC_API_URL}${rawImagePath}`;

                    const price =
                      product.variants?.[0]?.promotionalPrice || product.variants?.[0]?.price || 'Chưa có giá';

                    return (
                      <div key={product.id} className={cx('product-card', { 'product-card--sub': visible })}>
                        <Link to={`${config.routes.productItem}/${product.id}`} className={cx('product-card_link')}>
                          <img
                            alt={product.productName}
                            className={cx('product-card_hero-image')}
                            src={imageUrl}
                            onMouseEnter={() => setHoveredProductId(product.id)} // Cập nhật trạng thái khi hover
                            onMouseLeave={() => setHoveredProductId(null)}
                          />
                        </Link>
                        <div className={cx('product-card_info')}>
                          <p className={cx('product-card_info-title')} title={product.productName}>
                            {product.productName}
                          </p>
                          <div className={cx('product-card_info-body-parent')}>
                            <p className={cx('product-card_info-body')}>
                              {typeof price === 'number'
                                ? price.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  })
                                : price}
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
              setPageSize(size); // Cập nhật pageSize
            }}
            showTotal={(total) => `Tổng cộng ${total} sản phẩm`} // Hiển thị tổng số sản phẩm
            locale={{
              items_per_page: 'Sản phẩm / Trang',
              jump_to: 'Tới trang',
              jump_to_confirm: 'Xác nhận',
              page: '',
              prev_page: 'Trang trước',
              next_page: 'Trang sau',
              prev_5: 'Quay lại 5 trang',
              next_5: 'Tiến tới 5 trang',
              prev_3: 'Quay lại 3 trang',
              next_3: 'Tiến tới 3 trang',
            }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
              marginBottom: '20px',
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default Product;
