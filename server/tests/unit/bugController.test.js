const { getBugs, getBugById, createBug, updateBug, deleteBug } = require('../../src/controllers/bugController');
const Bug = require('../../src/models/bug');

// Mock the Bug model
jest.mock('../../src/models/bug');

describe('Bug Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    mockReq = {
      params: {},
      query: {},
      body: {}
    };
    
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('getBugs', () => {
    it('should return all bugs successfully', async () => {
      // Mock data
      const mockBugs = [
        { _id: '1', title: 'Bug 1', severity: 'High' },
        { _id: '2', title: 'Bug 2', severity: 'Low' }
      ];

      // Mock mongoose methods
      Bug.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockBugs)
            })
          })
        })
      });
      Bug.countDocuments.mockResolvedValue(2);

      await getBugs(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        bugs: mockBugs,
        totalPages: 1,
        currentPage: 1,
        total: 2
      });
    });

    it('should handle filtering by status', async () => {
      mockReq.query = { status: 'Open' };
      
      Bug.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([])
            })
          })
        })
      });
      Bug.countDocuments.mockResolvedValue(0);

      await getBugs(mockReq, mockRes);

      expect(Bug.find).toHaveBeenCalledWith({ status: 'Open' });
    });

    it('should handle database error', async () => {
      Bug.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              exec: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      });

      await getBugs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to fetch bugs' });
    });
  });

  describe('getBugById', () => {
    it('should return bug by ID successfully', async () => {
      const mockBug = { _id: '1', title: 'Test Bug' };
      mockReq.params.id = '1';

      Bug.findById.mockResolvedValue(mockBug);

      await getBugById(mockReq, mockRes);

      expect(Bug.findById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith(mockBug);
    });

    it('should return 404 if bug not found', async () => {
      mockReq.params.id = '999';

      Bug.findById.mockResolvedValue(null);

      await getBugById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bug not found' });
    });

    it('should handle invalid ID format', async () => {
      mockReq.params.id = 'invalid-id';

      const error = new Error('Invalid ID');
      error.name = 'CastError';
      Bug.findById.mockRejectedValue(error);

      await getBugById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid bug ID' });
    });
  });

  describe('createBug', () => {
    it('should create bug successfully', async () => {
      const bugData = {
        title: 'New Bug',
        description: 'Bug description',
        reportedBy: 'John Doe'
      };
      const savedBug = { _id: '1', ...bugData };

      mockReq.body = bugData;

      // Mock Bug constructor and save method
      Bug.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedBug)
      }));

      await createBug(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(savedBug);
    });

    it('should return 400 for validation error', async () => {
      mockReq.body = {
        title: '', // Empty title should fail validation
        description: 'Bug description'
      };

      await createBug(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.stringContaining('title')
      });
    });
  });

  describe('updateBug', () => {
    it('should update bug successfully', async () => {
      const updatedBug = {
        _id: '1',
        title: 'Updated Bug',
        description: 'Updated description',
        reportedBy: 'John Doe'
      };

      mockReq.params.id = '1';
      mockReq.body = {
        title: 'Updated Bug',
        description: 'Updated description',
        reportedBy: 'John Doe'
      };

      Bug.findByIdAndUpdate.mockResolvedValue(updatedBug);

      await updateBug(mockReq, mockRes);

      expect(Bug.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'Updated Bug',
          description: 'Updated description',
          reportedBy: 'John Doe'
        }),
        { new: true, runValidators: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith(updatedBug);
    });

    it('should return 404 if bug not found for update', async () => {
      mockReq.params.id = '999';
      mockReq.body = {
        title: 'Updated Bug',
        description: 'Updated description',
        reportedBy: 'John Doe'
      };

      Bug.findByIdAndUpdate.mockResolvedValue(null);

      await updateBug(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bug not found' });
    });
  });

  describe('deleteBug', () => {
    it('should delete bug successfully', async () => {
      const deletedBug = { _id: '1', title: 'Bug to delete' };
      mockReq.params.id = '1';

      Bug.findByIdAndDelete.mockResolvedValue(deletedBug);

      await deleteBug(mockReq, mockRes);

      expect(Bug.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bug deleted successfully' });
    });

    it('should return 404 if bug not found for deletion', async () => {
      mockReq.params.id = '999';

      Bug.findByIdAndDelete.mockResolvedValue(null);

      await deleteBug(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bug not found' });
    });
  });
});