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

func GetRateById(id uint) Response {
	db := openDatabase()

	rate := Rate{ID: id}
	err := db.Preload("Agent").First(&rate, id).Error

	closeDatabase(db)

	return Response{Result: rate, Status: successOrError(err)}
}

func ListAllRates() Response {
	db := openDatabase()

	var rates []Rate
	err := db.Preload("Agent").Find(&rates).Error

	closeDatabase(db)

	return Response{Result: rates, Status: successOrError(err)}
}

func SaveRate(rate Rate) Response {
	db := openDatabase()

	err := db.Save(&rate).Error

	closeDatabase(db)

	return Response{Result: rate, Status: successOrError(err)}
}

func DeleteRate(rate Rate) Response {
	db := openDatabase()

	err := db.Delete(&rate).Error

	closeDatabase(db)

	return Response{Result: "", Status: successOrError(err)}
}
