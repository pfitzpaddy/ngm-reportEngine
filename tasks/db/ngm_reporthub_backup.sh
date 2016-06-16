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
# dump
sudo mongodump --out $DIR
# zip
sudo zip -r $DIR/ngmReportHub.zip $DIR/ngmReportHub
sudo zip -r $DIR/ngmHealthCluster.zip $DIR/ngmHealthCluster
# copy to s3
aws s3 cp $DIR/ngmReportHub.zip s3://s3-af-geonode/ngmReportHub/$DIR
aws s3 cp $DIR/ngmHealthCluster.zip s3://s3-af-geonode/ngmReportHub/$DIR
# delete local
# sudo rm -r -f $DIR