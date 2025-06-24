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
    Book_ID, Copy_No, Title, Description,
    Author_ID,
    Publisher_ID, Category_ID, Price, Cover_Image_URL
  } = req.body;

  if (!Book_ID || !Copy_No || !Title || !Author_ID || !Publisher_ID || !Category_ID || !Price) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  try {
  //   // 1. Check Author
  //   const authorCheck = await pool.query(`SELECT * FROM Author WHERE Author_ID = $1`, [Author_ID]);
  //   if (authorCheck.rows.length === 0) {
  //     if (!Author_Name || !Total_Books) {
  //       return res.status(400).json({ error: 'Author does not exist. Provide Author_Name and Total_Books.' });
  //     }
  //     await pool.query(
  //       `INSERT INTO Author (Author_ID, Author_Name, Total_Books) VALUES ($1, $2, $3)`,
  //       [Author_ID, Author_Name, Total_Books]
  //     );
  //   }

  //   // 2. Check all Category_IDs
  //   const categoryCheck = await pool.query(
  //     `SELECT Category_ID FROM Category WHERE Category_ID = ANY($1)`,
  //     [Category_ID]
  //   );
  //   const existingCategories = categoryCheck.rows.map(row => row.category_id);
  //   const missingCategories = Category_ID.filter(id => !existingCategories.includes(id));

  //   // 3. Ask for missing category details
  //   if (missingCategories.length > 0) {
  //     return res.status(400).json({
  //       error: `Category ID(s) ${missingCategories.join(', ')} do not exist. Provide Category_Name and Description for them.`,
  //       missingCategoryIDs: missingCategories
  //     });
  //   }

    // 4. Insert Book
    const bookResult = await pool.query(
      `INSERT INTO Book (Book_ID, Copy_No, Title, Description, Author_ID, Publisher_ID, Price, Cover_Image_URL)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [Book_ID, Copy_No, Title, Description, Author_ID, Publisher_ID, Price, Cover_Image_URL]
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
