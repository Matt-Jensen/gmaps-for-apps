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
