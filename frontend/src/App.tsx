import {useState} from 'react';
import {GetAgentById, GetCurrentDir} from "../wailsjs/go/main/App";
import { Button } from '@chakra-ui/react';

function App() {
  const [resultText, setResultText] = useState("Please enter your name below 👇");
  const [name, setName] = useState('');
  const updateName = (e: any) => setName(e.target.value);
  const updateResultText = (result: string) => setResultText(result);

  function greet() {
    GetAgentById(1).then(agent => {
        console.log(agent)
        
        updateResultText(agent.Name)
    });
    // GetCurrentDir().then(updateResultText)
  }

  return (
    <>
      <Button
          colorScheme="blue"
          variant="ghost"
          onClick={greet}
      >{resultText}</Button>
    </>
  )
}

export default App
