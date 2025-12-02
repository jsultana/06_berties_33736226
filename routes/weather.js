var express = require('express');
var router = express.Router();
const request = require('request');

// Show the weather form (GET /weather)
router.get('/', function (req, res) {
    res.render('weather', { weatherMsg: null });
});

// Handle the form (POST /weather)
router.post('/', function (req, res, next) {

    let apiKey = process.env.WEATHER_API_KEY;
    let city = req.body.city || 'london';

    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) {
            return next(err);
        }

        let weather;
        try {
            weather = JSON.parse(body);
        } catch (e) {
            return res.render('weather', { weatherMsg: 'Error parsing weather data.' });
        }

        if (weather && weather.main) {
            let wmsg = `It is ${weather.main.temp} degrees in ${weather.name}! 
The humidity now is: ${weather.main.humidity}%`;
            return res.render('weather', { weatherMsg: wmsg });
        } else {
            return res.render('weather', { weatherMsg: 'No data found for that city.' });
        }
    });
});

module.exports = router;
