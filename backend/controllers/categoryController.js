export const addCategory = async (req, res) => {
    const { Category_ID, Category_Name, Description } = req.body;
  
    if (!Category_ID || !Category_Name || !Description) {
      return res.status(400).json({ error: 'All category fields are required' });
    }
  
    try {
      await pool.query(
        `INSERT INTO Category (Category_ID, Category_Name, Description)
         VALUES ($1, $2, $3)`,
        [Category_ID, Category_Name, Description]
      );
      res.status(201).json({ message: 'Category added successfully' });
    } catch (error) {
      console.error('❌ Error adding category:', error.message);
      console.error(error.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  