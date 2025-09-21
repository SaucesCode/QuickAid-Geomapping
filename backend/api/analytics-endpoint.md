# 📖 **Analytics API Documentation**

## 1. 📊 Dashboard (Executive KPIs)

| Endpoint                                  | Purpose                                                                       | Response Format                                                               | Suggested Chart              |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `/analytics/dashboard/summary/`           | High-level metrics (total applicants, avg processing, top type, top barangay) | `{ totalApplicants, averageProcessingTime, mostCommonType, highestBarangay }` | KPI cards                    |
| `/analytics/dashboard/total-applicants/`  | Applicant counts by day, week, month                                          | `{ daily, weekly, monthly }`                                                  | KPI cards / small line trend |
| `/analytics/dashboard/growth-rate/`       | Growth rate (%) vs previous month                                             | `{ this_month, previous_month, growth_rate }`                                 | Line with % badge            |
| `/analytics/dashboard/repeat-applicants/` | Count of repeat applicants                                                    | `{ repeat_applicants }`                                                       | KPI card                     |

---

## 2. 🌍 Geographic Insights

| Endpoint                                     | Purpose                                            | Response Format                                                                         | Suggested Chart        |
| -------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| `/analytics/geographic/locations/`           | Applicant geocoordinates + address info            | `[ {id, full_name, latitude, longitude, address, barangay, city, type_of_assistance} ]` | Map (heatmap or pins)  |
| `/analytics/geographic/top-barangays/`       | Top 10 barangays by applicants                     | `[ {barangay, count} ]`                                                                 | Bar chart              |
| `/analytics/geographic/barangay-by-type/`    | Applicants per barangay × assistance type          | `[ {barangay, type_of_assistance, count} ]`                                             | Stacked bar chart      |
| `/analytics/geographic/approval-rate/`       | Approval rate by location (province/city/barangay) | `[ { location, total, approved, approval_rate } ]`                                      | Choropleth / bar chart |
| `/analytics/geographic/inactive-applicants/` | Applicants inactive for X months (default 6)       | `[ {id, name, last_application} ]`                                                      | Table + filter         |

---

## 3. 👥 Demographics & Economics

| Endpoint                                | Purpose                    | Response Format                                           | Suggested Chart |
| --------------------------------------- | -------------------------- | --------------------------------------------------------- | --------------- |
| `/analytics/demographics/gender/`       | Applicants by gender       | `[ {sex, count} ]`                                        | Pie / donut     |
| `/analytics/demographics/civil-status/` | Applicants by civil status | `[ {civil_status, count} ]`                               | Pie / donut     |
| `/analytics/demographics/age-groups/`   | Applicants by age range    | `[ {age_group, count} ]`                                  | Bar / pyramid   |
| `/analytics/demographics/occupation/`   | Applicants by occupation   | `[ {occupation, count} ]`                                 | Treemap / bar   |
| `/analytics/demographics/age-gender/`   | Cross-tab age × gender     | `[ {sex, under18, between18_35, between36_60, above60} ]` | Stacked bar     |

**Economics**

| Endpoint                                                | Purpose                                   | Response Format                             | Suggested Chart    |
| ------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | ------------------ |
| `/analytics/economics/income-distribution/`             | Applicants grouped by income ranges       | `[ {range, count} ]`                        | Histogram / bar    |
| _(future)_ `/analytics/economics/income-vs-occupation/` | Cross-tab of income × occupation          | `[ {occupation, avg_income, count} ]`       | Boxplot / scatter  |
| _(future)_ `/analytics/economics/disparities-location/` | Regional disparities (income vs approval) | `[ {location, avg_income, approval_rate} ]` | Choropleth overlay |

---

## 4. 📈 Application & Approval Trends

| Endpoint                                       | Purpose                              | Response Format                          | Suggested Chart     |
| ---------------------------------------------- | ------------------------------------ | ---------------------------------------- | ------------------- |
| `/analytics/trends/monthly/`                   | Applicants by month (last 12 months) | `[ {month, count} ]`                     | Line / area chart   |
| `/analytics/trends/yearly/`                    | Applicants by year                   | `[ {year, count} ]`                      | Column chart        |
| `/analytics/trends/over-time/`                 | Applicants by day (date range)       | `[ {day, count} ]`                       | Line chart          |
| `/analytics/trends/cumulative/`                | Cumulative applicants over time      | `[ {day, cumulative} ]`                  | Growth curve        |
| `/analytics/trends/assistance-type/`           | Distribution of assistance types     | `[ {type_of_assistance, count} ]`        | Pie / bar           |
| `/analytics/trends/assistance-type-over-time/` | Assistance type by month             | `[ {month, type_of_assistance, count} ]` | Stacked line / area |
| `/analytics/trends/approval/`                  | Approved applications over time      | `[ {month, count} ]`                     | Line                |
| `/analytics/trends/time-to-approval/`          | Avg time to approval (days)          | `{ average_days_to_approval }`           | KPI + trendline     |

---

## 5. ⚡ Performance & Productivity

| Endpoint                                          | Purpose                                  | Response Format                       | Suggested Chart    |
| ------------------------------------------------- | ---------------------------------------- | ------------------------------------- | ------------------ |
| `/analytics/performance/average-processing/`      | Avg processing time (minutes)            | `{ average_processing_time_minutes }` | KPI                |
| `/analytics/performance/processing-by-type/`      | Avg processing by assistance type        | `[ {type, avg_minutes} ]`             | Bar                |
| `/analytics/performance/processing-distribution/` | Applicants grouped by processing buckets | `[ {bucket, count} ]`                 | Histogram          |
| `/analytics/performance/staff-productivity/`      | Applicants processed per staff           | `[ {staff, count} ]`                  | Bar leaderboard    |
| `/analytics/performance/staff-leaderboard/`       | Top 10 staff by volume                   | `[ {staff, count} ]`                  | Ranked leaderboard |
| `/analytics/performance/staff-activity/`          | Staff activity logs (latest 100)         | `[ {id, staff, action, timestamp} ]`  | Table              |
| `/analytics/performance/staff-heatmap/`           | Staff activity by hour                   | `[ {hour, count} ]`                   | Heatmap            |
