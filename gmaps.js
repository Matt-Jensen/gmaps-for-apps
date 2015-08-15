"use strict";
(function(root, factory) {
  if(typeof exports === 'object') {
    module.exports = factory();
  }
  else if(typeof define === 'function' && define.amd) {
    define(['jquery', 'googlemaps!'], factory);
  }
  else {
    root.GMaps = factory();
  }


}(this, function() {

/*!
 * GMaps.js v0.4.18
 * http://hpneo.github.com/gmaps/
 *
 * Copyright 2015, Matt Jensen
 * Released under the MIT License.
 */

/*jshint unused:false*/

if (!(typeof window.google === 'object' && window.google.maps)) {
  throw 'Google Maps API is required. Please register the following JavaScript library http://maps.google.com/maps/api/js?sensor=true.'
}

var extend_object = function(obj, new_obj) {
  var name;

  for (name in new_obj) {
    if(new_obj.hasOwnProperty(name)) {
      obj[name] = new_obj[name];
    }
  }

  return obj;
};

var replace_object = function(obj, replace) {
  var name;

  if (obj === replace) {
    return obj;
  }

  for (name in replace) {
    if (obj.hasOwnProperty(name)) {
      obj[name] = replace[name];
    }
  }

  return obj;
};

var array_map = function(array, callback) {
  var original_callback_params = Array.prototype.slice.call(arguments, 2),
      array_return = [],
      array_length = array.length,
      i,
      callback_params;

  if (Array.prototype.map && array.map === Array.prototype.map) {
    array_return = Array.prototype.map.call(array, function(item) {
      callback_params = original_callback_params.slice(0);
      callback_params.splice(0, 0, item);

      return callback.apply(this, callback_params);
    });
  }
  else {
    for (i = 0; i < array_length; i++) {
      callback_params = original_callback_params;
      callback_params.splice(0, 0, array[i]);
      array_return.push(callback.apply(this, callback_params));
    }
  }

  return array_return;
};

var array_flat = function(array) {
  var new_array = [];
  var i, l;

  for (i = 0, l = array.length; i < l; i++) {
    new_array = new_array.concat(array[i]);
  }

  return new_array;
};

var coordsToLatLngs = function(coords, useGeoJSON) {
  var first_coord = coords[0],
      second_coord = coords[1];

  if (useGeoJSON) {
    first_coord = coords[1];
    second_coord = coords[0];
  }

  return new google.maps.LatLng(first_coord, second_coord);
};

var arrayToLatLng = function(coords, useGeoJSON) {
  for (var i = 0, l = coords.length; i < l; i++) {
    if (!(coords[i] instanceof google.maps.LatLng)) {
      if (coords[i].length > 0 && typeof(coords[i][0]) === 'object') {
        coords[i] = arrayToLatLng(coords[i], useGeoJSON);
      }
      else {
        coords[i] = coordsToLatLngs(coords[i], useGeoJSON);
      }
    }
  }

  return coords;
};


var getElementsByClassName = function (class_name, context) {
    var element,
        _class = class_name.replace('.', '');

    if ('jQuery' in this && context) {
        element = $('.' + _class, context)[0];
    } else {
        element = document.getElementsByClassName(_class)[0];
    }
    return element;
};

var getElementById = function(id, context) {
  var element;
  id = id.replace('#', '');

  if ('jQuery' in window && context) {
    element = $('#' + id, context)[0];
  } else {
    element = document.getElementById(id);
  }

  return element;
};

var findAbsolutePosition = function(obj)  {
  var curleft = 0,
      curtop = 0;

  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
  }

  return [curleft, curtop];
};

var subcribeEvent = function(callback, obj) {
  return function(e) {
    return callback(e, (obj || this));
  };
};

var GMaps = (function() {
  'use strict';

  var doc = document;

  var GMaps = function(options) {
    if (!this) { return new GMaps(options); }

    options.zoom = options.zoom || 15;
    options.mapType = options.mapType || 'roadmap';

    var valueOrDefault = function(value, defaultValue) {
      return value === undefined ? defaultValue : value;
    };

    var self = this,
        i,
        events_that_hide_context_menu = [
          'bounds_changed', 'center_changed', 'click', 'dblclick', 'drag',
          'dragend', 'dragstart', 'idle', 'maptypeid_changed', 'projection_changed',
          'resize', 'tilesloaded', 'zoom_changed'
        ],
        events_that_doesnt_hide_context_menu = ['mousemove', 'mouseout', 'mouseover'],
        options_to_be_deleted = ['el', 'lat', 'lng', 'mapType', 'width', 'height', 'markerClusterer', 'enableNewStyle'],
        identifier = options.el || options.div,
        markerClustererFunction = options.markerClusterer,
        mapType = google.maps.MapTypeId[options.mapType.toUpperCase()],
        map_center = new google.maps.LatLng(options.lat, options.lng),
        zoomControl = valueOrDefault(options.zoomControl, true),
        zoomControlOpt = options.zoomControlOpt || {
          style: 'DEFAULT',
          position: 'TOP_LEFT'
        },
        zoomControlStyle = zoomControlOpt.style || 'DEFAULT',
        zoomControlPosition = zoomControlOpt.position || 'TOP_LEFT',
        panControl = valueOrDefault(options.panControl, true),
        mapTypeControl = valueOrDefault(options.mapTypeControl, true),
        scaleControl = valueOrDefault(options.scaleControl, true),
        streetViewControl = valueOrDefault(options.streetViewControl, true),
        overviewMapControl = valueOrDefault(overviewMapControl, true),
        map_options = {},
        map_base_options = {
          zoom: this.zoom,
          center: map_center,
          mapTypeId: mapType
        },
        map_controls_options = {
          panControl: panControl,
          zoomControl: zoomControl,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle[zoomControlStyle],
            position: google.maps.ControlPosition[zoomControlPosition]
          },
          mapTypeControl: mapTypeControl,
          scaleControl: scaleControl,
          streetViewControl: streetViewControl,
          overviewMapControl: overviewMapControl
        };

      if (typeof(options.el) === 'string' || typeof(options.div) === 'string') {

          if (identifier.indexOf('#') > -1) {
              this.el = getElementById(identifier, options.context);
          } else {
              this.el = getElementsByClassName.apply(this, [identifier, options.context]);
          }

      } else {
          this.el = identifier;
      }

    if (typeof(this.el) === 'undefined' || this.el === null) {
      throw 'No element defined.';
    }

    window.context_menu = window.context_menu || {};
    window.context_menu[self.el.id] = {};

    this.controls = [];
    this.overlays = [];
    this.texts = [];
    this.polygons = [];
    this.polylines = [];
    this.circles = [];
    this.rectangles = [];
    this.infoWindows = [];
    this.layers = []; // array with kml/georss and fusiontables layers, can be as many
    this.singleLayers = {}; // object with the other layers, only one per layer
    this.markers = [];
    this.routes = [];
    this.infoWindow = null;
    this.overlay_el = null;
    this.zoom = options.zoom;
    this.registered_events = {};

    this.el.style.width = options.width || this.el.scrollWidth || this.el.offsetWidth;
    this.el.style.height = options.height || this.el.scrollHeight || this.el.offsetHeight;

    google.maps.visualRefresh = options.enableNewStyle;

    for (i = 0; i < options_to_be_deleted.length; i++) {
      delete options[options_to_be_deleted[i]];
    }

    if(options.disableDefaultUI !== true) {
      map_base_options = extend_object(map_base_options, map_controls_options);
    }

    map_options = extend_object(map_base_options, options);

    for (i = 0; i < events_that_hide_context_menu.length; i++) {
      delete map_options[events_that_hide_context_menu[i]];
    }

    for (i = 0; i < events_that_doesnt_hide_context_menu.length; i++) {
      delete map_options[events_that_doesnt_hide_context_menu[i]];
    }

    this.map = new google.maps.Map(this.el, map_options);

    if (markerClustererFunction) {
      this.markerClusterer = markerClustererFunction.apply(this, [this.map]);
    }

    var buildContextMenuHTML = function(control, e) {
      var html = '',
          options = window.context_menu[self.el.id][control];

      for (var i in options){
        if (options.hasOwnProperty(i)) {
          var option = options[i];

          html += '<li><a id="' + control + '_' + i + '" href="#">' + option.title + '</a></li>';
        }
      }

      if (!getElementById('gmaps_context_menu')) { return; }

      var context_menu_element = getElementById('gmaps_context_menu');
      
      context_menu_element.innerHTML = html;

      var context_menu_items = context_menu_element.getElementsByTagName('a'),
          context_menu_items_count = context_menu_items.length;

      var assignMenuItemAction = function(ev){
        ev.preventDefault();

        options[this.id.replace(control + '_', '')].action.apply(self, [e]);
        self.hideContextMenu();
      };

      for (i = 0; i < context_menu_items_count; i++) {
        var context_menu_item = context_menu_items[i];
        google.maps.event.clearListeners(context_menu_item, 'click');
        google.maps.event.addDomListenerOnce(
          context_menu_item,
          'click',
          assignMenuItemAction,
          false
        );
      }

      var position = findAbsolutePosition.apply(this, [self.el]),
          left = position[0] + e.pixel.x - 15,
          top = position[1] + e.pixel.y- 15;

      context_menu_element.style.left = left + 'px';
      context_menu_element.style.top = top + 'px';

      context_menu_element.style.display = 'block';
    };

    this.buildContextMenu = function(control, e) {
      if (control === 'marker') {
        e.pixel = {};

        var overlay = new google.maps.OverlayView();
        overlay.setMap(self.map);
        
        overlay.draw = function() {
          var projection = overlay.getProjection(),
              position = e.marker.getPosition();
          
          e.pixel = projection.fromLatLngToContainerPixel(position);

          buildContextMenuHTML(control, e);
        };
      }
      else {
        buildContextMenuHTML(control, e);
      }
    };

    this.setContextMenu = function(options) {
      window.context_menu[self.el.id][options.control] = {};

      var i,
          ul = doc.createElement('ul');

      for (i in options.options) {
        if (options.options.hasOwnProperty(i)) {
          var option = options.options[i];

          window.context_menu[self.el.id][options.control][option.name] = {
            title: option.title,
            action: option.action
          };
        }
      }

      ul.id = 'gmaps_context_menu';
      ul.style.display = 'none';
      ul.style.position = 'absolute';
      ul.style.minWidth = '100px';
      ul.style.background = 'white';
      ul.style.listStyle = 'none';
      ul.style.padding = '8px';
      ul.style.boxShadow = '2px 2px 6px #ccc';

      doc.body.appendChild(ul);

      var context_menu_element = getElementById('gmaps_context_menu')

      google.maps.event.addDomListener(context_menu_element, 'mouseout', function(ev) {
        if (!ev.relatedTarget || !this.contains(ev.relatedTarget)) {
          window.setTimeout(function(){
            context_menu_element.style.display = 'none';
          }, 400);
        }
      }, false);
    };

    this.hideContextMenu = function() {
      var context_menu_element = getElementById('gmaps_context_menu');

      if (context_menu_element) {
        context_menu_element.style.display = 'none';
      }
    };

    var setupListener = function(object, name) {
      google.maps.event.addListener(object, name, function(e){
        if (typeof e === 'undefined') {
          e = this;
        }

        options[name].apply(this, [e]);

        self.hideContextMenu();
      });
    };

    //google.maps.event.addListener(this.map, 'idle', this.hideContextMenu);
    google.maps.event.addListener(this.map, 'zoom_changed', this.hideContextMenu);

    var ev, name;

    for (ev = 0; ev < events_that_hide_context_menu.length; ev++) {
      name = events_that_hide_context_menu[ev];

      if (name in options) {
        setupListener(this.map, name);
      }
    }

    for (ev = 0; ev < events_that_doesnt_hide_context_menu.length; ev++) {
      name = events_that_doesnt_hide_context_menu[ev];

      if (name in options) {
        setupListener(this.map, name);
      }
    }

    google.maps.event.addListener(this.map, 'rightclick', function(e) {
      if (options.rightclick) {
        options.rightclick.apply(this, [e]);
      }

      if(typeof window.context_menu[self.el.id]['map'] !== 'undefined') {
        self.buildContextMenu('map', e);
      }
    });

    this.refresh = function() {
      google.maps.event.trigger(this.map, 'resize');
    };

    this.fitZoom = function() {
      var latLngs = [],
          markers_length = this.markers.length,
          i;

      for (i = 0; i < markers_length; i++) {
        if(typeof this.markers[i].visible === 'boolean' && this.markers[i].visible) {
          latLngs.push(this.markers[i].getPosition());
        }
      }

      this.fitLatLngBounds(latLngs);
    };

    this.fitLatLngBounds = function(latLngs) {
      var total = latLngs.length,
          bounds = new google.maps.LatLngBounds(),
          i;

      for(i = 0; i < total; i++) {
        bounds.extend(latLngs[i]);
      }

      this.map.fitBounds(bounds);
    };

    this.setCenter = function(lat, lng, callback) {
      this.map.panTo(new google.maps.LatLng(lat, lng));

      if (callback) {
        callback();
      }
    };

    this.getElement = function() {
      return this.el;
    };

    this.zoomIn = function(value) {
      value = value || 1;

      this.zoom = this.map.getZoom() + value;
      this.map.setZoom(this.zoom);
    };

    this.zoomOut = function(value) {
      value = value || 1;

      this.zoom = this.map.getZoom() - value;
      this.map.setZoom(this.zoom);
    };

    var native_methods = [],
        method;

    for (method in this.map) {
      if (typeof this.map[method] === 'function' && !this[method]) {
        native_methods.push(method);
      }
    }

    function createNativeMethod(gmaps, scope, method_name) {
      gmaps[method_name] = function() {
        return scope[method_name].apply(scope, arguments);
      };
    }

    for (i = 0; i < native_methods.length; i++) {
      createNativeMethod(this, this.map, native_methods[i]);
    }
  };

  return GMaps;
})();

/* globals subcribeEvent: true */

GMaps.prototype.createControl = function(options) {
  var control = document.createElement('div');

  control.style.cursor = 'pointer';
  
  if (options.disableDefaultStyles !== true) {
    control.style.fontFamily = 'Roboto, Arial, sans-serif';
    control.style.fontSize = '11px';
    control.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
  }

  for (var option in options.style) {
    if(options.style.hasOwnProperty(option)) {
      control.style[option] = options.style[option];
    }
  }

  if (options.id) {
    control.id = options.id;
  }
  
  if (options.title) {
    control.title = options.title;
  }

  if (options.classes) {
    control.className = options.classes;
  }

  if (options.content) {
    if (typeof options.content === 'string') {
      control.innerHTML = options.content;
    }
    else if (options.content instanceof HTMLElement) {
      control.appendChild(options.content);
    }
  }

  if (options.position) {
    control.position = google.maps.ControlPosition[options.position.toUpperCase()];
  }

  for (var ev in options.events) {
    if(options.events.hasOwnProperty(ev)) {
      google.maps.event.addDomListener(
        control,
        ev,
        subcribeEvent(options.events[ev])
      );
    }
  }

  control.index = 1;

  return control;
};

GMaps.prototype.addControl = function(options) {
  var control = this.createControl(options);
  
  this.controls.push(control);
  this.map.controls[control.position].push(control);

  return control;
};

GMaps.prototype.removeControl = function(control) {
  var position = null;
  var controlsForPosition;
  var i, l;

  for (i = 0, l = this.controls.length; i < l; i++) {
    if (this.controls[i] === control) {
      position = this.controls[i].position;
      this.controls.splice(i, 1);
      break;
    }
  }

  if (position) {
    for (i = 0, l = this.map.controls.length; i < l; i++) {
      controlsForPosition = this.map.controls[control.position];

      if (controlsForPosition.getAt(i) === control) {
        controlsForPosition.removeAt(i);
        break;
      }
    }
  }

  return control;
};

/* globals extend_object: true, subcribeEvent: true */

GMaps.prototype.drawCircle = function(options) {
  options = extend_object({
    map: this.map,
    center: new google.maps.LatLng(options.lat, options.lng)
  }, options);

  var circle = new google.maps.Circle(options);
  var circleEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

  for (var i = 0, l = circleEvents.length, name; i < l; i++) {
    name = circleEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        circle,
        name,
        subcribeEvent(options[name], circle)
      );
    }
  }

  this.circles.push(circle);

  return circle;
};


GMaps.prototype.removeCircle = function(circle) {
  for (var i = 0, l = this.circles.length; i < l; i++) {
    if (this.circles[i] === circle) {
      this._teardownChild('circle', this.circles[i]);
      this.circles.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removeCircles = function() {
  for (var i = 0, l = this.circles.length; i < l; i++) {
    this._teardownChild('circle', this.circles[i]);
  }

  this.circles.length = 0;
};

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

/* globals extend_object: true, subcribeEvent: true */

GMaps.prototype.drawRectangle = function(options) {
  options = extend_object({
    map: this.map
  }, options);

  var latLngBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(options.bounds[0][0], options.bounds[0][1]),
    new google.maps.LatLng(options.bounds[1][0], options.bounds[1][1])
  );

  options.bounds = latLngBounds;

  var rectangle = new google.maps.Rectangle(options),
      rectangle_events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

  for (var ev = 0, l = rectangle_events.length, name; ev < l; ev++) {
    name = rectangle_events[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        rectangle,
        name,
        subcribeEvent(options[name], rectangle)
      );
    }
  }

  this.rectangles.push(rectangle);

  GMaps.fire('rectangle_added', rectangle, this);

  return rectangle;
};


GMaps.prototype.removeRectangle = function(rectangle) {
  for (var i = 0, l = this.rectangles.length; i < l; i++) {
    if (this.rectangles[i] === rectangle) {
      this._teardownChild('rectangle', this.rectangles[i]);
      this.rectangles.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removeRectangles = function() {
  for (var i = 0, l = this.rectangles.length; i < l; i++) {
    this._teardownChild('rectangle', this.rectangles[i]);
  }

  this.rectangles.length = 0;
};

/* globals subcribeEvent: true */

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
        subcribeEvent(options[name], polyline)
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

/* globals extend_object: true, subcribeEvent: true */

GMaps.prototype.addInfoWindow = function(options) {
  options = extend_object({
    map: this.map,
    position: new google.maps.LatLng(options.lat, options.lng)
  }, options);

  var infoWindowSelector = '__gmaps-info-window-'+ this.uuid() +'__';
  options.content = options.content || '';
  options.content = [
    '<div id="',
    infoWindowSelector,
    '">',
    options.content,
    '</div>'
  ].join('');

  var infoWindow = new google.maps.InfoWindow(options);
  infoWindow._map = this.map;
  infoWindow._id = infoWindowSelector;
  infoWindow.delegatedEvents = [];
  var mouseEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

  var i, l, name, removeDelegatedEvent;

  for (i = 0, l = mouseEvents.length, name; i < l; i++) {
    name = mouseEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {

      // delegate event to the info-window's content wrapper div
      removeDelegatedEvent = this.addDelegatedEvent(
        name,
        '#'+infoWindowSelector,
        subcribeEvent(options[name], infoWindow)
      );
      infoWindow.delegatedEvents.push(removeDelegatedEvent);
    }
  }

  // Add default events
  var classEvents = ['closeclick', 'content_changed', 'domready', 'position_changed', 'zindex_changed'];

  for(i = 0, l = classEvents.length, name; i < l; i++) {
    name = classEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        infoWindow,
        name,
        subcribeEvent(options[name], infoWindow)
      );
    }
  }

  infoWindow.visible = (options.hasOwnProperty('visible') ? options.visible : true);

  if(!infoWindow.visible) {
    infoWindow.close();
  }

  infoWindow.show = function() {
    this.open(this._map);
    this.visible = true;
  };

  infoWindow.hide = function() {
    this.close();
    this.visible = false;
  };

  this.infoWindows.push(infoWindow);

  return infoWindow;
};


GMaps.prototype.removeInfoWindow = function(infoWindow) {
  for (var i = 0, l = this.infoWindows.length; i < l; i++) {
    if (this.infoWindows[i] === infoWindow) {
      this._teardownChild('info_window', this.infoWindows[i]);
      this.infoWindows.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removeInfoWindows = function() {
  for (var i = 0, l = this.infoWindows.length; i < l; i++) {
    try { this._teardownChild('info_window', this.infoWindows[i]); } catch(e) {} // for jasmine
  }

  this.infoWindows.length = 0;
};

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

  var marker = new google.maps.Marker(marker_options);
  var ev, l, name;

  marker.fences = fences;

  if (options.infoWindow) {
    marker.infoWindow = new google.maps.InfoWindow(options.infoWindow);

    var info_window_events = ['closeclick', 'content_changed', 'domready', 'position_changed', 'zindex_changed'];

    for (ev = 0, l = info_window_events.length; ev < l; ev++) {
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

  for (ev = 0, l = marker_events.length; ev < l; ev++) {
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
        me.pixel = map.getProjection();
        me.pixel = (me.pixel &&
          me.pixel.fromLatLngToPoint &&
          me.pixel.fromLatLngToPoint(me.latLng)
        );
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

/* globals subcribeEvent: true */

GMaps.prototype.drawOverlay = function(options) {
  var overlay = new google.maps.OverlayView(),
      visible = true;

  overlay.setMap(this.map);

  if (options.hasOwnProperty('visible')) {
    visible = options.visible;
  }

  overlay.onAdd = function() {
    var el = document.createElement('div');

    el.style.borderStyle = 'none';
    el.style.borderWidth = '0px';
    el.style.position = 'absolute';
    el.style.zIndex = 100;
    el.innerHTML = options.content;

    overlay.el = el;

    if (!options.layer) {
      options.layer = 'overlayLayer';
    }
    
    var panes = this.getPanes(),
        overlayLayer = panes[options.layer],
        stopOverlayEvents = ['contextmenu', 'DOMMouseScroll', 'dblclick', 'mousedown'];

    overlayLayer.appendChild(el);

    function preventOverlayEvents() {
      return function(e) {
        if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1 && document.all) {
          e.cancelBubble = true;
          e.returnValue = false;
        }
        else {
          e.stopPropagation();
        }
      };
    }

    var name;
    for (var ev = 0, l = stopOverlayEvents.length; ev < l; ev++) {
      name = stopOverlayEvents[ev];
      google.maps.event.addDomListener(el, name, preventOverlayEvents());
    }

    var overlayEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];


    // If there are any mouse events append the mouse target element
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if (options.hasOwnProperty(name)) {
        panes.overlayMouseTarget.appendChild(overlay.el);
        break;
      }
    }

    // Subscribe all configured mouse events
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if(options.hasOwnProperty(name)) {
        google.maps.event.addDomListener(
          overlay.el,
          name,
          subcribeEvent(options[name], overlay)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlay.draw = function() {
    var projection = this.getProjection(),
        pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));

    options.horizontalOffset = options.horizontalOffset || 0;
    options.verticalOffset = options.verticalOffset || 0;

    var el = overlay.el,
        content = el.children[0],
        contentHeight = content.clientHeight,
        contentWidth = content.clientWidth;

    switch (options.verticalAlign) {
      case 'top':
        el.style.top = (pixel.y - contentHeight + options.verticalOffset) + 'px';
        break;
      default:
      case 'middle':
        el.style.top = (pixel.y - (contentHeight / 2) + options.verticalOffset) + 'px';
        break;
      case 'bottom':
        el.style.top = (pixel.y + options.verticalOffset) + 'px';
        break;
    }

    switch (options.horizontalAlign) {
      case 'left':
        el.style.left = (pixel.x - contentWidth + options.horizontalOffset) + 'px';
        break;
      default:
      case 'center':
        el.style.left = (pixel.x - (contentWidth / 2) + options.horizontalOffset) + 'px';
        break;
      case 'right':
        el.style.left = (pixel.x + options.horizontalOffset) + 'px';
        break;
    }

    el.style.display = visible ? 'block' : 'none';

    if (!visible && typeof options.show === 'function') {
      options.show.apply(this, [el]);
    }
  };

  overlay.onRemove = function() {
    var el = overlay.el;

    if (options.remove) {
      options.remove.apply(this, [el]);
    }
    else {
      overlay.el.parentNode.removeChild(overlay.el);
      overlay.el = null;
    }
  };

  this.overlays.push(overlay);

  return overlay;
};

GMaps.prototype.removeOverlay = function(overlay) {
  for (var i = 0, l = this.overlays.length; i < l; i++) {
    if (this.overlays[i] === overlay) {
      this._teardownChild('overlay', this.overlays[i]);
      this.overlays.splice(i, 1);
      return true;
    }
  }

  return false;
};

GMaps.prototype.removeOverlays = function() {
  for (var i = 0, l = this.overlays.length; i < l; i++) {
    this._teardownChild('overlay', this.overlays[i]);
  }

  this.overlays.length = 0;
};

/* globals subcribeEvent: true */

GMaps.prototype.addText = function(options) {
  var self = this;
  var overlayText = new google.maps.OverlayView();
  var visible = true;

  if(!options.text || typeof options.text !== 'string') {
    throw new Error('addText requires an options config with a text string property');
  }

  overlayText.setMap(this.map);

  if (options.hasOwnProperty('visible')) {
    visible = options.visible;
  }

  overlayText.onAdd = function() {
    var el = document.createElement('div');

    el.style.borderStyle = 'none';
    el.style.borderWidth = '0px';
    el.style.position = 'absolute';
    el.style.opacity = 0; // Don't show until element has been adjusted
    el.style.display = 'block';
    el.style.zIndex = options.zIndex || 100;
    el.innerHTML = '<strong>'+ self.stripHTML(options.text) +'</strong>';

    overlayText.el = el;

    var panes = this.getPanes();
    var overlayLayer = panes.overlayLayer;
    var stopOverlayEvents = ['contextmenu', 'DOMMouseScroll', 'dblclick', 'mousedown'];

    overlayLayer.appendChild(el);

    function preventOverlayEvents() {
      return function(e) {
        if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1 && document.all) {
          e.cancelBubble = true;
          e.returnValue = false;
        }
        else {
          e.stopPropagation();
        }
      };
    }

    var name;
    for (var ev = 0, l = stopOverlayEvents.length; ev < l; ev++) {
      name = stopOverlayEvents[ev];
      google.maps.event.addDomListener(el, name, preventOverlayEvents());
    }

    var overlayEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

    // If there are any mouse events append the mouse target element
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if (options.hasOwnProperty(name)) {
        panes.overlayMouseTarget.appendChild(overlayText.el);
        break;
      }
    }

    // Subscribe all configured mouse events
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if(options.hasOwnProperty(name)) {
        google.maps.event.addDomListener(
          overlayText.el,
          name,
          subcribeEvent(options[name], overlayText)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlayText.draw = function() {
    var projection = this.getProjection();
    var pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));

    options.horizontalOffset = options.horizontalOffset || 0;
    options.verticalOffset = options.verticalOffset || 0;

    var el = overlayText.el;

    // Remove all interferring styles
    var target = el.firstChild;
    target.style.padding = '0';
    target.style.margin = '0';
    target.style.transform = 'none';

    el.style.top = (pixel.y - (el.clientHeight / 2) + options.verticalOffset) + 'px';
    el.style.left = (pixel.x - (el.clientWidth  / 2) + options.horizontalOffset) + 'px';

    // Show the text element
    el.style.opacity = 1;
  };

  overlayText.onRemove = function() {
    overlayText.el.parentNode.removeChild(overlayText.el);
    overlayText.el = null;
  };

  this.texts.push(overlayText);

  return overlayText;
};


GMaps.prototype.removeText = function(overlayText) {
  for (var i = 0, l = this.texts.length; i < l; i++) {
    if (this.texts[i] === overlayText) {
      this._teardownChild('overlayText', this.texts[i]);
      this.texts.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removeTexts = function() {
  for (var i = 0, l = this.texts.length; i < l; i++) {
    this._teardownChild('overlayText', this.texts[i]);
  }

  this.texts.length = 0;
};

/* globals subcribeEvent: true */

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
        subcribeEvent(events[ev], layer)
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
        subcribeEvent(events[ev], layer)
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

/* globals extend_object: true, array_flat: true, array_map: true, arrayToLatLng: true */

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

  var base_options = {
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: false,
        waypoints: []
      },
      request_options =  extend_object(base_options, options);

  request_options.origin = /string/.test(typeof options.origin) ? options.origin : new google.maps.LatLng(options.origin[0], options.origin[1]);
  request_options.destination = /string/.test(typeof options.destination) ? options.destination : new google.maps.LatLng(options.destination[0], options.destination[1]);
  request_options.travelMode = travelMode;
  request_options.unitSystem = unitSystem;

  delete request_options.callback;
  delete request_options.error;

  var self = this,
      service = new google.maps.DirectionsService();

  service.route(request_options, function(result, status) {
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
  options = extend_object({
    locations: [],
    path : false,
    samples : 256
  }, options);

  if (options.locations.length > 0) {
    if (options.locations[0].length > 0) {
      options.locations = array_flat(array_map([options.locations], arrayToLatLng,  false));
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

GMaps.prototype.drawRoute = function(options) {
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

        self.drawPolyline(polyline_options);
        
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


GMaps.prototype.drawSteppedRoute = function(options) {
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

              self.drawPolyline(polyline_options);
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

        self.drawPolyline(polyline_options);
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

  this.polyline = this.map.drawPolyline(polyline_options).getPath();
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

GMaps.prototype.checkGeofence = function(lat, lng, fence) {
  return fence.containsLatLng(new google.maps.LatLng(lat, lng));
};

GMaps.prototype.checkMarkerGeofence = function(marker, outside_callback) {
  var fence, pos;

  if (marker.fences) {
    for (var i = 0, l = marker.fences.length; i < l; i++) {
      fence = marker.fences[i];
      pos = marker.getPosition();
      if (!this.checkGeofence(pos.lat(), pos.lng(), fence)) {
        outside_callback(marker, fence);
      }
    }
  }
};

GMaps.prototype.toImage = function(options) {
  var static_map_options = {};

  if(!options) {
    options = {};
  }

  if(options.size) {
    static_map_options.size = options.size;
  } else {
    static_map_options.size = [this.el.clientWidth, this.el.clientHeight];
  }
  static_map_options.lat = this.getCenter().lat();
  static_map_options.lng = this.getCenter().lng();

  if (this.markers.length > 0) {
    static_map_options['markers'] = [];

    for (var i = 0, l = this.markers.length; i < l; i++) {
      static_map_options['markers'].push({
        lat: this.markers[i].getPosition().lat(),
        lng: this.markers[i].getPosition().lng()
      });
    }
  }

  if (this.polylines.length > 0) {
    var polyline = this.polylines[0];

    static_map_options['polyline'] = {};
    static_map_options['polyline']['path'] = google.maps.geometry.encoding.encodePath(polyline.getPath());
    static_map_options['polyline']['strokeColor'] = polyline.strokeColor
    static_map_options['polyline']['strokeOpacity'] = polyline.strokeOpacity
    static_map_options['polyline']['strokeWeight'] = polyline.strokeWeight
  }

  return GMaps.staticMapURL(static_map_options);
};

GMaps.staticMapURL = function(options){
  var parameters = [],
      data,
      static_root = (location.protocol === 'file:' ? 'http:' : location.protocol ) + '//maps.googleapis.com/maps/api/staticmap';

  if (options.url) {
    static_root = options.url;
    delete options.url;
  }

  static_root += '?';

  var markers = options.markers;
  
  delete options.markers;

  if (!markers && options.marker) {
    markers = [options.marker];
    delete options.marker;
  }

  var styles = options.styles;

  delete options.styles;

  var polyline = options.polyline;
  delete options.polyline;

  /** Map options **/
  if (options.center) {
    parameters.push('center=' + options.center);
    delete options.center;
  }
  else if (options.address) {
    parameters.push('center=' + options.address);
    delete options.address;
  }
  else if (options.lat) {
    parameters.push(['center=', options.lat, ',', options.lng].join(''));
    delete options.lat;
    delete options.lng;
  }
  else if (options.visible) {
    var visible = encodeURI(options.visible.join('|'));
    parameters.push('visible=' + visible);
  }

  var size = options.size;
  if (size) {
    if (size.join) {
      size = size.join('x');
    }
    delete options.size;
  }
  else {
    size = '630x300';
  }
  parameters.push('size=' + size);

  if (!options.zoom && options.zoom !== false) {
    options.zoom = 15;
  }

  var sensor = options.hasOwnProperty('sensor') ? !!options.sensor : true;
  delete options.sensor;
  parameters.push('sensor=' + sensor);

  for (var param in options) {
    if (options.hasOwnProperty(param)) {
      parameters.push(param + '=' + options[param]);
    }
  }

  var marker, loc, i, l;

  /** Markers **/
  if (markers) {

    for (i = 0, l = markers.length; i < l; i++) {
      data = markers[i];
      marker = [];

      if (data.size && data.size !== 'normal') {
        marker.push('size:' + data.size);
        delete data.size;
      }
      else if (data.icon) {
        marker.push('icon:' + encodeURI(data.icon));
        delete data.icon;
      }

      if (data.color) {
        marker.push('color:' + data.color.replace('#', '0x'));
        delete data.color;
      }

      if (data.label) {
        marker.push('label:' + data.label[0].toUpperCase());
        delete data.label;
      }

      loc = (data.address ? data.address : data.lat + ',' + data.lng);
      delete data.address;
      delete data.lat;
      delete data.lng;

      for(param in data){
        if (data.hasOwnProperty(param)) {
          marker.push(param + ':' + data[param]);
        }
      }

      if (marker.length || i === 0) {
        marker.push(loc);
        marker = marker.join('|');
        parameters.push('markers=' + encodeURI(marker));
      }
      // New marker without styles
      else {
        marker = parameters.pop() + encodeURI('|' + loc);
        parameters.push(marker);
      }
    }
  }

  var styleRule, j, ll, p, ruleArg, rule;

  /** Map Styles **/
  if (styles) {
    for (i = 0, l = styles.length; i < l; i++) {
      styleRule = [];
      if (styles[i].featureType){
        styleRule.push('feature:' + styles[i].featureType.toLowerCase());
      }

      if (styles[i].elementType) {
        styleRule.push('element:' + styles[i].elementType.toLowerCase());
      }

      for (j = 0, ll = styles[i].stylers.length; j < l; j++) {
        for (p in styles[i].stylers[j]) {
          if(styles[i].stylers[j].hasOwnProperty(p)) {
            ruleArg = styles[i].stylers[j][p];
            if (p === 'hue' || p === 'color') {
              ruleArg = '0x' + ruleArg.substring(1);
            }
            styleRule.push(p + ':' + ruleArg);
          }
        }
      }

      rule = styleRule.join('|');
      if (rule !== '') {
        parameters.push('style=' + rule);
      }
    }
  }

  /** Polylines **/
  function parseColor(color, opacity) {
    if (color[0] === '#'){
      color = color.replace('#', '0x');

      if (opacity) {
        opacity = parseFloat(opacity);
        opacity = Math.min(1, Math.max(opacity, 0));
        if (opacity === 0) {
          return '0x00000000';
        }
        opacity = (opacity * 255).toString(16);
        if (opacity.length === 1) {
          opacity += opacity;
        }

        color = color.slice(0,8) + opacity;
      }
    }
    return color;
  }

  if (polyline) {
    data = polyline;
    polyline = [];

    if (data.strokeWeight) {
      polyline.push('weight:' + parseInt(data.strokeWeight, 10));
    }

    if (data.strokeColor) {
      var color = parseColor(data.strokeColor, data.strokeOpacity);
      polyline.push('color:' + color);
    }

    if (data.fillColor) {
      var fillcolor = parseColor(data.fillColor, data.fillOpacity);
      polyline.push('fillcolor:' + fillcolor);
    }

    var path = data.path;
    var pos;
    var lll;
    if (path.join) {
      for (j=0, lll = path.length; j < lll; j++) {
        pos = path[j];
        polyline.push(pos.join(','));
      }
    }
    else {
      polyline.push('enc:' + path);
    }

    polyline = polyline.join('|');
    parameters.push('path=' + encodeURI(polyline));
  }

  /** Retina support **/
  var dpi = window.devicePixelRatio || 1;
  parameters.push('scale=' + dpi);

  parameters = parameters.join('&');
  return static_root + parameters;
};

GMaps.prototype.addMapType = function(mapTypeId, options) {
  if (options.hasOwnProperty('getTileUrl') && typeof options['getTileUrl'] === 'function') {
    options.tileSize = options.tileSize || new google.maps.Size(256, 256);

    var mapType = new google.maps.ImageMapType(options);

    this.map.mapTypes.set(mapTypeId, mapType);
  }
  else {
    throw '"getTileUrl" function required.';
  }
};

GMaps.prototype.addOverlayMapType = function(options) {
  if (options.hasOwnProperty('getTile') && typeof options['getTile'] === 'function') {
    var overlayMapTypeIndex = options.index;

    delete options.index;

    this.map.overlayMapTypes.insertAt(overlayMapTypeIndex, options);
  }
  else {
    throw '"getTile" function required.';
  }
};

GMaps.prototype.removeOverlayMapType = function(overlayMapTypeIndex) {
  this.map.overlayMapTypes.removeAt(overlayMapTypeIndex);
};

GMaps.prototype.addStyle = function(options) {
  var styledMapType = new google.maps.StyledMapType(options.styles, { name: options.styledMapName });

  this.map.mapTypes.set(options.mapTypeId, styledMapType);
};

GMaps.prototype.setStyle = function(mapTypeId) {
  this.map.setMapTypeId(mapTypeId);
};

/* globals getElementById: true, extend_object: true, subcribeEvent: true */


GMaps.prototype.createPanorama = function(streetview_options) {
  if (!streetview_options.hasOwnProperty('lat') || !streetview_options.hasOwnProperty('lng')) {
    streetview_options.lat = this.getCenter().lat();
    streetview_options.lng = this.getCenter().lng();
  }

  this.panorama = GMaps.createPanorama(streetview_options);

  this.map.setStreetView(this.panorama);

  return this.panorama;
};


GMaps.createPanorama = function(options) {
  var el = getElementById(options.el, options.context);

  options.position = new google.maps.LatLng(options.lat, options.lng);

  delete options.el;
  delete options.context;
  delete options.lat;
  delete options.lng;

  var streetview_events = ['closeclick', 'links_changed', 'pano_changed', 'position_changed', 'pov_changed', 'resize', 'visible_changed'],
      streetview_options = extend_object({visible : true}, options);

  for (var i = 0, l = streetview_events.length; i < l; i++) {
    delete streetview_options[streetview_events[i]];
  }

  var panorama = new google.maps.StreetViewPanorama(el, streetview_options);
  var name;

  for (i = 0, l = streetview_events.length; i < l; i++) {
    name = streetview_events[i];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        panorama,
        name,
        subcribeEvent(options[name], panorama)
      );
    }
  }

  return panorama;
};

GMaps.prototype.on = function(event_name, handler) {
  return GMaps.on(event_name, this, handler);
};

GMaps.prototype.off = function(event_name) {
  GMaps.off(event_name, this);
};

GMaps.custom_events = ['marker_added', 'marker_removed', 'polyline_added', 'polyline_removed', 'polygon_added', 'polygon_removed', 'geolocated', 'geolocation_failed'];

GMaps.on = function(event_name, object, handler) {
  if (GMaps.custom_events.indexOf(event_name) === -1) {
    if(object instanceof GMaps) { object = object.map; }
    return google.maps.event.addListener(object, event_name, handler);
  }
  else {
    var registered_event = {
      handler : handler,
      eventName : event_name
    };

    object.registered_events[event_name] = object.registered_events[event_name] || [];
    object.registered_events[event_name].push(registered_event);

    return registered_event;
  }
};

GMaps.off = function(event_name, object) {
  if (GMaps.custom_events.indexOf(event_name) === -1) {
    if(object instanceof GMaps) { object = object.map; }
    google.maps.event.clearListeners(object, event_name);
  }
  else {
    object.registered_events[event_name] = [];
  }
};

GMaps.fire = function(event_name, object, scope) {
  var firing_events;

  if (GMaps.custom_events.indexOf(event_name) === -1) {
    google.maps.event.trigger(object, event_name, Array.prototype.slice.apply(arguments).slice(2));
  }
  else if(scope.registered_events && scope.registered_events.hasOwnProperty(event_name)) {
    firing_events = scope.registered_events[event_name];

    for(var i = 0, l = firing_events.length; i < l; i++) {
      firing_events[i]['handler'].apply(scope, [object]);
    }
  }
};

GMaps.geolocate = function geolocate(options) {
  var complete_callback = options.always || options.complete;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      options.success(position);

      if (complete_callback) {
        complete_callback();
      }
    }, function(error) {
      options.error(error);

      if (complete_callback) {
        complete_callback();
      }
    }, options.options);
  }
  else {
    options.not_supported();

    if (complete_callback) {
      complete_callback();
    }
  }
};


GMaps.geocode = function geocode(options) {
  this.geocoder = new google.maps.Geocoder();
  var callback = options.callback;
  if (options.hasOwnProperty('lat') && options.hasOwnProperty('lng')) {
    options.latLng = new google.maps.LatLng(options.lat, options.lng);
  }

  delete options.lat;
  delete options.lng;
  delete options.callback;
  
  this.geocoder.geocode(options, function(results, status) {
    callback(results, status);
  });
};


GMaps.prototype.addDelegatedEvent = function addDelegated(eventName, delegate, callback) {
  var self = this;

  var delegateEventHandler = function delegateEventHandler(e) {
    var trigger = self.el.querySelector(delegate);
    var target = e ? e.target : window.event.srcElement;

    if(!trigger || !target) { return false; }

    // If delegated is target or parent of target invoke callback
    if(trigger === target || self.isChildElement(trigger, target)) {
      callback.apply(null, Array.prototype.slice.call(arguments));
    }
  };

  this.el.addEventListener(eventName, delegateEventHandler, true);

  return {
    eventName: eventName,
    remove: function removeDelegatedEvent() {
      self.el.removeEventListener(eventName, delegateEventHandler);
    }
  };
};


GMaps.prototype.isChildElement = function isChildElement(parent, child) {
  var node = child.parentNode;

  // while there are parent nodes and parent node is not the root map element
  while (node !== null && node !== this.el) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
   }
   return false;
};


GMaps.prototype.uuid = (function() {
  var id = 0;

  return function() {
    return id++;
  }
})();


GMaps.prototype._teardownChild = function(type, child) {
  google.maps.event.clearInstanceListeners(child);

  // Remove all event delegations
  if(child.delegatedEvents && child.delegatedEvents.length) {
    for(var i = 0, l = child.delegatedEvents.length; i < l; i++) {
      child.delegatedEvents[i].remove();
    }
  }

  child.setMap(null);
  GMaps.fire(type+'_removed', child, this);
}


GMaps.prototype.stripHTML = (function() {
  var htmlRE = /(<([^>]+)>)/ig;

  return function(str) {
    return (str+'').replace(htmlRE, '');
  };
})();

//==========================
// Polygon containsLatLng
// https://github.com/tparkin/Google-Maps-Point-in-Polygon
// Poygon getBounds extension - google-maps-extensions
// http://code.google.com/p/google-maps-extensions/source/browse/google.maps.Polygon.getBounds.js
if (!google.maps.Polygon.prototype.getBounds) {
  google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    var paths = this.getPaths();
    var path;

    for (var p = 0; p < paths.getLength(); p++) {
      path = paths.getAt(p);
      for (var i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
    }

    return bounds;
  };
}

if (!google.maps.Polygon.prototype.containsLatLng) {
  // Polygon containsLatLng - method to determine if a latLng is within a polygon
  google.maps.Polygon.prototype.containsLatLng = function(latLng) {
    // Exclude points outside of bounds as there is no way they are in the poly
    var bounds = this.getBounds();

    if (bounds !== null && !bounds.contains(latLng)) {
      return false;
    }

    // Raycast point in polygon method
    var inPoly = false;

    var numPaths = this.getPaths().getLength();
    for (var p = 0; p < numPaths; p++) {
      var path = this.getPaths().getAt(p);
      var numPoints = path.getLength();
      var j = numPoints - 1;

      for (var i = 0; i < numPoints; i++) {
        var vertex1 = path.getAt(i);
        var vertex2 = path.getAt(j);

        if (vertex1.lng() < latLng.lng() && vertex2.lng() >= latLng.lng() || vertex2.lng() < latLng.lng() && vertex1.lng() >= latLng.lng()) {
          if (vertex1.lat() + (latLng.lng() - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < latLng.lat()) {
            inPoly = !inPoly;
          }
        }

        j = i;
      }
    }

    return inPoly;
  };
}

if (!google.maps.Circle.prototype.containsLatLng) {
  google.maps.Circle.prototype.containsLatLng = function(latLng) {
    if (google.maps.geometry) {
      return google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
    }
    else {
      return true;
    }
  };
}

google.maps.LatLngBounds.prototype.containsLatLng = function(latLng) {
  return this.contains(latLng);
};

google.maps.Marker.prototype.setFences = function(fences) {
  this.fences = fences;
};

google.maps.Marker.prototype.addFence = function(fence) {
  this.fences.push(fence);
};

google.maps.Marker.prototype.getId = function() {
  return this['__gm_id'];
};

//==========================
// Array indexOf
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
      'use strict';
      if (this === null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n !== n) { // shortcut for verifying if it's NaN
          n = 0;
        }
        else if (n !== 0 && n !== Infinity && n !== -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
          if (k in t && t[k] === searchElement) {
              return k;
          }
      }
      return -1;
  }
}

return GMaps;
}));
