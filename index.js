"use strict";

(function () {
    require('dotenv').config();
    const express = require('express');
    const path = require('path');
    const bodyParser = require('body-parser');
    const app = express();const cors = require('cors');
    app.use(cors({
        origin: 'https://localhost:8080'
    }));
    let port = 8080;
//    app.set('views', path.join(__dirname, 'views'));
//    app.set('view engine', 'jade');
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.post('/', (req, res) => {
        let which = req.body.info;
        switch(which) {
            case 'lookUpLatLongByZip': {
                let url = "https://api.openweathermap.org/geo/1.0/zip?zip="+req.body.zip+"&appid="+process.env.OPEN_WX_MAP_KEY;
                fetch(url)
                    .then((result) => result.json())
                    .then((result) => {
                        res.send(JSON.stringify(result));
                    })
                    .catch((e) => {
                        console.log("There was an error getting lat-lon by zip! - Error object: " + e);
                    });
                break;
            }
            case 'getLocalWxData': {
                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.body.lat}&lon=${req.body.lon}&units=imperial&appid=${process.env.OPEN_WX_MAP_KEY}`
                fetch(url)
                    .then((result) => result.json())
                    .then((result) => {
                        res.send(JSON.stringify(result));
                    })
                    .catch((e) => {
                        console.log("There was an error getting local wx data! - Error object: " + e);
                    });
                break;
            }
            case 'lookUpLocationNameByLatLon': {
                let url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${req.body.lat}&lon=${req.body.lon}&limit=5&appid=${process.env.OPEN_WX_MAP_KEY}`
                fetch(url)
                    .then((result) => result.json())
                    .then((result) => {
                        res.send(JSON.stringify(result));
                    })
                    .catch((e) => {
                        console.log("There was an error getting local wx data! - Error object: " + e);
                    });
                break;
            }
            case 'getFiveDayData': {
                let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${req.body.lat}&lon=${req.body.lon}&units=imperial&appid=${process.env.OPEN_WX_MAP_KEY}`;
                console.log(url);
                fetch(url)
                    .then((result) => result.json())
                    .then((result) => {
                        res.send(JSON.stringify(result));
                    })
                    .catch((e) => {
                        console.log("There was an error getting local wx data! - Error object: " + e);
                    });
                break;
            }
            case 'getMapboxgl': {
                let tokenObj = {t:process.env.MAPBOX_KEY};
                res.send(JSON.stringify(tokenObj));
                break;
            }
            default: {
                console.log("Houston, we have a problem - client sent " + req.body.info);
                break;
            }
        }
    });

    app.listen(port, function () {
    });

    module.exports = app;

}());