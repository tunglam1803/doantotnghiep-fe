import classNames from 'classnames/bind';
import styles from './OrderManagement.module.scss';

import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
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

const PUBLIC_API_URL = 'http://localhost:2000';

const cx = classNames.bind(styles);

function OrderManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoice] = useState([]);

  const [invoiceEmpNo, setInvoiceEmpNo] = useState();
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceTotal, setInvoiceTotal] = useState('');
  const [invoicePayment, setInoicePayment] = useState('');
  const [invoiceCus, setInvoiceCus] = useState('');
  // const [invoiceItems, setInvoiceItems] = useState('');

  const inputRef = useRef();

  const handleClear = () => {
    setSearchValue('');
    inputRef.current.focus();
  };

  const handleChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue);
    }
  };

  useEffect(() => {
    const filteredInvoices = invoices.filter((inv) =>
      Object.values(inv).some(
        (value) => value && typeof value === 'string' && value.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
    setFilteredInvoice(filteredInvoices);
  }, [searchValue, invoices]);

  const handleClickOpen = (invoice) => {
    if (invoice.id) {
      setInvoice(invoice);
      setInvoiceEmpNo(invoice.empNo);
      setInvoiceStatus(invoice.status);
      setInvoiceDate(invoice.data);
      setInoicePayment(invoice.payment);
      setInvoiceCus(invoice.customer);
      // setInvoiceItems(invoice.items);
    } else {
      setInvoice({});
      setInvoiceEmpNo('');
      setInvoiceStatus('');
      setInvoiceDate('');
      setInoicePayment('');
      setInvoiceCus('');
      // setInvoiceItems('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    axios
      .get(`${PUBLIC_API_URL}/api/invoices`)
      .then((res) => setInvoices(res.data.invoices))
      .catch((err) => console.log(err));
  };

  const handleAddInvoice = (newInvoice) => {
    axios
      .post(`${PUBLIC_API_URL}/api/invoices`, newInvoice)
      .then(() => {
        fetchInvoices();
        handleClose();
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateInvoice = (invoice) => {
    axios
      .put(`${PUBLIC_API_URL}/api/invoices/${invoice.id}`, invoice)
      .then(() => {
        fetchInvoices();
        handleClose();
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteInvoice = (invoice) => {
    axios
      .delete(`${PUBLIC_API_URL}/api/invoices/${invoice.id}`)
      .then(() => {
        fetchInvoices();
      })
      .catch((err) => console.log(err));
  };

  const handleSubmit = () => {
    const invoiceData = {
      empNo: invoiceEmpNo,
      status: invoiceStatus,
      date: invoiceDate,
      payment: invoicePayment,
      customer: invoiceCus,
      // items: invoiceItems,
    };

    console.log(invoiceData);

    if (
      invoiceEmpNo.trim() === '' ||
      invoiceStatus.trim() === '' ||
      invoiceDate.trim() === '' ||
      invoicePayment.trim() === '' ||
      invoiceCus.trim() === ''
      // invoiceItems.trim() === ''
    ) {
      console.log('Please fill in all invoice information.');
      return;
    }

    if (invoice.id) {
      const updatedinvoice = { ...invoice, ...invoiceData };
      handleUpdateInvoice(updatedinvoice);
    } else {
      handleAddInvoice(invoiceData);
    }

    handleClose();
  };

  return (
    <section className={cx('wrapper')}>
      <div className={cx('function-site')}>
        <button variant="outlined" onClick={handleClickOpen} className={cx('btn-add')}>
          ADD
        </button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{invoice.id ? 'Edit Invoice' : 'Add Invoice'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <div className={cx('container')}>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="Date"
                    label="Product name"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="Date"
                    label="Date"
                    type="date"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="price"
                    label="empNo"
                    type="number"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={invoiceEmpNo}
                    onChange={(e) => setInvoiceEmpNo(e.target.value)}
                  />
                </div>
                <div className={cx('column-form')}>
                  <talbe className={cx('talbe-form')}>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <FormControl variant="standard">
                            <Select labelId="demo-customized-select-label" id="demo-customized-select">
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              <MenuItem value={10}>Ten</MenuItem>
                              <MenuItem value={20}>Twenty</MenuItem>
                              <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                          </FormControl>
                        </td>
                        <td>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="price"
                            label=""
                            type="number"
                            fullWidth
                            variant="standard"
                          />
                        </td>
                        <td>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="price"
                            label=""
                            type="number"
                            fullWidth
                            variant="standard"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </talbe>
                </div>
                <div className={cx('row-form')}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="quantity"
                    label="Total"
                    type="number"
                    fullWidth
                    variant="standard"
                    autoComplete="on"
                    value={invoiceTotal}
                    onChange={(e) => setInvoiceTotal(e.target.value)}
                  />
                </div>
                <div className={cx('column-form')}>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-filled-label">Status</InputLabel>
                    <Select
                      labelId="demo-simple-select-filled-label"
                      id="demo-simple-select-standard-select"
                      value={invoiceStatus}
                      onChange={(e) => setInvoiceStatus(e.target.value)}
                    >
                      <MenuItem value={'pending'}>Pending</MenuItem>
                      <MenuItem value={'draft'}>Draf</MenuItem>
                      <MenuItem value={'done'}>Done</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-filled-label">Payment</InputLabel>
                    <Select
                      labelId="demo-simple-select-filled-label"
                      id="demo-simple-select-standard-select"
                      value={invoicePayment}
                      onChange={(e) => setInoicePayment(e.target.value)}
                    >
                      <MenuItem value={'paid'}>Paid</MenuItem>
                      <MenuItem value={'unpaid'}>Unpaid</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </DialogContent>
          </form>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={() => {
                handleSubmit();
                handleClose();
              }}
            >
              {invoice.id ? 'Update Entry' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
        <div className={cx('search-site')}>
          <button className={cx('search-btn')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <input
            ref={inputRef}
            className={cx('input-search')}
            name="text"
            placeholder="Search..."
            type="search"
            value={searchValue}
            onChange={handleChange}
          />
          <button className={cx('clear')} onClick={handleClear}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>
      </div>
      <div className={cx('table-site')}>
        <div className={cx('table')}>
          <div className={cx('table-grid')}>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Invoice ID</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Date</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Employee</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Total</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Status</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Payment</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Customer</h5>
            </div>
            <div className={cx('row-site')}>
              <h5 className={cx('row-title')}>Actions</h5>
            </div>
          </div>
          {filteredInvoices.map((inv) => {
            return (
              <div key={inv.id} className={cx('table-grid', 'item-grid')}>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.id}</p>
                </div>
                <div className={cx('item-site1')}>
                  <p className={cx('item-content')}>{inv.date}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.empNo}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.total}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.status}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.payment}</p>
                </div>
                <div className={cx('item-site')}>
                  <p className={cx('item-content')}>{inv.customer}</p>
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
  );
}

export default OrderManagement;
