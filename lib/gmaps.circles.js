GMaps.prototype.addCircle = function(options) {
  options = this.utils.merge({
    map: this.map,
    center: new google.maps.LatLng(options.lat, options.lng)
  }, options);

  var circle = new google.maps.Circle(options);
  var circleEvents = [
    'click',
    'dblclick',
    'rightclick',
    'drag',
    'dragend',
    'dragstart',
    'mousedown',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'radius_changed',
    'center_changed'
  ];

  for (var i = 0, l = circleEvents.length, name; i < l; i++) {
    name = circleEvents[i];

    // If object has configured event
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        circle,
        name,
        this.utils.subcribeEvent(options[name], circle)
      );
    }
  }

  // Prevent double events
  delete circle.radius_changed;
  delete circle.center_changed;

  this.circles.push(circle);
  GMaps.fire('circle_added', circle, this);

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
