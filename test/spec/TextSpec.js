describe('Text Elements', function() {
  var mapInstance, container, textElement;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-texts';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-texts',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    textElement = mapInstance.addText({
      id: 'text-id',
      lat: 30.257806291133193,
      lng: -97.72566276602447,
      text: 'Wild Stallions!'
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('creating', function() {
    it('should add the text to the texts store', function() {
      expect(mapInstance.texts.length).toEqual(1);
      expect(mapInstance.texts[0]).toEqual(textElement);
    });

    it('should add the text in the current map', function() {
      expect(textElement.getMap()).toEqual(mapInstance.map);
    });

    it('should have configured id', function() {
      expect(textElement.id).toEqual('text-id');
    });
  });

  describe('events', function() {
    var callbacks, context, textWithEvents;

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

      textWithEvents = mapInstance.addText({
        lat: mapInstance.getCenter().lat(),
        lng: mapInstance.getCenter().lng(),
        text: 'tester',
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

    it('should respond to click and maintain method context', function(done) {
      google.maps.event.addListenerOnce(textWithEvents, 'ready', function () {
        // responds to click event and maintain method context
        google.maps.event.trigger(textWithEvents.el, 'click');
        expect(callbacks.onclick.calls.count()).toEqual(1);
        expect(context.passed).toBe(true);

        google.maps.event.trigger(textWithEvents.el, 'rightclick', {});
        google.maps.event.trigger(textWithEvents.el, 'dblclick', {});
        google.maps.event.trigger(textWithEvents.el, 'drag', {});
        google.maps.event.trigger(textWithEvents.el, 'dragend', {});
        google.maps.event.trigger(textWithEvents.el, 'dragstart', {});
        google.maps.event.trigger(textWithEvents.el, 'mousedown', {});
        google.maps.event.trigger(textWithEvents.el, 'mouseout', {});
        google.maps.event.trigger(textWithEvents.el, 'mouseover', {});
        google.maps.event.trigger(textWithEvents.el, 'mousemove', {});
        google.maps.event.trigger(textWithEvents.el, 'mouseup', {});

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
        done();
      });
    }, 5000);
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