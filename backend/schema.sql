CREATE TABLE IF NOT EXISTS Publisher (
  Publisher_ID   INT PRIMARY KEY,
  Publisher_Name VARCHAR NOT NULL,
  Phone_No       VARCHAR
);

CREATE TABLE IF NOT EXISTS Category (
  Category_ID   INT PRIMARY KEY,
  Category_Name VARCHAR NOT NULL,
  Description   VARCHAR
);

CREATE TABLE IF NOT EXISTS Author (
  Author_ID   INT PRIMARY KEY,
  Author_Name VARCHAR NOT NULL,
  Total_Books INT
);

CREATE TABLE IF NOT EXISTS Customer (
  Customer_ID   INT PRIMARY KEY,
  Password      VARCHAR NOT NULL,
  Customer_Name VARCHAR NOT NULL,
  Phone_No      VARCHAR NOT NULL,
  Address       VARCHAR NOT NULL,
  Email         VARCHAR
);

CREATE TABLE IF NOT EXISTS Admin (
  Admin_ID INT PRIMARY KEY,
  Password VARCHAR NOT NULL,
  balance FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS Book (
  Book_ID         INT,
  --Copy_No         INT,
  Title           VARCHAR NOT NULL,
  Description     VARCHAR,
  ISBN            VARCHAR UNIQUE NOT NULL,
  Cover_Image_URL VARCHAR,
  Author_ID       INT,
  Publisher_ID    INT,
  Price           FLOAT NOT NULL,
  PRIMARY KEY (Book_ID)
);

CREATE TABLE IF NOT EXISTS BookCategory (
  Book_ID   INT,
  --Copy_No   INT,
  Category_ID INT,
  PRIMARY KEY (Book_ID,  Category_ID),
  FOREIGN KEY (Book_ID) REFERENCES Book(Book_ID) ON DELETE CASCADE,
  FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID)
);


CREATE TABLE IF NOT EXISTS Cart (
  Cart_ID     INT PRIMARY KEY,
  Customer_ID INT,
  Created_At  DATE
);

CREATE TABLE IF NOT EXISTS CartItem (
  CartItem_ID    INT PRIMARY KEY,
  Cart_ID        INT,
  Book_ID        INT,
  --Copy_No        INT,
  Quantity       INT NOT NULL,
  Per_Item_Price FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS Orders (
  Order_ID       INT PRIMARY KEY,
  Customer_ID    INT,
 -- Gift_Card_ID   INT,
  Cart_ID        INT,
  Date           DATE,
  SubTotal_Price FLOAT,
  Discount       FLOAT,
  use_points     BOOLEAN,
  Total_Price    FLOAT
);

CREATE TABLE IF NOT EXISTS Payment (
  Transaction_ID       VARCHAR PRIMARY KEY,
  Order_ID             INT,
  Amount               FLOAT NOT NULL,
  Date                 DATE,
  Method               VARCHAR NOT NULL,
  Payer_Customer_ID    INT,
  Receiver_Admin_ID    INT,
  Payer_Admin_ID       INT,
  Receiver_Publisher_ID INT,
  Points_Earned        INT
);

CREATE TABLE IF NOT EXISTS GiftCard (
  Card_ID     INT PRIMARY KEY,
  Customer_ID INT,
  Amount      FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS Point (
  Customer_ID INT PRIMARY KEY,
  Point_count INT,
  Level       VARCHAR
);

CREATE TABLE IF NOT EXISTS Shipment (
  Shipment_ID     INT PRIMARY KEY,
  Order_ID        INT,
  Publisher_ID    INT,
  Admin_ID        INT,
  Shipment_Status VARCHAR NOT NULL,
  Shipment_Date   DATE
);

CREATE TABLE IF NOT EXISTS Inventory (
  Book_ID  INT,
  --Copy_No  INT,
  Admin_ID INT,
  Quantity INT NOT NULL,
  PRIMARY KEY (Book_ID)
);

CREATE TABLE IF NOT EXISTS Review (
  Book_ID      INT,
  --Copy_No      INT,
  Customer_ID  INT,
  Rating       INT NOT NULL,
  Description  VARCHAR,
  PRIMARY KEY (Book_ID, Customer_ID)
);

-- Foreign Keys
ALTER TABLE Book
  DROP COLUMN IF EXISTS Category_ID;

ALTER TABLE Book
  ADD FOREIGN KEY (Author_ID) REFERENCES Author(Author_ID);

ALTER TABLE Book
  ADD FOREIGN KEY (Publisher_ID) REFERENCES Publisher(Publisher_ID);

ALTER TABLE Cart
  ADD FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID);

ALTER TABLE CartItem
  ADD FOREIGN KEY (Cart_ID) REFERENCES Cart(Cart_ID);

ALTER TABLE CartItem
  ADD FOREIGN KEY (Book_ID) REFERENCES Book(Book_ID);

ALTER TABLE Orders
  ADD FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID);

--ALTER TABLE Orders
 -- ADD FOREIGN KEY (Gift_Card_ID) REFERENCES GiftCard(Card_ID);

ALTER TABLE Orders
  ADD FOREIGN KEY (Cart_ID) REFERENCES Cart(Cart_ID);

ALTER TABLE Payment
  ADD FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID);

ALTER TABLE Payment
  ADD FOREIGN KEY (Payer_Customer_ID) REFERENCES Customer(Customer_ID);

ALTER TABLE Payment
  ADD FOREIGN KEY (Receiver_Admin_ID) REFERENCES Admin(Admin_ID);

ALTER TABLE Payment
  ADD FOREIGN KEY (Payer_Admin_ID) REFERENCES Admin(Admin_ID);

ALTER TABLE Payment
  ADD FOREIGN KEY (Receiver_Publisher_ID) REFERENCES Publisher(Publisher_ID);

ALTER TABLE GiftCard
  ADD FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID);

ALTER TABLE Point
  ADD FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID);

ALTER TABLE Shipment
  ADD FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID);

ALTER TABLE Shipment
  ADD FOREIGN KEY (Publisher_ID) REFERENCES Publisher(Publisher_ID);

ALTER TABLE Shipment
  ADD FOREIGN KEY (Admin_ID) REFERENCES Admin(Admin_ID);

ALTER TABLE Inventory
  ADD FOREIGN KEY (Book_ID) REFERENCES Book(Book_ID);

--ALTER TABLE Inventory
  --ADD FOREIGN KEY (Admin_ID) REFERENCES Admin(Admin_ID);

ALTER TABLE Review
  ADD FOREIGN KEY (Book_ID) REFERENCES Book(Book_ID);

ALTER TABLE Review
  ADD FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID);
