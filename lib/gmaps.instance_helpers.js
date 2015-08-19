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
