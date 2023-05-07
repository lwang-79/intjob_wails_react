package repository

type Industry struct {
	ID   uint
	Name string
}

func GetIndustryById(id uint) Response {
	db := openDatabase()

	industry := Industry{ID: id}
	err := db.First(&industry, id).Error

	closeDatabase(db)

	return Response{Result: industry, Status: successOrError(err)}
}

func ListAllIndustries() Response {
	db := openDatabase()

	var industries []Industry
	err := db.Find(&industries).Error

	closeDatabase(db)

	return Response{Result: industries, Status: successOrError(err)}
}

func SaveIndustry(industry Industry) Response {
	db := openDatabase()

	err := db.Save(&industry).Error

	closeDatabase(db)

	return Response{Result: industry, Status: successOrError(err)}
}

func DeleteIndustry(industry Industry) Response {
	db := openDatabase()

	err := db.Delete(&industry).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
