import classNames from 'classnames/bind';
import styles from './AddBrand.module.scss';
import TextField from '@mui/material/TextField';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useState } from 'react';

const cx = classNames.bind(styles);

function AddProduct() {
  const [newProduct, setNewProduct] = useState({
    productid: '',
    name: '',
    price: '',
    type: '',
    styles: '',
    brand: '',
    supplier: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  return (
    <div className={cx('container')}>
      <div className={cx('row-form')}>
        <TextField
          autoFocus
          margin="dense"
          id="fullWidth"
          label="product"
          type="text"
          fullWidth
          variant="standard"
          value={newProduct.productid}
          onChange={handleChange}
        />
        <TextField
          autoFocus
          margin="dense"
          id="fullWidth"
          label="name"
          type="text"
          fullWidth
          variant="standard"
          value={newProduct.name}
          onChange={handleChange}
        />
      </div>
      <div className={cx('row-form')}>
        <TextField
          autoFocus
          margin="dense"
          id="fullWidth"
          label="price"
          type="number"
          fullWidth
          variant="standard"
          value={newProduct.price}
          onChange={handleChange}
        />
      </div>
      <TextField
        autoFocus
        margin="dense"
        id="fullWidth"
        label="type"
        type="text"
        fullWidth
        variant="standard"
        value={newProduct.type}
        onChange={handleChange}
      />
      <TextField
        autoFocus
        margin="dense"
        id="fullWidth"
        label="Style"
        type="text"
        fullWidth
        variant="standard"
        value={newProduct.style}
        onChange={handleChange}
      />
      <div className={cx('row-form')}>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Brand</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
            value={newProduct.brand}
            onChange={handleChange}
          >
            <FormControlLabel value="adidas" control={<Radio />} label="Adidas" />
            <FormControlLabel value="nike" control={<Radio />} label="Nike" />
            <FormControlLabel value="newbalance" control={<Radio />} label="New Balance" />
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );
}

export default AddProduct;
