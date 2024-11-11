Drop Database inventory;
CREATE DATABASE IF NOT EXISTS Inventory;
USE Inventory;

CREATE TABLE users (
		user_id INT NOT NULL PRIMARY KEY auto_increment,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(100),
        phone char(10),
        email VARCHAR(100) NOT NULL,
        password varchar(100) NOT NULL,
        is_active TINYINT(1) DEFAULT 0,
        roles enum("admin","normal","superadmin") default "normal" not null,
        created_at TimeStamp DEFAULT CURRENT_TIMESTAMP ,
        updated_at DateTime DEFAULT CURRENT_TIMESTAMP on update current_timestamp
	);
    
CREATE TABLE customers(
		customer_id INT NOT NULL PRIMARY KEY auto_increment,
		name VARCHAR(100) NOT NULL,
        phone char(10),
        email VARCHAR(100),
        address VARCHAR(100) Not null , 
        country VARCHAR(50), 
        state VARCHAR(50) , 
        city VARCHAR(50) ,
        user_id int,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        foreign key(user_id) references users(user_id)
        );
        
Create Table categorys( 
			category_id int primary key auto_increment,
            category_name varchar(100) not null,
            category_des varchar(255),
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp on update current_timestamp
);

CREATE TABLE products(
		product_id int primary key auto_increment,
        product_name varchar(100) not null,
        brand varchar(50),
        unit varchar(30),
        buying_rate decimal(10,2) ,
        vat decimal(5,2),
        selling_rate decimal(10,2) ,
        stock int unsigned,
        category_id int,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        foreign key(category_id) references categorys(category_id)
        );

CREATE TABLE vendors(
		vendor_id int primary key auto_increment,
        vendor_name varchar(100) not null,
        email varchar(50),
        phone char(10) not null,
        pan_no char(9),
        pin_code varchar(50),
        country varchar(50) not null,
        state varchar(50),
        city varchar(50) not null,
        address varchar(100) not null,
        created_by int not null,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        foreign key(created_by) references users(user_id)
        );

CREATE TABLE companies(
		company_id int primary key auto_increment,
        company_name varchar(100) not null,
        registration_no varchar(100) not null,
        phone char(10) not null,
        email varchar(100) not null,
        DOJ timestamp not null default current_timestamp,
        pan_no char(9) not null,
        vat_no varchar(100) not null,
        address varchar(100) not null,
		country varchar(50) not null,
        state varchar(50),
        city varchar(50),
        zip int,
        bank_name varchar(100),
        account_no varchar(100),
        bank_branch varchar(100),
        bank_address varchar(100),
        bank_code int,
        website varchar(100),
        company_logo varchar(200),
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp
        );
CREATE TABLE purchases(
		purchase_id int primary key auto_increment,
        ordered_qnt int unsigned,
        received_qnt int unsigned,
        unit_rate int unsigned,
        vat_rate decimal(5,2),
        pruchase_date timestamp default current_timestamp,
        status enum("pending","received","cancle") default "received",
        remarks text,
        vendor_id int not null,
        product_id int not null,
        foreign key(vendor_id) references users(user_id),
        foreign key(product_id) references products(product_id)
    );
    
    
CREATE TABLE invoices(
		invoices_id int primary key auto_increment,
        customer_id int,
        product_id int,
        Quantity int unsigned,
        rate int unsigned,
        total decimal(10,2),
        payment enum("paid","pending","partial paid") default "paid",
        vat decimal(5,2),
        remark varchar(200),
        date timestamp default current_timestamp,
        created_at timestamp default current_timestamp,
        update_at timestamp default current_timestamp on update current_timestamp
);









INSERT INTO users (name, address, phone, email, password, is_active, roles)
VALUES
    ('John Doe', '123 Main St, Butwal', '9876543210', 'john.doe@example.com', "abcd" , 1, 'admin'),
    ('Alice Smith', '456 Oak St, Pokhara', '9867345678', 'alice.smith@example.com',"abcd" , 1, 'normal'),
    ('Bob Johnson', '789 Pine St, Kathmandu', '9856345678', 'bob.johnson@example.com',"abcd" , 0, 'normal'),
    ('Charlie Brown', '321 Maple St, Lalitpur', '9845678901', 'charlie.brown@example.com',"abcd" , 1, 'normal'),
    ('David Lee', '123 Birch St, Bhaktapur', '9834567890', 'david.lee@example.com',"abcd" , 1, 'normal'),
    ('Emma Green', '654 Cedar St, Pokhara', '9823456789', 'emma.green@example.com',"abcd" , 1, 'normal'),
    ('Frank White', '789 Oak St, Butwal', '9812345678', 'frank.white@example.com',"abcd" , 0, 'normal'),
    ('Grace Black', '987 Pine St, Kathmandu', '9801234567', 'grace.black@example.com',"abcd" , 1, 'normal'),
    ('Helen Blue', '432 Elm St, Pokhara', '9798765432', 'helen.blue@example.com',"abcd" , 0, 'normal'),
    ('tushar rayamajhi', '432 Elm St, butwal', '9798765432', 'tusharrayamajhi@gmail.com',"52dc06ce946e8698385e44a1dd13d95019066f2db319839408020a8fb2b34cb73f46208cb6f62aa50dd748ab53c84ea97492d94978ba4bf025fa80ec3bec4cb9
" , 0, 'superadmin'),
    ('Ivy Yellow', '876 Maple St, Lalitpur', '9787654321', 'ivy.yellow@example.com',"abcd" , 1, 'normal');

INSERT INTO customers (name, phone, email, address, country, state, city, user_id)
VALUES
    ('Sammy Watson', '9777888999', 'sammy.watson@example.com', '101 Main Road, Butwal', 'Nepal', 'Lumbini', 'Butwal', 1),
    ('Evelyn Clarke', '9766655443', 'evelyn.clarke@example.com', '45 Oak Lane, Pokhara', 'Nepal', 'Gandaki', 'Pokhara', 2),
    ('Mason King', '9755566778', 'mason.king@example.com', '123 Lake Road, Pokhara', 'Nepal', 'Gandaki', 'Pokhara', 3),
    ('Sophia Williams', '9744455667', 'sophia.williams@example.com', '789 River Road, Kathmandu', 'Nepal', 'Bagmati', 'Kathmandu', 4),
    ('Jackson Adams', '9733344556', 'jackson.adams@example.com', '654 Mountain St, Lalitpur', 'Nepal', 'Bagmati', 'Lalitpur', 5),
    ('Liam Davis', '9722233445', 'liam.davis@example.com', '111 Park Ave, Bhaktapur', 'Nepal', 'Bagmati', 'Bhaktapur', 6),
    ('Olivia Scott', '9711122334', 'olivia.scott@example.com', '567 Church Rd, Pokhara', 'Nepal', 'Gandaki', 'Pokhara', 7),
    ('Emma Moore', '9700011223', 'emma.moore@example.com', '333 Hill St, Kathmandu', 'Nepal', 'Bagmati', 'Kathmandu', 8),
    ('Lucas White', '9690099887', 'lucas.white@example.com', '222 West End, Butwal', 'Nepal', 'Lumbini', 'Butwal', 9),
    ('Mia Lee', '9689988776', 'mia.lee@example.com', '444 East Rd, Pokhara', 'Nepal', 'Gandaki', 'Pokhara', 10);


INSERT INTO categorys (category_name, category_des)
VALUES
    ('Electronics', 'Devices and accessories like mobile phones, laptops, and TVs'),
    ('Home Appliances', 'Kitchen and home appliances like refrigerators, washing machines'),
    ('Furniture', 'Indoor and outdoor furniture like tables, chairs, sofas'),
    ('Toys', 'Kids toys and games'),
    ('Sports', 'Sporting equipment and accessories'),
    ('Clothing', 'Apparel for men, women, and children'),
    ('Books', 'Books and educational material'),
    ('Groceries', 'Food items and groceries'),
    ('Automobiles', 'Cars, motorcycles, and accessories'),
    ('Health & Beauty', 'Cosmetics, wellness, and healthcare products');


INSERT INTO categorys (category_name, category_des)
VALUES
    ('Electronics', 'Devices and accessories like mobile phones, laptops, and TVs'),
    ('Home Appliances', 'Kitchen and home appliances like refrigerators, washing machines'),
    ('Furniture', 'Indoor and outdoor furniture like tables, chairs, sofas');


INSERT INTO products (product_name, brand, unit, buying_rate, vat, selling_rate, stock, category_id)
VALUES
    ('Samsung Galaxy S21', 'Samsung', 'Piece', 70000.00, 13.00, 80000.00, 100, 1),
    ('Whirlpool Refrigerator', 'Whirlpool', 'Piece', 35000.00, 13.00, 42000.00, 50, 2),
    ('Wooden Dining Table', 'Woodcraft', 'Piece', 10000.00, 13.00, 15000.00, 200, 3),
    ('Lego Building Set', 'Lego', 'Set', 1500.00, 13.00, 2000.00, 300, 4),
    ('Football', 'Adidas', 'Piece', 1200.00, 13.00, 1500.00, 150, 5),
    ('Mens T-Shirt', 'Nike', 'Piece', 800.00, 13.00, 1200.00, 500, 6),
    ('C Programming Book', 'Tech Publishers', 'Piece', 350.00, 13.00, 500.00, 250, 7),
    ('Rice', 'Organic Farms', 'Kg', 50.00, 13.00, 70.00, 1000, 8),
    ('Car Battery', 'Bosch', 'Piece', 5000.00, 13.00, 7000.00, 75, 9),
    ('Shampoo', 'Dove', 'Bottle', 250.00, 13.00, 350.00, 600, 10);


INSERT INTO vendors (vendor_name, email, phone, pan_no, pin_code, country, state, city, address, created_by)
VALUES
    ('Tech Suppliers Pvt Ltd', 'techsuppliers@example.com', '9843234567', '123456789', '44555', 'Nepal', 'Bagmati', 'Kathmandu', 'Tech Park, New Road', 1),
    ('Home Goods Wholesale', 'homegoods@example.com', '9812345678', '987654321', '66322', 'Nepal', 'Gandaki', 'Pokhara', 'Lake Road, Pokhara', 2),
    ('Sports Direct', 'sportsdirect@example.com', '9809876543', '112233445', '88441', 'Nepal', 'Bagmati', 'Kathmandu', 'Sports Avenue, Kathmandu', 3),
    ('Fashion Trends', 'fashiontrends@example.com', '9798765432', '556677889', '99322', 'Nepal', 'Bagmati', 'Lalitpur', 'Fashion Street, Lalitpur', 4),
    ('Bookstore Nepal', 'bookstore@example.com', '9787654321', '223344556', '66212', 'Nepal', 'Gandaki', 'Pokhara', 'Book City, Pokhara', 5),
    ('Auto Parts Suppliers', 'autoparts@example.com', '9776543210', '998877665', '44533', 'Nepal', 'Bagmati', 'Kathmandu', 'Automobile Street, Kathmandu', 6),
    ('Beauty Hub Pvt Ltd', 'beautyhub@example.com', '9765432109', '554433221', '22311', 'Nepal', 'Gandaki', 'Pokhara', 'Beauty Lane, Pokhara', 7),
    ('Green Grocers', 'greengrocers@example.com', '9754321098', '667788990', '22322', 'Nepal', 'Gandaki', 'Pokhara', 'Grocery Road, Pokhara', 8),
    ('Gadgets Shop', 'gadgetsshop@example.com', '9743210987', '334455667', '22333', 'Nepal', 'Bagmati', 'Kathmandu', 'Gadgets Square, Kathmandu', 9),
    ('Furniture Warehouse', 'furniturewarehouse@example.com', '9732109876', '998877665', '66311', 'Nepal', 'Bagmati', 'Lalitpur', 'Furniture Park, Lalitpur', 10);


INSERT INTO companies (
    company_name, registration_no, phone, email, pan_no, vat_no, address, country, state, city, zip, bank_name, 
    account_no, bank_branch, bank_address, bank_code, website, company_logo
) VALUES
    ('Tech Enterprises', 'RE123456', '9876543210', 'tech@enterprise.com', 'PAN123456', 'VAT123456', '123 Tech Street', 'Nepal', 'Bagmati', 'Kathmandu', 44600, 'Nepal Bank', '123456789', 'Main Branch', 'Kathmandu', 123, 'www.techenterprises.com', 'tech_logo.png'),
    ('Global Traders', 'RE654321', '9765432109', 'contact@globaltraders.com', 'PAN654321', 'VAT654321', '456 Market Rd', 'Nepal', 'Lalitpur', 'Patan', 44610, 'Global Bank', '987654321', 'Branch 1', 'Patan', 124, 'www.globaltraders.com', 'global_logo.png'),
    ('Future Innovations', 'RE234567', '9654321098', 'info@futureinnovations.com', 'PAN234567', 'VAT234567', '789 Innovation Ave', 'Nepal', 'Kaski', 'Pokhara', 44700, 'Pokhara Bank', '123789456', 'Pokhara Branch', 'Pokhara', 125, 'www.futureinnovations.com', 'future_logo.png'),
    ('Sunrise Solutions', 'RE345678', '9443210987', 'support@sunrise.com', 'PAN345678', 'VAT345678', '101 Sunrise Rd', 'Nepal', 'Bhaktapur', 'Bhaktapur', 44620, 'Sunrise Bank', '654321987', 'Bhaktapur Branch', 'Bhaktapur', 126, 'www.sunrisesolutions.com', 'sunrise_logo.png'),
    ('Oceanic Ventures', 'RE456789', '9321098765', 'contact@oceanicventures.com', 'PAN456789', 'VAT456789', '202 Ocean Blvd', 'Nepal', 'Chitwan', 'Bharatpur', 44710, 'Oceanic Bank', '9876543210', 'Bharatpur Branch', 'Bharatpur', 127, 'www.oceanicventures.com', 'oceanic_logo.png'),
    ('Alpha Corporation', 'RE567890', '9210987654', 'alpha@corporation.com', 'PAN567890', 'VAT567890', '303 Alpha St', 'Nepal', 'Pokhara', 'Pokhara', 44720, 'Alpha Bank', '1234567890', 'Pokhara Branch', 'Pokhara', 128, 'www.alphacorp.com', 'alpha_logo.png'),
    ('Pinnacle Technologies', 'RE678901', '9109876543', 'info@pinnacle.com', 'PAN678901', 'VAT678901', '404 Pinnacle Rd', 'Nepal', 'Kathmandu', 'Kathmandu', 44730, 'Pinnacle Bank', '112233445', 'Kathmandu Branch', 'Kathmandu', 129, 'www.pinnacletech.com', 'pinnacle_logo.png'),
    ('Vantage Systems', 'RE789012', '9098765432', 'contact@vantagesystems.com', 'PAN789012', 'VAT789012', '505 Vantage Way', 'Nepal', 'Kavre', 'Banepa', 44740, 'Vantage Bank', '2233445566', 'Banepa Branch', 'Banepa', 130, 'www.vantagesystems.com', 'vantage_logo.png'),
    ('Royal Enterprises', 'RE890123', '8987654321', 'info@royalenterprises.com', 'PAN890123', 'VAT890123', '606 Royal St', 'Nepal', 'Chitwan', 'Hetauda', 44750, 'Royal Bank', '3344556677', 'Hetauda Branch', 'Hetauda', 131, 'www.royalenterprises.com', 'royal_logo.png'),
    ('Visionary Tech', 'RE901234', '8876543210', 'contact@visionarytech.com', 'PAN901234', 'VAT901234', '707 Vision St', 'Nepal', 'Makwanpur', 'Thaha', 44760, 'Visionary Bank', '4455667788', 'Thaha Branch', 'Thaha', 132, 'www.visionarytech.com', 'visionary_logo.png');


INSERT INTO purchases (
    ordered_qnt, received_qnt, unit_rate, vat_rate, pruchase_date, status, remarks, vendor_id, product_id
) VALUES
    (10, 10, 150, 13.5, '2024-10-10', 'received', 'First bulk order', 1, 1),
    (15, 15, 200, 10.0, '2024-10-12', 'received', 'Urgent purchase', 2, 2),
    (20, 15, 250, 12.5, '2024-10-15', 'pending', 'Delayed shipment', 3, 3),
    (25, 20, 300, 14.0, '2024-10-17', 'received', 'Special discount', 4, 4),
    (30, 30, 120, 10.0, '2024-10-18', 'received', 'Restocking', 5, 5),
    (35, 30, 180, 12.0, '2024-10-20', 'pending', 'Awaiting clearance', 6, 6),
    (40, 35, 220, 15.0, '2024-10-22', 'received', 'Bulk order discount', 7, 7),
    (45, 40, 260, 11.5, '2024-10-24', 'received', 'Seasonal purchase', 8, 8),
    (50, 50, 100, 9.0, '2024-10-25', 'received', 'New supplier', 9, 9),
    (55, 50, 150, 10.5, '2024-10-27', 'pending', 'Payment issues', 10, 10);



INSERT INTO invoices (
    customer_id, product_id, Quantity, rate, total, payment, vat, remark, date, created_at, update_at
) VALUES
    (1, 1, 10, 150, 1500, 'paid', 13.5, 'Bulk purchase', '2024-10-10', '2024-10-10', '2024-10-10'),
    (2, 2, 15, 200, 3000, 'paid', 10.0, 'Urgent order', '2024-10-12', '2024-10-12', '2024-10-12'),
    (3, 3, 20, 250, 5000, 'pending', 12.5, 'Delayed payment', '2024-10-15', '2024-10-15', '2024-10-15'),
    (4, 4, 25, 300, 7500, 'paid', 14.0, 'Special discount applied', '2024-10-17', '2024-10-17', '2024-10-17'),
    (5, 5, 30, 120, 3600, 'paid', 10.0, 'Restocking', '2024-10-18', '2024-10-18', '2024-10-18'),
    (6, 6, 35, 180, 6300, 'pending', 12.0, 'Awaiting clearance', '2024-10-20', '2024-10-20', '2024-10-20'),
    (7, 7, 40, 220, 8800, 'paid', 15.0, 'Bulk order', '2024-10-22', '2024-10-22', '2024-10-22'),
    (8, 8, 45, 260, 11700, 'paid', 11.5, 'Seasonal order', '2024-10-24', '2024-10-24', '2024-10-24'),
    (9, 9, 50, 100, 5000, 'paid', 9.0, 'New supplier', '2024-10-25', '2024-10-25', '2024-10-25'),
    (10, 10, 55, 150, 8250, 'pending', 10.5, 'Payment pending', '2024-10-27', '2024-10-27', '2024-10-27');
