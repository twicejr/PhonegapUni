var app =
{
    ready: false,
    state_online: null,
    remote: 'http://192.168.1.123/zppc-server/',
    api_page: 'api/json/read/pages',
    api_pagesum: 'api/json/read/pagesum',
    folder: 'zppc',
    cacheFile: null,
    pagadata: null,
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
        app.ready = true;        
        $('.app').removeClass('initializing');
        
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', app.onOnline, false);
        document.addEventListener('onlineswitch', app.whenOnline, false);
        document.addEventListener('offline', app.onOffline, false);
        document.addEventListener('offlineswitch', app.wentOffline, false);
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
        
        app.whenOnline();
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
    whenOnline: function()
    {
        if(!app.ready)
        {
            return;
        }
        
        if(app.cacheFile)
        {
            console.log('Went online but we have data already. Stopping refresh.'); //@todo: or maybe check each x minutes.
            return;
        }
        
        if(!app.state_online)
        {
            console.log('Not online (anymore). Cannot sync.');
            return;
        }
        
        app.updateIfRequired(app.folder + '/cache.json');
    },
    updateIfRequired: function(path)
    {
        console.log('Checking if we already have a cachefile..');
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
        {
            fileSystem.root.getFile(path, { create: false }, function(fileEntry)
            {
                app.cacheFile = fileEntry.toURL();
                console.log('.. we already have data at ' + app.cacheFile);
                app.utilizeFile(app.cacheFile);
                
            }, function()
            {
                app.cacheFile = false;
                console.log('.. no data. Fetching data now.'); //@todo: check for latest
                app.update(app.remote + app.api_page, 'cache.json');
            });
        }, function(e)
        {
           console.log('..error in checking if the file exists!' + e);
        });
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
                        console.log('Downloaded the latest version.');
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
    utilizeFile: function(file_url)
    {
        console.log('Utilizing datafile: ' + file_url);
        $.ajax
        ({
            url: file_url,
            dataType: 'json',
            type: 'GET',
            error: function(xhr,error,code) 
            {
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
        
        var activePage = $.mobile.activePage.attr("id");
        if(activePage)
        {
            activePage = '#' + activePage;
        }
        else
        {
            activePage = '#home';
        }
        $.mobile.changePage(activePage);
    }
};