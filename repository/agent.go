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

func (r *Repo) GetAgentById(id uint) Response {
	agent := Agent{ID: id}
	err := r.db.First(&agent, id).Error
	return Response{Result: agent, Status: successOrError(err)}
}

func (r *Repo) ListAllAgents() Response {
	var agents []Agent
	err := r.db.Find(&agents).Error
	return Response{Result: agents, Status: successOrError(err)}
}

func (r *Repo) SaveAgent(agent Agent) Response {
	err := r.db.Save(&agent).Error
	return Response{Result: agent, Status: successOrError(err)}
}

func (r *Repo) DeleteAgent(agent Agent) Response {
	err := r.db.Delete(&agent).Error
	return Response{Result: "", Status: successOrError(err)}
}
