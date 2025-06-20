import pool from '../config/db.js';

export const getAllBooks = async(req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM Book 
       ORDER BY Book_ID ASC`
    );
    console.log('Books fetched successfully:', result.rows);
    res.status(200).json({ success: true, data: result.rows});  
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }  
};
export const createBook = async (req, res) => {
  const {
    Book_ID, Copy_No, Title, Description, ISBN,
    Author_ID, Publisher_ID, Category_ID, Price, Cover_Image_URL
  } = req.body;

  if(!Book_ID || !Copy_No || !Title ||!ISBN ||
     !Author_ID || !Publisher_ID || !Category_ID || !Price ) {
    return res.status(400).json({ error: 'All fields are required' });
  } 

  try {
    // 1. Insert book
    const bookResult = await pool.query(
      `INSERT INTO Book (Book_ID, Copy_No, Title, Description, ISBN, Author_ID, Publisher_ID, Price, Cover_Image_URL)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [Book_ID, Copy_No, Title, Description, ISBN, Author_ID, Publisher_ID, Price, Cover_Image_URL]
    );

    // 2. Insert categories
    const categoryPromises = Category_ID.map(categoryId =>
      pool.query(
        `INSERT INTO BookCategory (Book_ID, Copy_No, Category_ID) VALUES ($1, $2, $3)`,
        [Book_ID, Copy_No, categoryId]
      )
    );
    await Promise.all(categoryPromises);
    console.log('Received body:', req.body);


    res.status(201).json({ success: true, data: bookResult.rows[0] });
 } catch (error) {
  console.error('❌ Error creating book:', error.message);
  console.error(error.stack);
  res.status(500).json({ error: error.message });
}

};

export const getBook = async(req, res) => {

  const { Book_ID } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM Book WHERE Book_ID = $1`,
      [Book_ID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    console.log('Book fetched successfully:', result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const updateBook = async(req, res) => {
  const { Book_ID } = req.params;
  const {
    Copy_No, Title, Description, ISBN,
    Author_ID, Publisher_ID, Category_ID, Price, Cover_Image_URL
  } = req.body;

  if(!Copy_No || !Title ||!ISBN ||
     !Author_ID || !Publisher_ID || !Category_ID || !Price ) {
    return res.status(400).json({ error: 'All fields are required' });
  } 

  try {
    // Update book details
    const result = await pool.query(
      `UPDATE Book 
       SET Copy_No = $1, Title = $2, Description = $3, ISBN = $4,
           Author_ID = $5, Publisher_ID = $6, Price = $7, Cover_Image_URL = $8
       WHERE Book_ID = $9
       RETURNING *`,
      [Copy_No, Title, Description, ISBN, Author_ID, Publisher_ID, Price, Cover_Image_URL, Book_ID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Update categories
    await pool.query(`DELETE FROM BookCategory WHERE Book_ID = $1 AND Copy_No = $2`, [Book_ID, Copy_No]);
    
    const categoryPromises = Category_ID.map(categoryId =>
      pool.query(
        `INSERT INTO BookCategory (Book_ID, Copy_No, Category_ID) VALUES ($1, $2, $3)`,
        [Book_ID, Copy_No, categoryId]
      )
    );
    await Promise.all(categoryPromises);

    console.log('Book updated successfully:', result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

};
export const deleteBook = async(req, res) => {
  const { Book_ID } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM Book WHERE Book_ID = $1 RETURNING *`,
      [Book_ID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    console.log('Book deleted successfully:', result.rows[0]);
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
