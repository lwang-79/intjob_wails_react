package repository

import (
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

func (r *Repo) Shutdown(ctx context.Context) {
	sqlDB, _ := r.db.DB()
	sqlDB.Close()
}

func successOrError(err error) string {
	if err != nil {
		return err.Error()
	}
	return "success"
}
