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

func ListAllHolidays() Response {
	db := openDatabase()

	var holidays []Holiday
	err := db.Find(&holidays).Error

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