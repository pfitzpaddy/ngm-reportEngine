##################################################
# DEWS UPDATE
# Description
# Note
# - Data is imported as table dews.moph_afg_dews_outbreaks_import using dewsxlsx2pgsql.py
# Steps
#	- import Dews update in xlsx
#	- add columns to import table
#	- update import table with disease_id
#	- update import table with province_code
#	- update import table with district_code
#	- update province names
#	- update import geom 
#	- delete dews dataset from import date
#	- insert dews import data into dews database
#	- drop import table
##################################################

# Add id columns to import table
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import add column disease_id bigint;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import add column province_code bigint;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import add column district_code bigint;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import add column geom geometry(Multipolygon, 4326);"

# UPDATE disease_id
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import
	SET disease_id = s.disease_id
	FROM dews.disease_lookup s
	WHERE moph_afg_dews_outbreaks_import.disease = s.disease_name;"

# UPDATE province_code
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import
	SET province_code = s.province_code
	FROM dews.province_lookup s
	WHERE moph_afg_dews_outbreaks_import.province = s.province_name;"

# UPDATE district_code
# UPDATE dews.moph_afg_dews_outbreaks_import
# 	SET district_code = s.district_code
# 	FROM dews.district_lookup s
# 	WHERE moph_afg_dews_outbreaks_import.district = s.district_name;

# update province names
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import SET province = 'Nangarhar' WHERE province = 'Nangarahr';"
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import SET province = 'Sar-e-Pul' WHERE province = 'Sar-i- Pul';"
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import SET province = 'Hilmand' WHERE province = 'Helmand';"
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import SET province = 'Daykundi' WHERE province = 'Daykuni;'"

# UPDATE geom (in future this will be district or village level)
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import
	SET geom = s.geom
	FROM admin.afg_admin_1 s
	WHERE moph_afg_dews_outbreaks_import.province_code = s.prov_agcho_code;"

# BACKUP TABLE!
# backup table by date
sudo -u postgres psql -d immap_afg -c "SELECT * INTO dews.moph_afg_dews_outbreaks_$(date +%s) FROM dews.moph_afg_dews_outbreaks";
# clear restore table
sudo -u postgres psql -d immap_afg -c "DELETE FROM dews.moph_afg_dews_outbreaks_backup";
# prepare restore table
sudo -u postgres psql -d immap_afg -c "SELECT * INTO dews.moph_afg_dews_outbreaks_backup FROM dews.moph_afg_dews_outbreaks";

# DELETE all records equal to or greater then new import dataset
sudo -u postgres psql -d immap_afg -c "DELETE FROM dews.moph_afg_dews_outbreaks
	where report_date >= 
	( SELECT min(report_date) as date FROM dews.moph_afg_dews_outbreaks_import );"

# INSERT the imported data into the dews dataset
sudo -u postgres psql -d immap_afg -c "INSERT INTO dews.moph_afg_dews_outbreaks (
	u5male,
	o5male,
	u5female,
	disease_id,
	disease,
	report_date,
	investigation_date,
	epi_week,
	rumour,
	clinic_confirmed,
	lab_confirmed,
	o5female,
	u5death,
	o5death,
	num_close_contacts,
	village,
	district_code,
	district,
	province_code,
	province,
	region,
	male,
	female,
	children_u5,
	reported_pc,
	assessed_pc,
	num_specimens_collected,
	date_specimens_sent,
	num_positive_specimens,
	date_results_shared,
	ongoing,
	controlled,
	date_outbreak_started,
	date_outbreak_declared_over,
	remarks,
	investigated_by,
	total_cases,
	total_deaths,
	geom
)
SELECT
	u5male,
	o5male,
	u5female,
	disease_id,
	disease,
	report_date,
	investigation_date,
	epi_week,
	rumour,
	clinic_confirmed,
	lab_confirmed,
	o5female,
	u5death,
	o5death,
	num_close_contacts,
	village,
	district_code,
	district,
	province_code,
	province,
	region,
	male,
	female,
	children_u5,
	reported_pc,
	assessed_pc,
	num_specimens_collected,
	date_specimens_sent,
	num_positive_specimens,
	date_results_shared,
	ongoing,
	controlled,
	date_outbreak_started,
	date_outbreak_declared_over,
	remarks,
	investigated_by,
	total_cases,
	total_deaths,
	geom
FROM dews.moph_afg_dews_outbreaks_import;"


# DROP import table
sudo -u postgres psql -d immap_afg -c "DROP TABLE dews.moph_afg_dews_outbreaks_import;"




