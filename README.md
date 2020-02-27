# Amazon S3 Aura Lightning Component

This is a Aura Lightning component that allows you to upload a file directly from the user's browser to a S3 bucket.

The follow attributes can be set:
* Label
* Multiple File support
* Bucket Name
* Bucket Region
* Identity Pool Id (for Cognito)

The authentication mechanism used for this is Cognito Identity pools.

This allows for an unauthenticated upload to a bucket through a Cognito Identity with a specific IAM role.