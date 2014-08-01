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
        app.bindEvents();
    },
    bindEvents: function()
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', app.initialized, false);
        
        //@see www/config.xml also!!
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', app.onOnline, false);
        document.addEventListener('offline', app.onOffline, false);
        document.addEventListener('offlineswitch', app.offlineSwitch, false);
        document.addEventListener('onlineswitch', app.whenReady, false);
        document.addEventListener("resume", app.whenReady, false);
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
        
    },
    initialized: function()
    {
        console.log('Device ready!');
        
        navigator.globalization.getLocaleName
        (
            function (locale) {app.lang = locale.value;},
            function () {console.log('Language could not be detected!');}
        );

        app.ready = true;
        app.whenReady();
    },
    onOffline: function()
    {
        if (app.state_online === false)
        {
            return;
        }
        app.state_online = false;
        var e = document.createEvent('Events');
        e.initEvent("offlineswitch");
        document.dispatchEvent(e);
    },
    onOnline: function()
    {
        console.log('We went online.');
        if (app.state_online === true)
        {
            console.log('..but we already were online and should have synced.');
            return;
        }
        app.state_online = true;
        var e = document.createEvent('Events');
        e.initEvent("onlineswitch");
        document.dispatchEvent(e);
    },
    offlineSwitch: function()
    {
        console.log('We went offline.');
    },
    whenReady: function()
    {
        if(app.ready)
        {
            fs.prepare(app.fsReady);
        }
    },
    fsReady: function()
    {
        if(app.state_online)
        {
            fs.download(app.remote + app.api_page, app.cacheFile, app.folder, app.downloadResult);
        }
        else
        {
            console.log('We are offline');
        }
    },
    downloadResult: function(filename)
    {
        if(!filename)
        {
            console.log('Fubar');
            return;
        }
    },
    utilizeFile: function(file_url)
    {
        fs.getFileContents(file_url, function(data)
        {
             app.utilizeData(data.data);
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