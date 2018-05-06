let userPin;

function locateMe(userMap, userObj) {
  const options = {
    enableHighAccuracy: true
  }
  //Request the user's location
  navigator.geolocation.getCurrentPosition(function (position, options) {
    let loc = new Microsoft.Maps.Location(
      position.coords.latitude,
      position.coords.longitude);

    //Add a pushpin at the user's location.
    userPin = new Microsoft.Maps.Pushpin(loc);
    userMap.entities.push(userPin);

    //Center the map on the user's location.
    userMap.setView({ center: loc, zoom: 15 });

    //set the user's current location in locationQuery Object
    userObj.lat = loc.latitude;
    userObj.lng = loc.longitude;

    console.log('user location: ', userObj);
  });
}