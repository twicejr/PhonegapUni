/**
 * Filesystem wrapper class
 */
var fs =
{
    _fileSystem: null, 
    _tempStoreCallback: null,
    root: null,
    type: LocalFileSystem.PERSISTENT,
    prepare: function(callback)
    {
        this._init(callback);
    },
    download: function(remote_file, local_file, callback)
    {
        var fileTransfer = new FileTransfer();
        fileTransfer.download
        (
            remote_file,
            local_file,
            function(entry)
            {
                callback(entry.toURL());
            },
            this._error
        );
    },
    _init: function(callback)
    {
        this._tempStoreCallback = callback;
        if(this.root)
        {
            return; //Already initialized.
        }
        
        //Request the filesystem.
        window.requestFileSystem
        (
            this.type, 0, this._requestFsSuccess(fileSystem), this._error(fileError)
        );
    },
    _requestFsSuccess: function(fileSystem)
    {
        this._fileSystem = fileSystem;
        this.root = this._fileSystem.root.toNativeURL();
        console.log('Filesystem successfully initialized on: ' + fileSystem.name + '. Root: ' + this.root);
        
        if(this._tempStoreCallback)
        {
            this._tempStoreCallback(this._fileSystem);
        }
    },
    _error: function(fileError)
    {
        var msg = '';
        switch (e.code)
        {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };
        console.log('Fs error: ' + msg);
    }
};