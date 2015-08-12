describe('Overlays', function() {
  var mapInstance, overlay;

  beforeEach(function() {
    mapInstance = mapInstance || new GMaps({
      el : '#map-with-overlays',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    overlay = overlay || mapInstance.drawOverlay({
      lat: mapInstance.getCenter().lat(),
      lng: mapInstance.getCenter().lng(),
      layer: 'overlayLayer',
      content: '<div class="overlay">Lima</div>',
      verticalAlign: 'top',
      horizontalAlign: 'center'
    });
  });

  it('should add the overlay to the overlays collection', function() {
    expect(mapInstance.overlays.length).toEqual(1);
    expect(mapInstance.overlays[0]).toEqual(overlay);
  });

  it('should add the overlay in the current map', function() {
    expect(overlay.getMap()).toEqual(mapInstance.map);
  });

  describe('Events', function() {
    var callbacks, overlayWithClick;

    beforeEach(function() {
      callbacks = {
        onclick: function() {
          console.log('Clicked the overlay');
        }
      };

      spyOn(callbacks, 'onclick').andCallThrough();

      overlayWithClick = mapInstance.drawOverlay({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        content: '<p>Clickable overlay</p>',
        click: callbacks.onclick
      });
    });

    it('should respond to click event', function() {
      var domIsReady = false;

      google.maps.event.addListenerOnce(overlayWithClick, 'ready', function () {
        domIsReady = true;
      });

      waitsFor(function () {
        return domIsReady;
      }, 'the overlay\'s DOM element to be ready', 10000);

      runs(function () {
        google.maps.event.trigger(overlayWithClick.el, 'click');
        expect(callbacks.onclick).toHaveBeenCalled();
      });
    });
  });
});