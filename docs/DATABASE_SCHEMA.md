# Database Schema

The application uses PostgreSQL with Prisma ORM. The main schema lives in [backEnd/prisma/schema.prisma](../backEnd/prisma/schema.prisma).

## Entity Relationship Summary

- One User can have many Leads
- Each Lead belongs to exactly one User
- Deleting a User removes that user's Leads automatically

## User

| Field | Type | Notes |
| --- | --- | --- |
| id | Int | Primary key, auto-increment |
| name | String | Full name |
| email | String | Unique, used for login |
| passwordHash | String | Hashed password |
| passwordResetToken | String? | Optional reset token |
| passwordResetExpires | DateTime? | Optional expiry for reset token |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Auto-updated timestamp |

## Lead

| Field | Type | Notes |
| --- | --- | --- |
| id | Int | Primary key, auto-increment |
| title | String | Lead title |
| company | String | Company name |
| email | String? | Optional contact email |
| phone | String? | Optional phone |
| status | String | Defaults to "new" |
| source | String? | Lead source |
| value | Float? | Deal value |
| notes | String? | Optional notes |
| createdAt | DateTime | Timestamp |
| updatedAt | DateTime | Auto-updated timestamp |
| userId | Int | Foreign key to User |

## Notes

- The schema is managed through Prisma migrations.
- To inspect or update the schema, edit [backEnd/prisma/schema.prisma](../backEnd/prisma/schema.prisma) and run:

```bash
cd backEnd
npx prisma migrate dev
```
