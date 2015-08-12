describe('Adding layers', function() {
  var mapInstance, singleLayer, multipleLayers = [];

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-layers',
      lat: -12.0433,
      lng: -77.0283,
      zoom: 12
    });
  });

  describe('Single layer', function() {
    beforeEach(function() {
      singleLayer = singleLayer || mapInstance.addLayer('traffic');
    })

    it('should be added in the current map', function() {
      expect(singleLayer.getMap()).toEqual(mapInstance.map);
    });

    it('should be removed from the current map', function() {
      mapInstance.removeLayer('traffic');
      
      expect(singleLayer.getMap()).toBeNull();
    });
  });

  describe('Multiple layers', function() {
    beforeEach(function() {
      if (multipleLayers.length === 0) {
        multipleLayers.push(mapInstance.addLayer('transit'));
        multipleLayers.push(mapInstance.addLayer('bicycling'));
      }
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
});