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
 * GMaps.js v0.5.8
 * http://hpneo.github.com/gmaps/
 *
 * Copyright 2015, Matt Jensen
 * Released under the MIT License.
 */

/*jshint unused:false*/

if (!(typeof window.google === 'object' && window.google.maps)) {
  throw new Error('Google Maps API is required. Please register the following JavaScript library http://maps.google.com/maps/api/js?sensor=true.');
}

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

    var self = this;
    var eventsThatHideContextMenu = [
      'bounds_changed', 'center_changed', 'click', 'dblclick', 'drag',
      'dragend', 'dragstart', 'idle', 'maptypeid_changed', 'projection_changed',
      'resize', 'tilesloaded', 'zoom_changed'
    ];
    var eventsThatDoesntHideContextMenu = ['mousemove', 'mouseout', 'mouseover'];
    var optionsToBeDeleted = ['el', 'lat', 'lng', 'mapType', 'width', 'height', 'markerClusterer', 'enableNewStyle'];
    var identifier = options.el || options.div;
    var markerClustererFunction = options.markerClusterer;
    var mapType = google.maps.MapTypeId[options.mapType.toUpperCase()];
    var mapCenter = new google.maps.LatLng(options.lat, options.lng);
    var zoomControl = valueOrDefault(options.zoomControl, true);
    var zoomControlOpt = options.zoomControlOpt || {
      style: 'DEFAULT',
      position: 'TOP_LEFT'
    };
    var zoomControlStyle = zoomControlOpt.style || 'DEFAULT';
    var zoomControlPosition = zoomControlOpt.position || 'TOP_LEFT';
    var panControl = valueOrDefault(options.panControl, true);
    var mapTypeControl = valueOrDefault(options.mapTypeControl, true);
    var scaleControl = valueOrDefault(options.scaleControl, true);
    var streetViewControl = valueOrDefault(options.streetViewControl, true);
    var overviewMapControl = valueOrDefault(overviewMapControl, true);
    var mapOptions = {};
    var mapBaseOptions = {
      zoom: this.zoom,
      center: mapCenter,
      mapTypeId: mapType
    };
    var mapControlsOptions = {
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

    if (typeof identifier === 'string') {
      this.el = document.querySelector(identifier);

      if(!this.el) {
        throw new Error('no element was found via querySelector using: ', identifier);
      }
    }

    if (typeof this.el === 'undefined' || this.el === null) {
      throw new Error('No element defined.');
    }

    window.contextMenu = window.contextMenu || {};
    window.contextMenu[self.el.id] = {};

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
    this.registeredEvents = {};
    this._mapEventListeners = [];

    this.el.style.width = options.width || this.el.scrollWidth || this.el.offsetWidth;
    this.el.style.height = options.height || this.el.scrollHeight || this.el.offsetHeight;

    google.maps.visualRefresh = options.enableNewStyle;

    var i, l;
    for (i = 0, l = optionsToBeDeleted.length; i < l; i++) {
      delete options[optionsToBeDeleted[i]];
    }

    if(options.disableDefaultUI !== true) {
      mapBaseOptions = this.utils.merge(mapBaseOptions, mapControlsOptions);
    }

    mapOptions = this.utils.merge(mapBaseOptions, options);

    for (i = 0, l = eventsThatHideContextMenu.length; i < l; i++) {
      delete mapOptions[eventsThatHideContextMenu[i]];
    }

    for (i = 0, l = eventsThatDoesntHideContextMenu.length; i < l; i++) {
      delete mapOptions[eventsThatDoesntHideContextMenu[i]];
    }

    this.map = new google.maps.Map(this.el, mapOptions);

    if (markerClustererFunction) {
      this.markerClusterer = markerClustererFunction.apply(this, [this.map]);
    }

    var buildContextMenuHTML = function buildContextMenuHTML(control, e) {
      var html = '';
      var options = window.contextMenu[self.el.id][control];

      var i, l;
      for (i in options){
        if (options.hasOwnProperty(i)) {
          var option = options[i];

          html += '<li><a id="' + control + '_' + i + '" href="#">' + option.title + '</a></li>';
        }
      }

      if (!document.getElementById('gmaps-context-menu')) { return; }

      var contextMenuElement = document.getElementById('gmaps-context-menu');
      
      contextMenuElement.innerHTML = html;

      var contextMenuItems = contextMenuElement.getElementsByTagName('a');

      var assignMenuItemAction = function(ev){
        ev.preventDefault();

        options[this.id.replace(control + '_', '')].action.apply(self, [e]);
        self.hideContextMenu();
      };

      for (i = 0, l = contextMenuItems.length; i < l; i++) {
        var contextMenuItem = contextMenuItems[i];
        google.maps.event.clearListeners(contextMenuItem, 'click');
        google.maps.event.addDomListenerOnce(
          contextMenuItem,
          'click',
          assignMenuItemAction,
          false
        );
      }

      var position = self.utils.findAbsolutePosition(self.el);
      var left = position[0] + e.pixel.x - 15;
      var top = position[1] + e.pixel.y- 15;

      contextMenuElement.style.left = left + 'px';
      contextMenuElement.style.top = top + 'px';
      contextMenuElement.style.display = 'block';
    };

    this.buildContextMenu = function buildContextMenu(control, e) {
      if (control === 'marker') {
        e.pixel = {};

        var overlay = new google.maps.OverlayView();
        overlay.setMap(self.map);
        
        overlay.draw = function() {
          var projection = overlay.getProjection();
          var position = e.marker.getPosition();
          
          e.pixel = projection.fromLatLngToContainerPixel(position);

          buildContextMenuHTML(control, e);
        };
      }
      else {
        buildContextMenuHTML(control, e);
      }
    };

    this.setContextMenu = function setContextMenu(options) {
      window.contextMenu[self.el.id][options.control] = {};

      var ul = doc.createElement('ul');

      var i;
      for (i in options.options) {
        if (options.options.hasOwnProperty(i)) {
          var option = options.options[i];

          window.contextMenu[self.el.id][options.control][option.name] = {
            title: option.title,
            action: option.action
          };
        }
      }

      ul.id = 'gmaps-context-menu';
      ul.style.display = 'none';
      ul.style.position = 'absolute';
      ul.style.minWidth = '100px';
      ul.style.background = 'white';
      ul.style.listStyle = 'none';
      ul.style.padding = '8px';
      ul.style.boxShadow = '2px 2px 6px #ccc';

      doc.body.appendChild(ul);

      var contextMenuElement = document.getElementById('gmaps-context-menu')

      self._mapEventListeners.push(
        google.maps.event.addDomListener(contextMenuElement, 'mouseout', function(ev) {
          if (!ev.relatedTarget || !this.contains(ev.relatedTarget)) {
            window.setTimeout(function(){
              contextMenuElement.style.display = 'none';
            }, 400);
          }
        }, false)
      );
    };

    this.hideContextMenu = function hideContextMenu() {
      var contextMenuElement = document.getElementById('gmaps-context-menu');

      if (contextMenuElement) {
        contextMenuElement.style.display = 'none';
      }
    };

    var setupListener = function setupListener(object, name) {
      return google.maps.event.addListener(object, name, function(e){
        if (typeof e === 'undefined') {
          e = this;
        }

        options[name].apply(this, [e]);

        self.hideContextMenu();
      });
    };

    self._mapEventListeners.push(
      google.maps.event.addListener(
        this.map,
        'zoom_changed',
        this.hideContextMenu
      )
    );

    var name;

    for (i = 0, l = eventsThatHideContextMenu.length; i < l; i++) {
      name = eventsThatHideContextMenu[i];

      if (name in options) {
        if(options.hasOwnProperty(name)) {
          self._mapEventListeners.push(setupListener(this.map, name));
        }
      }
    }

    for (i = 0, l = eventsThatDoesntHideContextMenu.length; i < l; i++) {
      name = eventsThatDoesntHideContextMenu[i];

      if (name in options) {
        if(options.hasOwnProperty(name)) {
          self._mapEventListeners.push(setupListener(this.map, name));
        }
      }
    }

    self._mapEventListeners.push(
      google.maps.event.addListener(this.map, 'rightclick', function(e) {
        if (options.rightclick) {
          options.rightclick.apply(this, [e]);
        }

        if(typeof window.contextMenu[self.el.id]['map'] !== 'undefined') {
          self.buildContextMenu('map', e);
        }
      })
    );

    this.refresh = function refresh() {
      google.maps.event.trigger(this.map, 'resize');
    };

    this.fitZoom = function fitZoom() {
      var latLngs = [];

      for (var i = 0, l = this.markers.length; i < l; i++) {
        if(typeof this.markers[i].visible === 'boolean' && this.markers[i].visible) {
          latLngs.push(this.markers[i].getPosition());
        }
      }

      this.fitLatLngBounds(latLngs);
    };

    this.fitLatLngBounds = function fitLatLngBounds(latLngs) {
      var bounds = new google.maps.LatLngBounds();

      for(var i = 0, l = latLngs.length; i < l; i++) {
        bounds.extend(latLngs[i]);
      }

      this.map.fitBounds(bounds);
    };

    this.setCenter = function setCenter(lat, lng, callback) {
      this.map.panTo(new google.maps.LatLng(lat, lng));

      if (callback) { callback(); }
    };

    this.getElement = function getElement() {
      return this.el;
    };

    this.zoomIn = function zoomIn(value) {
      value = value || 1;

      this.zoom = this.map.getZoom() + value;
      this.map.setZoom(this.zoom);
    };

    this.zoomOut = function zoomOut(value) {
      value = value || 1;

      this.zoom = this.map.getZoom() - value;
      this.map.setZoom(this.zoom);
    };

    var nativeMethods = [];
    var method;

    for (method in this.map) {
      if (typeof this.map[method] === 'function' && !this[method]) {
        nativeMethods.push(method);
      }
    }

    function createNativeMethod(gmaps, scope, methodName) {
      gmaps[methodName] = function() {
        return scope[methodName].apply(scope, arguments);
      };
    }

    for (i = 0, l = nativeMethods.length; i < l; i++) {
      createNativeMethod(this, this.map, nativeMethods[i]);
    }
  };


  GMaps.prototype.destroy = function destroy() {

    // Clear children
    this.removeMarkers();
    this.removeOverlays();
    this.removeTexts();
    this.removePolygons();
    this.removePolylines();
    this.removeCircles();
    this.removeRectangles();
    this.removeInfoWindows();

    // Remove map event listeners
    for(var i = 0, l = this._mapEventListeners.length; i < l; i++) {
      google.maps.event.removeListener(this._mapEventListeners[i]);
    }

    this._mapEventListeners.length = 0;

    // Clear map instance listeners
    google.maps.event.clearInstanceListeners(this.map);

    // Remove map and map html
    this.map = null;
    this.el.innerHTML = '';
  };

  return GMaps;
})();

GMaps.prototype._createControl = function(options) {
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
        this.utils.subcribeEvent(options.events[ev])
      );
    }
  }

  control.index = 1;

  return control;
};

GMaps.prototype.addControl = function(options) {
  var control = this._createControl(options);
  
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

GMaps.prototype.addCircle = function(options) {
  options = this.utils.merge({
    map: this.map,
    center: new google.maps.LatLng(options.lat, options.lng)
  }, options);

  var circle = new google.maps.Circle(options);
  var circleEvents = [
    'click',
    'dblclick',
    'rightclick',
    'drag',
    'dragend',
    'dragstart',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'radius_changed',
    'center_changed'
  ];

  for (var i = 0, l = circleEvents.length, name; i < l; i++) {
    name = circleEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        circle,
        name,
        this.utils.subcribeEvent(options[name], circle)
      );
    }
  }

  // Prevent double events
  delete circle.radius_changed;
  delete circle.center_changed;

  this.circles.push(circle);
  GMaps.fire('circle_added', circle, this);

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

GMaps.prototype.drawRectangle = function() {
  var args = Array.prototype.slice.call(arguments);
  return this.addRectangle.apply(this, args);
}

GMaps.prototype.addRectangle = function(options) {
  options = this.utils.merge({
    map: this.map
  }, options);

  var latLngBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(options.bounds[0][0], options.bounds[0][1]),
    new google.maps.LatLng(options.bounds[1][0], options.bounds[1][1])
  );

  options.bounds = latLngBounds;

  var rectangle = new google.maps.Rectangle(options);
  var rectangleEvents = [
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
    'mouseup',
    'bounds_changed'
  ];

  for (var ev = 0, l = rectangleEvents.length, name; ev < l; ev++) {
    name = rectangleEvents[ev];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        rectangle,
        name,
        this.utils.subcribeEvent(options[name], rectangle)
      );
    }
  }

  // Prevent double events
  delete rectangle.bounds_changed;

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

GMaps.prototype.addInfoWindow = function(options) {
  options = this.utils.merge({
    map: this.map,
    position: new google.maps.LatLng(options.lat, options.lng)
  }, options);

  var infoWindowSelector = '__gmaps-info-window-'+ this.utils.uuid() +'__';
  options.content = options.content || '';
  options.content = [
    '<div id="',
    infoWindowSelector,
    '">',
    options.content,
    '</div>'
  ].join('');

  var infoWindow    = new google.maps.InfoWindow(options);
  infoWindow._map   = this.map;
  infoWindow._DOMid = infoWindowSelector;
  infoWindow.delegatedEvents = [];
  var mouseEvents = [
    'click',
    'rightclick',
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

  var i, l, name, removeDelegatedEvent;

  for (i = 0, l = mouseEvents.length, name; i < l; i++) {
    name = mouseEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {

      // delegate event to the info-window's content wrapper div
      removeDelegatedEvent = this.addDelegatedEvent(
        name,
        '#'+infoWindowSelector,
        this.utils.subcribeEvent(options[name], infoWindow)
      );
      infoWindow.delegatedEvents.push(removeDelegatedEvent);
    }
  }

  // Add default events
  var classEvents = [
    'closeclick',
    'content_changed',
    'domready',
    'position_changed',
    'zindex_changed'
  ];

  for(i = 0, l = classEvents.length, name; i < l; i++) {
    name = classEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        infoWindow,
        name,
        this.utils.subcribeEvent(options[name], infoWindow)
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
  GMaps.fire('info_window_added', infoWindow, this);

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

GMaps.prototype.drawOverlay = function() {
  var args = Array.prototype.slice.call(arguments);
  return this.addOverlay.apply(this, args);
};

GMaps.prototype.addOverlay = function(options) {
  var self = this;
  var overlay = new google.maps.OverlayView();
  var visible = true;

  this.utils.merge(overlay, options);
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
    
    var panes = this.getPanes();
    var overlayLayer = panes[options.layer];
    var stopOverlayEvents = [
      'contextmenu',
      'DOMMouseScroll',
      'dblclick',
      'mousedown'
    ];

    overlayLayer.appendChild(el);

    function preventOverlayEvents() {
      return function(e) {
        if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1 && document.all) {
          e.cancelBubble = true;
          e.returnValue = false;
        }
        else if(e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
      };
    }

    var name;
    for (var ev = 0, l = stopOverlayEvents.length; ev < l; ev++) {
      name = stopOverlayEvents[ev];
      google.maps.event.addDomListener(el, name, preventOverlayEvents());
    }

    var overlayEvents = [
      'click',
      'rightclick',
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
          self.utils.subcribeEvent(options[name], overlay)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlay.draw = function() {
    var projection = this.getProjection();
    var pixel = 0;

    // Avoid crashing unit tests
    try {
      pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));
    } catch(e) {};

    options.horizontalOffset = options.horizontalOffset || 0;
    options.verticalOffset = options.verticalOffset || 0;

    var el = overlay.el;
    var content = el.children[0];
    var contentHeight = content.clientHeight;
    var contentWidth = content.clientWidth;

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
  GMaps.fire('overlay_added', overlay, this);

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

GMaps.prototype.addText = function(options) {
  var self = this;
  var overlayText = new google.maps.OverlayView();
  var visible = true;

  this.utils.merge(overlayText, options);

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
    el.innerHTML = '<strong>'+ self.utils.stripHTML(options.text) +'</strong>';

    overlayText.el = el;

    var panes = this.getPanes();
    var overlayLayer = panes.overlayLayer;
    var stopOverlayEvents = [
      'contextmenu',
      'DOMMouseScroll',
      'dblclick',
      'mousedown'
    ];

    overlayLayer.appendChild(el);

    function preventOverlayEvents() {
      return function(e) {
        if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1 && document.all) {
          e.cancelBubble = true;
          e.returnValue = false;
        }
        else if(e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
      };
    }

    var name;
    for (var ev = 0, l = stopOverlayEvents.length; ev < l; ev++) {
      name = stopOverlayEvents[ev];
      google.maps.event.addDomListener(el, name, preventOverlayEvents());
    }

    var overlayEvents = [
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
          self.utils.subcribeEvent(options[name], overlayText)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlayText.draw = function() {
    var projection = this.getProjection();
    var pixel = 0;

    // Avoid crashing unit tests
    try {
      pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));
    } catch(e) {};

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
  GMaps.fire('text_added', overlayText, this);

  return overlayText;
};


GMaps.prototype.removeText = function(overlayText) {
  for (var i = 0, l = this.texts.length; i < l; i++) {
    if (this.texts[i] === overlayText) {
      this._teardownChild('text', this.texts[i]);
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

  var baseOptions = {
    avoidHighways: false,
    avoidTolls: false,
    optimizeWaypoints: false,
    waypoints: []
  };
  var requestOptions =  this.utils.merge(baseOptions, options);

  requestOptions.origin = /string/.test(typeof options.origin) ? options.origin : new google.maps.LatLng(options.origin[0], options.origin[1]);
  requestOptions.destination = /string/.test(typeof options.destination) ? options.destination : new google.maps.LatLng(options.destination[0], options.destination[1]);
  requestOptions.travelMode = travelMode;
  requestOptions.unitSystem = unitSystem;

  delete requestOptions.callback;
  delete requestOptions.error;

  var self = this,
      service = new google.maps.DirectionsService();

  service.route(requestOptions, function(result, status) {
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
  var self = this;
  options = this.utils.merge({
    locations: [],
    path : false,
    samples : 256
  }, options);

  if (options.locations.length > 0) {
    if (options.locations[0].length > 0) {
      options.locations = this.utils.arrayFlat(
        this.utils.arrayMap(
          [options.locations],
          function(c) { return self.utils.arrayToLatLng(c, false); }
        )
      );
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

GMaps.prototype.drawRoute = function() {
  var args = Array.prototype.slice.call(arguments);
  this.addRoute.apply(this, args);
};

GMaps.prototype.addRoute = function(options) {
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

        self.addPolyline(polyline_options);
        
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


GMaps.prototype.drawSteppedRoute = function() {
  var args = Array.prototype.slice.call(arguments);
  this.addSteppedRoute.apply(this, args);
};

GMaps.prototype.addSteppedRoute = function(options) {
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

              self.addPolyline(polyline_options);
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

        self.addPolyline(polyline_options);
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

  this.polyline = this.map.addPolyline(polyline_options).getPath();
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
  var staticMapOptions = {};

  if(!options) {
    options = {};
  }

  if(options.size) {
    staticMapOptions.size = options.size;
  } else {
    staticMapOptions.size = [this.el.clientWidth, this.el.clientHeight];
  }
  staticMapOptions.lat = this.getCenter().lat();
  staticMapOptions.lng = this.getCenter().lng();

  if (this.markers.length > 0) {
    staticMapOptions['markers'] = [];

    for (var i = 0, l = this.markers.length; i < l; i++) {
      staticMapOptions['markers'].push({
        lat: this.markers[i].getPosition().lat(),
        lng: this.markers[i].getPosition().lng()
      });
    }
  }

  if (this.polylines.length > 0) {
    var polyline = this.polylines[0];

    staticMapOptions['polyline'] = {};
    staticMapOptions['polyline']['path'] = google.maps.geometry.encoding.encodePath(polyline.getPath());
    staticMapOptions['polyline']['strokeColor'] = polyline.strokeColor
    staticMapOptions['polyline']['strokeOpacity'] = polyline.strokeOpacity
    staticMapOptions['polyline']['strokeWeight'] = polyline.strokeWeight
  }

  return GMaps.staticMapURL(staticMapOptions);
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
    throw new Error('"getTileUrl" function required.');
  }
};

GMaps.prototype.addOverlayMapType = function(options) {
  if (options.hasOwnProperty('getTile') && typeof options['getTile'] === 'function') {
    var overlayMapTypeIndex = options.index;

    delete options.index;

    this.map.overlayMapTypes.insertAt(overlayMapTypeIndex, options);
  }
  else {
    throw new Error('"getTile" function required.');
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

GMaps.prototype.createPanorama = function(streetviewOptions) {
  if (!streetviewOptions.hasOwnProperty('lat') || !streetviewOptions.hasOwnProperty('lng')) {
    streetviewOptions.lat = this.getCenter().lat();
    streetviewOptions.lng = this.getCenter().lng();
  }

  this.panorama = GMaps.createPanorama(streetviewOptions);

  this.map.setStreetView(this.panorama);

  return this.panorama;
};


GMaps.createPanorama = function(options) {
  var el = document.getElementById(options.el);

  options.position = new google.maps.LatLng(options.lat, options.lng);

  delete options.el;
  delete options.context;
  delete options.lat;
  delete options.lng;

  var streetviewEvents = [
    'closeclick',
    'links_changed',
    'pano_changed',
    'position_changed',
    'pov_changed',
    'resize',
    'visible_changed'
  ];
  var streetviewOptions = GMaps.prototype.utils.merge({visible : true}, options);

  for (var i = 0, l = streetviewEvents.length; i < l; i++) {
    delete streetviewOptions[streetviewEvents[i]];
  }

  var panorama = new google.maps.StreetViewPanorama(el, streetviewOptions);
  var name;

  for (i = 0, l = streetviewEvents.length; i < l; i++) {
    name = streetviewEvents[i];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        panorama,
        name,
        GMaps.prototype.utils.subcribeEvent(options[name], panorama)
      );
    }
  }

  return panorama;
};

GMaps.prototype.on = function(eventName, handler) {
  return GMaps.on(eventName, this, handler);
};


GMaps.prototype.off = function(eventName) {
  GMaps.off(eventName, this);
};


GMaps.customEvents = [
  'marker_added',
  'marker_removed',
  'polyline_added',
  'polyline_removed',
  'polygon_added',
  'polygon_removed',
  'circle_added',
  'circle_removed',
  'rectangle_added',
  'rectangle_removed',
  'overlay_added',
  'overlay_removed',
  'text_added',
  'text_removed',
  'info_window_added',
  'info_window_removed',
  'geolocated',
  'geolocation_failed'
];


GMaps.on = function(eventName, object, handler) {
  var registeredEvent;

  // Non-supported custom event
  if (GMaps.customEvents.indexOf(eventName) === -1) {
    if(object instanceof GMaps) { object = object.map; }
    return google.maps.event.addListener(object, eventName, handler);
  }

  // Supported custom event
  registeredEvent = {
    handler : handler,
    eventName : eventName
  };

  object.registeredEvents[eventName] = object.registeredEvents[eventName] || [];
  object.registeredEvents[eventName].push(registeredEvent);

  return registeredEvent;
};


GMaps.off = function(eventName, object) {
  if (GMaps.customEvents.indexOf(eventName) === -1) {
    if(object instanceof GMaps) { object = object.map; }
    google.maps.event.clearListeners(object, eventName);
  }
  else {
    object.registeredEvents[eventName] = [];
  }
};


GMaps.fire = function(eventName, object, scope) {
  var firing_events;

  if (GMaps.customEvents.indexOf(eventName) === -1) {
    google.maps.event.trigger(object, eventName, Array.prototype.slice.apply(arguments).slice(2));
  }
  else if(scope.registeredEvents && scope.registeredEvents.hasOwnProperty(eventName)) {
    firing_events = scope.registeredEvents[eventName];

    for(var i = 0, l = firing_events.length; i < l; i++) {
      firing_events[i]['handler'].apply(scope, [object]);
    }
  }
};

/**
 * [utils namespace for all utility methods]
 */
GMaps.prototype.utils = Object.create(null);


/**
 * [merge description combines an indeterminate # of objects into a single object, giving preferece to the last arguement given]
 * @param  {[object]} dest [an orginal object]
 * @return {[object]}      [all merged objects]
 */
GMaps.prototype.utils.merge = function merge(dest) {
  var merging = Array.prototype.slice.call(arguments, 1);

  var target, p;
  while (merging.length) {
    target = merging.shift();

    // Only merge objects
    if (target instanceof Object === false) { continue; }

    for (p in target) {
      if (target.hasOwnProperty(p)) {
        if (target[p] instanceof Object && dest[p] instanceof Object) {
          // Recursively merge objects
          dest[p] = GMaps.prototype.utils.merge(dest[p], target[p]);
        }
        else {
          dest[p] = target[p];
        }
      }
    }
  }

  return dest;
};


/**
 * [geolocate service to request and access a navigators geolocation]
 * @param  {[object]} options [accepts callbacks always|complete, success, error, notSupported]
 */
GMaps.prototype.utils.geolocate = function geolocate(options) {
  var completeCallback = options.always || options.complete;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      options.success(position);

      if (completeCallback) {
        completeCallback();
      }
    }, function(error) {
      options.error(error);

      if (completeCallback) {
        completeCallback();
      }
    }, options.options);
  }
  else {
    options.notSupported();

    if (completeCallback) {
      completeCallback();
    }
  }
};


/**
 * [isChildElement returns true if childs parentNode's === parent]
 * @param  {[Node]}  parent [parent element to compare child.parentNode's to]
 * @param  {[Node]}  child  [child element to begin comparison]
 * @return {Boolean}        [true if child is desendent of parent]
 */
GMaps.prototype.utils.isChildElement = function isChildElement(parent, child) {
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


/**
 * [uuid returns a unique number for each invokation]
 * @return {[number]}   [a unique number]
 */
GMaps.prototype.utils.uuid = (function() {
  var id = 0;

  return function() {
    return id++;
  }
})();


/**
 * [Removes all HTML tags from a string, returning only text content]
 * @param  {[str]}    [String to remove HTML tags from]
 * @return {[string]} [text content of html]
 */
GMaps.prototype.utils.stripHTML = (function() {
  var htmlRE = /(<([^>]+)>)/ig;

  return function stripHTML(str) {
    return (str+'').replace(htmlRE, '');
  };
})();


/**
 * [converts a dasherized strings to camel cased string]
 * @return {[string]}   [camel cased string]
 */
GMaps.prototype.utils.toCamelCase = (function() {
  var ccRE = /-([a-z])/g;

  return function toCamelCase(str) {
    return (str+'').replace(ccRE, function (g) { return g[1].toUpperCase(); });
  };
})();


/**
 * [arrayMap polyfill for Array.prototype.map]
 * @param  {[Array]}  array   
 * @param  {Function} callback [recieves (array[i], i, array)]
 * @param  {[object]} context  [optional context for callback]
 * @return {[type]}            [description]
 */
GMaps.prototype.utils.arrayMap = function arrayMap(array, callback) {
  var params = Array.prototype.slice.call(arguments, 1);
  var arrayReturn = [];
  var i, l;

  if (Array.prototype.map && array.map === Array.prototype.map) {
    arrayReturn = array.map.apply(array, params);
  }
  else {
    for (i = 0, l = array.length; i < l; i++) {
      arrayReturn.push(callback.apply(params[2] || this, [array[i], i, array]));
    }
  }

  return arrayReturn;
};


/**
 * [arrayFlat converts an array of arrays into a single level array]
 * @param  {[Array]} array [multi level array]
 * @return {[Array]}       [single level array]
 */
GMaps.prototype.utils.arrayFlat = function arrayFlat(array) {
  var newArray = [];
  var i, l;

  for (i = 0, l = array.length; i < l; i++) {
    newArray = newArray.concat(array[i]);
  }

  return newArray;
};


/**
 * [arrayToLatLng replaces array items with response from `coordsToLatLngs`]
 * @param  {[Array]} coords       [array of array coordinates]
 * @param  {[Boolean]} useGeoJSON [changes coordsToLatLngs behavior]
 * @return {[Array]}              [Array of google LatLng instances]
 */
GMaps.prototype.utils.arrayToLatLng = function arrayToLatLng(coords, useGeoJSON) {
  for (var i = 0, l = coords.length; i < l; i++) {
    if (!(coords[i] instanceof google.maps.LatLng)) {
      if (coords[i].length > 0 && typeof coords[i][0] === 'object') {
        coords[i] = GMaps.prototype.utils.arrayToLatLng(coords[i], useGeoJSON);
      }
      else {
        coords[i] = GMaps.prototype.utils.coordsToLatLngs(coords[i], useGeoJSON);
      }
    }
  }

  return coords;
};


/**
 * [coordsToLatLngs returns an instance of google.mapsLatLng based on an array of coords]
 * @param  {[array]} coords    [[lat,lng]]
 * @param  {[Boolean]} useGeoJSON [changes to [lng,lat]]
 * @return {[LatLng]}            [google.maps.LatLng instance]
 */
GMaps.prototype.utils.coordsToLatLngs = function coordsToLatLngs(coords, useGeoJSON) {
  var firstCoord = coords[0],
      secondCoord = coords[1];

  if (useGeoJSON) {
    firstCoord = coords[1];
    secondCoord = coords[0];
  }

  return new google.maps.LatLng(firstCoord, secondCoord);
};


/**
 * [findAbsolutePosition calculates the total absolute position left + top relative to the viewport]
 * @param  {[node]} node [Live node element]
 * @return {[Array]}     [[from-left, from-top]]
 */
GMaps.prototype.utils.findAbsolutePosition = function findAbsolutePosition(node)  {
  var curleft = 0;
  var curtop = 0;

  if (node.offsetParent) {
    do {
      curleft += node.offsetLeft;
      curtop += node.offsetTop;
    } while (node = node.offsetParent);
  }

  return [curleft, curtop];
};

/**
 * [subcribeEvent returns a funciton that provides an event to a callback, with opt params]
 * @param  {Function} callback [called on event]
 * @param  {[context]}   obj   [provided to callback]
 * @return {[Function]}        [return function to be invoked as an event callback]
 */
GMaps.prototype.utils.subcribeEvent = function subcribeEvent(callback, obj) {
  return function(e) {
    var args = [];
    if(e && typeof e !== 'number') { args.push(e); } // don't allow index parameters as events
    args.push(obj || this);
    return callback.apply(null, args);
  };
};

// ********************************************************
// Instance Helpers are utility methods
// with logic reliant upon a GMaps instance dynamic scope
// ********************************************************


/**
 * [geocode instantiates a google.maps Geocoder]
 * @param  {[object]} options [accepts properties lat, lng, and callback]
 * @return {[Geocoder]}       [instance of Geocoder]
 */
GMaps.prototype.geocode = (function() {

  var geocoder = new google.maps.Geocoder();

  return function geocode(options) {
    if(!options || !options.callback) {
      throw new Error('geocode requires an options object with a callback');
    }

    var callback = options.callback;

    if (options.hasOwnProperty('lat') && options.hasOwnProperty('lng')) {
      options.latLng = new google.maps.LatLng(options.lat, options.lng);
    }

    delete options.lat;
    delete options.lng;
    delete options.callback;
    
    geocoder.geocode(options, function(results, status) {
      callback(results, status);
    });
  }
})();


/**
 * [addDelegatedEvent creates an event listener on the root map element that triggers a
 * callback when a delegate (or a child) element is source of the event.  Please use with
 * causion as this is a more expensive operation.]
 * @param {[string]}   eventName [eventm name to listen for]
 * @param {[selector]} delegateSelector  [string selector to pass to querySelector]
 * @param {Function} callback    [function to invoke if delegate is source]
 * @returns { object } [to remove delegated event listener]
 */
GMaps.prototype.addDelegatedEvent = function addDelegated(eventName, delegateSelector, callback) {
  var self = this;

  var delegateEventHandler = function delegateEventHandler(e) {
    var trigger = self.el.querySelector(delegateSelector);
    var target = e ? e.target : window.event.srcElement;

    if(!trigger || !target) { return false; }

    // If delegated is target or parent of target invoke callback
    if(trigger === target || self.utils.isChildElement(trigger, target)) {
      callback.apply(null, Array.prototype.slice.call(arguments));
    }
  };

  self.el.addEventListener(eventName, delegateEventHandler, true);

  return {
    eventName: eventName,
    remove: function removeDelegatedEvent() {
      self.el.removeEventListener(eventName, delegateEventHandler, true);
    }
  };
};


/**
 * [hasMapChild returns true if a map has a child instance and false if not]
 * @param  {[string|object]}  child [child instance or id to a child element]
 * @param  {[string]}  type  [identifier for a map store]
 * @return {Boolean}         [true if has the child false if not]
 */
GMaps.prototype.hasChild = function(child, type) {

  // support dasherized types
  type = this.utils.toCamelCase(type);

  // support singular types
  var map = {
    marker: 'markers',
    polyline: 'polylines',
    polygon: 'polygons',
    circle: 'circles',
    rectangle: 'rectangles',
    overlay: 'overlays',
    text: 'texts',
    infoWindow: 'infoWindows'
  };

  var model = (map.hasOwnProperty(type) ? this[map[type]] : this[type]);

  if(typeof model === 'undefined') {
    throw new Error('hasMapChild requires a name to valid GMap model array');
  }

  var id, i = 0, l = model.length;

  // search by id
  if(typeof child === 'string') {
    id = child;
    for(; i < l; i++ ) {
      if(model[i].id === id) {
        return true;
      }
    }
  }
  // search by instance
  else if(typeof child === 'object') {
    for(; i < l; i++ ) {
      if(model[i] === child) {
        return true;
      }
    }
  }
  else {
    if(console && console.warn) {
      console.warn('invalid child argument to hasMapChild, requires an id or map child instance');
    }
  }
  
  return false;
};


/**
 * [_teardownChild internal method to remove a map child's listeners, delegatedEvents, map]
 * @param  {[string]} type  [used for global notifications]
 * @param  {[ChildInstance]} child [an instance of a map child]
 */
GMaps.prototype._teardownChild = function teardownChild(type, child) {
  google.maps.event.clearInstanceListeners(child);

  // Remove all event delegations
  if(child.delegatedEvents && child.delegatedEvents.length) {
    for(var i = 0, l = child.delegatedEvents.length; i < l; i++) {
      child.delegatedEvents[i].remove();
    }
    child.delegatedEvents.length = 0;
  }

  child.setMap(null);
  GMaps.fire(type+'_removed', child, this);
}

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
