import { useEffect, useRef, useState } from "react"
import JobTable from "./JobTable"
import { Agent, Industry, JOB_STATUS, Job, Response } from "../../types/models"
import { GetJobsByDate, GetJobsByFilter, ListAllAgents, ListAllIndustries, ListJobs } from "../../../wailsjs/go/main/App";
import { 
  Box, 
  HStack, 
  Icon, 
  IconButton, 
  Input, 
  Modal, 
  ModalCloseButton, 
  ModalContent, 
  ModalOverlay, 
  Select, 
  Spacer, 
  Tag, 
  Text, 
  Tooltip, 
  VStack, 
  useDisclosure, 
  useToast 
} from "@chakra-ui/react";
import { MdAdd, MdDateRange, MdOutlineFilterList, MdOutlineSearch, MdRefresh } from "react-icons/md";
import JobForm from "../Forms/JobForm";
import { changeArrayByItem } from "../../types/utils";

function JobsPanel() {
  const allJobsRef = useRef<Job[]>([]);
  const [ jobs, setJobs ] = useState<Job[]>([]);
  const optionNames = ['All', 'Agent', 'Industry', 'Status'];
  const [ selectedOptionName, setSelectedOptionName ] = useState<string>('All');
  const agentNamesRef = useRef<string[]>([]);
  const industryNamesRef = useRef<string[]>([]);
  const statusNamesRef = useRef<string[]>(Object.keys(JOB_STATUS).map(key => String(key)));
  const [ optionValues, setOptionValues ] = useState<string[]>(['All']);
  const [ selectedOptionValue, setSelectedOptionValue ] = useState<string>('All');
  const [ showLoadButton, setShowLoadButton ] = useState<boolean>(true);
  const [ searchDate, setSearchDate ] = useState<string>('');
  const toast = useToast();

  const { 
    isOpen: isOpenJobForm, 
    onOpen: onOpenJobFrom, 
    onClose: onCloseJobForm
  } = useDisclosure();

  useEffect(() => { 
    getAndSetJobs();
    getAvailableOptions();
  }, []);

  useEffect(() => {
    if (selectedOptionName === 'All') {
      setOptionValues(['All']);
      setSelectedOptionValue('All');
    } else if (selectedOptionName === 'Agent') {
      setOptionValues(agentNamesRef.current);
      setSelectedOptionValue(agentNamesRef.current[0]);
    } else if (selectedOptionName === 'Industry') {
      setOptionValues(industryNamesRef.current);
      setSelectedOptionValue(industryNamesRef.current[0]);
    } else if (selectedOptionName === 'Status') {
      setOptionValues(statusNamesRef.current);
      setSelectedOptionValue(statusNamesRef.current[0]);
    }
    setShowLoadButton(true);
  },[selectedOptionName]);

  const getAndSetJobs = async (): Promise<Job[]> => {
    const response: Response = await ListJobs('', [], 50);

    if (response.Status !== 'success') {
      console.error(response.Status);
      return [];
    }

    const jobs: Job[] = response.Result;
    allJobsRef.current = jobs;
    setJobs(jobs);
    setShowLoadButton(true);
    return jobs;
  }

  const getAvailableOptions = async () => {
    let response: Response = await ListAllAgents();

    if (response.Status !== 'success') {
      console.error(response.Status);
      return [];
    }

    const allAgents: Agent[] = response.Result;

    agentNamesRef.current = allAgents.map(agent => agent.Name);

    response = await ListAllIndustries();

    if (response.Status !== 'success') {
      console.error(response.Status);
      return [];
    }

    const allIndustries: Industry[] = response.Result;

    industryNamesRef.current = allIndustries.map(agent => agent.Name);

  }

  const loadMoreJobs = async () => {
    let lastDate = allJobsRef.current[allJobsRef.current.length - 1].StartAt;
    if (lastDate < '2023-05-01') {
      lastDate = lastDate.replace('T', ' ').replace('Z', '');
    }

    const response: Response = selectedOptionValue === 'All' ?
      await ListJobs(lastDate, [], 50) :
      await GetJobsByFilter(
        selectedOptionName, 
        selectedOptionValue, 
        lastDate, 
        50
      );

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const jobs: Job[] = response.Result;
    if (jobs.length === 0) {
      setShowLoadButton(false);
      toast({
        description: "No more jobs to load, please change the filter.",
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      return;
    }
    allJobsRef.current = allJobsRef.current.concat(jobs);
    setJobs(allJobsRef.current);
    setShowLoadButton(true);
  }

  const searchJobs = async () => {
    try {
      const dates = searchDate.trim().split(',');
      const startDate = new Date(dates[0]).toISOString().slice(0,10);
      const endDate = dates[1] ? new Date(dates[1]).toISOString().slice(0,10) : '';
      const response: Response = await GetJobsByDate(startDate, endDate);
  
      if (response.Status !== 'success') {
        console.error(response.Status);
        return;
      }
  
      const jobs: Job[] = response.Result;
      setJobs(jobs);
      setShowLoadButton(false);
    } catch (error) {
      console.error(error);
      toast({
        description: "Wrong format. For single date format: 2023-05-12. For date range format: 2023-05-12,2023-05-20",
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
      
    }
  }

  const filterJobs = async () => {
    if (selectedOptionValue === 'All') {
      getAndSetJobs();
      return;
    }

    const response: Response = await GetJobsByFilter(selectedOptionName, selectedOptionValue, '', 50);

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const jobs: Job[] = response.Result;
    allJobsRef.current = jobs;
    setJobs(jobs);
    setShowLoadButton(true);
  }

  const jobChangedHandler = (job: Job, type: 'add' | 'update' | 'delete') => {
    console.log(job, type)
    allJobsRef.current = changeArrayByItem([...allJobsRef.current], job, type);
    console.log(allJobsRef.current);
    setJobs(allJobsRef.current);
  }

  return (
    <VStack w='5xl' spacing={4}>
      <HStack w='full' px={4}>
        <HStack>
          <Icon as={MdOutlineFilterList} boxSize={6} />
          <Select
            size='sm'
            value={selectedOptionName}
            onChange={(event) => setSelectedOptionName(event.target.value)}
            w='100px'
          >
            {optionNames.map(optionName => (
              <option key={optionName} value={optionName}>{optionName}</option>
            ))}
          </Select>
          <Select
            size='sm'
            value={selectedOptionValue}
            onChange={(event) => setSelectedOptionValue(event.target.value)}
            w='100px'
          >
            {optionValues.map(optionValue => (
              <option key={optionValue} value={optionValue}>{optionValue}</option>
            ))}
          </Select>
          <IconButton
            aria-label='Refresh'
            size='sm'
            rounded='full'
            variant='ghost'
            icon={<Icon as={MdRefresh} boxSize={6} />}
            onClick={filterJobs}
          />
        </HStack>
        <Spacer />
        <HStack>
          <Tooltip
            hasArrow
            label='Search date range: 2023-05-12,2023-05-20'
          >
            <Box>
              <Icon as={MdDateRange} boxSize={6} />
            </Box>
          </Tooltip>
          <Input
            size='sm'
            rounded='lg'
            placeholder='Input date to search. Format: 2023-05-12'
            onChange= {(event) => setSearchDate(event.target.value)}
            w='300px'
          />
          
          <IconButton
            aria-label='Search Date'
            size='sm'
            rounded='full'
            variant='ghost'
            icon={<Icon as={MdOutlineSearch} boxSize={6} />}
            onClick={searchJobs}
          />

        </HStack>
        <Spacer />
        <Tag fontSize='sm'>{allJobsRef.current.length} jobs</Tag>
        <IconButton
          aria-label='Add Job'
          size='sm'
          rounded='full'
          variant='ghost'
          icon={<Icon as={MdAdd} boxSize={6} />}
          onClick={onOpenJobFrom}
        />
      </HStack>

      {jobs && <Box
        overflowY='hidden'
        h='75vh'
        w='full'
      >
        <JobTable jobs={jobs} loadMoreJobs={loadMoreJobs} shouldShowButton={showLoadButton} />
      </Box>}

      <Modal
        isOpen={isOpenJobForm}
        onClose={onCloseJobForm}
        closeOnOverlayClick={false}
        id='job-form-modal'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton  />
            <JobForm closeCallBack={onCloseJobForm} onFinishCallBack={jobChangedHandler}/>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default JobsPanel
