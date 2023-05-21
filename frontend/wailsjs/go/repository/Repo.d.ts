// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {repository} from '../models';

export function DeleteAgent(arg1:repository.Agent):Promise<repository.Response>;

export function DeleteHoliday(arg1:repository.Holiday):Promise<repository.Response>;

export function DeleteIndustry(arg1:repository.Industry):Promise<repository.Response>;

export function DeleteJob(arg1:repository.Job):Promise<repository.Response>;

export function DeleteLocation(arg1:repository.Location):Promise<repository.Response>;

export function DeleteRate(arg1:repository.Rate):Promise<repository.Response>;

export function GetAgentById(arg1:number):Promise<repository.Response>;

export function GetHolidayByDate(arg1:string):Promise<repository.Response>;

export function GetHolidayById(arg1:number):Promise<repository.Response>;

export function GetIndustryById(arg1:number):Promise<repository.Response>;

export function GetJobById(arg1:number):Promise<repository.Response>;

export function GetJobsByDate(arg1:string,arg2:string):Promise<repository.Response>;

export function GetJobsByFilter(arg1:string,arg2:string,arg3:string,arg4:number):Promise<repository.Response>;

export function GetLocationById(arg1:number):Promise<repository.Response>;

export function GetRateById(arg1:number):Promise<repository.Response>;

export function GetRatesByAgentTypeAndCategory(arg1:number,arg2:number,arg3:number):Promise<repository.Response>;

export function ListAllAgents():Promise<repository.Response>;

export function ListAllIndustries():Promise<repository.Response>;

export function ListAllLocations():Promise<repository.Response>;

export function ListAllRates():Promise<repository.Response>;

export function ListHolidays(arg1:string,arg2:number):Promise<repository.Response>;

export function ListJobs(arg1:string,arg2:Array<number>,arg3:number):Promise<repository.Response>;

export function SaveAgent(arg1:repository.Agent):Promise<repository.Response>;

export function SaveHoliday(arg1:repository.Holiday):Promise<repository.Response>;

export function SaveIndustry(arg1:repository.Industry):Promise<repository.Response>;

export function SaveJob(arg1:repository.Job):Promise<repository.Response>;

export function SaveLocation(arg1:repository.Location):Promise<repository.Response>;

export function SaveRate(arg1:repository.Rate):Promise<repository.Response>;