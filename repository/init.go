package repository

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Repository interface {
	GetAgentById(uint) (*Agent, error)
}

type repo struct{}

func NewRepository() Repository {
	return &repo{}
}

var DB *gorm.DB

func init() {
	DB, err := gorm.Open(sqlite.Open("intjob.db"), &gorm.Config{
		// NamingStrategy: schema.NamingStrategy{
		// 	TablePrefix:   "myfunds_",
		// 	SingularTable: true,
		// },
		// NowFunc: func() time.Time {
		// 	return time.Now().UTC()
		// },
		// Logger: logger.Default.LogMode(logger.Silent), //Info, Silent
	})
	if err != nil {
		panic("failed to connect database")
	}

	log.Println("db connected")
	_ = DB
}
