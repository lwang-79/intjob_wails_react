package repository

type Rate struct {
	ID              uint
	Name            string
	MinTime         int
	MinTimeRate     float64
	EachTime        int
	EachTimeRate    float64
	EarlyCancelTime int
	EarlyCancelRate float64
	LateCancelTime  int
	LateCancelRate  float64
	DeductThreshold int
	DeductTime      int
	Comments        string
	AgentID         uint
	Agent           Agent
	Type            int
	Category        int
	Expired         bool
}

func (r *Repo) GetRateById(id uint) Response {
	rate := Rate{ID: id}
	err := r.db.Preload("Agent").First(&rate, id).Error
	return Response{Result: rate, Status: successOrError(err)}
}

func (r *Repo) GetRatesByAgentTypeAndCategory(agentId uint, typeId int, categoryId int) Response {
	var rates []Rate
	err := r.db.Preload("Agent").
		Where("agent_id = ? and type = ? and category = ?", agentId, typeId, categoryId).
		Find(&rates).Error
	return Response{Result: rates, Status: successOrError(err)}
}

func (r *Repo) ListAllRates() Response {
	var rates []Rate
	err := r.db.Preload("Agent").Find(&rates).Error
	return Response{Result: rates, Status: successOrError(err)}
}

func (r *Repo) SaveRate(rate Rate) Response {
	err := r.db.Save(&rate).Error
	return Response{Result: rate, Status: successOrError(err)}
}

func (r *Repo) DeleteRate(rate Rate) Response {
	err := r.db.Delete(&rate).Error
	return Response{Result: "", Status: successOrError(err)}
}
