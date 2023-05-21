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
import { Agent, Response } from "../../types/models";
import { DeleteAgent, ListAllAgents, SaveAgent } from "../../../wailsjs/go/repository/Repo";
import GenericForm from "../Forms/GenericForm";

function AgentsTable() {
  const hoverBackgroundColor = useColorModeValue('gray.200', 'gray.700');
  const [ agents, setAgents ] = useState<Agent[]>([]);
  const { 
    isOpen: isOpenForm, 
    onOpen: onOpenFrom, 
    onClose: onCloseForm
  } = useDisclosure();
  const toast = useToast();

  const formFields = [
    { name: 'Name', label: 'Name', placeholder: 'Agent name', required: true },
    { name: 'FullName', label: 'Full Name', placeholder: 'Agent full name', required: false },
    { name: 'Address', label: 'Address', placeholder: 'Agent address', required: false },
    { name: 'PhoneNumber', label: 'Phone Number', placeholder: 'Agent phone number', required: false },
    { name: 'Email', label: 'Email', placeholder: 'Agent email', required: false },
    { name: 'BusinessHourStart', label: 'Business Hour Start', placeholder: 'Agent business hour start', required: true },
    { name: 'BusinessHourEnd', label: 'Business Hour End', placeholder: 'Agent business hour end', required: true },
  ];

  const defaultValues: Agent = {
    Name: '',
    FullName: '',
    Address: '',
    PhoneNumber: '',
    Email: '',
    BusinessHourStart: '',
    BusinessHourEnd: '',
  };

  const [ selectedAgent, setSelectedAgent ] = useState<Agent>(defaultValues);

  useEffect(() => {
    getAndSetAgents();
  },[]);

  const getAndSetAgents = async () => {
    const response: Response = await ListAllAgents();

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    setAgents(response.Result as Agent[]);
  }

  const selectedHandler = (agent: Agent) => {
    setSelectedAgent(agent);
    setTimeout(()=>{
      onOpenFrom();
    }, 100);
  }

  const submitHandler = async (agent: Agent, isDelete: boolean) => {
    const response: Response = isDelete ? 
      await DeleteAgent(agent) :
      await SaveAgent(agent);

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
    getAndSetAgents();
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
          Add a new agent
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
                {/* <Th>FullName</Th>
                <Th>Address</Th> */}
                <Th>PhoneNumber</Th>
                <Th>Email</Th>
                <Th isNumeric>Business Hour Start</Th>
                <Th isNumeric>Business Hour End</Th>
              </Tr>
            </Thead>
            <Tbody mt='30px'>
                {agents.map((agent, index) => {
                  return (
                    <Tr
                      _hover={{
                        bg: hoverBackgroundColor,
                        cursor: 'pointer'
                      }}
                      position='relative'
                      key={index}
                      onClick={() => selectedHandler(agent)}
                    >
                      <Td>{agent.Name}</Td>
                      {/* <Td>{agent.FullName}</Td>
                      <Td>{agent.Address}</Td> */}
                      <Td>{agent.PhoneNumber}</Td>
                      <Td>{agent.Email}</Td>
                      <Td isNumeric>{agent.BusinessHourStart}</Td>
                      <Td isNumeric>{agent.BusinessHourEnd}</Td>
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
            initialValues={selectedAgent}
            fields={formFields}
            onSubmit={submitHandler}
          />
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default AgentsTable
