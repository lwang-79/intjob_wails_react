import { 
  Box, 
  Button, 
  Card, 
  Divider, 
  HStack, 
  Heading, 
  Icon,
  IconButton, 
  Input, 
  Spacer, 
  Text,
  Tooltip, 
  VStack, 
  useColorModeValue, 
  useToast 
} from "@chakra-ui/react"
import { Location, LocationService } from "../../types/models"
import { useLayoutEffect, useRef, useState } from "react"
import { getPlace, searchPlaceIndex } from "../../types/location";
import { MdOutlineLocationOn } from "react-icons/md";
import { HiOutlineExternalLink } from "react-icons/hi";
import { SearchedPlace } from "../Forms/JobForm";
import { GetLocationService, SetLocationService } from "../../../wailsjs/go/settings/Settings";
import { BrowserOpenURL } from "../../../wailsjs/runtime/runtime";

const initLocation = {
  Address: '',
  Geometry: '',
  PlaceId: ''
}

function LocationServiceCard({ service }: {service: LocationService}) {
  const [ formState, setFormState ] = useState<LocationService>(service);
  const toast = useToast();
  const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const [ autoCompleteWidth, setAutoCompleteWidth] = useState(0);
  const fontColor = useColorModeValue('gray.900', 'gray.50');
  const [ placeOptions, setPlaceOptions ] = useState<Location[]>([]);
  const [ selectedLocation, setSelectedLocation ] = useState<Location>(initLocation);
  const optionColor = useColorModeValue('gray.50', 'gray.800');
  const [ isFirstRender, setIsFirstRender ] = useState<boolean>(true);

  useLayoutEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const inputElement = autoCompleteRef.current;
    if (!inputElement) {
      console.log('No input element');
      return;
    }

    const cardElement = cardRef.current;
    if (!cardElement) {
      console.log('No card element');
      return;
    }
  
    const inputRect = inputElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    const adjustedTop = inputRect.bottom - cardRect.top;
    const adjustedLeft = inputRect.left - cardRect.left;
    setAutoCompleteWidth(inputRect.width);
    setBoxPosition({ top: adjustedTop, left: adjustedLeft });
  }, [placeOptions.length === 0]);

  const setInput = (key: string) => (event: any) => {
    let value = event.target.value;

    if (key === 'FilterCountries') {
      value = [value]
    }

    setFormState({ 
      ...formState, 
      [key]: value
    });
  }

  const reloadButtonClickedHandler = async () => {
    const service = await GetLocationService();
    setFormState(service);
    setSelectedLocation(initLocation);
  }

  const saveButtonClickedHandler = async () => {
    try {
      await SetLocationService(formState);
      toast({
        description: 'Settings saved successfully. Please restart the application.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        description: 'Failed to save the settings.',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
    }
  }

  const timeoutRef = useRef<number|undefined>();
  const searchPlaces = async (keyWord: string) => {

    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      const searchedPlaces = await searchPlaceIndex(keyWord) as SearchedPlace[];
      const options = searchedPlaces.map(({ PlaceId, Text }) => ({PlaceId: PlaceId, Address: Text, Geometry: '' }));
      setPlaceOptions(options);
    }, 800);

  }

  const locationSelectedHandler = async (place: Location) => {
    setPlaceOptions([]);

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

  const changeHomeHandler = () => {
    if (selectedLocation.Geometry) {
      setFormState({
        ...formState,
        HomeGeometry: JSON.parse(selectedLocation.Geometry)
      });
    }
  
  }

  return (
    <Card w='full' ref={cardRef}>
      <VStack align='flex-start' w='full' spacing={0}>
        <HStack w='full' m={4} spacing={1} align='flex-start'>
          <Heading size='md'>Location Service</Heading>
          <IconButton
            aria-label='open'
            icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
            rounded='full'
            size='xs'
            variant='ghost'
            onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/welcome.html')}
          />
        </HStack>
        <Divider />
        <VStack p={4} align='flex-start' spacing={4} w='full'>
          <VStack w='full' align='flex-start'>
            <HStack>
              <Text>Region:</Text>
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/location-regions.html#available-regions')}
              />
            </HStack>
            <Input
              value={formState.Region}
              step={60}
              onChange={setInput('Region')}
              rounded={0}
            />
          </VStack>
          <VStack w='full' align='flex-start'>
            <HStack>
              <Text>Index Name:</Text>
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/places-prerequisites.html#create-place-index-resource')}
              />
            </HStack>
            <Input
              value={formState.IndexName}
              step={60}
              onChange={setInput('IndexName')}
              rounded={0}
            />
          </VStack>
          <VStack w='full' align='flex-start'>
            <HStack>
              <Text>Calculator Name:</Text>
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/routes-prerequisites.html#create-route-calculator-resource')}
              />
            </HStack>
            <Input
              value={formState.CalculatorName}
              step={60}
              onChange={setInput('CalculatorName')}
              rounded={0}
            />
          </VStack>
          <VStack w='full' align='flex-start'>
            <HStack>
              <Text>Identity Pool ID:</Text>
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/authenticating-using-cognito.html')}
              />
            </HStack>
            <Input
              value={formState.IdentityPoolID}
              step={60}
              onChange={setInput('IdentityPoolID')}
              rounded={0}
            />
          </VStack>
          <VStack w='full' align='flex-start'>
            <HStack>
              <Text>Country: (ISO 3166 Alpha-3)</Text>
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/search-place-index-autocomplete.html#autocomplete-country')}
              />
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://www.iso.org/obp/ui/#search')}
              />
            </HStack>
            <Input
              value={formState.FilterCountries[0]}
              step={60}
              onChange={setInput('FilterCountries')}
              rounded={0}
            />
          </VStack>
          <VStack w='full' align='flex-start'>
            <HStack w='full'>
              <Text>Home Geometry: {JSON.stringify(formState.HomeGeometry)}</Text>
              <IconButton
                aria-label='open'
                icon={<Icon as={HiOutlineExternalLink} boxSize={5}/>}
                rounded='full'
                size='xs'
                variant='ghost'
                onClick={()=>BrowserOpenURL('https://docs.aws.amazon.com/location/latest/developerguide/search-place-index-autocomplete.html#autocomplete-bbox')}
              />
            </HStack>

            <HStack w='full' spacing={1} >
              <Input 
                value={selectedLocation?.Address}
                placeholder='Search location'
                rounded={0}
                onChange={(e)=>{
                  setSelectedLocation({ PlaceId: '', Address: e.target.value, Geometry: '' });
                  searchPlaces(e.target.value);
                }}
                ref={autoCompleteRef}
              />
              <Tooltip
                label='Change home'
                hasArrow
              >
                <Box>
                  <IconButton
                    aria-label='Add Address'
                    size='sm'
                    rounded='full'
                    variant='ghost'
                    icon={<Icon as={MdOutlineLocationOn} boxSize={8} />}
                    onClick={changeHomeHandler}
                    isDisabled={selectedLocation.Geometry? false : true}
                  />
                </Box>
              </Tooltip>
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
          </VStack>
        </VStack>

        <Divider />
      </VStack>

      <HStack w='full' spacing={0} mt={4}>
        <Spacer />
        <Button
          w='50%'
          rounded={0}
          onClick={reloadButtonClickedHandler}
        >
          Reload
        </Button>
        <Button
          w='50%'
          colorScheme='red'
          rounded={0}
          onClick={saveButtonClickedHandler}
        >
          Save
        </Button>
      </HStack>

    </Card>
  )
}

export default LocationServiceCard
