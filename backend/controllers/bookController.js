import pool from '../config/db.js';

export const getAllBooks = async(req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM Book 
       ORDER BY book_id ASC`
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
    Book_ID, Title, Description,
    Author_ID, Publisher_ID, Category_ID, Price, Cover_Image_URL
  } = req.body;

  if(!Book_ID || !Copy_No || !Title  ||
     !Author_ID || !Publisher_ID || !Category_ID || !Price ) {
    return res.status(400).json({ error: 'All fields are required' });
  } 

  try {
        // Check if Author exists
    const authorCheck = await pool.query(
      'SELECT * FROM Author WHERE Author_ID = $1',
      [Author_ID]
    );
    if (authorCheck.rows.length === 0) {
      return res.status(307).json({ redirect: '/api/authors', message: `Author ID ${Author_ID} not found` });
    }

    // Check if Publisher exists
    const publisherCheck = await pool.query(
      'SELECT * FROM Publisher WHERE Publisher_ID = $1',
      [Publisher_ID]
    );
    if (publisherCheck.rows.length === 0) {
      return res.status(307).json({ redirect: '/api/publishers', message: `Publisher ID ${Publisher_ID} not found` });
    }

    // Check if all category IDs exist
    const categoryCheck = await pool.query(
      `SELECT Category_ID FROM Category WHERE Category_ID = ANY($1::int[])`,
      [Category_ID]
    );
    if (categoryCheck.rows.length !== Category_ID.length) {
      return res.status(400).json({ redirect: '/api/categories', message: `One or more category IDs not found` });
    }
    // 1. Insert book
    const bookResult = await pool.query(
      `INSERT INTO Book (Book_ID, Copy_No, Title, Description,  Author_ID, Publisher_ID, Price, Cover_Image_URL)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [Book_ID, Copy_No, Title, Description,  Author_ID, Publisher_ID, Price, Cover_Image_URL]
    );

    // 5. Insert BookCategory entries
    const categoryPromises = Category_ID.map(categoryId =>
      pool.query(
        `INSERT INTO BookCategory (Book_ID, Copy_No, Category_ID) VALUES ($1, $2, $3)`,
        [Book_ID, Copy_No, categoryId]
      )
    );
    await Promise.all(categoryPromises);

    // // 6. Insert Inventory Record
    // await pool.query(
    //   `INSERT INTO Inventory (Book_ID, Copy_No, Quantity)
    //    VALUES ($1, $2, $3, $4)`,
    //   [Book_ID, Copy_No, Copy_No]
    // );

    console.log('✅ Book created successfully');
    res.status(201).json({ success: true, data: bookResult.rows[0] });

  } catch (error) {
    console.error('❌ Error creating book with author/category check:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




export const getBook = async(req, res) => {

  const { book_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM Book WHERE book_id = $1`,
      [book_id]
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
  const { book_id } = req.params;
  const {
    Copy_No, Title, Description, ISBN,
    Author_ID, Publisher_ID, category_id, Price, Cover_Image_URL
  } = req.body;

  if(!Copy_No || !Title ||!ISBN ||
     !Author_ID || !Publisher_ID || !category_id || !Price ) {
    return res.status(400).json({ error: 'All fields are required' });
  } 

  try {
    // Update book details
    const result = await pool.query(
      `UPDATE Book 
       SET Copy_No = $1, Title = $2, Description = $3, ISBN = $4,
           Author_ID = $5, Publisher_ID = $6, Price = $7, Cover_Image_URL = $8
       WHERE book_id = $9
       RETURNING *`,
      [Copy_No, Title, Description, ISBN, Author_ID, Publisher_ID, Price, Cover_Image_URL, book_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Update categories
    await pool.query(`DELETE FROM BookCategory WHERE book_id = $1 AND Copy_No = $2`, [book_id, Copy_No]);
    
    const categoryPromises = category_id.map(categoryId =>
      pool.query(
        `INSERT INTO BookCategory (book_id, Copy_No, category_id) VALUES ($1, $2, $3)`,
        [book_id, Copy_No, categoryId]
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
  const { book_id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM Book WHERE book_id = $1 RETURNING *`,
      [book_id]
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


export const searchBooks = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        b.book_id,
        b.title,
        a.author_name,
        b.price,
        b.cover_image_url,
        COALESCE(AVG(r.rating), 0) AS average_rating
      FROM book b
      LEFT JOIN author a ON b.author_id = a.author_id
      LEFT JOIN bookcategory bc ON b.book_id = bc.book_id
      LEFT JOIN category c ON bc.category_id = c.category_id
      LEFT JOIN review r ON b.book_id = r.book_id
      WHERE
        LOWER(b.title) LIKE LOWER($1)
        OR LOWER(a.author_name) LIKE LOWER($1)
        OR LOWER(c.category_name) LIKE LOWER($1)
      GROUP BY b.book_id, b.title,a.author_name,b.price, b.cover_image_url
      ORDER BY b.title ASC
    `, [`%${query}%`]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

