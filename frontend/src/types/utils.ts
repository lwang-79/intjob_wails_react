import { JOB_CATEGORY, JOB_STATUS, JOB_TYPE, Job } from "./models";

async function sesSendEmail(to:string[], subject:string, message:string) {
	const body = {
		'from': 'leon.wang79@gmail.com',
		'to': to,
		'subject': subject,
		'message': message
	}

	await fetch(
		'https://lelnuzxenk.execute-api.ap-southeast-2.amazonaws.com/production/sendbasicemail', 
		{
			method: 'POST',
			body: JSON.stringify(body),
			headers: {'Content-Type': 'application/json'}
		}
	);
}

function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const firstMondayOfYear = new Date(target.getFullYear(), 0, 1 + (8 - (new Date(target.getFullYear(), 0, 1).getDay() || 7)) % 7);
  const weekNumber = Math.floor((target.getTime() - firstMondayOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return weekNumber === 0 ? 52 : weekNumber;
}

function splitNumbers(numbers: number[]): number[] {
  const sortedNumbers = [...numbers].sort((a, b) => a - b);

  const maxNumber = sortedNumbers[sortedNumbers.length - 1];
  const minNumber = sortedNumbers[0];

  if (maxNumber - minNumber < 5) {
    return sortedNumbers;
  }

  const splitIndex = sortedNumbers.findIndex((dateNumber, index) => index > 0 && dateNumber - sortedNumbers[index - 1] > 2);

  const firstPart = sortedNumbers.slice(splitIndex);
  const secondPart = sortedNumbers.slice(0, splitIndex);

  return [...firstPart, ...secondPart];
}

function getKeyByValue(obj: Object, value: number) {
  for (let prop in obj) {
    if (obj[prop as keyof typeof obj] as any as number === value) {
      return prop;
    }
  }
}

function jobStatusIcon(status: number) {
	return status === JOB_STATUS.Booked ? '⏰' :
		status === JOB_STATUS.Completed ? '✅' : '⛔';
}

function jobCategoryIcon(category: number) {
	return category === JOB_CATEGORY.OnSite ? '🚗' :
	category === JOB_CATEGORY.Telephone ? '☎️' : 
	category === JOB_CATEGORY.Video ? '💻' : ''
}

function jobTypeIcon(type: number) {
	return type === JOB_TYPE.ABH ? '🌜' : 
		type !== JOB_TYPE.BH ? '🏖️' : ''
}

function industryIcon(name: string) {
	return name === 'Health' ? '🏥' :
		name === 'Housing' ? '🏚️' :
		name === 'Job Agent' ? '' :
		name === 'Police' ? '🚓' :
		name === 'Red Cross' ? '' :
		name === 'School' ? '🎓' :
		name === 'VicRoads' ? '🚧' :
		name === 'Insurance' ? '' :
		name === 'Government' ? '🏛️' :
		name === 'Other' ? '' : ''
}

function changeArrayByItem<T extends {ID?: number}> (
	items: T[],
	item: T,
	type: 'add' | 'update' | 'delete'
): T[]{

	if (type === 'add') {
		items.unshift(item);
		return items;
	}

	const index = items.findIndex(i => i.ID === item.ID);
	if (index === -1) return items;

	if (type === 'update') {
		items[index] = item;
	}
	if (type === 'delete') {
		items.splice(index, 1);
	}

	return items;
}

export {
	changeArrayByItem,
  sesSendEmail,
	getKeyByValue,
	getWeekNumber,
	jobCategoryIcon,
	jobStatusIcon,
	jobTypeIcon,
	splitNumbers,
}