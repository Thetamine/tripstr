const express = require('express');
const requestPromise = require('request-promise-native');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

let code, token, sess; 

let today = new Date();

//set an authentication object for testing
const authentication = {
  clientId: 'L5P33BUJOJIRC3JJQ5DP2Q5UETACUJ5B3J1P21PZGGKU1TE4',
  clientSecret: 'PIVSGE1L5TLOYYRQS5EZIF4O45LO5XSWNLU23SCCMTPKAXIV',
  redirectURL: 'http://localhost:8080/callback',
  bingAPIKey: 'Aq7ULuBT7euUnNSrYvx-6u0bAWfIVmyre8fdnsrE5GEzQGn_Cm26V4DxxBygLqwZ'
};

const PORT = process.env.PORT || 8080;


app.set('view engine', 'ejs');

app.use(session({secret: 'timetoputsomerandomstring', cookie: {maxAge: 1000 * 60 *15 }}));

// This is the apps registered redirect URI, and where the user will be bounced once they log
// into foursquare. First we make sure that the user has indeed logged into foursquare
// then we send a request to the foursquare API which will fetch their OAuth token for use
// throughout the rest of the application. It will be stored as a cookie upon login that 
// This route checks to see if the user is logged in, if so, it delivers them to the home
// of the app, if they're not, it redirects them to foursqaure to log in and gain permission

function requireLogin(req, res, next) {
  sess = req.session;
      // if the user is logged into foursquare, present some information to the logged in user
  if(sess.token === null || !sess.token) {
    res.redirect('/');
  } else {   // Otherwise, bring them to the home page.
    next();
  }
}

app.get('/', function(req, res){
  sess = req.session;
      // if the user is logged into foursquare, present some information to the logged in user
  console.log('Session: ', sess);
  if(sess.token === null || !sess.token) {
    res.render('index');
  } else {   // Otherwise, bring them to the home page.
    res.render('userHome');
  }
});

//begin the foursquare authentication process.
app.get('/login', function(req, res){
  res.redirect(`https://foursquare.com/oauth2/authenticate?client_id=${authentication.clientId}&response_type=code&redirect_uri=${authentication.redirectURL}`);
});

app.get('/callback', function(req, res){
  sess = req.session;
  // make sure that code param exists (the user gets this when 
  // they accept @ foursquare) then store it as a variable
  if(!req.query.code){
    res.render('400');
  } else {
    code = req.query.code;
    requestPromise({
      url: 'https://foursquare.com/oauth2/access_token',
      method: 'GET',
      qs: {
        client_id: authentication.clientId,
        client_secret: authentication.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: authentication.redirectURL,
        code: code,
        v: 20180410
      }
    }, storeToken)
    .then(function(){
      res.redirect('/');
    })
    .catch(function(err){
      console.log(err);
    });
  };
});

app.get('/search/vacation/:destinationLocationLL/:places', requireLogin, function(req, res){
  // url we're going to be making a request too
  // https://api.foursquare.com/v2/venues/explore?near=florence,al&intent=browse&radius=2500&query=${placesInput}&client_id=L5P33BUJOJIRC3JJQ5DP2Q5UETACUJ5B3J1P21PZGGKU1TE4&client_secret=PIVSGE1L5TLOYYRQS5EZIF4O45LO5XSWNLU23SCCMTPKAXIV&v=20171213
  requestPromise({
    url: 'https://api.foursquare.com/v2/venues/explore',
    qs: {
      near: req.params.destinationLocationLL,
      intent: 'browse',
      radius: '2500',
      query: req.params.places,
      oauth_token: sess.token.access_token,
      v: formatDate(today)
    }
  })
  .then(function(body){
    res.send(JSON.parse(body).response.groups[0].items);
  })
  .catch(function(err){
    console.log(err)
  });
});

app.get('/search/road-trip/:userLocationLL/:destinationLocationLL/:places', requireLogin, function(req, res){
  

  requestPromise({
    url: 'https://dev.virtualearth.net/REST/v1/routes/',
    qs: {
      travelMode: 'Driving',
      "wp.0": req.params.userLocationLL,
      "wp.1": req.params.destinationLocationLL,
      ra: 'routePath',
      key: authentication.bingAPIKey
    }
  })
  .then(function(body){
    data = JSON.parse(body);
    const bbox = {
      bboxArray: [
        {
          location: {
              lat: '',
              lng: '',
          }
        },
          {
            location: {
              lat: '',
              lng: '',
          }
        }
        ]
    };

    bbox.bboxArray[0].location.lat = data.resourceSets[0].resources[0].bbox[0];
    bbox.bboxArray[0].location.lng = data.resourceSets[0].resources[0].bbox[1];
    
    bbox.bboxArray[1].location.lat = data.resourceSets[0].resources[0].bbox[2];
    bbox.bboxArray[1].location.lng = data.resourceSets[0].resources[0].bbox[3];

  // once we have the correct bbox values, search for places, and return them to the client.
  // https://api.foursquare.com/v2/venues/explore?near=florence,al&intent=browse&radius=2500&query=${placesInput}&client_id=L5P33BUJOJIRC3JJQ5DP2Q5UETACUJ5B3J1P21PZGGKU1TE4&client_secret=PIVSGE1L5TLOYYRQS5EZIF4O45LO5XSWNLU23SCCMTPKAXIV&v=20171213
    requestPromise({
      url: 'https://api.foursquare.com/v2/venues/explore',
      qs: {
        sw: `${bbox.bboxArray[0].location.lat}, ${bbox.bboxArray[0].location.lng}`,
        ne: `${bbox.bboxArray[1].location.lat},${bbox.bboxArray[1].location.lng}`,
        intent: 'browse',
        query: req.params.places,
        oauth_token: sess.token.access_token,
        v: formatDate(today)
      }
    })
    .then(function(body){
      let apiArray = [].concat(JSON.parse(body).response.groups[0].items);
      requestPromise({
        url: 'https://api.foursquare.com/v2/venues/explore',
        qs: {
          near: req.params.destinationLocationLL,
          intent: 'browse',
          radius: '2500',
          query: req.params.places,
          oauth_token: sess.token.access_token,
          v: formatDate(today)
        }
      })
      .then(function(body){ 
        apiArray = apiArray.concat(JSON.parse(body).response.groups[0].items);
        const filteredApiArray = apiArray.filter((item, i) => {
          return !apiArray.find((el, n) => i !== n && el.venue.id === item.venue.id);
        });
        res.send(filteredApiArray);
      })
      .catch(function(err){
        console.log(err)
      });
    })
    .catch(function(err){
      console.log(err)
    });
  })
  .catch(function(err){
    console.log(err)
  });
});

//create route that destroys session variable when visited
app.get('/logout', function(req, res){
  sess = req.session;
  sess.token = null;
  console.log(sess);
  res.redirect('/');

});

function storeToken(err, res, body) {
  if (err) {
    console.log(err);
  } else {
    sess.token = JSON.parse(body);
  }
}

function formatDate(date) {
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('');
}

app.use(express.static(__dirname + '/public/dist'));

app.listen(PORT);