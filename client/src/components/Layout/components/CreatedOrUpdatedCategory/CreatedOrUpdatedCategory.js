import classNames from 'classnames/bind';
import styles from './CreatedOrUpdatedCategory.module.scss';
import TextField from '@mui/material/TextField';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
// import { Select } from 'antd';

const cx = classNames.bind(styles);

function CreatedOrUpdatedCategory(
  { handleCreatedOrUpdated, handleClose, selectedCategory, isEditing, btn, brand }
) {
  const [categoryName, setCategoryName] = useState('');
  const [gender, setGender] = useState('');
  const [description, setDescription] = useState('');
  const [is_deleted, setIs_deleted] = useState('');
  const data = {
    id: isEditing ? selectedCategory.id : null,
    categoryName,
    gender,
    description,
    is_deleted,
  }
  useEffect(() => {
    if (isEditing) {
      setCategoryName(selectedCategory.categoryName);
      setGender(selectedCategory.gender);
      setDescription(selectedCategory.description);
      setIs_deleted(selectedCategory.is_deleted);
    }
  }, [isEditing, selectedCategory]);

  console.log(selectedCategory)

  return (
    <>
      <DialogTitle sx={{ fontSize: '2rem' }}>Thêm danh mục</DialogTitle>
      <DialogContent>
        <div className={cx('container')}>
          <div className={cx('row-form')}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              value={categoryName}
              placeholder="Tên danh mục"
              label="Tên danh mục"
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => setCategoryName(e.target.value)}
              InputProps={{
                style: { fontSize: '2rem' }, // Đồng bộ với DialogTitle
              }}
              InputLabelProps={{
                style: { fontSize: '2rem' }, // Đồng bộ với DialogTitle
              }}
            />
          </div>
          <div className={cx('row-form')}>
            <TextField
              autoFocus
              margin="dense"
              id="description"
              name="description"
              placeholder="Mô tả"
              label="Mô tả"
              type="text"
              fullWidth
              value={description}
              variant="standard"
              InputProps={{
                style: { fontSize: '2rem' }, // Đồng bộ với DialogTitle
              }}
              InputLabelProps={{
                style: { fontSize: '2rem' }, // Đồng bộ với DialogTitle
              }}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className={cx('row-form')}>
            <TextField
              autoFocus
              margin="dense"
              id="Gioitinh"
              name="Gioitinh"
              placeholder="Giới tính"
              label="Giới tính"
              type="text"
              fullWidth
              value={gender}
              variant="standard"
              InputProps={{
                style: { fontSize: '2rem' }, // Đồng bộ với DialogTitle
              }}
              InputLabelProps={{
                style: { fontSize: '2rem' }, // Đồng bộ với DialogTitle
              }}
              onChange={(e) => setGender(e.target.value)}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>Hủy</Button>
        <Button variant="contained" onClick={() => handleCreatedOrUpdated(data)}>{btn}</Button>
      </DialogActions>
    </>
  );
}

export default CreatedOrUpdatedCategory;
