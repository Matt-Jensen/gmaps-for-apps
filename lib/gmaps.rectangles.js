GMaps.prototype.drawRectangle = function(options) {
  options = this.utils.merge({
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
        this.utils.subcribeEvent(options[name], rectangle)
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
