var app =
{
    ready: false,
    state_online: null,
    remote: 'http://192.168.1.123/zppc-server/',
    api_page: 'api/json/read/pages',
    api_pagesum: 'api/json/read/pagesum',
    folder: 'zppc',
    cacheFile: null,
    initialize: function()
    {
        console.log('Binding events...');
        app.bindEvents();
    },
    bindEvents: function()
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', app.initialized, false);
        
        //@see www/config.xml also!!
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', app.onOnline, false);
        document.addEventListener('onlineswitch', app.whenOnline, false);
        document.addEventListener("resume", app.whenOnline, false);
        document.addEventListener('offline', app.onOffline, false);
        document.addEventListener('offlineswitch', app.wentOffline, false);
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
    },
    initialized: function()
    {
        console.log('Device ready!');
        app.ready = true;        
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
        
        if(!app.state_online)
        {
            console.log('Not online (anymore). Cannot sync.');
            return;
        }
        
        app.updateIfRequired(app.folder + '/cache.json');
    },
    download: function(file_url, successFunction)
    {
        console.log('Download file ' + file_url);
        $.ajax
        ({
            url: file_url,
            dataType: 'json',
            type: 'GET',
            error: function(xhr,error,code) 
            {
                console.log('Error ' + error + xhr + code);
            },
            success: successFunction
        });  
    },
    updateIfRequired: function(path)
    {
        console.log('Checking if we already have a cachefile..');
        if(app.cacheFile)
        {
            //@todo:might want to return now, and periodically check only...
        }
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
        {
            fileSystem.root.getFile(path, { create: false }, function(fileEntry)
            {
                app.cacheFile = fileEntry.toURL();
                console.log('.. we already have data at ' + app.cacheFile + ' . Checking if it is up to date before using it..');
                
                app.download(app.cacheFile, function(data)
                {
                    app.updateWhenNewVersion(app.remote + app.api_pagesum, data.data.sum); //subarr
                });
            }, function()
            {
                app.cacheFile = false;
                console.log('.. no data. Fetching data now.');
                app.update(app.remote + app.api_page, 'cache.json');
            });
        }, function(e)
        {
           console.log('..error in checking if the file exists!' + e);
        });
    },
    updateWhenNewVersion: function(remote_file, checksum)
    {
        app.download(remote_file, function(data)
        {
            if(checksum == data.data)
            {
                console.log('..we are up to date!');
                
                if($('.app').hasClass('initializing'))
                {
                    console.log('Using the data we have..');
                    app.utilizeFile(app.cacheFile);
                }
                else
                {
                    console.log('App is already loaded with latest data.');
                }
            }
            else
            {
                console.log('.. data is old (' + data.data + ' | ' + checksum + '). Fetching data now.');
                app.update(app.remote + app.api_page, 'cache.json');
            }
        });
    },
    update: function(remote_file, local_file)
    {
        $('.app').addClass('initializing'); //could be that it is already added, or that we are actually RE-initializing.
        
        var returnvalue;
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
        app.download(file_url, function(data)
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