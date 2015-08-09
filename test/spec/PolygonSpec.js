describe('GMap Polygons', function() {
  var mapInstance, polygon;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe('Creating', function() {
    beforeEach(function() {
      // Add one polygon
      polygon = polygon || mapInstance.drawPolygon({
        paths : [[-12.0403,-77.0337],[-12.0402,-77.0399],[-12.0500,-77.0244],[-12.0448,-77.0215]],
        strokeColor : '#25D359',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#25D359',
        fillOpacity : 0.6
      });
    });

    it('should add the polygon to the polygons collection', function() {
      expect(mapInstance.polygons.length).toEqual(1);
      expect(mapInstance.polygons[0]).toEqual(polygon);
    });

    it('should be added in the current map', function() {
      expect(polygon.getMap()).toEqual(mapInstance.map);
    });

    it('should return the defined path', function() {
      var firstPoint = polygon.getPath().getAt(0);

      expect(parseFloat(firstPoint.lat().toFixed(4))).toEqual(-12.0403);
      expect(parseFloat(firstPoint.lng().toFixed(4))).toEqual(-77.0337);
    });
  });

  describe('Removing', function() {
    beforeEach(function() {
      // Continuously add polygons
      mapInstance.drawPolygon({
        paths : [[-12.0403,-77.0337],[-12.0402,-77.0399],[-12.0500,-77.0244],[-12.0448,-77.0215]],
        strokeColor : '#25D359',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#25D359',
        fillOpacity : 0.6
      });
    });

    it('should remove one polygon from collection w/ removePolygon', function() {
      mapInstance.removePolygon(polygon);
      expect(mapInstance.polygons.length).toEqual(1);
      expect(polygon.getMap()).toBeNull();
    });

    it('should remove all polygons from collection w/ removePolygons', function() {
      mapInstance.removePolygons();
      expect(mapInstance.polygons.length).toEqual(0);
    });
  });
});