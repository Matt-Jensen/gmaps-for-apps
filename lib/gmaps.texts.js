GMaps.prototype.addText = function(options) {
  var self = this;
  var overlayText = new google.maps.OverlayView();
  var visible = true;

  this.utils.merge(overlayText, options);

  if(!options.text || typeof options.text !== 'string') {
    throw new Error('addText requires an options config with a text string property');
  }

  overlayText.setMap(this.map);

  if (options.hasOwnProperty('visible')) {
    visible = options.visible;
  }

  overlayText.onAdd = function() {
    var el = document.createElement('div');

    el.style.borderStyle = 'none';
    el.style.borderWidth = '0px';
    el.style.position = 'absolute';
    el.style.opacity = 0; // Don't show until element has been adjusted
    el.style.display = 'block';
    el.style.zIndex = options.zIndex || 100;
    el.innerHTML = '<strong>'+ self.utils.stripHTML(options.text) +'</strong>';

    overlayText.el = el;

    var panes = this.getPanes();
    var overlayLayer = panes.overlayLayer;
    var stopOverlayEvents = [
      'contextmenu',
      'DOMMouseScroll',
      'dblclick',
      'mousedown'
    ];

    overlayLayer.appendChild(el);

    function preventOverlayEvents() {
      return function(e) {
        if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1 && document.all) {
          e.cancelBubble = true;
          e.returnValue = false;
        }
        else if(e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
      };
    }

    var name;
    for (var ev = 0, l = stopOverlayEvents.length; ev < l; ev++) {
      name = stopOverlayEvents[ev];
      google.maps.event.addDomListener(el, name, preventOverlayEvents());
    }

    var overlayEvents = [
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
      'mouseup'
    ];

    // If there are any mouse events append the mouse target element
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if (options.hasOwnProperty(name)) {
        panes.overlayMouseTarget.appendChild(overlayText.el);
        break;
      }
    }

    // Subscribe all configured mouse events
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if(options.hasOwnProperty(name)) {
        google.maps.event.addDomListener(
          overlayText.el,
          name,
          self.utils.subcribeEvent(options[name], overlayText)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlayText.draw = function() {
    var projection = this.getProjection();
    var pixel = 0;

    // Avoid crashing unit tests
    try {
      pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));
    } catch(e) {};

    options.horizontalOffset = options.horizontalOffset || 0;
    options.verticalOffset = options.verticalOffset || 0;

    var el = overlayText.el;

    // Remove all interferring styles
    var target = el.firstChild;
    target.style.padding = '0';
    target.style.margin = '0';
    target.style.transform = 'none';

    el.style.top = (pixel.y - (el.clientHeight / 2) + options.verticalOffset) + 'px';
    el.style.left = (pixel.x - (el.clientWidth  / 2) + options.horizontalOffset) + 'px';

    // Show the text element
    el.style.opacity = 1;
  };

  overlayText.onRemove = function() {
    overlayText.el.parentNode.removeChild(overlayText.el);
    overlayText.el = null;
  };

  this.texts.push(overlayText);
  GMaps.fire('text_added', overlayText, this);

  return overlayText;
};


GMaps.prototype.removeText = function(overlayText) {
  for (var i = 0, l = this.texts.length; i < l; i++) {
    if (this.texts[i] === overlayText) {
      this._teardownChild('text', this.texts[i]);
      this.texts.splice(i, 1);
      return true;
    }
  }

  return false;
};


GMaps.prototype.removeTexts = function() {
  for (var i = 0, l = this.texts.length; i < l; i++) {
    this._teardownChild('overlayText', this.texts[i]);
  }

  this.texts.length = 0;
};
