var app =
{
    done: false,
    ready: false,
    lang: 'nl',
    state_online: null,
    remote: 'http://test.visietest.nl/zppc/', //@todo: change it to the appropriate.
    api_page: 'api/json/read/pages',
    api_pagesum: 'api/json/read/pagesum',
    folder: 'zppc',
    cacheFile: 'pages.json',
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
    },
    initialized: function()
    {
        console.log('Device ready!');
        app.ready = true;
        navigator.globalization.getLocaleName
        (
            function (locale) 
            {
                //Add the language when it is available.
                app.lang = locale.value;
                app.api_page += '?lang=' + app.lang;
                app.api_pagesum += '?lang=' + app.lang;
            },
            function () {console.log('Language could not be detected!');}
        );
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
        if(app.ready && !app.done)
        {
            fs.prepare(app.checkData);
        }
    },
    checkData: function()
    {
        var cachefile_location = fs.buildFileUrl(app.folder + '/' + app.cacheFile);

        //Check if file exists.
        fs.getFileContents(cachefile_location, function(data)
        {
            if(!data)
            {   //No data exists so download it now.
                app.initializeData();
                return;
            }
           
            var checksum = data.data.sum;
            //Data exists so use it when it is up to date.
            fs.getFileContents(app.remote + app.api_pagesum, function(checksumdata)
            {
                if(checksumdata && checksumdata.data == checksum)
                {
                    app.utilizeData(data);
                }
                else
                {
                    app.initializeData();
                }
            });
        });
    },
    initializeData: function()
    {
        fs.download(app.remote + app.api_page, app.cacheFile, app.folder, app.utilizeDownloadResult);
    },
    utilizeDownloadResult: function(filename)
    {
        if(!filename)
        {
            console.log('File did not download.');
            return;
        }
        console.log('Utilizing downloaded file: ' + filename);
        fs.getFileContents(filename, function(data)
        {
            app.utilizeData(data); //the actual dataset.
        });
    },
    utilizeData: function(data)
    {
        var dataset = data.data;
        if(dataset.css)
        {
            $('#style_remote').remove();
            $('head').append('<style type="text/css" id="style_remote">' + dataset.css + '</style>');
        }
        $('body').html(dataset.pagedata);
        
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
        $('a[href=' + activePage + ']').addClass('ui-btn-active');
        $.mobile.changePage(activePage);
        
        $('[data-role=page]').on('pageshow', function()
        {
            if (window.location.hash != '')
            {
                $('a.ui-btn').removeClass('ui-btn-active');
                $('a.ui-btn[href="' + window.location.hash + '"]').addClass('ui-btn-active').addClass('ui-state-persist');
            }
        });
        
        $('.logo').live('vclick', function() {
          $('#navbar a').removeClass('ui-btn-active');
        });
        
        app.done = true; //All is loaded. Nothing needs to be loaded anymore.
    }
};