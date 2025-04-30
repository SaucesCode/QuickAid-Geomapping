erDiagram
    staff {
        integer id PK
        varchar username
        varchar email
        varchar password
        varchar role
        timestamp created_at
    }
    applicants {
        integer id PK
        integer staff_id FK
        varchar first_name
        varchar middle_initial
        varchar last_name
        varchar suffix
        date birthday
        varchar gender
        varchar civil_status
        varchar occupation
        numeric monthly_income
        varchar contact_number
        varchar purok
        varchar barangay
        varchar city_municipality
        varchar city_municipalityCode
        varchar province
        double latitude
        double longitude
        varchar valid_id_presented
        varchar other_valid_id
        varchar type_of_assistance
        varchar applicant_type
        timestamp date_filled
        timestamp started_at
        timestamp processed_at
    }
    representatives {
        integer id PK
        integer applicant_id FK
        varchar first_name
        varchar middle_initial
        varchar last_name
        varchar suffix
        text address
        date birthday
        varchar gender
        varchar civil_status
        varchar occupation
        numeric monthly_income
        varchar relationship
    }

    staff ||--o{ applicants : processes
    applicants ||--o{ representatives : has
