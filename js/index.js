var app = {
    initialize: function()
    {
        this.bindEvents();
    },
    
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('offline', this.onOffline, false);
    },
    
    onOnline: function()
    {
        alert('online');
    },
    onOffline: function()
    {
        alert('offline');
    },
    onDeviceReady: function() 
    {
        alert('ready');
    },
};
