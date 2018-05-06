const locationObj = { locationList: [] };   // create an array object to store the variable location list.

function getData(userMap, locObj) {

  if (locObj.queryType === 'vacation') {
    $.getJSON(`http://https://arcane-basin-98906.herokuapp.com/search/vacation/${locObj.destinationLocation.lat},${locObj.destinationLocation.lng}/${searchPlacesInput.value}`, function (data) {
      // code is breaking right here, might need to get data from the json call into the done block. Azsq  
    })
      .done(function (data) {
        console.log(data)
        pushPlaces(data, userMap);
      })
      .fail(function (err) {
        console.log(err);
      });
  } else {
    $.getJSON(`http://https://arcane-basin-98906.herokuapp.com/search/road-trip
/${locObj.userLocation.lat},${locObj.userLocation.lng}
/${locObj.destinationLocation.lat},${locObj.destinationLocation.lng}
/${searchPlacesInput.value}`, function (data) { })
      .done(function (data) {
        // Run a for loop that returns all available results as pushpins
        // on the map
        pushPlaces(data, userMap);
      })
      .fail(function (err) {
        console.log(err);
      });

  }
}

function pushPlaces(data, userMap) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    console.log(item.venue.categories[0].name);
    const pinColor = determinePinColor(item.venue.categories[0].name); // store the category name for use in determining pin color

    // define the location of the pin based on the lat and lng
    // of the currently iterated venue
    const pinLocation = new Microsoft.Maps.Location(item.venue.location.lat, item.venue.location.lng);

    // instntiate the pushpin class and assign it to the variable pin
    let pin = new Microsoft.Maps.Pushpin(pinLocation, {
      title: item.venue.name,
      subtitle: item.venue.categories.pluralName,
      text: '',
      color: pinColor
    });
    // push the pushpin to the map.
    userMap.entities.push(pin);
    // make the pushpin clickable: Here is where we will create the
    // function that determines the routes for our users.

    // FUNCTION WAYPOINTS:
    // The purpose of this function is to highlight each clicked pushpins
    // and add their location to an array in order to map waypoints for a
    // custom defined user route.
    Microsoft.Maps.Events.addHandler(pin, 'click', function (e) {

      e.target.setOptions({ color: 'red' });    // If clicked, change the color to red
      const name = e.target.getTitle(pin);
      const id = e.target.getText(pin);
      const waypointName = name + 'Waypoint' + id;
      const location = e.target.getLocation(pin); // Get the lat and lng coordinates  of the pinColor
      // and store them in a variable
      locationLat = location.latitude;
      locationLng = location.longitude;
      locationObj.locationList.push({ name, id, waypointName, locationLat, locationLng });

    });
  }
}