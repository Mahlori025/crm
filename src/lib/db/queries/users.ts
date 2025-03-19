// src/lib/db/queries/users.ts
import { hash } from 'bcryptjs';
import { query, transaction, TransactionFunction } from '../index';
import { User, UserWithPassword, NewUser, UserUpdate } from '@/types/user';

export async function getUsers(
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<{ users: User[]; total: number }> {
  const conditions = ['1=1'];
  const params: any[] = [];
  
  if (search) {
    conditions.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
    params.push(`%${search}%`);
  }
  
  const whereClause = conditions.join(' AND ');
  
  // Get total count for pagination
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
    params
  );
  
  const total = parseInt(countResult.rows[0].count);
  
  // Add pagination parameters
  params.push(limit, offset);
  
  // Get paginated results
  const result = await query<User>(
    `SELECT id, email, name, role, active, created_at, updated_at 
     FROM users 
     WHERE ${whereClause}
     ORDER BY name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  
  return {
    users: result.rows,
    total
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT id, email, name, role, active, created_at, updated_at 
     FROM users 
     WHERE id = $1`,
    [id]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const result = await query<UserWithPassword>(
    `SELECT id, email, name, password, role, active, created_at, updated_at 
     FROM users 
     WHERE email = $1`,
    [email]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createUser(newUser: NewUser): Promise<User> {
  // Hash the password
  const hashedPassword = await hash(newUser.password, 10);
  
  const result = await query<User>(
    `INSERT INTO users (
      email, password, name, role, active
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, name, role, active, created_at, updated_at`,
    [
      newUser.email,
      hashedPassword,
      newUser.name,
      newUser.role || 'CUSTOMER',
      newUser.active !== undefined ? newUser.active : true,
    ]
  );
  
  return result.rows[0];
}

export async function updateUser(
  id: string,
  updates: UserUpdate
): Promise<User> {
  // Build SET clause dynamically based on provided updates
  const updateFields: string[] = [];
  const values: any[] = [];
  
  if (updates.email !== undefined) {
    updateFields.push(`email = $${values.length + 1}`);
    values.push(updates.email);
  }
  
  if (updates.name !== undefined) {
    updateFields.push(`name = $${values.length + 1}`);
    values.push(updates.name);
  }
  
  if (updates.role !== undefined) {
    updateFields.push(`role = $${values.length + 1}`);
    values.push(updates.role);
  }
  
  if (updates.active !== undefined) {
    updateFields.push(`active = $${values.length + 1}`);
    values.push(updates.active);
  }
  
  if (updates.password !== undefined) {
    const hashedPassword = await hash(updates.password, 10);
    updateFields.push(`password = $${values.length + 1}`);
    values.push(hashedPassword);
  }
  
  // Add the user ID to the values array
  values.push(id);
  
  const result = await query<User>(
    `UPDATE users 
    SET ${updateFields.join(', ')} 
    WHERE id = $${values.length} 
    RETURNING id, email, name, role, active, created_at, updated_at`,
    values
  );
  
  if (result.rows.length === 0) {
    throw new Error(`User with ID ${id} not found`);
  }
  
  return result.rows[0];
}

export async function deleteUser(id: string): Promise<boolean> {
  const txFunction: TransactionFunction<boolean> = async (client) => {
    // Check if user exists
    const checkResult = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    // Delete the user
    const result = await client.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    return result.rowCount > 0;
  };
  
  return transaction(txFunction);
}