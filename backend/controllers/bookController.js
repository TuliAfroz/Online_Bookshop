import pool from '../config/db.js';

// --- getAllBooks with sorting support ---
export const getAllBooks = async(req, res) => {
  const { publisher_id, page = 1, limit = 20, sort } = req.query;

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count total number of books (for pagination info)
    let countQuery = `SELECT COUNT(*) AS total FROM Book`;
    const countParams = [];

    if (publisher_id) {
      countQuery += ` WHERE publisher_id = $1`;
      countParams.push(publisher_id);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    let query = `
      SELECT 
        b.book_id,
        b.title,
        b.price,
        b.cover_image_url,
        a.author_name,
        COALESCE(AVG(r.rating), 0) AS average_rating
      FROM Book b
      JOIN Author a ON b.author_id = a.author_id
      LEFT JOIN Review r ON b.book_id = r.book_id
    `;

    const queryParams = [];

    if (publisher_id) {
      query += ` WHERE b.publisher_id = $1`;
      queryParams.push(publisher_id);
    }

    query += `
      GROUP BY b.book_id, a.author_name
    `;

    // --- Sorting logic ---
    let orderBy = 'b.book_id ASC'; // Default
    switch (sort) {
      case 'price_asc':
        orderBy = 'b.price ASC';
        break;
      case 'price_desc':
        orderBy = 'b.price DESC';
        break;
      case 'rating_asc':
        orderBy = 'average_rating ASC';
        break;
      case 'rating_desc':
        orderBy = 'average_rating DESC';
        break;
      case 'name_asc':
        orderBy = 'b.title ASC';
        break;
      case 'name_desc':
        orderBy = 'b.title DESC';
        break;
      default:
        orderBy = 'b.book_id ASC';
    }
    query += ` ORDER BY ${orderBy} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    console.log('Books fetched successfully:', result.rows);
    res.status(200).json({
      success: true,
      data: result.rows,
      total,               // total books
      page: parseInt(page),
      limit: parseInt(limit),
    });  
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }  
};

export const createBook = async (req, res) => {
  const {
    Book_ID, Title, Description,
    Author_ID, Publisher_ID, Price, Cover_Image_URL
  } = req.body;

  // Remove Category_ID from required fields
  if (!Book_ID || !Title || !Author_ID || !Publisher_ID || !Price) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if Author exists
    const authorCheck = await pool.query(
      'SELECT * FROM Author WHERE Author_ID = $1',
      [Author_ID]
    );
    if (authorCheck.rows.length === 0) {
      return res.status(200).json({
  redirect: '/publisher/dashboard?tab=add-author',
  message: `Author ID ${Author_ID} not found. Please add the author.`
});
    }
                                                                         
    // Check if Publisher exists
    const publisherCheck = await pool.query(
      'SELECT * FROM Publisher WHERE Publisher_ID = $1',
      [Publisher_ID]
    );
    if (publisherCheck.rows.length === 0) {
      return res.status(307).json({ redirect: '/api/publishers', message: `Publisher ID ${Publisher_ID} not found` });
    }

    // ✅ Check if the book already exists
    const existingBook = await pool.query(
      'SELECT * FROM Book WHERE Book_ID = $1',
      [Book_ID]
    );

    if (existingBook.rows.length > 0) {
      return res.status(200).json({ message: 'Book already exists.' });
    }

    // 1. Insert book (category is not included)
    const bookResult = await pool.query(
      `INSERT INTO Book (Book_ID, Title, Description, Author_ID, Publisher_ID, Price, Cover_Image_URL)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [Book_ID, Title, Description || null, Author_ID, Publisher_ID, Price, Cover_Image_URL || null]
    );

    // No BookCategory insertion

    // // Add to Inventory (initial count = 1)
    // await pool.query(
    //   `INSERT INTO Inventory (Book_ID, Quantity) VALUES ($1, 1)`,
    //   [Book_ID]
    // );

    console.log('✅ Book inserted:', req.body);

    res.status(201).json({ success: true, data: bookResult.rows[0] });

  } catch (error) {
    console.error('❌ Error creating book:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const getBook = async (req, res) => {
  const { book_id } = req.params;
  try {
    // 1. Get book info + author + categories + inventory quantity + average rating
    const result = await pool.query(
      `
      SELECT b.*, a.author_name, 
        COALESCE(i.quantity, 0) as quantity,
        ARRAY_AGG(DISTINCT c.category_name) AS categories,
        COALESCE(AVG(r.rating), 0) AS average_rating
      FROM Book b
      LEFT JOIN Author a ON b.author_id = a.author_id
      LEFT JOIN Inventory i ON b.book_id = i.book_id
      LEFT JOIN BookCategory bc ON b.book_id = bc.book_id
      LEFT JOIN Category c ON bc.category_id = c.category_id
      LEFT JOIN Review r ON b.book_id = r.book_id
      WHERE b.book_id = $1
      GROUP BY b.book_id, a.author_name, i.quantity
      `,
      [book_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = result.rows[0];

    // 2. Get all reviews with customer name for this book
    const reviewsResult = await pool.query(
      `
      SELECT r.rating, r.description, c.customer_name
      FROM Review r
      JOIN Customer c ON r.customer_id = c.customer_id
      WHERE r.book_id = $1
      `,
      [book_id]
    );

    res.status(200).json({ 
      success: true, 
      data: {
        ...book,
        reviews: reviewsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateBook = async(req, res) => {
  const { book_id } = req.params;
  const {
     Title, Description,
    Author_ID, Publisher_ID, category_id, Price, Cover_Image_URL
  } = req.body;

  if(!Title ||
     !Author_ID || !Publisher_ID || !category_id || !Price ) {
    return res.status(400).json({ error: 'All fields are required' });
  } 

  try {
    // Update book details
    const result = await pool.query(
      `UPDATE Book 
       SET Title = $1, Description = $2,
           Author_ID = $3, Publisher_ID = $4, Price = $5, Cover_Image_URL = $6
       WHERE book_id = $7
       RETURNING *`,
      [Title, Description, Author_ID, Publisher_ID, Price, Cover_Image_URL, book_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Update categories
    await pool.query(`DELETE FROM BookCategory WHERE book_id = $1`, [book_id]);

    const categoryPromises = category_id.map(categoryId =>
      pool.query(
        `INSERT INTO BookCategory (book_id, category_id) VALUES ($1, $2)`,
        [book_id, categoryId]
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

    await pool.query(`DELETE FROM CartItem WHERE Book_ID = $1`, [book_id]);
    await pool.query(`DELETE FROM Inventory WHERE Book_ID = $1`, [book_id]);
    await pool.query(`DELETE FROM BookCategory WHERE Book_ID = $1`, [book_id]);
    await pool.query(`DELETE FROM Review WHERE Book_ID = $1`, [book_id]);
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

export const updateInventory = async (req, res) => {
  const { book_id } = req.params;
  const { quantity, price } = req.body;

  if (quantity == null && price == null) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    if (quantity != null) {
      await pool.query(`UPDATE Inventory SET Quantity = $1 WHERE Book_ID = $2`, [quantity, book_id]);
    }
    if (price != null) {
      await pool.query(`UPDATE Book SET Price = $1 WHERE Book_ID = $2`, [price, book_id]);
    }

    res.status(200).json({ message: 'Inventory updated successfully' });
  } catch (err) {
    console.error('❌ Error updating inventory:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// --- searchBooks with sorting support ---
export const searchBooks = async (req, res) => {
  const { query: searchQuery, sort } = req.query;

  try {
    let result;
    let sql = `
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
    `;
    let params = [];

    if (!searchQuery) {
      // No query means fetch all books
      sql += ` GROUP BY b.book_id, b.title, a.author_name, b.price, b.cover_image_url`;
    } else {
      // Search with the query
      sql += `
        WHERE
          LOWER(b.title) LIKE LOWER($1)
          OR LOWER(a.author_name) LIKE LOWER($1)
          OR LOWER(c.category_name) LIKE LOWER($1)
        GROUP BY b.book_id, b.title, a.author_name, b.price, b.cover_image_url
      `;
      params.push(`%${searchQuery}%`);
    }

    // --- Sorting logic ---
    let orderBy = 'b.title ASC'; // Default
    switch (sort) {
      case 'price_asc':
        orderBy = 'b.price ASC';
        break;
      case 'price_desc':
        orderBy = 'b.price DESC';
        break;
      case 'rating_asc':
        orderBy = 'average_rating ASC';
        break;
      case 'rating_desc':
        orderBy = 'average_rating DESC';
        break;
      case 'name_asc':
        orderBy = 'b.title ASC';
        break;
      case 'name_desc':
        orderBy = 'b.title DESC';
        break;
      default:
        orderBy = 'b.title ASC';
    }
    sql += ` ORDER BY ${orderBy}`;

    result = await pool.query(sql, params);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getBooksByAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT b.*, a.author_name 
       FROM book b 
       JOIN author a ON b.author_id = a.author_id 
       WHERE b.author_id = $1
       ORDER BY b.book_id ASC`,
      [id]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getBooksByPublisher = async (req, res) => {
  try {
    const { publisherId } = req.params;
    const { query, sort } = req.query; // <-- include sort

    const publisherIdNum = parseInt(publisherId, 10);
    if (isNaN(publisherIdNum)) {
      return res.status(400).json({ error: 'Invalid publisherId' });
    }

    console.log('Fetching books for publisherId:', publisherIdNum, 'with search query:', query, 'and sort:', sort);

    let sql = `
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
      WHERE b.publisher_id = $1
    `;

    let params = [publisherIdNum];

    if (query) {
      sql += `
        AND (
          LOWER(b.title) LIKE LOWER($2)
          OR LOWER(a.author_name) LIKE LOWER($2)
          OR LOWER(c.category_name) LIKE LOWER($2)
        )
      `;
      params.push(`%${query}%`);
    }

    sql += `
      GROUP BY b.book_id, b.title, a.author_name, b.price, b.cover_image_url
    `;

    // --- Sorting logic ---
    let orderBy = 'b.title ASC'; // Default
    switch (sort) {
      case 'price_asc':
        orderBy = 'b.price ASC';
        break;
      case 'price_desc':
        orderBy = 'b.price DESC';
        break;
      case 'rating_asc':
        orderBy = 'average_rating ASC';
        break;
      case 'rating_desc':
        orderBy = 'average_rating DESC';
        break;
      case 'name_asc':
        orderBy = 'b.title ASC';
        break;
      case 'name_desc':
        orderBy = 'b.title DESC';
        break;
      default:
        orderBy = 'b.title ASC';
    }
    sql += ` ORDER BY ${orderBy}`;

    const result = await pool.query(sql, params);

    console.log('Books found:', result.rows.length);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching books by publisher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const getBooksInStock = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const offset = (page - 1) * limit;
    const { sort } = req.query; // <-- ADD THIS

    // First get total count of in-stock books
    const countResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM book b
      JOIN inventory i ON b.book_id = i.book_id
      WHERE i.quantity > 0
    `);
    const total = parseInt(countResult.rows[0].total);

    // --- Sorting logic ---
    let orderBy = 'b.book_id ASC'; // Default
    switch (sort) {
      case 'price_asc':
        orderBy = 'b.price ASC';
        break;
      case 'price_desc':
        orderBy = 'b.price DESC';
        break;
      case 'name_asc':
        orderBy = 'b.title ASC';
        break;
      case 'name_desc':
        orderBy = 'b.title DESC';
        break;
      default:
        orderBy = 'b.book_id ASC';
    }

    // Then get paginated books
    const result = await pool.query(`
      SELECT b.*, i.quantity AS stock_quantity
      FROM book b
      JOIN inventory i ON b.book_id = i.book_id
      WHERE i.quantity > 0
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.status(200).json({ 
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching books in stock:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getBooksGroupedByCategory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.category_id,
        c.category_name,
        b.book_id,
        b.title,
        b.cover_image_url,
        b.price,
        a.author_name,
        i.quantity
      FROM category c
      JOIN bookcategory bc ON c.category_id = bc.category_id
      JOIN book b ON bc.book_id = b.book_id
      JOIN author a ON b.author_id = a.author_id
      JOIN inventory i ON b.book_id = i.book_id
      WHERE i.quantity > 0
      ORDER BY c.category_id, b.book_id;
    `);

    const grouped = {};

    for (const row of result.rows) {
      const {
        category_id,
        category_name,
        book_id,
        title,
        cover_image_url,
        price,
        author_name,
        quantity,
      } = row;

      if (!grouped[category_id]) {
        grouped[category_id] = {
          category_id,
          category_name,
          books: [],
        };
      }

      grouped[category_id].books.push({
        book_id,
        title,
        cover_image_url,
        price,
        author_name,
        quantity,
      });
    }

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.error('🔥 ERROR in getBooksGroupedByCategory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const assignCategory = async (req, res) => {
  const { book_id, category_ids } = req.body;

  // Validate book_id
  if (!book_id) {
    return res.status(400).json({
      success: false,
      error: 'Book ID is required',
    });
  }

  try {
    // Check if book exists
    const bookCheck = await pool.query(
      `SELECT * FROM Book WHERE book_id = $1`,
      [book_id]
    );
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    // ** remove previous categories first**
    await pool.query(`DELETE FROM BookCategory WHERE book_id = $1`, [book_id]);

    //If category_ids is empty, just return success after clearing
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All categories removed from the book',
        book_id,
        assigned_categories: [],
      });
    }

    // Optionally check if provided categories exist
    const categoryCheck = await pool.query(
      `SELECT category_id FROM Category WHERE category_id = ANY($1)`,
      [category_ids]
    );
    const validCategoryIds = categoryCheck.rows.map((row) => row.category_id);
    const invalidIds = category_ids.filter((id) => !validCategoryIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid category IDs: ${invalidIds.join(', ')}`,
      });
    }

    // Insert new categories
    const insertPromises = category_ids.map((categoryId) =>
      pool.query(
        `INSERT INTO BookCategory (book_id, category_id) VALUES ($1, $2)`,
        [book_id, categoryId]
      )
    );
    await Promise.all(insertPromises);

    return res.status(200).json({
      success: true,
      message: 'Categories assigned successfully',
      book_id,
      assigned_categories: category_ids,
    });
  } catch (error) {
    console.error('Error assigning categories:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};