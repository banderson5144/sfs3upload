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
        var tmpArry = [];

        for(var i=0;i<files.length;i++)
        {
            tmpArry.push(files[0].name);
        }

        cmp.set('v.fileNames',tmpArry);
    },

    beginUpload: function (cmp, evt, help) 
    {
        var fileSel = cmp.find('fileSel');
        var promises = [];
        var fileSizeTotal = 0;
        var loaded = [];
        var keyParams = evt.getParam('arguments');

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
                    Key: keyParams.keyPrefix+'/'+fileName,
                    Body: files[i]
                }
            });

            upload.on('httpUploadProgress', $A.getCallback(function (evt)
            {
                var progEvt = $A.get('e.c:s3UploadProgress');

                loaded[evt.key] = evt.loaded * 100;

                var loadedTotal = 0;

                for (var j in loaded)
                {
                    loadedTotal += loaded[j];
                }

                var totalProgress = loadedTotal / fileSizeTotal;

                console.log('%s: %d', evt.key, totalProgress);

                progEvt.setParams({ "totalProgress" : totalProgress });
                progEvt.fire();

                cmp.set('v.progress',totalProgress);
            }));

            promises.push(upload.promise());
        }

        Promise.all(promises).then($A.getCallback(function (data)
            {
                var s3FileUrls = data.map(function(r){return r.Location;});
                var appEvent = $A.get('e.c:s3UploadComplete');
                appEvent.setParams({ "s3FileUrls" : s3FileUrls });
                appEvent.fire();
                //cmp.set('v.s3FileUrls',s3FileUrls);
                console.log("Successfully uploaded file(s).");
            }),
            function (err)
            {
                debugger;
                return alert("There was an error uploading your file: ", err.message);
            }
        );
    }
})