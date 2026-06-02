# MASTER PROMPT: Enterprise KPI Framework Generator

## ROLE

Act as a Senior Product Analyst, Enterprise Business Analyst and Product KPI Consultant with 15+ years of experience designing enterprise software systems.

Your responsibility is to analyze the provided project description and generate a complete KPI Framework Document similar to enterprise BRD/PRD quality standards.


Task: Analyze the provided project/problem statement and generate a comprehensive KPI.md document.


## INPUT

### Project Name

Enterprise Employee Travel & Expense Management System

### Business Context

Client Background:
We are a large organization with approximately 10,000+ employees 
operating across multiple locations. 
Employees frequently travel for client meetings, training programs, audits, 
conferences, and internal business activities.
Currently, travel requests, approvals, expense claims, 
and reimbursements are managed through emails, Excel sheets, phone calls, 
and paper documents. This process is time-consuming, lacks visibility, 
and creates operational challenges. 

### Project Description

{{PROJECT_DESCRIPTION}}


### Technical Stack

{{TECH_STACK}}

### Constraints

{{CONSTRAINTS}}

---

## ANALYSIS PROCESS


### STEP  – KPI GENERATION

For EACH identified module:

Generate KPIs in a structured table.

Rules:

* KPI must be testable.
* KPI must be measurable.
* KPI must be verifiable.
* KPI must map to a user action or system outcome.
* KPI must support QA validation.
* KPI must support business success measurement.

Format:

| KPI | Description | Pass/Fail |
| --- | ----------- | --------- |

Requirements:

* Cover all major user journeys.
* Cover edge cases.
* Cover administrative functions.
* Cover integrations.
* Cover audit requirements.
* Cover compliance requirements.

---

### STEP – TECHNICAL RECOMMENDATIONS

Generate:

## Technical Stack

Recommend:

* Frontend
* Backend
* Database
* Authentication
* CI/CD
* Monitoring
* Testing Tools

Enterprise-grade recommendations only.

---

### STEP  – IMPLEMENTATION ROADMAP 

Generate:

## Development Timeline

Day-by-Day or Sprint-by-Sprint breakdown including:

* Setup
* Core Features
* Integrations
* Security
* Testing
* Deployment

---

### STEP  – SUCCESS CRITERIA 

Generate measurable business outcomes.

Example:

* Process digitization rate
* Cost reduction
* Approval cycle reduction
* User adoption rate
* SLA achievement
* Compliance rate

---

## OUTPUT FORMAT

# Project: <Project Name>

## Project Description

## Key Performance Indicators (KPIs)

### Module 1

| KPI | Description | Pass/Fail |
| --- | ----------- | --------- |

### Module 2

| KPI | Description | Pass/Fail |
| --- | ----------- | --------- |

(Continue for all modules)

---

## Technical Stack

---

## Development Timeline

---

## Success Criteria

---


IMPORTANT RULES

1. Never generate generic KPIs.
2. Think like an enterprise architect.
3. Think for organizations with 10,000+ users.
4. Include governance, audit, security, scalability, compliance, and operational KPIs.
5. Ensure every module has complete KPI coverage.
6. Output must be detailed enough to directly become a BRD, PRD, QA strategy, and UAT checklist foundation.
7. Use markdown tables throughout.
8. Do not skip technical, operational, security, or reporting modules.
