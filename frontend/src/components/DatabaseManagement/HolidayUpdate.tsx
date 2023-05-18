import { Button, Divider, Progress, Text, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { updateHolidays } from "../../types/holiday";
import { Holiday } from "../../types/models";


function HolidayUpdate({ lastHolidayDate, onFinish }: { lastHolidayDate: string, onFinish: ()=>void }) {
  const [ isInProgress, setIsInProgress ] = useState(false);
  const [ fetched, setFetched ] = useState(false);
  const [ holidays, setHolidays ] = useState<Holiday[]>([]);

  const updateButtonClickedHandler = async () => {
    setIsInProgress(true);

    const holidays = await updateHolidays(lastHolidayDate, 'AU', 'VIC');
    if (holidays) {
      setHolidays(holidays);
    }

    setFetched(true);
    setIsInProgress(false);
    onFinish();
  }

  return (
    <>
      <VStack spacing={6}>
        <VStack mt={10} mx={6}>
          <Text fontSize='lg'>The tool will try to update holidays from the last holiday to upto 2 years holidays. Some holidays like Melbourne Cup and AFL Grand Final may not be updated automatically and need to add them manually.</Text>
        </VStack>
        <Divider />
        { isInProgress &&
          <Progress size='sm' isIndeterminate w='full'/>
        }
        <Button
          w='full'
          rounded={0}
          onClick={updateButtonClickedHandler}
          isDisabled={fetched}
        >
          Start update
        </Button>

        {fetched && 
          <VStack pb={6} align='flex-start'>
            {holidays.length > 0 ?
              <>
                <Text as='b'>{holidays.length} holidays found:</Text>
                {holidays.map((holiday, index) => (
                  <Text key={index}>{holiday.Date} {holiday.Name}</Text>
                ))}
              </>
              :
              <Text>No holidays found</Text>
            }
          </VStack>
        }
      </VStack>
      
    </>
  )
}

export default HolidayUpdate
