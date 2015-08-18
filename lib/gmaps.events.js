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
