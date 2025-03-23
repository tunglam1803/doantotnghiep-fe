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
import { FormControl, FormLabel, FormControlLabel, Checkbox, Box, IconButton } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import axios from 'axios';
import { DeleteFilled } from '@ant-design/icons';
import { message } from 'antd';

const PUBLIC_API_URL = 'http://localhost:8080';

const cx = classNames.bind(styles);

function ProductManagement() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([""]); 


  const [code, setCode] = useState('');
  const [name, setName] = useState();
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(null);
  const [brand_id, setBrand_id] = useState('');
  const [category_ids, setCategory_ids] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [color, setColor] = useState('');



  const handleClickOpen = (product) => {
    console.log(product);
    if (product.id) {
      setProduct(product);
      setCode(product.code);
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setBrand_id(product.brand.id);
      setCategory_ids(product.categories.map((category) => category.id));
      setSizes(product.sizes.map((size) => size.size));
      setColor(product.color);
      setImages(product.images.map((image) => image.attachment));
    } else {
      setProduct({});
      setCode('');
      setName('');
      setDescription('');
      setPrice(null);
      setBrand_id('');
      setCategory_ids([]);
      setSizes([]);
      setColor('');
      setImages([""]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {

    axios
      .get(`${PUBLIC_API_URL}/api/products`)
      .then((res) => {
        setProducts(res.data.data);
      })
      .catch((err) => console.log(err));

    axios
      .get(`${PUBLIC_API_URL}/open-api/v1/brand/get-all`)
      .then((res) => {
        setBrands(res.data.data);
      })
      .catch((err) => console.log(err));

    axios
      .get(`${PUBLIC_API_URL}/open-api/v1/category/get-all`)
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const handleAddProduct = (product) => {
    axios
      .post(`${PUBLIC_API_URL}/api/products/save`, product)
      .then((res) => {
        message.success(res.data.message)
        fetchProducts();
      })
      .catch((err) => {
        alert(err);
      });
  };

  const handleDeleteProduct = (product) => {
    axios
      .delete(`${PUBLIC_API_URL}/api/products/${product.id}`)
      .then(() => {
        message.success('Product deleted successfully');
        fetchProducts();
      })
      .catch((err) => console.log(err));
  };

  const handleSubmit = () => {
    const productData = {
      id: product ? product.id : null,
      code,
      name,
      description,
      price,
      brand_id,
      categories: category_ids,
      images,
      sizes,
      color,
    };

    console.log(productData);

    if (parseFloat(price) <= 0 || price == null) {
      alert('Price must be a number greater than 0.');
      return;
    }

    handleAddProduct(productData);
    handleClose();
  };


  const handleAddImage = () => {
    setImages([...images, ""]); // Add new empty input
  };

  const handleRemoveImage = (index) => {
    const newInputs = images.filter((_, i) => i !== index); // Remove by index
    setImages(newInputs);
  };

  const handleChange = (index, value) => {
    const newInputs = [...images];
    newInputs[index] = value;
    setImages(newInputs);
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={handleClickOpen} className={cx('btn-add')}>
          Thêm sản phẩm
        </button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{product.id ? 'Sửa sản phảm' : 'Thêm sản phẩm'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <div className={cx('container')}>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="name"
                    label="Tên sản phẩm"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <TextField
                    autoFocus
                    margin="dense"
                    id="code"
                    name="code"
                    label="Mã sản phẩm"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="price"
                    name="price"
                    label="Giá sản phẩm"
                    type="number"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="description"
                    name="description"
                    label="Mô tả sản phẩm"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className={cx('row-form')}>
                  <FormControl style={{ margin: '8px 0' }} variant="standard" sx={{ m: 1, minWidth: 248 }}>
                    <InputLabel id="type-label">Thương hiệu</InputLabel>
                    <Select
                      labelId="type-label"
                      id="brand_id"
                      name="brand_id"
                      value={brand_id}
                      onChange={(e) => setBrand_id(e.target.value)}
                      label="Danh mục giày"
                    >
                      {brands.map((brand) => {
                        return (<MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>)
                      })}
                    </Select>
                  </FormControl>
                  <FormControl style={{ margin: '8px 0' }} variant="standard" sx={{ m: 1, minWidth: 248 }}>
                    <InputLabel id="brand">Danh mục giày</InputLabel>
                    <Select
                      labelId="categories-label"
                      id="category_ids"
                      name="category_ids"
                      multiple
                      value={category_ids}
                      onChange={(e) => setCategory_ids(e.target.value)}
                      renderValue={(selected) =>
                        categories
                          .filter((category) => selected.includes(category.id))
                          .map((category) => category.name)
                          .join(', ')
                      }
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className={cx('row-form')}>
                  <FormControl style={{ margin: '8px 0' }} className={cx('size-grid')}>
                    <FormLabel id="size">Size</FormLabel>
                    <div className={cx('size-flex')}>
                      {Array.from({ length: 12 }, (_, i) => i + 34).map((size) => (
                        <FormControlLabel
                          key={size}
                          control={
                            <Checkbox
                              checked={sizes.includes(size)}
                              onChange={(e) => {
                                const updatedSizes = e.target.checked
                                  ? [...sizes, size]
                                  : sizes.filter((s) => s !== size);
                                setSizes(updatedSizes);
                              }}
                            />
                          }
                          label={size.toString()}
                        />
                      ))}
                    </div>
                  </FormControl>
                </div>
                <div className={cx('row-form')}>
                  <FormControl style={{ margin: '8px 0' }} variant="standard" sx={{ m: 1, minWidth: 248 }}>
                    <InputLabel id="Color">Màu</InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      label="color"
                    >
                      <MenuItem value={'black'}>black</MenuItem>
                      <MenuItem value={'blue'}>blue</MenuItem>
                      <MenuItem value={'brown'}>brown</MenuItem>
                      <MenuItem value={'green'}>green</MenuItem>
                      <MenuItem value={'grey'}>grey</MenuItem>
                      <MenuItem value={'multi-clour'}>multi-colour</MenuItem>
                      <MenuItem value={'orange'}>orange</MenuItem>
                      <MenuItem value={'pink'}>pink</MenuItem>
                      <MenuItem value={'purple'}>purple</MenuItem>
                      <MenuItem value={'red'}>red</MenuItem>
                      <MenuItem value={'white'}>white</MenuItem>
                      <MenuItem value={'yellow'}>yellow</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 441, marginTop: 1 }}>
                  {images.map((image, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        label={`Ảnh ${index + 1}`}
                        value={image}
                        onChange={(e) => handleChange(index, e.target.value)}
                        fullWidth
                      />
                      {images.length > 1 && (
                        <IconButton onClick={() => handleRemoveImage(index)} color="error">
                          <DeleteFilled />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              </div>
              <Button onClick={handleAddImage} style={{ padding: 0 }}>Thêm ảnh sản phẩm</Button>
            </DialogContent>
          </form>
          <DialogActions>
            <Button onClick={handleClose} >Hủy</Button>
            <Button
              onClick={handleSubmit}
            >
              {product.id ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={cx('table-site')}>
        <div className={cx('table')}>
          <div className={cx('table-grid')}>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>ID</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mã sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Tên sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mô tả sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Giá sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Thương hiệu</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Size</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Màu sản phẩm</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {products.map((pro) => {
            return (
              <div key={pro.id} className={cx('table-grid', 'item-grid')}>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.id}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.code}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.name}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.description}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.price}đ</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.brand.name}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.sizes.map((i) => i.size).sort().join(",")}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{pro.color}</p>
                </div>
                <div className={cx('item-site')}>
                  <div className={cx('wrapper-icon')}>
                    <FontAwesomeIcon
                      className={cx('icon-action')}
                      icon={faPencil}
                      onClick={() => {
                        handleClickOpen(pro);
                      }}
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
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductManagement;
