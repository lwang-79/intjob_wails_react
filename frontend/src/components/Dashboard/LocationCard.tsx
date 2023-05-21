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
  Modal, 
  ModalCloseButton, 
  ModalContent, 
  ModalOverlay, 
  Spacer, 
  Tag, 
  TagCloseButton, 
  Text, 
  Tooltip, 
  VStack, 
  useColorModeValue, 
  useDisclosure, 
  useToast
} from "@chakra-ui/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Location, Response } from "../../types/models";
import { DeleteLocation, ListAllLocations, SaveLocation } from "../../../wailsjs/go/repository/Repo";
import { MdAdd } from "react-icons/md";
import { getPlace, searchPlaceIndex } from "../../types/location";
import { SearchedPlace } from "../Forms/JobForm";

const initLocation = {
  Address: '',
  Geometry: '',
  PlaceId: ''
}

function LocationCard() {
  const [ locations, setLocations ] = useState<Location[]>([]);
  const toast = useToast();
  const { 
    isOpen: isOpenModal, 
    onOpen: onOpenModal, 
    onClose: onCloseModal
  } = useDisclosure();

  const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
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
  
    const modalElement = document.getElementById('chakra-modal-location');
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
    ListAllLocations().then(response => {
      if (response.Status !== 'success') {
        console.error(response.Status);
        return;
      }
      const locations = response.Result as Location[];
      setLocations(locations)
    });
  },[]);

  const deleteLocation = async (index: number) => {
    const response: Response = await DeleteLocation(locations[index]);

    if (response.Status !== 'success') {
      console.error(response.Status);
      toast({
        description: 'Failed to delete the location, please contact the administrator.',
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
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

  const addFavoriteLocation = async () => {
    if (locations.length >= 10) {
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
      setLocations([...locations, selectedLocation]);
      setSelectedLocation(initLocation);
      toast({
        description: 'Location saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const closeLocationHandler = () => {
    setSelectedLocation(initLocation);
    setPlaceOptions([]);
    onCloseModal();
  }



  return (
    <>
      <Card w='full'>
        <VStack align='flex-start'>
          <Text px={4} pt={4}>📍 Favorite Locations</Text>
          <Divider />
          <VStack w='full' px={4} pb={4}>
            <Text as='b' fontSize='2xl'>{locations.length}</Text>
            <Text fontSize='sm'>Total allowed 10</Text>
          </VStack>
        </VStack>
        <Button
          onClick={onOpenModal}
        >
          Manage Locations
        </Button>
      </Card>
      
      <Modal
        isOpen={isOpenModal}
        onClose={closeLocationHandler}
        closeOnOverlayClick={false}
        id='location'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton  />
            <VStack mt={4} mb={4} spacing={4}>
              <Heading size='md'>Manage Locations</Heading>
              <Divider />
              <HStack w='full' spacing={1} px={4} >
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

              <Divider />

              <VStack px={4}>
                {locations.map((location, index) => (
                  <Tag key={index} colorScheme='teal' w='full' p={2}>
                    <Text
                      whiteSpace='normal'
                    >
                      {location.Address}
                    </Text>
                    <Spacer />
                    <TagCloseButton onClick={() => deleteLocation(index)} />
                  </Tag>
                ))}
              </VStack>
            </VStack>
        </ModalContent>
      </Modal>
    </>
  )
}

export default LocationCard
