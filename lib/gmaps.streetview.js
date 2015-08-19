GMaps.prototype.createPanorama = function(streetviewOptions) {
  if (!streetviewOptions.hasOwnProperty('lat') || !streetviewOptions.hasOwnProperty('lng')) {
    streetviewOptions.lat = this.getCenter().lat();
    streetviewOptions.lng = this.getCenter().lng();
  }

  this.panorama = GMaps.createPanorama(streetviewOptions);

  this.map.setStreetView(this.panorama);

  return this.panorama;
};


GMaps.createPanorama = function(options) {
  var el = document.getElementById(options.el);

  options.position = new google.maps.LatLng(options.lat, options.lng);

  delete options.el;
  delete options.context;
  delete options.lat;
  delete options.lng;

  var streetviewEvents = [
    'closeclick',
    'links_changed',
    'pano_changed',
    'position_changed',
    'pov_changed',
    'resize',
    'visible_changed'
  ];
  var streetviewOptions = GMaps.prototype.utils.merge({visible : true}, options);

  for (var i = 0, l = streetviewEvents.length; i < l; i++) {
    delete streetviewOptions[streetviewEvents[i]];
  }

  var panorama = new google.maps.StreetViewPanorama(el, streetviewOptions);
  var name;

  for (i = 0, l = streetviewEvents.length; i < l; i++) {
    name = streetviewEvents[i];
    if (options.hasOwnProperty(name)) {
      google.maps.event.addListener(
        panorama,
        name,
        GMaps.prototype.utils.subcribeEvent(options[name], panorama)
      );
    }
  }

  return panorama;
};
