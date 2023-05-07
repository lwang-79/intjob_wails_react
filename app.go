package main

import (
	"context"
	"intjob/repository"
	"log"
	"os"
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

func (a *App) GetAgentById(id uint) repository.Response {
	return repository.GetAgentById(id)
}

func (a *App) SaveAgent(agent repository.Agent) repository.Response {
	return repository.SaveAgent(agent)
}

func (a *App) ListAllAgents() repository.Response {
	return repository.ListAllAgents()
}

func (a *App) DeleteAgent(agent repository.Agent) repository.Response {
	return repository.DeleteAgent(agent)
}

func (a *App) GetIndustryById(id uint) repository.Response {
	return repository.GetIndustryById(id)
}

func (a *App) SaveIndustry(industry repository.Industry) repository.Response {
	return repository.SaveIndustry(industry)
}

func (a *App) ListAllIndustries() repository.Response {
	return repository.ListAllIndustries()
}

func (a *App) DeleteIndustry(industry repository.Industry) repository.Response {
	return repository.DeleteIndustry(industry)
}

func (a *App) GetRateById(id uint) repository.Response {
	return repository.GetRateById(id)
}

func (a *App) SaveRate(rate repository.Rate) repository.Response {
	return repository.SaveRate(rate)
}

func (a *App) ListAllRates() repository.Response {
	return repository.ListAllRates()
}

func (a *App) DeleteRate(rate repository.Rate) repository.Response {
	return repository.DeleteRate(rate)
}

func (a *App) GetHolidayById(id uint) repository.Response {
	return repository.GetHolidayById(id)
}

func (a *App) SaveHoliday(holiday repository.Holiday) repository.Response {
	return repository.SaveHoliday(holiday)
}

func (a *App) ListAllHolidays() repository.Response {
	return repository.ListAllHolidays()
}

func (a *App) DeleteHoliday(holiday repository.Holiday) repository.Response {
	return repository.DeleteHoliday(holiday)
}

func (a *App) GetJobById(id uint) repository.Response {
	return repository.GetJobById(id)
}

func (a *App) SaveJob(job repository.Job) repository.Response {
	return repository.SaveJob(job)
}

func (a *App) ListAllJobs() repository.Response {
	return repository.ListAllJobs()
}

func (a *App) DeleteJob(job repository.Job) repository.Response {
	return repository.DeleteJob(job)
}

func (a *App) GetCurrentDir() string {
	path, err := os.Getwd()

	if err != nil {
		log.Println(err)
	}
	return path
}
