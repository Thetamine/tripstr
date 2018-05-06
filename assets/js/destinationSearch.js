// geocode to the map the destination coordinates the user is attempting to travel
// to.
function destinationSearch(query, userMap, locationObj) {
  Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
    searchManager = new Microsoft.Maps.Search.SearchManager(userMap);
    geocodeQuery(query, userMap, locationObj, searchManager);
  });
}

function geocodeQuery(query, userMap, locationObj, searchManager) {
  //If search manager is not defined, load the search module.
  const searchRequest = {
    thisMap: userMap,
    where: query,
    callback: function (r) {
      //Add the first result to the map and zoom into it.
      if (r && r.results && r.results.length > 0) {
        let pin = new Microsoft.Maps.Pushpin(r.results[0].location);

        userMap.entities.push(pin);

        userMap.setView({ bounds: r.results[0].bestView });
      }
      locationObj.lat = r.results[0].location.latitude;
      locationObj.lng = r.results[0].location.longitude;
    },
    errorCallback: function (e) {
      //If there is an error, alert the user about it.
      alert("No results found.");
    }
  };
  //Make the geocode request.
  searchManager.geocode(searchRequest);
}