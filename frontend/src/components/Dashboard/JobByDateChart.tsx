import { HighchartsReact } from 'highcharts-react-official'
import Highcharts from "highcharts/highstock";

function JobByDateChart() {
  const options = {
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
      height: '33%',
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: null
      },
      labels: {
        align: 'right',
        style: {
          color: '#718096'
        }
      }

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
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: false,
        },
        borderRadius: 4
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
    series: {
      type: 'column',
      name: 'Essays',
      // color: '#4FD1C5',
      data: [
        [1683295200000, 2],
        [1683302800000, 1],
      
      ]
    },
    legend: false,
  }
  return (
    <div>
      <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
    </div>
  )
}

export default JobByDateChart
