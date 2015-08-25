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

    overlay = mapInstance.addOverlay({
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
    mapInstance.destroy();
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
    var callbacks, context, overlayWithEvents;

    beforeAll(function() {
      context = { passed: false };
      callbacks = {
        onclick: function() {
          this.passed = true;
        }.bind(context),

        onrightclick: function() {
          return true;
        },

        ondblclick: function() {
          return true;
        },

        ondrag: function() {
          return true;
        },

        ondragend: function() {
          return true;
        },

        ondragstart: function() {
          return true;
        },

        onmousedown: function() {
          return true;
        },

        onmouseout: function() {
          return true;
        },

        onmouseover: function() {
          return true;
        },

        onmousemove: function() {
          return true;
        },

        onmouseup: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onrightclick').and.callThrough();
      spyOn(callbacks, 'ondblclick').and.callThrough();
      spyOn(callbacks, 'ondrag').and.callThrough();
      spyOn(callbacks, 'ondragend').and.callThrough();
      spyOn(callbacks, 'ondragstart').and.callThrough();
      spyOn(callbacks, 'onmousedown').and.callThrough();
      spyOn(callbacks, 'onmouseout').and.callThrough();
      spyOn(callbacks, 'onmouseover').and.callThrough();
      spyOn(callbacks, 'onmousemove').and.callThrough();
      spyOn(callbacks, 'onmouseup').and.callThrough();

      overlayWithEvents = mapInstance.addOverlay({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        content: '<p>Clickable overlay</p>',
        click: callbacks.onclick,
        rightclick: callbacks.onrightclick,
        dblclick: callbacks.ondblclick,
        drag: callbacks.ondrag,
        dragend: callbacks.ondragend,
        dragstart: callbacks.ondragstart,
        mousedown: callbacks.onmousedown,
        mouseout: callbacks.onmouseout,
        mouseover: callbacks.onmouseover,
        mousemove: callbacks.onmousemove,
        mouseup: callbacks.onmouseup
      });
    });

    it('should respond to all mouse events and maintain method context', function(done) {
      google.maps.event.addListenerOnce(overlayWithEvents, 'ready', function () {

        google.maps.event.trigger(overlayWithEvents.el, 'click', {});
        google.maps.event.trigger(overlayWithEvents.el, 'rightclick', {});
        google.maps.event.trigger(overlayWithEvents.el, 'dblclick', {});
        google.maps.event.trigger(overlayWithEvents.el, 'drag', {});
        google.maps.event.trigger(overlayWithEvents.el, 'dragend', {});
        google.maps.event.trigger(overlayWithEvents.el, 'dragstart', {});
        google.maps.event.trigger(overlayWithEvents.el, 'mousedown', {});
        google.maps.event.trigger(overlayWithEvents.el, 'mouseout', {});
        google.maps.event.trigger(overlayWithEvents.el, 'mouseover', {});
        google.maps.event.trigger(overlayWithEvents.el, 'mousemove', {});
        google.maps.event.trigger(overlayWithEvents.el, 'mouseup', {});

        // responds to click event and maintain method context
        expect(context.passed).toBe(true);

        expect(callbacks.onclick.calls.count()).toEqual(1);
        expect(callbacks.onrightclick.calls.count()).toEqual(1);
        expect(callbacks.ondblclick.calls.count()).toEqual(1);
        expect(callbacks.ondrag.calls.count()).toEqual(1);
        expect(callbacks.ondragend.calls.count()).toEqual(1);
        expect(callbacks.ondragstart.calls.count()).toEqual(1);
        expect(callbacks.onmousedown.calls.count()).toEqual(1);
        expect(callbacks.onmouseout.calls.count()).toEqual(1);
        expect(callbacks.onmouseover.calls.count()).toEqual(1);
        expect(callbacks.onmousemove.calls.count()).toEqual(1);
        expect(callbacks.onmouseup.calls.count()).toEqual(1);

        done();
      });
    }, 5000);
  });

  describe('removing', function() {
    beforeAll(function() {
      // continually add overlays
      overlay = mapInstance.addOverlay({
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