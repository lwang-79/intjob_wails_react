import { 
  Card, 
  HStack, 
  Icon,
  IconButton, 
  Text, 
  VStack, 
  useBoolean
} from '@chakra-ui/react';
import { Job } from "../../types/models"
import { HighchartsReact } from "highcharts-react-official"
import Highcharts from "highcharts/highstock";
import { useEffect, useRef, useState } from "react";
import { makeIncomeLineChartOptions } from "../../types/chart";
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function IncomeLineChart({ jobs }: { jobs: Job[] }) {
  const [ options, setOptions ] = useState<any>(); 
  const [ totalIncome, setTotalIncome ] = useState<number>(0);
  const [ shouldRender, setShouldRender ] = useBoolean(true);
  const today = new Date();
  const startDateRef = useRef<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const endDateRef = useRef<Date>(new Date());

  useEffect(() => {
    const { totalIncome, options } = makeIncomeLineChartOptions(jobs, startDateRef.current, endDateRef.current);
    setOptions(options);
    setTotalIncome(totalIncome);
  }, [shouldRender]);

  const nextButtonClickedHandler = () => {
    if (endDateRef.current.toLocaleString('sv-SE').slice(0,7) >= new Date().toLocaleString('sv-SE').slice(0,7)) return;

    startDateRef.current = new Date(
      startDateRef.current.getFullYear(),
      startDateRef.current.getMonth() + 1,
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth() + 2,
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

    startDateRef.current = new Date(
      startDateRef.current.getFullYear(),
      startDateRef.current.getMonth() - 1,
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth(),
      1
    );
    endDateRef.current = new Date(
      endDateRef.current.getFullYear(),
      endDateRef.current.getMonth(),
      endDateRef.current.getDate() - 1
    );

    setShouldRender.toggle();
  }

  return (
    <Card w='full' pt={2}>
      <VStack>
        <HStack>
          <IconButton
            variant='ghost'
            size='sm'
            aria-label='Previous'
            icon={<Icon as={MdNavigateBefore} boxSize={6} />}
            onClick={PreviousButtonClickedHandler}
          />
          <Text fontSize='sm'>{monthNames[new Date(startDateRef.current).getMonth()]}</Text>
          <IconButton 
            variant='ghost'
            size='sm'
            aria-label='Next'
            icon={<Icon as={MdNavigateNext} boxSize={6} />}
            onClick={nextButtonClickedHandler}
            isDisabled={endDateRef.current.toLocaleString('sv-SE').slice(0,7) >= new Date().toLocaleString('sv-SE').slice(0,7)}
          />
          <Text fontSize='sm'>{`$${totalIncome.toFixed(2)}`}</Text>
          {totalIncome > 4000 ? (
            <Text>😱</Text>
          ) : totalIncome > 3000 ? (
            <Text>🥰</Text>
          ) : totalIncome > 2000 ? (
            <Text>😅</Text>
          ) : totalIncome > 1000 ? (
            <Text>🤨</Text>
          ): (
            <Text>😓</Text>
          )}
        </HStack>
      </VStack>
      {options && <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />}
    </Card>
  )
}

export default IncomeLineChart
