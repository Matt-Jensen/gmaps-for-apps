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
