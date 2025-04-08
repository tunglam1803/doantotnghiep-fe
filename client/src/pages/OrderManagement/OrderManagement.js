import classNames from 'classnames/bind';
import styles from './OrderManagement.module.scss';

import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, Input, Select, Table, message } from 'antd';
import axios from 'axios';

const { Option } = Select;
const cx = classNames.bind(styles);

const PUBLIC_API_URL = 'http://localhost:8080';

function OrderManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderPaymentStatus, setOrderPaymentStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  const inputRef = useRef();

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios
      .get(`${PUBLIC_API_URL}/api/orders/getOrderHistory/1`) // Thay `1` bằng userId động nếu cần
      .then((res) => {
        setOrders(res.data); // Lưu dữ liệu từ API vào state
        setFilteredOrders(res.data); // Lưu dữ liệu để tìm kiếm
      })
      .catch((err) => console.error('Error fetching orders:', err));
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
  
    const filtered = orders.filter((order) =>
      ['customerName', 'status', 'paymentStatus'].some(
        (key) => order[key] && order[key].toLowerCase().includes(value),
      ),
    );
    setFilteredOrders(filtered);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setFilteredOrders(orders);
    inputRef.current.focus();
  };

  // Handle open/close modal
  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status || ''); // Gán giá trị `status` từ đơn hàng
    setOrderPaymentStatus(order.paymentStatus || ''); // Gán giá trị `paymentStatus` từ đơn hàng
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  // Table columns
  const columns = [
    {
      title: 'STT',
      key: 'id',
      render: (_, __, index) => index + 1, // Hiển thị STT tăng dần
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName', // Sử dụng trường `customerName` từ API
      key: 'customerName',
      render: (name) => name || 'N/A', // Hiển thị tên hoặc 'N/A' nếu không có
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `${price} VND`,
    },
    {
      title: 'Phí vận chuyển',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      render: (fee) => `${fee} VND`,
    },
    {
      title: 'Phương thức vận chuyển',
      dataIndex: 'shippingMethod',
      key: 'shippingMethod',
      render: (method) =>
        (method === 'EXPRESS'
          ? 'Giao hàng nhanh'
          : method === 'STANDARD'
          ? 'Giao hàng tiết kiệm'
          : 'Giao hàng hỏa tốc') || 'N/A', // Hiển thị phương thức hoặc 'N/A' nếu không có
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (status === 'PAID' ? 'Đã thanh toán' : status === 'UNPAID' ? 'Chưa thanh toán' : 'N/A'), // Hiển thị trạng thái hoặc 'N/A' nếu không có
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (method === 'VNPAY' ? 'VNPAY' : 'Thanh toán khi nhận được hàng') || 'N/A', // Hiển thị phương thức hoặc 'N/A' nếu không có
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        switch (status) {
          case 'PENDING':
            return 'Đang chờ xử lý';
          case 'SHIPPED':
            return 'Đã giao hàng';
          case 'DELIVERED':
            return 'Đã giao hàng';
          case 'CANCELLED':
            return 'Đã hủy';
          default:
            return 'N/A';
        }
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div className={cx('wrapper-icon')}>
          <FontAwesomeIcon className={cx('icon-action')} icon={faPencil} onClick={() => handleOpenModal(record)} />
        </div>
      ),
    },
  ];

  return (
    <section className={cx('wrapper')}>
      {/* Search and Add Button */}
      <div className={cx('function-site')}>
        <div className={cx('search-site')}>
          <button className={cx('search-btn')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <Input
            ref={inputRef}
            className={cx('input-search')}
            placeholder="Tìm kiếm đơn hàng..."
            value={searchValue}
            onChange={handleSearch}
          />
          <button className={cx('clear')} onClick={handleClearSearch}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <Table
        className={cx('table-site')}
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for Adding/Editing Order */}
      <Modal
        title="Chỉnh sửa trạng thái đơn hàng và thanh toán"
        open={open}
        onCancel={handleCloseModal}
        onOk={() => {
          axios
            .put(`${PUBLIC_API_URL}/api/orders/${selectedOrder?.id}`, {
              status: orderStatus,
              paymentStatus: orderPaymentStatus, // Gửi thêm trạng thái thanh toán
            })
            .then(() => {
              message.success('Cập nhật trạng thái thành công!');
              fetchOrders(); // Tải lại danh sách đơn hàng
              handleCloseModal();
            })
            .catch((err) => {
              console.error('Error updating order:', err);
              message.error('Lỗi khi cập nhật trạng thái!');
            });
        }}
      >
        {/* Trạng thái đơn hàng */}
        <Select
          placeholder="Trạng thái đơn hàng"
          value={orderStatus}
          onChange={(value) => setOrderStatus(value)}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Option value="PENDING">Đang xử lý</Option>
          <Option value="DELIVERED">Đang vận chuyển</Option>
          <Option value="SHIPPED">Đã giao hàng</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>

        {/* Trạng thái thanh toán */}
        <Select
          placeholder="Trạng thái thanh toán"
          value={orderPaymentStatus}
          onChange={(value) => setOrderPaymentStatus(value)}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Option value="PAID">Đã thanh toán</Option>
          <Option value="UNPAID">Chưa thanh toán</Option>
        </Select>
      </Modal>
    </section>
  );
}

export default OrderManagement;
