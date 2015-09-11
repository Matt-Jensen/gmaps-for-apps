GMaps.prototype.drawPolygon = function() {
  var args = Array.prototype.slice.call(arguments);
  return this.addPolygon.apply(this, args);
};

GMaps.prototype.addPolygon = function(options) {
  var useGeoJSON = false;
  var self = this;

  if(options.hasOwnProperty('useGeoJSON')) {
    useGeoJSON = options.useGeoJSON;
  }

  delete options.useGeoJSON;

  options = this.utils.merge({
    map: this.map
  }, options);

  if (useGeoJSON === false) {
    options.paths = [options.paths.slice(0)];
  }

  if (options.paths.length > 0) {
    if (options.paths[0] && options.paths[0].length > 0) {
      options.paths = this.utils.arrayFlat(
        this.utils.arrayMap(
          options.paths,
          function(p) { return self.utils.arrayToLatLng(p, useGeoJSON); }
        )
      );
    }
  }

  var polygon = new google.maps.Polygon(options);
  var polygonEvents = [
    'click',
    'rightclick',
    'dblclick',
    'drag',
    'dragend',
    'dragstart',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup'
  ];

  for (var ev = 0, l = polygonEvents.length, name; ev < l; ev++) {
    name = polygonEvents[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        polygon,
        name,
        this.utils.subcribeEvent(options[name], polygon)
      );
    }
  }

  //////////////////////
  // Editable Events //
  ////////////////////

  polygon.delegatedEvents = [];

  var polygonEditableEvents = [
    'set_at',
    'insert_at',
    'remove_at'
  ];

  // Set editable events to polygon's path
  for (ev = 0, l = polygonEditableEvents.length, name; ev < l; ev++) {
    name = polygonEditableEvents[ev];
    if (options.hasOwnProperty(name)) {
      polygon.delegatedEvents.push(google.maps.event.addListener(
        polygon.getPath(),
        name,
        this.utils.subcribeEvent(options[name], polygon.getPath())
      ));
    }
  }

  this.polygons.push(polygon);

  GMaps.fire('polygon_added', polygon, this);

  return polygon;
};


GMaps.prototype.removePolygon = function(polygon) {
  for (var i = 0, l = this.polygons.length; i < l; i++) {
    if (this.polygons[i] === polygon) {
      this._teardownChild('polygon', this.polygons[i]);
      this.polygons.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removePolygons = function() {
  for (var i = 0, l = this.polygons.length; i < l; i++) {
    this._teardownChild('polygon', this.polygons[i]);
  }

  this.polygons.length = 0;
};
