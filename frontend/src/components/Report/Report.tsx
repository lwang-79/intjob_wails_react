import { 
  Button, 
  Divider, 
  HStack, 
  Heading, 
  Input, 
  Modal, 
  ModalBody, 
  ModalCloseButton, 
  ModalContent, 
  ModalFooter, 
  ModalHeader, 
  ModalOverlay, 
  Spacer, 
  Table, 
  TableCaption, 
  TableContainer, 
  Tag, 
  Tbody, 
  Td, Text, Th, 
  Thead, Tr, 
  VStack, 
  Wrap, 
  WrapItem, 
  useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Job, Response } from "../../types/models";
import { GetJobsByDate } from "../../../wailsjs/go/main/App";
import { CalculateRouteSummary } from "@aws-sdk/client-location";

interface Report {
  totalJobs: number;
  totalWorkedHours: number;
  totalIncome: number;
  totalTrafficInKm: number;
  agentReports: SubReport[];
  industryReports: SubReport[];
}

interface SubReport {
  name: string;
  jobs: number;
  minutes: number;
  income: number;
  trafficInKm: number;
}

function Report() {
  const now = new Date();
  const currentFiscalYearStart = new Date(now.getFullYear(), 6, 1); // 6 represents July (0-based index)
  if (now < currentFiscalYearStart) {
    currentFiscalYearStart.setFullYear(now.getFullYear() - 1); // subtract one year if current date is before July 1st
  }
  const thisFinancialYear: [Date, Date] = [currentFiscalYearStart, new Date()];
  const [ startTime, setStartTime ] = useState<Date>(currentFiscalYearStart);
  const [ endTime, setEndTime ] = useState<Date>(new Date());
  const [ report, setReport ] = useState<Report>({
    totalJobs: 0,
    totalWorkedHours: 0,
    totalIncome: 0,
    totalTrafficInKm: 0,
    agentReports: [],
    industryReports: []
  });

  const { 
    isOpen: isOpenDatePicker, 
    onOpen: onOpenDatePicker, 
    onClose: onCloseDatePicker
  } = useDisclosure();

  const thisCalendarYear: [Date, Date] = [
    new Date(now.getFullYear(), 0, 1),
    new Date()
  ];
  
  const lastCalendarYear: [Date, Date] = [
    new Date(now.getFullYear() - 1, 0, 1),
    new Date(now.getFullYear() - 1, 11, 31)
  ];

  const lastFiveFinancialYears: [Date, Date][] = [];

  for (let i = 1; i < 6; i++) {
    const fiscalYearStart = new Date(currentFiscalYearStart.getFullYear() - i, 6, 1); // 6 represents July (0-based index)
    const startTime = fiscalYearStart;
    const endTime = new Date(fiscalYearStart.getFullYear() + 1, 5, 30, 23, 59, 59, 999); // 5 represents June (0-based index), 30 is the last day of the fiscal year

    lastFiveFinancialYears.push([startTime, endTime]);
  }

  useEffect(() => {
    makeReport(startTime, endTime);
  }, []);

  const makeReport = async (startTime: Date, endTime: Date) => {
    const response: Response = await GetJobsByDate(
      startTime.toISOString().replace('.000',''), 
      endTime.toISOString().replace('.000','')
    );

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const jobs: Job[] = response.Result;

    const report: Report = {
      totalJobs: 0,
      totalWorkedHours: 0,
      totalIncome: 0,
      totalTrafficInKm: 0,
      agentReports: [],
      industryReports: []
    }

    const agentsReports = new Map<string, SubReport>();
    const industriesReports = new Map<string, SubReport>();

    for (const job of jobs) {
      let distance = 0;

      if (job.Traffic) {
        distance = (JSON.parse(job.Traffic) as CalculateRouteSummary).Distance??0;
        if (distance < 1) {
          distance = 0;
        }
      }
        
      if (!agentsReports.has(job.Agent!.Name)) {
        agentsReports.set(job.Agent!.Name, {
          name: job.Agent!.Name,
          jobs: 1,
          minutes: job.Duration,
          income: job.Income,
          trafficInKm: distance
        });
      } else {
        const count = agentsReports.get(job.Agent!.Name)!.jobs + 1;
        const minutes = agentsReports.get(job.Agent!.Name)!.minutes + job.Duration;
        const income = agentsReports.get(job.Agent!.Name)!.income + job.Income;
        const trafficInKm = agentsReports.get(job.Agent!.Name)!.trafficInKm + distance;

        agentsReports.set(job.Agent!.Name, {
          name: job.Agent!.Name,
          jobs: count,
          minutes: minutes,
          income: income,
          trafficInKm: trafficInKm
        });
      }

      if (!industriesReports.has(job.Industry!.Name)) {
        industriesReports.set(job.Industry!.Name, {
          name: job.Industry!.Name,
          jobs: 1,
          minutes: job.Duration,
          income: job.Income,
          trafficInKm: distance
        });
      } else {
        const count = industriesReports.get(job.Industry!.Name)!.jobs + 1;
        const minutes = industriesReports.get(job.Industry!.Name)!.minutes + job.Duration;
        const income = industriesReports.get(job.Industry!.Name)!.income + job.Income;
        const trafficInKm = industriesReports.get(job.Industry!.Name)!.trafficInKm + distance;

        industriesReports.set(job.Industry!.Name, {
          name: job.Industry!.Name,
          jobs: count,
          minutes: minutes,
          income: income,
          trafficInKm: trafficInKm
        });
      }

      report.totalJobs++;
      report.totalWorkedHours += job.Duration;
      report.totalIncome += job.Income;
      report.totalTrafficInKm += distance;      
    }

    report.agentReports = Array.from(agentsReports.values()).sort((a, b) => (b.income - a.income));
    report.industryReports = Array.from(industriesReports.values()).sort((a, b) => (b.income - a.income));
    setReport(report);
  }

  const calculateTax = (income: number) => {
    let tax = 0;
    if (income > 18200) {
      if (income > 45000) {
        if (income > 120000) {
          if (income > 180000) {
            tax = (income - 180000) * 0.45 + 51667;
          } else {
            tax = (income - 120000) * 0.37 + 29467;
          }
        } else {
          tax = (income - 45000) * 0.325 + 5092;
        }
      } else {
        tax = (income - 18200) * 0.19 + 0;
      }
    }

    return tax;
  }

  const changeDate = (dates: [Date, Date]) => {
    setStartTime(dates[0]);
    setEndTime(dates[1]);
    makeReport(dates[0], dates[1]);
    onCloseDatePicker();
  }
    
  

  return (
    <VStack w='full' maxW='3xl' spacing={14}>
      <VStack px={6} w='full' spacing={4}>
        <HStack w='full' align='flex-end'>
          <Heading>Income Report </Heading>
          <Text>({startTime.toLocaleDateString('sv-SE')} - {endTime.toLocaleDateString('sv-SE')})</Text>
          <Spacer />
          <Button 
            size='sm'
            variant='ghost'
            onClick={onOpenDatePicker}
          >
            Change Date
          </Button>
        </HStack>
        <HStack w='full' align='flex-end'>
          <VStack w='50%' align='flex-start'>
            <Text>Total jobs: {report.totalJobs}</Text>
            <Text>Total worked hours: {(report.totalWorkedHours/60).toFixed(1)}</Text>
            <Text>Total income: $ {(report.totalIncome).toFixed(2)}</Text>
          </VStack>
          <VStack w='50%' align='flex-start'>
            <Text>Total traffic (km): {report.totalTrafficInKm.toFixed(1)}</Text>
            <Text>Estimated income tax: $ {calculateTax(report.totalIncome).toFixed(2)}</Text>
          </VStack>
        </HStack>
      </VStack>

      {/* <Divider /> */}

      <TableContainer w='full'>
        {/* <Tag size='lg'>Breakdown by Agent</Tag> */}
        <Table variant='simple'>
          <TableCaption>Breakdown by Agent</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th isNumeric>Total Jobs</Th>
              <Th isNumeric>Worked Hours</Th>
              <Th isNumeric>Income (AUD)</Th>
              <Th isNumeric>Traffic (km)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {report.agentReports.map((report, index) => (
              <Tr key={index}>
                <Td>{report.name}</Td>
                <Td isNumeric>{report.jobs}</Td>
                <Td isNumeric>{(report.minutes/60).toFixed(1)}</Td>
                <Td isNumeric>{(report.income).toFixed(2)}</Td>
                <Td isNumeric>{report.trafficInKm.toFixed(1)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <TableContainer w='full'>
        <Table variant='simple'>
          <TableCaption>Breakdown by Industry</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th isNumeric>Total Jobs</Th>
              <Th isNumeric>Worked Hours</Th>
              <Th isNumeric>Income (AUD)</Th>
              <Th isNumeric>Traffic (km)</Th>
            </Tr>

          </Thead>
          <Tbody>
            {report.industryReports.map((report, index) => (
              <Tr key={index}>
                <Td>{report.name}</Td>
                <Td isNumeric>{report.jobs}</Td>
                <Td isNumeric>{(report.minutes/60).toFixed(1)}</Td>
                <Td isNumeric>{(report.income).toFixed(2)}</Td>
                <Td isNumeric>{report.trafficInKm.toFixed(1)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      
      <Modal
        isOpen={isOpenDatePicker}
        onClose={onCloseDatePicker}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <ModalHeader>Choose a date range</ModalHeader>
            <VStack align='flex-start'>
              <HStack>
                <Button
                  variant='ghost'
                  onClick={()=>{changeDate(thisCalendarYear)}}
                >
                  This Calendar Year
                </Button>
                <Button
                  variant='ghost'
                  onClick={()=>{changeDate(lastCalendarYear)}}
                >
                  Last Calendar Year
                </Button>
              </HStack>
              <Text>Financial Year</Text>
              <HStack>
                <Button
                  variant='ghost'
                  onClick={()=>{changeDate(thisFinancialYear)}}
                >
                  This Financial Year
                </Button>
              </HStack>
              <Wrap>
                {lastFiveFinancialYears.map((year, index) => (
                  <WrapItem key={index}>
                    <Button
                      variant='ghost'
                      onClick={()=>{changeDate(year)}}
                    >
                      {`${year[0].getFullYear()} - ${year[1].getFullYear()}`}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>

              <HStack w='full'>
                <VStack align='flex-start' w='50%'>
                  <Text>Start Date:</Text>
                  <Input
                    value={startTime.toLocaleDateString('sv-SE')}
                    onChange={(e)=>{setStartTime(new Date(e.target.value))}}
                    type='date'
                    color='teal'
                  />
                </VStack>
                <VStack align='flex-start' w='50%'>
                  <Text>End Date:</Text>
                  <Input
                    value={endTime.toLocaleDateString('sv-SE')}
                    onChange={(e)=>{setEndTime(new Date(e.target.value))}}
                    type='date'
                    color='teal'
                  />
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>
          <Button
            mt={2}
            onClick={()=>{changeDate([startTime, endTime])}}
          >
            OK
          </Button>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default Report
