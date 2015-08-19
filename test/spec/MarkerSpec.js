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

        onmouseover: function() {
          return true;
        },

        ondrag: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onmouseover').and.callThrough();
      spyOn(callbacks, 'ondrag').and.callThrough();

      marker = mapInstance.addMarker({
        lat : -12.0533,
        lng: -77.0193,
        title : 'New marker',
        click : callbacks.onclick,
        mouseover: callbacks.onmouseover,
        drag: callbacks.ondrag
      });
    });

    it('should respond to click event and maintain method context', function() {
      google.maps.event.trigger(marker, 'click');
      expect(callbacks.onclick).toHaveBeenCalled();
      expect(context.passed).toBe(true);
    });

    it('should subscribe multiple events', function() {
      google.maps.event.trigger(marker, 'mouseover', {});
      expect(callbacks.onmouseover).toHaveBeenCalled();

      google.maps.event.trigger(marker, 'drag', {});
      expect(callbacks.ondrag).toHaveBeenCalled();
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