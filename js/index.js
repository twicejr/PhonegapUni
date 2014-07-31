if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    $('.app').append('<p>' + message + '</p>');
};
console.error = console.debug = console.info =  console.log;

var app =
{
    ready: false,
    lang: 'nl',
    state_online: null,
    remote: 'http://test.visietest.nl/zppc/',
    local_cachefile: 'cache.json',
    api_page: 'api/json/read/pages',
    api_pagesum: 'api/json/read/pagesum',
    folder: 'zppc',
    cacheFile: 'pages.json', //temptest
    initialize: function()
    {
        console.log('Binding events...');
        app.bindEvents();
    },
    bindEvents: function()
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', app.initialized, false);
    },
    initialized: function()
    {
        console.log('Device ready!');
        //@see www/config.xml also!!
        
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', app.onOnline, false);
        document.addEventListener('onlineswitch', app.whenReady, false);
        document.addEventListener("resume", app.whenReady, false);
        document.addEventListener('offline', app.onOffline, false);
        document.addEventListener('offlineswitch', app.wentOffline, false);
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
        
        app.ready = true;
        navigator.globalization.getLocaleName
        (
            function (locale) {app.lang = locale.value;},
            function () {console.log('Language could not be detected!');}
        );

        app.whenReady();
    },
    onOnline: function()
    {
        console.log('Device changed connection to online..');
        if (app.state_online === true)
        {
            console.log('..but we already were online.');
            return;
        }
        app.state_online = true;
        var e = document.createEvent('Events');
        e.initEvent("onlineswitch");
        document.dispatchEvent(e);
    },
    onOffline: function()
    {
        console.log('Device changed connection to offline.');
        if (app.state_online === false)
        {
            console.log('..but we already were offline.');
            return;
        }
        app.state_online = false;
        var e = document.createEvent('Events');
        e.initEvent("offlineswitch");
        document.dispatchEvent(e);
    },
    wentOffline: function()
    {
        
    },
    whenReady: function()
    {
        if(!app.ready)
        {
            return;
        }
        app.utilizeFile(app.cacheFile);
    },
    utilizeFile: function(file_url)
    {
        app.download(file_url, function(data)
        {
             app.utilizeData(data.data);
        });
    },
    download: function(file_url, successFunction)
    {
        var parameters = {lang: app.lang};
        console.log('Download file ' + file_url);
        $.ajax
        ({
            url: file_url,
            data: parameters,
            dataType: 'json',
            type: 'GET',
            error: function(xhr,error,code) 
            {
                console.log(xhr);
                console.log(error);
                console.log(code);
            },
            success: successFunction
        });  
    },
    utilizeData: function(data)
    {
        if(data.css)
        {
            $('#style_remote').remove();
            $('head').append('<style type="text/css" id="style_remote">' + data.css + '</style>');
        }
        $('body').html(data.pagedata);
        
        var activePage = $.mobile.activePage.attr("id");
        if(activePage)
        {
            activePage = '#' + activePage;
        }
        else
        {
            activePage = '#home';
        }
        
        $('.app').removeClass('initializing');
        $.mobile.changePage(activePage);
    }
};