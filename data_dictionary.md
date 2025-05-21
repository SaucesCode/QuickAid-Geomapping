# Data Dictionary

## CustomUser
Extends Django's AbstractUser to add role-based authentication and tracking

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| username | String | User's login name | Required, Unique |
| password | String | Hashed password | Required |
| email | String | User's email address | Required |
| role | String | User role | Choices: 'staff', 'admin'; Default: 'staff' |
| last_active | DateTime | Last login timestamp | Optional |
| created_at | DateTime | Account creation timestamp | Auto set on creation |
| updated_at | DateTime | Last update timestamp | Auto set on update |

## Region
Geographic regions (highest administrative division)

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| name | String | Region name | Required |
| psgc_code | String | Philippine Standard Geographic Code | Required, Unique |

## Province
Provinces within regions

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| name | String | Province name | Required |
| region_id | Integer | Foreign Key to Region | Required |
| psgc_code | String | Philippine Standard Geographic Code | Required, Unique |

## City
Cities/municipalities within provinces

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| name | String | City name | Required |
| province_id | Integer | Foreign Key to Province | Required |
| psgc_code | String | Philippine Standard Geographic Code | Required, Unique |

## Barangay
Barangays (smallest administrative division) within cities

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| name | String | Barangay name | Required |
| city_id | Integer | Foreign Key to City | Required |
| psgc_code | String | Philippine Standard Geographic Code | Required, Unique |

## BackgroundInfo
Personal information for applicants and representatives

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| first_name | String | First name | Required |
| middle_initial | String | Middle initial | Optional |
| last_name | String | Last name | Required |
| suffix | String | Name suffix (Jr., Sr., etc.) | Optional |
| birthday | Date | Date of birth | Required |
| street_address | String | Street address | Required |
| barangay_id | Integer | Foreign Key to Barangay | Required |
| sex | String | Gender | Choices: 'Male', 'Female' |
| civil_status | String | Marital status | Required |
| occupation | String | Job or profession | Optional |
| monthly_income | Decimal | Monthly income amount | Optional |

## Applicant
Main applicant information for assistance programs

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| staff_id | Integer | Foreign Key to CustomUser | Required |
| background_info_id | Integer | Foreign Key to BackgroundInfo | Required |
| contact_number | String | Phone/mobile number | Required |
| valid_id_presented | String | Type of ID presented | Required |
| other_valid_id | String | Secondary ID information | Optional |
| applicant_type | String | Type of applicant | Choices: 'Self', 'Representative'; Default: 'Self' |
| type_of_assistance | String | Type of assistance requested | Choices: 'Medical', 'Burial', 'Educational' |
| longitude | Float | Geographic longitude | Auto-calculated from address |
| latitude | Float | Geographic latitude | Auto-calculated from address |
| date_filled | DateTime | Application submission date | Auto set on creation |
| created_at | DateTime | Record creation timestamp | Optional |
| is_archived | Boolean | Archive status flag | Default: False |

## Representative
Information about representatives applying on behalf of someone else

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | Integer | Primary Key | Auto-increment |
| applicant_id | Integer | Foreign Key to Applicant | Required, One-to-One |
| background_info_id | Integer | Foreign Key to BackgroundInfo | Required |
| relationship | String | Relationship to main applicant | Required |