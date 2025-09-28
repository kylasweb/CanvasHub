# CanvasHub Admin Access

## Initial Admin User

An admin user has been created for accessing the admin dashboard:

**Email:** admin@canvashub.com
**Password:** Admin123!

## How to Access Admin Dashboard

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth`
3. Sign in with the admin credentials above
4. After signing in, navigate to `http://localhost:3000/admin` to access the admin dashboard

## Important Notes

- **Change the password** after first login for security
- The admin user has full access to all admin features including:
  - User management
  - KYC verifications
  - Project management
  - System analytics
  - Audit logs
  - Settings management

## Database Setup

The application uses SQLite for development. The database file is located at `db/custom.db`.

To recreate the admin user or reset the database:

```bash
npm run db:reset  # Reset database
npm run db:create-admin  # Create admin user
```
