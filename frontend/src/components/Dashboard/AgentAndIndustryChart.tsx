import { HighchartsReact } from 'highcharts-react-official'
import Highcharts from "highcharts/highstock";
import { Job } from '../../types/models';
import { useEffect, useRef, useState } from 'react';
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
import { makeAgentColumnData, makeAgentColumnOptions, makeIndustryPieOptions } from '../../types/chat';

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function AgentAndIndustryChart({ jobs }: { jobs: Job[] }) {
  const [ options, setOptions ] = useState<any>({}); 
  const [ category, setCategory ] = useState('Agent');
  const [ shouldRender, setShouldRender ] = useBoolean(true);
  const today = new Date();
  const startDateRef = useRef<Date>(new Date(today.getFullYear(), today.getMonth() - 4, 1));
  const endDateRef = useRef<Date>(new Date());

  useEffect(() => {
    setData(startDateRef.current, endDateRef.current);
  }, [shouldRender, category]);

  const setData = (
    startDate: Date,
    endDate: Date,
  ) => {
    if (category === 'Agent') {
      const data = makeAgentColumnData(jobs, startDate, endDate);
      setOptions(makeAgentColumnOptions(data));
    } else {
      setOptions(makeIndustryPieOptions(jobs, startDate, endDate));
    }
  }

  const nextButtonClickedHandler = () => {
    if (endDateRef.current.toLocaleString('sv-SE').slice(0,7) >= new Date().toLocaleString('sv-SE').slice(0,7)) return;

    let delta = 5
    if (category === 'Industry') {
      delta = 3
    }

    startDateRef.current = new Date(
      startDateRef.current.getFullYear(),
      startDateRef.current.getMonth() + delta,
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth() + delta + 1,
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth(),
      endDateRef.current.getDate() - 1
    );
    
    if (endDateRef.current >  new Date()) {
      endDateRef.current = new Date();
    }

    setShouldRender.toggle();
  }

  const PreviousButtonClickedHandler = () => {
    let delta = 5
    if (category === 'Industry') {
      delta = 3
    }

    startDateRef.current = new Date(
      startDateRef.current.getFullYear(),
      startDateRef.current.getMonth() - delta,
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth() - delta + 1,
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth(),
      endDateRef.current.getDate() - 1
    );

    setShouldRender.toggle();
  }

  const changeCategory = (category: string) => {
    if (category === 'Agent') {
      startDateRef.current = new Date(today.getFullYear(), today.getMonth() - 4, 1);
    } else {
      startDateRef.current = new Date(today.getFullYear(), today.getMonth() - 2, 1);
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
              <Radio value='Agent'>Agent</Radio>
              <Radio value='Industry'>Industry</Radio>
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
            <Text fontSize='sm'>{`${monthNames[new Date(startDateRef.current).getMonth()]} - ${monthNames[new Date(endDateRef.current).getMonth()]}`}</Text>
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

export default AgentAndIndustryChart
