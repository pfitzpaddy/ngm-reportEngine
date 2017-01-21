#!/bin/bash
##################################################
# ReportHub open reports email
# Steps
#		- run API
##################################################
curl http://reporthub.immap.org/api/cluster/report/setReportsOpen
curl http://reporthub.immap.org/api/cluster/stock/setReportsOpen