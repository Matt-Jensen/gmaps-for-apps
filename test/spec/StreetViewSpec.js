describe('Create a Street View Panorama', function() {
  var mapWithStreetview, container, attachedPanorama, standalonePanorama, panoramaWithEvents;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-streetview';
    container.className = 'map';
    document.body.appendChild(container);

    mapWithStreetview = new GMaps({
      el : '#map-with-streetview',
      lat : 42.3455,
      lng : -71.0983,
      zoom : 12
    });
  });

  afterAll(function() {
    mapWithStreetview.destroy();
    document.body.removeChild(container);
  });

  describe('Standalone', function() {
    beforeAll(function() {
      standalonePanorama = GMaps.createPanorama({
        el : '#streetview-standalone-panorama',
        lat : 42.3455,
        lng : -71.0983,
        pov : {
          heading : 60,
          pitch : -10,
          zoom : 1
        }
      });
    });

    it('should create a Street View panorama', function() {
      expect(standalonePanorama).toBeDefined();
    });
  });

  describe('Attached to the current map', function() {
    beforeAll(function() {
      attachedPanorama = attachedPanorama || mapWithStreetview.createPanorama({
        el : '#streetview-panorama',
        pov : {
          heading : 60,
          pitch : -10,
          zoom : 1
        }
      });
    });

    it('should be equal to the current map Street View panorama', function() {
      expect(mapWithStreetview.getStreetView()).toEqual(attachedPanorama);
    });
  });

  describe('With events', function() {
    var callbacks;

    beforeAll(function() {
      callbacks = {
        onpovchanged : function() {
          return true;
        }
      };

      spyOn(callbacks, 'onpovchanged').and.callThrough();

      panoramaWithEvents = GMaps.createPanorama({
        el : '#streetview-with-events',
        lat : 42.3455,
        lng : -71.0983,
        pov : {
          heading : 60,
          pitch : -10,
          zoom : 1
        },
        pov_changed : callbacks.onpovchanged
      });
    });

    it('should respond to pov_changed event', function() {
      panoramaWithEvents.setPov({
        heading : 80,
        pitch : -10,
        zoom : 1
      });

      expect(callbacks.onpovchanged).toHaveBeenCalled();
    });
  });
});