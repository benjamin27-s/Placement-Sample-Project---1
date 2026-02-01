const express = require('express');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Submit a new review (USER only)
// @access  Private - USER
router.post('/', protect, roleCheck('USER'), async (req, res) => {
    try {
        const { itemId, itemName, reviewText, rating } = req.body;

        // Validate required fields
        if (!itemId || !itemName || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Please provide itemId, itemName, and reviewText'
            });
        }

        // Check for duplicate review (userId + itemId must be unique)
        const existingReview = await Review.findOne({
            userId: req.user._id,
            itemId: itemId.trim()
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'You have already submitted a review for this item. Duplicate reviews are not allowed.'
            });
        }

        // Create review
        const review = await Review.create({
            userId: req.user._id,
            itemId: itemId.trim(),
            itemName: itemName.trim(),
            reviewText: reviewText.trim(),
            rating: rating || null,
            status: 'PENDING'
        });

        // Populate user info for response
        await review.populate('userId', 'username email');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully. Awaiting moderator approval.',
            data: { review }
        });
    } catch (error) {
        console.error('Submit review error:', error);

        // Handle duplicate key error (backup for unique index)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'You have already submitted a review for this item. Duplicate reviews are not allowed.'
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while submitting review'
        });
    }
});

// @route   GET /api/reviews/my
// @desc    Get current user's reviews (USER only)
// @access  Private - USER
router.get('/my', protect, roleCheck('USER'), async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: { reviews }
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});

// @route   GET /api/reviews
// @desc    Get all reviews (MODERATOR only)
// @access  Private - MODERATOR
router.get('/', protect, roleCheck('MODERATOR'), async (req, res) => {
    try {
        const { status } = req.query;

        // Build query
        const query = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
            query.status = status.toUpperCase();
        }

        const reviews = await Review.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: { reviews }
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve a review (MODERATOR only)
// @access  Private - MODERATOR
router.put('/:id/approve', protect, roleCheck('MODERATOR'), async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.status = 'APPROVED';
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review approved successfully',
            data: { review }
        });
    } catch (error) {
        console.error('Approve review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while approving review'
        });
    }
});

// @route   PUT /api/reviews/:id/reject
// @desc    Reject a review (MODERATOR only)
// @access  Private - MODERATOR
router.put('/:id/reject', protect, roleCheck('MODERATOR'), async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.status = 'REJECTED';
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review rejected',
            data: { review }
        });
    } catch (error) {
        console.error('Reject review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting review'
        });
    }
});

module.exports = router;
