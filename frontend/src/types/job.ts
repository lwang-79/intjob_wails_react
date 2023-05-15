import { CalculateRouteSummary } from "@aws-sdk/client-location";
import { GetHolidayByDate, GetJobsByDate, SaveJob } from "../../wailsjs/go/main/App";
import { calculateDistance } from "./location";
import { Agent, Holiday, JOB_CATEGORY, JOB_STATUS, JOB_TYPE, Job, Rate, Response } from "./models";

const getJobType = async (job: Job, agents: Agent[]): Promise<number> => {
  const startAt = new Date(job.StartAt);

  const response: Response = await GetHolidayByDate(job.StartAt.slice(0, 10));

  const holiday = response.Result as Holiday;

  if (holiday.ID !== 0) return JOB_TYPE.PH;

  let type = 0;
  if (startAt.getDay() === 0) {
    type = JOB_TYPE.SUN;
  } else if (startAt.getDay() === 6) {
    type = JOB_TYPE.SAT;
  } else {
    const agent = agents.find(a => {
      return a.ID == job.AgentID
    });
    if (!agent) {
      console.error('Agent not found');
      return 0;
    }
    const timeString = startAt.toLocaleTimeString('sv-SE');
    if (
      timeString < agent.BusinessHourStart ||
      timeString > agent.BusinessHourEnd
    ) {
      type = JOB_TYPE.ABH;
    } else {
      type = JOB_TYPE.BH;
    }
  }

  return type;
}

const calculateIncome = (job: Job, rate: Rate): number => {
  if (job.Duration <= rate.MinTime) {
    job.Income = rate.MinTimeRate;
  } else if (job.Duration >= rate.DeductThreshold) {
    const duration = job.Duration - rate.DeductTime;
    job.Income = Math.ceil((duration - rate.MinTime) / rate.EachTime) * rate.EachTimeRate + rate.MinTimeRate;
  } else {
    const duration = job.Duration;
    job.Income = Math.ceil((duration - rate.MinTime) / rate.EachTime) * rate.EachTimeRate + rate.MinTimeRate;
  }

  if (job.Status === JOB_STATUS.Canceled && job.CancelAt) {
    const noticeTime = (new Date(job.StartAt).getTime() - new Date(job.CancelAt).getTime()) / 1000 / 60;
    if (noticeTime < rate.LateCancelTime) {
      job.Income *= rate.LateCancelRate;
    } else if (noticeTime < rate.EarlyCancelTime) {
      job.Income *= rate.EarlyCancelRate;
    } else {
      job.Income = 0;
    }
  }

  job.Income = Math.round(job.Income * 100) / 100;

  return job.Income;
}

// Update all jobs' traffic for that day
const getAndUpdateJobTraffic = async (
  job: Job
): Promise<{
  traffic: CalculateRouteSummary | undefined
  updatedJob: Job
} | undefined> => {
  const jobTime = new Date(job.StartAt);
  const localStartTime = new Date(jobTime.getFullYear(), jobTime.getMonth(), jobTime.getDate(), 0, 0, 0);
  const localEndTime = new Date(jobTime.getFullYear(), jobTime.getMonth(), jobTime.getDate(), 23, 59, 59);
  const startTimeString = localStartTime.toISOString().replace('.000','');
  const endTimeString = localEndTime.toISOString().replace('.000','');

  let response: Response = await GetJobsByDate(startTimeString, endTimeString);

  if (response.Status != 'success') {
    console.error(response.Status);
    return;
  }

  let jobs: Job[] = response.Result;

  const result: {
    traffic: CalculateRouteSummary | undefined,
    updatedJob: Job
  } = {
    traffic: undefined,
    updatedJob: job
  }

  // If this job is not an onsite job, set traffic to null
  const existingJob = jobs.find(j => j.ID === job.ID)
  if (existingJob && existingJob.Rate!.Category !== JOB_CATEGORY.OnSite) {
    const response: Response = await SaveJob({
      ...existingJob,
      traffic: ''
    });

    if (response.Status !== 'success') {
      console.error(response.Status);
    }

    result.traffic = undefined;
    result.updatedJob = response.Result as Job;
  }

  jobs = jobs.filter(j => j.Rate!.Category === JOB_CATEGORY.OnSite)
    .sort((a,b)=>Date.parse(a.StartAt) - Date.parse(b.StartAt));

  for (let i = 0; i < jobs.length; i++) {
    let traffic: CalculateRouteSummary | undefined = undefined;

    if (i > 0) {
      if (jobs[i-1].Location && jobs[i].Location) {
        traffic = await calculateDistance(jobs[i-1].Location!, jobs[i].Location!);
      }
    }

    const response: Response = await SaveJob({
      ...jobs[i],
      traffic: JSON.stringify(traffic??'')
    });

    if (response.Status !== 'success') {
      console.error(response.Status);
    }

    if (job.ID === jobs[i].ID) {
      result.traffic = traffic;
      result.updatedJob = response.Result as Job
    }
  }

  return result;
}

export {
  calculateIncome,
  getAndUpdateJobTraffic,
  getJobType
}