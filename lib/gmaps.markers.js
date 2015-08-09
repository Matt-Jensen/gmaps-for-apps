/* globals extend_object: true, subcribeEvent: true */

GMaps.prototype.createMarker = function(options) {
  if (typeof options.lat === 'undefined' && typeof options.lng === 'undefined' && options.position === 'undefined') {
    throw 'No latitude or longitude defined.';
  }

  var self = this,
      details = options.details,
      fences = options.fences,
      outside = options.outside,
      base_options = {
        position: new google.maps.LatLng(options.lat, options.lng),
        map: null
      },
      marker_options = extend_object(base_options, options);

  delete marker_options.lat;
  delete marker_options.lng;
  delete marker_options.fences;
  delete marker_options.outside;

  var marker = new google.maps.Marker(marker_options);
  var ev, name;

  marker.fences = fences;

  if (options.infoWindow) {
    marker.infoWindow = new google.maps.InfoWindow(options.infoWindow);

    var info_window_events = ['closeclick', 'content_changed', 'domready', 'position_changed', 'zindex_changed'];

    for (ev = 0; ev < info_window_events.length; ev++) {
      name = info_window_events[ev];
      if (options.infoWindow.hasOwnProperty(name)) {
        google.maps.event.addListener(
          marker.infoWindow,
          name,
          subcribeEvent(options.infoWindow[name], marker.infoWindow)
        );
      }
    }
  }

  var marker_events = ['animation_changed', 'clickable_changed', 'cursor_changed', 'draggable_changed', 'flat_changed', 'icon_changed', 'position_changed', 'shadow_changed', 'shape_changed', 'title_changed', 'visible_changed', 'zindex_changed'];

  var marker_events_with_mouse = ['dblclick', 'drag', 'dragend', 'dragstart', 'mousedown', 'mouseout', 'mouseover', 'mouseup'];

  for (ev = 0; ev < marker_events.length; ev++) {
    name = marker_events[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        marker,
        name,
        subcribeEvent(marker[name], marker)
      );
    }
  }

  function subscribeMouseEvent(callback, obj, map) {
    return function(me) {
      if(!me.pixel){
        me.pixel = map.getProjection().fromLatLngToPoint(me.latLng)
      }

      callback(me, this);
    };
  }

  for (ev = 0; ev < marker_events_with_mouse.length; ev++) {
    name = marker_events_with_mouse[ev];
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

    if (typeof window.context_menu[self.el.id]['marker'] !== undefined) {
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
      throw 'No latitude or longitude defined.';
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

GMaps.prototype.addMarkers = function(array) {
  for (var i = 0, marker; marker=array[i]; i++) {
    this.addMarker(marker);
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
  for (var i = 0; i < this.markers.length; i++) {
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
  var i, marker;

  if (typeof collection === 'undefined') {
    for (i = 0; i < this.markers.length; i++) {
      marker = this.markers[i];
      marker.setMap(null);

      if(this.markerClusterer) {
        this.markerClusterer.removeMarker(marker);
      }

      GMaps.fire('marker_removed', marker, this);
    }
    
    this.markers = new_markers;
  }
  else {
    for (i = 0; i < collection.length; i++) {
      var index = this.markers.indexOf(collection[i]);

      if (index > -1) {
        marker = this.markers[index];
        marker.setMap(null);

        if(this.markerClusterer) {
          this.markerClusterer.removeMarker(marker);
        }

        GMaps.fire('marker_removed', marker, this);
      }
    }

    for (i = 0; i < this.markers.length; i++) {
      marker = this.markers[i];
      if (marker.getMap() !== null) {
        new_markers.push(marker);
      }
    }

    this.markers = new_markers;
  }
};
