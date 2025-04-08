/* eslint-disable react-hooks/exhaustive-deps */
import { faChevronDown, faChevronUp, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './productItem.module.scss';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCart } from '../Cart/CartProvider';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Modal, Input, Rate, message } from 'antd';

const cx = classNames.bind(styles);

const PUBLIC_API_URL = 'http://localhost:8080';
const MAX_VISIBLE_THUMBNAILS = 4;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function ProductItem() {
  const [collapsed, setCollapsed] = useState(true);
  const [collapsed1, setCollapsed1] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const { addToCart } = useCart();
  const { cart, setCart } = useCart();
  const [totalPrice, setTotalPrice] = useState(0);
  const { id } = useParams();
  const [open, setOpen] = React.useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [mediaUrls, setMediaUrls] = useState([]); // Khởi tạo mediaUrls là mảng rỗng

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // useEffect(() => {
  //   if (product?.id) {
  //     fetchFeedbacks(product.id);
  //   }
  // }, [product]);

  // const fetchFeedbacks = (productId) => {
  //   axios
  //     .get(`${PUBLIC_API_URL}/api/feedback/product/${productId}`)
  //     .then((res) => setFeedbacks(res.data))
  //     .catch((err) => console.error('Error fetching feedbacks:', err));
  // };

  // Fetch product details
  const fetchProduct = () => {
    axios
      .get(`${PUBLIC_API_URL}/api/products/getProductById/${id}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data?.images?.length > 0) {
          setSelectedImage(res.data.images[0].fileName);
        }
      })
      .catch((err) => console.error('Error fetching product:', err));
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.warn('Bạn chưa chưa đăng nhập!', 2);
        return;
      }

      const response = await axios.get(`${PUBLIC_API_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Cart Response:', response.data);

      setCart(response.data.items || []); // Update cart state
      setTotalPrice(response.data.totalPrice || 0); // Update total price
    } catch (error) {
      console.error('Error fetching cart:', error);
      message.error('Không thể tải giỏ hàng. Vui lòng thử lại sau.', 2);
    }
  };

  // Update selectedVariant when size and color are selected
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = product?.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSize, selectedColor, product]);

  // Reset size if the selected color makes the size invalid
  useEffect(() => {
    if (selectedColor && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
  }, [selectedColor]);

  // Reset color if the selected size makes the color invalid
  useEffect(() => {
    if (selectedSize && !availableColors.includes(selectedColor)) {
      setSelectedColor(null);
    }
  }, [selectedSize]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleFileChange = (event) => {
    const files = event.target.files;
    const previewUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho ảnh
      previewUrls.push(previewUrl);
    }

    setMediaUrls(previewUrls); // Cập nhật danh sách URL xem trước
  };

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    // Thêm các thông tin đánh giá khác vào formData
    formData.append('productId', product.id); // ID sản phẩm
    formData.append('feedbackText', feedbackText); // Nội dung đánh giá
    formData.append('rating', rating); // Số sao đánh giá

    // Thêm file vào formData
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput?.files) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
      }
    }

    try {
      // Gửi yêu cầu đến API /api/feedback/add
      const response = await axios.post(`${PUBLIC_API_URL}/api/feedback/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Thêm token nếu cần
        },
      });

      // Cập nhật danh sách feedback sau khi gửi thành công
      setFeedbacks((prev) => [...prev, response.data]);
      setFeedbackText(''); // Reset form
      setRating(0); // Reset đánh giá
      setMediaUrls([]); // Reset danh sách URL ảnh
      message.success('Đánh giá của bạn đã được gửi thành công!', 2);
      setOpen(false); // Đóng dialog
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Gửi đánh giá thất bại!', 2);
    }
  };

  const handleTryOn = () => {
    Modal.confirm({
      title: 'Xác nhận thử quần áo',
      content: (
        <div>
          <p>Để thử quần áo, bạn cần tải ảnh quần áo không có người mẫu về trước.</p>
          <p>Bạn có chắc chắn muốn tiếp tục không?</p>
        </div>
      ),
      okText: 'Tiếp tục',
      cancelText: 'Hủy',
      onOk() {
        const tryOnUrl = 'https://zhengchong-catvton.hf.space'; // URL của ứng dụng thử quần áo
        window.open(tryOnUrl, '_blank'); // Mở ứng dụng trong tab mới
      },
      onCancel() {
        message.info('Hãy tải ảnh trước khi thử quần áo.', 2);
      },
    });
  };

  // Extract all sizes and colors from variants
  const allSizes = [...new Set(product.variants.map((variant) => variant.size))];
  const allColors = [...new Set(product.variants.map((variant) => variant.color))];

  // Filter available sizes and colors based on the current selection
  const availableSizes = selectedColor
    ? product.variants.filter((variant) => variant.color === selectedColor).map((variant) => variant.size)
    : allSizes;

  const availableColors = selectedSize
    ? product.variants.filter((variant) => variant.size === selectedSize).map((variant) => variant.color)
    : allColors;

  // Handle mouse movement for zoom effect
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientX - top) / height) * 100,
    });
  };

  // Handle thumbnail scrolling
  const handleScrollUp = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  const handleScrollDown = () => {
    if (startIndex + MAX_VISIBLE_THUMBNAILS < product.images.length) {
      setStartIndex(startIndex + 1);
    }
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!selectedColor) {
      message.error('Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!', 2);
      return;
    }

    if (!selectedSize) {
      message.error('Vui lòng chọn kích cỡ trước khi thêm vào giỏ hàng!', 2);
      return;
    }

    if (quantity <= 0) {
      message.error('Vui lòng chọn số lượng sản phẩm!', 2);
      return;
    }

    try {
      const response = await addToCart(selectedVariant.id, quantity);

      // Kiểm tra phản hồi từ API
      if (response && response.success) {
        message.success(response.message || 'Thêm vào giỏ hàng thành công!', 2);
        await fetchCart(); // Cập nhật giỏ hàng
      } else {
        message.error(response?.message || 'Thêm vào giỏ hàng thất bại!', 2);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Đã xảy ra lỗi khi thêm vào giỏ hàng!', 2);
    }
  };
  return (
    <div className={cx('product-container', 'css-1wpyz1n')}>
      <div className={cx('box-content-wrapper')}>
        <div className={cx('box-content', 'image-layout')}>
          {/* Ảnh chính */}
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

          {/* Danh sách thumbnail */}
          <div className={cx('thumbnail-container', 'thumbnail-right')}>
            {/* Nút cuộn lên */}
            {product.images.length > MAX_VISIBLE_THUMBNAILS && (
              <button className={cx('scroll-btn')} onClick={handleScrollUp}>
                <FontAwesomeIcon icon={faChevronUp} />
              </button>
            )}

            {/* Hiển thị ảnh thu nhỏ */}
            {product.images.slice(startIndex, startIndex + MAX_VISIBLE_THUMBNAILS).map((image, index) => (
              <img
                key={image.id}
                src={`${PUBLIC_API_URL}${image.fileName}`}
                alt={`Ảnh ${index}`}
                className={cx('thumbnail')}
                onClick={() => setSelectedImage(image.fileName)}
              />
            ))}

            {/* Nút cuộn xuống */}
            {product.images.length > MAX_VISIBLE_THUMBNAILS && (
              <button className={cx('scroll-btn')} onClick={handleScrollDown}>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
            )}
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
                        onClick={() => {
                          setSelectedColor(selectedColor === color ? null : color);
                        }}
                        disabled={selectedSize && !availableColors.includes(color)}
                        style={{
                          backgroundColor: color,
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          cursor: selectedSize && !availableColors.includes(color) ? 'not-allowed' : 'pointer',
                          margin: '5px',
                          border: selectedColor === color ? '1px solid #000' : '1px solid #999',
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
                <div className={cx('action-buttons')}>
                  <div className={cx('mt10-sm', 'mb6-sm', 'pr16-sm', 'pr10-lg', 'u-full-width', 'css-181b4yz')}>
                    <button
                      className={cx('ncss-btn-primary-dark', 'btn-lg', 'add-to-cart-btn')}
                      onClick={handleAddToCart}
                      // disabled={!selectedVariant || quantity <= 0}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                  <div className={cx('mt10-sm', 'mb6-sm', 'pr16-sm', 'pr10-lg', 'u-full-width', 'css-181b4yz')}>
                    <button className={cx('ncss-btn-secondary-light', 'btn-lg', 'try-on-btn')} onClick={handleTryOn}>
                      Thử quần áo
                    </button>
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

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>({product?.rating || 0})</span>

                {/* Hiển thị sao trung bình */}
                <div className={cx('star-rating')}>
                  {[...Array(5)].map((_, index) => {
                    let rating = product?.rating || 0;
                    let fullStars = Math.floor(rating);
                    let hasHalfStar = rating % 1 >= 0.1 && rating % 1 <= 0.4;
                    let isHalfStar = hasHalfStar && index === fullStars;

                    return (
                      <div>
                        <span key={index} className={cx('icon-star')}>
                          {index < fullStars ? (
                            <FontAwesomeIcon icon={faStar} style={{ color: 'gold' }} />
                          ) : isHalfStar ? (
                            <FontAwesomeIcon icon={faStarHalfAlt} style={{ color: 'gold' }} />
                          ) : (
                            <FontAwesomeIcon icon={faStar} className={cx('regular-star')} />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
                              style={{ color: starIndex < feedback.rating ? 'gold' : 'gray' }}
                              className={starIndex < feedback.rating ? '' : cx('regular-star')}
                            />
                          ))}
                        </span>
                      </div>
                      <p className={cx('feedback-text')}>{feedback.feedbackText}</p>
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {Array.isArray(feedback.mediaUrls) &&
                            feedback.mediaUrls.map((url, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={`${PUBLIC_API_URL}${url}`} // Hiển thị ảnh từ server
                                alt={`Ảnh feedback ${imgIndex + 1}`} // Mô tả ngắn gọn và cụ thể
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={cx('no-feedback')}>Chưa có đánh giá nào</p>
                )}
                <React.Fragment>
                  <Button onClick={handleClickOpen} variant="contained" color="primary">
                    Tạo đánh giá
                  </Button>
                  <Modal
                    title="Đánh giá"
                    open={open}
                    onCancel={handleClose}
                    onOk={handleSubmitFeedback}
                    okText="Gửi đánh giá"
                    cancelText="Hủy"
                  >
                    <p>Vui lòng nhập thông tin đánh giá của bạn</p>
                    <Input.TextArea
                      rows={4}
                      placeholder="Nội dung đánh giá"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <p style={{ marginTop: '16px' }}>Tải ảnh lên</p>
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      style={{ marginTop: '8px' }}
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload files
                      <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} />
                    </Button>
                    <div style={{ marginTop: '16px' }}>
                      <strong>Ảnh đã tải lên:</strong>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {Array.isArray(mediaUrls) &&
                          mediaUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url.startsWith('blob:') ? url : `${PUBLIC_API_URL}/data/${url}`} // Kiểm tra URL tạm thời hoặc từ server
                              alt={`Uploaded ${index}`}
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          ))}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'left',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '16px',
                      }}
                    >
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Đánh giá:</span>
                      <Rate value={rating} onChange={(value) => setRating(value)} />
                    </div>
                  </Modal>
                </React.Fragment>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
