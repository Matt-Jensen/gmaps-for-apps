GMaps.prototype.createMarker = function(options) {
  if (typeof options.lat === 'undefined' && typeof options.lng === 'undefined' && options.position === 'undefined') {
    throw new Error('No latitude or longitude defined.');
  }

  var self = this;
  var details = options.details;
  var fences = options.fences;
  var outside = options.outside;
  var baseOptions = {
    position: new google.maps.LatLng(options.lat, options.lng),
    map: null
  };
  var markerOptions = this.utils.merge(baseOptions, options);
  var marker = new google.maps.Marker(markerOptions);
  var ev, l, name;

  marker.fences = fences;

  if (options.infoWindow) {
    marker.infoWindow = new google.maps.InfoWindow(options.infoWindow);

    var infoWindowEvents = [
      'closeclick',
      'content_changed',
      'domready',
      'position_changed',
      'zindex_changed'
    ];

    for (ev = 0, l = infoWindowEvents.length; ev < l; ev++) {
      name = infoWindowEvents[ev];
      if (options.infoWindow.hasOwnProperty(name)) {
        google.maps.event.addListener(
          marker.infoWindow,
          name,
          this.utils.subcribeEvent(options.infoWindow[name], marker.infoWindow)
        );
      }
    }
  }

  var markerEvents = [
    'animation_changed',
    'clickable_changed',
    'cursor_changed',
    'draggable_changed',
    'flat_changed',
    'icon_changed',
    'position_changed',
    'shadow_changed',
    'shape_changed',
    'title_changed',
    'visible_changed',
    'zindex_changed'
  ];

  var markerEventsWithMouse = [
    'dblclick',
    'drag',
    'dragend',
    'dragstart',
    'mousedown',
    'mouseout',
    'mouseover',
    'mousemove',
    'mouseup'
  ];

  for (ev = 0, l = markerEvents.length; ev < l; ev++) {
    name = markerEvents[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        marker,
        name,
        this.utils.subcribeEvent(marker[name], marker)
      );
    }
  }

  function subscribeMouseEvent(callback, obj, map) {
    return function(me) {
      if(!me.pixel){
        me.pixel = map.getProjection();
        if(me.pixel) {
          me.pixel = (
            me.latLng &&
            me.pixel.fromLatLngToPoint &&
            me.pixel.fromLatLngToPoint(me.latLng)
          );
        }
      }

      callback(me, this);
    };
  }

  for (ev = 0; ev < markerEventsWithMouse.length; ev++) {
    name = markerEventsWithMouse[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(marker, name, subscribeMouseEvent(options[name], marker, this.map));
    }
  }

  google.maps.event.addListener(marker, 'click', function() {
    this.details = details;

    if (options.click) {
      options.click.apply(this, [this]);
    }

    if (marker.infoWindow) {
      self.hideInfoWindows();
      marker.infoWindow.open(self.map, marker);
    }
  });

  google.maps.event.addListener(marker, 'rightclick', function(e) {
    e.marker = this;

    if (options.rightclick) {
      options.rightclick.apply(this, [e]);
    }

    if (typeof window.contextMenu[self.el.id]['marker'] !== undefined) {
      self.buildContextMenu('marker', e);
    }
  });

  if (marker.fences) {
    google.maps.event.addListener(marker, 'dragend', function() {
      self.checkMarkerGeofence(marker, function(m, f) {
        outside(m, f);
      });
    });
  }

  return marker;
};

GMaps.prototype.addMarker = function(options) {
  var marker;
  if(options.hasOwnProperty('gm_accessors_')) {
    // Native google.maps.Marker object
    marker = options;
  }
  else {
    if ((options.hasOwnProperty('lat') && options.hasOwnProperty('lng')) || options.position) {
      marker = this.createMarker(options);
    }
    else {
      throw new Error('No latitude or longitude defined.');
    }
  }

  marker.setMap(this.map);

  if(this.markerClusterer) {
    this.markerClusterer.addMarker(marker);
  }

  this.markers.push(marker);

  GMaps.fire('marker_added', marker, this);

  return marker;
};

GMaps.prototype.addMarkers = function(arrayOfMarkers) {
  for (var i = 0, l = arrayOfMarkers.length; i < l; i++) {
    this.addMarker(arrayOfMarkers[i]);
  }

  return this.markers;
};

GMaps.prototype.hideInfoWindows = function() {
  for (var i = 0, marker; marker = this.markers[i]; i++){
    if (marker.infoWindow) {
      marker.infoWindow.close();
    }
  }
};

GMaps.prototype.removeMarker = function(marker) {
  for (var i = 0, l = this.markers.length; i < l; i++) {
    if (this.markers[i] === marker) {
      this.markers[i].setMap(null);
      this.markers.splice(i, 1);

      if(this.markerClusterer) {
        this.markerClusterer.removeMarker(marker);
      }

      GMaps.fire('marker_removed', marker, this);

      break;
    }
  }

  return marker;
};

GMaps.prototype.removeMarkers = function (collection) {
  var new_markers = [];
  var i, l, marker, index;

  if (typeof collection === 'undefined') {
    for (i = 0, l = this.markers.length; i < l; i++) {
      marker = this.markers[i];
      marker.setMap(null);
      google.maps.event.clearInstanceListeners(marker);

      if(this.markerClusterer) {
        this.markerClusterer.removeMarker(marker);
      }

      GMaps.fire('marker_removed', marker, this);
    }
  }
  else {
    for (i = 0, l = collection.length; i < l; i++) {
      index = this.markers.indexOf(collection[i]);

      if (index > -1) {
        marker = this.markers[index];
        marker.setMap(null);
        google.maps.event.clearInstanceListeners(marker);

        if(this.markerClusterer) {
          this.markerClusterer.removeMarker(marker);
        }

        GMaps.fire('marker_removed', marker, this);
      }
    }

    for (i = 0, l = this.markers.length; i < l; i++) {
      marker = this.markers[i];
      if (marker.getMap() !== null) {
        new_markers.push(marker);
      }
    }
  }

  return this.markers = new_markers;
};
