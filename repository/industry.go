package repository

type Industry struct {
	ID   uint
	Name string
}

func (r *Repo) GetIndustryById(id uint) Response {
	industry := Industry{ID: id}
	err := r.db.First(&industry, id).Error
	return Response{Result: industry, Status: successOrError(err)}
}

func (r *Repo) ListAllIndustries() Response {
	var industries []Industry
	err := r.db.Find(&industries).Error
	return Response{Result: industries, Status: successOrError(err)}
}

func (r *Repo) SaveIndustry(industry Industry) Response {
	err := r.db.Save(&industry).Error
	return Response{Result: industry, Status: successOrError(err)}
}

func (r *Repo) DeleteIndustry(industry Industry) Response {
	err := r.db.Delete(&industry).Error
	return Response{Result: "", Status: successOrError(err)}
}
