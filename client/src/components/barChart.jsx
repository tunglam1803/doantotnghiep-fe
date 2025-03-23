import { Box } from "@mui/material";
import { ResponsiveBar } from '@nivo/bar';

const BarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No data available.</div>;
    }
    const years = [...new Set(data.map((product) => product.year))];
  
    const chartData = years.map((year) => {
      const yearData = data.filter((product) => product.year === year);
      const groupedData = yearData.reduce((result, product) => {
        const { type, count } = product;
        result[type] = (result[type] || 0) + count;
        return result;
      }, {});
      return {
        year,
        ...groupedData,
      };
    });
  
    
    const keys = Object.keys(chartData[0]).filter((key) => key !== "year");

    return (
        <Box
            width = "80%"
            height= "100%"
        >
             <ResponsiveBar
        data={chartData}
        keys={keys}
        indexBy="year"
        margin={{ top: 50, right: 130, bottom: 50, left: 100 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Year",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Quantity",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemWidth: 100,
            itemHeight: 20,
            itemsSpacing: 2,
            symbolSize: 20,
            itemDirection: "right-to-left",
          },
        ]}
        tooltip={() => {}}
        role="application"
          />
        </Box>
    );
  };
  
  export default BarChart;

  