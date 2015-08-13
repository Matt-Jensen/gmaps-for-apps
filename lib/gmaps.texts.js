/* globals subcribeEvent: true */

GMaps.prototype.addText = function(options) {
  var self = this;
  var overlayText = new google.maps.OverlayView(),
      visible = true;

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
    el.innerHTML = '<strong>'+ self.stripHTML(options.content) +'</strong>';

    overlayText.el = el;

    if (!options.layer) {
      options.layer = 'overlayLayer';
    }
    
    var panes = this.getPanes(),
        overlayLayer = panes[options.layer],
        stop_overlay_events = ['contextmenu', 'DOMMouseScroll', 'dblclick', 'mousedown'];

    overlayLayer.appendChild(el);

    function preventOverlayEvents() {
      return function(e) {
        if (navigator.userAgent.toLowerCase().indexOf('msie') !== -1 && document.all) {
          e.cancelBubble = true;
          e.returnValue = false;
        }
        else {
          e.stopPropagation();
        }
      };
    }

    var name;
    for (var ev = 0, l = stop_overlay_events.length; ev < l; ev++) {
      name = stop_overlay_events[ev];
      google.maps.event.addDomListener(el, name, preventOverlayEvents());
    }

    var overlayEvents = ['click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'rightclick'];


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
          subcribeEvent(options[name], overlayText)
        );
      }
    }

    google.maps.event.trigger(this, 'ready');
  };

  overlayText.draw = function() {
    var projection = this.getProjection(),
        pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(options.lat, options.lng));

    options.horizontalOffset = options.horizontalOffset || 0;
    options.verticalOffset = options.verticalOffset || 0;

    var el = overlayText.el,
        content = el.children[0],
        content_height = content.clientHeight,
        content_width = content.clientWidth;

    switch (options.verticalAlign) {
      case 'top':
        el.style.top = (pixel.y - content_height + options.verticalOffset) + 'px';
        break;
      default:
      case 'middle':
        el.style.top = (pixel.y - (content_height / 2) + options.verticalOffset) + 'px';
        break;
      case 'bottom':
        el.style.top = (pixel.y + options.verticalOffset) + 'px';
        break;
    }

    switch (options.horizontalAlign) {
      case 'left':
        el.style.left = (pixel.x - content_width + options.horizontalOffset) + 'px';
        break;
      default:
      case 'center':
        el.style.left = (pixel.x - (content_width / 2) + options.horizontalOffset) + 'px';
        break;
      case 'right':
        el.style.left = (pixel.x + options.horizontalOffset) + 'px';
        break;
    }

    /** TODO: INTEGRATE

    var target = el.firstChild;
    target.style.padding = '0px';
    target.style.margin = '0px';
    target.style.transform = 'none';

    var w = Math.round(el.clientWidth / 2);
    var h = Math.round(el.clientHeight / 2);

    el.style.top = (getPixels(el.style.top) - h) +'px';
    el.style.left = (getPixels(el.style.left) - w) +'px';

    el.style.opacity = 1;
     */
  };

  overlayText.onRemove = function() {
    overlayText.el.parentNode.removeChild(overlayText.el);
    overlayText.el = null;
  };

  this.overlays.push(overlayText);

  return overlayText;
};

GMaps.prototype.removeOverlay = function(overlayText) {
  for (var i = 0, l = this.overlays.length; i < l; i++) {
    if (this.overlays[i] === overlayText) {
      this._teardownChild('overlayText', this.overlays[i]);
      this.overlays.splice(i, 1);
      return true;
    }
  }

  return false;
};

GMaps.prototype.removeOverlays = function() {
  for (var i = 0, l = this.overlays.length; i < l; i++) {
    this._teardownChild('overlayText', this.overlays[i]);
  }

  this.overlays.length = 0;
};
