import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { FormControl, InputLabel, MenuItem, Select, Box, IconButton } from '@mui/material';
import axios from 'axios';
import { DeleteFilled } from '@ant-design/icons';
import { message } from 'antd';
import { Pagination } from 'antd';

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
  const [price, setPrice] = useState(null);
  const [category_ids, setCategory_ids] = useState([]);
  const [color, setColor] = useState('');
  const [pageSize, setPageSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleClickOpen = (product) => {
    if (product?.id) {
      setProduct(product);
      setName(product.productName);
      setDescription(product.describe);
      setPrice(product.price);
      setCategory_ids(product.category ? [product.category.id] : []);
      setColor(product.color || '');
      setImages(product.images || []);
    } else {
      resetForm();
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
    setImages(['']);
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
          return { ...product, images }; // Gắn danh sách ảnh vào sản phẩm
        }),
      );

      setProducts(productsWithImages);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err.response?.data || err.message);
      message.error('Có lỗi xảy ra khi tải dữ liệu.');
    }
  };

  const handleAddProduct = (product) => {
    axios
      .post(`${PUBLIC_API_URL}/api/products/addProductNew`, product)
      .then(() => {
        message.success('Thêm sản phẩm thành công!');
        fetchProducts();
      })
      .catch((err) => {
        console.error('Error adding product:', err.response?.data || err.message);
        message.error('Không thể thêm sản phẩm. Vui lòng thử lại!');
      });
  };

  const handleDeleteProduct = (product) => {
    axios
      .delete(`${PUBLIC_API_URL}/api/products/deleteProduct/${product.id}`)
      .then(() => {
        message.success('Xóa sản phẩm thành công!');
        fetchProducts();
      })
      .catch((err) => {
        console.error('Error deleting product:', err.response?.data || err.message);
        message.error('Không thể xóa sản phẩm. Vui lòng thử lại!');
      });
  };

  const handleSubmit = () => {
    if (!name || !description || !category_ids.length) {
      message.error('Vui lòng điền đầy đủ thông tin sản phẩm.');
      return;
    }

    if (parseFloat(price) <= 0 || price == null) {
      message.error('Giá sản phẩm phải lớn hơn 0.');
      return;
    }

    const productData = {
      id: product?.id || null,
      productName: name,
      describe: description,
      price,
      categoryId: category_ids[0],
      color,
      images,
    };

    if (product?.id) {
      handleUpdateProduct(productData);
    } else {
      handleAddProduct(productData);
    }
    handleClose();
  };

  const handleUpdateProduct = (product) => {
    axios
      .put(`${PUBLIC_API_URL}/api/products/updateProduct/${product.id}`, product)
      .then(() => {
        message.success('Cập nhật sản phẩm thành công!');
        fetchProducts();
      })
      .catch((err) => {
        console.error('Error updating product:', err.response?.data || err.message);
        message.error('Không thể cập nhật sản phẩm. Vui lòng thử lại!');
      });
  };

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const handleChangeImage = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  // Hàm để xóa một ảnh khỏi danh sách
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  // Hàm để thêm một ảnh mới vào danh sách
  const handleAddImage = () => {
    setImages([...images, '']);
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={() => handleClickOpen()} className={cx('btn-add')}>
          Thêm sản phẩm
        </button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{product?.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <DialogContent>
            <div className={cx('container')}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Tên sản phẩm"
                type="text"
                fullWidth
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="dense"
                id="description"
                label="Mô tả sản phẩm"
                type="text"
                fullWidth
                variant="standard"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                margin="dense"
                id="price"
                label="Giá sản phẩm"
                type="number"
                fullWidth
                variant="standard"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Danh mục</InputLabel>
                <Select value={category_ids} onChange={(e) => setCategory_ids([e.target.value])}>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Màu sắc</InputLabel>
                <Select value={color} onChange={(e) => setColor(e.target.value)}>
                  <MenuItem value="red">Đỏ</MenuItem>
                  <MenuItem value="blue">Xanh</MenuItem>
                  <MenuItem value="green">Lục</MenuItem>
                  <MenuItem value="black">Đen</MenuItem>
                  <MenuItem value="white">Trắng</MenuItem>
                </Select>
              </FormControl>
              <Box>
                {images.map((image, index) => (
                  <Box key={index} display="flex" alignItems="center">
                    <TextField
                      label={`Ảnh ${index + 1}`}
                      value={image}
                      onChange={(e) => handleChangeImage(index, e.target.value)}
                      fullWidth
                    />
                    <IconButton onClick={() => handleRemoveImage(index)} color="error">
                      <DeleteFilled />
                    </IconButton>
                  </Box>
                ))}
                <Button onClick={handleAddImage}>Thêm ảnh</Button>
              </Box>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button onClick={handleSubmit}>{product?.id ? 'Cập nhật' : 'Thêm'}</Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={cx('table-site')}>
        <div className={cx('table')}>
          <div className={cx('table-grid')}>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>STT</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Tên sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mô tả</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ảnh</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Giá</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Giá khuyến mãi</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Danh mục</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Kích cỡ - Màu sắc</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Chất liệu</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Nhãn hiệu</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {currentProducts.length > 0 ? (
            currentProducts.map((pro, index) => {
              const selectedVariant = selectedVariants[pro.id] || pro.variants[0] || {}; // Lấy biến thể đầu tiên nếu chưa chọn
              return (
                <div key={pro.id} className={cx('table-grid', 'item-grid')}>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{indexOfFirstProduct + index + 1}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{pro.productName}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{pro.describe}</p>
                  </div>
                  <div className={cx('item-site')}>
                    {pro.images && pro.images.length > 0 ? (
                      <img src={`${PUBLIC_API_URL}${pro.images[0]}`} alt="Product" className={cx('product-image')} />
                    ) : (
                      <p>Không có ảnh</p>
                    )}
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{selectedVariant.price || 'N/A'}đ</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{selectedVariant.promotionalPrice || 'N/A'}đ</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>
                      {pro.category ? pro.category.categoryName : 'Không có danh mục'}
                    </p>
                  </div>
                  <div className={cx('item-site')}>
                    <select
                      value={
                        selectedVariant.size && selectedVariant.color
                          ? `${selectedVariant.size}-${selectedVariant.color}`
                          : ''
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          pro.id,
                          pro.variants.find((v) => `${v.size}-${v.color}` === e.target.value),
                        )
                      }
                    >
                      {pro.variants.map((variant) => (
                        <option key={`${variant.size}-${variant.color}`} value={`${variant.size}-${variant.color}`}>
                          {variant.size} - {variant.color}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{selectedVariant.material || 'N/A'}</p>
                  </div>
                  <div className={cx('item-site')}>
                    <p className={cx('item-content')}>{pro.brand}</p>
                  </div>
                  <div className={cx('item-site')}>
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
                  </div>
                </div>
              );
            })
          ) : (
            <p className={cx('no-data')}>Không có sản phẩm nào.</p>
          )}
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={products.length}
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
      </div>
    </section>
  );
}

export default ProductManagement;
