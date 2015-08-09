/* globals extend_object: true, subcribeEvent: true */

GMaps.prototype.drawCircle = function(options) {
  options = extend_object({
    map: this.map,
    center: new google.maps.LatLng(options.lat, options.lng)
  }, options);

  delete options.lat;
  delete options.lng;

  var circle = new google.maps.Circle(options);
  var circle_events = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];

  for (var i = 0, name; i < circle_events.length; i++) {
    name = circle_events[i];

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
      this.circles[i].setMap(null);
      this.circles.splice(i, 1);

      GMaps.fire('circle_removed', circle, this);

      return true;
    }
  }

  return false;
};