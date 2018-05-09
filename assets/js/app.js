// TODO: When you return, start working on the autocomplete form using awesomplete.js
// focus on adding as many store names as possible to the list, perhaps even look into
// finding a respository of all the retail names to make your life a little easier.

// Create an autocomplete widget for assisting in finding user's pitstops
// along the way

// const awesompleteInput = document.getElementById("placesTbx");
// const awesomeplete = new Awesomplete(awesompleteInput, {
//   minChars: 1,
//   maxItems: 7,
//   autoFirst: true
// });
// awesomeplete.list = autocompleteArr;

// THIS IS OLD AND DEPRECIATED AND NOT IMMEDIATELY REQUIRED -- 4/15/2018

window.onload = function getMap() {
  let obj, catName, searchManager, awesomepleteInput, placesInput = '';

  // create an object for creating a box search for places in foursquare


  const map = new Microsoft.Maps.Map('#myMap', {
    credentials: 'Aq7ULuBT7euUnNSrYvx-6u0bAWfIVmyre8fdnsrE5GEzQGn_Cm26V4DxxBygLqwZ',
    showZoomButtons: false,
    showLocateMeButton: false,
    showMapTypeSelector: false
  });

  // register and load custom modules for use in the app. 
  // it's necessary to import modules this way instead of import / export 
  // because we need to load them inside the getMap() function.
  function loadMapModule(moduleName, modulePath) {
    Microsoft.Maps.registerModule(moduleName, modulePath);
    Microsoft.Maps.loadModule(moduleName);
  }

  loadMapModule('userLocation', './js/userLocation.js');
  Microsoft.Maps.loadModule('Microsoft.Maps.Directions');
  loadMapModule('getDirections', './js/getDirections.js');
  loadMapModule('determinePinColor', './js/determinePinColor.js');
  loadMapModule('getData', './js/getData.js');
  loadMapModule('destinationSearch', './js/destinationSearch.js');
  
  // Load the autosuggest module for assisting in finding the user's
  // end destination.
  Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
    var manager = new Microsoft.Maps.AutosuggestManager({ map: map });
    manager.attachAutosuggest('#destinationInput', selectedSuggestion(elements.destinationInput.value));
  });

  function selectedSuggestion(result) {
    //Remove previously selected suggestions from the map.
    map.entities.clear();

    //Show the suggestion as a pushpin and center map over it.
    var pin = new Microsoft.Maps.Pushpin(result.location);
    map.entities.push(pin);
    map.setView({ bounds: result.bestView });
  }

  function StartTracking(userMap) {
    //Add a pushpin to show the user's location.
    userPin = new Microsoft.Maps.Pushpin(userMap.getCenter(), { visible: false });
    userMap.entities.push(userPin);

    //Watch the users location.
    let watchId = navigator.geolocation.watchPosition(UsersLocationUpdated);
  }

  function UsersLocationUpdated(position) {
    var loc = new Microsoft.Maps.Location(
      position.coords.latitude,
      position.coords.longitude);

    //Update the user pushpin.
    userPin.setLocation(loc);
    userPin.setOptions({ visible: true });

    //Center the map on the user's location.
    map.setView({ center: loc });
  }

  function StopTracking() {
    // Cancel the geolocation updates.
    navigator.geolocation.clearWatch(watchId);

    //Remove the user pushpin.
    map.entities.clear();
  }
  const locationQuery = {
    queryType: '',
    userLocation: { // returns latitude, longitude, and either northwest, northeast, southwest
      // southeast orientation
      lat: '',
      lng: '',
      compass: '' // depreciated, feature needs to be removed as it is not needed.
    },
    destinationLocation: {
      lat: '',
      lng: '',
      compass: '' // see compass above
    }
  }

  // store HTML elements to be manipulated in object 
  const elements = {
    routeTypeContainer: document.getElementById('routeTypeContainer'),
    mapControlsContainer: document.getElementById('mapControlsContainer'),
    destinationContainer: document.getElementById('destinationContainer'),
    getDirectionsContainer: document.getElementById('directionsItinerary'),
    searchContainer: document.getElementById('searchContainer'),
    directionsBtnContainer: document.getElementById('directionsBtnContainer'),
    destinationInput: document.getElementById('destinationInput'),
    searchPlacesInput: document.getElementById('searchPlacesInput'),
    roadTripBtn: document.getElementById('roadTripBtn'),
    vacationBtn: document.getElementById('vacationBtn'),
    destinationBtn: document.getElementById('destinationBtn'),
    searchBtn: document.getElementById('searchBtn'),
    getDirectionsBtn: document.getElementById('getDirectionsBtn'),
    locateMeBtn: document.getElementById('locateMe'),
    resetBtn: document.getElementById('resetBtn')
  }

  const handlers = {
    roadTripBtnClick: () => {
      // set the necessary attributes and settings
      locationQuery.queryType = 'road-trip';
      resetBtn.setAttribute('disabled', '');

      // toggle hidden Attributes on HTML elements
      elements.routeTypeContainer.classList.toggle('hidden');
      elements.mapControlsContainer.classList.toggle('hidden');
      elements.destinationContainer.classList.toggle('hidden');
      elements.searchContainer.classList.toggle('hidden');
      elements.directionsBtnContainer.classList.toggle('hidden');
      elements.getDirectionsContainer.classList.toggle('hidden');
    },
    vacationBtnClick: () => {
      // set the necessary attributes and settings
      locationQuery.queryType = 'vacation';
      resetBtn.setAttribute('disabled', '');

      // toggle hidden Attributes on HTML elements
      elements.routeTypeContainer.classList.toggle('hidden');
      elements.mapControlsContainer.classList.toggle('hidden');
      elements.destinationContainer.classList.toggle('hidden');
      elements.searchContainer.classList.toggle('hidden');
      elements.directionsBtnContainer.classList.toggle('hidden');
      elements.getDirectionsContainer.classList.toggle('hidden');
    },
    destinationBtnClick: () => {
      destinationSearch(destinationInput.value, map, locationQuery.destinationLocation);
      console.log(locationQuery.destinationlocation);
      // slide out the destination container, and slide in the searchPlaces container
      elements.destinationContainer.classList.add("slideOutLeft");
      elements.searchContainer.classList.add("slideInLeft");
      // once the search has started, activate the reset button and then indicate
      // to the user through animation and color change that the button is active.
      elements.resetBtn.removeAttribute('disabled', '');
      elements.resetBtn.classList.remove('deactivateResetBtn');
      elements.resetBtn.classList.add('activateResetBtn');
    },
    searchBtnClick: () => {
      elements.searchContainer.classList.remove("slideInLeft");
      elements.searchContainer.classList.add("slideOutLeft");
      elements.directionsBtnContainer.classList.add("slideInLeft");
      getData(map, locationQuery);
    },
    getDirectionsBtnClick: () => {
      elements.directionsBtnContainer.classList.add('slideOutDown');
      elements.getDirectionsContainer.classList.add('slideInUp');
      getDirections(locationQuery, locationObj, map);
      StartTracking(map);
    },
    locateMeBtnClick: () => {
      locateMe(map, locationQuery.userLocation);
    },
    resetBtnClick: () => {

      elements.destinationContainer.classList.remove('slideOutLeft');
      elements.searchContainer.classList.remove('slideOutLeft');
      elements.directionsBtnContainer.classList.remove('slideInLeft');
      elements.directionsBtnContainer.classList.remove('slideOutDown');

      // return the reset button to its original state. 
      elements.getDirectionsContainer.classList.remove('slideInUp');
      elements.resetBtn.setAttribute('disabled', '');
      elements.resetBtn.classList.remove('activateResetBtn');
      elements.resetBtn.classList.add('deactivateResetBtn');

      // clear all inputs and map data. 
      elements.destinationInput.value = '';
      elements.searchPlacesInput.value = '';
      map.entities.clear();
      window.directionsManager.clearAll();
    }
  }

  elements.roadTripBtn.addEventListener('click', function () { handlers.roadTripBtnClick() });
  elements.vacationBtn.addEventListener('click', function () { handlers.vacationBtnClick() });
  elements.destinationBtn.addEventListener('click', function () { handlers.destinationBtnClick() });
  elements.searchBtn.addEventListener('click', function () { handlers.searchBtnClick() });
  elements.getDirectionsBtn.addEventListener('click', function () { handlers.getDirectionsBtnClick() });
  elements.locateMeBtn.addEventListener('click', function () { handlers.locateMeBtnClick() });
  elements.resetBtn.addEventListener('click', function () { handlers.resetBtnClick() });
  elements.getDirectionsContainer.addEventListener('mouseover', function () { map.setOptions({ disableZooming: true }); });
  elements.getDirectionsContainer.addEventListener('mouseout', function () { map.setOptions({ disableZooming: false }); });
}