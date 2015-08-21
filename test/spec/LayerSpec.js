describe('Layers', function() {
  var container, mapInstance, singleLayer, multipleLayers = [];

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-layers';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-layers',
      lat: -12.0433,
      lng: -77.0283,
      zoom: 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('creating single', function() {
    beforeAll(function() {
      singleLayer = mapInstance.addLayer('traffic');
    })

    it('should be added in the current map', function() {
      expect(singleLayer.getMap()).toEqual(mapInstance.map);
    });

    it('should be removed from the current map', function() {
      mapInstance.removeLayer('traffic');
      
      expect(singleLayer.getMap()).toBeNull();
    });
  });

  describe('creating multiple', function() {
    beforeAll(function() {
      multipleLayers.push(mapInstance.addLayer('transit'));
      multipleLayers.push(mapInstance.addLayer('bicycling'));
    });

    it('should be added in the current map', function() {
      expect(multipleLayers[0].getMap()).toEqual(mapInstance.map);
      expect(multipleLayers[1].getMap()).toEqual(mapInstance.map);
    });
    
    it('should be removed from the current map', function() {
      mapInstance.removeLayer('transit');
      mapInstance.removeLayer('bicycling');

      expect(multipleLayers[0].getMap()).toBeNull();
      expect(multipleLayers[1].getMap()).toBeNull();
    });
  });

  describe('removing all', function() {
    beforeEach(function() {
      // Continuously add
      mapInstance.addLayer('transit');
    });

    it('should remove all layers from store /w removeLayers', function() {
      mapInstance.removeLayers();
      expect(mapInstance.layers.length).toBe(0);
      expect(mapInstance.singleLayers.transit).toBeUndefined();
    });
  });
});