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
