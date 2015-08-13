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
