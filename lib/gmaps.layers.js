GMaps.prototype.getFromFusionTables = function(options) {
  var events = options.events;

  delete options.events;

  var fusion_tables_options = options,
      layer = new google.maps.FusionTablesLayer(fusion_tables_options);

  for (var ev in events) {
    if(events.hasOwnProperty(ev)) {
      google.maps.event.addListener(
        layer,
        ev,
        this.utils.subcribeEvent(events[ev], layer)
      );
    }
  }

  this.layers.push(layer);

  return layer;
};

GMaps.prototype.loadFromFusionTables = function(options) {
  var layer = this.getFromFusionTables(options);
  layer.setMap(this.map);

  return layer;
};

GMaps.prototype.getFromKML = function(options) {
  var url = options.url,
      events = options.events;

  var kml_options = options,
      layer = new google.maps.KmlLayer(url, kml_options);

  for (var ev in events) {
    if(events.hasOwnProperty(ev)) {
      google.maps.event.addListener(
        layer,
        ev,
        this.utils.subcribeEvent(events[ev], layer)
      );
    }
  }

  this.layers.push(layer);

  return layer;
};

GMaps.prototype.loadFromKML = function(options) {
  var layer = this.getFromKML(options);
  layer.setMap(this.map);

  return layer;
};

GMaps.prototype.addLayer = function(layerName, options) {
  //var default_layers = ['weather', 'clouds', 'traffic', 'transit', 'bicycling', 'panoramio', 'places'];
  options = options || {};
  var layer;

  switch(layerName) {
    case 'weather': this.singleLayers.weather = layer = new google.maps.weather.WeatherLayer();
      break;
    case 'clouds': this.singleLayers.clouds = layer = new google.maps.weather.CloudLayer();
      break;
    case 'traffic': this.singleLayers.traffic = layer = new google.maps.TrafficLayer();
      break;
    case 'transit': this.singleLayers.transit = layer = new google.maps.TransitLayer();
      break;
    case 'bicycling': this.singleLayers.bicycling = layer = new google.maps.BicyclingLayer();
      break;
    case 'panoramio':
        this.singleLayers.panoramio = layer = new google.maps.panoramio.PanoramioLayer();
        layer.setTag(options.filter);
        delete options.filter;

        //click event
        if (options.click) {
          google.maps.event.addListener(layer, 'click', function(event) {
            options.click(event);
            delete options.click;
          });
        }
      break;
      case 'places':
        this.singleLayers.places = layer = new google.maps.places.PlacesService(this.map);

        //search, nearbySearch, radarSearch callback, Both are the same
        if (options.search || options.nearbySearch || options.radarSearch) {
          var placeSearchRequest  = {
            bounds : options.bounds || null,
            keyword : options.keyword || null,
            location : options.location || null,
            name : options.name || null,
            radius : options.radius || null,
            rankBy : options.rankBy || null,
            types : options.types || null
          };

          if (options.radarSearch) {
            layer.radarSearch(placeSearchRequest, options.radarSearch);
          }

          if (options.search) {
            layer.search(placeSearchRequest, options.search);
          }

          if (options.nearbySearch) {
            layer.nearbySearch(placeSearchRequest, options.nearbySearch);
          }
        }

        //textSearch callback
        if (options.textSearch) {
          var textSearchRequest  = {
            bounds : options.bounds || null,
            location : options.location || null,
            query : options.query || null,
            radius : options.radius || null
          };

          layer.textSearch(textSearchRequest, options.textSearch);
        }
      break;
  }

  if (typeof layer !== 'undefined') {
    if (typeof layer.setOptions === 'function') {
      layer.setOptions(options);
    }
    if (typeof layer.setMap === 'function') {
      layer.setMap(this.map);
    }

    this.layers.push(layer);

    return layer;
  }
};


GMaps.prototype.removeLayer = function(layer) {
  var isStringLayer = (typeof layer === 'string' && this.singleLayers[layer] !== undefined);

  for (var i = 0, l = this.layers.length, curr; i < l; i++) {
    curr = this.layers[i];

    if(this.layers[i] === layer || isStringLayer && this.singleLayers[layer] === curr) {
      this._teardownChild('layer', this.layers[i]);

      if (isStringLayer) { delete this.singleLayers[layer]; }
      this.layers.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removeLayers = function() {
  for (var i = 0, l = this.layers.length; i < l; i++) {
    this._teardownChild('layer', this.layers[i]);
  }

  for(i in this.singleLayers) {
    if(this.singleLayers.hasOwnProperty(i)) {
      delete this.singleLayers[i];
    }
  }

  this.layers.length = 0;
};
