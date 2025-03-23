import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';

const cx = classNames.bind(styles);

function Sidebar() {
  const [collapsed1, setCollapsed1] = useState(true);
  const [collapsed2, setCollapsed2] = useState(true);
  const [collapsed3, setCollapsed3] = useState(true);
  
  // States for filter values
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [selectedSize, setSelectedSize] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  
  // Function to handle API call for filtering
  const fetchFilteredData = async () => {
    // Giả sử API nhận các tham số price, size, và color
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // API query string, giả sử API hỗ trợ các tham số này
      body: JSON.stringify({
        price: selectedPrice,
        size: selectedSize,
        color: selectedColor,
      }),
    });

    const data = await response.json();
    console.log(data); // Xử lý dữ liệu trả về từ API
  };

  // Gọi API mỗi khi giá trị lọc thay đổi
  useEffect(() => {
    fetchFilteredData();
  }, [selectedPrice, selectedSize, selectedColor]);

  const handlePriceChange = (price) => {
    setSelectedPrice((prev) => {
      if (prev.includes(price)) {
        return prev.filter((item) => item !== price);
      } else {
        return [...prev, price];
      }
    });
  };

  const handleSizeChange = (size) => {
    setSelectedSize((prev) => {
      if (prev.includes(size)) {
        return prev.filter((item) => item !== size);
      } else {
        return [...prev, size];
      }
    });
  };

  const handleColorChange = (color) => {
    setSelectedColor((prev) => {
      if (prev.includes(color)) {
        return prev.filter((item) => item !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  return (
    <aside className={cx('wrapper')}>
      {/* Bộ lọc Giá */}
      <div className={cx('Collapsible')}>
        <span className={cx('Collapsible_trigger')}>
          <div className={cx('trigger-content')}>
            <div className={cx('trigger-content_label')}>Giá</div>
            <div>
              <button
                className={cx('trigger-content_icon', collapsed1 ? '-is-up' : '-is-down')}
                onClick={() => setCollapsed1(!collapsed1)}
              >
                <FontAwesomeIcon icon={collapsed1 ? faChevronUp : faChevronDown} />
              </button>
            </div>
          </div>
        </span>
        {collapsed1 && (
          <div className={cx('filter-item_block')}>
            {['Từ 1,000,000đ', '1,000,000đ - 2,000,000đ', '2,000,000đ - 4,000,000đ', 'Trên 4,000,000đ'].map(
              (price, index) => (
                <button key={index} className={cx('filter-item')} onClick={() => handlePriceChange(price)}>
                  <input
                    type="checkbox"
                    className={cx('pseudo-checkbox')}
                    checked={selectedPrice.includes(price)}
                  />
                  <span className={cx('filter-item_item-label')}>{price}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Bộ lọc Size */}
      <div className={cx('Collapsible')}>
        <span className={cx('Collapsible_trigger')}>
          <div className={cx('trigger-content')}>
            <div className={cx('trigger-content_label')}>Size</div>
            <div>
              <button
                className={cx('trigger-content_icon', collapsed2 ? '-is-up' : '-is-down')}
                onClick={() => setCollapsed2(!collapsed2)}
              >
                <FontAwesomeIcon icon={collapsed2 ? faChevronUp : faChevronDown} />
              </button>
            </div>
          </div>
        </span>
        {collapsed2 && (
          <div className={cx('filter-item_block')}>
            {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
              <button key={size} className={cx('filter-item-size')} onClick={() => handleSizeChange(size)}>
                <span className={cx('filter-item_item-label')}>{size}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bộ lọc Màu sắc */}
      <div className={cx('Collapsible')}>
        <span className={cx('Collapsible_trigger')}>
          <div className={cx('trigger-content')}>
            <div className={cx('trigger-content_label')}>Màu</div>
            <div>
              <button
                className={cx('trigger-content_icon', collapsed3 ? '-is-up' : '-is-down')}
                onClick={() => setCollapsed3(!collapsed3)}
              >
                <FontAwesomeIcon icon={collapsed3 ? faChevronUp : faChevronDown} />
              </button>
            </div>
          </div>
        </span>
        {collapsed3 && (
          <div className={cx('filter-item_block')}>
            <div className={cx('filter-group_items-group')}>
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
                <button key={color.name} className={cx('filter-item-colour')} onClick={() => handleColorChange(color.name)}>
                  <div className={cx('filter-item_color-patch', color.class)}></div>
                  <span className={cx('filter-item_item-label')}>{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
