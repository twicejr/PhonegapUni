/**
 * Filesystem wrapper class
 */

var fs =
{
    _fileSystem: null, 
    _tempStoreCallback: null,
    root: null,
    type: null,
    prepare: function(callback)
    {
        fs._init(callback);
    },
    renameFile: function(currentName, currentDir, newName, successFunction)
    {
        this._fileSystem.root.getFile(currentDir + currentName, null, function(fileEntry) 
        {
            this._fileSystem.root.getDirectory(currentDir, {create: true}, function(dirEntry)
            {
                parentEntry = new DirectoryEntry(currentName, currentDir + currentName);

                fileEntry.moveTo(dirEntry, newName, function() 
                {
                    successFunction();
                }, fs.error);
            }, fs.error);
        }, fs.error);
    },
    download: function(remote_file, local_file, local_folder, callback)
    {
        var local_file_final = local_file;
        local_file = local_file + '.temp';
        var local_filepath = fs.root + local_folder + '/' + local_file;
        console.log('Downloading file: ' + remote_file + ' to local: ' + local_file_final);
        this._fileSystem.root.getDirectory(local_folder, {create: true, exclusive: false}, function()
        {
            var fileTransfer = new FileTransfer();
            fileTransfer.download
            (
                remote_file,
                local_filepath,
                function(entry)
                {
                    fs.renameFile(local_file, local_folder, local_file_final, function(){callback(entry);});
                },
                function(error)
                {
                    fs.error(error);
                    callback(false);
                }
            );
        }, fs.error);
    },
    buildFileUrl: function(relative_url)
    {
        return fs.root + relative_url;
    },
    getLocalFileContents: function(file, callback)
    {
        var reader = new FileReader(); 
        reader.onloadend = function(evt) 
        { 
            callback(evt.target.result);
        }; 
        reader.readAsText(file);
    },
    getFileContents: function(file_url, callback)
    {
        console.log('Try to get file contents: ' + file_url + '...');
        $.ajax
        ({
            url: file_url,
            dataType: 'json',
            type: 'GET',
            error: function(xhr,error,code) 
            {
                console.log('...error: ' + error + ', :' + code);
                callback(false);
            },
            success: function(data)
            {
                console.log('...succes!');
                callback(data);
            }
        });
    },
    localFileContents: function(file, callback)
    {
        var reader = new FileReader();
        var result;
        reader.readAsText(file);
        reader.onload = function()
        { 
            result = reader.result;
            callback(result);
        };
    },
    _init: function(callback, type)
    {
        if(fs.root)
        {
            callback(false);
            return; //Already initialized.
        }
        fs.type = type ? type : LocalFileSystem.PERSISTENT;
        fs._tempStoreCallback = callback;
        
        //Request the filesystem.
        window.requestFileSystem(fs.type, 0, fs._requestFsSuccess, fs.error);
    },
    _requestFsSuccess: function(fileSystem)
    {
        fs._fileSystem = fileSystem;
        fs.root = fs._fileSystem.root.toURL();
        console.log('Filesystem successfully initialized on: ' + fs.root);
        
        if(fs._tempStoreCallback)
        {
            fs._tempStoreCallback(fs._fileSystem);
        }
    },
    error: function(error)
    {
        if (typeof error == 'object') 
        {
            error = JSON.stringify(error);
        }
        error = '\nLOG: ' + error;
        var stacktrace = '';
        if (window.printStackTrace)
        {
            try 
            {
              stacktrace = '\n -' + printStackTrace().slice(4).join('\n -');
              error += '\nSTACKTRACE:' + stacktrace;
              console.log(error);
            } catch(e) {}
        }
    }
};