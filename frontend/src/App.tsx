import { ChakraProvider, VStack } from "@chakra-ui/react"
import Header from "./components/Common/Header"
import Footer from "./components/Common/Footer"
import Dashboard from "./components/Dashboard/Dashboard"
import theme from "./types/theme"
import { DEFAULT_SHOW_STATUS, PAGES, changeStatus } from "./types/hub"
import { useState } from "react"
import JobsPanel from "./components/Job/JobsPanel"
import Report from "./components/Report/Report"
import DatabaseManagement from "./components/DatabaseManagement/DatabaseManagement"
import SettingsPanel from "./components/Settings/Settings"
import Help from "./components/Common/Help"

function App() {

  const [ showStatus, setShowStatus ] = useState(DEFAULT_SHOW_STATUS);

  const hubSwitch = (page: typeof PAGES[keyof typeof PAGES]) => {
    setShowStatus(changeStatus(showStatus, page));
  }

  return (
    <ChakraProvider theme={theme}>
      <Header hubSwitch={hubSwitch}/>

      <VStack minH='80vh' pt={20} pb={24} w='full'>
        {showStatus.dashboard && <Dashboard />}
        {showStatus.jobsPanel && <JobsPanel />}
        {showStatus.report && <Report />}
        {showStatus.database && <DatabaseManagement />}
        {showStatus.settings && <SettingsPanel />}
        {showStatus.help && <Help />}
      </VStack>
      <Footer />
    </ChakraProvider>
  )
}

export default App
