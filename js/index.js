var app =
{
    state_online: null,
    remote: 'http://test.visietest.nl/zppc/api/json/read/app',
    pagadata: null,
    initialize: function()
    {
        app.bindEvents();
    },
    bindEvents: function()
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', app.initialized, false);

        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', app.onOnline, false);
        document.addEventListener('onlineswitch', app.sync, false);
        document.addEventListener('offline', app.onOffline, false);
        document.addEventListener('offlineswitch', app.wentOffline, false);

        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
    },
    initialized: function()
    {
        // Do stuff.
    },
    onOnline: function()
    {
        if (app.state_online === true)
        {
            return;
        }
        app.state_online = true;
        var e = document.createEvent('Events');
        e.initEvent("onlineswitch");
        document.dispatchEvent(e);
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
    wentOffline: function()
    {
        alert('Offline. When we have a certain version to use, we are cool. Notify the user about it.');
    },
    sync: function()
    {
        if(!app.state_online)
        {
            return;
        }
        
        //@todo: sync data, but only when new! and call app.utilizeData();
        $.ajax
        ({
            accepts: "application/json",
            beforeSend: function(x)
            {
                x.setRequestHeader("Content-Type","application/json");
            },
            url: app.remote, //@todo: add language here :)
            dataType: 'json',
            type: 'GET',
            //@todo: error handling etc... make it beautiful
            error: function(xhr,error,code) {
                // SOMETHING WRONG WITH YOUR CALL.
                  alert(error); 
                  alert(xhr); 
                  alert(code); 
            },
            success: function(data) 
            {
                //Store json.
                app.utilizeData(data.data);
            }
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
        $.mobile.changePage('#home'); //@todo: the last remembered page :)
        
    }
};
