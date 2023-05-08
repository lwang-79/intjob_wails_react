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

export {
  sesSendEmail,
	getWeekNumber,
	splitNumbers,
}