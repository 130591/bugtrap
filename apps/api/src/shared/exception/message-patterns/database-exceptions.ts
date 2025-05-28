export const DATABASE_EXCEPTION_MESSAGES = {
		Database: {
			ConnectionRefused: {
				code: 'DB-CONN-001',
				message: 'Connection to the database was refused. Please ensure the database server is running and accessible.',
			},
			Timeout: {
				code: 'DB-CONN-002',
				message: 'Database connection timed out.',
			},
			InvalidCredentials: {
				code: 'DB-AUTH-001',
				message: 'Invalid database credentials provided.',
			},

			QueryFailed: {
				code: 'DB-OP-001',
				message: 'A database query failed unexpectedly.',
			},
			UniqueConstraintViolation: {
				code: 'DB-OP-002',
				message: 'A unique constraint was violated. Data already exists or is duplicated.',
			},
			NotFound: {
				code: 'DB-OP-003',
				message: 'The requested record was not found in the database.',
			},
			WriteError: {
				code: 'DB-OP-004',
				message: 'Failed to write data to the database.',
			},
			ReadError: {
				code: 'DB-OP-005',
				message: 'Failed to read data from the database.',
			},

			MigrationFailed: {
				code: 'DB-MIG-001',
				message: 'Database migration failed.',
			},
			InternalError: {
				code: 'DB-GEN-001',
				message: 'An internal database error occurred.',
			},
			DBSchemaMismatch: {
				code: 'DB_SCHEMA_MISMATCH',
				message: 'Internal error processing the request. Please contact support.',
			}
		},
}