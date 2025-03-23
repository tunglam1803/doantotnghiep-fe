import { Box } from '@mui/material';
import PieChart from '../../components/pieChart';
import { React, useState, useEffect } from 'react';

  const PUBLIC_API_URL = 'http://localhost:2000';

const Pie = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // Fetch the invoices and update the state
    fetch(`${PUBLIC_API_URL}/api/invoices/chart`)
      .then((response) => response.json())
      .then((data) => {
        setInvoices(data.invoices);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  const countInvoices = (invoices, groupBy) => {
    const counts = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.date);

      if (groupBy === 'year') {
        const year = date.getFullYear().toString();
        if (counts[year]) {
          counts[year] = counts[year] + 1;
        } else {
          counts[year] = 1;
        }
      } else if (groupBy === 'month') {
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (counts[yearMonth]) {
          counts[yearMonth] = counts[yearMonth] + 1;
        } else {
          counts[yearMonth] = 1;
        }
      }
    });

    return counts;
  };

  const invoiceCountsByYear = countInvoices(invoices, 'year');

  const invoiceCountsByYearMonth = countInvoices(invoices, 'month');

  const countTransactions = () => {
    return invoices.length;
  };
  const pieChartData = invoices
    ? Object.entries(invoiceCountsByYear).map(([year, count]) => ({
        id: year,
        label: year,
        value: count,
      }))
    : [];

  const pieChartDataMonth = invoices
    ? Object.entries(invoiceCountsByYearMonth).map(([year, count]) => ({
        id: year,
        label: year,
        value: count,
      }))
    : [];
  const invoiceCount = countTransactions();
  return (
    <Box>
      <Box width="fit-content" padding="10px" backgroundColor="#d34555" fontSize="15px" fontWeight="400">
        Total Invoices : {invoiceCount}
      </Box>
      <Box height="50vh" display="flex" justifyContent="space-between" maxWidth="1190px">
        <PieChart data={pieChartData} />
        <PieChart data={pieChartDataMonth} />
      </Box>
    </Box>
  );
};

export default Pie;
