import { 
  Box,
  Button, 
  HStack, 
  Modal, 
  ModalCloseButton, 
  ModalContent, 
  ModalOverlay, 
  Spacer, 
  Table, 
  TableContainer, 
  Tbody, 
  Td, Text, Th, Thead, Tr, 
  VStack, 
  useColorModeValue, 
  useDisclosure,
  useToast
} from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { Holiday, Response } from "../../types/models";
import { DeleteHoliday, ListHolidays, SaveHoliday } from "../../../wailsjs/go/main/App";
import GenericForm from "../Forms/GenericForm";
import HolidayUpdate from "./HolidayUpdate";

function HolidaysTable() {
  const hoverBackgroundColor = useColorModeValue('gray.200', 'gray.700');
  const [ holidays, setHolidays ] = useState<Holiday[]>([]);
  const { 
    isOpen: isOpenForm, 
    onOpen: onOpenFrom, 
    onClose: onCloseForm
  } = useDisclosure();
  const { 
    isOpen: isOpenFetch, 
    onOpen: onOpenFetch, 
    onClose: onCloseFetch
  } = useDisclosure();
  const toast = useToast();

  const formFields = [
    { name: 'Date', label: 'Date', placeholder: 'Holiday date, format: 2023-05-16', required: true },
    { name: 'Name', label: 'Name', placeholder: 'Holiday name', required: true },
  ];

  const defaultValues: Holiday = {
    Date: '',
    Name: '',
  };

  const [ selectedHoliday, setSelectedHoliday ] = useState<Holiday>(defaultValues);

  useEffect(() => {
    getAndSetHolidays();
  },[]);

  const getAndSetHolidays = async () => {
    const response: Response = await ListHolidays('', 50);

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    setHolidays(response.Result as Holiday[]);
  }

  const selectedHandler = (holiday: Holiday) => {
    setSelectedHoliday({
      ...holiday,
      Date: holiday.Date.slice(0,10),
    });
    setTimeout(()=>{
      onOpenFrom();
    }, 100);
  }

  const submitHandler = async (holiday: Holiday, isDelete: boolean) => {
    const response: Response = isDelete ? 
      await DeleteHoliday(holiday) :
      await SaveHoliday(holiday);

    if (response.Status !== 'success') {
      console.error(response.Status);
      toast({
        description: 'Something wrong with the database, please check the log.',
        status: 'error',
        duration: 10000,
        isClosable: true,
        position: 'top'
      });
    }

    onCloseForm();
    getAndSetHolidays();
  }

  return (
    <VStack w='full'>
      <HStack w='full' px={4}>
        <Text>Click to edit the item.</Text>
        <Spacer />
        <Button
          variant='ghost'
          onClick={onOpenFetch}
        >
          Fetch holidays from internet
        </Button>
        <Button
          variant='ghost'
          onClick={()=>selectedHandler(defaultValues)}
        >
          Add a new holiday
        </Button>
      </HStack>

      <Box
        overflowY='hidden'
        h='70vh'
        w='full'
      >
        <TableContainer overflowY='auto' h='100%' w='full'>
          <Table>
            <Thead position='sticky' top={0} zIndex={1}>
              <Tr bg={useColorModeValue('gray.50', 'gray.800')}>
                <Th>Date</Th>
                <Th>Name</Th>
              </Tr>
            </Thead>
            <Tbody mt='30px'>
                {holidays.map((holiday, index) => {
                  return (
                    <Tr
                      _hover={{
                        bg: hoverBackgroundColor,
                        cursor: 'pointer'
                      }}
                      position='relative'
                      key={index}
                      onClick={() => selectedHandler(holiday)}
                    >
                      <Td>{holiday.Date.slice(0,10)}</Td>
                      <Td>{holiday.Name}</Td>
                    </Tr>
                  )
                })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Modal
        isOpen={isOpenForm}
        onClose={onCloseForm}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton  />
          <GenericForm 
            initialValues={selectedHoliday}
            fields={formFields}
            onSubmit={submitHandler}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenFetch}
        onClose={onCloseFetch}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton  />
          {holidays.length > 0 && 
            <HolidayUpdate lastHolidayDate={holidays[0].Date} onFinish={getAndSetHolidays}/>
          }
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default HolidaysTable
