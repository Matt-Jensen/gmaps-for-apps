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

  for (var ev = 0, name; ev < polygonEvents.length; ev++) {
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
  for (var i = 0; i < this.polygons.length; i++) {
    if (this.polygons[i] === polygon) {
      this.polygons[i].setMap(null);
      this.polygons.splice(i, 1);

      GMaps.fire('polygon_removed', polygon, this);

      return true;
    }
  }

  return false;
};

GMaps.prototype.removePolygons = function() {
  var item;

  for (var i = 0, l = this.polygons.length; i < l; i++) {
    item = this.polygons[i];
    item.setMap(null);
  }

  this.polygons.length = 0;
};