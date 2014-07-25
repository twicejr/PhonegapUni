var app = 
{    
    state_online: null,
    
    initialize: function()
    {
        this.bindEvents();
    },
    
    bindEvents: function() 
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('onlineswitch', this.wentOnline, false);
        document.addEventListener('offline', this.onOffline, false);
        document.addEventListener('offlineswitch', this.wentOffline, false);
        
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
    },
    onOnline: function()
    {
        if(this.state_online === true)
        {
            return;
        }
        this.state_online = true;
        var e = document.createEvent('Events'); 
        e.initEvent("onlineswitch"); 
        document.dispatchEvent(e);
    },
    onOffline: function()
    {
        if(this.state_online === false)
        {
            return;
        }
        this.state_online = false;
        var e = document.createEvent('Events'); 
        e.initEvent("offlineswitch"); 
        document.dispatchEvent(e);
    },
    wentOnline: function()
    {
        alert('Online. Time to sync the data.');
    },
    wentOffline: function()
    {
        alert('Offline. When we have a certain version to use, we are cool. Notify the user about it.');
    },
    onDeviceReady: function() 
    {
        alert('Booted up.');
    },
};
