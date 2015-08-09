describe('Creating a marker', function() {
  var mapInstance, marker;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-markers',
      lat : -12.0533,
      lng: -77.0293,
      zoom: 14
    });
  });

  describe('With basic options', function() {
    beforeEach(function() {
      marker = mapInstance.addMarker({
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
  });

  describe('With events', function() {
    var callbacks;

    beforeEach(function() {
      callbacks = {
        onclick : function() {
          console.log(this.title);
        }
      };

      spyOn(callbacks, 'onclick').andCallThrough();

      marker = mapInstance.addMarker({
        lat : -12.0533,
        lng: -77.0193,
        title : 'New marker',
        click : callbacks.onclick
      });
    });

    it('should respond to click event', function() {
      google.maps.event.trigger(marker, 'click');

      expect(callbacks.onclick).toHaveBeenCalled();
    });
  });
});

describe('Removing markers', function() {
  var mapInstance;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-markers',
      lat : -12.0533,
      lng: -77.0293,
      zoom: 14
    });

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