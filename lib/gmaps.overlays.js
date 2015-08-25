GMaps.prototype.drawOverlay = function() {
  var args = Array.prototype.slice.call(arguments);
  return this.addOverlay.apply(this, args);
};

GMaps.prototype.addOverlay = function(options) {
  var self = this;
  var overlay = new google.maps.OverlayView();
  var visible = true;

  this.utils.merge(overlay, options);
  overlay.setMap(this.map);

  if (options.hasOwnProperty('visible')) {
    visible = options.visible;
  }

  overlay.onAdd = function() {
    var el = document.createElement('div');

    el.style.borderStyle = 'none';
    el.style.borderWidth = '0px';
    el.style.position = 'absolute';
    el.style.zIndex = 100;
    el.innerHTML = options.content;

    overlay.el = el;

    if (!options.layer) {
      options.layer = 'overlayLayer';
    }
    
    var panes = this.getPanes();
    var overlayLayer = panes[options.layer];
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
      'mouseout',
      'mouseover',
      'mousemove',
      'mouseup'
    ];

    // If there are any mouse events append the mouse target element
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if (options.hasOwnProperty(name)) {
        panes.overlayMouseTarget.appendChild(overlay.el);
        break;
      }
    }

    // Subscribe all configured mouse events
    for (ev = 0, l = overlayEvents.length; ev < l; ev++) {
      name = overlayEvents[ev];
      if(options.hasOwnProperty(name)) {
        google.maps.event.addDomListener(
          overlay.el,
          name,
          self.utils.subcribeEvent(options[name], overlay)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlay.draw = function() {
    var projection = this.getProjection();
    var pixel = 0;

    // Avoid crashing unit tests
    try {
      pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));
    } catch(e) {};

    options.horizontalOffset = options.horizontalOffset || 0;
    options.verticalOffset = options.verticalOffset || 0;

    var el = overlay.el;
    var content = el.children[0];
    var contentHeight = content.clientHeight;
    var contentWidth = content.clientWidth;

    switch (options.verticalAlign) {
      case 'top':
        el.style.top = (pixel.y - contentHeight + options.verticalOffset) + 'px';
        break;
      default:
      case 'middle':
        el.style.top = (pixel.y - (contentHeight / 2) + options.verticalOffset) + 'px';
        break;
      case 'bottom':
        el.style.top = (pixel.y + options.verticalOffset) + 'px';
        break;
    }

    switch (options.horizontalAlign) {
      case 'left':
        el.style.left = (pixel.x - contentWidth + options.horizontalOffset) + 'px';
        break;
      default:
      case 'center':
        el.style.left = (pixel.x - (contentWidth / 2) + options.horizontalOffset) + 'px';
        break;
      case 'right':
        el.style.left = (pixel.x + options.horizontalOffset) + 'px';
        break;
    }

    el.style.display = visible ? 'block' : 'none';

    if (!visible && typeof options.show === 'function') {
      options.show.apply(this, [el]);
    }
  };

  overlay.onRemove = function() {
    var el = overlay.el;

    if (options.remove) {
      options.remove.apply(this, [el]);
    }
    else {
      overlay.el.parentNode.removeChild(overlay.el);
      overlay.el = null;
    }
  };

  this.overlays.push(overlay);
  GMaps.fire('overlay_added', overlay, this);

  return overlay;
};

GMaps.prototype.removeOverlay = function(overlay) {
  for (var i = 0, l = this.overlays.length; i < l; i++) {
    if (this.overlays[i] === overlay) {
      this._teardownChild('overlay', this.overlays[i]);
      this.overlays.splice(i, 1);
      return true;
    }
  }

  return false;
};

GMaps.prototype.removeOverlays = function() {
  for (var i = 0, l = this.overlays.length; i < l; i++) {
    this._teardownChild('overlay', this.overlays[i]);
  }

  this.overlays.length = 0;
};
