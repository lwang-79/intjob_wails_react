import { 
  Box, 
  Button, 
  Divider, 
  HStack, 
  Icon,
  IconButton, 
  Input, 
  Progress, 
  Radio, 
  RadioGroup, 
  Select, 
  Spacer, 
  Text, 
  Tooltip, 
  VStack, 
  useColorModeValue, 
  useToast 
} from "@chakra-ui/react";
import { Agent, Industry, JOB_CATEGORY, JOB_STATUS, Job, Location, Rate, Response } from "../../types/models"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GetRatesByAgentTypeAndCategory, ListAllAgents, ListAllIndustries, ListAllLocations, SaveJob, SaveLocation } from "../../../wailsjs/go/repository/Repo";
import { calculateIncome, getAndUpdateJobTraffic, getJobType } from "../../types/job";
import { getKeyByValue, jobTypeIcon } from "../../types/utils";
import { getPlace, searchPlaceIndex } from "../../types/location";
import { MdAdd, MdContentPaste } from "react-icons/md";
import { ClipboardGetText } from "../../../wailsjs/runtime/runtime";

export interface SearchedPlace {
  PlaceId: string
  Text: string
}

interface JobFormProps {
  job?: Job
  onFinishCallBack?: Function
  closeCallBack?: Function
}

function JobForm({ job, onFinishCallBack, closeCallBack }: JobFormProps) {
  const isNew = !job;
  const title = isNew ? "Add Job" : "Edit Job";
  const categories = Object.values(JOB_CATEGORY);
  const [ agents, setAgents ] = useState<Agent[]>([]);
  const [ industries, setIndustries ] = useState<Industry[]>([]);
  const [ rates, setRates ] = useState<Rate[]>([]);
  const [ selectedCategory, setSelectedCategory ] = useState(
    !isNew && job.Rate ? job.Rate.Category : categories[1]
  );
  const [ selectedRate, setSelectedRate ] = useState<Rate>();
  const [ jobType, setJobType ] = useState(1);
  const [ income, setIncome ] = useState(!isNew ? job.Income : 0);
  const [ placeOptions, setPlaceOptions ] = useState<Location[]>([]);
  const [ selectedLocation, setSelectedLocation ] = useState<Location>(job ? {
    Address: job.Address?? '',
    Geometry: job.Location?? '',
    PlaceId: ''
  } : {
    Address: '',
    Geometry: '',
    PlaceId: ''
  });
  const [ favoriteLocations, setFavoriteLocations ] = useState<Location[]>([]);

  const [ isFirstRender, setIsFirstRender ] = useState<boolean>(true);
  const toast = useToast();
  const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const [ autoCompleteWidth, setAutoCompleteWidth] = useState(0);
  const fontColor = useColorModeValue('gray.900', 'gray.50');
  const [ isInProgress, setIsInProgress ] = useState<boolean>(false);
  const optionColor = useColorModeValue('gray.50', 'gray.800');


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
  },[]);

  useLayoutEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const inputElement = autoCompleteRef.current;
    if (!inputElement) {
      return;
    }
  
    const modalElement = document.getElementById('chakra-modal-job-form-modal');
    if (!modalElement) {
      console.log('No modal element');
      return;
    }

    const inputRect = inputElement.getBoundingClientRect();
    const modalRect = modalElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const adjustedTop = inputRect.bottom - modalRect.top + scrollTop;
    const adjustedLeft = inputRect.left - modalRect.left + scrollLeft;

    setAutoCompleteWidth(inputRect.width);
    setBoxPosition({ top: adjustedTop, left: adjustedLeft });
  }, [placeOptions.length === 0]);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    getAndUpdateRates(agents, industries)
    .then(rates => {
      setDefaultRate(rates);
    });
    
  },[formState.AgentID, formState.StartAt, selectedCategory, formState.IndustryID, industries]);

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

    const industries = response.Result as Industry[];
    setIndustries(industries);

    const rates = await getAndUpdateRates(agents, industries);

    if (!isNew) {
      const rate = rates.find(rate => rate.ID === formState.RateID);
      if (rate) {
        setSelectedRate(rate);
        setIncome(calculateIncome(formState, rate));
      }
    } else if(rates[0].ID) {
      setFormState({
        ...formState,
        RateID: rates[0].ID
      })

      setSelectedRate(rates[0]);
      setIncome(calculateIncome(formState, rates[0]));
    }

    response = await ListAllLocations();
    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const locations = response.Result as Location[];
    setFavoriteLocations(locations);
  }

  const getAndUpdateRates = async (agents: Agent[], industries: Industry[]): Promise<Rate[]> => {
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

  const setDefaultRate = (rates: Rate[]) => {
    if (!industries || !isNew) {
      setFormState({
        ...formState,
        RateID: rates[0].ID!
      });

      setSelectedRate(rates[0]);
      return rates;
    }

    let industryName = industries.find((industry) => industry.ID === formState.IndustryID)!.Name;
    
    if (['Government', 'Health', 'Police'].includes(industryName)) industryName = 'Gov';

    let isRateSelected = false;
    for (const rate of rates) {
      if (rate.Name.toLowerCase().includes(industryName.toLowerCase())) {
        setFormState({
          ...formState,
          RateID: rate.ID!
        });

        setSelectedRate(rate);
        isRateSelected = true;
        break;
      } 
    }

    if (!isRateSelected) {
      const rate = rates.find(rate => 
        !rate.Name.toLowerCase().includes('gov') &&
        !rate.Name.toLowerCase().includes('vicroads')
      );
      if (rate) {
        setFormState({
          ...formState,
          RateID: rate.ID!
        });

        setSelectedRate(rate);
      } else {
        setFormState({
          ...formState,
          RateID: rates[0].ID!
        });

        setSelectedRate(rates[0]);
      }
    }
  }

  const setInput = (key: string) => (event: any) => {
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

  const timeoutRef = useRef<number|undefined>();
  const searchPlaces = async (keyWord: string) => {

    if (!keyWord) {
      setPlaceOptions(favoriteLocations);
      return;
    }

    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      const searchedPlaces = await searchPlaceIndex(keyWord) as SearchedPlace[];
      const options = searchedPlaces.map(({ PlaceId, Text }) => ({PlaceId: PlaceId, Address: Text, Geometry: '' }));
      setPlaceOptions(options);
    }, 800);

  }

  const locationSelectedHandler = async (place: Location) => {
    clearTimeout(timeoutRef.current);
    setPlaceOptions([]);

    if (place.Geometry) {
      setSelectedLocation(place);
      return;
    }

    setSelectedLocation({
      ...selectedLocation,
      Address: place.Address,
    });

    const geometry = await getPlace(place.PlaceId);
    if (!geometry) {
      toast({
        description: "No geometry for this place, try another.",
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    setSelectedLocation({
      PlaceId: place.PlaceId,
      Address: place.Address,
      Geometry: JSON.stringify(geometry)
    });

  }

  const hasBeenFocused = useRef(false);
  const locationOnFocusHandler = () => {
    hasBeenFocused.current = true;
    if (selectedLocation.Address){
      return;
    }

    setPlaceOptions(favoriteLocations);
  }

  const locationOnBlurHandler = () => {
    hasBeenFocused.current = false;
    if (selectedLocation.Address){
      return;
    }

    timeoutRef.current = setTimeout(()=>{
      setPlaceOptions([]);
    },200);
  }

  const addFavoriteLocation = async () => {
    if (favoriteLocations.length >= 10) {
      toast({
        description: 'Max allowed favorite location is 10, please remove some before add a new one.',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    const response: Response = await SaveLocation(selectedLocation);

    if (response.Status !== 'success') {
      console.error(response.Status);
      toast({
        description: 'Failed to save the location, please contact the administrator.',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
    } else {
      setFavoriteLocations([...favoriteLocations, selectedLocation]);
      toast({
        description: 'Location saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const pasteClickedHandler = async () => {
    const value = await ClipboardGetText();
    setFormState({
      ...formState,
      AgentJobNumber: value
    })
  }

  const submit = async (button: string) => {
    setIsInProgress(true);

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
      Status : button === 'Complete' ? JOB_STATUS.Completed : 
        button === 'Book' ? JOB_STATUS.Booked : formState.Status,
      Address: selectedLocation.Address?? undefined,
      Location: selectedLocation.Geometry?? undefined
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
      setIsInProgress(false);
      return;
    } 

    let updatedJob = response.Result as Job;

    const trafficResult = await getAndUpdateJobTraffic(updatedJob);
    if (trafficResult?.updatedJob) {
      updatedJob = trafficResult.updatedJob;
    }

    if (
      trafficResult && 
      trafficResult.traffic &&
      trafficResult.traffic
    ) {
      toast({
        description: `Job saved successfully. 
          Distance to previous job is ${(trafficResult.traffic.Distance)?.toFixed(1)} ${trafficResult.traffic.DistanceUnit}. 
          Estimated traffic time is ${(Number(trafficResult.traffic.DurationSeconds)/60).toFixed(0)} minutes`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        description: "Job saved successfully.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    const type = button === 'Save' ? 'update' : 'add'
    if (onFinishCallBack) onFinishCallBack(updatedJob, type);
    if (closeCallBack) closeCallBack();
    setIsInProgress(false);
  }

  return (
    <>
      <VStack mt={4} w='full'>
        <Text fontSize="2xl">{title}</Text>
        <Divider />
        <VStack w='full' px={4} py={2} align='flex-end'>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text>Agent:</Text>
            <Select 
              w='70%'
              value={formState.AgentID}
              onChange={setInput('AgentID')}
              rounded={0}
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
            <Text>Category:</Text>
            <Select 
              w='70%'
              value={selectedCategory}
              onChange={(e)=>onCategoryChanged(e)}
              rounded={0}
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
            <Text>Customer:</Text>
            <Select 
              w='70%'
              value={formState.IndustryID}
              onChange={setInput('IndustryID')}
              rounded={0}
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
            <Text>Job No.:</Text>
            <HStack w='70%' spacing={0}>
              <Input 
                value={formState.AgentJobNumber}
                onChange={setInput('AgentJobNumber')}
                placeholder='Agent job number'
                rounded={0}
              />
              <IconButton
                aria-label='Paste'
                size='sm'
                rounded='full'
                variant='ghost'
                icon={<Icon as={MdContentPaste} boxSize={6} />}
                onClick={pasteClickedHandler}
              />
            </HStack>
          </HStack>

          <HStack w='full' spacing={4}>
            <Spacer />
            <Text>Location:</Text>
            <HStack w='70%' spacing={0} ref={autoCompleteRef}>
              <Input 
                value={selectedLocation?.Address}
                placeholder='Search location'
                rounded={0}
                onChange={(e)=>{
                  setSelectedLocation({ PlaceId: '', Address: e.target.value, Geometry: '' });
                  searchPlaces(e.target.value);
                }}
                onFocus={locationOnFocusHandler}
                onBlur={locationOnBlurHandler}
                isDisabled={selectedCategory!==JOB_CATEGORY.OnSite}
              />
              <Tooltip
                label='Add Favorite Location'
                hasArrow
              >
                <Box>
                  <IconButton
                    aria-label='Add Address'
                    size='sm'
                    rounded='full'
                    variant='ghost'
                    icon={<Icon as={MdAdd} boxSize={6} />}
                    onClick={addFavoriteLocation}
                    isDisabled={selectedLocation.Geometry? false : true}
                  />
                </Box>
              </Tooltip>
            </HStack>
            
          </HStack>

          {placeOptions.length > 0 &&
            <Box
              position='absolute'
              zIndex={100}
              top={`${boxPosition.top}px`}
              left={`${boxPosition.left}px`}
              w={autoCompleteWidth}
              p={2}
              bgColor={optionColor}
            >
              <VStack 
                spacing={1}
                align='flex-start'
                w='full'
              >
                {placeOptions.map((place, index) => (
                  <Text
                    key={index}
                    fontSize='xs'
                    whiteSpace='nowrap'
                    overflow="hidden"
                    w='full'
                    _hover={{
                      cursor: 'pointer',
                      whiteSpace: 'normal',
                      color: fontColor,
                      fontWeight: 'bold',
                    }}
                    onClick={()=>locationSelectedHandler(place)}
                  >
                    {place.Address}
                  </Text>
                ))}
              </VStack>

            </Box>
          }

          <HStack w='full' spacing={4}>
            <Spacer />
            <Text>{jobTypeIcon(jobType)} Start At:</Text>
              <Input 
                type='datetime-local'
                w='70%'
                defaultValue={formState.StartAt}
                step={60}
                onChange={setInput('StartAt')}
                rounded={0}
              />
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text>Rate:</Text>
            <Select 
              w='70%'
              value={formState.RateID}
              onChange={setInput('RateID')}
              rounded={0}
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
            <Text>Duration:</Text>
            <Input 
              w='70%'
              type='number'
              step={1}
              value={formState.Duration.toString()}
              onChange={setInput('Duration')}
              rounded={0}
            />
          </HStack>
          <HStack w='full' spacing={4}>
            <Spacer />
            <Text>Comments:</Text>
              <Input 
                w='70%'
                value={formState.Comments}
                placeholder='Comments'
                onChange={setInput('Comments')}
                rounded={0}
              />
          </HStack>

          

          {!isNew && 
            <>
              <RadioGroup onChange={(v) => setStatus(v)} value={formState.Status.toString()}>
                <HStack spacing={4} mt={2}>
                  <Spacer />
                  <Text>Status:</Text>
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
                  <Text>Cancel At:</Text>
                    <Input 
                      type='datetime-local'
                      w='70%'
                      defaultValue={formState.CancelAt}
                      step={60}
                      onChange={setInput('CancelAt')}
                      rounded={0}
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
        { isInProgress &&
          <Progress size='sm' isIndeterminate w='full'/>
        }
        <HStack w='full' spacing={0}>
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
