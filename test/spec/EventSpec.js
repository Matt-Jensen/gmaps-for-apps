describe('Creating event listeners', function() {
  var container, map_events, marker, line, polygon, circle, rectangle, overlay, text, infoWindow;
  var callbacks_native, callbacks_gmaps;
  var added_marker, added_line, added_polygon, added_circle, added_rectangle, added_overlay, added_text, added_info_window;
  var marker_added_event, marker_removed_event;
  var polyline_added_event, polyline_removed_event;
  var polygon_added_event, polygon_removed_event;
  var circle_added_event, circle_removed_event;
  var rectangle_added_event, rectangle_removed_event;
  var overlay_added_event, overlay_removed_event;
  var text_added_event, text_removed_event;
  var info_window_added_event, info_window_removed_event;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'events-map';
    container.className = 'map';
    document.body.appendChild(container);

    map_events = new GMaps({
      el : '#events-map',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    marker = map_events.addMarker({
      lat : -12.0433,
      lng : -77.0283,
      title : 'New marker'
    });

    line = map_events.addPolyline({
      path : [[-12.0440, -77.0247], [-12.0544, -77.0302], [-12.0551, -77.0303], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
      strokeColor : '#131540',
      strokeOpacity : 0.6,
      strokeWeight : 6
    });

    polygon = map_events.addPolygon({
      paths : [[-12.0403,-77.0337],[-12.0402,-77.0399],[-12.0500,-77.0244],[-12.0448,-77.0215]],
      strokeColor : '#25D359',
      strokeOpacity : 1,
      strokeWeight : 3,
      fillColor : '#25D359',
      fillOpacity : 0.6
    });

    circle = map_events.addCircle({
      lat : -12.040504866577001,
      lng : -77.02024422636042,
      radius : 350
    });

    rectangle = map_events.addRectangle({
      bounds: [[-12.030397656836609,-77.02373871559225],[-12.034804866577001,-77.01154422636042]]
    });

    overlay = map_events.addOverlay({
      lat: -12.040504866577001,
      lng: -77.02024422636042,
      content: '<h1>testing</h1>'
    });

    text = map_events.addText({
      lat: -12.040504866577001,
      lng: -77.02024422636042,
      text: 'testing'
    });

    infoWindow = map_events.addInfoWindow({
      lat: 34.54148095772571,
      lng: -112.47004508972168,
      content: 'info-window'
    });
  });

  afterAll(function() {
    map_events.destroy();
    document.body.removeChild(container);
  });

  describe('for google.maps events', function() {
    beforeAll(function() {
      callbacks_native = {
        map : {
          onclick : function() {
            return true;
          }
        },
        marker : {
          onclick : function() {
            return true;
          }
        },
        line : {
          onclick : function() {
            return true;
          }
        },
        polygon : {
          onclick : function() {
            return true;
          }
        },
        circle : {
          onclick : function() {
            return true;
          }
        },
        rectangle : {
          onclick : function() {
            return true;
          }
        },
        overlay : {
          onclick : function() {
            return true;
          }
        },
        text : {
          onclick : function() {
            return true;
          }
        },
        infoWindow : {
          onclick : function() {
            return true;
          }
        }
      };

      spyOn(callbacks_native.map, 'onclick').and.callThrough();
      spyOn(callbacks_native.marker, 'onclick').and.callThrough();
      spyOn(callbacks_native.line, 'onclick').and.callThrough();
      spyOn(callbacks_native.polygon, 'onclick').and.callThrough();
      spyOn(callbacks_native.circle, 'onclick').and.callThrough();
      spyOn(callbacks_native.rectangle, 'onclick').and.callThrough();
      spyOn(callbacks_native.overlay, 'onclick').and.callThrough();
      spyOn(callbacks_native.text, 'onclick').and.callThrough();
      spyOn(callbacks_native.infoWindow, 'onclick').and.callThrough();
    });

    describe('To a map', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', map_events.map, callbacks_native.map.onclick);

        expect(map_events.map['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(map_events.map['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a marker', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', marker, callbacks_native.marker.onclick);

        expect(marker['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(marker['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a line', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', line, callbacks_native.line.onclick);

        expect(line['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(line['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a polygon', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', polygon, callbacks_native.polygon.onclick);

        expect(polygon['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(polygon['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a circle', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', circle, callbacks_native.circle.onclick);

        expect(circle['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(circle['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a rectangle', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', rectangle, callbacks_native.rectangle.onclick);

        expect(rectangle['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(rectangle['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a overlay', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', overlay, callbacks_native.overlay.onclick);

        expect(overlay['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(overlay['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a text', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', text, callbacks_native.text.onclick);

        expect(text['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(text['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('To a infoWindow', function() {
      it('should add the listener to the listeners collection', function() {
        var click_event = GMaps.on('click', infoWindow, callbacks_native.infoWindow.onclick);

        expect(infoWindow['__e3_']['click'][click_event['id']]).toBeDefined();
        expect(infoWindow['__e3_']['click'][click_event['id']]).toEqual(click_event);
      });
    });

    describe('registering non custom events', function() {
      
      it('custom registeredEvents should not exist', function() {
        map_events.on('bounds_changed', function handler(){ });
        expect(map_events.registeredEvents['bounds_changed']).not.toBeDefined();
      });

      it('delegates the handler to google.map', function() {
        var called = false;
        map_events.on('bounds_changed', function handler() { called = true });

        google.maps.event.trigger(map_events.map, 'bounds_changed');
        expect(called).toBe(true);
      });
    });
    
    describe('removing non custom events', function() {
    
      it('removes handler from google.map', function() {
        var neverCalled = true;
        map_events.on('bounds_changed', function() { neverCalled = false });
        map_events.off('bounds_changed');

        google.maps.event.trigger(map_events.map, 'bounds_changed');
        expect(neverCalled).toBe(true);
      });
    });
  });

  describe('for GMaps events', function() {
    beforeEach(function() {
      callbacks_gmaps = {
        marker_added : function() {
          return true;
        },
        marker_removed : function() {
          return true;
        },
        polyline_added : function() {
          return true;
        },
        polyline_removed : function() {
          return true;
        },
        polygon_added : function() {
          return true;
        },
        polygon_removed : function() {
          return true;
        },
        circle_added: function() {
          return true;
        },
        circle_removed: function() {
          return true;
        },
        rectangle_added: function() {
          return true;
        },
        rectangle_removed: function() {
          return true;
        },
        overlay_added: function() {
          return true;
        },
        overlay_removed: function() {
          return true;
        },
        text_added: function() {
          return true;
        },
        text_removed: function() {
          return true;
        },
        info_window_added: function() {
          return true;
        },
        info_window_removed: function() {
          return true;
        }
      };

      spyOn(callbacks_gmaps, 'marker_added').and.callThrough();
      spyOn(callbacks_gmaps, 'marker_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'polyline_added').and.callThrough();
      spyOn(callbacks_gmaps, 'polyline_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'polygon_added').and.callThrough();
      spyOn(callbacks_gmaps, 'polygon_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'circle_added').and.callThrough();
      spyOn(callbacks_gmaps, 'circle_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'rectangle_added').and.callThrough();
      spyOn(callbacks_gmaps, 'rectangle_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'overlay_added').and.callThrough();
      spyOn(callbacks_gmaps, 'overlay_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'text_added').and.callThrough();
      spyOn(callbacks_gmaps, 'text_removed').and.callThrough();
      spyOn(callbacks_gmaps, 'info_window_added').and.callThrough();
      spyOn(callbacks_gmaps, 'info_window_removed').and.callThrough();
    });

    describe('#marker_added', function() {
      beforeEach(function() {
        marker_added_event = GMaps.on('marker_added', map_events, callbacks_gmaps.marker_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['marker_added'][0]).toEqual(marker_added_event);
      });

      it('should trigger the listener created', function() {
        added_marker = added_marker || map_events.addMarker({
          lat : -12.0433,
          lng : -77.0273,
          title : 'New marker'
        });

        expect(callbacks_gmaps.marker_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('marker_added', map_events);
      });
    });

    describe('#marker_removed', function() {
      beforeEach(function() {
        marker_removed_event = GMaps.on('marker_removed', map_events, callbacks_gmaps.marker_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['marker_removed'][0]).toEqual(marker_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removeMarker(added_marker);

        expect(callbacks_gmaps.marker_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('marker_removed', map_events);
      });
    });

    describe('#polyline_added', function() {
      beforeEach(function() {
        polyline_added_event = GMaps.on('polyline_added', map_events, callbacks_gmaps.polyline_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['polyline_added'][0]).toEqual(polyline_added_event);
      });

      it('should trigger the listener created', function() {
        added_line = added_line || map_events.addPolyline({
          path : [[-12.0420, -77.0247], [-12.0544, -77.0102], [-12.0751, -77.0903], [-12.0759, -77.0276], [-12.0763, -77.0279], [-12.0768, -77.0289], [-12.0885, -77.0241], [-12.0908, -77.0227]],
          strokeColor : '#271804',
          strokeOpacity : 0.1,
          strokeWeight : 1
        });

        expect(callbacks_gmaps.polyline_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polyline_added', map_events);
      });
    });

    describe('#polyline_removed', function() {
      beforeEach(function() {
        polyline_removed_event = GMaps.on('polyline_removed', map_events, callbacks_gmaps.polyline_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['polyline_removed'][0]).toEqual(polyline_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removePolyline(added_line);

        expect(callbacks_gmaps.polyline_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polyline_removed', map_events);
      });
    });

    describe('#polygon_added', function() {
      beforeEach(function() {
        polygon_added_event = GMaps.on('polygon_added', map_events, callbacks_gmaps.polygon_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['polygon_added'][0]).toEqual(polygon_added_event);
      });

      it('should trigger the listener created', function() {
        added_polygon = added_polygon || map_events.addPolygon({
          paths : [[-12.0203,-77.0137],[-12.0402,-77.0109],[-12.0500,-77.0144],[-12.0848,-77.0115]],
          strokeColor : '#D32559',
          strokeOpacity : 0.7,
          strokeWeight : 8,
          fillColor : '#D32559',
          fillOpacity : 0.6
        });

        expect(callbacks_gmaps.polygon_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polygon_added', map_events);
      });
    });

    describe('#polygon_removed', function() {
      beforeEach(function() {
        polygon_removed_event = GMaps.on('polygon_removed', map_events, callbacks_gmaps.polygon_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['polygon_removed'][0]).toEqual(polygon_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removePolygon(added_polygon);

        expect(callbacks_gmaps.polygon_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('polygon_removed', map_events);
      });
    });

    describe('#circle_added', function() {
      beforeEach(function() {
        circle_added_event = GMaps.on('circle_added', map_events, callbacks_gmaps.circle_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['circle_added'][0]).toEqual(circle_added_event);
      });

      it('should trigger the listener created', function() {
        added_circle = added_circle || map_events.addCircle({
          lat : -12.040504866577001,
          lng : -77.02024422636042,
          radius : 350
        });

        expect(callbacks_gmaps.circle_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('circle_added', map_events);
      });
    });

    describe('#circle_removed', function() {
      beforeEach(function() {
        circle_removed_event = GMaps.on('circle_removed', map_events, callbacks_gmaps.circle_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['circle_removed'][0]).toEqual(circle_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removeCircle(added_circle);
        expect(callbacks_gmaps.circle_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('circle_removed', map_events);
      });
    });

    describe('#rectangle_added', function() {
      beforeEach(function() {
        rectangle_added_event = GMaps.on('rectangle_added', map_events, callbacks_gmaps.rectangle_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['rectangle_added'][0]).toEqual(rectangle_added_event);
      });

      it('should trigger the listener created', function() {
        added_rectangle = added_rectangle || map_events.addRectangle({
          bounds: [[-12.030397656836609,-77.02373871559225],[-12.034804866577001,-77.01154422636042]]
        });

        expect(callbacks_gmaps.rectangle_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('rectangle_added', map_events);
      });
    });

    describe('#rectangle_removed', function() {
      beforeEach(function() {
        rectangle_removed_event = GMaps.on('rectangle_removed', map_events, callbacks_gmaps.rectangle_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['rectangle_removed'][0]).toEqual(rectangle_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removeRectangle(added_rectangle);
        expect(callbacks_gmaps.rectangle_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('rectangle_removed', map_events);
      });
    });

    describe('#overlay_added', function() {
      beforeEach(function() {
        overlay_added_event = GMaps.on('overlay_added', map_events, callbacks_gmaps.overlay_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['overlay_added'][0]).toEqual(overlay_added_event);
      });

      it('should trigger the listener created', function() {
        added_overlay = added_overlay || map_events.addOverlay({
          lat: -12.040504866577001,
          lng: -77.02024422636042,
          content: '<h1>testing</h1>'
        });

        expect(callbacks_gmaps.overlay_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('overlay_added', map_events);
      });
    });

    describe('#overlay_removed', function() {
      beforeEach(function() {
        overlay_removed_event = GMaps.on('overlay_removed', map_events, callbacks_gmaps.overlay_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['overlay_removed'][0]).toEqual(overlay_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removeOverlay(added_overlay);
        expect(callbacks_gmaps.overlay_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('overlay_removed', map_events);
      });
    });



    describe('#text_added', function() {
      beforeEach(function() {
        text_added_event = GMaps.on('text_added', map_events, callbacks_gmaps.text_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['text_added'][0]).toEqual(text_added_event);
      });

      it('should trigger the listener created', function() {
        added_text = added_text || map_events.addText({
          lat: -12.040504866577001,
          lng: -77.02024422636042,
          text: 'testing'
        });

        expect(callbacks_gmaps.text_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('text_added', map_events);
      });
    });

    describe('#text_removed', function() {
      beforeEach(function() {
        text_removed_event = GMaps.on('text_removed', map_events, callbacks_gmaps.text_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['text_removed'][0]).toEqual(text_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removeText(added_text);
        expect(callbacks_gmaps.text_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('text_removed', map_events);
      });
    });

    describe('#info_window_added', function() {
      beforeEach(function() {
        info_window_added_event = GMaps.on('info_window_added', map_events, callbacks_gmaps.info_window_added);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['info_window_added'][0]).toEqual(info_window_added_event);
      });

      it('should trigger the listener created', function() {
        added_info_window = added_info_window || map_events.addInfoWindow({
          lat: 34.54148095772571,
          lng: -112.47004508972168,
          content: 'info-window'
        });

        expect(callbacks_gmaps.info_window_added).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('info_window_added', map_events);
      });
    });

    describe('#info_window_removed', function() {
      beforeEach(function() {
        info_window_removed_event = GMaps.on('info_window_removed', map_events, callbacks_gmaps.info_window_removed);
      });

      it('should add the listener to the listeners collection', function() {
        expect(map_events.registeredEvents['info_window_removed'][0]).toEqual(info_window_removed_event);
      });

      it('should trigger the listener created', function() {
        map_events.removeInfoWindow(added_info_window);

        expect(callbacks_gmaps.info_window_removed).toHaveBeenCalled();
      });

      afterEach(function() {
        GMaps.off('info_window_removed', map_events);
      });
    });
  });
});