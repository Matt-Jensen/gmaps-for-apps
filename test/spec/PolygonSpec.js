var paths = [[-12.0403,-77.0337],[-12.040248585302038,-77.03993927003302],[-12.050047116528843,-77.02448169303511],[-12.044804866577001,-77.02154422636042]];

describe('Polygons', function() {
  var mapInstance, polygon;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  describe('creating', function() {
    beforeEach(function() {
      // Add one polygon
      polygon = polygon || mapInstance.drawPolygon({
        paths : paths,
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


  describe('events', function() {
    var callbacks, context;

    beforeEach(function() {
      context = { passed: false };
      callbacks = {
        onclick : function() {
          this.passed = true;
        }.bind(context),

        onmousedown: function() {
          return true;
        },

        onmousemove: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').andCallThrough();
      spyOn(callbacks, 'onmousedown').andCallThrough();
      spyOn(callbacks, 'onmousemove').andCallThrough();

      polygon = mapInstance.drawPolygon({
        paths : paths,
        strokeColor: '#25D359',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#25D359',
        fillOpacity: 0.6,
        click: callbacks.onclick,
        mousedown: callbacks.onmousedown,
        mousemove: callbacks.onmousemove
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(polygon, 'click', {});
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should bind multiple events', function() {
      google.maps.event.trigger(polygon, 'mousedown', {});
      expect(callbacks.onmousedown).toHaveBeenCalled();

      google.maps.event.trigger(polygon, 'mousemove', {});
      expect(callbacks.onmousemove).toHaveBeenCalled();
    });
  });


  describe('removing', function() {
    beforeEach(function() {
      // Continuously add polygons
      mapInstance.drawPolygon({
        paths : paths,
        strokeColor : '#25D359',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#25D359',
        fillOpacity : 0.6
      });
    });

    it('should remove one polygon from collection w/ removePolygon', function() {
      var originalLength = mapInstance.polygons.length;
      mapInstance.removePolygon(polygon);
      expect(mapInstance.polygons.length).toBeLessThan(originalLength);
      expect(polygon.getMap()).toBeNull();
    });

    it('should remove all polygons from collection w/ removePolygons', function() {
      mapInstance.removePolygons();
      expect(mapInstance.polygons.length).toEqual(0);
    });
  });
});