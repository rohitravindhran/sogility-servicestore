import {findNearest, orderByDistance, getDistance} from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';
import {number} from 'yup';

const findNearestLocation = (currentLocation: GeolibInputCoordinates, locationsFromApi: Array<Object>) => {
  if (!currentLocation || locationsFromApi?.length === 0) {
    return null;
  }
  console.log('locationsFromApi', locationsFromApi);

  let locationsFromApiProcessed: Array<GeolibInputCoordinates> = [];
  locationsFromApi.map((item: any) => {
    locationsFromApiProcessed.push({
      ...item,
      latitude: item?.location?.latitude,
      longitude: item?.location?.longitude,
    });
  });
  console.log('locationsFromApiProcessed', locationsFromApiProcessed);

  const nearestLocation = findNearest(
    currentLocation,
    locationsFromApiProcessed,
  );

  return nearestLocation;
};

const orderLocationsByDistance = (
  currentLocation: GeolibInputCoordinates,
  locationsFromApi: Array<Object>,
) => {
  if (!currentLocation || locationsFromApi?.length === 0) {
    return null;
  }
  let locationsFromApiProcessed: Array<GeolibInputCoordinates> = [];
  locationsFromApi.map((item: any) => {
    locationsFromApiProcessed.push({
      ...item,
      latitude: item?.location?.latitude,
      longitude: item?.location?.longitude,
    });
  });
  const locations: any = orderByDistance(
    currentLocation,
    locationsFromApiProcessed,
  );

  locations?.map((item: any, index: number) => {
    const distance = getDistance(currentLocation, item?.location, 1);
    locations[index].distance = Math.round((distance / 1000) * 10) / 10;
  });

  return locations;
};

export {findNearestLocation, orderLocationsByDistance};
