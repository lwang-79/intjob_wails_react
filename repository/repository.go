package repository

import (
	// "os"
	// "path/filepath"

	"context"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Response struct {
	Result interface{}
	Status string
}

type Repo struct {
	db *gorm.DB
}

func NewRepo(path string) *Repo {
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	return &Repo{db: db}
}

// func openDatabase() *gorm.DB {
// 	// ex, err := os.Executable()
// 	// if err != nil {
// 	// 	panic(err)
// 	// }
// 	// exPath := filepath.Dir(ex)

// 	// println(exPath)
// 	// db, err := gorm.Open(sqlite.Open(exPath+"/intjob.db"), &gorm.Config{})

// 	db, err := gorm.Open(sqlite.Open("intjob.db"), &gorm.Config{})

// 	if err != nil {
// 		panic("failed to connect database")
// 	}

// 	return db
// }

func (r *Repo) Shutdown(ctx context.Context) {
	sqlDB, _ := r.db.DB()
	sqlDB.Close()
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
