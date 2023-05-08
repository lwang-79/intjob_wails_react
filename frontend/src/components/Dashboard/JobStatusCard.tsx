import { Button, Card, HStack, Spacer, Text, VStack } from "@chakra-ui/react"
import { JOB_STATUS, Job } from "../../types/models"
import { useEffect, useState } from "react"

function JobStatusCard({ jobs }: { jobs: Job[] }) {
  const [ upComingJobs, setUpComingJobs ] = useState<Job[]>([]);
  const [ booked, setBooked ] = useState(0);
  const [ completed, setCompleted ] = useState(0);
  const [ canceled, setCanceled ] = useState(0);

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


  return (
    <Card w='full'>
      <VStack p={4} align='flex-start'>
        <HStack w='full'>
          <Text fontSize='lg'>📆 Job Status</Text>
          <Spacer />
          <Text>{new Date().toLocaleDateString('sv-SE')}</Text>
        </HStack>
        {upComingJobs.length > 0 ? (
          <Text fontSize='sm'>{`Upcoming Jobs: ${upComingJobs.length}`}</Text>
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
      >
        Add a new job
      </Button>
    </Card>
  )
}

export default JobStatusCard
