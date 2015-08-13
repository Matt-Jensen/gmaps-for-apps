/* globals extend_object: true, subcribeEvent: true, array_flat: true, array_map: true, arrayToLatLng: true */

GMaps.prototype.drawPolygon = function(options) {
  var useGeoJSON = false;

  if(options.hasOwnProperty('useGeoJSON')) {
    useGeoJSON = options.useGeoJSON;
  }

  delete options.useGeoJSON;

  options = extend_object({
    map: this.map
  }, options);

  if (useGeoJSON === false) {
    options.paths = [options.paths.slice(0)];
  }

  if (options.paths.length > 0) {
    if (options.paths[0] && options.paths[0].length > 0) {
      options.paths = array_flat(array_map(options.paths, arrayToLatLng, useGeoJSON));
    }
  }

  var polygon = new google.maps.Polygon(options),
      polygonEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

  for (var ev = 0, l = polygonEvents.length, name; ev < l; ev++) {
    name = polygonEvents[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        polygon,
        name,
        subcribeEvent(options[name], polygon)
      );
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
