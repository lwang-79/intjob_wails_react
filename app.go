package main

import (
	"context"
	"encoding/csv"
	"intjob/repository"
	"io"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx    context.Context
	dbPath string
	repo   *repository.Repo
}

// NewApp creates a new App application struct
func NewApp(dbPath string, repo *repository.Repo) *App {
	return &App{
		dbPath: dbPath,
		repo:   repo,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetCurrentDir() string {
	path, err := os.Getwd()

	if err != nil {
		log.Println(err)
	}
	return path
}

func (a *App) BackupDatabase() string {
	directory, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select the destination directory",
	})
	if err != nil {
		log.Println(err)
		return err.Error()
	}

	if directory == "" {
		return "Canceled. No directory selected."
	}

	fileName := "intjob-backup-" + time.Now().Format("2006-01-02") + ".db"
	destinationPath := directory + "/" + fileName
	sourcePath := a.dbPath

	sourceFile, err := os.Open(sourcePath)
	if err != nil {
		log.Println("Failed to open source file", err)
		return err.Error()
	}
	defer sourceFile.Close()

	destinationFile, err := os.Create(destinationPath)
	if err != nil {
		log.Println("Failed to create destination file", err)
		return err.Error()
	}
	defer destinationFile.Close()

	_, err = io.Copy(destinationFile, sourceFile)
	if err != nil {
		log.Println("Failed to copy file", err)
		return err.Error()
	}

	log.Println(directory)
	return "Database has been backed up to " + destinationPath + " successfully."

}

func (a *App) ExportJob() string {
	directory, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select the destination directory",
	})
	if err != nil {
		log.Println(err)
		return err.Error()
	}

	if directory == "" {
		return "Canceled. No directory selected."
	}

	response := a.repo.ListJobs("", []int{1, 2, 3}, 99999)
	jobs, _ := response.Result.([]repository.Job)

	fileName := "intjob-jobs-" + time.Now().Format("2006-01-02") + ".csv"
	destinationPath := directory + "/" + fileName

	file, err := os.Create(destinationPath)
	if err != nil {
		log.Println("Failed to create file:", err)
		return err.Error()
	}
	defer file.Close()

	writer := csv.NewWriter(file)

	header := getCSVHeader()
	if err := writer.Write(header); err != nil {
		log.Println("Failed to write header:", err)
		return err.Error()
	}

	for _, job := range jobs {
		row := getCSVRow(job)
		if err := writer.Write(row); err != nil {
			log.Println("Failed to write row:", err)
			return err.Error()
		}
	}

	return "Jobs have been exported to " + destinationPath + " successfully."
}

func getCSVHeader() []string {
	header := []string{}
	header = append(header, "ID")
	header = append(header, "AgentJobNumber")
	header = append(header, "AgentName")
	header = append(header, "Industry")
	header = append(header, "StartAt")
	header = append(header, "Duration")
	header = append(header, "Income")
	header = append(header, "Status")
	header = append(header, "CancelAt")
	header = append(header, "Rate")
	header = append(header, "Comments")
	header = append(header, "Address")
	header = append(header, "Traffic")
	return header
}

func getCSVRow(job repository.Job) []string {
	startAt, err := time.Parse("2006-01-02T15:04:05Z", job.StartAt)
	if err != nil {
		log.Println("Failed to parse date-time:", err)
	}
	startAtString := startAt.Local().Format("2006-01-02 15:04:05")

	cancelAt, err := time.Parse("2006-01-02T15:04:05Z", job.CancelAt)
	if err != nil {
		log.Println("Failed to parse date-time:", err)
	}
	cancelAtString := cancelAt.Local().Format("2006-01-02 15:04:05")

	row := []string{}
	row = append(row, strconv.FormatUint(uint64(job.ID), 10))
	row = append(row, job.AgentJobNumber)
	row = append(row, job.Agent.Name)
	row = append(row, job.Industry.Name)
	row = append(row, startAtString)
	row = append(row, strconv.FormatInt(int64(job.Duration), 10))
	row = append(row, strconv.FormatFloat(job.Income, 'f', 2, 64))
	row = append(row, strconv.FormatInt(int64(job.Status), 10))
	row = append(row, cancelAtString)
	row = append(row, job.Rate.Name)
	row = append(row, job.Comments)
	row = append(row, job.Address)
	row = append(row, job.Traffic)

	return row
}
