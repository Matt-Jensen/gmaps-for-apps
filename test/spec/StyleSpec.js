describe('Adding Map Styles', function() {
  var mapInstance, container;

  beforeAll(function() {
    container = document.createElement('div');
    container.id = 'map-with-styles';
    container.className = 'map';
    document.body.appendChild(container);

    mapInstance = new GMaps({
      el : '#map-with-styles',
      lat : -12.0433,
      lng : -77.0283,
      zoom : 12
    });

    mapInstance.addStyle({
      styledMapName : {
        name : 'Lighter'
      },
      mapTypeId : 'lighter',
      styles : [
        {
          elementType : 'geometry',
          stylers : [
            { lightness : 50 }
          ]
        },
        {
          elementType : 'labels',
          stylers : [
            { visibility : 'off' }
          ]
        },
      ]
    });
  });

  afterAll(function() {
    mapInstance.destroy();
    document.body.removeChild(container);
  });

  it('should add a MapType to the current map', function() {
    expect(mapInstance.map.mapTypes.get('lighter')).toBeDefined();
  });

  it('should update the styles in the current map', function() {
    mapInstance.setStyle('lighter');
    expect(mapInstance.getMapTypeId()).toEqual('lighter');
  });
});