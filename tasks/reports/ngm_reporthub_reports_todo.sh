#!/bin/bash
##################################################
# ReportHub set report_status: 'todo'
# Steps
#		- run API
##################################################
curl http://192.168.33.16/api/cluster/report/setReportsToDo
curl http://192.168.33.16/api/cluster/stock/setReportsToDo