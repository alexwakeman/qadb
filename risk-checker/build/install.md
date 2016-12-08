#Embarassing Bodies My Risk Checker Installation Instructions

These tasks assume that the root of the trunk lives in`$TRUNK`.

The web server root should be matched to `$TRUNK/public/`.  It is assumed that this is `/var/www/public/`.


##Set Permissions

`$TRUNK/private/var/` is used for log and cache files and permissions should be set to allow that directory tree to be writeable by the web server and the user running the script to rebuild the static pages - see below.


##Nginx Config

The Nginx config will need to be updated. Changes required are:

 * Extend the range of mime types that should be Gzipped: `gzip_types text/css application/x-javascript image/svg+xml text/plain application/octet-stream;`
 * Set default expires header for all files to 1 year: `expires 1y;`
 * Remove the expires header for PHP files: `expires 0;`


##Install the Crontab
C4 have implemented a new version of the header and footer which does not require the recreation of files on the server so there is now no requirement for any cron jobs associated with this site.

