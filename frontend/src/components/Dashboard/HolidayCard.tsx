import { Button, Card, Divider, HStack, Spacer, Text, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { Holiday, Response } from "../../types/models"
import { ListHolidays } from "../../../wailsjs/go/main/App";

function HolidayCard() {

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  useEffect(() => {
    getAndSetHolidays();
  }, []);

  const getAndSetHolidays = async () => {
    const response: Response = await ListHolidays('');
    if (response.Status !== 'success') {
      console.error(response.Status);
      return;
    }

    const holidays = response.Result as Holiday[];

    const today = new Date();
    const filteredHolidays = holidays.filter(holiday => 
      new Date(holiday.Date).getTime() > new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    ).sort((a,b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    setHolidays(filteredHolidays.length > 5 ? filteredHolidays.slice(0, 5) : filteredHolidays);
  }

  // useEffect(() => {
  //   fetch('https://date.nager.at/api/v2/publicholidays/2021/US')
  //     .then(res => res.json())
  //     .then(data => setHolidays(data))
  // }, [])
  
  // console.log(holidays)  
  return (
    <Card w='full'>
      <VStack p={4} align='flex-start'>
        <Text>🏖️ Upcoming Public Holidays</Text>
        <Divider />
        {holidays.map((holiday, index) => (
          <HStack key={index} w='full'>
            <Text fontSize='sm'>{holiday.Date.slice(0,10)}</Text>
            <Spacer />
            <Text fontSize='sm'>{holiday.Name}</Text>
          </HStack>
        ))}
      </VStack>
      <Button
      >
        Manage holidays
      </Button>
    </Card>
  )
}

export default HolidayCard
