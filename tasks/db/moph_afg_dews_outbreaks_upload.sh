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

# update column types
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_specimens_sent TYPE text USING date_specimens_sent::text;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_specimens_sent TYPE date USING date_specimens_sent::date;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_results_shared TYPE text USING date_results_shared::text;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_results_shared TYPE date USING date_results_shared::date;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_outbreak_started TYPE text USING date_outbreak_started::text;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_outbreak_started TYPE date USING date_outbreak_started::date;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_outbreak_declared_over TYPE text USING date_outbreak_declared_over::text;"
sudo -u postgres psql -d immap_afg -c "ALTER TABLE dews.moph_afg_dews_outbreaks_import ALTER COLUMN date_outbreak_declared_over TYPE date USING date_outbreak_declared_over::date;"

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
sudo -u postgres psql -d immap_afg -c "UPDATE dews.moph_afg_dews_outbreaks_import SET province = 'Daykundi' WHERE province = 'Daykuni';"

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
	disease_id,
	disease,
	report_date,
	investigation_date,
	epi_week,
	rumour,
	clinic_confirmed,
	lab_confirmed,
	u5male,
	o5male,
	u5female,
	o5female,
	total_cases,
	u5death,
	o5death,
	total_deaths,
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
	geom
)
SELECT
	disease_id,
	disease,
	report_date,
	investigation_date,
	epi_week,
	rumour,
	clinic_confirmed,
	lab_confirmed,
	u5male,
	o5male,
	u5female,
	o5female,
	total_cases,
	u5death,
	o5death,
	total_deaths,
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
	geom
FROM dews.moph_afg_dews_outbreaks_import;"


# DROP import table
sudo -u postgres psql -d immap_afg -c "DROP TABLE dews.moph_afg_dews_outbreaks_import;"




