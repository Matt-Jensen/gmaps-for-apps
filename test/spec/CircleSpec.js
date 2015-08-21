describe('GMap circles', function() {
  var mapInstance, container, circle;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-circles';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-circles',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('Creating', function() {
    beforeAll(function() {
      circle = mapInstance.addCircle({
        id: 'circle-id',
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

    it('should have the configured id', function() {
      expect(circle.id).toBe('circle-id');
    });
  });

  describe('Events', function() {
    var callbacks, context;

    beforeAll(function() {
      context = { passed: false };
      callbacks = {
        onclick: function() {
          this.passed = true;
        }.bind(context),

        onmousemove: function() {
          return true;
        },

        onmouseout: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onmousemove').and.callThrough();
      spyOn(callbacks, 'onmouseout').and.callThrough();

      circle = mapInstance.addCircle({
        lat : -12.040504866577001,
        lng : -77.02024422636042,
        radius : 350,
        strokeColor : '#432070',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#432070',
        fillOpacity : 0.6,
        details: {
          id: 'rosebud'
        },
        click : callbacks.onclick,
        mousemove : callbacks.onmousemove,
        mouseout : callbacks.onmouseout
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(circle, 'click', {});
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should bind multiple events', function() {
      google.maps.event.trigger(circle, 'mousemove', {});
      expect(callbacks.onmousemove).toHaveBeenCalled();

      google.maps.event.trigger(circle, 'mouseout', {});
      expect(callbacks.onmouseout).toHaveBeenCalled();
    });
  });

  describe('Removing', function() {
    beforeEach(function() {
      // Continuously add circles
      circle = mapInstance.addCircle({
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
      var originalLength = mapInstance.circles.length;
      mapInstance.removeCircle(circle);
      expect(mapInstance.circles.length).toBeLessThan(originalLength);
      expect(circle.getMap()).toBeNull();
    });

    it('should remove the circle from the circles collection', function() {
      mapInstance.removeCircles();
      expect(mapInstance.circles.length).toBe(0);
    });
  });
});