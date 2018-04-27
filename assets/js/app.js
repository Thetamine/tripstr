// TODO: When you return, start working on the autocomplete form using awesomplete.js
// focus on adding as many store names as possible to the list, perhaps even look into
// finding a respository of all the retail names to make your life a little easier.
// THIS IS OLD AND DEPRECIATED AND NOT IMMEDIATELY REQUIRED -- 4/15/2018

// TODO: When you return, the last requirement for V1 is to break out the getDirections
// function into two different api calls to foursquare, one is basically complete,
// but should search for locations around your end destination using the radius feature
// the other is more suited for roadtrips, and uses the bounding box search to gather
// destination in between your current location and the end destination.

// Create an autocomplete widget for assisting in finding user's pitstops
// along the way

//if the user is not authenticated, redirect to foursquare authentication

// const awesompleteInput = document.getElementById("placesTbx");
// const awesomeplete = new Awesomplete(awesompleteInput, {
//   minChars: 1,
//   maxItems: 7,
//   autoFirst: true
// });
// awesomeplete.list = autocompleteArr;

window.onload = function getMap() {
  let obj, catName, directionsManager, searchManager, awesomepleteInput, placesInput = '';
  const locationObj = { locationList: [] };   // create an array object to store the variable location list.
  // for the maps event handler function 'waypoints'
  destinationDiv = document.getElementById('destinationInputDiv');
  placesDiv = document.getElementById('placesInputDiv');

  //todo: finish bounding box search function
  // infomation collection functions complete, now 
  // just need to set up a route in the express server
  // to search for locations using the bounding box


  // create an object for creating a box search for places in foursquare
  const locationQuery = {
    queryType: '',
    userLocation: { // returns latitude, longitude, and either northwest, northeast, southwest
      // southeast orientation
      lat: '',
      lng: '',
      compass: '' // should return ne, sw when determining the bounding box based on lat, lng

    },
    destinationLocation: {
      lat: '',
      lng: '',
      compass: '' // see compass above
    }
  }

  const map = new Microsoft.Maps.Map('#myMap', {
    credentials: 'Aq7ULuBT7euUnNSrYvx-6u0bAWfIVmyre8fdnsrE5GEzQGn_Cm26V4DxxBygLqwZ',
    showZoomButtons: false,
    showLocateMeButton: false,
    showMapTypeSelector: false
  });


  function selectedSuggestion(result) {
    //Remove previously selected suggestions from the map.
    map.entities.clear();

    //Show the suggestion as a pushpin and center map over it.
    var pin = new Microsoft.Maps.Pushpin(result.location);
    map.entities.push(pin);
    map.setView({ bounds: result.bestView });
  }

  // Define a Constructor for the custom overlay class
  function uiOverlay() {
    // create a dummy button to get some Data
    // TODO: Replace with an actual search function

    // create a container for the directionsItinerary
    this.getDirectionsContainer = document.createElement('section');
    this.getDirectionsContainer.id = 'directionsItinerary';
    this.getDirectionsContainer.className = 'container container__searchControls container__searchControls--directionsItinerary hidden';
    this.getDirectionsContainer.onmouseover = function () {
      map.setOptions({ disableZooming: true });
    }
    this.getDirectionsContainer.onmouseout = function () {
      map.setOptions({ disableZooming: false });
    }
  }
  // Define a custom overlay class that ingerits from the CustomOverlay Class.
  uiOverlay.prototype = new Microsoft.Maps.CustomOverlay({ beneathLabels: false });


  // Implement the onAdd method to set up DOM elements, asn use SetHtmlElement
  // to bind it with the overlay.

  uiOverlay.prototype.onAdd = function () {
    // construct all html elements for use on the app
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';

    const routeTypeContainer = document.createElement('div');
    routeTypeContainer.className = 'routeTypeContainer';

    const mapControlsContainer = document.createElement('div');
    mapControlsContainer.className = 'container__mapControls';

    const roadTripModal = document.createElement('div');
    roadTripModal.className = 'roadTripModal';

    const vacationModal = document.createElement('div');
    vacationModal.className = 'vacationModal';

    const destinationContainer = document.createElement('div');
    destinationContainer.className = 'container container__searchControls container__searchControls--destinationSearch hidden';

    const searchContainer = document.createElement('div')
    searchContainer.id = 'searchContainer';
    searchContainer.className = 'container container__searchControls container__searchControls--placesSearch hidden';

    const directionsBtnContainer = document.createElement('div');
    directionsBtnContainer.className = 'container container__searchControls container__searchControls--getDirections hidden';

    //input field for finding the user's end destination
    this.destinationInput = document.createElement('input');
    this.destinationInput.id = 'destinationInput';
    this.destinationInput.className = 'destinationInput';
    this.destinationInput.placeholder = 'where are you going?';

    // button for input field. submits information, triggers animations and brings the 
    // next input into view 
    this.destinationBtn = document.createElement('button');
    this.destinationBtn.id = 'destinationBtn';
    this.destinationBtn.className = 'inputGroup__btn ';
    this.destinationBtn.onclick = function () {
      loadMapModule(destinationInput.value, map, locationQuery.destinationLocation);
      console.log(locationQuery.destinationlocation);
      // slide out the destination container, and slide in the searchPlaces container
      destinationContainer.classList.add("slideOutLeft");
      searchContainer.classList.add("slideInLeft");
      // once the search has started, activate the reset button and then indicate
      // to the user through animation and color change that the button is active.
      this.resetBtn.removeAttribute('disabled', '');
      this.resetBtn.classList.remove('deactivateResetBtn');
      this.resetBtn.classList.add('activateResetBtn');

    }.bind(this);

    // <i class="far fa-arrow-al-circle-right"></i>
    // an element for the font awesome icron circle arrow right, used to provide polish
    // for the destination button. 
    this.faDestinationIcon = document.createElement('i');
    this.faDestinationIcon.className = 'far fa-arrow-alt-circle-right';

    // input for the user to search for places they're interested in visiting along the 
    // way.
    this.searchInput = document.createElement('input');
    this.searchInput.id = 'searchPlacesInput';
    this.searchInput.className = 'searchPlacesInput';
    this.searchInput.placeholder = 'Enter Search Terms';

    // button for storing user searches, switching out element, and getting data,
    // charting places on the map. 
    this.searchBtn = document.createElement('button');
    this.searchBtn.id = 'searchBtn';
    this.searchBtn.className = 'inputGroup__btn';
    this.searchBtn.onclick = function () {
      searchContainer.classList.remove("slideInLeft");
      searchContainer.classList.add("slideOutLeft");
      directionsBtnContainer.classList.add("slideInLeft");
      getData(map, locationQuery);
    };

    // font awesome search icon, for polishing the user interface acting as the button
    // value for searchInput.
    this.faSearchIcon = document.createElement('i');
    this.faSearchIcon.className = 'fa fa-search';

    // create a buttom that maps out your chosen route
    this.getDirectionsBtn = document.createElement('input');
    this.getDirectionsBtn.type = 'button';
    this.getDirectionsBtn.value = 'get directions!';
    this.getDirectionsBtn.id = 'getDirectionsBtn';
    this.getDirectionsBtn.className = 'tripstr__btn --blue --directionsBtn';
    this.getDirectionsBtn.onclick = function () {
      directionsBtnContainer.classList.add('slideOutDown');
     
      this.getDirectionsContainer.classList.add('slideInUp');
      getDirections(locationQuery);
    }.bind(this);

    // create a button that maps out your current location
    this.locateMeBtn = document.createElement('button');
    this.locateMeBtn.id = 'locateMe';
    this.locateMeBtn.className = 'mapControls__btn --locateMeBtn fa fa-crosshairs hidden';
    this.locateMeBtn.onclick = function () {
      locateMe(map, locationQuery.userLocation);
    };
  
    // create a button for defining your route type as a vacation.
    // presented to the user when they're planning their trip the first time
    this.vacationBtn = document.createElement('input');
    this.vacationBtn.type = 'button';
    this.vacationBtn.className = 'tripstr__btn --green';
    this.vacationBtn.value = 'Vacation';
    this.vacationBtn.onclick = function () {
      locationQuery.queryType = 'vacation';
      routeTypeContainer.classList.toggle('hidden');
      destinationContainer.classList.toggle('hidden');
      searchContainer.classList.toggle('hidden');
      directionsBtnContainer.classList.toggle('hidden');
      
      this.getDirectionsContainer.classList.toggle('hidden');
      this.resetBtn.classList.toggle('hidden'); 
      this.resetBtn.setAttribute('disabled', '');
     
      this.locateMeBtn.classList.toggle('hidden');
    }.bind(this);

    // create some text to accompany the vacation button
    // giving the user some instruction on what they should do. 
    this.vacationText = document.createElement('p');
    this.vacationText.innerHTML = 'Going on Vacation?';

    // see comment for vacation button, this is the same thing, 
    // only it defines the trip as a road trip, and changes how the 
    // app searches for locations. 
    this.roadTripBtn = document.createElement('input');
    this.roadTripBtn.type = 'button';
    this.roadTripBtn.className = 'tripstr__btn --green';
    this.roadTripBtn.value = 'Road Trip';
    this.roadTripBtn.onclick = function () {
      locationQuery.queryType = 'road-trip';
      routeTypeContainer.classList.toggle('hidden');
      destinationContainer.classList.toggle('hidden');
      searchContainer.classList.toggle('hidden');
      directionsBtnContainer.classList.toggle('hidden');
      
      this.getDirectionsContainer.classList.toggle('hidden');
      this.resetBtn.classList.toggle('hidden');
      this.resetBtn.setAttribute('disabled', '');

      this.locateMeBtn.classList.toggle('hidden'); 
    }.bind(this);

    // serves the same purpose as vacationText. Just giving the user an idea
    // for how to use the app.
    this.roadTripText = document.createElement('p');
    this.roadTripText.innerHTML = 'Heading on a Road Trip?';

    // create a close button that resets all information
    // and clears all inputs 
    this.resetBtn = document.createElement('button');
    this.resetBtn.id = 'closeDirections';
    this.resetBtn.className = 'mapControls__btn --resetBtn fa fa-times hidden';
    this.resetBtn.onclick = function () {
      destinationContainer.classList.remove('slideOutLeft');
      searchContainer.classList.remove('slideOutLeft');
      directionsBtnContainer.classList.remove('slideInLeft');
      directionsBtnContainer.classList.remove('slideOutDown');
      
      // return the reset button to its original state. 
      this.getDirectionsContainer.classList.remove('slideInUp');
      this.resetBtn.setAttribute('disabled', '');
      this.resetBtn.classList.remove('activateResetBtn');
      this.resetBtn.classList.add('deactivateResetBtn');

      // clear all inputs and map data. 
      this.destinationInput.value = '';
      this.searchInput.value = '';
      map.entities.clear();
      directionsManager.clearAll();
    }.bind(this);
    
    // build out the elements into their respective containers based on app logic
    container.appendChild(routeTypeContainer);

    routeTypeContainer.appendChild(vacationModal);

    vacationModal.appendChild(this.vacationText);
    vacationModal.appendChild(this.vacationBtn);

    routeTypeContainer.appendChild(roadTripModal);
    roadTripModal.appendChild(this.roadTripText);
    roadTripModal.appendChild(this.roadTripBtn);

    container.appendChild(searchContainer);
    container.appendChild(destinationContainer);
    container.appendChild(directionsBtnContainer);

    container.appendChild(mapControlsContainer);
    mapControlsContainer.appendChild(this.resetBtn);
    mapControlsContainer.appendChild(this.locateMeBtn);

    searchContainer.appendChild(this.searchInput);
    searchContainer.appendChild(this.searchBtn);
    this.searchBtn.appendChild(this.faSearchIcon);


    destinationContainer.appendChild(this.destinationInput);
    destinationContainer.appendChild(this.destinationBtn);
    this.destinationBtn.appendChild(this.faDestinationIcon);

    directionsBtnContainer.appendChild(this.getDirectionsBtn);

    container.appendChild(this.getDirectionsContainer);


    // style a container for the directionsItinerary
    this.setHtmlElement(container);
  }

  // Implement the custom overlay to the map
  var uiLayer = new uiOverlay();

  // add the custom overlay to the map
  map.layers.insert(uiLayer);

  // determine and color code the pushpins by resultCategory
  // TODO: assign the other category names to the function that we will be using
  function determinePinColor(resultCategory) {
    switch (resultCategory) {
      case "Fast Food Restaurant":
        return "green";
      default:
        return "blue";
    }
  }

  function getDestination() {
    destination = document.getElementById("destinationInput");
    console.log('locationQuery Object: ', locationQuery);
  }

  function toggleContainers(containerToHide, containerToShow, className) {
    containerToHide.classList.toggle(className);
    containerToShow.classList.toggle(className);
  }

  // create a route based on user input from the getSearchData function
  function getDirections(locationQueryObj) {
    console.log('function Started!');
    // load the directions module
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {

      // Create an instance of the directions manager.
      directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);

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
      createWaypoint(locationQueryObj.userLocation, 'Current Location', locationQueryObj.userLocation.lat, locationQueryObj.userLocation.lng);

      // Loop through the location object, finding the id, name, latitude
      // and longitude of each point in the array then call the createWaypoint
      // function and add each location as a waypoint
      for (i = 0; i < locationObj.locationList.length; i++) {
        let waypoints = locationObj.locationList[i];
        createWaypoint(waypoints.waypointName, waypoints.name, waypoints.locationLat, waypoints.locationLng);
      }

      //create a waypoint for the ending Destination
      // Clear all pins off of the map to prepare for the route phase
      map.entities.clear();

      // Specify the Element in which the itenerary will be rendered.
      directionsManager.setRenderOptions({ itineraryContainer: '#directionsItinerary' });

      // Calculate directions / routes
      directionsManager.calculateDirections();
    });
  }

  // Load the autosuggest module for assisting in finding the user's
  // end destination.
  Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
    var manager = new Microsoft.Maps.AutosuggestManager({ map: map });
    manager.attachAutosuggest('#destinationInput', selectedSuggestion(destinationInput.value));
  });

  function getData(userMap, locObj) {

    if (locObj.queryType === 'vacation') {
      $.getJSON(`https://arcane-basin-98906.herokuapp.com/search/vacation/${locObj.destinationLocation.lat},${locObj.destinationLocation.lng}/${searchPlacesInput.value}`, function (data) {
        // code is breaking right here, might need to get data from the json call into the done block. Azsq  
      })
        .done(function (data) {
          console.log(data)
          pushPlaces(data, map);
        })
        .fail(function (err) {
          console.log(err);
        });
    } else {
      $.getJSON(`https://arcane-basin-98906.herokuapp.com/search/road-trip
/${locObj.userLocation.lat},${locObj.userLocation.lng}
/${locObj.destinationLocation.lat},${locObj.destinationLocation.lng}
/${searchPlacesInput.value}`, function (data) { })
        .done(function (data) {
          // Run a for loop that returns all available results as pushpins
          // on the map
          pushPlaces(data, map);
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
      let pin = new Microsoft.Maps.Pushpin(loc);
      userMap.entities.push(pin);

      //Center the map on the user's location.
      userMap.setView({ center: loc, zoom: 15 });

      //set the user's current location in locationQuery Object
      userObj.lat = loc.latitude;
      userObj.lng = loc.longitude;

      console.log('user location: ', userObj);

      watchId = navigator.geolocation.watchPosition(UsersLocationUpdated);
    });
  }

  function UsersLocationUpdated(position, userMap) {
    var loc = new Microsoft.Maps.Location(
      position.coords.latitude,
      position.coords.longitude);

    //Update the user pushpin.
    userPin.setLocation(loc);
    userPin.setOptions({ visible: true });

    //Center the map on the user's location.
    userMap.setView({ center: loc });
  }

  function StopTracking(userMap) {
    // Cancel the geolocation updates.
    navigator.geolocation.clearWatch(watchId);

    //Remove the user pushpin.
    userMap.entities.clear();
  }


  function loadMapModule(query, userMap, locationObj) {
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
}
