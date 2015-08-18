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
    document.body.removeChild(container);
  });

  describe('Creating', function() {
    beforeAll(function() {

     // Add one info window
     infoWindow = mapInstance.addInfoWindow({
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
  });

  describe('Events', function() {
    var callbacks, context;

    beforeEach(function() {
      context = { passed: false };
      callbacks = {
        onclick: function() {
          this.passed = true;
        },

        onmousemove: function() {
          return true;
        },

        oncloseclick: function() {
          context.passed = true;
        }.bind(context)
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onmousemove').and.callThrough();
      spyOn(callbacks, 'oncloseclick').and.callThrough();

      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        click : callbacks.onclick,
        mousemove : callbacks.onmousemove,
        closeclick : callbacks.oncloseclick
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(infoWindow, 'closeclick', {});
      expect(callbacks.oncloseclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should bind delegated events', function(done) {
      infoWindow.click();
      infoWindow.mousemove();
      window.setTimeout(function () {
        expect(infoWindow.delegatedEvents.length).toBe(2);
        expect(callbacks.onmousemove).toHaveBeenCalled();
        expect(callbacks.onclick).toHaveBeenCalled();
        done();
      });
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