import { Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import BarChart from '../../components/barChart';

const Bar = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [barChartData, setBarChartData] = useState([]);

  const PUBLIC_API_URL = 'http://localhost:2000';

  useEffect(() => {
    // Fetch invoices and update the state
    fetch(`${PUBLIC_API_URL}/api/invoices/chart`)
      .then((response) => response.json())
      .then((data) => {
        setInvoices(data.invoices);
        setProducts(data.products);
      })
      .catch((error) => {
        console.error('Error fetching invoices:', error);
      });
  }, []);

  useEffect(() => {
    if (invoices.length === 0 || products.length === 0) {
      return; // Wait until invoices and products are fetched
    }

    // Link product number in invoices to product number in products
    const linkedInvoices = invoices.map((invoice) => {
      const linkedProducts = invoice.products.map((product) => {
        const linkedProduct = products.find((p) => p.id === product.id);
        return linkedProduct ? { ...product, ...linkedProduct } : product;
      });
      return { ...invoice, products: linkedProducts };
    });

    // Count the number of transactions by year and type
    const countsByYearAndType = linkedInvoices.reduce((counts, invoice) => {
      const year = new Date(invoice.date).getFullYear();
      invoice.products.forEach((product) => {
        const { type } = product;
        const yearType = `${year}-${type}`;
        counts[yearType] = counts[yearType] ? counts[yearType] + product.quantity : product.quantity;
      });
      return counts;
    }, {});

    // Prepare data for bar chart
    const calculatedBarChartData = Object.entries(countsByYearAndType).map(([yearType, count]) => {
      const [year, type] = yearType.split('-');
      return {
        year,
        type,
        count,
      };
    });

    const calculatedTotalProductsSold = Object.values(countsByYearAndType).reduce((total, count) => total + count, 0);

    setBarChartData(calculatedBarChartData);
    setTotalProductsSold(calculatedTotalProductsSold);
  }, [invoices, products]);

  return (
    <Box>
      <Box width="fit-content" padding="10px" backgroundColor="#d34555" fontSize="15px" fontWeight="400">
        Total products sold: {totalProductsSold}
      </Box>
      <Box height="50vh" display="flex" justifyContent="center" backgroundColor="#D8EDED">
        <BarChart data={barChartData} />
      </Box>
    </Box>
  );
};

export default Bar;
