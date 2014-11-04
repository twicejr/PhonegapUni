var app =
{
    done: false,
    ready: false,
    lang: 'nl',
    state_online: null,
    remote: 'http://zppc.nl/appserver/api.php/', //note: because of parent folder htaccess, just use api.php. (which is renamed from index.php also to prevent htaccess conflicts without much work)
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
        document.addEventListener('deviceready', app.initialized, false);
        
        //@see www/config.xml also!!
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
        
        $('body').on('click', 'a.external', function()
        {
            var url = $(this).attr('href');
            if(device.platform === 'Android')
            {
                navigator.app.loadUrl(url, {openExternal:true});
            }
            else 
            {
                window.open(url, '_system',  'location=yes');
            }
            return false;
        });
        
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

        app.whenReady(); // Lets begin
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
            if(!data || !data.data)
            {   //No data exists so download it now.
                console.log('Download INITIAL because no data was found');
                app.downloadNewData();
                return;
            }
           
            var checksum = data.data.sum;
            //Data exists so use it when it is up to date.
            fs.getFileContents(app.remote + app.api_pagesum, function(checksumdata)
            {
                if(checksumdata && checksumdata.data == checksum)
                {
                    console.log('Use EXISTING data');
                    app.utilizeData(data);
                }
                else
                {
                    console.log('Download NEW DATA because OLD data was found.' + checksumdata.data + ' !== ' + checksum);
                    app.downloadNewData();
                }
            });
        });
    },
    downloadNewData: function()
    {
        fs.download(app.remote + app.api_page, app.cacheFile, app.folder, app.utilizeDownloadResult);
    },
    utilizeDownloadResult: function(fileEntry)
    {
        //Use filereader because iPhone fails on local ajax request initially... and it is probably more efficient.
        var reader = new FileReader();
        fileEntry.file(function(file) 
        {
            reader.onloadend = function(e) 
            {
                console.log('Utilizing downloaded file: ' + filename);
                app.utilizeData(JSON.parse(this.result));//.target.
            };
            reader.readAsText(file);
         }, function(e){});

        var filename = fileEntry.toURL();
        if(!filename)
        {
            console.log('File did not download.');
            return;
        }
    },
    utilizeData: function(data)
    {
        console.log('Utilize data!');
        var dataset = data.data;
        
        if(typeof dataset.css !== null && dataset.css)
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
        $( "[data-role='footer']" ).toolbar();
        $.mobile.changePage(activePage);
    //    $('a.ui-btn[href=' + activePage + ']').addClass('ui-btn-active');
        
        app.done = true; //All is loaded. Nothing needs to be loaded anymore.
    }
};