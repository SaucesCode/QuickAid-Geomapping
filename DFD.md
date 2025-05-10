## DATA FLOW DIAGRAM

```mermaid
graph TD
    %% External Entities
    E1_Admin[/"E1: Admin"/]
    E2_Staff[/"E2: Staff"/]
    E3_Applicant[/"E3: Applicant"/]

    %% Data Stores
    D1_ApplicantDB[("D1: Applicant DB")]
    D2_StaffAccountsDB[("D2: Staff Accounts DB")]

    %% Processes
    P1_CreateStaff("P1.0: Create Staff Account")
    P2_AuthenticateStaff("P2.0: Authenticate Staff")
    P3_RecordApplicantData("P3.0: Record Applicant Data")
    P4_ManageApplicantData("P4.0: Manage Applicant Data")
    P5_PrintApplicantForm("P5.0: Print Applicant Form")
    P6_ManageStaffAccounts("P6.0: Manage Staff Accounts")
    P7_GenerateReports("P7.0: Generate Reports & Analytics")
    P8_ExportApplicantCSV("P8.0: Export Applicant CSV")

    %% Data Flows

    %% 1. Admin Creates Staff Accounts
    E1_Admin -- "Staff Creation Details" --> P1_CreateStaff
    P1_CreateStaff -- "New Staff Account" --> D2_StaffAccountsDB
    P1_CreateStaff -- "Staff Credentials" --> E2_Staff

    %% 2. Staff Login
    E2_Staff -- "Login Credentials" --> P2_AuthenticateStaff
    P2_AuthenticateStaff -- "Auth Query" --> D2_StaffAccountsDB
    D2_StaffAccountsDB -- "Auth Details" --> P2_AuthenticateStaff
    P2_AuthenticateStaff -- "Login Status" --> E2_Staff

    %% 3. Staff Inputs Applicant Data
    E3_Applicant -- "Applicant Form Details (to Staff)" --> E2_Staff
    E2_Staff -- "New Applicant Data (Input)" --> P3_RecordApplicantData
    P3_RecordApplicantData -- "Applicant Record" --> D1_ApplicantDB

    %% 4. Manage Applicant Data (CRUDS)
    E1_Admin -- "Admin Applicant CRUD Req" --> P4_ManageApplicantData
    E2_Staff -- "Staff Applicant CRUD Req" --> P4_ManageApplicantData
    P4_ManageApplicantData -- "Applicant Data Query/Update" --> D1_ApplicantDB
    D1_ApplicantDB -- "Applicant Records" --> P4_ManageApplicantData
    P4_ManageApplicantData -- "Applicant View/Confirm (to Admin)" --> E1_Admin
    P4_ManageApplicantData -- "Applicant View/Confirm (to Staff)" --> E2_Staff

    %% 5. Print Applicant Hardcopy Form
    E1_Admin -- "Admin Print Req" --> P5_PrintApplicantForm
    E2_Staff -- "Staff Print Req" --> P5_PrintApplicantForm
    P5_PrintApplicantForm -- "Applicant Record Query" --> D1_ApplicantDB
    D1_ApplicantDB -- "Applicant Record for Print" --> P5_PrintApplicantForm
    P5_PrintApplicantForm -- "Printed Form (to Admin)" --> E1_Admin
    P5_PrintApplicantForm -- "Printed Form (to Staff)" --> E2_Staff

    %% 6. Admin Manages Staff Accounts
    E1_Admin -- "Staff Account CRUD Req" --> P6_ManageStaffAccounts
    P6_ManageStaffAccounts -- "Staff Account Query/Update" --> D2_StaffAccountsDB
    D2_StaffAccountsDB -- "Staff Account Records" --> P6_ManageStaffAccounts
    P6_ManageStaffAccounts -- "Staff Account View/Confirm" --> E1_Admin

    %% 7. Generate Reports/Analytics (Admin only)
    E1_Admin -- "Report Gen Req" --> P7_GenerateReports
    P7_GenerateReports -- "Applicant Data for Reports Query" --> D1_ApplicantDB
    D1_ApplicantDB -- "Applicant Data for Reports" --> P7_GenerateReports
    P7_GenerateReports -- "Reports/Analytics/Geomap" --> E1_Admin

    %% 8. Export CSV Reports of Applicants
    E1_Admin -- "Admin CSV Export Req" --> P8_ExportApplicantCSV
    E2_Staff -- "Staff CSV Export Req" --> P8_ExportApplicantCSV
    P8_ExportApplicantCSV -- "Applicant Data for CSV Query" --> D1_ApplicantDB
    D1_ApplicantDB -- "Applicant Data for CSV" --> P8_ExportApplicantCSV
    P8_ExportApplicantCSV -- "Applicant CSV File (to Admin)" --> E1_Admin
    P8_ExportApplicantCSV -- "Applicant CSV File (to Staff)" --> E2_Staff

    %% Styling (optional, for better visual separation if supported)
    style E1_Admin fill:#f9f,stroke:#333,stroke-width:2px
    style E2_Staff fill:#f9f,stroke:#333,stroke-width:2px
    style E3_Applicant fill:#f9f,stroke:#333,stroke-width:2px

    style D1_ApplicantDB fill:#ccf,stroke:#333,stroke-width:2px
    style D2_StaffAccountsDB fill:#ccf,stroke:#333,stroke-width:2px

    style P1_CreateStaff fill:#9cf,stroke:#333,stroke-width:2px
    style P2_AuthenticateStaff fill:#9cf,stroke:#333,stroke-width:2px
    style P3_RecordApplicantData fill:#9cf,stroke:#333,stroke-width:2px
    style P4_ManageApplicantData fill:#9cf,stroke:#333,stroke-width:2px
    style P5_PrintApplicantForm fill:#9cf,stroke:#333,stroke-width:2px
    style P6_ManageStaffAccounts fill:#9cf,stroke:#333,stroke-width:2px
    style P7_GenerateReports fill:#9cf,stroke:#333,stroke-width:2px
    style P8_ExportApplicantCSV fill:#9cf,stroke:#333,stroke-width:2px
