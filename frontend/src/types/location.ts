import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { CalculateRouteCommand, GetPlaceCommand, LocationClient, SearchPlaceIndexForSuggestionsCommand } from "@aws-sdk/client-location"; 
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

const REGION = 'ap-southeast-2';
const INDEX_NAME = 'HereIndex'; //EsriIndex
const CALCULATOR_NAME = 'HereCalculator';
const IDENTITY_POOL_ID = 'ap-southeast-2:c65f490d-31b7-46fe-94d8-fbdb071fe994';
const HOME_POSITION = [145.24, -37.87];
const FILTER_COUNTRY = ['AUS'];

export const searchPlaceIndex = async (text: string) => {
  if (!text) return [];

  try {
    const client = new LocationClient({
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID 
      } as any),
    });

    const input = { // SearchPlaceIndexForSuggestionsRequest
      IndexName: INDEX_NAME, // required
      Text: text, // required
      BiasPosition: HOME_POSITION,
      FilterCountries: FILTER_COUNTRY,
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
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID 
      } as any),
    });

    const input = { // SearchPlaceIndexForSuggestionsRequest
      IndexName: INDEX_NAME, // required
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
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID 
      } as any),
    });

    const input = { // SearchPlaceIndexForSuggestionsRequest
      CalculatorName: CALCULATOR_NAME, // required
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