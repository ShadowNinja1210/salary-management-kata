# API Documentation

Base URL: `http://localhost:3000/api`

## Table of Contents

- [Employee Endpoints](#employee-endpoints)
  - [Create Employee](#create-employee)
  - [List Employees](#list-employees)
  - [Get Employee](#get-employee)
  - [Update Employee](#update-employee)
  - [Delete Employee](#delete-employee)
- [Metrics Endpoints](#metrics-endpoints)
  - [Country Metrics](#country-metrics)
  - [Job Title Metrics](#job-title-metrics)
- [Error Responses](#error-responses)

---

## Employee Endpoints

### Create Employee

Create a new employee record.

**Endpoint**: `POST /api/employees`

**Request Body**:

```json
{
  "fullName": "John Doe",
  "jobTitle": "Software Engineer",
  "country": "India",
  "grossSalary": 100000
}
```

**Field Validations**:

- `fullName`: String, 2-100 characters, required
- `jobTitle`: String, 2-100 characters, required
- `country`: String, 2-100 characters, required
- `grossSalary`: Number, min: 0, max: 10,000,000, required

**Response**: `201 Created`

```json
{
  "id": 1,
  "fullName": "John Doe",
  "jobTitle": "Software Engineer",
  "country": "India",
  "grossSalary": 100000,
  "tds": 10000,
  "netSalary": 90000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "jobTitle": "Software Engineer",
    "country": "India",
    "grossSalary": 100000
  }'
```

**TDS Calculation Rules**:

- India: 10% TDS
- USA / United States: 12% TDS
- Others: 0% TDS

**Net Salary Formula**: `netSalary = grossSalary - tds`

---

### List Employees

Retrieve a paginated list of employees with optional search, filters, and sorting.

**Endpoint**: `GET /api/employees`

**Query Parameters**:

| Parameter   | Type   | Default | Description                                       |
| ----------- | ------ | ------- | ------------------------------------------------- |
| `page`      | number | 1       | Page number (min: 1)                              |
| `limit`     | number | 10      | Items per page (min: 1, max: 100)                 |
| `search`    | string | -       | Search across fullName, jobTitle, country (ILIKE) |
| `country`   | string | -       | Filter by exact country name                      |
| `jobTitle`  | string | -       | Filter by exact job title                         |
| `minSalary` | number | -       | Filter by minimum gross salary                    |
| `maxSalary` | number | -       | Filter by maximum gross salary                    |
| `sortBy`    | string | id      | Sort field (id, fullName, jobTitle, etc.)         |
| `sortOrder` | string | asc     | Sort order (asc or desc)                          |

**Valid `sortBy` Fields**:

- `id`
- `fullName`
- `jobTitle`
- `country`
- `salary`
- `createdAt`

**Response**: `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "jobTitle": "Software Engineer",
      "country": "India",
      "grossSalary": 100000,
      "tds": 10000,
      "netSalary": 90000,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**cURL Examples**:

```bash
# Basic pagination
curl "http://localhost:3000/api/employees?page=1&limit=10"

# Search by keyword
curl "http://localhost:3000/api/employees?search=engineer"

# Filter by country
curl "http://localhost:3000/api/employees?country=India"

# Filter by salary range
curl "http://localhost:3000/api/employees?minSalary=50000&maxSalary=150000"

# Sort by salary descending
curl "http://localhost:3000/api/employees?sortBy=salary&sortOrder=desc"

# Combined query
curl "http://localhost:3000/api/employees?search=engineer&country=India&minSalary=80000&sortBy=salary&sortOrder=desc&page=1&limit=20"
```

---

### Get Employee

Retrieve a single employee by ID.

**Endpoint**: `GET /api/employees/:id`

**Path Parameters**:

- `id`: Employee ID (number)

**Response**: `200 OK`

```json
{
  "id": 1,
  "fullName": "John Doe",
  "jobTitle": "Software Engineer",
  "country": "India",
  "grossSalary": 100000,
  "tds": 10000,
  "netSalary": 90000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example**:

```bash
curl http://localhost:3000/api/employees/1
```

---

### Update Employee

Update an existing employee record.

**Endpoint**: `PUT /api/employees/:id`

**Path Parameters**:

- `id`: Employee ID (number)

**Request Body**:

```json
{
  "fullName": "John Doe",
  "jobTitle": "Senior Software Engineer",
  "country": "USA",
  "grossSalary": 150000
}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "fullName": "John Doe",
  "jobTitle": "Senior Software Engineer",
  "country": "USA",
  "grossSalary": 150000,
  "tds": 18000,
  "netSalary": 132000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:45:00.000Z"
}
```

**cURL Example**:

```bash
curl -X PUT http://localhost:3000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "jobTitle": "Senior Software Engineer",
    "country": "USA",
    "grossSalary": 150000
  }'
```

---

### Delete Employee

Delete an employee record.

**Endpoint**: `DELETE /api/employees/:id`

**Path Parameters**:

- `id`: Employee ID (number)

**Response**: `204 No Content`

**cURL Example**:

```bash
curl -X DELETE http://localhost:3000/api/employees/1
```

---

## Metrics Endpoints

### Country Metrics

Get salary statistics grouped by country.

**Endpoint**: `GET /api/employees/metrics/country`

**Response**: `200 OK`

```json
[
  {
    "country": "India",
    "employeeCount": 25,
    "avgSalary": 85000.5,
    "minSalary": 50000,
    "maxSalary": 120000
  },
  {
    "country": "USA",
    "employeeCount": 15,
    "avgSalary": 145000.75,
    "minSalary": 100000,
    "maxSalary": 200000
  }
]
```

**cURL Example**:

```bash
curl http://localhost:3000/api/employees/metrics/country
```

---

### Job Title Metrics

Get average salary grouped by job title.

**Endpoint**: `GET /api/employees/metrics/job-title`

**Response**: `200 OK`

```json
[
  {
    "jobTitle": "Software Engineer",
    "employeeCount": 30,
    "avgSalary": 95000.25
  },
  {
    "jobTitle": "Senior Software Engineer",
    "employeeCount": 10,
    "avgSalary": 145000.5
  }
]
```

**cURL Example**:

```bash
curl http://localhost:3000/api/employees/metrics/job-title
```

---

## Error Responses

### Validation Error

**Status**: `400 Bad Request`

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["fullName"],
      "message": "Full name must be at least 2 characters"
    },
    {
      "path": ["grossSalary"],
      "message": "Salary must be at least 0"
    }
  ]
}
```

### Not Found

**Status**: `404 Not Found`

```json
{
  "error": "Employee not found"
}
```

### Server Error

**Status**: `500 Internal Server Error`

```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

### Invalid Query Parameter

**Status**: `400 Bad Request`

```json
{
  "error": "Invalid sortBy field. Allowed fields: id, fullName, jobTitle, country, salary, createdAt"
}
```

---

## Notes

### SQL Injection Protection

All endpoints use parameterized queries to prevent SQL injection. The `sortBy` parameter is validated against a whitelist of allowed fields.

### Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production deployments.

### Authentication

Currently no authentication is required. For production use, implement JWT or session-based authentication.

### CORS

CORS headers are not configured by default. Add CORS middleware if accessing from different origins.

### Database Connection

All endpoints require a valid `DATABASE_URL` environment variable pointing to a Neon PostgreSQL instance.

---

**Last Updated**: January 2024  
**Version**: 1.0.0
