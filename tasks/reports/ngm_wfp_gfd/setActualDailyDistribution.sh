#!/bin/bash
##################################################
# ReportHub set WFP GFD to actual
# Steps
#		- run API
##################################################
# curl http://127.0.0.1/api/wfp/gfa/gfd/setDailyDistribution
# curl https://dev.reporthub.org/api/wfp/gfa/gfd/setDailyDistribution
curl https://reporthub.org/api/wfp/gfa/gfd/setActualDailyDistribution