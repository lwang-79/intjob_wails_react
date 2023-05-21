import { HStack, Spacer, VStack, useColorMode } from '@chakra-ui/react';
import Highcharts from "highcharts/highstock";
import { useEffect, useMemo, useState } from 'react'
import JobByDateChart from './JobByDateChart';
import { JOB_STATUS, Job, Response } from '../../types/models';
import { ListJobs } from '../../../wailsjs/go/repository/Repo';
import AgentAndIndustryChart from './AgentAndIndustryChart';
import IncomeLineChart from './IncomeLineChart';
import JobStatusCard from './JobStatusCard';
import HolidayCard from './HolidayCard';
import LocationCard from './LocationCard';

function Dashboard() {
  const { colorMode } = useColorMode();
  const [ jobs, setJobs ] = useState<Job[]>();

  useEffect(() => {
    getAndSetAllJobs();
  },[]);

  const getAndSetAllJobs = async () => {
    const response: Response = await ListJobs('', [], 1000);
    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const jobs = response.Result as Job[];

    setJobs(jobs);
  }

  // set highcharts color mode
  useMemo(() => {
    Highcharts.theme = colorMode == 'dark' ? {
      colors: [
        '#4299E1', '#ED8936', '#4FD1C5', '#ED64A6', 
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
        '#4299E1', '#ED8936', '#4FD1C5', '#ED64A6',
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
      {jobs && 
      <HStack w='full' maxW='5xl' px={4} align='flex-start'>
        <VStack maxW='3xl' w='full' >
          <JobByDateChart jobs={jobs}/>
          <AgentAndIndustryChart jobs={jobs}/>
        </VStack>
        <VStack maxW='xs' w='full' >
          <IncomeLineChart jobs={jobs}/>
          <JobStatusCard jobs={jobs}/>
          <LocationCard />
          <HolidayCard />
        </VStack>
      </HStack>}
      
    </>
  )
}

export default Dashboard
