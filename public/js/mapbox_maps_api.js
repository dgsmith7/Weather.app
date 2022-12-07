"use strict";

(function () {

    let map;  // map object
    let places = [];  // array of markers, popup, and animation info
    let restaurants;  //  container for dat from file
    let markerVisibility = true;  // for toggling markers
    mapboxgl.accessToken = MAPBOX_KEY;

    function createMap() {// Create and set map on City Center
        map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [14.420628, 50.088329], // starting position [lng, lat]
            zoom: 15, // starting zoom
            projection: 'globe' // display the map as a 3D globe
        });
        map.on('style.load', () => {  // don't do stuff until map loads
            setTimeout(() => {  // after style loads on map, wait 1.5 seconds to build markers and start icon animations
                buildMarkersAndPopups();
                requestAnimationFrame(animateMarkers);
            }, 1500)
        });
    }

    function loadRestaurantData() {  // use ajax to get restaurant dat from file
        $.ajax("./data/restaurants.json").done(function (data, status, jqXhr) {
            restaurants = data;  // assign file contents to global variable
        }).fail(function (jqXhr, status, error) {
            alert("There was an error! Check the console for details");
            console.log("Response status: " + status);
            console.log("Error object: " + error);
        });
    }

    function buildMarkersAndPopups() {
        restaurants.forEach((element, index) => {  // for each restaurant in our data, build the marker and popup
            // create a HTML element for each feature
            const el = document.createElement('div');  // put marker inside div for custom image and animation
            el.className = 'custom-marker';  //  allows for css styling of all markers
            el.id = 'marker' + index;
            el.setAttribute("style", `background-image:url("../assets/icons/${element.iconFile}");`);  // icon filename in json
            let popup = new mapboxgl.Popup()
                .setLngLat(element.lngLat)  // set location on map
                // inject html to make it a bootstrap card
                .setHTML(`<div class="card">
                            <div class="card-body">
                                <div class="card-title"><strong>${element.name}</strong></div><hr/>
                                <div class="card-subtitle text-muted"><em>${element.address}</em></div><hr/>
                                <div class="card-text">${element.info}</div>
                            </div>
                        </div>`);
            let marker = new mapboxgl.Marker(el)  // make the marker inside our new div
                .setLngLat(element.lngLat)
                .addTo(map)
                .setPopup(popup);
            popup.addTo(map);
            if (popup.isOpen) {  // keeps popups from being open at startup
                marker.togglePopup();
            }
            let bouncing = true;  // indicates that w want to start anim when loading
            let bounceFrames = 0;  //  set animation to beginning
            places.push({popup, marker, bouncing, bounceFrames});  //  push all of this stuff to out array of locations
        });
    }

    function setZoomLevel(e) {
        e.preventDefault(); //  prevent page refresh
        let zl = document.querySelector('#zoom-level').value;  // gets value from selector
        map.setZoom(zl);  // zooms map to appropriate level
    }

    function recenter(e) {
        e.preventDefault(); //  prevent page refresh
        let newAddress = document.querySelector('#recenter-address').value; // gets value from inout
        geocode(newAddress, MAPBOX_KEY).then(function (coordinates) {  // get lngLat from address
            // create a HTML element for each feature
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.id = 'marker' + places.length;
            el.setAttribute("style", `margin-top: 3px; background-image:url("../assets/icons/noun-location-5256157.png");`);
            let popup = new mapboxgl.Popup() //  next 10 or 15 lines are similar to function above, consider refactoring
                .setLngLat(coordinates)
                .setHTML(`<div class="card">
                            <div class="card-body">
                                <div class="card-title"><strong>${newAddress}</strong></div><hr/>
                                <div class="card-subtitle text-muted"><em>${coordinates}</em></div>
                            </div>
                        </div>`);
            let marker = new mapboxgl.Marker(el)
                .setLngLat(coordinates)
                .addTo(map)
                .setPopup(popup);
            popup.addTo(map);
            if (popup.isOpen) {
                marker.togglePopup();
            }
            let bouncing = true;
            let bounceFrames = 0;
            places.push({popup, marker, bouncing, bounceFrames});
            map.flyTo({  // recenters map with a flight animation
                center: coordinates,
                speed: 0.5,
                curve: 0.5,
                duration: 5000,
                easing(t) {
                    return t;
                }
            });
        });
    }

    function toggleMarkers(e) {  // turns markers on and off
        e.preventDefault(); //  prevent page refresh
        markerVisibility = !markerVisibility;  // toggles marker visibility
        places.forEach((element) => {  // turns markers on or off
            if (markerVisibility === true) {
                element.marker.addTo(map);
            } else {
                element.marker.remove();
            }
        });
    }

    function animateMarkers() {  // animation sequence for markers
        let timestamp = performance.now();  // get current timestamp for use in animation calculations
        const len = .0001;  // distance I want to displace icons during anim
        places.forEach((element, index) => {  // animate each element
            if (element.bouncing === true && index <= 4) {  // if bouncing is on then do stuff
                element.marker.setLngLat([  // set new location based on calcs
                    restaurants[index].lngLat.lng,// no motion in x axis
                    restaurants[index].lngLat.lat + Math.sin((timestamp / 120)) * len // move y axis up - sine wave will pulse based on timestamp
                ]);
                element.marker.addTo(map);  // add new marker to map
                element.bounceFrames++;  // increase frames by one
                if (element.bounceFrames >= 120) {  // 2 sec, assuming 60FPS = 120 frames
                    element.bounceFrames = 0;  // once finished set back to beginning
                    element.bouncing = false;  // and turn off the animation
                    element.marker.setLngLat([  // and put markers back where they belong
                        restaurants[index].lngLat.lng,
                        restaurants[index].lngLat.lat
                    ]);
                }
            }
        });
        requestAnimationFrame(animateMarkers); // Request the next frame of the animation.
    }

    loadRestaurantData();
    createMap();
    // event handlers
    $('#zoom-level').on('change', setZoomLevel);
    $('#recenter').on('click', recenter);
    $('#toggle-markers').on('click', toggleMarkers);
}());