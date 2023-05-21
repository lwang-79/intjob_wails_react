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
import { Industry, Response } from "../../types/models";
import { DeleteIndustry, ListAllIndustries, SaveIndustry } from "../../../wailsjs/go/repository/Repo";
import GenericForm from "../Forms/GenericForm";

function IndustriesTable() {
  const hoverBackgroundColor = useColorModeValue('gray.200', 'gray.700');
  const [ industries, setIndustries ] = useState<Industry[]>([]);
  const { 
    isOpen: isOpenForm, 
    onOpen: onOpenFrom, 
    onClose: onCloseForm
  } = useDisclosure();
  const toast = useToast();

  const formFields = [
    { name: 'Name', label: 'Name', placeholder: 'Agent name', required: true },
  ];

  const defaultValues: Industry = {
    Name: '',
  };

  const [ selectedIndustry, setSelectedIndustry ] = useState<Industry>(defaultValues);

  useEffect(() => {
    getAndSetIndustries();
  },[]);

  const getAndSetIndustries = async () => {
    const response: Response = await ListAllIndustries();

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    setIndustries(response.Result as Industry[]);
  }

  const selectedHandler = (industry: Industry) => {
    setSelectedIndustry(industry);
    setTimeout(()=>{
      onOpenFrom();
    }, 100);
  }

  const submitHandler = async (industry: Industry, isDelete: boolean) => {
    const response: Response = isDelete ? 
      await DeleteIndustry(industry) :
      await SaveIndustry(industry);

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
    getAndSetIndustries();
  }

  return (
    <VStack w='full'>
      <HStack w='full' px={4}>
        <Text>Click to edit the item.</Text>
        <Spacer />
        <Button
          variant='ghost'
          onClick={()=>selectedHandler(defaultValues)}
        >
          Add a new industry
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
                <Th>Name</Th>
              </Tr>
            </Thead>
            <Tbody mt='30px'>
                {industries.map((industry, index) => {
                  return (
                    <Tr
                      _hover={{
                        bg: hoverBackgroundColor,
                        cursor: 'pointer'
                      }}
                      position='relative'
                      key={index}
                      onClick={() => selectedHandler(industry)}
                    >
                      <Td>{industry.Name}</Td>
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
        id='job-form-modal'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton  />
          <GenericForm 
            initialValues={selectedIndustry}
            fields={formFields}
            onSubmit={submitHandler}
          />
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default IndustriesTable
