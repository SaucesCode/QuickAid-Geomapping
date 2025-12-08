import React, { useState } from "react";
import { Database, Users, MapPin, FileText, Building2, Download, Printer } from "lucide-react";

const DataDictionaryDocument = () => {
  const [activeView, setActiveView] = useState("dictionary"); // 'dictionary' or 'erd'

  const handleExport = type => {
    if (type === "dictionary") {
      window.print();
    } else {
      // For ERD, user can right-click and save image
      alert('Right-click on the ERD diagram and select "Save image as..." to download');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { background: white !important; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Header - No Print */}
      <div className="no-print sticky top-0 bg-white border-b-2 border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">QuickAid Documentation</h1>
                <p className="text-sm text-gray-600">Database Schema & ERD</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveView("dictionary")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === "dictionary"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Data Dictionary
              </button>
              <button
                onClick={() => setActiveView("erd")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeView === "erd"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ERD Diagram
              </button>
              <button
                onClick={() => handleExport(activeView)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === "dictionary" ? <DataDictionary /> : <ERDDiagram />}
      </div>
    </div>
  );
};

const DataDictionary = () => {
  return (
    <div className="space-y-8">
      {/* Cover Page */}
      <div className="text-center space-y-6 py-20">
        <div className="flex justify-center">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
            <Database className="w-20 h-20 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-800">QuickAid System</h1>
        <h2 className="text-3xl font-semibold text-gray-600">Data Dictionary</h2>
        <div className="pt-8 text-lg text-gray-600 space-y-2">
          <p>DSWD Assistance Management System</p>
          <p>Database Schema Documentation</p>
          <p className="text-sm pt-4">Version 1.0 | {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="page-break"></div>

      {/* Table of Contents */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 border-b-4 border-blue-600 pb-2">
          Table of Contents
        </h2>
        <div className="space-y-2 text-lg">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span>1. User Management Models</span>
            <span className="font-mono">3</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span>2. Geographic Data Models</span>
            <span className="font-mono">4</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span>3. Applicant Data Models</span>
            <span className="font-mono">6</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span>4. Approval System Models</span>
            <span className="font-mono">10</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span>5. System Logs Models</span>
            <span className="font-mono">12</span>
          </div>
        </div>
      </div>

      <div className="page-break"></div>

      {/* 1. USER MANAGEMENT */}
      <section className="space-y-6">
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8" />
            1. User Management Models
          </h2>
        </div>

        {/* CustomUser Model */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4 border-b-2 border-gray-300">
            <h3 className="text-2xl font-bold text-gray-800">CustomUser</h3>
            <p className="text-gray-600 mt-1">System user accounts (staff and admin)</p>
            <p className="text-sm text-gray-500 font-mono mt-1">Table: api_customuser</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-3 text-left text-sm font-bold">Field Name</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Data Type</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Constraints</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
                {
                  name: "username",
                  type: "String(150)",
                  constraints: "Unique, Required",
                  desc: "Login username",
                },
                {
                  name: "password",
                  type: "String(128)",
                  constraints: "Required",
                  desc: "Hashed password",
                },
                {
                  name: "email",
                  type: "EmailField",
                  constraints: "Required",
                  desc: "Email address",
                },
                {
                  name: "first_name",
                  type: "String(150)",
                  constraints: "Required",
                  desc: "First name",
                },
                {
                  name: "last_name",
                  type: "String(150)",
                  constraints: "Required",
                  desc: "Last name",
                },
                {
                  name: "role",
                  type: "String(20)",
                  constraints: "Choices: staff, admin",
                  desc: "User role",
                },
                {
                  name: "is_staff",
                  type: "Boolean",
                  constraints: "Default: true",
                  desc: "Django staff status",
                },
                {
                  name: "is_superuser",
                  type: "Boolean",
                  constraints: "Default: false",
                  desc: "Admin privileges",
                },
                {
                  name: "is_active",
                  type: "Boolean",
                  constraints: "Default: true",
                  desc: "Account status",
                },
                {
                  name: "last_active",
                  type: "DateTime",
                  constraints: "Nullable",
                  desc: "Last activity",
                },
                {
                  name: "ref_code",
                  type: "UUID",
                  constraints: "Unique",
                  desc: "QR reference code",
                },
                {
                  name: "created_at",
                  type: "DateTime",
                  constraints: "Auto",
                  desc: "Creation timestamp",
                },
                {
                  name: "updated_at",
                  type: "DateTime",
                  constraints: "Auto",
                  desc: "Update timestamp",
                },
              ].map((field, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-mono text-sm text-blue-600 font-semibold">
                    {field.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-purple-600">{field.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{field.constraints}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{field.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-blue-50 p-4 border-t-2 border-gray-300">
            <h4 className="font-bold text-gray-800 mb-2">Relationships:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                • <strong>OneToMany</strong> → Applicant (staff field) - Applications processed
              </li>
              <li>
                • <strong>OneToMany</strong> → StaffActivityLog (staff field) - Activity logs
              </li>
              <li>
                • <strong>OneToMany</strong> → ApprovalBatch (uploaded_by field) - Batches
                uploaded
              </li>
              <li>
                • <strong>OneToMany</strong> → Approval (approved_by field) - Approvals made
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="page-break"></div>

      {/* 2. GEOGRAPHIC DATA */}
      <section className="space-y-6">
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            2. Geographic Data Models
          </h2>
        </div>

        {/* Hierarchy Diagram */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Geographic Hierarchy</h3>
          <div className="flex items-center justify-center gap-4 text-lg font-semibold text-gray-700">
            <span className="bg-white px-4 py-2 rounded-lg border-2 border-green-300">
              Region
            </span>
            <span>→</span>
            <span className="bg-white px-4 py-2 rounded-lg border-2 border-green-300">
              Province
            </span>
            <span>→</span>
            <span className="bg-white px-4 py-2 rounded-lg border-2 border-green-300">
              City
            </span>
            <span>→</span>
            <span className="bg-white px-4 py-2 rounded-lg border-2 border-green-300">
              Barangay
            </span>
          </div>
        </div>

        {/* Region */}
        <ModelTable
          name="Region"
          table="api_region"
          description="Philippine administrative regions"
          color="green"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "name",
              type: "String(255)",
              constraints: "Required",
              desc: "Region name",
            },
            {
              name: "psgc_code",
              type: "String(20)",
              constraints: "Unique, Required",
              desc: "PSGC code",
            },
          ]}
          relationships={["OneToMany → Province (region field) - Provinces in region"]}
        />

        {/* Province */}
        <ModelTable
          name="Province"
          table="api_province"
          description="Philippine provinces"
          color="green"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "name",
              type: "String(255)",
              constraints: "Required",
              desc: "Province name",
            },
            {
              name: "region",
              type: "ForeignKey",
              constraints: "FK → Region",
              desc: "Parent region",
            },
            {
              name: "psgc_code",
              type: "String(20)",
              constraints: "Unique, Required",
              desc: "PSGC code",
            },
          ]}
          relationships={[
            "ManyToOne → Region (region field) - Parent region",
            "OneToMany → City (province field) - Cities in province",
          ]}
        />

        {/* City */}
        <ModelTable
          name="City"
          table="api_city"
          description="Cities and municipalities"
          color="green"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            { name: "name", type: "String(255)", constraints: "Required", desc: "City name" },
            {
              name: "province",
              type: "ForeignKey",
              constraints: "FK → Province",
              desc: "Parent province",
            },
            {
              name: "psgc_code",
              type: "String(20)",
              constraints: "Unique, Required",
              desc: "PSGC code",
            },
          ]}
          relationships={[
            "ManyToOne → Province (province field) - Parent province",
            "OneToMany → Barangay (city field) - Barangays in city",
          ]}
        />

        {/* Barangay */}
        <ModelTable
          name="Barangay"
          table="api_barangay"
          description="Smallest administrative division (village level)"
          color="green"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "name",
              type: "String(255)",
              constraints: "Required",
              desc: "Barangay name",
            },
            {
              name: "city",
              type: "ForeignKey",
              constraints: "FK → City",
              desc: "Parent city",
            },
            {
              name: "psgc_code",
              type: "String(20)",
              constraints: "Unique, Required",
              desc: "PSGC code",
            },
          ]}
          relationships={[
            "ManyToOne → City (city field) - Parent city",
            "OneToMany → BackgroundInfo (barangay field) - Residents",
          ]}
        />
      </section>

      <div className="page-break"></div>

      {/* 3. APPLICANT DATA */}
      <section className="space-y-6">
        <div className="bg-purple-600 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8" />
            3. Applicant Data Models
          </h2>
        </div>

        {/* BackgroundInfo */}
        <ModelTable
          name="BackgroundInfo"
          table="api_backgroundinfo"
          description="Personal information of individuals (applicants and representatives)"
          color="purple"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "first_name",
              type: "String(100)",
              constraints: "Required",
              desc: "First name",
            },
            {
              name: "middle_initial",
              type: "String(20)",
              constraints: "Nullable",
              desc: "Middle initial",
            },
            {
              name: "last_name",
              type: "String(100)",
              constraints: "Required",
              desc: "Last name",
            },
            {
              name: "suffix",
              type: "String(10)",
              constraints: "Nullable",
              desc: "Name suffix (Jr., Sr.)",
            },
            { name: "birthday", type: "Date", constraints: "Required", desc: "Date of birth" },
            {
              name: "street_address",
              type: "String(255)",
              constraints: "Required",
              desc: "Street address",
            },
            {
              name: "barangay",
              type: "ForeignKey",
              constraints: "FK → Barangay",
              desc: "Residential location",
            },
            {
              name: "sex",
              type: "String(10)",
              constraints: "Choices: Male, Female",
              desc: "Gender",
            },
            {
              name: "civil_status",
              type: "String(20)",
              constraints: "Required",
              desc: "Marital status",
            },
            {
              name: "occupation",
              type: "String(100)",
              constraints: "Nullable",
              desc: "Current occupation",
            },
            {
              name: "monthly_income",
              type: "Decimal(10,2)",
              constraints: "Nullable",
              desc: "Monthly income (PHP)",
            },
          ]}
          relationships={[
            "ManyToOne → Barangay (barangay field) - Residential barangay",
            "OneToMany → Applicant (background_info field) - Applications",
            "OneToMany → Representative (background_info field) - Representative records",
            "OneToMany → ApplicantHistory (background_info field) - History",
          ]}
          constraints={[
            "UNIQUE (first_name, last_name, birthday) - Prevents duplicate persons",
          ]}
        />

        {/* Applicant */}
        <ModelTable
          name="Applicant"
          table="api_applicant"
          description="Main assistance application records"
          color="purple"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "staff",
              type: "ForeignKey",
              constraints: "FK → CustomUser, Nullable",
              desc: "Processing staff",
            },
            {
              name: "background_info",
              type: "ForeignKey",
              constraints: "FK → BackgroundInfo",
              desc: "Applicant info",
            },
            {
              name: "contact_number",
              type: "String(15)",
              constraints: "Required",
              desc: "Contact number",
            },
            {
              name: "valid_id_presented",
              type: "String(255)",
              constraints: "Required",
              desc: "ID type presented",
            },
            {
              name: "other_valid_id",
              type: "String(255)",
              constraints: "Nullable",
              desc: "Additional ID",
            },
            {
              name: "applicant_type",
              type: "String(20)",
              constraints: "Choices: Self, Representative",
              desc: "Who is applying",
            },
            {
              name: "type_of_assistance",
              type: "String(50)",
              constraints: "Choices: Medical, Burial, Educational",
              desc: "Assistance type",
            },
            {
              name: "longitude",
              type: "Float",
              constraints: "Nullable",
              desc: "GPS longitude",
            },
            { name: "latitude", type: "Float", constraints: "Nullable", desc: "GPS latitude" },
            {
              name: "date_filled",
              type: "DateTime",
              constraints: "Default: now",
              desc: "Submission timestamp",
            },
            {
              name: "created_at",
              type: "DateTime",
              constraints: "Nullable",
              desc: "Record creation",
            },
            {
              name: "is_archived",
              type: "Boolean",
              constraints: "Default: false",
              desc: "Soft delete flag",
            },
          ]}
          relationships={[
            "ManyToOne → CustomUser (staff field) - Processing staff",
            "ManyToOne → BackgroundInfo (background_info field) - Applicant info",
            "OneToOne → Representative (applicant field) - Representative details",
            "OneToMany → Approval (applicant field) - Approval records",
            "OneToMany → ApplicantHistory (applicant field) - History entries",
          ]}
          indexes={[
            "INDEX (latitude, longitude) - Geospatial queries",
            "INDEX (type_of_assistance) - Filter by type",
            "INDEX (is_archived, date_filled) - Active applications list",
            "INDEX (date_filled DESC) - Recent applications",
          ]}
        />

        {/* Representative */}
        <ModelTable
          name="Representative"
          table="api_representative"
          description="Representative applying on behalf of applicant"
          color="purple"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "applicant",
              type: "OneToOne",
              constraints: "FK → Applicant",
              desc: "Related application",
            },
            {
              name: "background_info",
              type: "ForeignKey",
              constraints: "FK → BackgroundInfo",
              desc: "Representative info",
            },
            {
              name: "relationship",
              type: "String(100)",
              constraints: "Required",
              desc: "Relationship to applicant",
            },
            {
              name: "contact_number",
              type: "String(15)",
              constraints: "Nullable",
              desc: "Representative contact",
            },
          ]}
          relationships={[
            "OneToOne → Applicant (applicant field) - Application record",
            "ManyToOne → BackgroundInfo (background_info field) - Representative info",
          ]}
        />

        {/* ApplicantHistory */}
        <ModelTable
          name="ApplicantHistory"
          table="api_applicanthistory"
          description="Historical record of all applications per person"
          color="purple"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "background_info",
              type: "ForeignKey",
              constraints: "FK → BackgroundInfo",
              desc: "Person who applied",
            },
            {
              name: "applicant",
              type: "ForeignKey",
              constraints: "FK → Applicant",
              desc: "Application record",
            },
            {
              name: "type_of_assistance",
              type: "String(50)",
              constraints: "Required",
              desc: "Assistance type",
            },
            {
              name: "date_applied",
              type: "DateTime",
              constraints: "Auto",
              desc: "Application timestamp",
            },
          ]}
          relationships={[
            "ManyToOne → BackgroundInfo (background_info field) - Person",
            "ManyToOne → Applicant (applicant field) - Application details",
          ]}
        />
      </section>

      <div className="page-break"></div>

      {/* 4. APPROVAL SYSTEM */}
      <section className="space-y-6">
        <div className="bg-yellow-600 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            4. Approval System Models
          </h2>
        </div>

        {/* ApprovalBatch */}
        <ModelTable
          name="ApprovalBatch"
          table="api_approvalbatch"
          description="Batch upload of approved applicants from Excel/CSV"
          color="yellow"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "uploaded_by",
              type: "ForeignKey",
              constraints: "FK → CustomUser, Nullable",
              desc: "User who uploaded",
            },
            {
              name: "uploaded_at",
              type: "DateTime",
              constraints: "Auto",
              desc: "Upload timestamp",
            },
            {
              name: "file_name",
              type: "String(255)",
              constraints: "Required",
              desc: "Original filename",
            },
            {
              name: "total_processed",
              type: "Integer",
              constraints: "Default: 0",
              desc: "Total records processed",
            },
            {
              name: "total_approved",
              type: "Integer",
              constraints: "Default: 0",
              desc: "Successfully approved",
            },
            {
              name: "total_already_approved",
              type: "Integer",
              constraints: "Default: 0",
              desc: "Already approved count",
            },
            {
              name: "total_not_found",
              type: "Integer",
              constraints: "Default: 0",
              desc: "Not found in system",
            },
          ]}
          relationships={[
            "ManyToOne → CustomUser (uploaded_by field) - Uploader",
            "OneToMany → Approval (batch field) - Approvals in batch",
          ]}
        />

        {/* Approval */}
        <ModelTable
          name="Approval"
          table="api_approval"
          description="Individual approval records for applicants"
          color="yellow"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "applicant",
              type: "ForeignKey",
              constraints: "FK → Applicant",
              desc: "Approved applicant",
            },
            {
              name: "batch",
              type: "ForeignKey",
              constraints: "FK → ApprovalBatch, Nullable",
              desc: "Parent batch",
            },
            {
              name: "approved_at",
              type: "DateTime",
              constraints: "Auto",
              desc: "Approval timestamp",
            },
            {
              name: "approved_by",
              type: "ForeignKey",
              constraints: "FK → CustomUser, Nullable",
              desc: "Staff who approved",
            },
            {
              name: "notes",
              type: "TextField",
              constraints: "Nullable",
              desc: "Approval notes/amount",
            },
          ]}
          relationships={[
            "ManyToOne → Applicant (applicant field) - Approved application",
            "ManyToOne → ApprovalBatch (batch field) - Parent batch",
            "ManyToOne → CustomUser (approved_by field) - Approver",
          ]}
        />
      </section>

      <div className="page-break"></div>

      {/* 5. SYSTEM LOGS */}
      <section className="space-y-6">
        <div className="bg-red-600 text-white p-4 rounded-lg">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Database className="w-8 h-8" />
            5. System Logs Models
          </h2>
        </div>

        {/* StaffActivityLog */}
        <ModelTable
          name="StaffActivityLog"
          table="api_staffactivitylog"
          description="Audit trail of all staff actions in the system"
          color="red"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "staff",
              type: "ForeignKey",
              constraints: "FK → CustomUser, Nullable",
              desc: "Staff member",
            },
            {
              name: "action",
              type: "String(20)",
              constraints:
                "Choices: LOGIN, LOGOUT, CREATE, UPDATE, ARCHIVE, RESTORE, DELETE, PASSWORD, PROFILE",
              desc: "Action type",
            },
            {
              name: "details",
              type: "TextField",
              constraints: "Nullable",
              desc: "Action details/description",
            },
            {
              name: "ip_address",
              type: "GenericIPAddress",
              constraints: "Nullable",
              desc: "IP address of request",
            },
            {
              name: "timestamp",
              type: "DateTime",
              constraints: "Auto",
              desc: "When action occurred",
            },
          ]}
          relationships={["ManyToOne → CustomUser (staff field) - Staff who performed action"]}
          ordering={["ORDER BY timestamp DESC - Most recent first"]}
        />

        {/* SupportMessage */}
        <ModelTable
          name="SupportMessage"
          table="api_supportmessage"
          description="Staff support and help requests"
          color="red"
          fields={[
            { name: "id", type: "Integer", constraints: "PK, Auto", desc: "Primary key" },
            {
              name: "name",
              type: "String(100)",
              constraints: "Required",
              desc: "Requester name",
            },
            {
              name: "email",
              type: "EmailField",
              constraints: "Required",
              desc: "Contact email",
            },
            {
              name: "message",
              type: "TextField",
              constraints: "Required",
              desc: "Support message content",
            },
            {
              name: "created_at",
              type: "DateTime",
              constraints: "Auto",
              desc: "Submission timestamp",
            },
            {
              name: "is_resolved",
              type: "Boolean",
              constraints: "Default: false",
              desc: "Resolution status",
            },
          ]}
        />
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-12 pt-8 border-t-2 border-gray-200">
        <p>QuickAid System - Data Dictionary Documentation</p>
        <p>DSWD Quezon Province | Generated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const ModelTable = ({
  name,
  table,
  description,
  color,
  fields,
  relationships,
  indexes,
  constraints,
  ordering,
}) => {
  const bgColor = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    yellow: "bg-yellow-100",
    red: "bg-red-100",
  }[color];

  const borderColor = {
    blue: "border-blue-300",
    green: "border-green-300",
    purple: "border-purple-300",
    yellow: "border-yellow-300",
    red: "border-red-300",
  }[color];

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-6">
      <div className={`${bgColor} p-4 border-b-2 ${borderColor}`}>
        <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
        <p className="text-sm text-gray-500 font-mono mt-1">Table: {table}</p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-3 text-left text-sm font-bold">Field Name</th>
            <th className="px-4 py-3 text-left text-sm font-bold">Data Type</th>
            <th className="px-4 py-3 text-left text-sm font-bold">Constraints</th>
            <th className="px-4 py-3 text-left text-sm font-bold">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 font-mono text-sm text-blue-600 font-semibold">
                {field.name}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-purple-600">{field.type}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{field.constraints}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{field.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {relationships && (
        <div className={`${bgColor} p-4 border-t-2 ${borderColor}`}>
          <h4 className="font-bold text-gray-800 mb-2">Relationships:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {relationships.map((rel, idx) => (
              <li key={idx}>• {rel}</li>
            ))}
          </ul>
        </div>
      )}

      {indexes && (
        <div className="bg-gray-50 p-4 border-t-2 border-gray-300">
          <h4 className="font-bold text-gray-800 mb-2">Indexes:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {indexes.map((idx, i) => (
              <li key={i}>• {idx}</li>
            ))}
          </ul>
        </div>
      )}

      {constraints && (
        <div className="bg-yellow-50 p-4 border-t-2 border-yellow-300">
          <h4 className="font-bold text-gray-800 mb-2">Constraints:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {constraints.map((con, i) => (
              <li key={i}>• {con}</li>
            ))}
          </ul>
        </div>
      )}

      {ordering && (
        <div className="bg-blue-50 p-4 border-t-2 border-blue-300">
          <h4 className="font-bold text-gray-800 mb-2">Default Ordering:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {ordering.map((ord, i) => (
              <li key={i}>• {ord}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ERDDiagram = () => {
  return (
    <div className="bg-white p-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        QuickAid System - Entity Relationship Diagram
      </h2>

      <svg
        viewBox="0 0 1400 1000"
        className="w-full h-auto border-2 border-gray-300 rounded-lg"
      >
        {/* Define Styles */}
        <defs>
          <style>{`
            .entity-box { fill: white; stroke: #2563eb; stroke-width: 2; }
            .entity-title { fill: #2563eb; font-weight: bold; font-size: 14px; font-family: Arial; }
            .entity-field { fill: #374151; font-size: 11px; font-family: monospace; }
            .relationship-line { stroke: #6b7280; stroke-width: 2; fill: none; }
            .relationship-text { fill: #6b7280; font-size: 10px; font-family: Arial; }
          `}</style>

          {/* Arrow markers */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
          </marker>
          <marker
            id="many"
            markerWidth="15"
            markerHeight="10"
            refX="14"
            refY="5"
            orient="auto"
          >
            <path
              d="M0,0 L5,5 L0,10 M5,5 L10,0 M5,5 L10,10"
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
            />
          </marker>
        </defs>

        {/* ENTITIES */}

        {/* CustomUser */}
        <g>
          <rect x="50" y="50" width="180" height="140" className="entity-box" rx="5" />
          <text x="140" y="75" textAnchor="middle" className="entity-title">
            CustomUser
          </text>
          <line x1="50" y1="85" x2="230" y2="85" stroke="#2563eb" strokeWidth="1" />
          <text x="60" y="105" className="entity-field">
            • id (PK)
          </text>
          <text x="60" y="120" className="entity-field">
            • username
          </text>
          <text x="60" y="135" className="entity-field">
            • email
          </text>
          <text x="60" y="150" className="entity-field">
            • role
          </text>
          <text x="60" y="165" className="entity-field">
            • is_active
          </text>
          <text x="60" y="180" className="entity-field">
            • ref_code
          </text>
        </g>

        {/* Region */}
        <g>
          <rect x="50" y="250" width="180" height="100" className="entity-box" rx="5" />
          <text x="140" y="275" textAnchor="middle" className="entity-title">
            Region
          </text>
          <line x1="50" y1="285" x2="230" y2="285" stroke="#2563eb" strokeWidth="1" />
          <text x="60" y="305" className="entity-field">
            • id (PK)
          </text>
          <text x="60" y="320" className="entity-field">
            • name
          </text>
          <text x="60" y="335" className="entity-field">
            • psgc_code
          </text>
        </g>

        {/* Province */}
        <g>
          <rect x="50" y="400" width="180" height="115" className="entity-box" rx="5" />
          <text x="140" y="425" textAnchor="middle" className="entity-title">
            Province
          </text>
          <line x1="50" y1="435" x2="230" y2="435" stroke="#2563eb" strokeWidth="1" />
          <text x="60" y="455" className="entity-field">
            • id (PK)
          </text>
          <text x="60" y="470" className="entity-field">
            • name
          </text>
          <text x="60" y="485" className="entity-field">
            • region_id (FK)
          </text>
          <text x="60" y="500" className="entity-field">
            • psgc_code
          </text>
        </g>

        {/* City */}
        <g>
          <rect x="50" y="565" width="180" height="115" className="entity-box" rx="5" />
          <text x="140" y="590" textAnchor="middle" className="entity-title">
            City
          </text>
          <line x1="50" y1="600" x2="230" y2="600" stroke="#2563eb" strokeWidth="1" />
          <text x="60" y="620" className="entity-field">
            • id (PK)
          </text>
          <text x="60" y="635" className="entity-field">
            • name
          </text>
          <text x="60" y="650" className="entity-field">
            • province_id (FK)
          </text>
          <text x="60" y="665" className="entity-field">
            • psgc_code
          </text>
        </g>

        {/* Barangay */}
        <g>
          <rect x="50" y="730" width="180" height="115" className="entity-box" rx="5" />
          <text x="140" y="755" textAnchor="middle" className="entity-title">
            Barangay
          </text>
          <line x1="50" y1="765" x2="230" y2="765" stroke="#2563eb" strokeWidth="1" />
          <text x="60" y="785" className="entity-field">
            • id (PK)
          </text>
          <text x="60" y="800" className="entity-field">
            • name
          </text>
          <text x="60" y="815" className="entity-field">
            • city_id (FK)
          </text>
          <text x="60" y="830" className="entity-field">
            • psgc_code
          </text>
        </g>

        {/* BackgroundInfo */}
        <g>
          <rect x="300" y="400" width="200" height="200" className="entity-box" rx="5" />
          <text x="400" y="425" textAnchor="middle" className="entity-title">
            BackgroundInfo
          </text>
          <line x1="300" y1="435" x2="500" y2="435" stroke="#2563eb" strokeWidth="1" />
          <text x="310" y="455" className="entity-field">
            • id (PK)
          </text>
          <text x="310" y="470" className="entity-field">
            • first_name
          </text>
          <text x="310" y="485" className="entity-field">
            • middle_initial
          </text>
          <text x="310" y="500" className="entity-field">
            • last_name
          </text>
          <text x="310" y="515" className="entity-field">
            • birthday
          </text>
          <text x="310" y="530" className="entity-field">
            • barangay_id (FK)
          </text>
          <text x="310" y="545" className="entity-field">
            • sex
          </text>
          <text x="310" y="560" className="entity-field">
            • civil_status
          </text>
          <text x="310" y="575" className="entity-field">
            • occupation
          </text>
          <text x="310" y="590" className="entity-field">
            • monthly_income
          </text>
        </g>

        {/* Applicant */}
        <g>
          <rect x="600" y="350" width="220" height="250" className="entity-box" rx="5" />
          <text x="710" y="375" textAnchor="middle" className="entity-title">
            Applicant
          </text>
          <line x1="600" y1="385" x2="820" y2="385" stroke="#2563eb" strokeWidth="1" />
          <text x="610" y="405" className="entity-field">
            • id (PK)
          </text>
          <text x="610" y="420" className="entity-field">
            • staff_id (FK)
          </text>
          <text x="610" y="435" className="entity-field">
            • background_info_id (FK)
          </text>
          <text x="610" y="450" className="entity-field">
            • contact_number
          </text>
          <text x="610" y="465" className="entity-field">
            • valid_id_presented
          </text>
          <text x="610" y="480" className="entity-field">
            • applicant_type
          </text>
          <text x="610" y="495" className="entity-field">
            • type_of_assistance
          </text>
          <text x="610" y="510" className="entity-field">
            • latitude
          </text>
          <text x="610" y="525" className="entity-field">
            • longitude
          </text>
          <text x="610" y="540" className="entity-field">
            • date_filled
          </text>
          <text x="610" y="555" className="entity-field">
            • created_at
          </text>
          <text x="610" y="570" className="entity-field">
            • is_archived
          </text>
        </g>

        {/* Representative */}
        <g>
          <rect x="900" y="400" width="210" height="140" className="entity-box" rx="5" />
          <text x="1005" y="425" textAnchor="middle" className="entity-title">
            Representative
          </text>
          <line x1="900" y1="435" x2="1110" y2="435" stroke="#2563eb" strokeWidth="1" />
          <text x="910" y="455" className="entity-field">
            • id (PK)
          </text>
          <text x="910" y="470" className="entity-field">
            • applicant_id (FK, Unique)
          </text>
          <text x="910" y="485" className="entity-field">
            • background_info_id (FK)
          </text>
          <text x="910" y="500" className="entity-field">
            • relationship
          </text>
          <text x="910" y="515" className="entity-field">
            • contact_number
          </text>
        </g>

        {/* ApplicantHistory */}
        <g>
          <rect x="600" y="650" width="220" height="130" className="entity-box" rx="5" />
          <text x="710" y="675" textAnchor="middle" className="entity-title">
            ApplicantHistory
          </text>
          <line x1="600" y1="685" x2="820" y2="685" stroke="#2563eb" strokeWidth="1" />
          <text x="610" y="705" className="entity-field">
            • id (PK)
          </text>
          <text x="610" y="720" className="entity-field">
            • background_info_id (FK)
          </text>
          <text x="610" y="735" className="entity-field">
            • applicant_id (FK)
          </text>
          <text x="610" y="750" className="entity-field">
            • type_of_assistance
          </text>
          <text x="610" y="765" className="entity-field">
            • date_applied
          </text>
        </g>

        {/* ApprovalBatch */}
        <g>
          <rect x="900" y="50" width="220" height="160" className="entity-box" rx="5" />
          <text x="1010" y="75" textAnchor="middle" className="entity-title">
            ApprovalBatch
          </text>
          <line x1="900" y1="85" x2="1120" y2="85" stroke="#2563eb" strokeWidth="1" />
          <text x="910" y="105" className="entity-field">
            • id (PK)
          </text>
          <text x="910" y="120" className="entity-field">
            • uploaded_by_id (FK)
          </text>
          <text x="910" y="135" className="entity-field">
            • uploaded_at
          </text>
          <text x="910" y="150" className="entity-field">
            • file_name
          </text>
          <text x="910" y="165" className="entity-field">
            • total_processed
          </text>
          <text x="910" y="180" className="entity-field">
            • total_approved
          </text>
        </g>

        {/* Approval */}
        <g>
          <rect x="900" y="250" width="220" height="130" className="entity-box" rx="5" />
          <text x="1010" y="275" textAnchor="middle" className="entity-title">
            Approval
          </text>
          <line x1="900" y1="285" x2="1120" y2="285" stroke="#2563eb" strokeWidth="1" />
          <text x="910" y="305" className="entity-field">
            • id (PK)
          </text>
          <text x="910" y="320" className="entity-field">
            • applicant_id (FK)
          </text>
          <text x="910" y="335" className="entity-field">
            • batch_id (FK)
          </text>
          <text x="910" y="350" className="entity-field">
            • approved_by_id (FK)
          </text>
          <text x="910" y="365" className="entity-field">
            • approved_at
          </text>
        </g>

        {/* StaffActivityLog */}
        <g>
          <rect x="1190" y="50" width="180" height="145" className="entity-box" rx="5" />
          <text x="1280" y="75" textAnchor="middle" className="entity-title">
            StaffActivityLog
          </text>
          <line x1="1190" y1="85" x2="1370" y2="85" stroke="#2563eb" strokeWidth="1" />
          <text x="1200" y="105" className="entity-field">
            • id (PK)
          </text>
          <text x="1200" y="120" className="entity-field">
            • staff_id (FK)
          </text>
          <text x="1200" y="135" className="entity-field">
            • action
          </text>
          <text x="1200" y="150" className="entity-field">
            • details
          </text>
          <text x="1200" y="165" className="entity-field">
            • ip_address
          </text>
          <text x="1200" y="180" className="entity-field">
            • timestamp
          </text>
        </g>

        {/* RELATIONSHIPS */}

        {/* Region -> Province (1:N) */}
        <path d="M 140 350 L 140 400" className="relationship-line" markerEnd="url(#many)" />
        <text x="145" y="380" className="relationship-text">
          1:N
        </text>

        {/* Province -> City (1:N) */}
        <path d="M 140 515 L 140 565" className="relationship-line" markerEnd="url(#many)" />
        <text x="145" y="545" className="relationship-text">
          1:N
        </text>

        {/* City -> Barangay (1:N) */}
        <path d="M 140 680 L 140 730" className="relationship-line" markerEnd="url(#many)" />
        <text x="145" y="710" className="relationship-text">
          1:N
        </text>

        {/* Barangay -> BackgroundInfo (1:N) */}
        <path d="M 230 787 L 300 500" className="relationship-line" markerEnd="url(#many)" />
        <text x="250" y="640" className="relationship-text">
          1:N
        </text>

        {/* CustomUser -> Applicant (1:N - staff) */}
        <path d="M 230 120 L 600 420" className="relationship-line" markerEnd="url(#many)" />
        <text x="400" y="260" className="relationship-text">
          processes 1:N
        </text>

        {/* BackgroundInfo -> Applicant (1:N) */}
        <path d="M 500 500 L 600 475" className="relationship-line" markerEnd="url(#many)" />
        <text x="530" y="485" className="relationship-text">
          1:N
        </text>

        {/* Applicant -> Representative (1:1) */}
        <path
          d="M 820 470 L 900 470"
          className="relationship-line"
          markerEnd="url(#arrowhead)"
        />
        <text x="840" y="465" className="relationship-text">
          1:1
        </text>

        {/* BackgroundInfo -> Representative (1:N) */}
        <path d="M 500 450 L 900 470" className="relationship-line" markerEnd="url(#many)" />
        <text x="690" y="445" className="relationship-text">
          1:N
        </text>

        {/* Applicant -> ApplicantHistory (1:N) */}
        <path d="M 710 600 L 710 650" className="relationship-line" markerEnd="url(#many)" />
        <text x="715" y="630" className="relationship-text">
          1:N
        </text>

        {/* BackgroundInfo -> ApplicantHistory (1:N) */}
        <path d="M 500 600 L 600 715" className="relationship-line" markerEnd="url(#many)" />
        <text x="530" y="660" className="relationship-text">
          1:N
        </text>

        {/* Applicant -> Approval (1:N) */}
        <path d="M 820 420 L 900 315" className="relationship-line" markerEnd="url(#many)" />
        <text x="840" y="360" className="relationship-text">
          1:N
        </text>

        {/* CustomUser -> ApprovalBatch (1:N - uploaded_by) */}
        <path d="M 230 120 L 900 120" className="relationship-line" markerEnd="url(#many)" />
        <text x="550" y="115" className="relationship-text">
          uploads 1:N
        </text>

        {/* ApprovalBatch -> Approval (1:N) */}
        <path d="M 1010 210 L 1010 250" className="relationship-line" markerEnd="url(#many)" />
        <text x="1015" y="235" className="relationship-text">
          1:N
        </text>

        {/* CustomUser -> Approval (1:N - approved_by) */}
        <path d="M 230 150 L 900 315" className="relationship-line" markerEnd="url(#many)" />
        <text x="550" y="220" className="relationship-text">
          approves 1:N
        </text>

        {/* CustomUser -> StaffActivityLog (1:N) */}
        <path d="M 230 120 L 1190 120" className="relationship-line" markerEnd="url(#many)" />
        <text x="700" y="115" className="relationship-text">
          logs 1:N
        </text>

        {/* Legend */}
        <g transform="translate(50, 900)">
          <rect
            x="0"
            y="0"
            width="300"
            height="80"
            fill="white"
            stroke="#2563eb"
            strokeWidth="2"
            rx="5"
          />
          <text x="150" y="25" textAnchor="middle" className="entity-title">
            Legend
          </text>
          <line
            x1="10"
            y1="35"
            x2="80"
            y2="35"
            stroke="#6b7280"
            strokeWidth="2"
            markerEnd="url(#many)"
          />
          <text x="90" y="40" className="relationship-text">
            One-to-Many (1:N)
          </text>
          <line
            x1="10"
            y1="55"
            x2="80"
            y2="55"
            stroke="#6b7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text x="90" y="60" className="relationship-text">
            One-to-One (1:1)
          </text>
        </g>
      </svg>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>QuickAid System - Entity Relationship Diagram</p>
        <p>Right-click and "Save image as..." to download</p>
      </div>
    </div>
  );
};

export default DataDictionaryDocument;
