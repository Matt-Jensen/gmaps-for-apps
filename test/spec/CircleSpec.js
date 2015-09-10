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

        onrightclick: function() {
          return true;
        },

        ondblclick: function() {
          return true;
        },

        ondrag: function() {
          return true;
        },

        ondragend: function() {
          return true;
        },

        ondragstart: function() {
          return true;
        },

        onmousedown: function() {
          return true;
        },

        onmouseout: function() {
          return true;
        },

        onmouseover: function() {
          return true;
        },

        onmousemove: function() {
          return true;
        },

        onmouseup: function() {
          return true;
        },

        onradius_changed: function() {
          return true;
        },

        oncenter_changed: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onrightclick').and.callThrough();
      spyOn(callbacks, 'ondblclick').and.callThrough();
      spyOn(callbacks, 'ondrag').and.callThrough();
      spyOn(callbacks, 'ondragend').and.callThrough();
      spyOn(callbacks, 'ondragstart').and.callThrough();
      spyOn(callbacks, 'onmousedown').and.callThrough();
      spyOn(callbacks, 'onmouseout').and.callThrough();
      spyOn(callbacks, 'onmouseover').and.callThrough();
      spyOn(callbacks, 'onmousemove').and.callThrough();
      spyOn(callbacks, 'onmouseup').and.callThrough();
      spyOn(callbacks, 'onradius_changed').and.callThrough();
      spyOn(callbacks, 'oncenter_changed').and.callThrough();

      circle = mapInstance.addCircle({
        id: 'unique-circle',
        lat : -12.040504866577001,
        lng : -77.02024422636042,
        radius : 350,
        strokeColor : '#432070',
        strokeOpacity : 1,
        strokeWeight : 3,
        fillColor : '#432070',
        fillOpacity : 0.6,
        click: callbacks.onclick,
        rightclick: callbacks.onrightclick,
        dblclick: callbacks.ondblclick,
        drag: callbacks.ondrag,
        dragend: callbacks.ondragend,
        dragstart: callbacks.ondragstart,
        mousedown: callbacks.onmousedown,
        mouseout: callbacks.onmouseout,
        mouseover: callbacks.onmouseover,
        mousemove: callbacks.onmousemove,
        mouseup: callbacks.onmouseup,
        radius_changed: callbacks.onradius_changed,
        center_changed: callbacks.oncenter_changed
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(circle, 'click', {});
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should subscribe all mouse events', function() {
      google.maps.event.trigger(circle, 'rightclick', {});
      google.maps.event.trigger(circle, 'dblclick', {});
      google.maps.event.trigger(circle, 'drag', {});
      google.maps.event.trigger(circle, 'dragend', {});
      google.maps.event.trigger(circle, 'dragstart', {});
      google.maps.event.trigger(circle, 'mouseout', {});
      google.maps.event.trigger(circle, 'mousedown', {});
      google.maps.event.trigger(circle, 'mouseover', {});
      google.maps.event.trigger(circle, 'mousemove', {});
      google.maps.event.trigger(circle, 'mouseup', {});
      google.maps.event.trigger(circle, 'radius_changed', {});
      google.maps.event.trigger(circle, 'center_changed', {});

      expect(callbacks.onrightclick.calls.count()).toEqual(1);
      expect(callbacks.ondblclick.calls.count()).toEqual(1);
      expect(callbacks.ondrag.calls.count()).toEqual(1);
      expect(callbacks.ondragend.calls.count()).toEqual(1);
      expect(callbacks.ondragstart.calls.count()).toEqual(1);
      expect(callbacks.onmousedown.calls.count()).toEqual(1);
      expect(callbacks.onmouseout.calls.count()).toEqual(1);
      expect(callbacks.onmouseover.calls.count()).toEqual(1);
      expect(callbacks.onmousemove.calls.count()).toEqual(1);
      expect(callbacks.onmouseup.calls.count()).toEqual(1);
      expect(callbacks.onradius_changed.calls.count()).toEqual(1);
      expect(callbacks.oncenter_changed.calls.count()).toEqual(1);
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