import { Button, Card, Divider, HStack, Heading, Spacer, Text, VStack, useToast } from "@chakra-ui/react"
import { BackupDatabase } from "../../../wailsjs/go/main/App"

function DatabaseCard({ path }: { path: string }) {

  const toast = useToast();

  const downloadButtonClickedHandler = async () => {
    const result = await BackupDatabase();
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
    <Card w='full'>
      <VStack align='flex-start' spacing={0}>
        <Heading size='md' m={4}>Database</Heading>
        <Divider />
        <VStack p={4} align='flex-start' spacing={4} w='full'>
          <HStack w='full'>
            <Text>Path: {path}</Text>
            <Spacer />
            <Button
              variant='ghost'
              onClick={downloadButtonClickedHandler}
            >
              Backup to another folder
            </Button>

          </HStack>
        </VStack>
      </VStack>
    </Card>
  )
}

export default DatabaseCard
