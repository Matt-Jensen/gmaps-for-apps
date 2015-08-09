describe('GMaps Polylines', function() {
  var mapInstance, polyline;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe('Creation', function() {
    beforeEach(function() {
      polyline = polyline || mapInstance.drawPolyline({
        path : [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6
      });
    });

    it('should add the polyline to the polylines collection', function() {
      expect(mapInstance.polylines.length).toEqual(1);
      expect(mapInstance.polylines[0]).toEqual(polyline);
    });

    it('should be added in the current map', function() {
      expect(polyline.getMap()).toEqual(mapInstance.map);
    });

    it('should return the defined path', function() {
      var firstPoint = polyline.getPath().getAt(0);

      expect(parseFloat(firstPoint.lat().toFixed(4))).toEqual(-12.0440);
      expect(parseFloat(firstPoint.lng().toFixed(4))).toEqual(-77.0247);
    });
  });

  describe('Removal', function() {
    beforeEach(function() {
      // Continue to add polylines
      mapInstance.drawPolyline({
        path : [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6
      });
    });

    it('should remove one polyline from collection w/ removePolyline', function() {
      mapInstance.removePolyline(polyline);
      expect(mapInstance.polylines.length).toEqual(1);
      expect(polyline.getMap()).toBeNull();
    });

    it('should removal all polyline from collection w/ removePolylines', function() {
      mapInstance.removePolylines();
      expect(mapInstance.polylines.length).toEqual(0);
    });
  });
});