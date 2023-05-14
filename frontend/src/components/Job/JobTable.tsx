import { 
  Box, 
  Button, 
  Modal, 
  ModalCloseButton, 
  ModalContent, 
  ModalOverlay, 
  Table, 
  TableContainer, 
  Tbody, 
  Th, Thead, Tr, 
  useColorModeValue, 
  useDisclosure } from "@chakra-ui/react"
import { Job } from "../../types/models"
import JobTableRow from "./JobTableRow"
import JobCard from "./JobCard";
import { useState } from "react";
import { changeArrayByItem } from "../../types/utils";

interface JobTableProps {
  jobs: Job[]
  loadMoreJobs: () => void
  shouldShowButton: boolean
}
function JobTable({ jobs, loadMoreJobs, shouldShowButton }: JobTableProps) {
  const hoverBackgroundColor = useColorModeValue('gray.200', 'gray.700');
  const [ selectedJob, setSelectedJob ] = useState<Job>(jobs[0]);

  const { 
    isOpen: isOpenJobCard, 
    onOpen: onOpenJobCard, 
    onClose: onCloseJobCard
  } = useDisclosure();

  const jobClickedHandler = (job: Job) => {
    setSelectedJob(job);
    setTimeout(() => {
      onOpenJobCard();
    }, 100);
  }

  const jobChangedHandler = (job: Job, type: 'add' | 'update' | 'delete') => {
    changeArrayByItem(jobs, job, type);
    if (type === 'update') {
      setSelectedJob(job); 
    }
  }

  return (
    <>
      <TableContainer overflowY='auto' h='100%'>
        <Table>
          <Thead position='sticky' top={0} zIndex={1}>
            <Tr bg={useColorModeValue('gray.50', 'gray.800')}>
              <Th >Agent</Th>
              <Th>Job No</Th>
              <Th>Start at</Th>
              <Th textAlign='right'>Duration</Th>
              <Th>Industry</Th>
              <Th>Status</Th>
              <Th textAlign='right'>Income</Th>
            </Tr>
          </Thead>
          <Tbody mt='30px'>
              {jobs.map((job, index) => {
                return (
                  <Tr
                    _hover={{
                      bg: hoverBackgroundColor,
                      cursor: 'pointer'
                    }}
                    position='relative'
                    key={index}
                    onClick={() => jobClickedHandler(job)}
                  >
                    <JobTableRow job={job} />
                  </Tr>
                )
              })}
          </Tbody>
        </Table>
        {shouldShowButton && 
          <Button 
            mt={2}
            w='full' 
            variant='ghost'
            onClick={loadMoreJobs}
          >
            Load more jobs
          </Button>
        }
      </TableContainer>

      <Modal
        isOpen={isOpenJobCard}
        onClose={onCloseJobCard}
        id='job-form-modal'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
            <Box>
              <JobCard job={selectedJob} onFinishCallBack={jobChangedHandler} closeCallBack={onCloseJobCard}/>
            </Box>
        </ModalContent>
      </Modal>
    </>
  )
}

export default JobTable
