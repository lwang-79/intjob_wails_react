package repository

type Location struct {
	ID       uint
	PlaceId  string
	Address  string
	Geometry string
}

func (r *Repo) GetLocationById(id uint) Response {
	location := Location{ID: id}
	err := r.db.First(&location, id).Error
	return Response{Result: location, Status: successOrError(err)}
}

func (r *Repo) ListAllLocations() Response {
	var locations []Location
	err := r.db.Find(&locations).Error
	return Response{Result: locations, Status: successOrError(err)}
}

func (r *Repo) SaveLocation(location Location) Response {
	err := r.db.Save(&location).Error
	return Response{Result: location, Status: successOrError(err)}
}

func (r *Repo) DeleteLocation(location Location) Response {
	err := r.db.Delete(&location).Error
	return Response{Result: "", Status: successOrError(err)}
}
