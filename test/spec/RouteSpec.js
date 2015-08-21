describe('Routes', function() {
  var mapInstance, container;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-routes';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-routes',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('Drawing a route', function() {
    it('should add a line in the current map', function(done) {
      mapInstance.addRoute({
        origin : [-12.044012922866312, -77.02470665341184],
        destination : [-12.090814532191756, -77.02271108990476],
        travelMode : 'driving',
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6,
        callback : function() {
          expect(mapInstance.polylines.length).toEqual(1);
          expect(mapInstance.polylines[0].get('strokeColor')).toEqual('#131540');
          expect(mapInstance.polylines[0].get('strokeOpacity')).toEqual(0.6);
          expect(mapInstance.polylines[0].getMap()).toEqual(mapInstance.map);
          done();
        }
      });
    }, 2000);
  });

  describe('Getting routes', function() {
    it('should return an array of routes', function(done) {
      mapInstance.getRoutes({
        origin : 'grand central station, new york, ny',
        destination : '350 5th Ave, New York, NY, 10118',
        callback : function(routes) {
          expect(routes).toBeDefined();
          expect(mapInstance.routes).toEqual(routes);

          if (routes.length > 0) {
            expect(routes[0].legs[0].distance).toBeDefined();
            expect(routes[0].legs[0].duration).toBeDefined();
          }

          done();
        }
      });
    }, 2000);
  });
});