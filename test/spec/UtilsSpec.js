describe('Utils', function () {
  var mapInstance, container, result;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'utils-map';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#utils-map',
      lat: -12.0433,
      lng: -77.0283,
      zoom: 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  describe('merge', function() {
    var obj1, obj2, obj3;

    it('should combine simple objects', function () {
      obj1 = { test: 'one' };
      obj2 = { test: 'two' };
      result = mapInstance.utils.merge(obj1, obj2);
      expect(result.test).toBe('two');
    });

    it('should recursively merge complex objects', function() {
      obj1 = { test: 'one', deep: { test: 'one' } };
      obj2 = { test: 'two', deep: { test: 'two' } };
      result = mapInstance.utils.merge(obj1, obj2);
      expect(result.deep.test).toBe('two');
    });

    it('should merge an arbitrary number of objects', function() {
      obj1 = { test: 'one' };
      obj2 = { test: 'two' };
      obj3 = { test: 'three' };
      result = mapInstance.utils.merge(obj1, obj2, obj3);
      expect(result.test).toBe('three');
    });
  });

  describe('isChildElement', function() {
    var parent, child;
    it('should return false when child not a descendent of parent', function() {
      parent = {};
      child = { parentNode: null };
      result = mapInstance.utils.isChildElement(parent, child);
      expect(result).toBe(false);
    });

    it('should return true when child is a descended of parent', function() {
      parent = {};
      child = { parentNode: parent };
      result = mapInstance.utils.isChildElement(parent, child);
      expect(result).toBe(true);
    });

    it('should be able to recurse through child\'s parentNodes', function() {
      parent = {};
      child = { parentNode: { parentNode: { parentNode: parent } } };
      result = mapInstance.utils.isChildElement(parent, child);
      expect(result).toBe(true);
    });
  });

  describe('uuid', function() {
    it('should return a new result each time', function() {
      expect(mapInstance.utils.uuid()).not.toBe(mapInstance.utils.uuid());
      expect(mapInstance.utils.uuid()).not.toBe(mapInstance.utils.uuid());
    });
  });

  describe('stripHTML', function() {
    it('should return the text content from a HTML string', function() {
      expect(mapInstance.utils.stripHTML('<h1>test</h1>')).toBe('test');
    });

    it('should return the outer text from html string & preserve whitespace', function() {
      expect(mapInstance.utils.stripHTML('test <h1>test</h1>')).toBe('test test');
    });
  });

  describe('toCamelCase', function() {
    it('should return the camelized version of a dasherized string', function() {
      expect(mapInstance.utils.toCamelCase('test-test')).toBe('testTest');
    });

    it('should return global dasherized versions & preserve whitespace', function() {
      expect(mapInstance.utils.toCamelCase('test-test-test test')).toBe('testTestTest test');
    });
  });

  describe('arrayMap', function() {
    it('should return a new array itterated by a callback, accepting a context', function() {
      var arr = [{ name: 'bob', }, {name: 'dole'}];
      result = mapInstance.utils.arrayMap(
        arr,
        function(item) {
          return item.name + this.add;
        },
        { add: '-' }
      );

      expect(result[0]).toBe('bob-');
      expect(result[1]).toBe('dole-');
    });
  });

  describe('arrayFlat', function() {
    it('should return a new single level array', function() {
      result = mapInstance.utils.arrayFlat([['one'], ['two']]);

      expect(result[0]).toBe('one');
      expect(result[1]).toBe('two');
    });
  });

  describe('arrayToLatLng', function() {
    it('should accept an array of coords and return array of google.maps.LatLng instances', function() {
      result = mapInstance.utils.arrayToLatLng([[12, 12], [10,10]]);
      expect(result[0] instanceof google.maps.LatLng).toBe(true);
      expect(result[1] instanceof google.maps.LatLng).toBe(true);
    });
  });

  describe('coordsToLatLngs', function() {
    it('should accept an array and return a google.maps.LatLng instance', function() {
      result = mapInstance.utils.coordsToLatLngs([12, 12]);
      expect(result instanceof google.maps.LatLng).toBe(true);
    });
  });

  describe('findAbsolutePosition', function() {
    it('should return an array with total offestLeft and total offsetTop', function() {
      var node = {
        offsetLeft: 1, offsetTop: 2,
        offsetParent: {
          offsetLeft: 1, offsetTop: 2,
          offsetParent: { offsetLeft: 1, offsetTop: 2 }
        }
      };
      result = mapInstance.utils.findAbsolutePosition(node);
      expect(result[0]).toBe(3);
      expect(result[1]).toBe(6);
    });
  });

  describe('subcribeEvent', function() {
    it('should return a function that provides an event and optional to a callback', function() {
      var passed = false;
      var optional = { passed: false };
      result = mapInstance.utils.subcribeEvent(function(evt, opt) {
        opt.passed = passed = evt;
      }, optional);

      result(true);

      expect(passed).toBe(true);
      expect(optional.passed).toBe(true);
    });
  });
});