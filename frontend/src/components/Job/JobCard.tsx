import { 
  Button, Divider, HStack, Spacer, Text, VStack, useDisclosure, useToast 
} from "@chakra-ui/react"
import { JOB_CATEGORY, JOB_STATUS, Job, Response } from "../../types/models"
import { getKeyByValue, jobCategoryIcon, jobStatusIcon, jobTypeIcon } from "../../types/utils"
import { useRef, useState } from "react"
import JobForm from "../Forms/JobForm"
import DeleteAlert from "../Common/CommonAlert"
import { DeleteJob } from "../../../wailsjs/go/main/App"

interface JobCardProps {
  job: Job,
  onFinishCallBack?: Function
  closeCallBack?: Function 
}

function JobCard({ job, onFinishCallBack, closeCallBack }: JobCardProps) {
  const [ isCardDetail, setIsCardDetail ] = useState(true)
  const cancelRef = useRef(null);
  const toast = useToast();

  const { 
    isOpen: isOpenAlert, 
    onOpen: onOpenAlert, 
    onClose: onCloseAlert
  } = useDisclosure();

  const deleteJob = async () => {
    const response: Response = await DeleteJob(job);

    if (response.Status !== 'success') {
      console.log(response.Status);
      toast({
        description: "Failed to delete the job, please contact the administrator.",
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
      if (closeCallBack) closeCallBack();
      return;
    } else {
      toast({
        description: "Job deleted successfully.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
              <Text fontSize='lg' w='25%'>Agent:</Text>
              <Text fontSize='lg'>{job.Agent?.Name}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text fontSize='lg' w='25%'>Category:</Text>
              <Text fontSize='lg'>{getKeyByValue(JOB_CATEGORY,job.Rate!.Category)}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text fontSize='lg' w='25%'>Customer:</Text>
              <Text fontSize='lg'>{job.Industry?.Name}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text fontSize='lg' w='25%'>Start At:</Text>
              <Text fontSize='lg'>{new Date(job.StartAt).toLocaleString('sv-SE')}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text fontSize='lg' w='25%'>Rate:</Text>
              <Text fontSize='lg'>{job.Rate?.Name}</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text fontSize='lg' w='25%'>Duration:</Text>
              <Text fontSize='lg'>{job.Duration} minutes</Text>
            </HStack>
            <HStack w='full' spacing={4}>
              <Text fontSize='lg' w='25%'>Income:</Text>
              <Text fontSize='lg'>💰 {job.Income.toFixed(2)}</Text>
            </HStack>
            <HStack w='full' spacing={4} align='flex-start'>
              <Text fontSize='lg' w='25%'>Comments:</Text>
              <Text fontSize='lg'>{job.Comments}</Text>
            </HStack>
            {job.Status === JOB_STATUS.Canceled && job.CancelAt &&
                <HStack w='full' spacing={4}>
                  <Text fontSize='lg'>Canceled At:</Text>
                  <Text fontSize='lg'>{new Date(job.CancelAt).toLocaleString('sv-SE')}</Text>
                </HStack>
              }
            <HStack>
              <Spacer />
              <Text fontSize='xs' fontStyle='italic' fontWeight='light' >#{job.ID}</Text>
            </HStack>

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
          <Divider />
          <HStack w='full' pt={4} spacing={0}>
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

      {/* <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onCloseAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete 
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can not undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef} 
                onClick={onCloseAlert}
                px={6}
              >
                Cancel
              </Button>
              <Button 
                colorScheme='red' 
                px={6}
                onClick={()=>{}} 
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog> */}

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
