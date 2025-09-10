import express from 'express';
import fs from 'fs';
import Patient from '../models/Patient.js';
import upload, { handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// GET /api/patients - Get all patients with optional filtering
router.get('/', async (req, res) => {
  try {
    const { search, diagnosis, minAge, maxAge, limit = 50, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query object
    let query = {};

    // Search filter (name or relatives)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { relatives: { $regex: search, $options: 'i' } }
      ];
    }

    // Diagnosis filter
    if (diagnosis) {
      query.diagnosis = { $regex: diagnosis, $options: 'i' };
    }

    // Age range filter
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    // Pagination
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 results per page
    const skip = (parseInt(page) - 1) * limitNum;

    // Sort order
    const sortOptions = {};
    const validSortFields = ['name', 'age', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortField] = order;

    // Execute query
    const patients = await Patient.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .select('-__v');

    // Get total count for pagination
    const total = await Patient.countDocuments(query);

    res.json({
      data: patients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Error retrieving patients: ' + error.message });
  }
});

// GET /api/patients/search - Search patients (alternative endpoint)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }

    const patients = await Patient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { diagnosis: { $regex: q, $options: 'i' } },
        { operation: { $regex: q, $options: 'i' } },
        { relatives: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(20)
    .select('name age diagnosis operation relatives ')
    .sort({ name: 1 });

    res.json(patients);

  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ message: 'Error searching patients: ' + error.message });
  }
});

// GET /api/patients/stats - Get patient statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const averageAge = await Patient.aggregate([
      { $group: { _id: null, avgAge: { $avg: '$age' } } }
    ]);

    const totalRelatives = await Patient.aggregate([
      { $project: { relativesCount: { $size: '$relatives' } } },
      { $group: { _id: null, total: { $sum: '$relativesCount' } } }
    ]);

    res.json({
      totalPatients,
      averageAge: totalPatients > 0 ? Math.round(averageAge[0]?.avgAge || 0) : 0,
      totalRelatives: totalRelatives[0]?.total || 0
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error retrieving statistics: ' + error.message });
  }
});

// GET /api/patients/:id - Get single patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('-__v');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);

  } catch (error) {
    console.error('Get patient error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    res.status(500).json({ message: 'Error retrieving patient: ' + error.message });
  }
});

// POST /api/patients - Add new patient
router.post('/', upload.single('picture'), handleMulterError, async (req, res) => {
  try {
    const { name, age, diagnosis, operation, details, relatives } = req.body;

    // Validate required fields
    if (!name || !age || !diagnosis || !operation || !details) {
      return res.status(400).json({ 
        message: 'Name, age, diagnosis, operation and details are required fields' 
      });
    }

    // Parse relatives if it's a string
    let relativesArray = [];
    if (relatives) {
      try {
        relativesArray = typeof relatives === 'string' 
          ? JSON.parse(relatives) 
          : relatives;

        // Ensure it's an array and filter out empty strings
        if (Array.isArray(relativesArray)) {
          relativesArray = relativesArray.filter(rel => rel && rel.trim().length > 0);
        } else {
          relativesArray = [];
        }
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid relatives data format' });
      }
    }

    const patientData = {
      name: name.trim(),
      age: parseInt(age),
      diagnosis: diagnosis.trim(),
      operation: operation.trim(),
      details: details.trim(),
      relatives: relativesArray,
      picture: req.file ? req.file.path : null
    };

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      data: patient
    });

  } catch (error) {
    console.error('Create patient error:', error);

    // Clean up uploaded file if patient creation fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    res.status(500).json({ message: 'Error creating patient: ' + error.message });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', upload.single('picture'), handleMulterError, async (req, res) => {
  try {
    const { name, age, diagnosis, operation, relatives } = req.body;

    // Check if patient exists
    const existingPatient = await Patient.findById(req.params.id);
    if (!existingPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Parse relatives if provided
    let relativesArray = existingPatient.relatives;
    if (relatives !== undefined) {
      try {
        relativesArray = typeof relatives === 'string' 
          ? JSON.parse(relatives) 
          : relatives;

        if (Array.isArray(relativesArray)) {
          relativesArray = relativesArray.filter(rel => rel && rel.trim().length > 0);
        } else {
          relativesArray = [];
        }
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid relatives data format' });
      }
    }

    // Prepare update data
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(age && { age: parseInt(age) }),
      ...(diagnosis && { diagnosis: diagnosis.trim() }),
      ...(operation && { operation: operation.trim() }),
      relatives: relativesArray
    };

    // Update picture if new one uploaded
    if (req.file) {
      // Delete old picture if it exists
      if (existingPatient.picture) {
        try {
          fs.unlinkSync(existingPatient.picture);
        } catch (error) {
          console.warn('Could not delete old picture file:', error.message);
        }
      }
      updateData.picture = req.file.path;
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      message: 'Patient updated successfully',
      data: patient
    });

  } catch (error) {
    console.error('Update patient error:', error);

    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    res.status(500).json({ message: 'Error updating patient: ' + error.message });
  }
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete associated picture file
    if (patient.picture) {
      try {
        fs.unlinkSync(patient.picture);
      } catch (error) {
        console.warn('Could not delete picture file:', error.message);
      }
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Patient deleted successfully',
      deletedId: req.params.id
    });

  } catch (error) {
    console.error('Delete patient error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    res.status(500).json({ message: 'Error deleting patient: ' + error.message });
  }
});

// PATCH /api/patients/:id/picture - Update only patient picture
router.patch('/:id/picture', upload.single('picture'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No picture file provided' });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete old picture if it exists
    if (patient.picture) {
      try {
        fs.unlinkSync(patient.picture);
      } catch (error) {
        console.warn('Could not delete old picture file:', error.message);
      }
    }

    // Update with new picture
    patient.picture = req.file.path;
    await patient.save();

    res.json({
      message: 'Patient picture updated successfully',
      picture: patient.picture
    });

  } catch (error) {
    console.error('Update picture error:', error);

    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({ message: 'Error updating picture: ' + error.message });
  }
});

export default router;