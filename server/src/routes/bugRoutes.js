const express = require('express');
const router = express.Router();
const { getBugs, getBugById, createBug, updateBug, deleteBug } = require('../controllers/bugController');

// Bug Routes
// All routes are prefixed with /api/bugs

// route   GET /api/bugs
// desc    Get all bugs with optional filtering
// access  Public
router.get('/', getBugs);

// route   POST /api/bugs
// desc    Create new bug
// access  Public
router.post('/', createBug);

// route   GET /api/bugs/:id
// desc    Get single bug by ID
// access  Public
router.get('/:id', getBugById);

// route   PUT /api/bugs/:id
// desc    Update bug
// access  Public
router.put('/:id', updateBug);

// route   DELETE /api/bugs/:id
// desc    Delete bug
// access  Public
router.delete('/:id', deleteBug);

module.exports = router;