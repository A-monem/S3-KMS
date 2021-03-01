# What is S3-KMS ? 
It is a Node.js library based on AWS-SDK. It lists all objects in an S3 bucket 'conformity-anafea', which has been created especially for this project, then download all files locally. It created a Data directory where all files will be saved in the same directory structure. It downloads up to 4 concurrent files at a time. Once downloaded a file named "downloadedFiles.txt" will be generated and sent to KMS to be encrypted then saved in the Data folder.

# How can I run it ?
* run app => npm start
* run tests => npm test

# Built with

## Web Application

* Node.js
* AWS-SDK
* Bluebird
* Mocha
* Chai
* AWS-SDK-MOCK
* nyc code coverage report
* Eslint
* Eslint-config-airbnb


