import { ResponsivePie } from "@nivo/pie";
import {  Box  } from "@mui/material";    
import React from 'react';

const PieChart = ({ data }) => {

  return <Box
    height = "100%"
    fontSize= "20px"
    width = "50%"
        >
          <ResponsivePie
          data={data}
        theme={{
        axis: {
          domain: {
            line: {
              stroke: "black",
            },
          },
          legend: {
            text: {
              fill: "black",
            },
          },
          ticks: {
            line: {
              stroke: "black",
              strokeWidth: 1,
            },
            text: {
              fill: "black",
            },
          },
        },
        legends: {
          text: {
            fill: "black",
          },
        },
      }}
      margin={{ top: 40, bottom: 80 }}
      padAngle={1}
      cornerRadius={2}
      activeOuterRadiusOffset={8}
      borderWidth={2}
      arcLinkLabelsSkipAngle={7}
      arcLinkLabelsTextOffset={8}
      arcLinkLabelsTextColor="#000000"
      arcLinkLabelsDiagonalLength={15}
      arcLinkLabelsStraightLength={28}
      arcLinkLabelsThickness={2}
      isInteractive={false}
      //Lay theo attribute of Data
      arcLinkLabel={e=>e.label}

      arcLabelsRadiusOffset={0.6}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor="black"
      arcLabelsTextSize="20px"
      defs={[
          {
              id: 'dots',
              type: 'patternDots',
              size: 10,
              padding: 1,
              stagger: true
          },
          {
              id: 'lines',
              type: 'patternLines',
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
              fontSize: "10px"
          }
      ]}
      
      legends={[
          {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 0,
                translateY: 0,
                itemWidth: 100,
                itemHeight: 20,
                itemsSpacing: 0,
                symbolSize: 20,
                itemDirection: 'left-to-right'
          }
      ]}
    />  
    </Box>
};

export default PieChart;