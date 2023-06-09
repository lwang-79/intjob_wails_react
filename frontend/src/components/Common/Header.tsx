import {
  Box,
  Flex,
  Avatar,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  Container,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  useToast,
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { 
  MdDarkMode, 
  MdDownload, 
  MdLightMode, 
  MdLogout, 
  MdOutlineHelp, 
  MdOutlineSettings, 
  MdTranslate, 
} from 'react-icons/md';
import { TbDatabase } from "react-icons/tb";
import Support from './Support';
import { PAGES } from '../../types/hub';
import { ExportJob } from '../../../wailsjs/go/main/App';
import { Quit } from '../../../wailsjs/runtime/runtime';

const Pages = [PAGES.Dashboard, PAGES.JobsPanel, PAGES.Report];
const PageNames = ['Dashboard', 'My Jobs', 'Report']


interface HeaderProps {
  hubSwitch: (page: (typeof PAGES)[keyof typeof PAGES]) => void
}
export default function Header({ hubSwitch }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  const toast = useToast();
  const { 
    isOpen: isOpenSupportModal, 
    onOpen: onOpenSupportModal, 
    onClose: onCloseSupportModal
  } = useDisclosure();

  const exportJobsClickedHandler = async () => {
    const result = await ExportJob();
    if (result.includes('successfully')) {
      toast({
        description: result,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        description: result,
        status: 'error',
        duration: 8000,
        isClosable: true,
        position: 'top'
      });
    }
  }

  return (
    <>
      <Flex 
        bg={useColorModeValue('gray.100', 'gray.900')} 
        px={4} 
        w='full'
        position='fixed'
        as='header'
        zIndex={100}
      >
        <Container maxW="5xl">
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <HStack spacing={8} alignItems={'flex-end'}>
              <Box color={'teal.400'} cursor='pointer' onClick={() => hubSwitch(PAGES.Dashboard)}>
                <Icon as={MdTranslate}  boxSize={8}/> 
                <Text as='b'>
                  IntJob
                </Text>
              </Box>
              <HStack
                as={'nav'}
                spacing={0}
              >
                {Pages.map((page, index) => (
                  <Button 
                    variant='ghost'
                    onClick={() => hubSwitch(page)}
                    key={`${page}-${index}`}
                  >
                    {PageNames[index]}
                  </Button>
                ))}
              </HStack>
            </HStack>
            <Flex alignItems={'center'}>
              <Menu isLazy>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant='unstyled'
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'md'}
                    // name={"Lillian Yu"}
                    // src={user.picture}
                    showBorder
                    borderWidth='2px'
                    borderColor='gray.200'
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => hubSwitch(PAGES.Settings)}>
                    <HStack justifyContent={'center'}>
                      <Icon as={MdOutlineSettings} boxSize={6} color='gray.400' />
                      <span>Settings</span>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={() => hubSwitch(PAGES.Database)}>
                    <HStack justifyContent={'center'}>
                      <Icon as={TbDatabase} boxSize={6} color='gray.400' />
                      <span>Manage Data</span>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={exportJobsClickedHandler}>
                    <HStack justifyContent={'center'}>
                      <Icon as={MdDownload} boxSize={6} color='gray.400' />
                      <span>Export Jobs</span>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={toggleColorMode}>
                    <HStack justifyContent={'center'}>
                      {colorMode === 'light' ? <Icon as={MdDarkMode} boxSize={6} color='gray.400' /> : <Icon as={MdLightMode} boxSize={6} color='gray.400' />}
                      <span>Change Color</span>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={() => hubSwitch(PAGES.Help)}>
                    <HStack justifyContent={'center'}>
                      <Icon as={MdOutlineHelp} boxSize={6} color='gray.400' />
                      <span>Help</span>
                    </HStack>
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={Quit}>
                    <HStack justifyContent={'center'}>
                      <Icon as={MdLogout} boxSize={6} color='gray.400' />
                      <span>Quit</span>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>
        </Container>
      </Flex>

      <Modal
        isOpen={isOpenSupportModal}
        onClose={onCloseSupportModal}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign='center'>
            Please leave a message
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Support onClose={onCloseSupportModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}