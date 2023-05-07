import { Box, Button, ChakraProvider, VStack } from "@chakra-ui/react"
import Header from "./components/Common/Header"
import JobByDateChart from "./components/Dashboard/JobByDateChart"
import Footer from "./components/Common/Footer"
import Dashboard from "./components/Dashboard/Dashboard"
import theme from "./types/theme"

function App() {

  return (
    <ChakraProvider theme={theme}>
      <Header/>

      <VStack minH='80vh' pt={20}>
      <Button
      >test</Button>
      <Dashboard />

      </VStack>
      <Footer />
    </ChakraProvider>
  )
}

export default App
