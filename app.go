package main

import (
	"context"
	"intjob/repository"
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) GetAgentById(id uint) repository.Agent {
	path, err := os.Getwd()
	log.Println(path)

	db, err := gorm.Open(sqlite.Open("intjob.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	agent := repository.Agent{}
	db.First(&agent, id)
	// repo := repository.NewRepository()

	// agent, _ := repo.GetAgentById(id)
	return agent
}

func (a *App) GetCurrentDir() string {
	path, err := os.Getwd()

	if err != nil {
		log.Println(err)
	}
	return path
}
