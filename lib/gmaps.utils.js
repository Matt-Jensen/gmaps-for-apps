/**
 * [utils namespace for all utility methods]
 */
GMaps.prototype.utils = Object.create(null);


/**
 * [merge description combines an indeterminate # of objects into a single object, giving preferece to the last arguement given]
 * @param  {[object]} dest [an orginal object]
 * @return {[object]}      [all merged objects]
 */
GMaps.prototype.utils.merge = function merge(dest) {
  var merging = Array.prototype.slice.call(arguments, 1);

  var target, p;
  while (merging.length) {
    target = merging.shift();

    // Only merge objects
    if (target instanceof Object === false) { continue; }

    for (p in target) {
      if (target.hasOwnProperty(p)) {
        if (target[p] instanceof Object && dest[p] instanceof Object) {
          // Recursively merge objects
          dest[p] = GMaps.prototype.utils.merge(dest[p], target[p]);
        }
        else {
          dest[p] = target[p];
        }
      }
    }
  }

  return dest;
};


/**
 * [geolocate service to request and access a navigators geolocation]
 * @param  {[object]} options [accepts callbacks always|complete, success, error, notSupported]
 */
GMaps.prototype.utils.geolocate = function geolocate(options) {
  var completeCallback = options.always || options.complete;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      options.success(position);

      if (completeCallback) {
        completeCallback();
      }
    }, function(error) {
      options.error(error);

      if (completeCallback) {
        completeCallback();
      }
    }, options.options);
  }
  else {
    options.notSupported();

    if (completeCallback) {
      completeCallback();
    }
  }
};


/**
 * [isChildElement returns true if childs parentNode's === parent]
 * @param  {[Node]}  parent [parent element to compare child.parentNode's to]
 * @param  {[Node]}  child  [child element to begin comparison]
 * @return {Boolean}        [true if child is desendent of parent]
 */
GMaps.prototype.utils.isChildElement = function isChildElement(parent, child) {
  var node = child.parentNode;

  // while there are parent nodes and parent node is not the root map element
  while (node !== null && node !== this.el) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};


/**
 * [uuid returns a unique number for each invokation]
 * @return {[number]}   [a unique number]
 */
GMaps.prototype.utils.uuid = (function() {
  var id = 0;

  return function() {
    return id++;
  }
})();


/**
 * [Removes all HTML tags from a string, returning only text content]
 * @param  {[str]}    [String to remove HTML tags from]
 * @return {[string]} [text content of html]
 */
GMaps.prototype.utils.stripHTML = (function() {
  var htmlRE = /(<([^>]+)>)/ig;

  return function stripHTML(str) {
    return (str+'').replace(htmlRE, '');
  };
})();


/**
 * [converts a dasherized strings to camel cased string]
 * @return {[string]}   [camel cased string]
 */
GMaps.prototype.utils.toCamelCase = (function() {
  var ccRE = /-([a-z])/g;

  return function toCamelCase(str) {
    return (str+'').replace(ccRE, function (g) { return g[1].toUpperCase(); });
  };
})();


/**
 * [arrayMap polyfill for Array.prototype.map]
 * @param  {[Array]}  array   
 * @param  {Function} callback [recieves (array[i], i, array)]
 * @param  {[object]} context  [optional context for callback]
 * @return {[type]}            [description]
 */
GMaps.prototype.utils.arrayMap = function arrayMap(array, callback) {
  var params = Array.prototype.slice.call(arguments, 1);
  var arrayReturn = [];
  var i, l;

  if (Array.prototype.map && array.map === Array.prototype.map) {
    arrayReturn = array.map.apply(array, params);
  }
  else {
    for (i = 0, l = array.length; i < l; i++) {
      arrayReturn.push(callback.apply(params[2] || this, [array[i], i, array]));
    }
  }

  return arrayReturn;
};


/**
 * [arrayFlat converts an array of arrays into a single level array]
 * @param  {[Array]} array [multi level array]
 * @return {[Array]}       [single level array]
 */
GMaps.prototype.utils.arrayFlat = function arrayFlat(array) {
  var newArray = [];
  var i, l;

  for (i = 0, l = array.length; i < l; i++) {
    newArray = newArray.concat(array[i]);
  }

  return newArray;
};


/**
 * [arrayToLatLng replaces array items with response from `coordsToLatLngs`]
 * @param  {[Array]} coords       [array of array coordinates]
 * @param  {[Boolean]} useGeoJSON [changes coordsToLatLngs behavior]
 * @return {[Array]}              [Array of google LatLng instances]
 */
GMaps.prototype.utils.arrayToLatLng = function arrayToLatLng(coords, useGeoJSON) {
  for (var i = 0, l = coords.length; i < l; i++) {
    if (!(coords[i] instanceof google.maps.LatLng)) {
      if (coords[i].length > 0 && typeof coords[i][0] === 'object') {
        coords[i] = GMaps.prototype.utils.arrayToLatLng(coords[i], useGeoJSON);
      }
      else {
        coords[i] = GMaps.prototype.utils.coordsToLatLngs(coords[i], useGeoJSON);
      }
    }
  }

  return coords;
};


/**
 * [coordsToLatLngs returns an instance of google.mapsLatLng based on an array of coords]
 * @param  {[array]} coords    [[lat,lng]]
 * @param  {[Boolean]} useGeoJSON [changes to [lng,lat]]
 * @return {[LatLng]}            [google.maps.LatLng instance]
 */
GMaps.prototype.utils.coordsToLatLngs = function coordsToLatLngs(coords, useGeoJSON) {
  var firstCoord = coords[0],
      secondCoord = coords[1];

  if (useGeoJSON) {
    firstCoord = coords[1];
    secondCoord = coords[0];
  }

  return new google.maps.LatLng(firstCoord, secondCoord);
};


/**
 * [findAbsolutePosition calculates the total absolute position left + top relative to the viewport]
 * @param  {[node]} node [Live node element]
 * @return {[Array]}     [[from-left, from-top]]
 */
GMaps.prototype.utils.findAbsolutePosition = function findAbsolutePosition(node)  {
  var curleft = 0;
  var curtop = 0;

  if (node.offsetParent) {
    do {
      curleft += node.offsetLeft;
      curtop += node.offsetTop;
    } while (node = node.offsetParent);
  }

  return [curleft, curtop];
};

/**
 * [subcribeEvent returns a funciton that provides an event to a callback, with opt params]
 * @param  {Function} callback [called on event]
 * @param  {[context]}   obj   [provided to callback]
 * @return {[Function]}        [return function to be invoked as an event callback]
 */
GMaps.prototype.utils.subcribeEvent = function subcribeEvent(callback, obj) {
  return function(e) {
    var args = [];
    if(e && typeof e !== 'number') { args.push(e); } // don't allow index parameters as events
    args.push(obj || this);
    return callback.apply(null, args);
  };
};
