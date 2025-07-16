const asyncHandler = require('express-async-handler');
const Bug = require('../models/bug');
const Joi = require('joi');

// Validation schema for bug creation/update

const bugValidationSchema = Joi.object({
  title: Joi.string().required().max(100).trim(),
  description: Joi.string().required().max(1000).trim(),
  severity: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
  status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed'),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent'),
  assignedTo: Joi.string().trim(),
  reportedBy: Joi.string().required().trim(),
  tags: Joi.array().items(Joi.string().trim())
});

/**
 * @desc    Get all bugs with optional filtering
 * @route   GET /api/bugs
 * @access  Public
 */
const getBugs = asyncHandler(async (req, res) => {
  console.log('🔍 Fetching bugs with filters:', req.query);
  
  const { status, severity, priority, assignedTo, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (severity) filter.severity = severity;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  
  try {
    const bugs = await Bug.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Bug.countDocuments(filter);
    
    console.log(`✅ Found ${bugs.length} bugs (${total} total)`);
    
    res.json({
      bugs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Error fetching bugs:', error);
    res.status(500).json({ message: 'Failed to fetch bugs' });
  }
});

/**
 * @desc    Get single bug by ID
 * @route   GET /api/bugs/:id
 * @access  Public
 */
const getBugById = asyncHandler(async (req, res) => {
  console.log('🔍 Fetching bug by ID:', req.params.id);
  
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      console.log('❌ Bug not found');
      return res.status(404).json({ message: 'Bug not found' });
    }
    
    console.log('✅ Bug found:', bug.title);
    res.json(bug);
  } catch (error) {
    console.error('❌ Error fetching bug:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bug ID' });
    }
    res.status(500).json({ message: 'Failed to fetch bug' });
  }
});

/**
 * @desc    Create new bug
 * @route   POST /api/bugs
 * @access  Public
 */
const createBug = asyncHandler(async (req, res) => {
  console.log('🐛 Creating new bug:', req.body);
  
  // Validate request body
  const { error, value } = bugValidationSchema.validate(req.body);
  if (error) {
    console.log('❌ Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }
  
  try {
    const bug = new Bug(value);
    const savedBug = await bug.save();
    
    console.log('✅ Bug created successfully:', savedBug._id);
    res.status(201).json(savedBug);
  } catch (error) {
    console.error('❌ Error creating bug:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create bug' });
  }
});

/**
 * @desc    Update bug
 * @route   PUT /api/bugs/:id
 * @access  Public
 */
const updateBug = asyncHandler(async (req, res) => {
  console.log('🔄 Updating bug:', req.params.id, req.body);
  
  // Validate request body
  const { error, value } = bugValidationSchema.validate(req.body);
  if (error) {
    console.log('❌ Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }
  
  try {
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );
    
    if (!bug) {
      console.log('❌ Bug not found');
      return res.status(404).json({ message: 'Bug not found' });
    }
    
    console.log('✅ Bug updated successfully:', bug.title);
    res.json(bug);
  } catch (error) {
    console.error('❌ Error updating bug:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bug ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update bug' });
  }
});

/**
 * @desc    Delete bug
 * @route   DELETE /api/bugs/:id
 * @access  Public
 */
const deleteBug = asyncHandler(async (req, res) => {
  console.log('🗑️ Deleting bug:', req.params.id);
  
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    
    if (!bug) {
      console.log('❌ Bug not found');
      return res.status(404).json({ message: 'Bug not found' });
    }
    
    console.log('✅ Bug deleted successfully:', bug.title);
    res.json({ message: 'Bug deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting bug:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bug ID' });
    }
    res.status(500).json({ message: 'Failed to delete bug' });
  }
});

module.exports = {
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug
};