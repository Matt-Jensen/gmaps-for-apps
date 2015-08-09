describe('GMap circles', function() {
  var mapInstance, circle;

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
      circle = circle || mapInstance.drawCircle({
        lat : -12.040504866577001,
        lng : -77.02024422636042,
        radius : 350,
        strokeColor : '#432070',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#432070',
        fillOpacity : 0.6
      });
    });

    it('should add the circle to the polygons collection', function() {
      expect(mapInstance.circles.length).toEqual(1);
      expect(mapInstance.circles[0]).toEqual(circle);
    });

    it('should be added in the current map', function() {
      expect(circle.getMap()).toEqual(mapInstance.map);
    });

    it('should have the defined radius', function() {
      expect(circle.getRadius()).toEqual(350);
    });
  });

  describe('Removing', function() {
    beforeEach(function() {
      circle = circle || mapInstance.drawCircle({
        lat : -12.040504866577001,
        lng : -77.02024422636042,
        radius : 350,
        strokeColor : '#432070',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#432070',
        fillOpacity : 0.6
      });
    });

    it('should remove the circle from the circles collection', function() {
      mapInstance.removeCircle(circle);
      expect(mapInstance.circles.length).toEqual(0);
      expect(circle.getMap()).toBeNull();
    });
  });
});