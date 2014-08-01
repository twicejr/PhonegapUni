if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    $('.app').append('<p>' + message + '</p>');
};
console.error = console.debug = console.info = console.log;

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
        this.bindEvents();
    },
    bindEvents: function()
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', this.initialized, false);
    },
    initialized: function()
    {
        console.log('Device ready!');
        
        //@see www/config.xml also!!
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('offlineswitch', this.offlineSwitch, false);
        document.addEventListener('onlineswitch', this.whenReady, false);
        document.addEventListener("resume", this.whenReady, false);
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
        
        navigator.globalization.getLocaleName
        (
            function (locale) {this.lang = locale.value;},
            function () {console.log('Language could not be detected!');}
        );

        this.ready = true;
        this.whenReady();
    },
    onOffline: function()
    {
        if (this.state_online === false)
        {
            return;
        }
        this.state_online = false;
        var e = document.createEvent('Events');
        e.initEvent("offlineswitch");
        document.dispatchEvent(e);
    },
    onOnline: function()
    {
        console.log('We went online.');
        if (this.state_online === true)
        {
            console.log('..but we already were online and should have synced.');
            return;
        }
        this.state_online = true;
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
        if(!this.ready)
        {
            return;
        }
        
        fs.prepare(this.fsReady);
    },
    fsReady: function()
    {
        fs.download(this.remote + api_page, this.folder + '/' + this.cacheFile, this.downloadedCache);
    },
    downloadedCache: function(filename)
    {
        console.log(filename);
    },
    utilizeFile: function(file_url)
    {
        this.download(file_url, function(data)
        {
             this.utilizeData(data.data);
        });
    },
    download: function(file_url, successFunction)
    {
        var parameters = {lang: this.lang};
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