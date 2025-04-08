import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import styles from './Report.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const PUBLIC_API_URL = 'http://localhost:8080';

const Report = () => {
  const [year, setYear] = useState(2024); // Năm mặc định
  const [month, setMonth] = useState(1); // Tháng mặc định
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [quarterlyRevenue, setQuarterlyRevenue] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);

  // Token (giả sử bạn lưu token trong localStorage)
  const token = localStorage.getItem('token');

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${token}`, // Thêm token vào header
    };

    // Gọi API doanh thu theo tháng
    axios
      .get(`${PUBLIC_API_URL}/api/statistics/revenue/monthly`, {
        params: { year },
        headers,
      })
      .then((res) => {
        const data = res.data.map((item) => ({
          month: item.label, // Sử dụng `label` làm tháng
          revenue: item.totalRevenue, // Sử dụng `totalRevenue` làm doanh thu
        }));
        setMonthlyRevenue(data);
      })
      .catch((err) => console.error('Error fetching monthly revenue:', err));

    // Gọi API doanh thu theo quý
    axios
      .get(`${PUBLIC_API_URL}/api/statistics/revenue/quarterly`, {
        params: { year },
        headers,
      })
      .then((res) => {
        const data = res.data.map((item) => ({
          quarter: item.label, // Sử dụng `label` làm quý
          revenue: item.totalRevenue, // Sử dụng `totalRevenue` làm doanh thu
        }));
        setQuarterlyRevenue(data);
      })
      .catch((err) => console.error('Error fetching quarterly revenue:', err));

    // Gọi API số lượng đơn hàng theo tháng
    axios
      .get(`${PUBLIC_API_URL}/api/statistics/revenue/SLmonthly`, {
        params: { year },
        headers,
      })
      .then((res) => {
        const data = res.data.map((item) => ({
          month: item.timePeriod, // Sử dụng `timePeriod` làm tháng
          orderCount: item.orderCount, // Sử dụng `orderCount` làm số lượng đơn hàng
        }));
        setMonthlyOrders(data);
      })
      .catch((err) => console.error('Error fetching monthly orders:', err));
  }, [year, token]);

  // Dữ liệu cho Bar Chart (Doanh thu theo tháng)
  const monthlyRevenueChartData = {
    labels: monthlyRevenue.map((item) => `Tháng ${item.month}`),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: monthlyRevenue.map((item) => item.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Dữ liệu cho Pie Chart (Doanh thu theo quý)
  const quarterlyRevenueChartData = {
    labels: quarterlyRevenue.map((item) => `Quý ${item.quarter}`),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: quarterlyRevenue.map((item) => item.revenue),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // Dữ liệu cho Bar Chart (Số lượng đơn hàng theo tháng)
  const monthlyOrdersChartData = {
    labels: monthlyOrders.map((item) => `Tháng ${item.month}`),
    datasets: [
      {
        label: 'Số lượng đơn hàng',
        data: monthlyOrders.map((item) => item.orderCount),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className={cx('wrapper')}>
      <h2>Chọn năm</h2>
      <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
      </select>

      {/* <h2>Chọn tháng</h2>
      <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            Tháng {i + 1}
          </option>
        ))}
      </select> */}
      <h2>Doanh thu theo tháng</h2>
      <div className={cx('chart-container')}>
        <Bar data={monthlyRevenueChartData} />
      </div>
      <h2>Tỷ lệ doanh thu theo quý</h2>
      <div className={cx('chart-container')}>
        <Pie data={quarterlyRevenueChartData} />
      </div>
      <h2>Số lượng đơn hàng theo tháng</h2>
      <div className={cx('chart-container')}>
        <Bar data={monthlyOrdersChartData} />
      </div>
    </div>
  );
};

export default Report;
