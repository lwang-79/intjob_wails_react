import { GetHolidayByDate } from "../../wailsjs/go/main/App";
import { Agent, Holiday, JOB_STATUS, JOB_TYPE, Job, Rate, Response } from "./models";

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
      console.log(a.ID, job.AgentID);
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


export {
  calculateIncome,
  getJobType
}