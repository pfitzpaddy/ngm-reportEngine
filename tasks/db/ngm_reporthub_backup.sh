#!/bin/bash
##################################################
# ReportHub Backup
# Steps
#		- make folder
#		- mongodump to folder
#		- zip
#		- copy to s3
#		- rm
##################################################
STAMP=$(date +%s)
DIR=/home/ubuntu/data/reportHub/$STAMP
# echo $DIR
# mkdir
sudo mkdir $DIR
cd $DIR
# dump
sudo mongodump --out $DIR
# zip
# sudo zip -r $DIR/ngmReportHub.zip $DIR/ngmReportHub
# sudo zip -r $DIR/ngmHealthCluster.zip $DIR/ngmHealthCluster
cd $DIR
cd ../
sudo zip -r $STAMP.zip $STAMP
# # copy to s3
# aws s3 cp $DIR/ngmReportHub.zip s3://s3-af-geonode/ngmReportHub/$STAMP
# aws s3 cp $DIR/ngmHealthCluster.zip s3://s3-af-geonode/ngmHealthCluster/$STAMP
/usr/local/bin/aws s3 cp $DIR.zip s3://s3-af-geonode/ngmReportHub/$STAMP
# delete local
sudo rm -r $DIR