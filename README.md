[![Build Status](https://travis-ci.org/Matt-Jensen/gmaps-for-apps.svg?branch=master)](https://travis-ci.org/Matt-Jensen/gmaps-for-apps)

GMaps-For-Apps - Simplified Google Maps For Your JavaScript Apps.
==================================================================
*This project is a fork of [GMaps](https://github.com/hpneo/gmaps)*

**GMaps-for-Apps** supports all features available in [original Gmaps](http://hpneo.github.com/gmaps/) and more.  This project aims to be the rendering layer for your JavaScript App's Google maps.  That way you can focus on managing your app's state instead of Googling for Google Map examples, which makes Google feel self conscious.

How can you use this?  Take a look at how I'm using it in an [Ember.js addon here](https://github.com/Matt-Jensen/ember-cli-g-maps) to see how you could use it in framework/library/toolset of your choosing. GMaps For Apps is just plane old vanilla JavaScript, however _currently only supports IE 9+_.

Install
--------------------
`bower install gmaps-for-apps`

Loading the `gmaps.min.js` script will make available a global contructor function: **GMaps** 

Usage
-------
You can learn more about the usage from original project's links here:

Visit the examples in [hpneo.github.io/gmaps/examples.html](http://hpneo.github.io/gmaps/examples.html)
Go to the API Documentation [hpneo.github.io/gmaps/documentation.html](http://hpneo.github.io/gmaps/documentation.html)

There are updated examples in the `examples/` directory of this project.

So Why's It Better?
---------------------

The original [GMaps](https://github.com/hpneo/gmaps) is a fantasic abstraction for Google Maps. However, after working with GMaps in the context of Single Page App, there are issues that make it a pain in the derriere.  `GMaps For Apps` fixes all the issues so your web components can shine like a gleaming beacon of hope.

- No more context hijacking in map child events, now your functions can reference wherever (like your Controllers).
- Consistent storing of map children, no more arrays of [polygon, circle, polygon]
- Map children maintain references to their given id's.
- First class Info-Windows children.
- First class text element children.
- Event more event support for map children.
- Destroy map method so you can remove your Map with ease.
- Destroy any individual map child with remove{Child}(childInstanceObj).
- Destroy all of a map child type with remove{Child}s.
- Lots of performance optimizations, and reductions to memory leaks.
- Hugely increased Unit Test coverage.
- Source code and tests now pass standard JShinting.
- All methods are now add{Child}, no more confusing draw{Child} scattered about.
- Additional utility methods to help with data binding.
- Simplified in file structure and test runner so you can debug with ease.
- Adds edit events, consistend with event callback parameter conventions, to map children.

API Differences
-----------------

`GMaps For Apps` supports everything GMaps.js v0.4.18 supports including *Info-Window* and *text* elements as well as some utility functions helpful for managing application data bindings.  Below is the updated API:

Info Windows:
```js
    myGMapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        content: '<h3>Info Window</h3>',
        click: function() {
            alert('well that\'s alarming...');
        }
    });
    
    // stored in array:
    // myMapInstance.infoWindows
    
    // Supports events:
    // click, dblclick, mousedown, mousemove, mouseout, mouseover, mouseup, rightclick
```

Text Elements:
```js
      myGMapInstance.addText({
        lat: 30.257806291133193,
        lng: -97.72566276602447,
        text: 'text content only, its very simple',
        zIndex: 999
      });
      
    // stored in array:
    // myMapInstance.texts
    
    // Supports events:
    // click, dblclick, mousedown, mousemove, mouseout, mouseover, mouseup, rightclick
```

Destroying The GMap:
```js
    myMapInstance.destroy();
```
*Please note: destroying Google Maps have known memory leaking/performace issues.  GMaps-for-apps only manages to minimize these leaks.  Don't create or destroy more maps than you need to!*

**Utility Methods**

`hasChild(childInstance || id, typeString)`
```js
// search if child in map store exists w/ id
mayGMapInstance.hasChild('unique-id', 'infoWindow');

// search if child in map store w/ an instance
mayGMapInstance.hasChild(mapTextInstance, 'text');
```

`addDelegatedEvent(eventName, selector, callback)`
```js
    myGMapInstance.addInfoWindow({
        lat: 34.54148095772571,
        lng: -112.47004508972168,
        content: '<div id="my-selector">Info Window</div>',
    });
    
    // Binds event to root map element
    myMapInstance.addDelegatedEvent('click', '#my-selector', function() { console.log('delegate'); });
```

`geolocate` moved to `utils.geolocate`

**Adding Map Children**

No more drawOverlay, drawPolyline ect.  Everything can be refrenced simply as:

`addMarker`, `addInfoWindow`, `addPolygon`, `addPolyline`, `addRectangle`, `addOverlay`, and `addText`.

draw methods are still available but simply reference the associated add method.

**Removing Map Children**

Support for removing map children was spotty as well as memory leaky. All the methods to remove individual children are:

`removeMarker`, `removeOverlay`, `removeText`, `removePolygon`, `removePolyline`, `removeCircle`, `removeRectangle`, `removeInfoWindow`
    
Methods for removing all children in one go are:

`removeMarkers`, `removeOverlays`, `removeTexts`, `removePolygons`, `removePolylines`, `removeCircles`, `removeRectangles`, `removeInfoWindows`

Testing
---------
Happy to say GMaps For Apps has improved upon the solid test story of GMaps.  Now using Jasmine 2.3 and Karma on top of multiple web browsers. To test for your self clone the git repo and run:

```js
grunt test-release
```
Requires `node v0.12.7` & `grunt v0.4.1`


License
---------
MIT License. Copyright 2014 Gustavo Leon. http://github.com/hpneo

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
