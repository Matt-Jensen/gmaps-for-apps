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
      this.rectangles[i].setMap(null);
      this.rectangles.splice(i, 1);

      GMaps.fire('rectangle_removed', rectangle, this);

      return true;
    }
  }

  return false;
};


GMaps.prototype.removeRectangles = function() {
  for (var i = 0, l = this.rectangles.length; i < l; i++) {
    this.rectangles[i].setMap(null);
  }

  this.rectangles.length = 0;
};