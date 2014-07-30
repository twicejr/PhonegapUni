var app =
{
    state_online: null,
    remote: 'http://192.168.1.123/zppc-server/',
    api_page: 'api/json/read/pages',
    api_pagesum: 'api/json/read/pagesum',
    folder: 'zppc',
    cache_available: null,
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
        
        app.checkIfFileExists(app.folder + '/cache.json');
        if(!app.cache_available)
        {
            app.update(app.remote + app.api_page, 'cache.json');
        }
        else
        {
            console.log('You are golden');
        }
    },
    update: function(remote_file, local_file)
    {
        var returnvalue;
        //@todo: check if exists, check date. Re-fetch every day, if there updates only. 
        //@todo: get /set version framework / local
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) 
        {
            fileSystem.root.getDirectory(app.folder, {create: true, exclusive: false}, function(fileEntry) 
            {
                var local_path = fileEntry.toURL() + '/';
                var fileTransfer = new FileTransfer();
                fileTransfer.download
                (
                    remote_file,
                    local_path + local_file,
                    function(theFile) 
                    {
                        app.utilizeFile(theFile.toURL());
                    },
                    function(error)
                    {
                        console.log(error);
                        return false;
                    }
                );
            });
        });
        return returnvalue;
    },
    checkIfFileExists: function(path)
    {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
        {
            fileSystem.root.getFile(path, { create: false }, app.fileExists, app.fileDoesNotExist);
        }, app.fsFail);
    },
    fsFail: function(e)
    {
       console.log(e);
    },
    fileExists: function(fileEntry)
    {
        app.cache_available = true;
    },
    fileDoesNotExist: function(){
        app.cache_available = false;
    },
    utilizeFile: function(file_url)
    {
        $.ajax
        ({
            accepts: "application/json",
            beforeSend: function(x)
            {
                x.setRequestHeader("Content-Type","application/json");
            },
            url: file_url, //@todo: add language here , or will the auto detection on the framework side suffice?
            dataType: 'json',
            type: 'GET',
            error: function(xhr,error,code) {
                console.log(xhr);
                console.log(error);
                console.log(xhr);                  
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