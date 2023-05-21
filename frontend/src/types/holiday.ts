import { SaveHoliday } from "../../wailsjs/go/repository/Repo";
import { Holiday } from "./models";

interface APIReturnedHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  type: string;
}

export const updateHolidays = async (
  lastHolidayDate: string,
  countryCode: string, 
  stateCode: string
) => {

  const currentYear = new Date().getFullYear();
  const lastHolidayYear = new Date(lastHolidayDate).getFullYear();

  let year = lastHolidayYear;
  let holidays: Holiday[] = [];

  do {
    const response = await fetch(`https://date.nager.at/api/v2/publicholidays/${year}/${countryCode}`);
    if (!response.ok) continue;
    
    const data = await response.json() as APIReturnedHoliday[];

    if (data.length === 0) continue;

    for (const h of data) {
      if (
        (h.counties === null ||
        h.counties.includes(`${countryCode}-${stateCode}`)) &&
        h.date > lastHolidayDate
      ) {

        const holiday: Holiday = {
          Date: h.date,
          Name: h.name,
        };
        
        holidays.push(holiday);

        await SaveHoliday(holiday);
      }
    }
    year++;
  }
  while (year <= currentYear + 2);

  return holidays;

}