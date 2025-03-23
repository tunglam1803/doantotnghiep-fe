import classNames from 'classnames/bind';
import styles from './CreatedOrUpdatedBrand.module.scss';
import TextField from '@mui/material/TextField';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

function CreatedOrUpdatedBrand({ handleCreatedOrUpdated, handleClose, selectedBrand, isEditing, btn }) {
  const [name, setName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [image_path, setImagePath] = useState('');
  const [description, setDescription] = useState('');
  const data = {
    id: isEditing ? selectedBrand.id : null,
    name,
    phone_number,
    address,
    image_path,
    description,
  }
  useEffect(() => {
    if (isEditing) {
      setName(selectedBrand.name);
      setPhoneNumber(selectedBrand.phone_number);
      setAddress(selectedBrand.address);
      setImagePath(selectedBrand.image_path);
      setDescription(selectedBrand.description);
    }
  }, [isEditing, selectedBrand]);
  return (
    <>
      <DialogTitle>Thêm thương hiệu</DialogTitle>
      <DialogContent>
        <div className={cx('container')}>
          <div className={cx('row-form')}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Tên thương hiệu"
              value={name}
              placeholder="Tên thương hiệu"
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              autoFocus
              margin="dense"
              id="phone_number"
              label="Số điện thoại"
              name="phone_number"
              placeholder="Số điện thoại"
              type="text"
              value={phone_number}
              fullWidth
              variant="standard"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className={cx('row-form')}>
            <TextField
              autoFocus
              margin="dense"
              id="address"
              name="address"
              label="Địa chỉ"
              value={address}
              type="text"
              placeholder="Địa chỉ"
              fullWidth
              variant="standard"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <TextField
            autoFocus
            margin="dense"
            id="image_path"
            name="image_path"
            label="Logo"
            placeholder="Logo"
            type="text"
            fullWidth
            value={image_path}
            variant="standard"
            onChange={(e) => setImagePath(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="description"
            label="Mô tả"
            name="description"
            placeholder="Mô tả"
            type="text"
            fullWidth
            value={description}
            variant="standard"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>Hủy</Button>
        <Button variant="contained" onClick={() => handleCreatedOrUpdated(data)}>{btn}</Button>
      </DialogActions>
    </>
  );
}

export default CreatedOrUpdatedBrand;
