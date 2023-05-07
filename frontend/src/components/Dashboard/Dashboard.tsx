import { HStack, VStack, useColorMode } from '@chakra-ui/react';
import Highcharts from "highcharts/highstock";
import { useMemo } from 'react'
import JobByDateChart from './JobByDateChart';

function Dashboard() {
  const { colorMode } = useColorMode();

  // set highcharts color mode
  useMemo(() => {
    console.log(colorMode);

    Highcharts.theme = colorMode == 'dark' ? {
      colors: [
        '#4FD1C5', '#4299E1', '#ED64A6', '#ED8936', 
        '#48BB78', '#9F7AEA', '#ECC94B', '#F56565',
        '#0BC5EA', '#A0AEC0'
      ],
      chart: {
        backgroundColor: {
          stops: [
              [0, 'rgba(255, 255, 255, 0.05)'],
          ]
        }
      },
      legend: {
        itemStyle: {
          color: 'rgb(158, 161, 176)'
        },
        itemHoverStyle: {
          color: 'gray'
        }
      }
    } : {
      colors: [
        '#4FD1C5', '#4299E1', '#ED64A6', '#ED8936', 
        '#48BB78', '#9F7AEA', '#ECC94B', '#F56565',
        '#0BC5EA', '#A0AEC0'
      ],
      chart: {
        backgroundColor: {
          stops: [
              [0, 'rgba(0, 0, 0, 0.05)'],
          ]
        }
      },
      legend: {
        itemStyle: {
          color: 'rgb(158, 161, 176)'
        },
        itemHoverStyle: {
          color: 'gray'
        }
      }
    }

    Highcharts.setOptions(Highcharts.theme);
  }, [colorMode]);

  return (
    <>
      <HStack>
        <VStack>
          <JobByDateChart />

        </VStack>
        <VStack>

        </VStack>
      </HStack>
      
    </>
  )
}

export default Dashboard
