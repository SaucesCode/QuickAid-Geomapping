
## Entity-Relationship Diagram

```mermaid
erDiagram
    Staff {
        VARCHAR staff_id PK "staff_id (PK)"
        VARCHAR username
        VARCHAR password
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email
        VARCHAR role
    }

    Applicant {
        VARCHAR applicant_id PK "applicant_id (PK)"
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR middle_initial
        DATE birthday
        VARCHAR gender
        VARCHAR civil_status
        VARCHAR occupation
        DECIMAL monthly_income
        BOOLEAN valid_id_presented
        VARCHAR type_of_assistance
        VARCHAR purok
        VARCHAR barangay "barangay (address)"
        VARCHAR province "province (address)"
    }

    Representative {
        VARCHAR rep_id PK "rep_id (PK)"
        VARCHAR first_name
        VARCHAR last_name
        DATE birthday
        VARCHAR gender
        VARCHAR relationship_to_applicant
        VARCHAR address
        VARCHAR applicant_id FK "applicant_id (FK)"
    }

    Application {
        VARCHAR application_id PK "application_id (PK)"
        DATETIME processed_at
        VARCHAR applicant_id FK "applicant_id (FK)"
        VARCHAR staff_id FK "staff_id (FK)"
    }

    Barangay {
        VARCHAR barangay_id PK "barangay_id (PK)"
        VARCHAR name
        VARCHAR city
        VARCHAR province
    }

    Staff ||--|{ Application : "processes"
    Applicant ||--o{ Representative : "has zero or one"
    Applicant ||--|{ Application : "submits"

    %% Note: Relationship between Applicant and Barangay is based on
    %% address attributes in Applicant entity, not a formal FK link.
    %% The Barangay entity exists separately but is not directly linked
    %% to Applicant in this schema based on user constraint.
