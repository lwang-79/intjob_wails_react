export type Agent = {
  ID?: number
	Name: string
	FullName?: string
	Address?: string
	PhoneNumber?: string
	Email?: string
	BusinessHourStart: string
	BusinessHourEnd: string
}

export type Industry = {
  ID?: number
	Name: string
}

export type Rate = {
  ID?: number
	Name: string
	MinTime: number
	MinTimeRate: number
	EachTime: number
	EachTimeRate: number
	EarlyCancelTime: number
	EarlyCancelRate: number
	LateCancelTime: number
	LateCancelRate: number
	DeductThreshold: number
	DeductTime: number
	Comments: string
	AgentID: number
	Agent: Agent
	Type: number
	Category: number
	Expired: boolean
}

export type Holiday = {
  ID?: number
  Date: string
  Name: string
}

export type Job = {
  ID?: number
	AgentJobNumber?: string
	StartAt: string
	Duration: number
	Income: number
	AgentID: number
	Agent?: Agent
	IndustryID: number
	Industry?: Industry
	CancelAt?: string
	Comments?: string
	Status: number
	RateID: number
	Rate?: Rate
}