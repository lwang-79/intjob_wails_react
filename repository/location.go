package repository

type Location struct {
	ID       uint
	PlaceId  string
	Address  string
	Geometry string
}

func GetLocationById(id uint) Response {
	db := openDatabase()

	location := Location{ID: id}
	err := db.First(&location, id).Error

	closeDatabase(db)

	return Response{Result: location, Status: successOrError(err)}
}

func ListAllLocations() Response {
	db := openDatabase()

	var locations []Location
	err := db.Find(&locations).Error

	closeDatabase(db)

	return Response{Result: locations, Status: successOrError(err)}
}

func SaveLocation(location Location) Response {
	db := openDatabase()

	err := db.Save(&location).Error

	closeDatabase(db)

	return Response{Result: location, Status: successOrError(err)}
}

func DeleteLocation(location Location) Response {
	db := openDatabase()

	err := db.Delete(&location).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
