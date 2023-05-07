package repository

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Response struct {
	Result interface{}
	Status string
}

func openDatabase() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("intjob.db"), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	return db
}

func closeDatabase(db *gorm.DB) {
	sqlDB, _ := db.DB()
	sqlDB.Close()
}

func successOrError(err error) string {
	if err != nil {
		return err.Error()
	}
	return "success"
}
