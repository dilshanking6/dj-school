const express = require('express');
const { shareNote, getNotesByClass, deleteNote } = require('../controllers/noteController');
const router = express.Router();

router.post('/', shareNote);
router.get('/class/:className', getNotesByClass);
router.delete('/:id', deleteNote);

module.exports = router;
