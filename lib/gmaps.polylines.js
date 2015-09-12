GMaps.prototype.drawPolyline = function() {
  var args = Array.prototype.slice.call(arguments);
  this.addPolyline.apply(this, args);
};

GMaps.prototype.addPolyline = function(options) {
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

  var polylineOptions = {
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
    polylineOptions.clickable = options.clickable;
  }

  if (options.hasOwnProperty('editable')) {
    polylineOptions.editable = options.editable;
  }

  if (options.hasOwnProperty('icons')) {
    polylineOptions.icons = options.icons;
  }

  if (options.hasOwnProperty('zIndex')) {
    polylineOptions.zIndex = options.zIndex;
  }

  var polyline = new google.maps.Polyline(polylineOptions);
  this.utils.merge(polyline, options);

  var polylineEvents = [
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

  //////////////////////
  // Editable Events //
  ////////////////////

  polyline.delegatedEvents = [];

  var polylineEditableEvents = [
    'set_at',
    'insert_at',
    'remove_at'
  ];

  // Set editable events to polyline's path
  for (i = 0, l = polylineEditableEvents.length, name; i < l; i++) {
    name = polylineEditableEvents[i];
    if (options.hasOwnProperty(name)) {
      polyline.delegatedEvents.push(google.maps.event.addListener(
        polyline.getPath(),
        name,
        this.utils.subcribeEvent(options[name], polyline.getPath())
      ));
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
