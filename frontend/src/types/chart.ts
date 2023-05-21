import { JOB_STATUS, Job } from "./models";
import { getWeekNumber, splitNumbers } from "./utils";

type ChartData = {
  categories: string[],
  series: {
    name: string, 
    type: string,
    yAxis: number,
    data: number[],
    dataLabels: {
      enabled: boolean,
    } 
  }[]
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const makeJobColumnData = (
  jobs: Job[], 
  startDate: Date,
  endDate: Date,
  category: 'Day' | 'Week' | 'Month'
): ChartData => {
  const filteredJobs = jobs.filter(job => 
    job.Status === JOB_STATUS.Completed &&
    new Date(job.StartAt).toLocaleDateString('sv-SE') >= startDate.toLocaleDateString('sv-SE') && 
    new Date(job.StartAt).toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')
  );

  const incomeData: number[] = [];
  const jobsData: number[] = [];
  const durationData: number[] = [];
  

  if (category === 'Day') {
    const dayData: {[day: string]: {income: number, jobs: number, duration: number}} = {};
    let currentDate = new Date(startDate);
    while (currentDate.toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')) {
      const dateString = currentDate.toLocaleDateString('sv-SE');
      dayData[dateString] = {income: 0, jobs: 0, duration: 0};
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const job of filteredJobs) {
      const localDate = new Date(job.StartAt).toLocaleDateString('sv-SE');

      if (!dayData[localDate]) {
        continue;
      }
      
      dayData[localDate].income += job.Income;
      dayData[localDate].jobs += 1;
      dayData[localDate].duration += job.Duration;
    }

    // Sort the days in ascending order and convert them to strings
    const days = Object.keys(dayData).map(day => day).sort((a, b) => a > b ? 1 : -1).map(day=>day);
  
    for (const day of days) {
      incomeData.push(Math.round((dayData[day].income) * 100) / 100);
      jobsData.push(dayData[day].jobs);
      durationData.push(Math.round((dayData[day].duration / 60) * 10) / 10);
    }

    return {
      categories: days.map(day => day.slice(-5)),
      series: [
        {name: "Income", type: "column", yAxis: 0, data: incomeData, dataLabels: {
          enabled: false,
        }},
        {name: "Jobs", type: "column", yAxis: 1, data: jobsData, dataLabels: {
          enabled: false,
        }},
        {name: "Worked Hours", type: "column", yAxis: 1, data: durationData, dataLabels: {
          enabled: false,
        }},
      ]
    };
  } else if (category === 'Month') {
    const monthData: { [month: number]: { income: number; jobs: number; duration: number } } = {};
    let currentDate = new Date(startDate);
    while (currentDate.toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')) {
      const monthNumber = currentDate.getMonth();
      if (!monthData[monthNumber]) {
        monthData[monthNumber] = { income: 0, jobs: 0, duration: 0 };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const job of filteredJobs) {
      const monthNumber = new Date(job.StartAt).getMonth();

      if (!monthData[monthNumber]) {
        continue;
      }
      
      monthData[monthNumber].income += job.Income;
      monthData[monthNumber].jobs += 1;
      monthData[monthNumber].duration += job.Duration;
    }

    // Sort the days in ascending order and convert them to strings
    const months = splitNumbers(Object.keys(monthData).map(month => Number(month)).sort((a, b) => a > b ? 1 : -1));
  
    for (const month of months) {
      incomeData.push(Math.round((monthData[month].income) * 100) / 100);
      jobsData.push(monthData[month].jobs);
      durationData.push(Math.round((monthData[month].duration / 60) * 10) / 10);
    }

    return {
      categories: months.map(month => monthNames[month]),
      series: [
        {name: "Income", type: "column", yAxis: 0, data: incomeData, dataLabels: {
          enabled: false,
        }},
        {name: "Jobs", type: "column", yAxis: 1, data: jobsData, dataLabels: {
          enabled: false,
        }},
        {name: "Worked Hours", type: "column", yAxis: 1, data: durationData, dataLabels: {
          enabled: false,
        }},
      ]
    };

  } else {
    const weekData: { [week: number]: { income: number; jobs: number; duration: number } } = {};
    let currentDate = new Date(startDate);
    while (currentDate.toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')) {
      const weekNumber = getWeekNumber(currentDate);
      if (!weekData[weekNumber]) {
        weekData[weekNumber] = { income: 0, jobs: 0, duration: 0 };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const job of filteredJobs) {
      const weekNumber = getWeekNumber(new Date(job.StartAt));

      if (!weekData[weekNumber]) {
        continue;
      }
      
      weekData[weekNumber].income += job.Income;
      weekData[weekNumber].jobs += 1;
      weekData[weekNumber].duration += job.Duration;
    }

    // Sort the days in ascending order and convert them to strings
    const weeks = splitNumbers(Object.keys(weekData).map(week => Number(week)).sort((a, b) => a > b ? 1 : -1));
  
    for (const week of weeks) {
      incomeData.push(Math.round((weekData[week].income) * 100) / 100);
      jobsData.push(weekData[week].jobs);
      durationData.push(Math.round((weekData[week].duration / 60) * 10) / 10);
    }

    return {
      categories: weeks.map(week => `Week${week}`),
      series: [
        {name: "Income", type: "column", yAxis: 0, data: incomeData, dataLabels: {
          enabled: false,
        }},
        {name: "Jobs", type: "column", yAxis: 1, data: jobsData, dataLabels: {
          enabled: false,
        }},
        {name: "Worked Hours", type: "column", yAxis: 1, data: durationData, dataLabels: {
          enabled: false,
        }},
      ]
    };
  }
}

export const makeJobColumnOptions = (data: ChartData): any => {
  return {
    accessibility: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    title: {
      text: '',
    },
    chart: {
      height: '300',
    },
    xAxis: {
      title: {
        text: null
      },
      labels: {
        align: 'right',
        style: {
          color: '#718096'
        }
      },
      categories: data.categories,

    },
    time:{
      useUTC: false,
    },
    yAxis: [{
      gridLineColor: '#718096',
      gridLineDashStyle: 'Dot',
      title: {
        text: '',
      },
      labels: {
        style: {
          color: '#718096'
        }
      }
    }, {
      gridLineColor: '#718096',
      gridLineDashStyle: 'Dot',
      title: {
        text: '',
      },
      labels: {
        style: {
          color: '#718096'
        }
      },
      opposite: true
    }],
    tooltip: {
      pointFormatter: function (this: Highcharts.TooltipFormatterContextObject) {
        if (this.series.name === 'Income') {
          return `${this.series.name}: $${this.y?.toFixed(2)}`;
        } else if (this.series.name === 'Jobs') {
          return `${this.series.name}: ${this.y}`;
        } else if (this.series.name === 'Worked Hours') {
          return `${this.series.name}: ${this.y} hours`;
        }
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: false,
        },
        borderRadius: 5
      },
      series: {
        borderWidth: 0,
      },
      area: {
        dataLabels: {
          enabled: false,
        },
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
                enabled: true
            }
          }
        }
      }
    },
    series: data.series,
  }
}

export const makeAgentColumnData = (
  jobs: Job[], 
  startDate: Date,
  endDate: Date,
): ChartData => {
  const filteredJobs = jobs.filter(job => 
    job.Status === JOB_STATUS.Completed &&
    new Date(job.StartAt).toLocaleDateString('sv-SE') >= startDate.toLocaleDateString('sv-SE') && 
    new Date(job.StartAt).toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')
  );

  const agents = filteredJobs.reduce((acc: string[], job) => {
    if (job.Agent && !acc.includes(job.Agent.Name)) {
      acc.push(job.Agent.Name);
    }
    return acc;
  }, []);

  const monthData: { [month: number]: { [key: string]: number  } } = {};

  for (const job of filteredJobs) {
    const monthNumber = new Date(job.StartAt).getMonth();
    if (!monthData[monthNumber]) {
      monthData[monthNumber] = { };
      for (const agent of agents) {
        monthData[monthNumber][agent] = 0;
      }
    }

    if (job.Agent) {
      monthData[monthNumber][job.Agent.Name] += job.Income;
    }
  }

  const months = splitNumbers(Object.keys(monthData).map(month => Number(month)).sort((a, b) => a > b ? 1 : -1));

  const series: {name: string, type: "column", yAxis: 0, data: number[], dataLabels: {
    enabled: false,
  }}[] = [];

  for (const agent of agents) {

    const data: number[] = [];
    for (const month of months) {
      data.push(Math.round((monthData[month][agent]) * 100) / 100);
    }

    series.push({ 
      name: agent, type: "column", yAxis: 0, data: 
      data, dataLabels: {
        enabled: false,
      } 
    });
  }

  return {
    categories: months.map(month => monthNames[month]),
    series: series
  };
}

export const makeAgentColumnOptions = (data: ChartData): any => {
  return {
    accessibility: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    title: {
      text: '',
    },
    chart: {
      height: '300',
    },
    xAxis: {
      title: {
        text: null
      },
      labels: {
        align: 'right',
        style: {
          color: '#718096'
        }
      },
      categories: data.categories,
      visible: true,
    },
    time:{
      useUTC: false,
    },
    yAxis: [{
      gridLineColor: '#718096',
      gridLineDashStyle: 'Dot',
      title: {
        text: '',
      },
      labels: {
        style: {
          color: '#718096'
        }
      }
    }],
    tooltip: {
      pointFormatter:  function (this: Highcharts.TooltipFormatterContextObject) {
        return `${this.series.name}: $${this.y?.toFixed(2)}`;
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: false,
        },
        borderRadius: 5
      },
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: false,
        }
      },
      area: {
        dataLabels: {
          enabled: true,
        },
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
                enabled: true
            }
          }
        }
      }
    },
    series: data.series,
    legend: {
      layout: 'horizontal',
      align: 'center',
    }, 
  }
}

type DrillDownData = {
  name: string,         // Agent name
  categories: string[], // Industry names
  data: number[]        // total value for each industry
}

type DrillDownPieData = {
  categories: string[], // Agent names
  data: {
    y: number,  // total value of the agent
    drilldown: DrillDownData
  }
}[]

export const makeIndustryPieOptions = (
  jobs: Job[], 
  startDate: Date,
  endDate: Date,
) => {
  const filteredJobs = jobs.filter(job => 
    job.Status === JOB_STATUS.Completed &&
    new Date(job.StartAt).toLocaleDateString('sv-SE') >= startDate.toLocaleDateString('sv-SE') && 
    new Date(job.StartAt).toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')
  );

  const agents = filteredJobs.reduce((acc: string[], job) => {
    if (job.Agent && !acc.includes(job.Agent.Name)) {
      acc.push(job.Agent.Name);
    }
    return acc;
  }, []);

  const drillDownData: { [agent: string]: { y: number, drilldown: DrillDownData } } = {};

  for (const job of filteredJobs) {
    if (!job.Agent || !job.Industry) continue;

    const combinedName = `${job.Agent.Name} - ${job.Industry!.Name}`;
    if (!drillDownData[job.Agent.Name]) {
      drillDownData[job.Agent.Name] = { 
        y: job.Income,  
        drilldown: {
          name: job.Agent.Name,
          categories: [combinedName],
          data: [job.Income]
        }
      };
    } else {
      if (drillDownData[job.Agent.Name].drilldown.categories.includes(combinedName)) {
        drillDownData[job.Agent.Name].drilldown.data[drillDownData[job.Agent.Name].drilldown.categories.indexOf(combinedName)] += job.Income;
      } else {
        drillDownData[job.Agent.Name].drilldown.categories.push(combinedName);
        drillDownData[job.Agent.Name].drilldown.data.push(job.Income);
      }
      drillDownData[job.Agent.Name].y += job.Income;
    }
  }

  const drillDownDataArray: DrillDownPieData = [];

  for (const agent of agents) {
    drillDownDataArray.push({
      categories: [agent],
      data: {
        y: drillDownData[agent].y,
        drilldown: drillDownData[agent].drilldown
      }
    });
  }

  const agentData = [];
  const industryData = [];
  let i, j;
  let dataLen = drillDownDataArray.length;
  let drillDataLen;

  for (i = 0; i < dataLen; i++) {
    agentData.push({
      name: agents[i],
      y: drillDownDataArray[i].data.y,
    });
    drillDataLen = drillDownDataArray[i].data.drilldown.data.length;
    
    for (j = 0; j < drillDataLen; j++) {
      industryData.push({
        name: drillDownDataArray[i].data.drilldown.categories[j],
        y: drillDownDataArray[i].data.drilldown.data[j]
      });
    }
  }

  return {
    chart: {
      type: 'pie',
      height: '300'
    },
    credits: {
      enabled: false
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      // maxHeight: 85
    },
    title: {
      text: '',
    },
    xAxis: {
      visible: false,
    },
    plotOptions: {
      pie: {
        shadow: false,
        center: ['50%', '50%'],
        cursor: 'pointer',
        
      },
      series: {
        borderWidth: 1,
      }
    },
    tooltip: {
      pointFormatter:  function (this: Highcharts.TooltipFormatterContextObject) {
        return `${this.series.name}: $${this.y?.toFixed(2)} (${this.percentage?.toFixed(1)}%)`;
      }
    },
    series: [{
      name: 'Income',
      data: agentData,
      size: '60%',
      innerSize: '50%',
      dataLabels: {
        enabled: false,
        formatter:  function (this: Highcharts.TooltipFormatterContextObject) {
          return `${this.point.percentage?.toFixed(1)} %`;
        }
      },
      type: 'pie'
    }, {
      name: 'Income',
      data: industryData,
      size: '100%',
      innerSize: '60%',
      showInLegend: true,
      dataLabels: {
        enabled: false,
        formatter:  function (this: Highcharts.TooltipFormatterContextObject) {
          return `${this.point.percentage?.toFixed(1)} %`;
        }
      },
      type: 'pie'
    }],
  };
}

export const makeIncomeLineChartOptions = (
  jobs: Job[], 
  startDate: Date,
  endDate: Date,
) => {
  const filteredJobs = jobs.filter(job => 
    job.Status === JOB_STATUS.Completed &&
    new Date(job.StartAt).toLocaleDateString('sv-SE') >= startDate.toLocaleDateString('sv-SE') && 
    new Date(job.StartAt).toLocaleDateString('sv-SE') <= endDate.toLocaleDateString('sv-SE')
  );

  const dayData: {[day: string]:  number} = {};


  for (const job of filteredJobs) {
    const dateString = new Date(job.StartAt).toLocaleDateString('sv-SE');
    if (!dayData[dateString]) {
      dayData[dateString] = job.Income;
    } else {
      dayData[dateString] += job.Income;
    }
  }

  const days = Object.keys(dayData).map(day => day).sort((a, b) => a > b ? 1 : -1);

  const lineData: [number, number][] = [];

  let totalIncome = 0;
  for (const day of days) {
    totalIncome += dayData[day];
    lineData.push([new Date(day).getTime(), totalIncome]);
  }

  return { totalIncome: totalIncome, options: {
    accessibility: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    title: {
      text: '',
    },
    chart: {
      height: '100',
    },
    xAxis: {
      type: 'datetime',
      visible: false,
    },
    time:{
      useUTC: false,
    },
    yAxis: {
      gridLineColor: '#718096',
      gridLineDashStyle: 'Dot',
      title: {
        text: '',
      },
      labels: {
        style: {
          color: '#718096'
        }
      }
    },
    tooltip: {
      xDateFormat: '%Y-%m-%d',
      pointFormat: '{series.name}: ${point.y:.2f}',
    },
    plotOptions: {
      series: {
        borderWidth: 0
      },
      area: {
        dataLabels: {
          enabled: false,
        },
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
                enabled: true
            }
          }
        }
      }
    },
    series: [{
      type:'area',
      name: 'Total Income',
      color: '#4FD1C5',
      data: lineData
    }],
    legend: false,
  }}
}



