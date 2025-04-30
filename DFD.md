## DATA FLOW DIAGRAM

```mermaid
graph LR
    subgraph "External Entities"
        A[Applicant]
        S[Staff]
        Ad[Admin]
    end

    subgraph "Processes"
        P1(Submit Application)
        P2(Store Applicant Data)
        P3(Manage Applications)
        P4(Generate Reports)
    end

    subgraph "Data Stores"
        DS1[Applicants DB]
        DS2[Representatives DB]
        DS3[Users DB]
    end

    A -- "Application Data" --> P1
    P1 -- "Applicant Data & Rep. Info" --> P2
    P2 -- "Applicant Data" --> DS1
    P2 -- "Representative Data" --> DS2

    S -- "View/Edit/Delete Request" --> P3
    S -- "Updated Applicant Data & Rep. Info" --> P3
    P3 -- "Applicant Data Updates" --> DS1
    P3 -- "Representative Data Updates" --> DS2
    DS1 -- "Applicant Data for Viewing/Editing" --> P3
    DS2 -- "Representative Data for Viewing/Editing" --> P3
    P3 -- "Geocoding Request (Address)" --> GeoAPI((Geocoding API))
    GeoAPI -- "Coordinates" --> P3
    P3 -- "Updated Coordinates" --> P2
    P3 -- "Updated Coordinates" --> DS1

    S -- "Report Request" --> P4
    Ad -- "Report Request" --> P4
    Ad -- "Analytics Request" --> P4
    DS1 -- "Applicant Data for Reports/Analytics" --> P4
    DS2 -- "Representative Data for Reports" --> P4
    P4 -- "CSV Reports" --> S
    P4 -- "CSV Reports" --> Ad
    P4 -- "Analytics Data" --> Ad

    S -- "Login Credentials" --> P3
    Ad -- "Login Credentials" --> P3
    P3 -- "Authentication Request" --> DS3
    DS3 -- "User Credentials" --> P3
    Ad -- "Manage Staff Account Data" --> P3
    P3 -- "Staff Account Updates" --> DS3
    DS3 -- "Staff Account Data" --> P3
