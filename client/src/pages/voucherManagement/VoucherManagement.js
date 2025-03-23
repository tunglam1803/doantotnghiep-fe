import classNames from 'classnames/bind';
import styles from './VoucherManagement.module.scss';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import { FormControl } from '@mui/material';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import axios from 'axios';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { message } from 'antd';

const PUBLIC_API_URL = 'http://localhost:5252';





const cx = classNames.bind(styles);

function VoucherManagement() {
  const [open, setOpen] = useState(false);
  const [voucher, setVoucher] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [name, setName] = useState('');
  const [description, setDiscription] = useState('');
  const [discount, setDiscount] = useState(null);
  const [start_date, setStart_date] = useState(null);
  const [end_date, setEnd_date] = useState(null);
  const [products, setProducts] = useState([]);



  const handleClickOpen = (data) => {
    console.log(data);
    if (data.id) {
      setVoucher(data);
      setName(data.name);
      setDiscription(data.description);
      setDiscount(data.discount);
      setStart_date(dayjs(data.start_date));
      setEnd_date(dayjs(data.end_date));
      setProducts(data.products);
    } else {
      setVoucher({});
      setName('');
      setDiscription('');
      setDiscount(null);
      setStart_date(null);
      setEnd_date(null);
      setProducts([]);
    }
    setOpen(true);
  };


  const handleClose = () => {
    setOpen(false);
  };


  useEffect(() => {
    fetchPromotion();
  }, []);

  const fetchPromotion = () => {
    const req = {
      keyworrd: "",
      page: 1,
      size: 1000,
    }
    axios
      .post(`${PUBLIC_API_URL}/open-api/v1/promotions/get-promotion-by-filter`, req)
      .then((res) => {
        setVouchers(res.data.data.data);
      })
      .catch((err) => console.log(err));
  };

  const handleAddVoucher = (data) => {
    axios
      .post(`${PUBLIC_API_URL}/open-api/v1/promotions/save-promotion`, data)
      .then((res) => {
        message.success(res.data.message);
        fetchPromotion();
        handleClose();
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteInvoice = (data) => {
    axios
      .delete(`${PUBLIC_API_URL}/open-api/v1/promotions/delete-promotion/${data.id}`)
      .then((res) => {
        message.success(res.data.message);
        fetchPromotion();
      })
      .catch((err) => console.log(err));
  };

  const handleSubmit = () => {
    const data = {
      id: voucher.id ? voucher.id : null,
      name: name,
      description: description,
      discount: discount,
      start_date: dayjs(start_date).format('YYYY-MM-DD HH:mm:ss'),
      end_date: dayjs(end_date).format('YYYY-MM-DD HH:mm:ss'),
      products: products,
    };

    handleAddVoucher(data);
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={handleClickOpen} className={cx('btn-add')}>
          Thêm voucher
        </button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{voucher.id ? 'Cập nhật voucher' : 'Thêm mới voucher'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <div className={cx('container')}>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Tên khuyến mãi"
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
                    id="discount"
                    label="Phần trăm giảm giá"
                    type="number"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>

                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="description"
                    label="Mô tả"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={description}
                    onChange={(e) => setDiscription(e.target.value)}
                  />
                </div>

                <div className={cx('row-form')}>
                  <DateTimePicker 
                    label="Ngày bắt đầu" 
                    name="start_date" 
                    id="start_date"
                    value={start_date}
                    onChange={(date) => setStart_date(date)}
                    styles={{marginRight: '10px !important'}}
                  />
                  <DateTimePicker 
                    label="Ngày kết thúc"
                    id="end_date" 
                    name="end_date" 
                    value={end_date}
                    onChange={(date) => setEnd_date(date)}
                  />
                </div>

                <div className={cx('row-form')}>

                </div>
                <div className={cx('column-form')}>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-filled-label">Sản phẩm áp dụng</InputLabel>
                    <Select
                      labelId="demo-simple-select-filled-label"
                      id="demo-simple-select-standard-select"
                      value={products}
                      onChange={(e) => setProducts(e.target.value)}
                    >
                      <MenuItem value={'pending'}>Pending</MenuItem>
                      <MenuItem value={'draft'}>Draf</MenuItem>
                      <MenuItem value={'done'}>Done</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </DialogContent>
          </form>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              onClick={() => {
                handleSubmit();
                handleClose();
              }}
            >
              {voucher.id ? 'Cập nhật' : 'Thêm mới'}
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
              <h5 className={cx('row-title')}>Tên voucher</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Giảm giá</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Mô tả</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày bắt đầu</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày kết thúc</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Ngày tạo</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Hành động</h5>
            </div>
          </div>
          {vouchers.map((inv) => {
            return (
              <div key={inv.id} className={cx('table-grid', 'item-grid')}>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.id}</p>
                </div>
                <div className={cx('item-site1')}>
                  <p className={cx('item-content')}>{inv.name}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.discount}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.description}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.start_date}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.end_date}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.created_date}</p>
                </div>
                <div className={cx('item-site')}>
                  <div className={cx('wrapper-icon')}>
                    <FontAwesomeIcon
                      className={cx('icon-action')}
                      icon={faPencil}
                      onClick={() => {
                        handleClickOpen(inv);
                      }}
                    />
                    <FontAwesomeIcon
                      className={cx('icon-action')}
                      icon={faTrash}
                      onClick={() => handleDeleteInvoice(inv)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    </LocalizationProvider>
  );
}

export default VoucherManagement;
