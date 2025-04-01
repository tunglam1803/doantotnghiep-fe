import classNames from 'classnames/bind';
import styles from './ProductManagement.module.scss';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faMagnifyingGlass, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { FormControl, InputLabel, MenuItem, Select, Box } from '@mui/material';
import axios from 'axios';
import { message } from 'antd';
import { Pagination } from 'antd';

import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
    setMaterial(''); // Đặt lại chất liệu
    setSize(''); // Đặt lại kích cỡ
    setBrand(''); // Đặt lại nhãn hiệu
    setImages(['']);
  };

  const handleChange = (e) => {
    setPageSize(1000000);
    setCurrentPage(1);
    const searchValue = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
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
    product.images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('photos', image); // API yêu cầu key là `photos`
      }
    });

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

  // const handleAddProduct = (product) => {
  //   const formData = new FormData();

  //   // Thêm thông tin sản phẩm vào FormData
  //   formData.append('productName', product.productName);
  //   formData.append('describe', product.describe);
  //   formData.append('price', product.price);
  //   formData.append('promotionalPrice', product.promotionalPrice);
  //   formData.append('categoryId', product.categoryId);
  //   formData.append('color', product.color);
  //   formData.append('size', product.size);
  //   formData.append('material', product.material);
  //   formData.append('brand', product.brand);

  //   // Thêm danh sách biến thể (variants) vào FormData
  //   if (Array.isArray(product.variants)) {
  //     product.variants.forEach((variant, index) => {
  //       formData.append(`variants[${index}].color`, variant.color);
  //       formData.append(`variants[${index}].size`, variant.size);
  //       formData.append(`variants[${index}].material`, variant.material);
  //       formData.append(`variants[${index}].price`, variant.price);
  //       formData.append(`variants[${index}].stock`, variant.stock);
  //       formData.append(`variants[${index}].discountPercentage`, variant.discountPercentage);
  //       formData.append(`variants[${index}].promotionalPrice`, variant.promotionalPrice);
  //     });
  //   }

  //   // Thêm ảnh vào FormData
  //   product.images.forEach((image, index) => {
  //     if (image instanceof File) {
  //       formData.append('photos', image); // API yêu cầu key là `photos`
  //     }
  //   });

  //   // Gửi dữ liệu lên API
  //   axios
  //     .post(`${PUBLIC_API_URL}/api/products/addProductNew`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     })
  //     .then((res) => {
  //       message.success('Thêm sản phẩm thành công!');
  //       fetchProducts(); // Làm mới danh sách sản phẩm
  //     })
  //     .catch((err) => {
  //       console.error('Error adding product:', err.response?.data || err.message);
  //       message.error('Không thể thêm sản phẩm. Vui lòng thử lại!');
  //     });
  // };

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

  // const handleAddVariant = (variant) => {
  //   axios
  //     .post(`${PUBLIC_API_URL}/api/products/${variant.id}/addVariant`, variant)
  //     .then(() => {
  //       message.success('Thêm biến thể thành công!');
  //       fetchProducts();
  //     })
  //     .catch((err) => {
  //       console.error('Error adding variant:', err.response?.data || err.message);
  //       message.error('Không thể thêm biến thể. Vui lòng thử lại!');
  //     });
  // };

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

  // const handleSubmit = async () => {
  //   if (!name || !description || !category_ids.length) {
  //     message.error('Vui lòng điền đầy đủ thông tin sản phẩm.');
  //     return;
  //   }

  //   if (parseFloat(price) <= 0 || price == null) {
  //     message.error('Giá sản phẩm phải lớn hơn 0.');
  //     return;
  //   }

  //   // Kiểm tra danh mục
  //   if (!category_ids[0]) {
  //     message.error('Vui lòng chọn danh mục.');
  //     return;
  //   }

  //   const productData = {
  //     id: product?.id || null,
  //     productName: name,
  //     describe: description,
  //     price,
  //     promotionalPrice,
  //     categoryId: category_ids[0],
  //     color,
  //     size,
  //     material,
  //     brand,
  //     images,
  //     variants: product?.variants || [], // Đảm bảo variants luôn là một mảng
  //   };

  //   try {
  //     if (product?.id) {
  //       if (product.productName !== name || product.describe !== description || product.price !== price) {
  //         await handleUpdateProduct(productData);
  //       } else {
  //         await handleAddVariant(productData);
  //       }
  //     } else {
  //       await handleAddProduct(productData);
  //     }
  //     handleClose();
  //   } catch (err) {
  //     console.error('Error submitting product:', err.response?.data || err.message);
  //     message.error('Không thể thêm hoặc cập nhật sản phẩm. Vui lòng thử lại!');
  //   }
  // };

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
        formData.append(`variants[${index}].stock`, variant.stock); // Thêm stock
        formData.append(`variants[${index}].discountPercentage`, variant.discountPercentage);
        formData.append(`variants[${index}].promotionalPrice`, variant.promotionalPrice);
      });
    }
  
    // Thêm ảnh vào FormData
    product.images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('photos', image); // API yêu cầu key là `photos`
      }
    });
  
    // Gửi dữ liệu lên API
    axios
      .put(`${PUBLIC_API_URL}/api/products/updateProduct/${product.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Đảm bảo gửi đúng định dạng
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

  const handleChangeImage = (index, file) => {
    const newImages = [...images];
    newImages[index] = file; // Lưu file vào mảng
    setImages(newImages);
  };

  // Hàm để xóa một ảnh khỏi danh sách
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index); // Loại bỏ ảnh tại vị trí index
    setImages(newImages);
  };

  // Hàm để thêm một ảnh mới vào danh sách
  const handleAddImage = () => {
    setImages([...images, '']); // Thêm một chuỗi rỗng vào mảng
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={() => handleClickOpen()} className={cx('btn-add')}>
          Thêm sản phẩm
        </button>
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
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{product?.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          <DialogContent>
            <div className={cx('container')}>
              {/* Tên sản phẩm */}
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

              {/* Mô tả sản phẩm */}
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

              {/* Giá sản phẩm */}
              {/* <TextField
                margin="dense"
                id="price"
                label="Giá sản phẩm"
                type="number"
                fullWidth
                variant="standard"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              /> */}

              {/* Giá khuyến mãi (tính theo phần trăm) */}
              {/* <TextField
                margin="dense"
                id="discount"
                label="Phần trăm giảm giá (%)"
                type="number"
                fullWidth
                variant="standard"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              /> */}

              {/* Danh mục */}
              <FormControl fullWidth margin="dense">
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={category_ids[0] || ''} // Đảm bảo giá trị mặc định là ''
                  onChange={(e) => setCategory_ids([e.target.value])}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Nhãn hiệu */}
              <TextField
                margin="dense"
                id="brand"
                label="Nhãn hiệu"
                type="text"
                fullWidth
                variant="standard"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />

              {/* Ảnh */}
              <Box>
                {images.map((image, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2}>
                    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                      Upload file
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleChangeImage(index, e.target.files[0])} // Lấy file từ input
                      />
                    </Button>
                    {image && <p>{image.name || 'Đã chọn ảnh'}</p>} {/* Hiển thị tên file */}
                    <Button variant="outlined" color="error" onClick={() => handleRemoveImage(index)}>
                      Xóa
                    </Button>
                  </Box>
                ))}
                <Button onClick={handleAddImage}>Thêm ảnh</Button>
              </Box>

              <Box>
                {product.variants?.map((variant, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={2}>
                    {/* Kích cỡ */}
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Kích cỡ</InputLabel>
                      <Select
                        value={variant.size}
                        onChange={(e) => {
                          const newVariants = [...product.variants];
                          newVariants[index].size = e.target.value;
                          setProduct({ ...product, variants: newVariants });
                        }}
                      >
                        <MenuItem value="S">S</MenuItem>
                        <MenuItem value="XS">XS</MenuItem>
                        <MenuItem value="M">M</MenuItem>
                        <MenuItem value="L">L</MenuItem>
                        <MenuItem value="XL">XL</MenuItem>
                        <MenuItem value="XXL">XXL</MenuItem>
                        <MenuItem value="XXXL">XXXL</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Màu sắc */}
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Màu sắc</InputLabel>
                      <Select
                        value={variant.color}
                        onChange={(e) => {
                          const newVariants = [...product.variants];
                          newVariants[index].color = e.target.value;
                          setProduct({ ...product, variants: newVariants });
                        }}
                      >
                        <MenuItem value="red">Đỏ</MenuItem>
                        <MenuItem value="blue">Xanh</MenuItem>
                        <MenuItem value="green">Lục</MenuItem>
                        <MenuItem value="black">Đen</MenuItem>
                        <MenuItem value="white">Trắng</MenuItem>
                        <MenuItem value="orange">Cam</MenuItem>
                        <MenuItem value="yellow">Vàng</MenuItem>
                        <MenuItem value="purple">Tím</MenuItem>
                        <MenuItem value="brown">Nâu</MenuItem>
                        <MenuItem value="gray">Xám</MenuItem>
                        <MenuItem value="pink">Hồng</MenuItem>
                        <MenuItem value="cyan">Lục lam</MenuItem>
                        <MenuItem value="magenta">Đỏ tươi</MenuItem>
                        <MenuItem value="beige">Be</MenuItem>
                        <MenuItem value="gold">Vàng kim</MenuItem>
                        <MenuItem value="silver">Bạc</MenuItem>
                        <MenuItem value="navy">Xanh nước biển</MenuItem>
                        <MenuItem value="teal">Xanh mòng két</MenuItem>
                        <MenuItem value="maroon">Nâu đỏ</MenuItem>
                        <MenuItem value="olive">Xanh ô liu</MenuItem>
                        <MenuItem value="indigo">Chàm</MenuItem>
                        <MenuItem value="violet">Tím violet</MenuItem>
                        <MenuItem value="turquoise">Ngọc lam</MenuItem>
                        <MenuItem value="lavender">Oải hương</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Chất liệu */}
                    <TextField
                      margin="dense"
                      id="material"
                      label="Chất liệu"
                      type="text"
                      fullWidth
                      variant="standard"
                      value={variant.material}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].material = e.target.value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                    />
                    {/* <TextField
                      label="Màu sắc"
                      value={variant.color}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].color = e.target.value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                    /> */}
                    {/* <TextField
                      label="Kích cỡ"
                      value={variant.size}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].size = e.target.value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                    /> */}

                    <TextField
                      label="Giá"
                      type="number"
                      id="price"
                      name="price"
                      fullWidth
                      variant="standard"
                      margin="dense"
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
                    />

                    <TextField
                      margin="dense"
                      id="discount"
                      label="Phần trăm giảm giá (%)"
                      type="number"
                      fullWidth
                      variant="standard"
                      value={variant.discountPercentage}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].discountPercentage = e.target.value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                    />

                    {/* Thêm trường nhập liệu cho stock */}
                    <TextField
                      label="Số lượng tồn kho"
                      type="number"
                      id="stock"
                      name="stock"
                      fullWidth
                      variant="standard"
                      margin="dense"
                      value={variant.stock}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        const stock = parseInt(e.target.value, 10) || 0; // Chuyển đổi giá trị nhập thành số nguyên
                        newVariants[index].stock = stock;
                        setProduct({ ...product, variants: newVariants });
                      }}
                    />

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        const newVariants = product.variants.filter((_, i) => i !== index);
                        setProduct({ ...product, variants: newVariants });
                      }}
                    >
                      Xóa
                    </Button>
                  </Box>
                ))}
                <Button
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
              <h5 className={cx('row-title')}>Số lượng tồn kho</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {currentProducts.length > 0 ? (
            currentProducts
              .filter((pro) => (pro.productName?.toLowerCase() || '').includes(searchValue))
              .map((pro, index) => {
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
                      <p className={cx('item-content')}>{selectedVariant.stock || 'N/A'}</p>
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
