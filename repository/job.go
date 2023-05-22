package repository

type Job struct {
	ID             uint
	AgentJobNumber string
	StartAt        string
	Duration       int
	Income         float64
	AgentID        uint
	Agent          Agent
	IndustryID     uint
	Industry       Industry
	CancelAt       string
	Comments       string
	Status         int
	RateID         uint
	Rate           Rate
	Address        string
	Location       string
	Traffic        string
}

func (r *Repo) GetJobById(id uint) Response {
	job := Job{ID: id}
	err := r.db.Preload("Agent").Preload("Industry").Preload("Rate").First(&job, id).Error
	return Response{Result: job, Status: successOrError(err)}
}

func (r *Repo) ListJobs(lastDate string, status []int, limit int) Response {
	if lastDate == "" {
		lastDate = "9999-12-31 23:59:59"
	}

	if len(status) == 0 {
		status = []int{1, 2, 3}
	}

	var jobs []Job
	err := r.db.Preload("Agent").
		Preload("Industry").
		Preload("Rate").
		Limit(limit).
		Order("start_at desc").
		Where("start_at < ? AND status IN ?", lastDate, status).
		Find(&jobs).Error

	return Response{Result: jobs, Status: successOrError(err)}
}

func (r *Repo) GetJobsByDate(startDate, endDate string) Response {
	var jobs []Job
	err := r.db.Preload("Agent").
		Preload("Industry").
		Preload("Rate").
		Order("start_at desc").
		Where("start_at >= ? AND start_at < ?", startDate, endDate).
		Find(&jobs).Error

	return Response{Result: jobs, Status: successOrError(err)}
}

func (r *Repo) GetJobsByFilter(filterName, filterValue string, lastDate string, limit int) Response {
	if lastDate == "" {
		lastDate = "9999-12-31 23:59:59"
	}

	var name string
	var value uint

	if filterName == "Agent" {
		var agent Agent

		err := r.db.Where("name = ?", filterValue).First(&agent).Error
		if err != nil {
			return Response{Result: "", Status: successOrError(err)}
		}
		name = "agent_id"
		value = agent.ID
	}

	if filterName == "Industry" {
		var industry Industry

		err := r.db.Where("name = ?", filterValue).First(&industry).Error
		if err != nil {
			return Response{Result: "", Status: successOrError(err)}
		}
		name = "industry_id"
		value = industry.ID
	}

	if filterName == "Status" {
		name = "status"
		if filterValue == "Booked" {
			value = 1
		} else if filterValue == "Canceled" {
			value = 2
		} else {
			value = 3
		}
	}

	var condition string = "start_at < ? AND " + name + " = ?"
	var jobs []Job
	err := r.db.Preload("Agent").
		Preload("Industry").
		Preload("Rate").
		Order("start_at desc").
		Limit(limit).
		Where(condition, lastDate, value).
		Find(&jobs).Error

	return Response{Result: jobs, Status: successOrError(err)}
}

func (r *Repo) SaveJob(job Job) Response {
	err := r.db.Save(&job).Error

	if err != nil {
		return Response{Result: "", Status: successOrError(err)}
	}
	newJob := Job{ID: job.ID}
	err = r.db.Preload("Agent").Preload("Industry").Preload("Rate").First(&newJob, job.ID).Error

	return Response{Result: newJob, Status: successOrError(err)}
}

func (r *Repo) DeleteJob(job Job) Response {
	err := r.db.Delete(&job).Error
	return Response{Result: "", Status: successOrError(err)}
}
