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
	// DateCreated       time.Time
	// DateUpdated       time.Time
}

func (*repo) GetAgentById(id uint) (*Agent, error) {
	agent := &Agent{ID: id}
	err := DB.First(agent, id).Error
	return agent, err
}
