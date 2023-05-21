package settings

import (
	"encoding/json"
	"io/ioutil"
)

type Settings struct {
	DBPath          string
	LocationService LocationService
}

type LocationService struct {
	Region          string
	IndexName       string
	CalculatorName  string
	IdentityPoolID  string
	FilterCountries []string
	HomeGeometry    []float32
}

func NewSettings() *Settings {
	filePath := "settings.json"
	jsonData, err := ioutil.ReadFile(filePath)
	if err != nil {
		panic("Failed to read settings file")
	}

	var settings Settings
	err = json.Unmarshal(jsonData, &settings)
	if err != nil {
		panic("Failed to parse settings file")
	}

	return &settings
}

func (s *Settings) GetLocationService() LocationService {
	return s.LocationService
}

func (s *Settings) SetLocationService(service LocationService) {
	s.LocationService = service
	s.saveSettings()
}

func (s *Settings) GetSettings() Settings {
	return *s
}

func (s *Settings) SaveSettings(settings Settings) {
	*s = settings
	s.saveSettings()
}

func (s *Settings) saveSettings() {
	jsonData, err := json.MarshalIndent(s, "", " ")
	if err != nil {
		println("Failed to marshal settings", err)
		return
	}

	filePath := "settings.json"
	err = ioutil.WriteFile(filePath, jsonData, 0644)
	if err != nil {
		println("Failed to save settings", err)
		return
	}
}
