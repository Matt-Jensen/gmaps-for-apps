var path = [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]];

describe('GMaps Polylines', function() {
  var mapInstance, container, polyline;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-polylines';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-polylines',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('creation', function() {
    beforeAll(function() {
      polyline = mapInstance.addPolyline({
        id: 'polyline-id',
        path : path,
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

    it('should have the configured id', function() {
      expect(polyline.id).toEqual('polyline-id');
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

      polyline = mapInstance.addPolyline({
        path: path,
        strokeColor: '#131540',
        strokeOpacity: 0.6,
        strokeWeight: 6,
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
      google.maps.event.trigger(polyline, 'click', {});
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should subscribe multiple events', function() {
      google.maps.event.trigger(polyline, 'rightclick', {});
      google.maps.event.trigger(polyline, 'dblclick', {});
      google.maps.event.trigger(polyline, 'drag', {});
      google.maps.event.trigger(polyline, 'dragend', {});
      google.maps.event.trigger(polyline, 'dragstart', {});
      google.maps.event.trigger(polyline, 'mousedown', {});
      // google.maps.event.trigger(polyline, 'mouseout', {}); // Triggers google error
      google.maps.event.trigger(polyline, 'mouseover', {});
      google.maps.event.trigger(polyline, 'mousemove', {});
      google.maps.event.trigger(polyline, 'mouseup', {});
      google.maps.event.trigger(polyline.getPath(), 'set_at', {});
      google.maps.event.trigger(polyline.getPath(), 'insert_at', {});
      google.maps.event.trigger(polyline.getPath(), 'remove_at', {});

      expect(callbacks.onrightclick.calls.count()).toEqual(1);
      expect(callbacks.ondblclick.calls.count()).toEqual(1);
      expect(callbacks.ondrag.calls.count()).toEqual(1);
      expect(callbacks.ondragend.calls.count()).toEqual(1);
      expect(callbacks.ondragstart.calls.count()).toEqual(1);
      expect(callbacks.onmousedown.calls.count()).toEqual(1);
      // expect(callbacks.onmouseout.calls.count()).toEqual(1);
      expect(callbacks.onmouseover.calls.count()).toEqual(1);
      expect(callbacks.onmousemove.calls.count()).toEqual(1);
      expect(callbacks.onmouseup.calls.count()).toEqual(1);
      expect(callbacks.onset_at.calls.count()).toEqual(1);
      expect(callbacks.oninsert_at.calls.count()).toEqual(1);
      expect(callbacks.onremove_at.calls.count()).toEqual(1);
    });
  });


  describe('removal', function() {
    beforeEach(function() {
      // Continue to add polylines
      mapInstance.addPolyline({
        path : path,
        strokeColor : '#131540',
        strokeOpacity : 0.6,
        strokeWeight : 6
      });
    });

    it('should remove one polyline from collection w/ removePolyline', function() {
      var originalLength = mapInstance.polylines.length;
      mapInstance.removePolyline(polyline);
      expect(mapInstance.polylines.length).toBeLessThan(originalLength);
      expect(polyline.getMap()).toBeNull();
    });

    it('should removal all polyline from collection w/ removePolylines', function() {
      mapInstance.removePolylines();
      expect(mapInstance.polylines.length).toEqual(0);
    });
  });
});