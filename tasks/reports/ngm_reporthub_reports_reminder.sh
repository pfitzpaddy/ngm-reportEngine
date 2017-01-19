#!/bin/bash
##################################################
# ReportHub send reports reminder
# Steps
#		- run API
##################################################
curl http://reporthub.immap.org/api/cluster/report/setReportsReminder
curl http://reporthub.immap.org/api/cluster/stock/setReportsReminder