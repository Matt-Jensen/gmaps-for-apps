var paths = [[-12.0403,-77.0337],[-12.040248585302038,-77.03993927003302],[-12.050047116528843,-77.02448169303511],[-12.044804866577001,-77.02154422636042]];
var container;

describe('Polygons', function() {
  var mapInstance, polygon;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-polygons';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-polygons',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('creating', function() {
    beforeAll(function() {
      polygon = mapInstance.addPolygon({
        id: 'polygon-id',
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

    it('should have the configured id', function() {
      expect(polygon.id).toEqual('polygon-id')
    });
  });


  describe('events', function() {
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

        onset_at: function() {
          return true;
        },

        oninsert_at: function() {
          return true;
        },

        onremove_at: function() {
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
      spyOn(callbacks, 'onset_at').and.callThrough();
      spyOn(callbacks, 'oninsert_at').and.callThrough();
      spyOn(callbacks, 'onremove_at').and.callThrough();

      polygon = mapInstance.addPolygon({
        paths : paths,
        draggable: true,
        strokeColor: '#25D359',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#25D359',
        fillOpacity: 0.6,
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
        set_at: callbacks.onset_at,
        insert_at: callbacks.oninsert_at,
        remove_at: callbacks.onremove_at
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(polygon, 'click', {});
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should subscribe all mouse events', function() {
      google.maps.event.trigger(polygon, 'rightclick', {});
      google.maps.event.trigger(polygon, 'dblclick', {});
      google.maps.event.trigger(polygon, 'drag', {});
      google.maps.event.trigger(polygon, 'dragend', {});
      google.maps.event.trigger(polygon, 'dragstart', {});
      google.maps.event.trigger(polygon, 'mousedown', {});
      google.maps.event.trigger(polygon, 'mouseover', {});
      // google.maps.event.trigger(polygon, 'mouseout', {}); // throws error
      google.maps.event.trigger(polygon, 'mousemove', {});
      google.maps.event.trigger(polygon, 'mouseup', {});
      google.maps.event.trigger(polygon.getPath(), 'set_at', {});
      google.maps.event.trigger(polygon.getPath(), 'insert_at', {});
      google.maps.event.trigger(polygon.getPath(), 'remove_at', {});

      expect(callbacks.onrightclick.calls.count()).toEqual(1);
      expect(callbacks.ondblclick.calls.count()).toEqual(1);
      expect(callbacks.ondrag.calls.count()).toEqual(1);
      expect(callbacks.ondragend.calls.count()).toEqual(1);
      expect(callbacks.ondragstart.calls.count()).toEqual(1);
      expect(callbacks.onmousedown.calls.count()).toEqual(1);
      expect(callbacks.onmouseover.calls.count()).toEqual(1);
      // expect(callbacks.onmouseout.calls.count()).toEqual(1);
      expect(callbacks.onmousemove.calls.count()).toEqual(1);
      expect(callbacks.onmouseup.calls.count()).toEqual(1);
      expect(callbacks.onset_at.calls.count()).toEqual(1);
      expect(callbacks.oninsert_at.calls.count()).toEqual(1);
      expect(callbacks.onremove_at.calls.count()).toEqual(1);
    });
  });


  describe('removing', function() {
    beforeEach(function() {
      // Continuously add polygons
      mapInstance.addPolygon({
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