import { 
  Button, 
  Divider, 
  HStack, 
  Heading, 
  Icon,
  IconButton, 
  Spacer, 
  Text, 
  VStack 
} from "@chakra-ui/react"
import { SiNotion } from "react-icons/si";
import { BrowserOpenURL } from "../../../wailsjs/runtime/runtime"

function Help() {
  return (
    <VStack
      w='full'
      maxW='3xl'
      align='flex-start'
      spacing={4}
    >
      <HStack w='full'>
        <Heading size='lg'>Tips</Heading>
        <Spacer />
        <Button
          variant='ghost'
          size='sm'
          onClick={()=>BrowserOpenURL('https://jinpearl.notion.site/jinpearl/IntJob-473607b4ad464cb1b2466554020435a2')}
        >
          <Icon as={SiNotion} boxSize={5}/>
          <Text ml={2}>Docs</Text>
        </Button>
      </HStack>
      <Text>
        Main features can be accessed from two places menu bar and admin dropdown menu.
      </Text>
      <Text as='b' fontSize='lg'>
        Menu bar
      </Text>
      <Text>
        Dashboard -- Shows the static data and current job status as well as shot cut button to core features. <br/>
        My Jobs -- Shows the job list, the list can be filtered by properties and date. Here is also the main entry to update and delete jobs. <br/>
        Report -- Shows the report of a given date range including the claimable traffic. <br/>
      </Text>
      <Text as='b' fontSize='lg'>
        Admin dropdown menu
      </Text>
      <Text>
        Settings -- Configure location service and backup database.<br/>
        Manage Data -- Manage the database, create new agents, rates, holidays and so on.<br/>
        Export Jobs -- Export the job list to a csv file.<br/>
        Change Color -- Switch the app light/dark color mode.<br/>
      </Text>
      <Divider />
      <Heading size='md'>Job</Heading>
      <Text>
        - Job has three status: booked, completed and canceled. <br/>
        - If job start time is later than the current time, the job will be shown in the upcoming jobs card of the dashboard. <br/>
        - You can add a job from the dashboard or the my jobs list. <br/>
        - Filter the job status in the job list can find out the uncompleted jobs quickly. <br/>
      </Text>
      <Divider />
      <Heading size='md'>Location</Heading>
      <Text>
        - Location is used to calculate the claimable traffic distance between two onsite jobs. You don't need to add location for non onsite jobs. <br/>
        - You can add upto 10 favorite locations. In the job form (add a new job or update an existing job), when the location field is focused, the favorite locations will be the default options. After type in some key words in the location field, the app will use Amazon Location Service to search the place. After the place is selected, you can choose to add it to the favorite locations. <br/>
        - There is a shot cut button in the dashboard location card to manage the favorite locations. <br/>
        - When Amazon Location Service searches the place, the result filtered by country and around the home location which can be set in the admin menu settings. <br/>
      </Text>
      <Divider />
      <Heading size='md'>Holiday</Heading>
      <Text>
        - Holiday is used to choose the rates on public holidays. Therefore we need to add the public holidays regularly into the database. <br/>
        - There is a tool to fetch the next two years Victoria's public holidays from internet. The tool can be accessed from dashboard or the admin menu manage data holidays tab. <br/>
        - The tool may not fetch all the holidays, so for some missed holidays you need to add them manually from the admin menu manage data holiday tab. <br/>
      </Text>
      <Divider />
      <HStack w='full'>
        <Spacer />
        <Text>For my wife ❤️ 2023-05-20</Text>
      </HStack>
    </VStack>
  )
}

export default Help
