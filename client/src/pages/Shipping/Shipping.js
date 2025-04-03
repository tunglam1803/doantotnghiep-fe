import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Shipping.module.scss'; // Import CSS module
import { message } from 'antd';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Link } from 'react-router-dom';
import config from '~/config'; // Import config if needed

const Shipping = () => {
  const [shippingList, setShippingList] = useState([]);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false); // Trạng thái mở/đóng Dialog cập nhật
  const [currentShipping, setCurrentShipping] = useState({ id: null, fullName: '', address: '', phone: '' }); // Lưu thông tin địa chỉ cần cập nhật
  const [openAddDialog, setOpenAddDialog] = useState(false); // Trạng thái mở/đóng Dialog thêm
  const [newShipping, setNewShipping] = useState({ fullName: '', address: '', phone: '' });

  useEffect(() => {
    fetchShippingList();
  }, []);

  const fetchShippingList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ship/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Sắp xếp danh sách: Địa chỉ mặc định (default: true) sẽ ở đầu
      const sortedList = response.data.sort((a, b) => b.default - a.default);

      setShippingList(sortedList);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách shipping:', error);
    }
  };

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/; // Regex kiểm tra số điện thoại Việt Nam
    return phoneRegex.test(phone);
  };

  const handleAddShipping = async () => {
    if (!newShipping.fullName.trim() || !newShipping.address.trim() || !newShipping.phone.trim()) {
      message.error('Vui lòng điền đầy đủ thông tin trước khi thêm!');
      return;
    }

    if (!isValidPhoneNumber(newShipping.phone)) {
      message.error('Số điện thoại không hợp lệ!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/ship/save', newShipping, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShippingList([...shippingList, { ...newShipping, id: response.data }]);
      setNewShipping({ fullName: '', address: '', phone: '' }); // Reset form
      message.success('Thêm địa chỉ thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ giao hàng:', error);
      message.error('Lỗi khi thêm địa chỉ giao hàng!');
    }
    await fetchShippingList();
  };

  const handleUpdateShippingSubmit = async () => {
    if (!currentShipping.fullName.trim() || !currentShipping.address.trim() || !currentShipping.phone.trim()) {
      message.error('Vui lòng điền đầy đủ thông tin trước khi cập nhật!');
      return;
    }

    if (!isValidPhoneNumber(currentShipping.phone)) {
      message.error('Số điện thoại không hợp lệ!');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/ship/update/${currentShipping.id}`, currentShipping, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShippingList(
        shippingList.map((item) => (item.id === currentShipping.id ? { ...item, ...currentShipping } : item)),
      );
      message.success('Cập nhật địa chỉ thành công!');
      handleCloseUpdateDialog(); // Đóng Dialog sau khi cập nhật
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ giao hàng:', error);
      message.error('Lỗi khi cập nhật địa chỉ giao hàng!');
    }
    await fetchShippingList();
  };

  const setDefaultShipping = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/ship/default/${id}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Đã đặt địa chỉ mặc định thành công!');
      fetchShippingList(); // Cập nhật danh sách địa chỉ sau khi đặt mặc định
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      message.error('Không thể đặt địa chỉ mặc định. Vui lòng thử lại.');
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true); // Mở Dialog thêm
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false); // Đóng Dialog thêm
    setNewShipping({ fullName: '', address: '', phone: '' }); // Reset form
  };

  const handleDeleteShipping = async (id) => {
    // Hiển thị thông báo xác nhận
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?');
    if (!isConfirmed) {
      return; // Nếu người dùng không xác nhận, thoát khỏi hàm
    }

    try {
      await axios.delete(`http://localhost:8080/api/ship/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setShippingList(shippingList.filter((item) => item.id !== id));
    } catch (error) {
      message.error('Lỗi khi xóa địa chỉ giao hàng:', error);
    }
    await fetchShippingList();
  };

  const handleOpenUpdateDialog = (shipping) => {
    setCurrentShipping(shipping); // Lưu thông tin địa chỉ cần cập nhật
    setOpenUpdateDialog(true); // Mở Dialog cập nhật
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false); // Đóng Dialog cập nhật
    setCurrentShipping({ id: null, fullName: '', address: '', phone: '' }); // Reset thông tin
  };

  return (
    <div className={styles['shipping-container']}>
      <h2>Danh sách địa chỉ giao hàng</h2>
      <Button variant="outlined" onClick={handleOpenAddDialog} style={{ marginLeft: '10px' }}>
        Thêm địa chỉ mới
      </Button>
      {shippingList.length === 0 ? (
        <p>Không có địa chỉ nhận hàng</p> // Hiển thị thông báo khi danh sách trống
      ) : (
        <table className={styles['shipping-table']}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ mặc định</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {shippingList.map((ship, index) => (
              <tr key={ship.id}>
                <td>{index + 1}</td>
                <td>{ship.fullName}</td>
                <td>{ship.address}</td>
                <td>{ship.phone}</td>
                <td>{ship.default ? <span className={styles['default-label']}>X</span> : ''}</td>
                <td>
                  <button
                    className={styles['default-button']}
                    onClick={() => setDefaultShipping(ship.id)}
                    disabled={ship.default} // Vô hiệu hóa nếu đã là mặc định
                  >
                    {ship.default ? 'Mặc định' : 'Chọn làm mặc định'}
                  </button>
                  <button className={styles['delete-button']} onClick={() => handleDeleteShipping(ship.id)}>
                    Xóa
                  </button>
                  <button className={styles['update-button']} onClick={() => handleOpenUpdateDialog(ship)}>
                    Cập nhật
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to={config.routes.order}>
        <Button variant="outlined" style={{ marginLeft: '10px', marginTop: '20px' }}>
          Xác nhận địa chỉ
        </Button>
      </Link>

      <React.Fragment>
        <Dialog
          open={openUpdateDialog}
          onClose={handleCloseUpdateDialog}
          aria-labelledby="update-dialog-title"
          aria-describedby="update-dialog-description"
          sx={{ fontSize: '1.8rem' }}
        >
          <DialogTitle id="update-dialog-title" sx={{ fontSize: '1.8rem' }}>
            Cập nhật địa chỉ
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="update-dialog-description" sx={{ fontSize: '1.8rem' }}>
              Vui lòng chỉnh sửa thông tin địa chỉ.
            </DialogContentText>
            <TextField
              label="Họ và tên"
              value={currentShipping.fullName}
              onChange={(e) => setCurrentShipping({ ...currentShipping, fullName: e.target.value })}
              fullWidth
              margin="normal"
              sx={{ fontSize: '1.8rem' }}
            />
            <TextField
              label="Địa chỉ"
              value={currentShipping.address}
              onChange={(e) => setCurrentShipping({ ...currentShipping, address: e.target.value })}
              fullWidth
              margin="normal"
              sx={{ fontSize: '1.8rem' }}
            />
            <TextField
              label="Số điện thoại"
              value={currentShipping.phone}
              onChange={(e) => setCurrentShipping({ ...currentShipping, phone: e.target.value })}
              fullWidth
              margin="normal"
              sx={{ fontSize: '1.8rem' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateDialog}>Hủy</Button>
            <Button onClick={handleUpdateShippingSubmit} color="primary">
              Cập nhật
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          aria-labelledby="add-dialog-title"
          aria-describedby="add-dialog-description"
          sx={{ fontSize: '1.8rem' }}
        >
          <DialogTitle id="add-dialog-title" sx={{ fontSize: '1.8rem' }}>
            Thêm địa chỉ mới
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="add-dialog-description" sx={{ fontSize: '1.8rem' }}>
              Vui lòng điền thông tin địa chỉ mới.
            </DialogContentText>
            <TextField
              label="Họ và tên"
              value={newShipping.fullName}
              onChange={(e) => setNewShipping({ ...newShipping, fullName: e.target.value })}
              fullWidth
              margin="normal"
              sx={{ fontSize: '1.8rem' }}
            />
            <TextField
              label="Địa chỉ"
              value={newShipping.address}
              onChange={(e) => setNewShipping({ ...newShipping, address: e.target.value })}
              fullWidth
              margin="normal"
              sx={{ fontSize: '1.8rem' }}
            />
            <TextField
              label="Số điện thoại"
              value={newShipping.phone}
              onChange={(e) => setNewShipping({ ...newShipping, phone: e.target.value })}
              fullWidth
              margin="normal"
              sx={{ fontSize: '1.8rem' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Hủy</Button>
            <Button onClick={handleAddShipping} color="primary">
              Thêm
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </div>
  );
};

export default Shipping;
