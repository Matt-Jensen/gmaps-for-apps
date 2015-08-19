describe('Overlays', function() {
  var mapInstance, container, overlay;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-overlays';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-overlays',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    overlay = mapInstance.drawOverlay({
      id: 'overlay-id',
      lat: mapInstance.getCenter().lat(),
      lng: mapInstance.getCenter().lng(),
      layer: 'overlayLayer',
      content: '<div class="overlay">Lima</div>',
      verticalAlign: 'top',
      horizontalAlign: 'center'
    });
  });

  afterAll(function() {
    document.body.removeChild(container);
  });

  describe('creating', function() {
    it('should add the overlay to the overlays collection', function() {
      expect(mapInstance.overlays.length).toEqual(1);
      expect(mapInstance.overlays[0]).toEqual(overlay);
    });

    it('should add the overlay in the current map', function() {
      expect(overlay.getMap()).toEqual(mapInstance.map);
    });

    it('should have the configured id', function() {
      expect(overlay.id).toEqual('overlay-id');
    });
  });

  describe('events', function() {
    var callbacks, context, overlayWithClick;

    beforeAll(function() {
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

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onmousemove').and.callThrough();
      spyOn(callbacks, 'onrightclick').and.callThrough();

      overlayWithClick = mapInstance.drawOverlay({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        content: '<p>Clickable overlay</p>',
        click: callbacks.onclick,
        mousemove: callbacks.onmousemove,
        rightclick: callbacks.onrightclick
      });
    });

    it('should respond to click and maintain method context', function(done) {
      google.maps.event.addListenerOnce(overlayWithClick, 'ready', function () {
        // responds to click event and maintain method context
        google.maps.event.trigger(overlayWithClick.el, 'click');
        expect(callbacks.onclick).toHaveBeenCalled();
        expect(context.passed).toBe(true);

        // binds multiple events
        google.maps.event.trigger(overlayWithClick.el, 'mousemove', {});
        expect(callbacks.onmousemove).toHaveBeenCalled();

        google.maps.event.trigger(overlayWithClick.el, 'rightclick', {});
        expect(callbacks.onrightclick).toHaveBeenCalled();
        done();
      });
    }, 2000);
  });

  describe('removing', function() {
    beforeAll(function() {
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