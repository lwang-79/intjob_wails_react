import { Button, Divider, HStack, Input, Radio, RadioGroup, Select, Spacer, Text, VStack, useToast } from "@chakra-ui/react";
import { Agent, Industry, JOB_CATEGORY, JOB_STATUS, JOB_TYPE, Job, Rate, Response } from "../../types/models"
import { useEffect, useRef, useState } from "react";
import { GetRatesByAgentTypeAndCategory, ListAllAgents, ListAllIndustries, SaveJob } from "../../../wailsjs/go/main/App";
import { calculateIncome, getJobType } from "../../types/job";
import { getKeyByValue, jobTypeIcon } from "../../types/utils";

interface JobFormProps {
  job?: Job
  onFinishCallBack?: Function
  closeCallBack?: Function
}

function JobForm({ job, onFinishCallBack, closeCallBack }: JobFormProps) {
  const isNew = !job;
  const title = isNew ? "Add Job" : "Edit Job";
  const categories = Object.values(JOB_CATEGORY);
  const statuses = Object.keys(JOB_STATUS);
  const [ agents, setAgents ] = useState<Agent[]>([]);
  const [ industries, setIndustries ] = useState<Industry[]>([]);
  const [ rates, setRates ] = useState<Rate[]>([]);
  const [ selectedCategory, setSelectedCategory ] = useState(
    !isNew && job.Rate ? job.Rate.Category : categories[1]
  );
  const [ selectedRate, setSelectedRate ] = useState<Rate>();
  const [ jobType, setJobType ] = useState(1);
  const [ income, setIncome ] = useState(!isNew ? job.Income : 0);
  const agentJobNumberRef = useRef<string>(
    !isNew && job.AgentJobNumber ? job.AgentJobNumber : ''
  );
  const commentsRef = useRef<string>(!isNew && job.Comments ? job.Comments : '');
  const [ isFirstRender, setIsFirstRender ] = useState<boolean>(true);
  const toast = useToast();


  const [ formState, setFormState ] = useState<Job>(job ? {
    ...job,
    StartAt: new Date(job.StartAt).toLocaleString('sv-SE').slice(0,16),
    CancelAt: job.Status === JOB_STATUS.Canceled && job.CancelAt ? 
      new Date(job.CancelAt).toLocaleString('sv-SE').slice(0,16) : 
      new Date().toLocaleString('sv-SE').slice(0,16),
  } : {
    ID: 0,
    AgentID: 3,
    AgentJobNumber: '',
    StartAt: new Date(new Date(new Date().setHours(new Date().getHours() + 1)).setMinutes(0)).toLocaleString('sv-SE').slice(0,16),
    Duration: 60,
    Income:  0,
    IndustryID: 9,
    RateID: 1,
    Status: JOB_STATUS.Booked,
    CancelAt: '',
    Comments: ''
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    getAndUpdateRates(agents).then(rates => {
      if (rates[0].ID) {
        setFormState({
          ...formState,
          RateID: rates[0].ID
        })
  
        setSelectedRate(rates[0]);
      }
    });
  },[formState.AgentID, formState.StartAt, selectedCategory]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const rate = rates.find(rate => rate.ID === formState.RateID);
    if (rate) {
      setSelectedRate(rate);
      setIncome(calculateIncome(formState, rate));
    }
  },[formState.RateID]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    if (selectedRate){
      setIncome(calculateIncome(formState, selectedRate));
    }
  },[formState.Status, formState.CancelAt]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    if (selectedRate) {
      setIncome(calculateIncome(formState, selectedRate));
    }
  },[formState.Duration]);

  const init = async () => {
    let response: Response = await ListAllAgents();
    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const agents = response.Result as Agent[];
    setAgents(agents);

    response = await ListAllIndustries();
    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    setIndustries(response.Result as Industry[]);

    const rates = await getAndUpdateRates(agents);

    if (!isNew) {
      console.log(formState.RateID)
      const rate = rates.find(rate => rate.ID === formState.RateID);
      console.log(rate)
      if (rate) {
        setSelectedRate(rate);
        setIncome(calculateIncome(formState, rate));
      }
    } else if (rates[0].ID) {
      setFormState({
        ...formState,
        RateID: rates[0].ID
      })

      setSelectedRate(rates[0]);
      setIncome(calculateIncome(formState, rates[0]));
    }
  }

  const getAndUpdateRates = async (agents: Agent[]): Promise<Rate[]> => {
    const type = await getJobType(formState, agents);
    setJobType(type);

    const response: Response = await GetRatesByAgentTypeAndCategory(
      formState.AgentID, 
      type,
      selectedCategory
    );

    if (response.Status !== 'success') {
      console.error(response.Status);
      return[];
    }
    
    const rates = response.Result as Rate[];
    setRates(rates);
    return rates;
  }

  const setInput = (key: string) => (event: any) => {
    console.log(event.target.value)
    let value = event.target.value;
    if (!['StartAt', 'CancelAt', 'AgentJobNumber', 'Comments'].includes(key)) {
      value = Number(value);
    }

    setFormState({ 
      ...formState, 
      [key]: value
    });
  }

  const setStatus = (value: string) => {
    setFormState({
      ...formState,
      Status: Number(value)
    });
  }

  const onCategoryChanged = (event: any) => {
    const category = Number(event.target.value);
    setSelectedCategory(category);
    if (category === JOB_CATEGORY.Telephone) {
      setFormState({
        ...formState,
        Duration: 15
      })
    }
  }

  const submit = async (button: string) => {
    const startAt = new Date(formState.StartAt).toISOString().replace('.000', '');

    const cancelAt = formState.Status === JOB_STATUS.Canceled && 
      formState.CancelAt ? 
      new Date(formState.CancelAt).toISOString().replace('.000', '') : '';

    const newJob: Job = {
      ...formState,
      StartAt: startAt,
      CancelAt: cancelAt,
      Rate: undefined,
      Industry: undefined,
      Agent: undefined,
      AgentJobNumber: agentJobNumberRef.current,
      Comments: commentsRef.current,
      Status : button === 'Complete' ? JOB_STATUS.Completed : 
        button === 'Book' ? JOB_STATUS.Booked : formState.Status
    }

    const response: Response = await SaveJob(newJob);

    if (response.Status !== 'success') {
      console.error(response.Status);
      toast({
        description: "Failed to save the job, please contact the administrator.",
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
      if (closeCallBack) closeCallBack();
      return;
    } else {
      toast({
        description: "Job saved successfully.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    const updatedJob = response.Result as Job;
    const type = button === 'Save' ? 'update' : 'add'
    if (onFinishCallBack) onFinishCallBack(updatedJob, type);
    if (closeCallBack) closeCallBack();
  }

  return (
    <>
      <VStack mt={4} w='full'>
        <Text fontSize="2xl">{title}</Text>
        <Divider />
        <VStack w='full' px={4} py={2} align='flex-end'>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Agent:</Text>
            <Select 
              w='70%'
              value={formState.AgentID}
              onChange={setInput('AgentID')}
            >
              {agents.map((agent, index) => (
                <option 
                  key={`${agent}-${index}`}
                  value={agent.ID}
                >
                  {agent.Name}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Category:</Text>
            <Select 
              w='70%'
              value={selectedCategory}
              onChange={(e)=>onCategoryChanged(e)}
            >
              {categories.map((category, index) => (
                <option 
                  key={`${category}-${index}`}
                  value={category}
                >
                  {getKeyByValue(JOB_CATEGORY, category)}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Customer:</Text>
            <Select 
              w='70%'
              value={formState.IndustryID}
              onChange={setInput('IndustryID')}
            >
              {industries.map((industry, index) => (
                <option 
                  key={`${industry}-${index}`}
                  value={industry.ID}
                >
                  {industry.Name}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Job No.:</Text>
              <Input 
                w='70%'
                defaultValue={formState.AgentJobNumber}
                onChange={(e)=>{agentJobNumberRef.current = e.target.value as string}}
                placeholder='Agent job number'
              />
          </HStack>

          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>{jobTypeIcon(jobType)} Start At:</Text>
              <Input 
                type='datetime-local'
                w='70%'
                defaultValue={formState.StartAt}
                step={60}
                onChange={setInput('StartAt')}
              />
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Rate:</Text>
            <Select 
              w='70%'
              value={formState.RateID}
              onChange={setInput('RateID')}
            >
              {rates.map((rate, index) => (
                <option 
                  key={`${rate}-${index}`}
                  value={rate.ID}
                >
                  {rate.Name}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Duration:</Text>
            <Input 
              w='70%'
              type='number'
              step={1}
              value={formState.Duration.toString()}
              onChange={setInput('Duration')}
            />
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text fontSize='lg'>Comments:</Text>
              <Input 
                w='70%'
                defaultValue={formState.Comments}
                placeholder='Comments'
                onChange={(e)=>{commentsRef.current = e.target.value as string}}
              />
          </HStack>
          {!isNew && 
            <>
              <RadioGroup onChange={(v) => setStatus(v)} value={formState.Status.toString()}>
                <HStack spacing={4} mt={2}>
                  <Spacer />
                  <Text fontSize='lg'>Status:</Text>
                  <HStack>
                    <Radio value={JOB_STATUS.Booked.toString()}>Booked</Radio>
                    <Radio value={JOB_STATUS.Canceled.toString()}>Canceled</Radio>
                    <Radio value={JOB_STATUS.Completed.toString()}>Completed</Radio>
                  </HStack>
                </HStack>
              </RadioGroup>

              {formState.Status === JOB_STATUS.Canceled && 
                <HStack w='full' spacing={4}>
                  <Spacer />
                  <Text fontSize='lg'>Cancel At:</Text>
                    <Input 
                      type='datetime-local'
                      w='70%'
                      defaultValue={formState.CancelAt}
                      step={60}
                      onChange={setInput('CancelAt')}
                    />
                </HStack>
              }
            </>
          }

        </VStack>
        <Divider />
        {selectedRate && <VStack w='full' pt={2} px={8} spacing={1}>
          <HStack w='full'>
            <Text w='full'>Minimum time:</Text>
            <Text w='full'>{selectedRate.MinTime} minutes</Text>
          </HStack>
          <HStack w='full'>
            <Text w='full'>Minimum rate:</Text>
            <Text w='full'>$ {selectedRate.MinTimeRate.toFixed(2)}</Text>
          </HStack>
          <HStack w='full'>
            <Text w='full'>Incremental rate:</Text>
            <Text w='full'>$ {selectedRate.EachTimeRate.toFixed(2)} / {selectedRate.EachTime} minutes</Text>
          </HStack>
          <HStack w='full'>
            <Text w='full'>Estimated Income:</Text>
            <Text w='full'>💰 {income}</Text>
          </HStack>
        </VStack>}
        <Divider />
        <HStack w='full' pt={2} spacing={0}>
          <Button
            w='full'
            rounded='none'
            onClick={ isNew ? 
              ()=>submit('Complete') :
              ()=>submit('Save')
            }
          >
            {isNew ? 'Complete' : 'Save'}
          </Button>
          <Button
            w='full'
            colorScheme='red'
            rounded='none'
            onClick={ isNew ?
              ()=>submit('Book') :
              closeCallBack ? ()=>closeCallBack() : ()=>{}
            }
          >
            {isNew ? 'Book' : 'Close'}
          </Button>
        </HStack>
      </VStack>
    </>
  )
}

export default JobForm
