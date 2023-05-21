import { Button, Card, HStack, Spacer, VStack } from "@chakra-ui/react"
import { Settings } from "../../types/models";
import { useEffect, useState } from "react";
import { GetSettings } from "../../../wailsjs/go/settings/Settings";
import LocationServiceCard from "./LocationService";
import DatabaseCard from "./Database";

function SettingsPanel() {
  const [ settings, setSettings ] = useState<Settings>();

  useEffect(() => {
    GetSettings()
    .then(settings => setSettings(settings))
    .catch(error => console.error(error));
  },[]);

  return (
    <>
      {settings && <VStack w='full' maxW='xl' p={4} spacing={4}>
        <DatabaseCard path={settings.DBPath} />
        <LocationServiceCard service={settings.LocationService} />
      </VStack>}
    </>
  )
}

export default SettingsPanel
