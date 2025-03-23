/* eslint-disable react-hooks/exhaustive-deps */
import { faChevronDown, faChevronUp, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './productItem.module.scss';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const cx = classNames.bind(styles);

const PUBLIC_API_URL = 'http://localhost:8080';

function ProductItem() {
  const [collapsed, setCollapsed] = useState(true);
  const [collapsed1, setCollapsed1] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Khi đổi kích cỡ mà màu không còn hợp lệ -> reset màu
  useEffect(() => {
    if (selectedSize && !availableColors.includes(selectedColor)) {
      setSelectedColor(null);
    }
  }, [selectedSize]);

  // Khi đổi màu mà kích cỡ không còn hợp lệ -> reset kích cỡ
  useEffect(() => {
    if (selectedColor && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }, [selectedColor]);

  // Cập nhật variant khi đã chọn đủ cả kích cỡ & màu
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSize, selectedColor]);

  const fetchProducts = () => {
    axios
      .get(`${PUBLIC_API_URL}/api/products/${id}`)
      .then((res) => {
        console.log(res);
        setProduct(res.data);
        if (res.data?.images?.length > 0) {
          setSelectedImage(res.data.images[0].fileName);
        }
      })
      .catch((err) => console.log(err));
  };

  if (!product || !product.variants) {
    return <div>Loading...</div>; // Tránh lỗi khi dữ liệu chưa sẵn sàng
  }

  // Xử lý khi di chuột vào ảnh
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100; // Tính toán % vị trí chuột
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  // Lấy danh sách tất cả kích cỡ & màu từ variants
  const allSizes = [...new Set(product.variants.map((variant) => variant.size))];
  const allColors = [...new Set(product.variants.map((variant) => variant.color))];

  // Lọc danh sách màu dựa trên kích cỡ đã chọn
  const availableColors = selectedSize
    ? product.variants.filter((variant) => variant.size === selectedSize).map((variant) => variant.color)
    : allColors;

  // Lọc danh sách kích cỡ dựa trên màu đã chọn
  const availableSizes = selectedColor
    ? product.variants.filter((variant) => variant.color === selectedColor).map((variant) => variant.size)
    : allSizes;
  return (
    <div className={cx('product-container', 'css-1wpyz1n')}>
      <div className={cx('box-content-wrapper')}>
        <div className={cx('box-content', 'image-layout')}>
          <div
            className={cx('main-image-container')}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={`${PUBLIC_API_URL}${selectedImage}`}
              alt="Ảnh chính"
              className={cx('main-image', { zoom: isHovering })}
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              }}
            />
          </div>

          <div className={cx('thumbnail-container', 'thumbnail-right')}>
            {product?.images?.map((image, index) => (
              <img
                key={index}
                src={`${PUBLIC_API_URL}${image.fileName}`}
                alt={`Ảnh ${index}`}
                className={cx('thumbnail')}
                onClick={() => setSelectedImage(image.fileName)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={cx('side-wrapper')}>
        <div className={cx('box-side-container')}>
          <div className={cx('side-content-title')}>
            <div className={cx('pr2-sm', 'css-lou6bb2')}>
              <h1 className={cx('headline-2')}>{product?.productName}</h1>
              {/* <h2 className={cx('headline-5')}>Danh mục: {product?.category?.categoryName}</h2> */}
              <div className={cx('mb3-sm')}>
                <div className={cx('headline-5', 'mt-2', 'mt-3')}>
                  <div className={cx('product-price_wrapper')}>
                    <div className={cx('product-price')}>
                      {(selectedVariant || product?.variants[0])?.finalPrice !==
                      (selectedVariant || product?.variants[0])?.price ? (
                        <>
                          <span className={cx('discount-price')}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format((selectedVariant || product?.variants[0])?.finalPrice)}
                          </span>
                          <span className={cx('original-price')}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format((selectedVariant || product?.variants[0])?.price)}
                          </span>
                        </>
                      ) : (
                        <span className={cx('normal-price')}>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format((selectedVariant || product?.variants[0])?.price)}
                        </span>
                      )}
                    </div>

                    {/* Trạng thái sản phẩm */}
                    <div className={cx('product-status')}>
                      <span
                        className={cx('product-status-text', {
                          'in-stock': (selectedVariant || product?.variants[0])?.productStatus === 'AVAILABLE',
                          'out-of-stock': (selectedVariant || product?.variants[0])?.productStatus !== 'AVAILABLE',
                        })}
                      >
                        Trạng thái: {''}
                        {(selectedVariant || product?.variants[0])?.productStatus === 'AVAILABLE'
                          ? 'Còn hàng'
                          : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={cx('mt8-lg')}>
            <div className={cx('add-to-cart-form', 'buying-tools')}>
              <div className={cx('size-box-sm', 'size-box-lg')}>
                {/* Chọn kích cỡ */}
                <div className={cx('mt-5', 'mb3-sm', 'body-2')}>
                  <div className={cx('pt8-sm', 'headline-5')}>
                    <span className={cx('pr10-sm', 'sizeHeader')}>Chọn Kích Cỡ</span>
                  </div>
                  <div className={cx('mt2-sm')}>
                    {allSizes.map((size, index) => (
                      <button
                        key={index}
                        className={cx('size-option', {
                          selected: selectedSize === size,
                          disabled: selectedColor && !availableSizes.includes(size),
                        })}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                        disabled={selectedColor && !availableSizes.includes(size)}
                        style={{
                          padding: '10px 20px',
                          margin: '5px',
                          border: selectedSize === size ? '1px solid black' : '1px solid gray',
                          cursor: selectedColor && !availableSizes.includes(size) ? 'not-allowed' : 'pointer',
                          backgroundColor: selectedSize === size ? '#ddd' : '#fff',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn màu sắc */}
                <div className={cx('mt-5', 'mb3-sm', 'body-2')}>
                  <div className={cx('pt8-sm', 'headline-5')}>
                    <span className={cx('pr10-sm', 'sizeHeader')}>Chọn Màu Sắc</span>
                  </div>
                  <div className={cx('mt2-sm')}>
                    {allColors.map((color, index) => (
                      <button
                        key={index}
                        className={cx('color-option', {
                          selected: selectedColor === color,
                          disabled: selectedSize && !availableColors.includes(color),
                        })}
                        title={selectedColor === color ? `Màu đang chọn: ${color}` : color} // Thêm title khi hover
                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                        disabled={selectedSize && !availableColors.includes(color)}
                        style={{
                          backgroundColor: color,
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          cursor: selectedSize && !availableColors.includes(color) ? 'not-allowed' : 'pointer',
                          margin: '5px',
                          border: selectedColor === color ? '1px solid gray' : 'none',
                        }}
                      />
                    ))}
                  </div>

                  <div className={cx('quantity-selector')}>
                    <span>Số lượng</span>
                    <div className={cx('quantity-control')}>
                      {/* Nút giảm (-) */}
                      <button
                        onClick={() => setQuantity((prev) => Math.max(0, prev - 1))}
                        disabled={quantity <= 0} // Disable nếu quantity = 0
                      >
                        -
                      </button>

                      {/* Ô nhập số lượng */}
                      <input type="text" value={quantity} readOnly />

                      {/* Nút tăng (+) */}
                      <button
                        onClick={() => setQuantity((prev) => Math.min(selectedVariant?.stock || 0, prev + 1))}
                        disabled={quantity >= (selectedVariant?.stock || 0)} // Disable nếu vượt quá stock
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={cx('mt10-sm', 'mb6-sm', 'pr16-sm', 'pr10-lg', 'u-full-width', 'css-181b4yz')}>
                    <button className={cx('ncss-btn-primary-dark', 'btn-lg', 'add-to-cart-btn')}>Thêm vào giỏ</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={cx('Collapsible')}>
            {/* Phần tiêu đề "Mô tả" + Nút Toggle */}
            <div className={cx('trigger-content')} onClick={() => setCollapsed1(!collapsed1)}>
              <div className={cx('trigger-content_label')}>Mô tả</div>
              <button className={cx('trigger-content_icon')}>
                <FontAwesomeIcon icon={collapsed1 ? faChevronDown : faChevronUp} />
              </button>
            </div>

            {/* Phần mô tả, chỉ hiển thị khi mở rộng */}
            {!collapsed1 && (
              <div className={cx('pt6-sm', 'pr16-sm', 'pr10-lg')}>
                <div className={cx('description-preview', 'body-2', 'css-1pbvugb')}>
                  <p>{product?.describe}</p>
                  <p>
                    <strong>🔹 Nhãn hiệu:</strong> {product?.brand}
                  </p>
                  <p>
                    <strong>🔹 Chất liệu:</strong> {selectedVariant?.material || product?.variants[0]?.material}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={cx('Collapsible', collapsed ? '-is-collapsed' : '')}>
            {/* Header đánh giá */}
            <div className={cx('trigger-content')} onClick={() => setCollapsed(!collapsed)}>
              <div className={cx('trigger-content_label')}>
                <strong>Đánh giá ({product?.reviewCount || 0})</strong>
              </div>

              {/* Hiển thị sao trung bình */}
              <div className={cx('star-rating')}>
                {[...Array(5)].map((_, index) => {
                  let rating = product?.rating || 0;
                  let fullStars = Math.floor(rating);
                  let hasHalfStar = rating % 1 >= 0.1 && rating % 1 <= 0.4;
                  let isHalfStar = hasHalfStar && index === fullStars;

                  return (
                    <span key={index} className={cx('icon-star')}>
                      {index < fullStars ? (
                        <FontAwesomeIcon icon={faStar} />
                      ) : isHalfStar ? (
                        <FontAwesomeIcon icon={faStarHalfAlt} />
                      ) : (
                        <FontAwesomeIcon icon={faStar} className={cx('regular-star')} />
                      )}
                    </span>
                  );
                })}
              </div>

              {/* Nút mở rộng / thu gọn */}
              <div>
                {collapsed ? (
                  <button className={cx('trigger-content_icon', '-is-up')}>
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                ) : (
                  <button className={cx('trigger-content_icon', '-is-down')}>
                    <FontAwesomeIcon icon={faChevronUp} />
                  </button>
                )}
              </div>
            </div>

            {/* Nội dung đánh giá */}
            {!collapsed && (
              <div className={cx('content-box')}>
                {product?.feedbacks?.length > 0 ? (
                  product.feedbacks.map((feedback, index) => (
                    <div key={index} className={cx('feedback-item')}>
                      <div className={cx('feedback-header')}>
                        <strong>{feedback.user.fullName}</strong>
                        <span className={cx('feedback-rating')}>
                          {[...Array(5)].map((_, starIndex) => (
                            <FontAwesomeIcon
                              key={starIndex}
                              icon={faStar}
                              className={starIndex < feedback.rating ? '' : cx('regular-star')}
                            />
                          ))}
                        </span>
                      </div>
                      <p className={cx('feedback-text')}>{feedback.feedbackText}</p>
                    </div>
                  ))
                ) : (
                  <p className={cx('no-feedback')}>Chưa có đánh giá nào</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
