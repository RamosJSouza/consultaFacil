const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const db = require('../src/database/connection');

let adminToken, clientToken, professionalToken;
let testUserId, testClientId, testProfessionalId;

beforeAll(async () => {
  // Create test users in the database
  await db('users').delete().where('email', 'admin@test.com');
  await db('users').delete().where('email', 'client@test.com');
  await db('users').delete().where('email', 'professional@test.com');

  // Insert admin user
  [testUserId] = await db('users').insert({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: '$2a$10$NXOHO7h1j3VpuV8UwMhMqeVzOXgEJbxfcJLDiIQDhFy/V.hQ0qA0a', // hashed 'password123'
    role: 'ADMIN',
    is_active: true
  }).returning('id');

  // Insert client user
  [testClientId] = await db('users').insert({
    name: 'Test Client',
    email: 'client@test.com',
    password: '$2a$10$NXOHO7h1j3VpuV8UwMhMqeVzOXgEJbxfcJLDiIQDhFy/V.hQ0qA0a', // hashed 'password123'
    role: 'CLIENT',
    is_active: true
  }).returning('id');

  // Insert professional user
  [testProfessionalId] = await db('users').insert({
    name: 'Test Professional',
    email: 'professional@test.com',
    password: '$2a$10$NXOHO7h1j3VpuV8UwMhMqeVzOXgEJbxfcJLDiIQDhFy/V.hQ0qA0a', // hashed 'password123'
    role: 'PROFESSIONAL',
    specialty: 'Testing',
    bio: 'I am a test professional',
    is_active: true
  }).returning('id');

  // Generate tokens
  adminToken = jwt.sign(
    { id: testUserId, role: 'ADMIN' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  clientToken = jwt.sign(
    { id: testClientId, role: 'CLIENT' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  professionalToken = jwt.sign(
    { id: testProfessionalId, role: 'PROFESSIONAL' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  // Clean up test data
  await db('users').delete().where('email', 'admin@test.com');
  await db('users').delete().where('email', 'client@test.com');
  await db('users').delete().where('email', 'professional@test.com');
  await db.destroy();
});

describe('Authentication Endpoints', () => {
  test('POST /auth/login - should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual('admin@test.com');
  });

  test('POST /auth/login - should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
  });
});

describe('User Endpoints', () => {
  test('GET /users - should return all users for admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /users - should be forbidden for non-admin users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(403);
  });

  test('GET /users/:id - should return user details', async () => {
    const res = await request(app)
      .get(`/api/users/${testClientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testClientId);
    expect(res.body).toHaveProperty('email', 'client@test.com');
  });

  test('PATCH /users/:id/status - should update user status', async () => {
    const res = await request(app)
      .patch(`/api/users/${testClientId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.statusCode).toEqual(200);
    
    // Verify the user was deactivated
    const updatedUser = await db('users').where('id', testClientId).first();
    expect(updatedUser.is_active).toEqual(false);
    
    // Reactivate the user for other tests
    await request(app)
      .patch(`/api/users/${testClientId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });
  });
});

describe('Appointment Endpoints', () => {
  let testAppointmentId;

  test('POST /appointments - should create a new appointment', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = tomorrow.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        professionalId: testProfessionalId,
        title: 'Test Appointment',
        description: 'This is a test appointment',
        date: appointmentDate,
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    testAppointmentId = res.body.id;
  });

  test('GET /appointments - should return user appointments', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('PATCH /appointments/:id - should update appointment status', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${professionalToken}`)
      .send({ status: 'confirmed' });

    expect(res.statusCode).toEqual(200);
    
    // Verify the appointment was updated
    const updatedAppointment = await db('appointments').where('id', testAppointmentId).first();
    expect(updatedAppointment.status).toEqual('confirmed');
  });

  test('DELETE /appointments/:id - should cancel an appointment', async () => {
    const res = await request(app)
      .delete(`/api/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    
    // Verify the appointment was cancelled (not deleted)
    const updatedAppointment = await db('appointments').where('id', testAppointmentId).first();
    expect(updatedAppointment.status).toEqual('cancelled');
  });
});

describe('Notification Endpoints', () => {
  test('GET /notifications - should return user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('PATCH /notifications/:id/read - should mark notification as read', async () => {
    // First create a notification
    const [notificationId] = await db('notifications').insert({
      user_id: testClientId,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'test',
      read: false
    }).returning('id');

    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    
    // Verify the notification was marked as read
    const updatedNotification = await db('notifications').where('id', notificationId).first();
    expect(updatedNotification.read).toEqual(true);
  });

  test('DELETE /notifications - should clear all user notifications', async () => {
    // First create a few notifications
    await db('notifications').insert([
      {
        user_id: testClientId,
        title: 'Test Notification 1',
        message: 'This is test notification 1',
        type: 'test',
        read: false
      },
      {
        user_id: testClientId,
        title: 'Test Notification 2',
        message: 'This is test notification 2',
        type: 'test',
        read: false
      }
    ]);

    const res = await request(app)
      .delete('/api/notifications')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toEqual(200);
    
    // Verify all notifications for this user were deleted
    const remainingNotifications = await db('notifications').where('user_id', testClientId);
    expect(remainingNotifications.length).toEqual(0);
  });
}); 