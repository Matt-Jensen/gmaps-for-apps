GMaps.prototype.drawPolyline = function(options) {
  var path = [],
      points = options.path;

  var i, l, latlng, name;

  if (points.length) {
    if (typeof points[0][0] === 'undefined') {
      path = points;
    }
    else {
      for (i = 0, l = points.length; i < l; i++) {
        latlng = points[i];
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

  for (i = 0, l = polylineEvents.length; i < l; i++) {
    name = polylineEvents[i];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        polyline,
        name,
        this.utils.subcribeEvent(options[name], polyline)
      );
    }
  }

  this.polylines.push(polyline);

  GMaps.fire('polyline_added', polyline, this);

  return polyline;
};


GMaps.prototype.removePolyline = function(polyline) {
  for (var i = 0, l = this.polylines.length; i < l; i++) {
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
  for (var i = 0, l = this.polylines.length; i < l; i++) {
    this.polylines[i].setMap(null);
  }

  this.polylines.length = 0;
};
