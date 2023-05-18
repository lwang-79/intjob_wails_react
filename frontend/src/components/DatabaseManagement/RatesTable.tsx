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
import { useEffect, useRef, useState } from "react";
import { Agent, JOB_CATEGORY, JOB_TYPE, Rate, Response } from "../../types/models";
import { DeleteRate, ListAllAgents, ListAllRates, SaveRate } from "../../../wailsjs/go/main/App";
import GenericForm, { Field } from "../Forms/GenericForm";
import { getKeyByValue } from "../../types/utils";

interface FormRate {
  ID?: number,
  Name: string,
  MinTime: string,
  MinTimeRate: string,
  EachTime: string,
  EachTimeRate: string,
  EarlyCancelTime: string,
  EarlyCancelRate: string,
  LateCancelTime: string,
  LateCancelRate: string,
  DeductThreshold: string,
  DeductTime: string,
  Comments: string,
  Agent: string,
  Type: string,
  Category: string,
  Expired: string,
}

function RatesTable() {
  const hoverBackgroundColor = useColorModeValue('gray.200', 'gray.700');
  const [ rates, setRates ] = useState<Rate[]>([]);
  const [ agents, setAgents ] = useState<Agent[]>([]);
  const { 
    isOpen: isOpenForm, 
    onOpen: onOpenFrom, 
    onClose: onCloseForm
  } = useDisclosure();
  const toast = useToast();

  const formFieldsRef = useRef<Field[]>();

  const defaultValues:FormRate = {
    Name: '',
    MinTime: '0',
    MinTimeRate: '0',
    EachTime: '0',
    EachTimeRate: '0',
    EarlyCancelTime: '0',
    EarlyCancelRate: '0',
    LateCancelTime: '0',
    LateCancelRate: '0',
    DeductThreshold: '0',
    DeductTime: '0',
    Comments: '',
    Agent: '1',
    Type: '1',
    Category: '1',
    Expired: '0',
  };

  const [ selectedRate, setSelectedRate ] = useState(defaultValues);

  useEffect(() => {
    getAndSetRates();
    getAndSetAgents();
  },[]);

  useEffect(() => {
    if (agents.length === 0) return;

    const options: { value: number; label: string }[] = [];
    agents.forEach(agent => {
      options.push({ value: agent.ID!, label: agent.Name });
    });

    formFieldsRef.current = [
      {
        name: 'Agent',
        label: 'Agent',
        placeholder: 'Select agent',
        type: 'select',
        options: options,
        required: true
      },
      { name: 'Name', label: 'Name', placeholder: 'Rate name', required: true },
      { 
        name: 'Type', 
        label: 'Type', 
        placeholder: 'Select type', 
        type: 'select',
        options: [
          { value: 1, label: 'BH' },
          { value: 2, label: 'ABH' },
          { value: 3, label: 'SAT' },
          { value: 4, label: 'SUN' },
          { value: 5, label: 'PH' },
        ],
        required: true 
      },
      {
        name: 'Category',
        label: 'Category',
        placeholder: 'Select category',
        type: 'select',
        options: [
          { value: 1, label: 'Telephone' },
          { value: 2, label: 'OnSite' },
          { value: 3, label: 'Video' },
          { value: 4, label: 'Others' },
        ],
        required: true
      },
      { name: 'MinTime', label: 'Min Time', placeholder: 'Rate min time', required: true },
      { name: 'MinTimeRate', label: 'Min Time Rate', placeholder: 'Rate min time rate', required: true },
      { name: 'EachTime', label: 'Each Time', placeholder: 'Rate each time', required: true },
      { name: 'EachTimeRate', label: 'Each Time Rate', placeholder: 'Rate each time rate', required: true },
      { name: 'EarlyCancelTime', label: 'Early Cancel Time', placeholder: 'Rate early cancel time', required: true },
      { name: 'EarlyCancelRate', label: 'Early Cancel Rate', placeholder: 'Rate early cancel rate', required: true },
      { name: 'LateCancelTime', label: 'Late Cancel Time', placeholder: 'Rate late cancel time', required: true },
      { name: 'LateCancelRate', label: 'Late Cancel Rate', placeholder: 'Rate late cancel rate', required: true },
      { name: 'DeductThreshold', label: 'Deduct Threshold', placeholder: 'Rate deduct threshold', required: true },
      { name: 'DeductTime', label: 'Deduct Time', placeholder: 'Rate deduct time', required: true },
      { name: 'Comments', label: 'Comments', placeholder: 'Rate comments', required: false },
      {
        name: 'Expired',
        label: 'Expired',
        placeholder: 'Is expired?',
        type: 'select',
        options: [
          { value: 0, label: 'False' },
          { value: 1, label: 'True' },
        ],
        required: true
      },
    ];
  },[agents.length]);

  const getAndSetRates = async () => {
    const response: Response = await ListAllRates();

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    setRates(response.Result as Rate[]);
  }

  const getAndSetAgents = async () => {
    const response: Response = await ListAllAgents();

    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    setAgents(response.Result as Agent[]);
  }

  const selectedHandler = (rate: Rate | FormRate) => {
    setSelectedRate({
      ID: rate.ID,
      Name: rate.Name,
      MinTime: rate.MinTime.toString(),
      MinTimeRate: rate.MinTimeRate.toString(),
      EachTime: rate.EachTime.toString(),
      EachTimeRate: rate.EachTimeRate.toString(),
      EarlyCancelTime: rate.EarlyCancelTime.toString(),
      EarlyCancelRate: rate.EarlyCancelRate.toString(),
      LateCancelTime: rate.LateCancelTime.toString(),
      LateCancelRate: rate.LateCancelRate.toString(),
      DeductThreshold: rate.DeductThreshold.toString(),
      DeductTime: rate.DeductTime.toString(),
      Comments: rate.Comments,
      Agent: 'AgentID' in rate ? rate.AgentID.toString() : rate.Agent,
      Type: rate.Type.toString(),
      Category: rate.Category.toString(),
      Expired: rate.Expired? '1' : '0',
    });
    setTimeout(()=>{
      onOpenFrom();
    }, 100);
  }

  const submitHandler = async (rate: FormRate, isDelete: boolean) => {
    console.log(rate);

    const newRate:Rate = {
      ID: rate.ID,
      Name: rate.Name,
      MinTime: parseInt(rate.MinTime),
      MinTimeRate: parseFloat(rate.MinTimeRate),
      EachTime: parseInt(rate.EachTime),
      EachTimeRate: parseFloat(rate.EachTimeRate),
      EarlyCancelTime: parseInt(rate.EarlyCancelTime),
      EarlyCancelRate: parseFloat(rate.EarlyCancelRate),
      LateCancelTime: parseInt(rate.LateCancelTime),
      LateCancelRate: parseFloat(rate.LateCancelRate),
      DeductThreshold: parseInt(rate.DeductThreshold),
      DeductTime: parseInt(rate.DeductTime),
      Comments: rate.Comments,
      AgentID: parseInt(rate.Agent),
      Type: parseInt(rate.Type),
      Category: parseInt(rate.Category),
      Expired: rate.Expired === '1',
    }

    const response: Response = isDelete ? 
      await DeleteRate(newRate) :
      await SaveRate(newRate);

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
    getAndSetRates();
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
          Add a new rate
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
                <Th>Agent ID</Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Category</Th>
                <Th isNumeric>Min Time</Th>
                <Th isNumeric>Min Time Rate</Th>
                <Th isNumeric>Each Time</Th>
                <Th isNumeric>Each Time Rate</Th>
                <Th isNumeric>Early Cancel Time</Th>
                <Th isNumeric>Early Cancel Rate</Th>
                <Th isNumeric>Late Cancel Time</Th>
                <Th isNumeric>Late Cancel Rate</Th>
                <Th isNumeric>Deduct Threshold</Th>
                <Th isNumeric>Deduct Time</Th>
                <Th>Comments</Th>
                <Th>Expired</Th>
              </Tr>
            </Thead>
            <Tbody mt='30px'>
                {rates.map((rate, index) => {
                  return (
                    <Tr
                      _hover={{
                        bg: hoverBackgroundColor,
                        cursor: 'pointer'
                      }}
                      position='relative'
                      key={index}
                      onClick={() => selectedHandler(rate)}
                    >
                      <Td>{rate.Agent!.Name}</Td>
                      <Td>{rate.Name}</Td>
                      <Td>{getKeyByValue(JOB_TYPE, rate.Type)}</Td>
                      <Td>{getKeyByValue(JOB_CATEGORY, rate.Category)}</Td>
                      <Td isNumeric>{rate.MinTime}</Td>
                      <Td isNumeric>{rate.MinTimeRate}</Td>
                      <Td isNumeric>{rate.EachTime}</Td>
                      <Td isNumeric>{rate.EachTimeRate}</Td>
                      <Td isNumeric>{rate.EarlyCancelTime}</Td>
                      <Td isNumeric>{rate.EarlyCancelRate}</Td>
                      <Td isNumeric>{rate.LateCancelTime}</Td>
                      <Td isNumeric>{rate.LateCancelRate}</Td>
                      <Td isNumeric>{rate.DeductThreshold}</Td>
                      <Td isNumeric>{rate.DeductTime}</Td>
                      <Td>{rate.Comments}</Td>
                      <Td>{rate.Expired}</Td>
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
          {formFieldsRef.current &&<GenericForm 
            initialValues={selectedRate}
            fields={formFieldsRef.current}
            onSubmit={submitHandler}
          />}
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default RatesTable
