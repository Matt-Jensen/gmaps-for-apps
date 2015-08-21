describe('Creating custom map controls', function () {
  var mapInstance, container;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'basic-map';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#basic-map',
      lat: -12.0433,
      lng: -77.0283,
      zoom: 12
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  it('should add default styles for the control', function () {
    mapInstance.addControl({
      position: 'top_right',
      content: 'Geolocate'
    });

    expect(mapInstance.controls[0].position).toEqual(google.maps.ControlPosition.TOP_RIGHT);
    expect(mapInstance.controls[0].style.fontFamily).not.toEqual('');
  });

  it('should leave off default styles if requested', function () {
    mapInstance.addControl({
      position: 'top_right',
      disableDefaultStyles: true,
      content: '<i class="icon"></i>'
    });

    expect(mapInstance.controls[1].position).toEqual(google.maps.ControlPosition.TOP_RIGHT);
    expect(mapInstance.map.controls[google.maps.ControlPosition.TOP_RIGHT].length).toEqual(2);
    expect(mapInstance.controls[1].style.fontFamily).toEqual('');
  });

  it('should remove control', function () {
    var control = mapInstance.controls[0];
    mapInstance.removeControl(control);

    expect(mapInstance.controls.length).toEqual(1);
    expect(mapInstance.map.controls[google.maps.ControlPosition.TOP_RIGHT].length).toEqual(1);
    expect(mapInstance.controls[0]).not.toEqual(control);
  });
});