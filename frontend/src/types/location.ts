import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { CalculateRouteCommand, GetPlaceCommand, LocationClient, SearchPlaceIndexForSuggestionsCommand } from "@aws-sdk/client-location"; 
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { GetLocationService } from "../../wailsjs/go/settings/Settings"
import { LocationService } from "./models";

// const REGION = 'ap-southeast-2';
// const INDEX_NAME = 'HereIndex'; //EsriIndex
// const CALCULATOR_NAME = 'HereCalculator';
// const IDENTITY_POOL_ID = 'ap-southeast-2:c65f490d-31b7-46fe-94d8-fbdb071fe994';
// const HOME_POSITION = [145.24, -37.87];
// const FILTER_COUNTRY = ['AUS'];

const LOCATION_SERVICE: LocationService = await GetLocationService();

export const searchPlaceIndex = async (text: string) => {
  if (!text) return [];

  try {
    const client = new LocationClient({
      region: LOCATION_SERVICE.Region,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: LOCATION_SERVICE.Region }),
        identityPoolId: LOCATION_SERVICE.IdentityPoolID 
      } as any),
    });

    const input = { // SearchPlaceIndexForSuggestionsRequest
      IndexName: LOCATION_SERVICE.IndexName, // required
      Text: text, // required
      BiasPosition: LOCATION_SERVICE.HomeGeometry,
      FilterCountries: LOCATION_SERVICE.FilterCountries,
      MaxResults: 10,
      Language: 'en',
    };
    const command = new SearchPlaceIndexForSuggestionsCommand(input);
    const response = await client.send(command);
    return response.Results  
  } catch (error) {
    console.error(error);
  }
  return [];
}

export const getPlace = async (placeId: string) => {
  if (!placeId) return;

  try {
    const client = new LocationClient({
      region: LOCATION_SERVICE.Region,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: LOCATION_SERVICE.Region }),
        identityPoolId: LOCATION_SERVICE.IdentityPoolID 
      } as any),
    });

    const input = { // SearchPlaceIndexForSuggestionsRequest
      IndexName: LOCATION_SERVICE.IndexName, // required
      PlaceId: placeId,
      Language: 'en',
    };
    const command = new GetPlaceCommand(input);
    const response = await client.send(command);
    if (response.Place) {
      return response.Place.Geometry?.Point
    }
  } catch (error) {
    console.error(error);
  }
}

export const calculateDistance = async (departure: string, destination: string) => {

  try {
    const departurePosition: [number, number] = JSON.parse(departure);
    const destinationPosition: [number, number] = JSON.parse(destination);
  
    if (!departurePosition || !destinationPosition) return;
  
    const client = new LocationClient({
      region: LOCATION_SERVICE.Region,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: LOCATION_SERVICE.Region }),
        identityPoolId: LOCATION_SERVICE.IdentityPoolID 
      } as any),
    });

    const input = { // SearchPlaceIndexForSuggestionsRequest
      CalculatorName: LOCATION_SERVICE.CalculatorName, // required
      DeparturePosition: departurePosition,
      DestinationPosition: destinationPosition,
      TravelMode: 'Car',
      DistanceUnit: 'Kilometers',
      CarModeOptions: {
        AvoidFerries: true,
        AvoidTolls: true,
      },
    };
    const command = new CalculateRouteCommand(input);
    const response = await client.send(command);
    return response.Summary;
  } catch (error) {
    console.error(error);
  }
}