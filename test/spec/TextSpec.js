describe('Text Elements', function() {
  var mapInstance, container, textElement;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-overlays';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-overlays',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    textElement = mapInstance.addText({
      lat: 30.257806291133193,
      lng: -97.72566276602447,
      text: 'Wild Stallions!'
    });
  });

  it('should add the text to the texts store', function() {
    expect(mapInstance.texts.length).toEqual(1);
    expect(mapInstance.texts[0]).toEqual(textElement);
  });

  it('should add the text in the current map', function() {
    expect(textElement.getMap()).toEqual(mapInstance.map);
  });

  describe('events', function() {
    var callbacks, context, textWithEvents;

    beforeAll(function() {
      context = { passed: false };
      callbacks = {
        onclick: function() {
          this.passed = true;
        }.bind(context),

        onmousemove: function() {
          return true;
        },

        onrightclick: function() {
          return true;
        }
      };

      spyOn(callbacks, 'onclick').and.callThrough();
      spyOn(callbacks, 'onmousemove').and.callThrough();
      spyOn(callbacks, 'onrightclick').and.callThrough();

      textWithEvents = mapInstance.addText({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        text: 'tester',
        click: callbacks.onclick,
        mousemove: callbacks.onmousemove,
        rightclick: callbacks.onrightclick
      });
    });

    it('should respond to click and maintain method context', function() {
      google.maps.event.addListenerOnce(textWithEvents, 'ready', function () {
        // responds to click event and maintain method context
        google.maps.event.trigger(textWithEvents.el, 'click');
        expect(callbacks.onclick).toHaveBeenCalled();
        expect(context.passed).toBe(true);

        // binds multiple events
        google.maps.event.trigger(textWithEvents.el, 'mousemove', {});
        expect(callbacks.onmousemove).toHaveBeenCalled();

        google.maps.event.trigger(textWithEvents.el, 'rightclick', {});
        expect(callbacks.onrightclick).toHaveBeenCalled();
      });
    });
  });

  describe('removing', function() {
    beforeEach(function() {
      // continually add texts
      textElement = mapInstance.addText({
        lat: 30.257806291133193,
        lng: -97.72566276602447,
        text: 'texty'
      });
    });

    it('should remove a single text from the texts store /w removeText', function() {
      var originalLength = mapInstance.texts.length;
      mapInstance.removeText(textElement);
      expect(mapInstance.texts.length).toBeLessThan(originalLength);
    });

    it('should remove all texts from the texts store /w removeTexts', function() {
      mapInstance.removeTexts();
      expect(mapInstance.texts.length).toEqual(0);
    });
  });
});