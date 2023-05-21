package repository

type Holiday struct {
	ID   uint
	Date string
	Name string
}

func (r *Repo) GetHolidayById(id uint) Response {
	holiday := Holiday{ID: id}
	err := r.db.First(&holiday, id).Error
	return Response{Result: holiday, Status: successOrError(err)}
}

func (r *Repo) GetHolidayByDate(date string) Response {
	var holiday Holiday

	err := r.db.Limit(100).
		Where("date = ?", date).
		First(&holiday).Error

	return Response{Result: holiday, Status: successOrError(err)}
}

func (r *Repo) ListHolidays(lastDate string, limit int) Response {
	if lastDate == "" {
		lastDate = "9999-12-31 23:59:59"
	}

	var holidays []Holiday

	err := r.db.Limit(100).
		Order("date desc").
		Where("date < ?", lastDate).
		Limit(limit).
		Find(&holidays).Error

	return Response{Result: holidays, Status: successOrError(err)}
}

func (r *Repo) SaveHoliday(holiday Holiday) Response {
	err := r.db.Save(&holiday).Error
	return Response{Result: holiday, Status: successOrError(err)}
}

func (r *Repo) DeleteHoliday(holiday Holiday) Response {
	err := r.db.Delete(&holiday).Error
	return Response{Result: "", Status: successOrError(err)}
}
