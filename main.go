package main

import (
	"embed"
	"intjob/repository"
	"intjob/settings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

var assets embed.FS

func main() {
	// Create an instance of the app structure
	settings := settings.NewSettings()
	repo := repository.NewRepo(settings.DBPath)
	app := NewApp(settings.DBPath, repo)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "IntJob",
		Width:  1500,
		Height: 1000,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		OnShutdown:       repo.Shutdown,
		Bind: []interface{}{
			app,
			repo,
			settings,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
