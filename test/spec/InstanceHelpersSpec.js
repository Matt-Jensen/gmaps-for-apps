describe('Instance Helpers', function () {
  var container, mapInstance;
  var result;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'instance-helpers-map';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#instance-helpers-map',
      lat: -12.0433,
      lng: -77.0283,
      zoom: 12
    });
  });

  afterAll(function() {
    document.body.removeChild(container);
  });

  describe('geocode', function() {
    it('should call callback once geocode returns results & status', function(done) {
      result = mapInstance.geocode({
        address: 'Legoland California Resort',
        callback: function(results, status) {
          var latLng = results[0].geometry.location;
          expect(status).toBe('OK');
          expect(latLng.lat()).toBe(33.1265294);
          expect(latLng.lng()).toBe(-117.3115977);
          done();
        }
      });
    }, 10000);
  });

  describe('addDelegatedEvent', function() {
    var infoWindow, delegatedEvent, callbacks;

    beforeAll(function() {
      // Add one info window
      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        content: '<h1>test</h1>'
      });

      callbacks = {
        onclick: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();

      delegatedEvent = mapInstance.addDelegatedEvent(
        'click',
        '#'+infoWindow._id,
        callbacks.onclick
      );
    });

    it('should add an event listener to the base map element', function(done) {
      window.setTimeout(function() {
        document.getElementById(infoWindow._id).click();

        window.setTimeout(function() {
          expect(callbacks.onclick).toHaveBeenCalled();
          done();
        });
      }, 100);
    }, 5000);

    it('should provide a method that removes delegated event', function(done) {
      //////////////////////////
      delegatedEvent.remove();
      /////////////////////////

      document.getElementById(infoWindow._id).click();
      window.setTimeout(function() {
        expect(callbacks.onclick.calls.count()).toBe(1);
        done();
      }, 10);
    }, 5000);
  });


  describe('hasMapChild', function() {
    var infoWindow, marker;

    beforeAll(function() {
      // Add one info window
      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        content: '<h1>test</h1>'
      });

      marker = mapInstance.addMarker({
        lat : -12.0533,
        lng: -77.0293,
        title : 'New marker',
        details: {
          id: 'record-id'
        }
      });
    });

    it('should return true for the infoWindow instance w/ dashed type', function() {
      expect(mapInstance.hasChild(infoWindow, 'info-windows')).toBe(true);
    });

    it('should return true for details.id string w/ singular type', function() {
      expect(mapInstance.hasChild(marker.details.id, 'marker')).toBe(true);
    });
  });

  describe('_teardownChild', function() {
    var originalGoogleClearInstanceListeners;
    var infoWindow;
    var delegatedEvent;

    beforeAll(function() {
      originalGoogleClearInstanceListeners = google.maps.event.clearInstanceListeners;
      spyOn(google.maps.event, 'clearInstanceListeners');
    });

    afterAll(function() {
      google.maps.event.clearInstanceListeners = originalGoogleClearInstanceListeners;
    });

    beforeEach(function() {
      infoWindow = mapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        content: '<h1>test</h1>',
        click: function() {} // creates delegated event
      });

      delegatedEvent = infoWindow.delegatedEvents[0];

      spyOn(infoWindow, 'setMap').and.callThrough();
      spyOn(delegatedEvent, 'remove').and.callThrough();
    });

    it('should remove all instance events and delink map', function() {
      mapInstance._teardownChild('info_window', infoWindow);
      expect(google.maps.event.clearInstanceListeners).toHaveBeenCalledWith(infoWindow);
      expect(delegatedEvent.remove).toHaveBeenCalled();
      expect(infoWindow.setMap).toHaveBeenCalledWith(null);
      expect(infoWindow.delegatedEvents.length).toBe(0);
    });

    it('should fire a GMaps event with correct parameters', function(done) {
      var callbacks = {
        infoWindowRemoved: function() {}
      };

      spyOn(callbacks, 'infoWindowRemoved').and.callThrough();

      GMaps.on('info_window_removed', mapInstance, callbacks.infoWindowRemoved);

      mapInstance._teardownChild('info_window', infoWindow);

      window.setTimeout(function() {
        expect(callbacks.infoWindowRemoved).toHaveBeenCalled();
        done();
      });
    }, 100);
  });
});