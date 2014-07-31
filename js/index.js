var app =
{
    ready: false,
    lang: 'nl',
    state_online: null,
    remote: 'http://test.visietest.nlzppc/',
    local_cachefile: 'cache.json',
    api_page: 'api/json/read/pages',
    api_pagesum: 'api/json/read/pagesum',
    folder: 'zppc',
    cacheFile: null,
    initialize: function()
    {
        alert('Binding events...');
        app.bindEvents();
    },
    bindEvents: function()
    {
        // Possible events: deviceready    pause    resume    backbutton    menubutton    searchbutton    startcallbutton    endcallbutton    volumedownbutton    volumeupbutton
        document.addEventListener('deviceready', app.initialized, false);
        
        //@see www/config.xml also!!
        // org.apache.cordova.network-information: online offline
        document.addEventListener('online', app.onOnline, false);
        document.addEventListener('onlineswitch', app.whenReady, false);
        document.addEventListener("resume", app.whenReady, false);
        document.addEventListener('offline', app.onOffline, false);
        document.addEventListener('offlineswitch', app.wentOffline, false);
        // org.apache.cordova.battery-status: batterycritical    batterylow    batterystatus
    },
    initialized: function()
    {
        alert('Device ready!');
        app.ready = true;
        navigator.globalization.getLocaleName
        (
            function (locale) {app.lang = locale.value},
            function () {alert('Language could not be detected!');}
        );

        app.whenReady();
    },
    onOnline: function()
    {
        alert('Device changed connection to online..');
        if (app.state_online === true)
        {
            alert('..but we already were online.');
            return;
        }
        app.state_online = true;
        var e = document.createEvent('Events');
        e.initEvent("onlineswitch");
        document.dispatchEvent(e);
    },
    onOffline: function()
    {
        alert('Device changed connection to offline.');
        if (app.state_online === false)
        {
            alert('..but we already were offline.');
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
        
        app.updateAndOrInitializeData(app.folder + '/' + app.local_cachefile);
    },
    download: function(file_url, successFunction)
    {
        var parameters = {lang: app.lang};
        alert('Download file ' + file_url);
        $.ajax
        ({
            url: file_url,
            data: parameters,
            dataType: 'json',
            type: 'GET',
            error: function(xhr,error,code) 
            {
                app.useCurrentData(); //If local data is available, use that...
            },
            success: successFunction
        });  
    },
    updateAndOrInitializeData: function(path)
    {
        alert('Checking if we already have a cachefile..');
        if(app.cacheFile)
        {
            //@todo:might want to return now, and periodically check only...
        }
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem)
        {
            fileSystem.root.getFile(path, { create: false }, function(fileEntry)
            {
                app.cacheFile = fileEntry.toURL();
                alert('.. we already have data at ' + app.cacheFile + ' . Checking if it is up to date before using it..');
                
                app.download(app.cacheFile, function(data)
                {
                    app.updateWhenNewVersion(app.remote + app.api_pagesum, data.data.sum); //subarr
                });
            },
            function()
            {
                app.cacheFile = false;
                alert('.. no data. Fetching data now.');
                if(!app.state_online)
                {
                    alert('Not online (anymore). Cannot sync.');
                    return;
                }
                app.update(app.remote + app.api_page, app.local_cachefile);
            });
        }, function(e)
        {
           alert('..error in checking if the file exists!' + e);
        });
    },
    updateWhenNewVersion: function(remote_file, checksum)
    {
        if(!app.state_online)
        {
            app.useCurrentData();
            return;
        }
        app.download(remote_file, function(data)
        {
            if(checksum == data.data)
            {
                app.useCurrentData();
            }
            else
            {
                alert('.. data is old (' + data.data + ' | ' + checksum + '). Fetching data now.');
                app.update(app.remote + app.api_page, app.local_cachefile);
            }
        });
    },
    useCurrentData: function()
    {
        alert('..we are up to date!');
        if($('.app').hasClass('initializing'))
        {
            alert('Using the data we have..');
            app.utilizeFile(app.cacheFile);
        }
        else
        {
            alert('App is already loaded with latest data.');
        }  
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
                        alert('Downloaded the latest version.');
                        app.utilizeFile(theFile.toURL());
                    },
                    function(error)
                    {
                        alert(error);
                        return false;
                    },
                    {data: {lang: app.lang}}
                );
            });
        }, function(e)
        {
           alert('..error in checking if the file exists!' + e);
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