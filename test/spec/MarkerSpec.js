describe('Marker', function() {
  var mapInstance, container;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-markers';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-markers',
      lat : -12.0533,
      lng: -77.0293,
      zoom: 14
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('creating', function() {
    var marker;

    beforeAll(function() {
      marker = mapInstance.addMarker({
        id: 'marker-id',
        lat : -12.0533,
        lng: -77.0293,
        title : 'New marker'
      });
    });

    it('should add the marker to the markers collection', function() {
      expect(mapInstance.markers.length).toEqual(1);
      expect(mapInstance.markers[0]).toEqual(marker);
    });

    it('should create a marker with defined position', function() {
      // Fix for floating-point bug
      expect(parseFloat(marker.getPosition().lat().toFixed(4))).toEqual(-12.0533);
      expect(parseFloat(marker.getPosition().lng().toFixed(4))).toEqual(-77.0293);
    });

    it('should have the configured id', function() {
      expect(marker.id).toEqual('marker-id');
    });
  });


  describe('events', function() {
    var callbacks, context, marker;

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

      marker = mapInstance.addMarker({
        lat : -12.0533,
        lng: -77.0193,
        title : 'New marker',
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
        mouseup: callbacks.onmouseup
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(marker, 'click');
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should subscribe all mouse events', function() {
      google.maps.event.trigger(marker, 'rightclick', {});
      google.maps.event.trigger(marker, 'dblclick', {});
      google.maps.event.trigger(marker, 'drag', {});
      google.maps.event.trigger(marker, 'dragend', {});
      google.maps.event.trigger(marker, 'dragstart', {});
      google.maps.event.trigger(marker, 'mousedown', {});
      google.maps.event.trigger(marker, 'mouseout', {});
      google.maps.event.trigger(marker, 'mouseover', {});
      google.maps.event.trigger(marker, 'mousemove', {});
      google.maps.event.trigger(marker, 'mouseup', {});

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
    });
  });


  describe('removing', function() {
    beforeEach(function() {
      mapInstance.removeMarkers();

      mapInstance.addMarkers([{
        lat : -12.0523,
        lng: -77.0297,
        title : 'Marker #1'
      }, {
        lat : -12.0531,
        lng: -77.0289,
        title : 'Marker #2'
      }, {
        lat : -12.0537,
        lng: -77.0299,
        title : 'Marker #3'
      }, {
        lat : -12.0532,
        lng: -77.0278,
        title : 'Marker #4'
      }]);
    });

    it('should remove a marker from the markers collection', function() {
      mapInstance.removeMarker(mapInstance.markers[0]);
      expect(mapInstance.markers.length).toEqual(3);
    });

    it('should remove an array of markers from the markers collection', function() {
      var markers = [mapInstance.markers[0], mapInstance.markers[2]];
      mapInstance.removeMarkers(markers);
      expect(mapInstance.markers.length).toEqual(2);
    });
  });
});