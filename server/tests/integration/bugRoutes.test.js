const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Bug = require('../src/models/bug');

describe('Bug Routes Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await Bug.deleteMany({});
  });

  describe('GET /api/bugs', () => {
    it('should return empty array when no bugs exist', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body.bugs).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return all bugs', async () => {
      // Create test bugs
      const bug1 = new Bug({
        title: 'Bug 1',
        description: 'First bug',
        reportedBy: 'John Doe'
      });
      const bug2 = new Bug({
        title: 'Bug 2',
        description: 'Second bug',
        reportedBy: 'Jane Doe'
      });

      await bug1.save();
      await bug2.save();

      const response = await request(app)
        .get('/api/bugs')
        .expect(200);

      expect(response.body.bugs).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.bugs[0].title).toBe('Bug 2'); // Latest first
      expect(response.body.bugs[1].title).toBe('Bug 1');
    });

    it('should filter bugs by status', async () => {
      // Create bugs with different statuses
      await Bug.create([
        { title: 'Open Bug', description: 'Open', reportedBy: 'John', status: 'Open' },
        { title: 'Closed Bug', description: 'Closed', reportedBy: 'Jane', status: 'Closed' }
      ]);

      const response = await request(app)
        .get('/api/bugs?status=Open')
        .expect(200);

      expect(response.body.bugs).toHaveLength(1);
      expect(response.body.bugs[0].status).toBe('Open');
    });

    it('should handle pagination', async () => {
      // Create 15 bugs
      const bugs = Array.from({ length: 15 }, (_, i) => ({
        title: `Bug ${i + 1}`,
        description: `Description ${i + 1}`,
        reportedBy: 'Test User'
      }));

      await Bug.create(bugs);

      const response = await request(app)
        .get('/api/bugs?page=1&limit=10')
        .expect(200);

      expect(response.body.bugs).toHaveLength(10);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.currentPage).toBe('1');
      expect(response.body.total).toBe(15);
    });
  });

  describe('GET /api/bugs/:id', () => {
    it('should return bug by ID', async () => {
      const bug = new Bug({
        title: 'Test Bug',
        description: 'Test description',
        reportedBy: 'John Doe'
      });
      const savedBug = await bug.save();

      const response = await request(app)
        .get(`/api/bugs/${savedBug._id}`)
        .expect(200);

      expect(response.body.title).toBe('Test Bug');
      expect(response.body.description).toBe('Test description');
      expect(response.body.reportedBy).toBe('John Doe');
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/bugs/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Bug not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/bugs/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid bug ID');
    });
  });

  describe('POST /api/bugs', () => {
    it('should create a new bug', async () => {
      const bugData = {
        title: 'New Bug',
        description: 'New bug description',
        reportedBy: 'John Doe',
        severity: 'High',
        priority: 'Urgent'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(bugData)
        .expect(201);

      expect(response.body.title).toBe(bugData.title);
      expect(response.body.description).toBe(bugData.description);
      expect(response.body.reportedBy).toBe(bugData.reportedBy);
      expect(response.body.severity).toBe(bugData.severity);
      expect(response.body.priority).toBe(bugData.priority);
      expect(response.body.status).toBe('Open'); // Default status
    });

    it('should return 400 for missing required fields', async () => {
      const invalidBugData = {
        title: 'Bug without description'
        // Missing description and reportedBy
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidBugData)
        .expect(400);

      expect(response.body.message).toContain('description');
    });

    it('should return 400 for invalid severity', async () => {
      const invalidBugData = {
        title: 'Bug with invalid severity',
        description: 'Description',
        reportedBy: 'John Doe',
        severity: 'InvalidSeverity'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(invalidBugData)
        .expect(400);

      expect(response.body.message).toContain('severity');
    });

    it('should set default values for optional fields', async () => {
      const minimalBugData = {
        title: 'Minimal Bug',
        description: 'Just the basics',
        reportedBy: 'John Doe'
      };

      const response = await request(app)
        .post('/api/bugs')
        .send(minimalBugData)
        .expect(201);

      expect(response.body.severity).toBe('Medium');
      expect(response.body.status).toBe('Open');
      expect(response.body.priority).toBe('Medium');
      expect(response.body.assignedTo).toBe('Unassigned');
    });
  });

  describe('PUT /api/bugs/:id', () => {
    it('should update an existing bug', async () => {
      const bug = new Bug({
        title: 'Original Bug',
        description: 'Original description',
        reportedBy: 'John Doe'
      });
      const savedBug = await bug.save();

      const updateData = {
        title: 'Updated Bug',
        description: 'Updated description',
        reportedBy: 'John Doe',
        status: 'In Progress',
        severity: 'High'
      };

      const response = await request(app)
        .put(`/api/bugs/${savedBug._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Bug');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.status).toBe('In Progress');
      expect(response.body.severity).toBe('High');
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Bug',
        description: 'Updated description',
        reportedBy: 'John Doe'
      };

      const response = await request(app)
        .put(`/api/bugs/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Bug not found');
    });

    it('should return 400 for invalid update data', async () => {
      const bug = new Bug({
        title: 'Test Bug',
        description: 'Test description',
        reportedBy: 'John Doe'
      });
      const savedBug = await bug.save();

      const invalidUpdateData = {
        title: '', // Empty title should fail validation
        description: 'Updated description',
        reportedBy: 'John Doe'
      };

      const response = await request(app)
        .put(`/api/bugs/${savedBug._id}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.message).toContain('title');
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    it('should delete an existing bug', async () => {
      const bug = new Bug({
        title: 'Bug to Delete',
        description: 'This will be deleted',
        reportedBy: 'John Doe'
      });
      const savedBug = await bug.save();

      const response = await request(app)
        .delete(`/api/bugs/${savedBug._id}`)
        .expect(200);

      expect(response.body.message).toBe('Bug deleted successfully');

      // Verify bug is actually deleted
      const deletedBug = await Bug.findById(savedBug._id);
      expect(deletedBug).toBeNull();
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/bugs/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('Bug not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/bugs/invalid-id')
        .expect(400);

      expect(response.body.message).toBe('Invalid bug ID');
    });
  });

  describe('API Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });
});