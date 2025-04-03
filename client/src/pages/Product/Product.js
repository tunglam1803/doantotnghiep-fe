import { useEffect, useState, useRef } from 'react';
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
import { Pagination, Slider } from 'antd';

const cx = classNames.bind(styles);
const PUBLIC_API_URL = 'http://localhost:8080';

function Product() {
  const [visible, setVisible] = useState(true);
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

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    setPageSize(visible ? 8 : 10);
    setCurrentPage(1); // Reset to the first page when pageSize changes
  }, [visible]);

  const fetchProducts = async () => {
    try {
      let url = `${PUBLIC_API_URL}/api/products/get-all-product`;
      const params = { ...filters, page: currentPage - 1, pageSize }; // Đổi tên size thành pageSize
  
      if (filters.color && filters.color.length > 0) {
        params.color = filters.color.map((color) => color.toLowerCase()).join(',');
      }
      if (filters.size && filters.size.length > 0) {
        params.size = filters.size.join(','); // Gửi size dưới dạng chuỗi phân tách bằng dấu phẩy
      }
  
      if (Object.values(filters).some((value) => value && value.length > 0)) {
        url = `${PUBLIC_API_URL}/api/products/filterProduct`;
      }
  
      console.log('Request URL:', url);
      console.log('Request Params:', params);
  
      const res = await axios.get(url, { params });
  
      const productList = res.data.products || res.data;
  
      if (Array.isArray(productList) && productList.length > 0) {
        setProducts(productList);
        setTotalItems(res.data.totalElements || productList.length);
  
        // Fetch images for each product
        const imagePromises = productList.map(async (product) => {
          const res = await axios.get(`${PUBLIC_API_URL}/api/products/${product.id}/images`);
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
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err.message);
      setProducts([]);
      setTotalItems(0);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to the first page when filters change
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
    setPageSize(10000);
    setCurrentPage(1);
    const searchValue = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
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
                max={1000000}
                step={10000}
                defaultValue={[0, 500000]} // Giá trị mặc định
                onChange={handlePriceChange} // Gọi hàm khi giá trị thay đổi
                tooltip={{ formatter: (value) => `${value.toLocaleString()}đ` }} // Hiển thị tooltip với định dạng tiền tệ
              />
              <div className={cx('price-range-display')}>
                <span>{selectedPrice[0]?.toLocaleString()}đ</span> - <span>{selectedPrice[1]?.toLocaleString()}đ</span>
              </div>
            </div>
          )}
        </div>

        {/* Size Filter */}
        <div className={cx('Collapsible')}>
          <span className={cx('Collapsible_trigger')}>
            <div className={cx('trigger-content')}>
              <div className={cx('trigger-content_label')}>Size</div>
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
          <button
            className={cx('filter-clear-btn')}
            onClick={() => {
              setFilters({ price: [], size: [], color: [], keyword: '' }); // Reset tất cả bộ lọc
              setSelectedPrice([]);
              setSelectedSize([]);
              setSelectedColor([]);
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
  products.map((product) => {
    const rawImagePath = images[product.id]?.[0] || '';
    const imageUrl = rawImagePath
      ? rawImagePath.startsWith('/product-photo/')
        ? `${PUBLIC_API_URL}${rawImagePath}`
        : `${PUBLIC_API_URL}/uploads/${rawImagePath}`
      : '/default-img.jpg';

    const price =
      product.variants?.[0]?.promotionalPrice || product.variants?.[0]?.price || 'Chưa có giá';

    return (
      <div key={product.id} className={cx('product-card', { 'product-card--sub': visible })}>
        <Link to={`${config.routes.productItem}/${product.id}`} className={cx('product-card_link')}>
          <img alt={product.productName} className={cx('product-card_hero-image')} src={imageUrl} />
        </Link>
        <div className={cx('product-card_info')}>
          <p className={cx('product-card_info-title')}>{product.productName}</p>
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
              setPageSize(size);
            }}
            showTotal={(total) => `Total ${total} items`}
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
