var g,
GLoc = {

    settings: {
        geoButton: $('#geo-button'),
        geoErrorMessage: $('#geo-error-message'),
        startPos: '',
        searchQuery: '',
        closeButton: $('#close-error')
    },

    init: function() {
        g = this.settings;
        this.bindUIActions();
    },

    bindUIActions: function() {
        g.geoButton.on('click', function() {
            GLoc.getGeoLocation();
        });

        g.closeButton.on('click', function() {
            GLoc.hideGeoErrorMessageBanner();
        });

    },

    getGeoLocation: function(numToGet) {
        navigator.geolocation.getCurrentPosition(GLoc.geoSuccess, GLoc.geoError);
    },

    showGeoErrorMessageBanner: function() {
        g.geoErrorMessage.toggleClass('hide');
    },

    hideGeoErrorMessageBanner: function() {
        g.geoErrorMessage.addClass('hide');
    },

    geoSuccess: function(position) {
        // We have the location. Don't display the banner.
        GLoc.hideGeoErrorMessageBanner();

        // Do magic with the location
        g.startPos = position;
        g.searchQuery = 'http://api.openweathermap.org/data/2.5/weather?lat=' + g.startPos.coords.latitude + '&lon=' + g.startPos.coords.longitude + '';

        $.getJSON(g.searchQuery, function(data) {
            WeatherInfo.setWeatherData(data);
        });
    },

    geoError: function (error) {
        var geoErrorMessageTimeoutId = setTimeout(GLoc.showGeoErrorMessageBanner, 5000);
        switch (error.code) {
        case error.TIMEOUT:
            GLoc.showGeoErrorMessageBanner();
            break;
        }
    },
};

var w,
WeatherInfo = {

    settings: {
        tempIcon: $('#temp-icon'),
        weather: $('#weather'),
        weatherInfo: $('#weather-info'),
        location: $('#location'),
        weatherDescription: $('#weather-description'),
        temperature: $('#temperature'),
        tempNumber: '',
        fahrenheit: $('#fahrenheit'),
        celsius: $('#celsius'),
        wind: $('#wind'),
        searchLocationInput: $('#search-location-input'),
        searchLocationButton: $('#search-location-button'),
        celsiusButton: $('#celsius'),
        fahrenheitButton: $('#fahrenheit'),
        humidity: $('#humidity'),
        speedUnit: $('#speed-unit'),
        windSpeed: '',
        windDirection: $('#wind-direction'),
        windDegree: '',
        dayOrNight: '',
        closeAttribution: $('#close-attribution'),
        openAttribution: $('#noun-project'),
        attributionModal: $('#attribution-links')
    },

    init: function() {
        w = this.settings;
        this.bindUIActions();
        w.searchLocationInput.keypress (function(e) {
          if(e.keyCode === 13) {
            w.searchLocationButton.click();
          }
        });
    },

    bindUIActions: function() {
        w.searchLocationButton.on('click', function() {
            WeatherInfo.getWeatherData();
        });

        w.celsiusButton.on('click', function() {
            WeatherInfo.changeTempUnit('celsius');
        });

        w.fahrenheitButton.on('click', function() {
            WeatherInfo.changeTempUnit('fahrenheit');
        });

        w.closeAttribution.on('click', function() {
            WeatherInfo.closeAttributionModal();
        });

        w.openAttribution.on('click', function() {
            WeatherInfo.openAttributionModal();
        });
    },

    closeAttributionModal: function() {
        w.attributionModal.addClass('hide');
    },

    
    openAttributionModal: function() {
        w.attributionModal.removeClass('hide');
    },

    getWeatherData: function(searchQuery) {
        if (w.searchLocationInput.val() !== '') {
            w.searchQuery = 'http://api.openweathermap.org/data/2.5/weather?q=' + w.searchLocationInput.val() + '';
            $.getJSON(w.searchQuery, function(data) {
                WeatherInfo.setWeatherData(data);
            });
        }
    },

    setWeatherData: function(data) {
        GLoc.hideGeoErrorMessageBanner();
        $('#front-page-description').addClass('hide');
        w.weather.removeClass('hide');
        w.location.text(data.name + ', ' + data.sys.country);
        w.humidity.text(data.main.humidity);
        w.weatherDescription.text(data.weather[0].description);
        w.tempNumber = data.main.temp;
        w.windSpeed = data.wind.speed;
        w.windDegree = data.wind.deg;
        WeatherInfo.getWeatherDirection();
        WeatherInfo.changeTempUnit('celsius');
        var time = Date.now() / 1000;
        WeatherInfo.getDayOrNight(time, data.sys.sunrise, data.sys.sunset);
        CanvasBackground.chooseBackground(data.weather[0].main);
        
    },

    getWeatherDirection: function() {
        if (w.windDegree > 337.5 || w.windDegree <= 22.5) {
            w.windDirection.text('N');
        } else if (22.5 < w.windDegree <= 67.5) {
            w.windDirection.text('NE');
        } else if (67.5 < w.windDegree <= 112.5) {
            w.windDirection.text('E');
        } else if (112.5 < w.windDegree <= 157.5) {
            w.windDirection.text('SE');
        } else if (157.5 < w.windDegree <= 202.5) {
            w.windDirection.text('S');
        } else if (202.5 < w.windDegree <= 247.5) {
            w.windDirection.text('SW');
        } else if (247.5 < w.windDegree <= 292.5) {
            w.windDirection.text('W');
        } else if (292.5 < w.windDegree <= 337.5) {
            w.windDirection.text('NW');
        }

    },

    isValid: function(weatherDataPiece) {
        if (typeof weatherDataPiece !== undefined) {
            return weatherDataPiece + ' ';
        } else {
            return '';
        }
    }, 

    changeTempUnit: function(unit) {
        var newTemp = w.tempNumber - 273.15;
        if (unit === 'celsius') {
            w.celsius.addClass('checked');
            w.fahrenheit.removeClass('checked');
            w.temperature.addClass('celsius-degree');
            w.temperature.removeClass('fahrenheit-degree');
            w.temperature.html(Math.round(newTemp));
            WeatherInfo.changeSpeedUnit('km');
        } else if (unit === 'fahrenheit') {
            w.temperature.html(Math.round(9/5 * newTemp + 32));
            w.celsius.removeClass('checked');
            w.fahrenheit.addClass('checked');
            w.temperature.removeClass('celsius-degree');
            w.temperature.addClass('fahrenheit-degree');
            WeatherInfo.changeSpeedUnit('m');
        }
    },

    changeSpeedUnit: function(unit) {
        if (unit === 'km') {
            w.wind.text('' + Math.round(w.windSpeed * 3.6));
            w.speedUnit.text('km/h');
        } else if (unit === 'm') {
            w.wind.text('' + Math.round(w.windSpeed * 2.23694185194));
            w.speedUnit.text('mph');
        }
    },

    getDayOrNight: function(time, sunrise, sunset) {

        if (time >= sunrise && time < sunset) {
            w.dayOrNight = 'daytime';
        } else if (time < sunrise) {
            if (time < sunset - 86400) {
                w.dayOrNight = 'daytime';
            } else {
                w.dayOrNight = 'nighttime';
            }
        } else if (time > sunset) {
            if (time < sunrise + 86400) {
                w.dayOrNight = 'nighttime';
            } else {
                w.dayOrNight = 'daytime';
            }
        }
    }
};

var c,
CanvasBackground = {
    settings: {
        weatherBackground: $('#weather-background'),
        weatherCanvas: $('#weather-canvas')[0],
        weatherCTX: $('#weather-canvas')[0].getContext('2d'),
        rainCanvas: $('#rain-canvas')[0],
        rainCTX: $('#rain-canvas')[0].getContext('2d'),
        cloudCanvas: $('#cloud-canvas')[0],
        cloudCTX: $('#cloud-canvas')[0].getContext('2d'),
        timeCanvas: $('#time-canvas')[0],
        timeCTX: $('#time-canvas')[0].getContext('2d'),
        lightningCanvas: $('#lightning-canvas')[0],
        lightningCTX: $('#lightning-canvas')[0].getContext('2d'),
        bgChoice: '',
        iconColor: {
            defaultWeather: '#9AD4E0',
            thunderstorm: '#717F8E',
            drizzle: '#63A6CC',
            rain: '#63A6CC',
            snow: '#B5B9BB',
            atmosphere: '#CED1DD',
            clouds: '#6AB7E3',
            extremeWeather: '#D3746B',
            clearsky: '#9AD4E0',
        },
        requestRain: '',
        requestCloud: '',
        requestWeather: '',
        requestTime: '',
        refreshIntervalID: ''
    },

    init: function() {
        c = this.settings;
        CanvasBackground.setupCanvas();
        CanvasBackground.chooseBackground();
    },

    setupCanvas: function() {
        CanvasBackground.resizeBackground();
        window.addEventListener('resize', CanvasBackground.resizeBackground, false);
        window.addEventListener('orientationchange', CanvasBackground.resizeBackground, false);
    },
    resizeBackground: function() {                 
        /* Resize the canvas to occupy the full page, 
           by getting the widow width and height and setting it to canvas*/
         
        c.weatherCanvas.width  = window.innerWidth;
        c.weatherCanvas.height = window.innerHeight;
        c.rainCanvas.width  = window.innerWidth;
        c.rainCanvas.height = window.innerHeight;
        c.cloudCanvas.width  = window.innerWidth;
        c.cloudCanvas.height = window.innerHeight;
        c.timeCanvas.width  = window.innerWidth;
        c.timeCanvas.height = window.innerHeight;
        c.lightningCanvas.width = window.innerWidth;
        c.lightningCanvas.height = window.innerHeight;
    },

    chooseBackground: function(condition) {
        c.bgChoice = condition;

        c.weatherBackground.removeClass();
        c.weatherBackground.addClass(w.dayOrNight);

        switch (condition) {
          
          case 'Drizzle':
            c.weatherBackground.addClass('drizzle');
            CanvasBackground.clearAllCanvases();
            color_var = c.iconColor.drizzle;
            CanvasBackground.animateRain('drizzle');
            CanvasBackground.animateClouds();
            CanvasBackground.animateTime();
            break;
          case 'Rain':
            CanvasBackground.clearAllCanvases();
            c.weatherBackground.addClass('rain');
            color_var = c.iconColor.rain;
            CanvasBackground.animateRain('rain');
            CanvasBackground.animateClouds();
            CanvasBackground.animateTime();
            break;
        
          case 'Clouds':
            c.weatherBackground.addClass('clouds');
            CanvasBackground.clearAllCanvases();
            color_var = c.iconColor.clouds;
            CanvasBackground.animateClouds();
            CanvasBackground.animateTime();
            break;
          default:
            
            c.weatherBackground.addClass('default-weather');
            color_var = c.iconColor.defaultWeather;
            c.weatherBackground.addClass('rain');
            CanvasBackground.animateRain('rain');
            c.weatherBackground.addClass('clouds');
            CanvasBackground.animateClouds();
            CanvasBackground.animateTime();
            CanvasBackground.animateClouds();
            CanvasBackground.animateTime();
            break;
        }
    },

    getRandomBackground: function() {
        
        var possibleAnimations = [CanvasBackground.animateRain, CanvasBackground.animateClouds];
        var randomAnimation = Math.round(Math.random() * (possibleAnimations.length - 1));
        return possibleAnimations[randomAnimation]();
    },

    clearAllCanvases: function() {
        clearInterval(c.refreshIntervalID);
        cancelAnimationFrame(c.requestRain);
        cancelAnimationFrame(c.requestCloud);
        cancelAnimationFrame(c.requestWeather);
        cancelAnimationFrame(c.requestTime);
        c.weatherCTX.clearRect(0,0,c.weatherCanvas.width,c.weatherCanvas.height);
        c.timeCTX.clearRect(0,0,c.timeCanvas.width,c.timeCanvas.height);
        c.rainCTX.clearRect(0,0,c.rainCanvas.width,c.rainCanvas.height);
        c.cloudCTX.clearRect(0,0,c.cloudCanvas.width,c.cloudCanvas.height);
        c.lightningCTX.clearRect(0,0,c.lightningCanvas.width,c.lightningCanvas.height);
    },

    animateRain: function(condition) {
        var rainSvg = '<svg width="28px" height="39px" viewBox="0 0 28 39" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>rain</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="rain" sketch:type="MSLayerGroup" transform="translate(-10.000000, -6.000000)" fill="' + color_var + '"><g id="Page-1" sketch:type="MSShapeGroup"><path d="M33.5,33.5 C33.5,40.1273333 28.1266667,45.5 21.5,45.5 C14.8726667,45.5 9.5,40.1273333 9.5,33.5 C9.5,21.5 21.5,3.50000001 21.5,3.50000001 C21.5,3.50000001 33.5,21.5 33.5,33.5 L33.5,33.5 L33.5,33.5 Z" id="rain" transform="translate(21.500000, 24.500000) rotate(-30.000000) translate(-21.500000, -24.500000) "></path></g></g></g></svg>';


        var rainDrops = [],
            maxSpeed = 10,
            spacing = 50,
            xSpacing = 0,
            n = innerWidth / spacing,
            sizes = [[28,39], [24, 33], [20, 28]],
            i;
            

            if (condition === 'drizzle') {
                rainSvg = '<svg width="28px" height="39px" viewBox="0 0 28 39" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>rain</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="rain" sketch:type="MSLayerGroup" transform="translate(-10.000000, -6.000000)" fill="' + color_var + '"><g id="Page-1" sketch:type="MSShapeGroup"><path d="M33.5,33.5 C33.5,40.1273333 28.1266667,45.5 21.5,45.5 C14.8726667,45.5 9.5,40.1273333 9.5,33.5 C9.5,21.5 21.5,3.50000001 21.5,3.50000001 C21.5,3.50000001 33.5,21.5 33.5,33.5 L33.5,33.5 L33.5,33.5 Z" id="rain" transform="translate(21.500000, 24.500000) rotate(0.000000) translate(-21.500000, -24.500000) "></path></g></g></g></svg>';
                spacing = 10;
                n = innerWidth / spacing;
                sizes = [[10, 14], [15, 20.8]];
            }

        // Create a Data URI.
        var rainSrc = 'data:image/svg+xml;base64,'+window.btoa(rainSvg);
         
        // Load up our image.
        var rainSource = new Image();
        rainSource.src = rainSrc;

            for (i = 0; i < n; i++){
                for(x=0;x<sizes.length;x++) {
                    xSpacing += spacing;
                    if (condition === 'drizzle') {
                        rainDrops.push({
                            x: Math.round(Math.random()*c.rainCanvas.width),
                            y: Math.round(Math.random()*c.rainCanvas.height),
                            width: Math.round(Math.random()*(innerWidth/10)),
                            height: 1,
                            speed: Math.random()*maxSpeed + 2,
                            imgWidth: sizes[x][0],
                            imgHeight: sizes[x][1]
                        });  

                    } else {
                        rainDrops.push({
                            x: xSpacing,
                            y: Math.round(Math.random()*c.rainCanvas.height),
                            width: 2,
                            height: Math.round(Math.random()*(innerHeight/10)),
                            speed: Math.random()*maxSpeed + 5,
                            imgWidth: sizes[x][0],
                            imgHeight: sizes[x][1]
                        });  
                    }

                }
                
            }

            function draw(){
                var i;
                c.rainCTX.clearRect(0,0,c.rainCanvas.width,c.rainCanvas.height);

                for (i = 0; i < n; i++){
                    c.rainCTX.drawImage(rainSource, rainDrops[i].x, rainDrops[i].y, rainDrops[i].imgWidth, rainDrops[i].imgHeight);
                    if (condition === 'drizzle') {
                        rainDrops[i].y += rainDrops[i].speed;
                        rainDrops[i].x = rainDrops[i].x;
                        if (rainDrops[i].y > c.rainCanvas.height) {
                            rainDrops[i].y = 0 - rainDrops[i].height;
                            rainDrops[i].x = Math.random() * c.rainCanvas.width;
                        }
                    } else {
                        rainDrops[i].y += rainDrops[i].speed;
                        rainDrops[i].x += rainDrops[i].speed/2;                   
                        if (rainDrops[i].y > c.rainCanvas.height) 
                            rainDrops[i].y = 0 - rainDrops[i].height;

                        if (rainDrops[i].x > c.rainCanvas.width)
                            rainDrops[i].x = 0;
                    }
                }
             
                
                c.requestRain = requestAnimationFrame(draw);
                
            }
            draw();
    },

    animateClouds: function() {
        
        var cloudSvg = '<svg width="100px" height="55px" viewBox="0 0 100 55" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>Group</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="cloud" sketch:type="MSLayerGroup" fill="' + color_var + '"><g id="Group" sketch:type="MSShapeGroup"><path d="M83.336,20.018 C81.412,13.644 75.501,9 68.5,9 C66.193,9 64.013,9.518 62.046,10.421 C57.008,4.074 49.232,0 40.5,0 C26.11,0 14.31,11.053 13.108,25.132 C5.719,26.064 0,32.358 0,40 C0,48.284 6.716,55 15,55 L83,55 C92.389,55 100,47.165 100,37.5 C100,27.952 92.568,20.204 83.336,20.018 L83.336,20.018 Z" id="Shape"></path><path d="M15,51 C8.935,51 4,46.065 4,40 C4,34.478 8.131,29.792 13.609,29.101 L16.819,28.696 L17.094,25.473 C18.122,13.432 28.403,4 40.5,4 C47.708,4 54.419,7.247 58.913,12.908 L60.864,15.366 L63.716,14.056 C65.241,13.355 66.851,13 68.5,13 C73.528,13 78.054,16.361 79.507,21.173 L80.347,23.958 L83.255,24.017 C90.283,24.158 96,30.207 96,37.5 C96,44.944 90.168,51 83,51 L15,51 L15,51 Z" id="Shape"></path></g></g></g></svg>';
         
        // Create a Data URI.
        var cloudSrc = 'data:image/svg+xml;base64,'+window.btoa(cloudSvg);
         
        // Load up our image.
        var cloudSource = new Image();
        cloudSource.src = cloudSrc;

        var cloudArray = [],
            maxSpeed = 2,
            spacing = 100,
            xSpacing = 0,
            n = innerWidth / spacing,
            sizes = [[100,55], [90, 49.5], [80, 44]],
            i;
            
            for (i = 0; i < n; i++){
                for(x=0;x<sizes.length;x++) {
                    xSpacing += spacing;
                    cloudArray.push({
                        x: xSpacing,
                        y: Math.round(Math.random()*c.cloudCanvas.height),
                        width: 2,
                        height: Math.round(Math.random()*(innerHeight/10)),
                        speed: Math.random()*maxSpeed + 1,
                        imgWidth: sizes[x][0],
                        imgHeight: sizes[x][1],
                        img: cloudSource
                    });
                } 
            }
            
            function draw(){
                var i;
                c.cloudCTX.clearRect(0,0,c.cloudCanvas.width,c.cloudCanvas.height);
                
                for (i = 0; i < n; i++){
                    c.cloudCTX.drawImage(cloudArray[i].img, cloudArray[i].x, cloudArray[i].y, cloudArray[i].imgWidth, cloudArray[i].imgHeight);
                    cloudArray[i].y = cloudArray[i].y;
                    cloudArray[i].x += cloudArray[i].speed/1.5;
                    
                    if (cloudArray[i].y > c.cloudCanvas.height)
                        cloudArray[i].y = 0 - cloudArray[i].height;

                    if (cloudArray[i].x > c.cloudCanvas.width)
                        cloudArray[i].x = 0 - 100;
             }
             
                
                c.requestCloud = requestAnimationFrame(draw);
                
            }
            draw();
    },

    
    

    

    


};

$(function() {
    GLoc.init();
    WeatherInfo.init();
    CanvasBackground.init();
});
