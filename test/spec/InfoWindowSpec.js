describe('GMap Info Window', function() {
  var mapInstance, infoWindow;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-info-windows',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe('Creating', function() {
    beforeEach(function() {

     // Add one info window
     infoWindow = infoWindow || mapInstance.addInfoWindow({
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

      spyOn(callbacks, 'onclick').andCallThrough();
      spyOn(callbacks, 'onmousemove').andCallThrough();
      spyOn(callbacks, 'oncloseclick').andCallThrough();

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

    it('should bind delegated events', function() {
      infoWindow.click();
      infoWindow.mousemove();
      runs(function () {
        expect(infoWindow.delegatedEvents.length).toBe(2);
        expect(callbacks.onmousemove).toHaveBeenCalled();
        expect(callbacks.onclick).toHaveBeenCalled();
      });
    });
  });

  describe('Removing', function() {
    beforeEach(function() {
      // Continuously add circles
      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168
      });
    });

    it('should remove the info window + delegated events from the info window store', function() {
      var originalLength = mapInstance.infoWindows.length;
      mapInstance.removeInfoWindow(infoWindow);
      expect(mapInstance.infoWindows.length).toBeLessThan(originalLength);
      expect(infoWindow.getMap()).toBeNull();
      expect(infoWindow.delegatedEvents.length).toBe(0);
    });

    it('should remove all the info windows from the infoWindows store', function() {
      mapInstance.removeInfoWindows();
      runs(function() {
        expect(mapInstance.infoWindows.length).toBe(0);
      });
    });
  });
});