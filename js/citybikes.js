function getURLParameter(name) {
  var param = decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
  // Strip any trailing slash
  return param.replace(/\/$/, '');
}

function distanceBetweenLocAndStation(loc, station) {
  return getDistanceFromLatLonInMetres(
    loc.coords.latitude,
    loc.coords.longitude,
    station.y,
    station.x);
}

function ShowClosest(loc) {

  // Load stations from API
  $.ajax({
    //url: "https://api.digitransit.fi/routing/v1/routers/hsl/bike_rental",
    url: "https://www.bicilascondes.cl/availability_map/getJsonObject",
    headers: {
      Accept : "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8"
    },
    success : function(data) {

      // Find distance from here to each station
      $.each(data.stations, function(key, val) {
        val.distance = Math.round(distanceBetweenLocAndStation(loc, val));
      });

      // Sort by closest to here
      data.stations.sort(compareDistances);

      // Reset list
      $("#live-geolocation").html('Closest:');
      $("ul").empty();

      // Update list
      $.each(data.stations, function(key, val) {

        var totalSlots = val.bikesAvailable + val.spacesAvailable;
        var slotDivStart = '<div class="city-bike-column';
        var slotDivEnd = '"></div>';
        var slots = '';

        for (i = 0; i < val.bikesAvailable; i++) {
         slots += slotDivStart + ' available' + slotDivEnd;
        }
        for (i = 0; i < val.spacesAvailable; i++) {
         slots += slotDivStart + slotDivEnd;
        }

        $('#metro-list').append(
          $('<li class="station">').append(
            // '<span class="dist">' + val.id + '</span>' +
            '&nbsp;' + val.name +
            ' <span class="dist">' +
            numberWithSpaces(val.distance) + '&nbsp;m' +
            ' ' + val.bikesAvailable + '/' + totalSlots + '</span>' +
            '<div class="slots">' + slots + '</div>'
            ));
      });

    }});

}

function ShowClosestError() {
  $("#live-geolocation").html('No cacho, wn.');
}

$(document).ready(function() {

  // Load stations from API
  $.ajax({
    url: "https://api.digitransit.fi/routing/v1/routers/hsl/bike_rental",
    headers: {
      Accept : "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8"
    },
    success : function(data) {

      // Show in list
      $.each(data.stations, function(key, val) {
        $('#metro-list').append(
          $('<li class="station">').append(val.name));
      });

      // Do we have lat/lon parameters?
      if (getURLParameter("lat") !== "null" &&
          getURLParameter("lon") !== "null" ) {
        var loc = {
          coords: {
            latitude: getURLParameter("lat"),
            longitude: getURLParameter("lon")
          }
        }
        ShowClosest(loc);
      }
      // Do we have an ID parameter?
      else if (getURLParameter('id') !== 'null') {
        var id = getURLParameter('id').toUpperCase();
        $.each(data.stations, function(key, val) {
          if (val.id === id) {
            var loc = {
              coords: {
                latitude: val.y,
                longitude: val.x
              }
            }
            ShowClosest(loc);
            return false;
          }
        });
      }
      // Do we have a name parameter?
      else if (getURLParameter('name') !== 'null') {
        var name = getURLParameter('name').toLowerCase();
        $.each(data.stations, function(key, val) {
          // If substring found
          if (val.name.toLowerCase().indexOf(name) > -1) {
            var loc = {
              coords: {
                latitude: val.y,
                longitude: val.x
              }
            }
            ShowClosest(loc);
            return false;
          }
        });
      }
      // Otherwise boot up the satellites
      else if (geoPosition.init()) {
        $("#live-geolocation").html('Checking...');
        lookupLocation();
      } else {
        $("#live-geolocation").html('Dunno.');
      }

    } });

});
