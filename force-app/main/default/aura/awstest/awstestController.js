({
    scriptLoaded: function (cmp, evt, help) {

        var bucketName = cmp.get('v.bucketName');
        var bucketRegion = cmp.get('v.bucketRegion');
        var IdentityPoolId = cmp.get('v.identityPoolId');

        AWS.config.update({
            region: bucketRegion,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: IdentityPoolId
            })
        });

        var s3 = new AWS.S3({
            apiVersion: "2006-03-01",
            params: { Bucket: bucketName }
        });
    },

    handleFilesChange: function (cmp, event) {
        var files = event.getSource().get("v.files");
        console.log(files.length + ' files !!');
    },

    handleClick: function (cmp, evt, help) 
    {
        var fileSel = cmp.find('fileSel');
        var promises = [];
        var fileSizeTotal = 0;
        var loaded = [];
        // debugger;

        var files = fileSel.get('v.files');

        for(var i = 0; i < files.length; i++)
        {
            fileSizeTotal += files[i].size;
            loaded[files[i].name] = 0;
        }        

        for(var i = 0; i < files.length; i++)
        {
            var fileName = files[i].name;

            // Use S3 ManagedUpload class as it supports multipart uploads
            var upload = new AWS.S3.ManagedUpload({
                params: {
                    Bucket: 'bandy-bucket',
                    Key: fileName,
                    Body: files[i]
                }
            });

            upload.on('httpUploadProgress', function (evt)
            {
                loaded[evt.key] = evt.loaded * 100;

                var loadedTotal = 0;

                for (var j in loaded)
                {
                    loadedTotal += loaded[j];
                }

                console.log('%s: %d', evt.key, loadedTotal / fileSizeTotal);
                cmp.set('v.progress',loadedTotal / fileSizeTotal);
            });

            promises.push(upload.promise());
        }

        Promise.all(promises).then(function (data)
            {
                debugger;
                cmp.set('v.s3FileUrls',data.map(function(r){return r.Location;}));
                alert("Successfully uploaded file(s).");
            },
            function (err)
            {
                debugger;
                return alert("There was an error uploading your file: ", err.message);
            }
        );
    }
})