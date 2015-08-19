GMaps.prototype.getRoutes = function(options) {
  var travelMode, unitSystem;

  switch (options.travelMode) {
    case 'bicycling':
      travelMode = google.maps.TravelMode.BICYCLING;
      break;
    case 'transit':
      travelMode = google.maps.TravelMode.TRANSIT;
      break;
    case 'driving':
      travelMode = google.maps.TravelMode.DRIVING;
      break;
    default:
      travelMode = google.maps.TravelMode.WALKING;
      break;
  }

  if (options.unitSystem === 'imperial') {
    unitSystem = google.maps.UnitSystem.IMPERIAL;
  }
  else {
    unitSystem = google.maps.UnitSystem.METRIC;
  }

  var baseOptions = {
    avoidHighways: false,
    avoidTolls: false,
    optimizeWaypoints: false,
    waypoints: []
  };
  var requestOptions =  this.utils.merge(baseOptions, options);

  requestOptions.origin = /string/.test(typeof options.origin) ? options.origin : new google.maps.LatLng(options.origin[0], options.origin[1]);
  requestOptions.destination = /string/.test(typeof options.destination) ? options.destination : new google.maps.LatLng(options.destination[0], options.destination[1]);
  requestOptions.travelMode = travelMode;
  requestOptions.unitSystem = unitSystem;

  delete requestOptions.callback;
  delete requestOptions.error;

  var self = this,
      service = new google.maps.DirectionsService();

  service.route(requestOptions, function(result, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      for (var r in result.routes) {
        if (result.routes.hasOwnProperty(r)) {
          self.routes.push(result.routes[r]);
        }
      }

      if (options.callback) {
        options.callback(self.routes);
      }
    }
    else {
      if (options.error) {
        options.error(result, status);
      }
    }
  });
};


GMaps.prototype.removeRoutes = function() {
  this.routes.length = 0;
};


GMaps.prototype.getElevations = function(options) {
  var self = this;
  options = this.utils.merge({
    locations: [],
    path : false,
    samples : 256
  }, options);

  if (options.locations.length > 0) {
    if (options.locations[0].length > 0) {
      options.locations = this.utils.arrayFlat(
        this.utils.arrayMap(
          [options.locations],
          function(c) { return self.utils.arrayToLatLng(c, false); }
        )
      );
    }
  }

  var callback = options.callback;
  delete options.callback;

  var service = new google.maps.ElevationService();

  //location request
  if (!options.path) {
    delete options.path;
    delete options.samples;

    service.getElevationForLocations(options, function(result, status) {
      if (callback && typeof callback === 'function') {
        callback(result, status);
      }
    });
  //path request
  } else {
    var pathRequest = {
      path : options.locations,
      samples : options.samples
    };

    service.getElevationAlongPath(pathRequest, function(result, status) {
     if (callback && typeof callback === 'function') {
        callback(result, status);
      }
    });
  }
};

GMaps.prototype.cleanRoute = GMaps.prototype.removePolylines;

GMaps.prototype.drawRoute = function() {
  var args = Array.prototype.slice.call(arguments);
  this.addRoute.apply(this, args);
};

GMaps.prototype.addRoute = function(options) {
  var self = this;

  this.getRoutes({
    origin: options.origin,
    destination: options.destination,
    travelMode: options.travelMode,
    waypoints: options.waypoints,
    unitSystem: options.unitSystem,
    error: options.error,
    callback: function(e) {
      if (e.length > 0) {
        var polyline_options = {
          path: e[e.length - 1].overview_path,
          strokeColor: options.strokeColor,
          strokeOpacity: options.strokeOpacity,
          strokeWeight: options.strokeWeight
        };

        if (options.hasOwnProperty('icons')) {
          polyline_options.icons = options.icons;
        }

        self.addPolyline(polyline_options);
        
        if (options.callback) {
          options.callback(e[e.length - 1]);
        }
      }
    }
  });
};


GMaps.prototype.travelRoute = function(options) {
  var route, steps, step, i, l;

  if (options.origin && options.destination) {
    this.getRoutes({
      origin: options.origin,
      destination: options.destination,
      travelMode: options.travelMode,
      waypoints : options.waypoints,
      unitSystem: options.unitSystem,
      error: options.error,
      callback: function(e) {

        //start callback
        if (e.length > 0 && options.start) {
          options.start(e[e.length - 1]);
        }

        //step callback
        if (e.length > 0 && options.step) {
          route = e[e.length - 1];

          if (route.legs.length > 0) {

            steps = route.legs[0].steps;
            for (i = 0, l = steps.length; i < l; i++) {
              step = steps[i];
              step.step_number = i;
              options.step(step, (route.legs[0].steps.length - 1));
            }
          }
        }

        //end callback
        if (e.length > 0 && options.end) {
           options.end(e[e.length - 1]);
        }
      }
    });
  }
  else if (options.route && options.route.legs.length > 0) {
    steps = options.route.legs[0].steps;
    for (i = 0, l = steps.length; i < l; i++) {
      step = steps[i];
      step.step_number = i;
      options.step(step);
    }
  }
};


GMaps.prototype.drawSteppedRoute = function() {
  var args = Array.prototype.slice.call(arguments);
  this.addSteppedRoute.apply(this, args);
};

GMaps.prototype.addSteppedRoute = function(options) {
  var self = this;
  var route, steps, step, i, l, polyline_options;
  
  if (options.origin && options.destination) {
    this.getRoutes({
      origin: options.origin,
      destination: options.destination,
      travelMode: options.travelMode,
      waypoints : options.waypoints,
      error: options.error,
      callback: function(e) {
        //start callback
        if (e.length > 0 && options.start) {
          options.start(e[e.length - 1]);
        }

        //step callback
        if (e.length > 0 && options.step) {
        
          route = e[e.length - 1];
          if (route.legs.length > 0) {

            steps = route.legs[0].steps;
            for (i = 0, l = steps.length; i < l; i++) {
              step = steps[i];
              step.step_number = i;
              polyline_options = {
                path: step.path,
                strokeColor: options.strokeColor,
                strokeOpacity: options.strokeOpacity,
                strokeWeight: options.strokeWeight
              };

              if (options.hasOwnProperty('icons')) {
                polyline_options.icons = options.icons;
              }

              self.addPolyline(polyline_options);
              options.step(step, (route.legs[0].steps.length - 1));
            }
          }
        }

        //end callback
        if (e.length > 0 && options.end) {
           options.end(e[e.length - 1]);
        }
      }
    });
  }
  else if (options.route) {
    if (options.route.legs.length > 0) {

      steps = options.route.legs[0].steps;
      for (i = 0, l = steps.length; i < l; i++) {
        step = steps[i];
        step.step_number = i;
        polyline_options = {
          path: step.path,
          strokeColor: options.strokeColor,
          strokeOpacity: options.strokeOpacity,
          strokeWeight: options.strokeWeight
        };

        if (options.hasOwnProperty('icons')) {
          polyline_options.icons = options.icons;
        }

        self.addPolyline(polyline_options);
        options.step(step);
      }
    }
  }
};


GMaps.Route = function(options) {
  this.origin = options.origin;
  this.destination = options.destination;
  this.waypoints = options.waypoints;

  this.map = options.map;
  this.route = options.route;
  this.step_count = 0;
  this.steps = this.route.legs[0].steps;
  this.steps_length = this.steps.length;

  var polyline_options = {
    path: new google.maps.MVCArray(),
    strokeColor: options.strokeColor,
    strokeOpacity: options.strokeOpacity,
    strokeWeight: options.strokeWeight
  };

  if (options.hasOwnProperty('icons')) {
    polyline_options.icons = options.icons;
  }

  this.polyline = this.map.addPolyline(polyline_options).getPath();
};

GMaps.Route.prototype.getRoute = function(options) {
  var self = this;

  this.map.getRoutes({
    origin : this.origin,
    destination : this.destination,
    travelMode : options.travelMode,
    waypoints : this.waypoints || [],
    error: options.error,
    callback : function(e) {
      self.route = e && e[0];

      if (options.callback) {
        options.callback.call(self);
      }
    }
  });
};


GMaps.Route.prototype.back = function() {
  if (this.step_count > 0) {
    this.step_count--;
    var path = this.route.legs[0].steps[this.step_count].path;

    for (var p in path){
      if (path.hasOwnProperty(p)){
        this.polyline.pop();
      }
    }
  }
};


GMaps.Route.prototype.forward = function() {
  if (this.step_count < this.steps_length) {
    var path = this.route.legs[0].steps[this.step_count].path;

    for (var p in path){
      if (path.hasOwnProperty(p)){
        this.polyline.push(path[p]);
      }
    }
    this.step_count++;
  }
};
