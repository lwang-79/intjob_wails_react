import { HStack, Td, Tr, useColorModeValue } from "@chakra-ui/react"
import { JOB_STATUS, Job } from "../../types/models"
import { getKeyByValue } from "../../types/utils";

function JobTableRow({ job }: { job: Job }) {
  return (
    <>
      <Td>{job.Agent?.Name}</Td>
      <Td>{job.AgentJobNumber}</Td>
      <Td>{new Date(job.StartAt).toLocaleString('sv-SE')}</Td>
      <Td textAlign='right'>{job.Duration} minutes</Td>
      <Td>{job.Industry?.Name}</Td>
      <Td>{getKeyByValue(JOB_STATUS, job.Status)}</Td>
      <Td textAlign='right'>${job.Income.toFixed(2)}</Td>
    </>
  )
}

export default JobTableRow
