describe('Creating a map', function() {
  var basicMap, advancedMap, mapWithEvents, mapWithCustomControls;

  it('should throw an error if element is not defined', function() {
    expect(function() { new GMaps({}); }).toThrow(new Error('No element defined.'));
  });

  describe('With basic options', function() {
    var container;

    beforeAll(function() {
      container = document.createElement('div');
      container.id = 'standard-map';
      container.className = 'map';
      document.body.appendChild(container);

      basicMap = new GMaps({
        el : '#standard-map',
        lat: -12.0433,
        lng: -77.0283,
        zoom: 12
      });
    });

    afterAll(function() {
      basicMap.destroy();
      document.body.removeChild(container);
    });

    it('should create a GMaps object', function() {
      expect(basicMap).toBeDefined();
    });

    it('should have centered the map at the initial coordinates', function() {
      var lat = basicMap.getCenter().lat();
      var lng = basicMap.getCenter().lng();

      expect(lat).toEqual(-12.0433);
      expect(lng).toEqual(-77.0283);
    });

    it('should have the correct zoom', function() {
      expect(basicMap.getZoom()).toEqual(12);
    });
  });

  describe('With advanced controls', function() {
    var container;

    beforeAll(function() {
      container = document.createElement('div');
      container.id = 'advanced-map';
      container.className = 'map';
      document.body.appendChild(container);

      advancedMap = new GMaps({
        el : '#advanced-map',
        lat: -12.0433,
        lng: -77.0283,
        zoomControl : true,
        panControl : false,
        streetViewControl : false,
        mapTypeControl: false,
        overviewMapControl: false
      });
    });

    afterAll(function() {
      advancedMap.destroy();
      document.body.removeChild(container);
    });

    it('should show the defined controls', function() {
      expect(advancedMap.map.zoomControl).toBeTruthy();
      expect(advancedMap.map.panControl).toBeFalsy();
      expect(advancedMap.map.streetViewControl).toBeFalsy();
      expect(advancedMap.map.mapTypeControl).toBeFalsy();
      expect(advancedMap.map.overviewMapControl).toBeFalsy();
    });
  });

  describe('With events', function() {
    var callbacks, container, currentZoom = 0, currentCenter = null;

    beforeAll(function() {
      callbacks = {
        onclick : function(e) {
          var lat = e.latLng.lat();
          var lng = e.latLng.lng();

          mapWithEvents.addMarker({
            lat : lat,
            lng : lng,
            title : 'New Marker'
          });
        },
        onzoomchanged : function() {
          currentZoom = this.getZoom();
        },
        oncenterchanged : function() {
          currentCenter = this.getCenter();
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onzoomchanged').and.callThrough();
      spyOn(callbacks, 'oncenterchanged').and.callThrough();

      container = document.createElement('div');
      container.id = 'map-with-events';
      container.className = 'map';
      document.body.appendChild(container);

      mapWithEvents = new GMaps({
        el : '#map-with-events',
        lat : -12.0433,
        lng : -77.0283,
        click : callbacks.onclick,
        zoom_changed : callbacks.onzoomchanged,
        center_changed : callbacks.oncenterchanged
      });
    });

    afterAll(function() {
      mapWithEvents.destroy();
      document.body.removeChild(container);
    });

    it('should respond to zoom_changed event', function() {
      mapWithEvents.map.setZoom(16);

      expect(callbacks.onzoomchanged).toHaveBeenCalled();
      expect(currentZoom).toEqual(16);
    });

    it('should respond to center_changed event', function() {
      mapWithEvents.map.setCenter(new google.maps.LatLng(-12.0907, -77.0227));

      // Fix for floating-point bug
      var lat = parseFloat(currentCenter.lat().toFixed(4));
      var lng = parseFloat(currentCenter.lng().toFixed(4));

      expect(callbacks.oncenterchanged).toHaveBeenCalled();
      expect(lat).toEqual(-12.0907);
      expect(lng).toEqual(-77.0227);
    });

    it('should respond to click event', function() {
      google.maps.event.trigger(mapWithEvents.map, 'click', {
        latLng : new google.maps.LatLng(-12.0433, -77.0283)
      });

      expect(callbacks.onclick).toHaveBeenCalled();
      expect(mapWithEvents.markers.length).toEqual(1);
    });

    afterAll(function() {
      document.getElementById('map-with-events').innerHTML = '';
      mapWithEvents = null;
    });
  });

  describe('With custom controls', function() {
    var callbacks, container;

    beforeAll(function() {
      callbacks = {
        onclick : function() {
          mapWithCustomControls.addMarker({
            lat : mapWithCustomControls.getCenter().lat(),
            lng : mapWithCustomControls.getCenter().lng()
          });
        }
      }

      spyOn(callbacks, 'onclick').and.callThrough();

      container = document.createElement('div');
      container.id = 'map-with-custom-controls';
      container.className = 'map';
      document.body.appendChild(container);

      mapWithCustomControls = new GMaps({
        el : '#map-with-custom-controls',
        lat : -12.0433,
        lng : -77.0283
      });

      mapWithCustomControls.addControl({
        position : 'top_right',
        content : 'Add marker at the center',
        style : {
          margin: '5px',
          padding: '1px 6px',
          border: 'solid 1px #717B87',
          background: '#fff'
        },
        events : {
          click: callbacks.onclick
        }
      });
    });

    afterAll(function() {
      mapWithCustomControls.destroy();
      document.body.removeChild(container);
    });

    it('should add the control to the controls collection', function() {
      expect(mapWithCustomControls.controls.length).toEqual(1);
    });

    it('should respond to click event attached to the custom control', function() {
      google.maps.event.trigger(mapWithCustomControls.controls[0], 'click');

      expect(callbacks.onclick).toHaveBeenCalled();
      expect(mapWithCustomControls.markers.length).toEqual(1);
    });
  });

  describe('destroing map', function() {
    var destroyMap, container, originalClearInstanceListeners;

    beforeAll(function() {
      container = document.createElement('div');
      container.id = 'destroy-map';
      container.className = 'map';
      document.body.appendChild(container);

      destroyMap = new GMaps({
        el : '#destroy-map',
        lat: -12.0433,
        lng: -77.0283,
        zoom: 12
      });

      // Add `_mapEventListeners`
      destroyMap.setContextMenu({
        control: 'marker',
        options: [{
          title: 'Center here',
          name: 'center_here'
        }]
      });

      originalClearInstanceListeners = google.maps.event.clearInstanceListeners;
    });

    afterAll(function() {
      document.body.removeChild(container);
      google.maps.event.clearInstanceListeners = originalClearInstanceListeners;
    });

    it('should empty element, remove children, clear event and instance listeners', function() {
      spyOn(destroyMap, 'removeMarkers').and.callThrough();
      spyOn(destroyMap, 'removeOverlays').and.callThrough();
      spyOn(destroyMap, 'removeTexts').and.callThrough();
      spyOn(destroyMap, 'removePolygons').and.callThrough();
      spyOn(destroyMap, 'removePolylines').and.callThrough();
      spyOn(destroyMap, 'removeCircles').and.callThrough();
      spyOn(destroyMap, 'removeRectangles').and.callThrough();
      spyOn(destroyMap, 'removeInfoWindows').and.callThrough();
      spyOn(google.maps.event, 'clearInstanceListeners').and.callThrough();

      destroyMap.destroy();

      expect(destroyMap.removeMarkers).toHaveBeenCalled();
      expect(destroyMap.removeOverlays).toHaveBeenCalled();
      expect(destroyMap.removeTexts).toHaveBeenCalled();
      expect(destroyMap.removePolygons).toHaveBeenCalled();
      expect(destroyMap.removePolylines).toHaveBeenCalled();
      expect(destroyMap.removeCircles).toHaveBeenCalled();
      expect(destroyMap.removeRectangles).toHaveBeenCalled();
      expect(destroyMap.removeInfoWindows).toHaveBeenCalled();
      expect(google.maps.event.clearInstanceListeners).toHaveBeenCalled();

      expect(destroyMap._mapEventListeners.length).toEqual(0);
      expect(destroyMap.map).toBe(null);
      expect(destroyMap.el.innerHTML.length).toEqual(0);
    });
  });
});
