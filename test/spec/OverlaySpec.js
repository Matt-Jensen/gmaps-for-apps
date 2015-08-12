describe('Overlays', function() {
  var mapInstance, overlay;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-overlays',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    overlay = overlay || mapInstance.drawOverlay({
      lat: mapInstance.getCenter().lat(),
      lng: mapInstance.getCenter().lng(),
      layer: 'overlayLayer',
      content: '<div class="overlay">Lima</div>',
      verticalAlign: 'top',
      horizontalAlign: 'center'
    });
  });

  it('should add the overlay to the overlays collection', function() {
    expect(mapInstance.overlays.length).toEqual(1);
    expect(mapInstance.overlays[0]).toEqual(overlay);
  });

  it('should add the overlay in the current map', function() {
    expect(overlay.getMap()).toEqual(mapInstance.map);
  });

  describe('events', function() {
    var callbacks, context, overlayWithClick;

    beforeEach(function() {
      context = { passed: false };
      callbacks = {
        onclick: function() {
          this.passed = true;
        }.bind(context),

        onmousemove: function() {
          return true;
        },

        onrightclick: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').andCallThrough();
      spyOn(callbacks, 'onmousemove').andCallThrough();
      spyOn(callbacks, 'onrightclick').andCallThrough();

      overlayWithClick = mapInstance.drawOverlay({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        content: '<p>Clickable overlay</p>',
        click: callbacks.onclick,
        mousemove: callbacks.onmousemove,
        rightclick: callbacks.onrightclick
      });
    });

    it('should respond to click and maintain method context', function() {
      var domIsReady = false;

      google.maps.event.addListenerOnce(overlayWithClick, 'ready', function () {
        domIsReady = true;
      });

      waitsFor(function () {
        return domIsReady;
      }, 'the overlay\'s DOM element to be ready', 10000);

      runs(function () {
        // responds to click event and maintain method context
        google.maps.event.trigger(overlayWithClick.el, 'click');
        expect(callbacks.onclick).toHaveBeenCalled();
        expect(context.passed).toBe(true);
      });

      runs(function() {
        // binds multiple events
        google.maps.event.trigger(overlayWithClick.el, 'mousemove', {});
        expect(callbacks.onmousemove).toHaveBeenCalled();

        google.maps.event.trigger(overlayWithClick.el, 'rightclick', {});
        expect(callbacks.onrightclick).toHaveBeenCalled();
      });
    });
  });

  describe('removing', function() {
    beforeEach(function() {
      // continually add overlays
      overlay = mapInstance.drawOverlay({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        content: '<p>Clickable overlay</p>'
      });
    });

    it('should remove a single overlay from the overlays store /w removeOverlay', function() {
      var originalLength = mapInstance.overlays.length;
      mapInstance.removeOverlay(overlay);
      expect(mapInstance.overlays.length).toBeLessThan(originalLength);
    });

    it('should remove all overlays from the overlays store /w removeOverlays', function() {
      mapInstance.removeOverlays();
      expect(mapInstance.overlays.length).toEqual(0);
    });
  });
});