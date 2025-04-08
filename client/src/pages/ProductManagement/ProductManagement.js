import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faMagnifyingGlass, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Pagination } from 'antd';
import { Modal, Form, Input, Select, Button, message } from 'antd';

import { styled } from '@mui/material/styles';

const PUBLIC_API_URL = 'http://localhost:8080';

const cx = classNames.bind(styles);

function ProductManagement() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(['']);
  const [selectedVariants, setSelectedVariants] = useState({}); // Lưu trạng thái màu sắc được chọn cho từng sản phẩm

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category_ids, setCategory_ids] = useState([]);
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState(''); // Chất liệu
  const [size, setSize] = useState(''); // Kích cỡ
  const [brand, setBrand] = useState(''); // Nhãn hiệu
  const [pageSize, setPageSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [discount, setDiscount] = useState(0); // Phần trăm giảm giá
  const promotionalPrice = price || discount ? price - (price * discount) / 100 : 0;
  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef();
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleClickOpen = (product) => {
    if (product?.id) {
      setProduct(product);
      setName(product.productName);
      setDescription(product.describe);
      setPrice(product.price);
      setCategory_ids(product.category ? [product.category.id] : []);
      setColor(product.color || '');
      setMaterial(product.material || '');
      setSize(product.size || '');
      setBrand(product.brand || '');
      setImages(product.images || []); // Đặt ảnh hiện tại nếu sửa sản phẩm
    } else {
      resetForm(); // Đặt lại form nếu thêm sản phẩm mới
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const resetForm = () => {
    setProduct({});
    setName('');
    setDescription('');
    setPrice(null);
    setCategory_ids([]);
    setColor('');
    setMaterial('');
    setSize('');
    setBrand('');
    setImages([]); // Đặt lại mảng images thành rỗng
  };

  const handleChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchValue(searchValue);
  
    if (!searchValue.trim()) {
      // Nếu không có giá trị tìm kiếm, đặt pageSize về 3
      setPageSize(3);
    } else {
      // Nếu có giá trị tìm kiếm, hiển thị tất cả kết quả
      setPageSize(500);
    }
  
    setCurrentPage(1); // Đặt lại trang hiện tại về 1
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProductImages = async (productId) => {
    try {
      const response = await axios.get(`${PUBLIC_API_URL}/api/products/${productId}/images`);
      return response.data; // Trả về danh sách URL ảnh
    } catch (err) {
      console.error(`Error fetching images for product ${productId}:`, err.response?.data || err.message);
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${PUBLIC_API_URL}/api/products/get-all-product`),
        axios.get(`${PUBLIC_API_URL}/api/products/getAll`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const productsWithImages = await Promise.all(
        (productsRes.data.products || []).map(async (product) => {
          const images = await fetchProductImages(product.id);
          return { ...product, images, variants: product.variants || [] }; // Đảm bảo variants luôn là một mảng
        }),
      );

      setProducts(productsWithImages);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err.response?.data || err.message);
      message.error('Có lỗi xảy ra khi tải dữ liệu.');
    }
  };

  const handleClear = () => {
    setSearchValue('');
    inputRef.current.focus();
  };

  const calculatePromotionalPrice = (price, discountPercentage) => {
    if (!price || !discountPercentage || discountPercentage <= 0) {
      return price; // Nếu không có giảm giá, trả về giá gốc
    }
    return price - (price * discountPercentage) / 100;
  };

  const handleAddProduct = (product) => {
    const formData = new FormData();

    // Thêm thông tin sản phẩm vào FormData
    formData.append('productName', product.productName);
    formData.append('describe', product.describe);
    formData.append('price', product.price);
    formData.append('promotionalPrice', product.promotionalPrice);
    formData.append('categoryId', product.categoryId);
    formData.append('color', product.color);
    formData.append('size', product.size);
    formData.append('material', product.material);
    formData.append('brand', product.brand);

    // Thêm danh sách biến thể (variants) vào FormData
    if (Array.isArray(product.variants)) {
      product.variants.forEach((variant, index) => {
        formData.append(`variants[${index}].color`, variant.color);
        formData.append(`variants[${index}].size`, variant.size);
        formData.append(`variants[${index}].material`, variant.material);
        formData.append(`variants[${index}].price`, variant.price);
        formData.append(`variants[${index}].stock`, variant.stock); // Thêm stock
        formData.append(`variants[${index}].discountPercentage`, variant.discountPercentage);
        formData.append(`variants[${index}].promotionalPrice`, variant.promotionalPrice);
      });
    }

    // Thêm ảnh vào FormData
    if (images && images.length > 0) {
      images.forEach((image) => {
        if (image instanceof File) {
          formData.append('photos', image); // Gửi ảnh mới
        }
      });
    } else {
      formData.append('photos', ''); // Gửi key `photos` với giá trị rỗng nếu không có ảnh mới
    }

    // Gửi dữ liệu lên API
    axios
      .post(`${PUBLIC_API_URL}/api/products/addProductNew`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        message.success('Thêm sản phẩm thành công!');
        fetchProducts(); // Làm mới danh sách sản phẩm
      })
      .catch((err) => {
        console.error('Error adding product:', err.response?.data || err.message);
        message.error('Không thể thêm sản phẩm. Vui lòng thử lại!');
      });
  };

  const handleDeleteProduct = (product) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      content: `Sản phẩm: ${product.productName}`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        axios
          .delete(`${PUBLIC_API_URL}/api/products/deleteProduct/${product.id}`)
          .then(() => {
            message.success('Xóa sản phẩm thành công!');
            fetchProducts(); // Làm mới danh sách sản phẩm
          })
          .catch((err) => {
            console.error('Error deleting product:', err.response?.data || err.message);
            message.error('Không thể xóa sản phẩm. Vui lòng thử lại!');
          });
      },
      onCancel() {
        message.info('Hủy xóa sản phẩm.');
      },
    });
  };

  const handleSubmit = async () => {
    if (!name || !description || !category_ids.length) {
      message.error('Vui lòng điền đầy đủ thông tin sản phẩm.');
      return;
    }

    // Kiểm tra biến thể
    if (!product.variants || product.variants.length === 0) {
      message.error('Vui lòng thêm ít nhất một biến thể sản phẩm.');
      return;
    }

    const validatedVariants = product.variants.map((variant, index) => {
      const price = parseFloat(variant.price) || 0;
      const stock = parseInt(variant.stock, 10) || 0;
      const discountPercentage = parseFloat(variant.discountPercentage) || 0;

      if (price <= 0) {
        message.error(`Biến thể ${index + 1} có giá không hợp lệ.`);
        throw new Error('Invalid variant price');
      }

      if (stock < 0) {
        message.error(`Biến thể ${index + 1} có số lượng tồn kho không hợp lệ.`);
        throw new Error('Invalid variant stock');
      }

      return {
        ...variant,
        price,
        stock,
        discountPercentage,
      };
    });

    const productData = {
      id: product?.id || null,
      productName: name,
      describe: description,
      price: null, // Không cần giá ở cấp sản phẩm chính
      promotionalPrice,
      categoryId: category_ids[0],
      color,
      size,
      material,
      brand,
      images,
      variants: validatedVariants, // Sử dụng danh sách biến thể đã được kiểm tra
    };

    try {
      if (product?.id) {
        await handleUpdateProduct(productData);
      } else {
        await handleAddProduct(productData);
      }
      handleClose();
    } catch (err) {
      console.error('Error submitting product:', err.response?.data || err.message);
      message.error('Không thể thêm hoặc cập nhật sản phẩm. Vui lòng thử lại!');
    }
  };

  const handleUpdateProduct = (product) => {
    const formData = new FormData();

    // Thêm thông tin sản phẩm vào FormData
    formData.append('productName', product.productName);
    formData.append('describe', product.describe);
    formData.append('price', product.price);
    formData.append('promotionalPrice', product.promotionalPrice);
    formData.append('categoryId', product.categoryId);
    formData.append('color', product.color);
    formData.append('size', product.size);
    formData.append('material', product.material);
    formData.append('brand', product.brand);

    // Thêm danh sách biến thể (variants) vào FormData
    if (Array.isArray(product.variants)) {
      product.variants.forEach((variant, index) => {
        formData.append(`variants[${index}].color`, variant.color);
        formData.append(`variants[${index}].size`, variant.size);
        formData.append(`variants[${index}].material`, variant.material);
        formData.append(`variants[${index}].price`, variant.price);
        formData.append(`variants[${index}].stock`, variant.stock);
        formData.append(`variants[${index}].discountPercentage`, variant.discountPercentage);
        formData.append(`variants[${index}].promotionalPrice`, variant.promotionalPrice);
      });
    }

    if (images && images.length > 0) {
      images.forEach((image) => {
        if (image instanceof File) {
          formData.append('photos', image); // Gửi ảnh mới
        }
      });
    } else {
      formData.append('photos', ''); // Gửi key `photos` với giá trị rỗng nếu không có ảnh mới
    }

    // Gửi dữ liệu lên API
    axios
      .put(`${PUBLIC_API_URL}/api/products/updateProduct/${product.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        message.success('Cập nhật sản phẩm thành công!');
        fetchProducts(); // Làm mới danh sách sản phẩm
      })
      .catch((err) => {
        console.error('Error updating product:', err.response?.data || err.message);
        message.error('Không thể cập nhật sản phẩm. Vui lòng thử lại!');
      });
  };

  const handleVariantChange = (productId, variant) => {
    if (!variant) {
      message.error('Không tìm thấy biến thể phù hợp.');
      return;
    }
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const handleChangeImage = (files) => {
    const newImages = [...images, ...Array.from(files)]; // Thêm tất cả các tệp được chọn vào mảng `images`
    setImages(newImages);
  };

  // Hàm để xóa một ảnh khỏi danh sách
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index); // Loại bỏ ảnh tại vị trí index
    setImages(newImages);
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <Button type="primary" onClick={() => handleClickOpen()} className={cx('btn-add')}>
          Thêm sản phẩm
        </Button>
        <div className={cx('search-site')}>
          <button className={cx('search-btn')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <input
            ref={inputRef}
            className={cx('input-search')}
            name="text"
            placeholder="Vui lòng nhập thông tin tìm kiếm"
            type="search"
            value={searchValue}
            onChange={handleChange}
          />
          <button className={cx('clear')} onClick={handleClear}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>
        <Modal
          title={product?.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          open={open}
          onCancel={handleClose}
          onOk={handleSubmit}
          okText={product?.id ? 'Cập nhật' : 'Thêm'}
          cancelText="Hủy"
          width={900} // Đặt chiều rộng modal
        >
          <Form layout="vertical">
            {/* Tên sản phẩm */}
            <Form.Item label="Tên sản phẩm" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            {/* Mô tả sản phẩm */}
            <Form.Item label="Mô tả sản phẩm" required>
              <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả sản phẩm"
              />
            </Form.Item>

            {/* Danh mục */}
            <Form.Item label="Danh mục" required>
              <Select
                value={category_ids[0] || ''}
                onChange={(value) => setCategory_ids([value])}
                placeholder="Chọn danh mục"
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.categoryName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Nhãn hiệu */}
            <Form.Item label="Nhãn hiệu">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Nhập nhãn hiệu" />
            </Form.Item>

            {/* Ảnh */}
            <Form.Item label="Ảnh">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Hiển thị danh sách ảnh đã chọn */}
                {images.map((image, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{image instanceof File ? image.name : image}</span>
                    <Button danger onClick={() => handleRemoveImage(index)}>
                      Xóa
                    </Button>
                  </div>
                ))}

                {/* Input để tải lên nhiều ảnh */}
                <Button type="primary" onClick={() => document.getElementById('upload-images').click()}>
                  Upload file
                </Button>
                <input
                  id="upload-images"
                  type="file"
                  accept="image/*"
                  multiple // Cho phép chọn nhiều ảnh
                  style={{ display: 'none' }}
                  onChange={(e) => handleChangeImage(e.target.files)}
                />
              </div>
            </Form.Item>

            {/* Biến thể */}
            <Form.Item label="Biến thể">
              {[
                ...new Map(product.variants?.map((variant) => [`${variant.size}-${variant.color}`, variant])).values(),
              ].map((variant, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {/* Kích cỡ */}
                  <Form.Item label="Kích cỡ" style={{ marginBottom: 0 }}>
                    <Select
                      value={variant.size}
                      onChange={(value) => {
                        const newVariants = [...product.variants];
                        newVariants[index].size = value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                      placeholder="Chọn kích cỡ"
                      style={{ width: '100px' }}
                    >
                      <Select.Option value="S">S</Select.Option>
                      <Select.Option value="XS">XS</Select.Option>
                      <Select.Option value="M">M</Select.Option>
                      <Select.Option value="L">L</Select.Option>
                      <Select.Option value="XL">XL</Select.Option>
                      <Select.Option value="XXL">XXL</Select.Option>
                      <Select.Option value="XXXL">XXXL</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Màu sắc */}
                  <Form.Item label="Màu sắc" style={{ marginBottom: 0 }}>
                    <Select
                      value={variant.color}
                      onChange={(value) => {
                        const newVariants = [...product.variants];
                        newVariants[index].color = value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                      placeholder="Chọn màu sắc"
                      style={{ width: '120px' }}
                    >
                      <Select.Option value="red">Đỏ</Select.Option>
                      <Select.Option value="blue">Xanh</Select.Option>
                      <Select.Option value="green">Lục</Select.Option>
                      <Select.Option value="black">Đen</Select.Option>
                      <Select.Option value="white">Trắng</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Chất liệu */}
                  <Form.Item label="Chất liệu" style={{ marginBottom: 0 }}>
                    <Input
                      value={variant.material}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].material = e.target.value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                      placeholder="Nhập chất liệu"
                      style={{ width: '150px' }}
                    />
                  </Form.Item>

                  {/* Giá */}
                  <Form.Item label="Giá" style={{ marginBottom: 0 }}>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        const price = parseFloat(e.target.value) || 0;
                        newVariants[index].price = price;
                        newVariants[index].promotionalPrice = calculatePromotionalPrice(
                          price,
                          newVariants[index].discountPercentage,
                        );
                        setProduct({ ...product, variants: newVariants });
                      }}
                      placeholder="Nhập giá"
                      style={{ width: '100px' }}
                    />
                  </Form.Item>

                  {/* Giảm giá */}
                  <Form.Item label="Giảm giá (%)" style={{ marginBottom: 0 }}>
                    <Input
                      type="number"
                      value={variant.discountPercentage}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].discountPercentage = parseFloat(e.target.value) || 0;
                        setProduct({ ...product, variants: newVariants });
                      }}
                      placeholder="Nhập % giảm giá"
                      style={{ width: '100px' }}
                    />
                  </Form.Item>

                  {/* Tồn kho */}
                  <Form.Item label="Tồn kho" style={{ marginBottom: 0 }}>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].stock = parseInt(e.target.value, 10) || 0;
                        setProduct({ ...product, variants: newVariants });
                      }}
                      placeholder="Nhập tồn kho"
                      style={{ width: '100px' }}
                    />
                  </Form.Item>

                  {/* Nút Xóa */}
                  <Button
                    danger
                    onClick={() => {
                      const newVariants = product.variants.filter((_, i) => i !== index);
                      setProduct({ ...product, variants: newVariants });
                    }}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => {
                  const newVariants = [
                    ...(product.variants || []),
                    { color: '', size: '', price: 0, stock: 0, discountPercentage: 0, material: '' },
                  ];
                  setProduct({ ...product, variants: newVariants });
                }}
              >
                Thêm biến thể
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <div className={cx('table-site')}>
        <table className={cx('table')}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Mô tả</th>
              <th>Ảnh</th>
              <th>Giá</th>
              <th>Giá khuyến mãi</th>
              <th>Danh mục</th>
              <th>Kích cỡ - Màu sắc</th>
              <th>Chất liệu</th>
              <th>Nhãn hiệu</th>
              <th>Số lượng tồn kho</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts
                .filter((pro) => (pro.productName?.toLowerCase() || '').includes(searchValue))
                .map((pro, index) => {
                  const selectedVariant = selectedVariants[pro.id] || pro.variants[0] || {}; // Lấy biến thể đầu tiên nếu chưa chọn
                  return (
                    <tr key={pro.id}>
                      <td>{indexOfFirstProduct + index + 1}</td>
                      <td>{pro.productName}</td>
                      <td>{pro.describe}</td>
                      <td>
                        {pro.images && pro.images.length > 0 ? (
                          <img
                            src={`${PUBLIC_API_URL}${pro.images[0]}`}
                            alt="Product"
                            className={cx('product-image')}
                          />
                        ) : (
                          <p>Không có ảnh</p>
                        )}
                      </td>
                      <td>{selectedVariant.price || 'N/A'}đ</td>
                      <td>{selectedVariant.promotionalPrice || 'N/A'}đ</td>
                      <td>{pro.category ? pro.category.categoryName : 'Không có danh mục'}</td>
                      <td>
                        <Select
                          value={
                            selectedVariant.size && selectedVariant.color
                              ? `${selectedVariant.size}-${selectedVariant.color}`
                              : undefined
                          }
                          onChange={(value) => {
                            const variant = pro.variants.find((v) => `${v.size}-${v.color}` === value);
                            handleVariantChange(pro.id, variant);
                          }}
                          placeholder="Chọn kích cỡ - màu sắc"
                          style={{ width: '100%' }}
                          dropdownStyle={{ maxHeight: 200, overflow: 'auto' }} // Giới hạn chiều cao dropdown
                        >
                          {[
                            ...new Map(
                              pro.variants.map((variant) => [`${variant.size}-${variant.color}`, variant]),
                            ).values(),
                          ].map((variant) => (
                            <Select.Option
                              key={`${variant.size}-${variant.color}`}
                              value={`${variant.size}-${variant.color}`}
                            >
                              {variant.size} - {variant.color}
                            </Select.Option>
                          ))}
                        </Select>
                      </td>
                      <td>{selectedVariant.material || 'N/A'}</td>
                      <td>{pro.brand}</td>
                      <td>{selectedVariant.stock || 'N/A'}</td>
                      <td>
                        <div className={cx('wrapper-icon')}>
                          <FontAwesomeIcon
                            className={cx('icon-action')}
                            icon={faPencil}
                            onClick={() => handleClickOpen(pro)}
                          />
                          <FontAwesomeIcon
                            className={cx('icon-action')}
                            icon={faTrash}
                            onClick={() => handleDeleteProduct(pro)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="12" className={cx('no-data')}>
                  Không có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={products.length}
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
    </section>
  );
}

export default ProductManagement;
