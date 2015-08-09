/* globals subcribeEvent: true */

GMaps.prototype.drawPolyline = function(options) {
  var path = [],
      points = options.path;

  if (points.length) {
    if (typeof points[0][0] === 'undefined') {
      path = points;
    }
    else {
      for (var i = 0, latlng; latlng = points[i]; i++) {
        path.push(new google.maps.LatLng(latlng[0], latlng[1]));
      }
    }
  }

  var polyline_options = {
    map: this.map,
    path: path,
    strokeColor: options.strokeColor,
    strokeOpacity: options.strokeOpacity,
    strokeWeight: options.strokeWeight,
    geodesic: options.geodesic,
    clickable: true,
    editable: false,
    visible: true
  };

  if (options.hasOwnProperty('clickable')) {
    polyline_options.clickable = options.clickable;
  }

  if (options.hasOwnProperty('editable')) {
    polyline_options.editable = options.editable;
  }

  if (options.hasOwnProperty('icons')) {
    polyline_options.icons = options.icons;
  }

  if (options.hasOwnProperty('zIndex')) {
    polyline_options.zIndex = options.zIndex;
  }

  var polyline = new google.maps.Polyline(polyline_options);

  var polylineEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

  for (var ev = 0, name; ev < polylineEvents.length; ev++) {
    name = polylineEvents[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        polyline, 
        name, 
        subcribeEvent(options[name], polyline)
      );
    }
  }

  this.polylines.push(polyline);

  GMaps.fire('polyline_added', polyline, this);

  return polyline;
};

GMaps.prototype.removePolyline = function(polyline) {
  for (var i = 0; i < this.polylines.length; i++) {
    if (this.polylines[i] === polyline) {
      this.polylines[i].setMap(null);
      this.polylines.splice(i, 1);

      GMaps.fire('polyline_removed', polyline, this);

      return true;
    }
  }
  return false;
};

GMaps.prototype.removePolylines = function() {
  var item;

  for (var i = 0, l = this.polylines.length; i < l; i++) {
    item = this.polylines[i];
    item.setMap(null);
  }

  this.polylines.length = 0;
};
