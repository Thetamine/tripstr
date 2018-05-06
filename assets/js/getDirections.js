// create a route based on user input from the getSearchData function
function getDirections(queryObj, locationObj, userMap) {
  console.log('function Started!');
  // load the directions module
  // Create an instance of the directions manager.
  directionsManager = new Microsoft.Maps.Directions.DirectionsManager(userMap);

  // TODO: set the first waypoint to user's current location
  // if it does not already exist

  // Create a function that takes a selected search data
  // point and converts the result into a waypoint on the map.
  function createWaypoint(varName, name, lat, lng) {
    console.log('createWaypoint Function has started!');
    varName = new Microsoft.Maps.Directions.Waypoint({
      address: name,
      location: new Microsoft.Maps.Location(lat, lng)
    });
    directionsManager.addWaypoint(varName);
    console.log(varName);
  }

  //create a waypoint for the beginning destination
  createWaypoint(queryObj.userLocation, 'Current Location', queryObj.userLocation.lat, queryObj.userLocation.lng);

  // Loop through the location object, finding the id, name, latitude
  // and longitude of each point in the array then call the createWaypoint
  // function and add each location as a waypoint
  for (i = 0; i < locationObj.locationList.length; i++) {
    let waypoints = locationObj.locationList[i];
    createWaypoint(waypoints.waypointName, waypoints.name, waypoints.locationLat, waypoints.locationLng);
  }

  //create a waypoint for the ending Destination
  // Clear all pins off of the map to prepare for the route phase
  userMap.entities.clear();

  // Specify the Element in which the itenerary will be rendered.
  directionsManager.setRenderOptions({ itineraryContainer: '#directionsItinerary' });

  // Calculate directions / routes
  directionsManager.calculateDirections();
};