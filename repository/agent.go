package repository

type Agent struct {
	ID                uint
	Name              string
	FullName          string
	Address           string
	PhoneNumber       string
	Email             string
	BusinessHourStart string
	BusinessHourEnd   string
}

func GetAgentById(id uint) Response {
	db := openDatabase()

	agent := Agent{ID: id}
	err := db.First(&agent, id).Error

	closeDatabase(db)

	return Response{Result: agent, Status: successOrError(err)}
}

func ListAllAgents() Response {
	db := openDatabase()

	var agents []Agent
	err := db.Find(&agents).Error

	closeDatabase(db)

	return Response{Result: agents, Status: successOrError(err)}
}

func SaveAgent(agent Agent) Response {
	db := openDatabase()

	err := db.Save(&agent).Error

	closeDatabase(db)

	return Response{Result: agent, Status: successOrError(err)}
}

func DeleteAgent(agent Agent) Response {
	db := openDatabase()

	err := db.Delete(&agent).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
