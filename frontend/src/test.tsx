import {useState} from 'react';
import {DeleteAgent, GetAgentById, GetCurrentDir, GetHolidayById, GetIndustryById, GetRateById, ListAllAgents, ListAllRates, SaveAgent, SaveJob} from "../wailsjs/go/main/App";
import { Button } from '@chakra-ui/react';
import { Agent, Holiday, Industry, Job, Rate } from './models';

function test() {

  const [resultText, setResultText] = useState("Please enter your name below 👇");
  const [name, setName] = useState('');
  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);

  function greet() {
    const job: Job = {
      StartAt: "2020-02-02T08:00:00Z",
      Duration: 30,
      Income: 59,
      AgentID: 1,
      IndustryID: 1,
      Status: 1,
      RateID: 1,

    }

    // ListAllRates().then(result => {
    //   if (result.Status !== 'success'){
    //     console.error(result.Status)
    //     return
    //   }
    //   console.log(result)
    //   const agents = result.Result as Rate[]
    //   updateResultText(agents[40].Agent.BusinessHourEnd)
    // })
    

    SaveJob(job).then(result => {
      if (result.Status !== 'success'){
        console.error(result.Status)
        return
      }
      console.log(result)
      const agent = result.Result as Job
      updateResultText(agent.StartAt)
    
    })

    // DeleteAgent(agent).then(result => {
    //   if (result.Status !== 'success'){
    //     console.error(result.Status)
    //     return
    //   }
    //   console.log(result)
    // })
    // GetHolidayById(1).then(result => {
    //     if (result.Status !== 'success'){
    //       console.error(result.Status)
    //       return
    //     }
    //     console.log(result)
    //     const agent = result.Result as Holiday
    //     updateResultText(agent.Name)
    // });
    // GetCurrentDir().then(updateResultText)
  }

  return (
    <>
      <Button
          colorScheme="blue"
          variant="ghost"
          onClick={greet}
      >{resultText}</Button>
    </>
  )
}

export default test
