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
        // debugger;

        var file = fileSel.get('v.files')[0];
        var fileName = file.name;

        // Use S3 ManagedUpload class as it supports multipart uploads
        var upload = new AWS.S3.ManagedUpload({
            params: {
                Bucket: 'bandy-bucket',
                Key: fileName,
                Body: file
            }
        });

        upload.on('httpUploadProgress', function (evt) {
            console.log('%s: %d', fileName, evt.loaded * 100 / evt.total);
            cmp.set('v.progress',evt.loaded * 100 / evt.total);
        });

        var promise = upload.promise();

        promise.then(
            function (data) {
                debugger;
                alert("Successfully uploaded file.");
            },
            function (err) {
                debugger;
                return alert("There was an error uploading your file: ", err.message);
            }
        );
    }
})