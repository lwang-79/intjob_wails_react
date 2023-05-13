package repository

type Holiday struct {
	ID   uint
	Date string
	Name string
}

func GetHolidayById(id uint) Response {
	db := openDatabase()

	holiday := Holiday{ID: id}
	err := db.First(&holiday, id).Error

	closeDatabase(db)

	return Response{Result: holiday, Status: successOrError(err)}
}

func GetHolidayByDate(date string) Response {
	db := openDatabase()

	var holiday Holiday
	err := db.Limit(100).
		Where("date = ?", date).
		First(&holiday).Error

	closeDatabase(db)
	return Response{Result: holiday, Status: successOrError(err)}
}

func ListHolidays(lastDate string) Response {
	db := openDatabase()

	if lastDate == "" {
		lastDate = "9999-12-31 23:59:59"
	}

	var holidays []Holiday
	err := db.Limit(100).
		Order("date desc").
		Where("date < ?", lastDate).
		Find(&holidays).Error

	closeDatabase(db)

	return Response{Result: holidays, Status: successOrError(err)}
}

func SaveHoliday(holiday Holiday) Response {
	db := openDatabase()

	err := db.Save(&holiday).Error

	closeDatabase(db)

	return Response{Result: holiday, Status: successOrError(err)}
}

func DeleteHoliday(holiday Holiday) Response {
	db := openDatabase()

	err := db.Delete(&holiday).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
