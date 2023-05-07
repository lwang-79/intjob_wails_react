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
}

func GetJobById(id uint) Response {
	db := openDatabase()

	job := Job{ID: id}
	err := db.Preload("Agent").Preload("Industry").Preload("Rate").First(&job, id).Error

	closeDatabase(db)

	return Response{Result: job, Status: successOrError(err)}
}

func ListAllJobs() Response {
	db := openDatabase()

	var jobs []Job
	err := db.Preload("Agent").Preload("Industry").Preload("Rate").Find(&jobs).Error

	closeDatabase(db)

	return Response{Result: jobs, Status: successOrError(err)}
}

func SaveJob(job Job) Response {
	db := openDatabase()

	err := db.Save(&job).Error

	closeDatabase(db)

	return Response{Result: job, Status: successOrError(err)}
}

func DeleteJob(job Job) Response {
	db := openDatabase()

	err := db.Delete(&job).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
