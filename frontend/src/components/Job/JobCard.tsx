import { 
  Button, Divider, HStack, Icon, Progress, Spacer, Text, VStack, useDisclosure, useToast 
} from "@chakra-ui/react"
import { JOB_CATEGORY, JOB_STATUS, Job, Response } from "../../types/models"
import { getKeyByValue, jobCategoryIcon, jobStatusIcon, jobTypeIcon } from "../../types/utils"
import { useRef, useState } from "react"
import JobForm from "../Forms/JobForm"
import DeleteAlert from "../Common/CommonAlert"
import { DeleteJob } from "../../../wailsjs/go/main/App"
import { CalculateRouteSummary } from "@aws-sdk/client-location"
import { getAndUpdateJobTraffic } from "../../types/job"
import { MdDirectionsCar, MdOutlineLocationOn } from "react-icons/md"

interface JobCardProps {
  job: Job,
  onFinishCallBack?: Function
  closeCallBack?: Function 
}

function JobCard({ job, onFinishCallBack, closeCallBack }: JobCardProps) {
  const [ isCardDetail, setIsCardDetail ] = useState(true)
  const cancelRef = useRef(null);
  const toast = useToast();
  const traffic = job.Traffic ? JSON.parse(job.Traffic) as CalculateRouteSummary : '';
  const [ isInProgress, setIsInProgress ] = useState<boolean>(false);

  const { 
    isOpen: isOpenAlert, 
    onOpen: onOpenAlert, 
    onClose: onCloseAlert
  } = useDisclosure();

  const deleteJob = async () => {
    onCloseAlert();
    setIsInProgress(true);

    const response: Response = await DeleteJob(job);

    if (response.Status !== 'success') {
      console.error(response.Status);
      toast({
        description: "Failed to delete the job, please contact the administrator.",
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
      setIsInProgress(false);
      if (closeCallBack) closeCallBack();
      return;
    } else {
      await getAndUpdateJobTraffic(job);

      toast({
        description: "Job deleted successfully.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsInProgress(false);
      if (closeCallBack) closeCallBack();
      if (onFinishCallBack) onFinishCallBack(job, 'delete');
    }
  }

  return (
    <>
      {isCardDetail ? (
        <VStack mt={6} w='full'>
          <HStack w='full' spacing={4} px={8}>
            <Text as='b' fontSize='lg' w='25%'>Job No:</Text>
            <Text fontSize='lg' w='40%'>{job.AgentJobNumber}</Text>
            <Text>{jobCategoryIcon(job.Rate!.Category)} {jobTypeIcon(job.Rate!.Type)} {jobStatusIcon(job.Status)}</Text>
          </HStack>
          <Divider/>

          <VStack w='full' px={8} align='flex-end'>
            <HStack w='full' spacing={4} pt={2}>
              <Text w='25%'>Agent:</Text>
              <Text >{job.Agent?.Name}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text w='25%'>Category:</Text>
              <Text>{getKeyByValue(JOB_CATEGORY,job.Rate!.Category)}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text w='25%'>Customer:</Text>
              <Text>{job.Industry?.Name}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text w='25%'>Start At:</Text>
              <Text>{new Date(job.StartAt).toLocaleString('sv-SE')}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text w='25%'>Rate:</Text>
              <Text>{job.Rate?.Name}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text w='25%'>Duration:</Text>
              <Text>{job.Duration} minutes</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text w='25%'>Income:</Text>
              <Text>💰 {job.Income.toFixed(2)}</Text>
            </HStack>
            {job.Comments &&
              <HStack w='full' spacing={4} align='flex-start'>
                <Text w='25%'>Comments:</Text>
                <Text>{job.Comments}</Text>
              </HStack>
            }
            {job.Status === JOB_STATUS.Canceled && job.CancelAt &&
                <HStack w='full' spacing={4}>
                  <Text>Canceled At:</Text>
                  <Text>{new Date(job.CancelAt).toLocaleString('sv-SE')}</Text>
                </HStack>
              }
            <VStack w='full' align='flex-start'>
              <HStack w='full' align='flex-end'>
                {job.Address && 
                  <HStack align='flex-start'>
                    <Icon as={MdOutlineLocationOn} color='red' boxSize={5} />
                    <Text fontSize='sm'>{` ${job.Address}`}</Text>
                  </HStack>
                }
                <Spacer />
                {!traffic && <Text fontSize='xs' fontStyle='italic' fontWeight='light' >#{job.ID}</Text>}
              </HStack>

              {traffic && 
                <VStack align='flex-start' w='full' spacing={0}>
                  <HStack w='full' align='flex-start'>
                    <Icon as={MdDirectionsCar} color='teal' boxSize={5} /> 
                    <Text fontSize='sm'>
                      {` ${(traffic.Distance)?.toFixed(1)} ${traffic.DistanceUnit} - ${(Number(traffic.DurationSeconds)/60).toFixed(0)} minutes`}
                    </Text>
                    <Spacer />
                    <Text fontSize='xs' fontStyle='italic' fontWeight='light' >#{job.ID}</Text>
                  </HStack>
                </VStack>
              }
            </VStack>
          </VStack>

          
          <Divider />
          <VStack w='full' pt={2} px={8} spacing={1}>
            <Text as='b' w='full'>Rate detail</Text>
            <HStack w='full'>
              <Text w='full'>Minimum time:</Text>
              <Text w='full'>{job.Rate?.MinTime} minutes</Text>
            </HStack>
            <HStack w='full'>
              <Text w='full'>Minimum rate:</Text>
              <Text w='full'>$ {job.Rate?.MinTimeRate.toFixed(2)}</Text>
            </HStack>
            <HStack w='full'>
              <Text w='full'>Incremental rate:</Text>
              <Text w='full'>$ {job.Rate?.EachTimeRate.toFixed(2)} / {job.Rate?.EachTime} minutes</Text>
            </HStack>
          </VStack>
          { isInProgress &&
            <Progress size='sm' isIndeterminate w='full'/>
          }
          <Divider />
          <HStack w='full' spacing={0}>
            <Button
              w='full'
              onClick={()=>{setIsCardDetail(false)}}
              rounded='none'
            >
              Edit
            </Button>
            <Button
              w='full'
              colorScheme='red'
              rounded='none'
              onClick={onOpenAlert}
            >
              Delete
            </Button>
          </HStack>
        </VStack>
      ) : (
        <JobForm job={job} onFinishCallBack={onFinishCallBack} closeCallBack={closeCallBack}/>
      )}

      <DeleteAlert
        name='Job'
        cancelRef={cancelRef}
        onClose={onCloseAlert}
        isOpen={isOpenAlert}
        onDelete={deleteJob}
      />

    </>
  )
}

export default JobCard
