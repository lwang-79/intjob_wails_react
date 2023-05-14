package repository

import "time"

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

func GetJobById(id uint) Response {
	db := openDatabase()

	job := Job{ID: id}
	err := db.Preload("Agent").Preload("Industry").Preload("Rate").First(&job, id).Error

	closeDatabase(db)

	return Response{Result: job, Status: successOrError(err)}
}

func ListJobs(lastDate string, status []int, limit int) Response {
	db := openDatabase()

	if lastDate == "" {
		lastDate = "9999-12-31 23:59:59"
	}

	if len(status) == 0 {
		status = []int{1, 2, 3}
	}

	var jobs []Job
	err := db.Preload("Agent").
		Preload("Industry").
		Preload("Rate").
		Limit(limit).
		Order("start_at desc").
		Where("start_at < ? AND status IN ?", lastDate, status).
		Find(&jobs).Error

	closeDatabase(db)

	return Response{Result: jobs, Status: successOrError(err)}
}

func GetJobsByDate(startDate, endDate string) Response {
	db := openDatabase()

	if endDate == "" {
		date, err := time.Parse("2006-01-02", startDate)

		if err == nil {
			nextDay := date.AddDate(0, 0, 1)
			endDate = nextDay.Format("2006-01-02")
		}
	}

	var jobs []Job
	err := db.Preload("Agent").
		Preload("Industry").
		Preload("Rate").
		Order("start_at desc").
		Where("start_at >= ? AND start_at < ?", startDate, endDate).
		Find(&jobs).Error

	closeDatabase(db)

	return Response{Result: jobs, Status: successOrError(err)}
}

func GetJobsByFilter(filterName, filterValue string, lastDate string, limit int) Response {
	db := openDatabase()

	if lastDate == "" {
		lastDate = "9999-12-31 23:59:59"
	}

	var name string
	var value uint

	if filterName == "Agent" {
		var agent Agent

		err := db.Where("name = ?", filterValue).First(&agent).Error
		if err != nil {
			return Response{Result: "", Status: successOrError(err)}
		}
		name = "agent_id"
		value = agent.ID
	}

	if filterName == "Industry" {
		var industry Industry

		err := db.Where("name = ?", filterValue).First(&industry).Error
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

	println(name, value)
	var condition string = "start_at < ? AND " + name + " = ?"
	var jobs []Job
	println(condition)
	err := db.Preload("Agent").
		Preload("Industry").
		Preload("Rate").
		Order("start_at desc").
		Limit(limit).
		Where(condition, lastDate, value).
		Find(&jobs).Error

	closeDatabase(db)

	return Response{Result: jobs, Status: successOrError(err)}
}

func SaveJob(job Job) Response {
	db := openDatabase()

	err := db.Save(&job).Error

	if err != nil {
		return Response{Result: "", Status: successOrError(err)}
	}
	newJob := Job{ID: job.ID}
	err = db.Preload("Agent").Preload("Industry").Preload("Rate").First(&newJob, job.ID).Error

	closeDatabase(db)

	return Response{Result: newJob, Status: successOrError(err)}
}

func DeleteJob(job Job) Response {
	db := openDatabase()

	err := db.Delete(&job).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
