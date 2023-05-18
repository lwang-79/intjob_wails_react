import { Tab, TabList, TabPanel, TabPanels, Tabs, VStack } from "@chakra-ui/react"
import AgentsTable from "./AgentsTable"
import IndustriesTable from "./IndustriesTable"
import HolidaysTable from "./HolidaysTable"
import RatesTable from "./RatesTable"

function DatabaseManagement() {
  return (
    <VStack maxW='5xl' w='full' mx='auto'>
      <Tabs w='full' variant='enclosed'>
        <TabList>
          <Tab>Agents</Tab>
          <Tab>Rates</Tab>
          <Tab>Industries</Tab>
          <Tab>Holidays</Tab>
        </TabList>
      
        <TabPanels>
          <TabPanel>
            <AgentsTable />
          </TabPanel>
          <TabPanel>
            <RatesTable />
          </TabPanel>
          <TabPanel>
            <IndustriesTable />
          </TabPanel>
          <TabPanel>
            <HolidaysTable />
          </TabPanel>
        </TabPanels>
      </Tabs>

    </VStack>
  )
}

export default DatabaseManagement
