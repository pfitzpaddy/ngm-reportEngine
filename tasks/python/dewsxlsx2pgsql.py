import sys
import xlrd
import argparse
import pandas as pd
from sqlalchemy import create_engine
from os.path import expanduser

# main function
if __name__ == "__main__":

	# Read db connection params
	with open(expanduser('~/.pgpass'), 'r') as f:
		host, port, database, user, password = f.read().split(':')

	# Define cmd line args
	xlsx_file = sys.argv[1]
	schema = sys.argv[2]
	table = sys.argv[3]
	db_connection = 'postgresql://{}:{}@{}/{}'.format(user, password.strip(), host, database)

	# connection
	engine = create_engine(db_connection)
		
	# read data from xlsx
	xlsxfile = pd.ExcelFile(xlsx_file)
	
	# parse to df
	df = xlsxfile.parse('Sheet1', index_col = None, header = None, skiprows=1)

	# assign column names
	df.columns = [
		'id',
		'u5male',
		'o5male',
		'u5female',
		'disease',
		'report_date',
		'investigation_date',
		'epi_week',
		'rumour',
		'clinic_confirmed',
		'lab_confirmed',
		'o5female',
		'u5death',
		'o5death',
		'num_close_contacts',
		'village',
		'district',
		'province',
		'region',
		'male',
		'female',
		'children_u5',
		'reported_pc',
		'assessed_pc',
		'num_specimens_collected',
		'date_specimens_sent',
		'num_positive_specimens',
		'date_results_shared',
		'ongoing',
		'controlled',
		'date_outbreak_started',
		'date_outbreak_declared_over',
		'remarks',
		'investigated_by',
		'total_cases',
		'total_deaths'
	]

	# data to sql
	df.to_sql(table, engine, schema=schema, if_exists='replace')	

	if df.size:
		print table + ' import success!'

