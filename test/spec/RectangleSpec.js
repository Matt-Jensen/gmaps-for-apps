describe('GMaps rectangles', function() {
  var mapInstance, rectangle;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe('creation', function() {
    beforeEach(function() {
      rectangle = rectangle || mapInstance.drawRectangle({
        bounds : [[-12.0303,-77.0237],[-12.0348,-77.0115]],
        strokeColor : '#BBD8E9',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#BBD8E9',
        fillOpacity : 0.6
      });
    });

    it('should add the rectangle to the polygons collection', function() {
      expect(mapInstance.rectangles.length).toEqual(1);
      expect(mapInstance.rectangles[0]).toEqual(rectangle);
    });

    it('should be added in the current map', function() {
      expect(rectangle.getMap()).toEqual(mapInstance.map);
    });

    it('should have the defined bounds', function() {
      // Fix for floating-point bug
      var SWLat = parseFloat(rectangle.getBounds().getSouthWest().lat().toFixed(4));
      var SWLng = parseFloat(rectangle.getBounds().getSouthWest().lng().toFixed(4));

      var NELat = parseFloat(rectangle.getBounds().getNorthEast().lat().toFixed(4));
      var NELng = parseFloat(rectangle.getBounds().getNorthEast().lng().toFixed(4));

      expect(SWLat).toEqual(-12.0303);
      expect(SWLng).toEqual(-77.0237);
      expect(NELat).toEqual(-12.0348);
      expect(NELng).toEqual(-77.0115);
    });
  });


  describe('events', function() {
    var callbacks, context;

    beforeEach(function() {
      context = { passed: false };
      callbacks = {
        onclick : function() {
          this.passed = true;
        }.bind(context)
      };

      spyOn(callbacks, 'onclick').andCallThrough();

      rectangle = mapInstance.drawRectangle({
        bounds : [[-12.0303,-77.0237],[-12.0348,-77.0115]],
        strokeColor : '#BBD8E9',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#BBD8E9',
        fillOpacity : 0.6,
        click: callbacks.onclick
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(rectangle, 'click', {});
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });
  });


  describe('removal', function() {
    beforeEach(function() {
      rectangle = rectangle || mapInstance.drawRectangle({
        bounds : [[-12.0303,-77.0237],[-12.0348,-77.0115]],
        strokeColor : '#BBD8E9',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#BBD8E9',
        fillOpacity : 0.6
      });
    });

    it('should remove the rectangle from the polygons collection', function() {
      var originalLength = mapInstance.rectangles.length;
      mapInstance.removeRectangle(rectangle);
      expect(mapInstance.rectangles.length).toBeLessThan(originalLength);
      expect(rectangle.getMap()).toBeNull();
    });
  });
});