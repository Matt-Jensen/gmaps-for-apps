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
