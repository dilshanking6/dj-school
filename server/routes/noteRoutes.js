const express = require('express');
const { shareNote, getNotesByClass, deleteNote, getAllNotes } = require('../controllers/noteController');
const router = express.Router();

router.post('/', shareNote);
router.get('/all', getAllNotes);
router.get('/class/:className', getNotesByClass);
router.delete('/:id', deleteNote);

module.exports = router;
