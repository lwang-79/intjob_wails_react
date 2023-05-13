import { 
  Button, 
  Card, 
  Divider, 
  HStack, 
  Modal, 
  ModalBody, 
  ModalCloseButton, 
  ModalContent, 
  ModalOverlay, 
  Spacer, 
  Tag, 
  Text, 
  VStack, 
  useDisclosure
} from "@chakra-ui/react"
import { JOB_STATUS, Job } from "../../types/models"
import { useEffect, useState } from "react"
import JobForm from "../Forms/JobForm";
import JobCard from "../Job/JobCard";
import { changeArrayByItem } from "../../types/utils";

function JobStatusCard({ jobs }: { jobs: Job[] }) {
  const [ upComingJobs, setUpComingJobs ] = useState<Job[]>([]);
  const [ booked, setBooked ] = useState(0);
  const [ completed, setCompleted ] = useState(0);
  const [ canceled, setCanceled ] = useState(0);
  const [ selectedJob, setSelectedJob ] = useState<Job>();

  const { 
    isOpen: isOpenJobForm, 
    onOpen: onOpenJobFrom, 
    onClose: onCloseJobForm
  } = useDisclosure();

  const { 
    isOpen: isOpenJobCard, 
    onOpen: onOpenJobCard, 
    onClose: onCloseJobCard
  } = useDisclosure();


  useEffect(() => {
    const upComingJobs = jobs.filter(job => new Date(job.StartAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.StartAt).getTime() - new Date(b.StartAt).getTime());
    setUpComingJobs(upComingJobs);

    const booked = jobs.filter(job => job.Status === JOB_STATUS.Booked).length;
    setBooked(booked);

    const today = new Date();
    const completed = jobs.filter(job => 
      new Date(job.StartAt).getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() && 
      job.Status === JOB_STATUS.Completed
    ).length;
    setCompleted(completed);

    const canceled = jobs.filter(job => 
      new Date(job.StartAt).getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() && 
      job.Status === JOB_STATUS.Canceled
    ).length;
    setCanceled(canceled);

  }, []);

  useEffect(()=>{
    if (selectedJob) {
      onOpenJobCard();
    } else {
      onCloseJobCard();
    }
  },[selectedJob]);

  const closeJobCard = () => {
    setSelectedJob(undefined);
    onCloseJobCard();
  }

  const jobChangedHandler = (job: Job, type: 'add' | 'update' | 'delete') => {
    changeArrayByItem(upComingJobs, job, type);
  }

  return (
    <>
      <Card w='full'>
        <VStack p={4} align='flex-start'>
          <HStack w='full'>
            <Text>📌 Job Status</Text>
            <Spacer />
            <Text>{new Date().toLocaleDateString('sv-SE')}</Text>
          </HStack>
          <Divider />
          {upComingJobs.length > 0 ? (
            <>
              <Text fontSize='sm'>{`Upcoming Jobs: ${upComingJobs.length}`}</Text>
              {upComingJobs.map((job, index) => (
                <Tag  
                  w='full' px={4}
                  key={`${job.ID}-${index}`}
                  _hover={{cursor: 'pointer'}}
                  onClick={() => setSelectedJob(job)}
                >
                  <HStack fontSize='sm' w='full'>
                    <Text>{new Date(job.StartAt).toLocaleString('sv-SE')}</Text>
                    <Spacer />
                    <Text>{job.Industry?.Name}</Text>
                  </HStack>
                </Tag>
              ))}
            </>
          ) : (
            <Text fontSize='sm'>No Upcoming Jobs</Text>
          )}
          <HStack w='full'>
            <Text fontSize='sm'>Booked: {booked}</Text>
            <Spacer />
            <Text fontSize='sm'>Completed: {completed}</Text>
            <Spacer />
            <Text fontSize='sm'>Canceled: {canceled}</Text>
          </HStack>
        </VStack>
        <Button
          onClick={onOpenJobFrom}
        >
          Add a new job
        </Button>
      </Card>

      <Modal
        isOpen={isOpenJobForm}
        onClose={onCloseJobForm}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
            <JobForm closeCallBack={onCloseJobForm}/>
        </ModalContent>
      </Modal>

      {selectedJob && 
        <Modal
          isOpen={isOpenJobCard}
          onClose={closeJobCard}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
                <JobCard job={selectedJob} onFinishCallBack={jobChangedHandler} closeCallBack={closeJobCard}/>
          </ModalContent>
        </Modal>
      }
    </>
  )
}

export default JobStatusCard
