GMaps.prototype._createControl = function(options) {
  var control = document.createElement('div');

  control.style.cursor = 'pointer';
  
  if (options.disableDefaultStyles !== true) {
    control.style.fontFamily = 'Roboto, Arial, sans-serif';
    control.style.fontSize = '11px';
    control.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
  }

  for (var option in options.style) {
    if(options.style.hasOwnProperty(option)) {
      control.style[option] = options.style[option];
    }
  }

  if (options.id) {
    control.id = options.id;
  }
  
  if (options.title) {
    control.title = options.title;
  }

  if (options.classes) {
    control.className = options.classes;
  }

  if (options.content) {
    if (typeof options.content === 'string') {
      control.innerHTML = options.content;
    }
    else if (options.content instanceof HTMLElement) {
      control.appendChild(options.content);
    }
  }

  if (options.position) {
    control.position = google.maps.ControlPosition[options.position.toUpperCase()];
  }

  for (var ev in options.events) {
    if(options.events.hasOwnProperty(ev)) {
      google.maps.event.addDomListener(
        control,
        ev,
        this.utils.subcribeEvent(options.events[ev])
      );
    }
  }

  control.index = 1;

  return control;
};

GMaps.prototype.addControl = function(options) {
  var control = this._createControl(options);
  
  this.controls.push(control);
  this.map.controls[control.position].push(control);

  return control;
};

GMaps.prototype.removeControl = function(control) {
  var position = null;
  var controlsForPosition;
  var i, l;

  for (i = 0, l = this.controls.length; i < l; i++) {
    if (this.controls[i] === control) {
      position = this.controls[i].position;
      this.controls.splice(i, 1);
      break;
    }
  }

  if (position) {
    for (i = 0, l = this.map.controls.length; i < l; i++) {
      controlsForPosition = this.map.controls[control.position];

      if (controlsForPosition.getAt(i) === control) {
        controlsForPosition.removeAt(i);
        break;
      }
    }
  }

  return control;
};
