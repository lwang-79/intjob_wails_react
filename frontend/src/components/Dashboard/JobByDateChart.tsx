import { HighchartsReact } from 'highcharts-react-official'
import Highcharts from "highcharts/highstock";
import { Job } from '../../types/models';
import { useEffect, useRef, useState } from 'react';
import { makeJobColumnData, makeJobColumnOptions } from '../../types/chat';
import { 
  Card, 
  HStack, 
  Icon,
  IconButton, 
  Radio, 
  RadioGroup, 
  Text, 
  VStack, 
  useBoolean
} from '@chakra-ui/react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

function JobByDateChart({ jobs }: { jobs: Job[] }) {

  const [ options, setOptions ] = useState<any>({}); 
  const [ category, setCategory ] = useState('Day');
  const [ shouldRender, setShouldRender ] = useBoolean(true);
  const today = new Date();
  const startDateRef = useRef<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));
  const endDateRef = useRef<Date>(new Date());

  useEffect(() => {
    setData(startDateRef.current, endDateRef.current, category as 'Day' | 'Week' | 'Month');
  }, [shouldRender, category]);

  const setData = (
    startDate: Date,
    endDate: Date,
    category: 'Day' | 'Week' | 'Month'
  ) => {
    const data = makeJobColumnData(jobs, startDate, endDate, category);
    const options = makeJobColumnOptions(data);
    setOptions(options);
  }

  const nextButtonClickedHandler = () => {
    if (endDateRef.current.toLocaleString('sv-SE').slice(0,7) >= new Date().toLocaleString('sv-SE').slice(0,7)) return;

    let delta = 7
    if (category === 'Week') {
      delta = 35
    }

    if (category !== 'Month') {
      startDateRef.current = new Date(
        startDateRef.current.getFullYear(), 
        startDateRef.current.getMonth(), 
        startDateRef.current.getDate() + delta
      );
      endDateRef.current = new Date(
        endDateRef.current.getFullYear(), 
        endDateRef.current.getMonth(), 
        endDateRef.current.getDate() + delta
      );
    } else {
      startDateRef.current = new Date(
        startDateRef.current.getFullYear(),
        startDateRef.current.getMonth() + 5,
        1
      );
      endDateRef.current = new Date(
        endDateRef.current.getFullYear(),
        endDateRef.current.getMonth() + 6,
        1
      );
      endDateRef.current = new Date(
        endDateRef.current.getFullYear(),
        endDateRef.current.getMonth(),
        endDateRef.current.getDate() - 1
      );
    }
    
    if (endDateRef.current >  new Date()) {
      endDateRef.current = new Date();
    }

    setShouldRender.toggle();
  }

  const PreviousButtonClickedHandler = () => {
    let delta = 7
    if (category === 'Week') {
      delta = 35
    }

    if (category !== 'Month') {
      startDateRef.current = new Date(
        startDateRef.current.getFullYear(), 
        startDateRef.current.getMonth(), 
        startDateRef.current.getDate() - delta
      );
      endDateRef.current = new Date(
        endDateRef.current.getFullYear(), 
        endDateRef.current.getMonth(), 
        endDateRef.current.getDate() - delta
      );
    } else {
      startDateRef.current = new Date(
        startDateRef.current.getFullYear(),
        startDateRef.current.getMonth() - 5,
        1
      );
      endDateRef.current = new Date(
        endDateRef.current.getFullYear(),
        endDateRef.current.getMonth() - 4,
        1
      );
      endDateRef.current = new Date(
        endDateRef.current.getFullYear(),
        endDateRef.current.getMonth(),
        endDateRef.current.getDate() - 1
      );
    }

    setShouldRender.toggle();
  }

  const changeCategory = (category: string) => {
    if (category === 'Day') {
      startDateRef.current = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    } else if (category === 'Week') {
      const dayOfWeek = new Date().getDay();
      const diff = new Date().getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
      const firstDayOfCurrentWeek = new Date(new Date().setDate(diff));
      startDateRef.current = new Date(firstDayOfCurrentWeek.getFullYear(), firstDayOfCurrentWeek.getMonth(), firstDayOfCurrentWeek.getDate() - 28);
    } else if (category === 'Month') {
      startDateRef.current = new Date(today.getFullYear(), today.getMonth() - 4, 1);
    }

    endDateRef.current = new Date(today);
    setCategory(category);
  }

  return (
    <Card w='full' p={4}>
      <VStack w= 'full'>
        <HStack mb={4} spacing={4}>
          <RadioGroup onChange={(category) => changeCategory(category)} value={category} size='sm'>
            <HStack>
              <Radio value='Day'>Day</Radio>
              <Radio value='Week'>Week</Radio>
              <Radio value='Month'>Month</Radio>
            </HStack>
          </RadioGroup>
          
          <HStack>
            <IconButton
              variant='ghost'
              size='sm'
              aria-label='Previous'
              icon={<Icon as={MdNavigateBefore} boxSize={6} />}
              onClick={PreviousButtonClickedHandler}
            />
            <Text fontSize='sm'>{new Date(startDateRef.current).toLocaleString('sv-SE').slice(0,4)}</Text>
            <IconButton 
              variant='ghost'
              size='sm'
              aria-label='Next'
              icon={<Icon as={MdNavigateNext} boxSize={6} />}
              onClick={nextButtonClickedHandler}
              isDisabled={endDateRef.current.toLocaleString('sv-SE').slice(0,7) >= new Date().toLocaleString('sv-SE').slice(0,7)}
            />
          </HStack>
        </HStack>
      </VStack>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Card>
  )
}

export default JobByDateChart
