describe('GMap Info Window', function() {
  var mapInstance, infoWindow, container;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-info-windows';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-info-windows',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('Creating', function() {
    beforeAll(function() {

     // Add one info window
     infoWindow = mapInstance.addInfoWindow({
        id: 'info-window-id',
        lat: 34.54148095772571,
        lng: -112.47004508972168
      });
    });

    it('should add the info window to the infoWindows store', function() {
      expect(mapInstance.infoWindows.length).toEqual(1);
      expect(mapInstance.infoWindows[0]).toEqual(infoWindow);
    });

    it('should be added in the current map', function() {
      expect(infoWindow.getMap()).toEqual(mapInstance.map);
    });

    it('should have the defined content', function() {
      expect(infoWindow.getContent()).toBeTruthy();
    });

    it('should have the configured id', function() {
      expect(infoWindow.id).toEqual('info-window-id');
    });
  });

  describe('Events', function() {
    var callbacks, context;

    beforeEach(function() {
      context = { passed: false };
      callbacks = {
        onclick: function() {
          this.passed = true;
        },

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
        },

        oncloseclick: function() {
          context.passed = true;
        }.bind(context)
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
      spyOn(callbacks, 'oncloseclick').and.callThrough();

      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        click : callbacks.onclick,
        rightclick: callbacks.onrightclick,
        dblclick: callbacks.ondblclick,
        drag: callbacks.ondrag,
        dragend: callbacks.ondragend,
        dragstart: callbacks.ondragstart,
        mousedown: callbacks.onmousedown,
        mouseout: callbacks.onmouseout,
        mouseover: callbacks.onmouseover,
        mousemove : callbacks.onmousemove,
        mouseup : callbacks.onmouseup,
        closeclick : callbacks.oncloseclick
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(infoWindow, 'closeclick', {});
      expect(callbacks.oncloseclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should bind all mouse events as delegated events', function(done) {
      infoWindow.click();
      infoWindow.rightclick();
      infoWindow.dblclick();
      infoWindow.drag();
      infoWindow.dragend();
      infoWindow.dragstart();
      infoWindow.mousedown();
      infoWindow.mouseout();
      infoWindow.mouseover();
      infoWindow.mousemove();
      infoWindow.mouseup();
      window.setTimeout(function () {
        expect(infoWindow.delegatedEvents.length).toBe(11);
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
      }, 10);
    }, 100);
  });

  describe('Removing', function() {
    beforeEach(function() {
      // Continuously add circles
      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168
      });
    });

    it('should remove info window + delegated events from store', function() {
      var originalLength = mapInstance.infoWindows.length;
      mapInstance.removeInfoWindow(infoWindow);
      expect(mapInstance.infoWindows.length).toBeLessThan(originalLength);
      expect(infoWindow.getMap()).toBeNull();
      expect(infoWindow.delegatedEvents.length).toBe(0);
    });

    it('should remove all info windows from infoWindows store', function(done) {
      mapInstance.removeInfoWindows();
      window.setTimeout(function() {
        expect(mapInstance.infoWindows.length).toBe(0);
        done();
      });
    }, 100);
  });
});