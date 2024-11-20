Drop Database inventory; 
CREATE DATABASE IF NOT EXISTS Inventory;
USE Inventory;
select * from purchases  inner join products on purchases.product = products.product_id inner join vendors on purchases.vendor = vendors.vendor_id where purchases.user = 1;


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
CREATE TABLE users (
		user_id INT NOT NULL PRIMARY KEY auto_increment,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(100),
        phone char(10),
        email VARCHAR(100) NOT NULL unique,
        password varchar(200) NOT NULL,
        is_active TINYINT(1) DEFAULT 0,
        roles enum("admin","normal","superadmin") ,
        company_id int default null,
        created_by int,
        created_at TimeStamp DEFAULT CURRENT_TIMESTAMP ,
        updated_at DateTime DEFAULT CURRENT_TIMESTAMP on update current_timestamp,
        foreign key(company_id) references companies(company_id),
        foreign key(created_by) references users(user_id)
	);
CREATE TABLE customers(
		customer_id INT NOT NULL PRIMARY KEY auto_increment,
		name VARCHAR(100) NOT NULL,
        phone char(10),
        email VARCHAR(100),
        address VARCHAR(100) Not null , 
		pan varchar(100),
        user_id int,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        foreign key(user_id) references users(user_id)
        );
        
Create Table categorys( 
			category_id int primary key auto_increment,
            category_name varchar(100) not null,
            category_des varchar(255),
            user int not null,
            foreign key(user) references users(user_id),
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp on update current_timestamp
);

create table brands(
			brand_id int primary key auto_increment,
            brand_name varchar(100) not null,
            brand_desc varchar(255),
            brand_img varchar(100),
            user int not null,
			created_at timestamp default current_timestamp,
			updated_at timestamp default current_timestamp on update current_timestamp,
            foreign key(user) references users(user_id)
            );
create table units(
			unit_id int primary key auto_increment,
			unit_name varchar(30) not null,
            short_name varchar(10) not null,
            user int not null,
			created_at timestamp default current_timestamp,
			updated_at timestamp default current_timestamp on update current_timestamp,
            foreign key(user) references users(user_id)
);
CREATE TABLE products(
		product_id int primary key auto_increment,
        product_name varchar(100) not null,
        brand int not null,
        unit int not null,
        vat tinyint(1) default 0 check (vat >= 0),
        selling_rate decimal(10,2) check (selling_rate >= 0),
        stock int unsigned default 0,
        category int not null,
        user int not null,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        foreign key(user) references users(user_id),
        foreign key(unit) references units(unit_id),
        foreign key(brand) references brands(brand_id),
        foreign key(category) references categorys(category_id)
        );

CREATE TABLE vendors(
		vendor_id int primary key auto_increment,
        vendor_name varchar(100) not null,
        email varchar(50),
        phone char(10) not null,
        pan_no varchar(30),
        country varchar(50) not null,
        state varchar(50),
        address varchar(100) not null,
        user int not null,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp on update current_timestamp,
        foreign key(user) references users(user_id)
        );
drop table purchases;
CREATE TABLE purchases(
		purchase_id int primary key auto_increment,
        purchase_code varchar(100),
        ordered_qnt int unsigned,
        received_qnt int unsigned,
        unit_rate int unsigned,
        vat_rate int,
        balance int,
        total decimal(30,5),
        pruchase_date timestamp default current_timestamp,
        status enum("pending","received","partial received") default "received",
        remarks text,
        vendor int not null,
        product int not null,
        user int not null,
        foreign key(user) references users(user_id),
        foreign key(vendor) references users(user_id),
        foreign key(product) references products(product_id)
    );
    select * from purchases;
    
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
    ('John Doe', '123 Main St, Butwal', '9876543210', 'john.doe@example.com', "52dc06ce946e8698385e44a1dd13d95019066f2db319839408020a8fb2b34cb73f46208cb6f62aa50dd748ab53c84ea97492d94978ba4bf025fa80ec3bec4cb9" , 1, 'admin'),
    ('Alice Smith', '456 Oak St, Pokhara', '9867345678', 'alice.smith@example.com',"52dc06ce946e8698385e44a1dd13d95019066f2db319839408020a8fb2b34cb73f46208cb6f62aa50dd748ab53c84ea97492d94978ba4bf025fa80ec3bec4cb9" , 1, 'normal'),
    ('Bob Johnson', '789 Pine St, Kathmandu', '9856345678', 'bob.johnson@example.com',"52dc06ce946e8698385e44a1dd13d95019066f2db319839408020a8fb2b34cb73f46208cb6f62aa50dd748ab53c84ea97492d94978ba4bf025fa80ec3bec4cb9" , 0,"normal"),
    ('Charlie Brown', '321 Maple St, Lalitpur', '9845678901', 'charlie.brown@example.com',"abcd" , 1, 'normal'),
    ('David Lee', '123 Birch St, Bhaktapur', '9834567890', 'david.lee@example.com',"abcd" , 1, 'normal'),
    ('Emma Green', '654 Cedar St, Pokhara', '9823456789', 'emma.green@example.com',"abcd" , 1, 'normal'),
    ('Frank White', '789 Oak St, Butwal', '9812345678', 'frank.white@example.com',"abcd" , 0, 'normal'),
    ('Grace Black', '987 Pine St, Kathmandu', '9801234567', 'grace.black@example.com',"abcd" , 1, 'normal'),
    ('Helen Blue', '432 Elm St, Pokhara', '9798765432', 'helen.blue@example.com',"abcd" , 0, 'normal'),
    ('tushar rayamajhi', '432 Elm St, butwal', '9798765432', 'tusharrayamajhi@gmail.com',"52dc06ce946e8698385e44a1dd13d95019066f2db319839408020a8fb2b34cb73f46208cb6f62aa50dd748ab53c84ea97492d94978ba4bf025fa80ec3bec4cb9" , 1, 'superadmin'),
    ('Ivy Yellow', '876 Maple St, Lalitpur', '9787654321', 'ivy.yellow@exampe.com',"abcd" , 1, 'normal');

INSERT INTO customers (name, phone, email, address, pan , user_id)
VALUES
    ('Sammy Watson', '9777888999', 'sammy.watson@example.com','butwal', '1234123412', 1),
    ('Evelyn Clarke', '9766655443', 'evelyn.clarke@example.com', 'kathmandu','3345234523453', 2),
    ('Mason King', '9755566778', 'mason.king@example.com', 'pokhara','1234123424', 3),
    ('Sophia Williams', '9744455667', 'sophia.williams@example.com','lalitpur', '53434534534', 4),
    ('Jackson Adams', '9733344556', 'jackson.adams@example.com','bhaktapur','42334535354', 5),
    ('Liam Davis', '9722233445', 'liam.davis@example.com', 'palpa','34534523453', 6),
    ('Olivia Scott', '9711122334', 'olivia.scott@example.com', 'gulmi','2345345345345', 7),
    ('Emma Moore', '9700011223', 'emma.moore@example.com', 'chitwal','234534534535', 8),
    ('Lucas White', '9690099887', 'lucas.white@example.com','ilam','23435345345345', 9),
    ('Mia Lee', '9689988776', 'mia.lee@example.com','jhapa', '23532453453454', 10);


INSERT INTO categorys (category_name, category_des,user)
VALUES
    ('Electronics', 'Devices and accessories like mobile phones, laptops, and TVs',1),
    ('Home Appliances', 'Kitchen and home appliances like refrigerators, washing machines',2),
    ('Furniture', 'Indoor and outdoor furniture like tables, chairs, sofas',2),
    ('Toys', 'Kids toys and games',1),
    ('Sports', 'Sporting equipment and accessories',2),
    ('Clothing', 'Apparel for men, women, and children',1),
    ('Books', 'Books and educational material',2),
    ('Groceries', 'Food items and groceries',1),
    ('Automobiles', 'Cars, motorcycles, and accessories',2),
    ('Health & Beauty', 'Cosmetics, wellness, and healthcare products',1);

-- Insert into brands
INSERT INTO brands (brand_name, brand_desc, brand_img,user) VALUES 
("Apple", "This is Apple brand", "image_url_apple",1),
("Samsung", "This is Samsung brand", "image_url_samsung",2),
("Sony", "This is Sony brand", "image_url_sony",9),
("Dell", "This is Dell brand", "image_url_dell",2),
("HP", "This is HP brand", "image_url_hp",2); 

-- Insert into units
INSERT INTO units (unit_name, short_name,user) VALUES
("Kilogram", "kg",1),
("Gram", "g",2),
("Meter", "m",9),
("Liter", "l",2),
("Piece", "pcs",2);

select * from products;
-- INSERT INTO products (product_name, brand, unit, vat, selling_rate, stock, category,user)
-- VALUES
--     ('Samsung Galaxy S21', 1, 1, 1, 80000.00, 100, 1,1),
--     ('Whirlpool Refrigerator', 1, 2, 1, 42000.00, 50, 2,1),
--     ('Wooden Dining Table', 2, 3, 1, 15000.00, 200, 3,1),
--     ('Lego Building Set', 4, 4, 1, 2000.00, 300, 4,1),
--     ('Football', 3, 1, 1, 1500.00, 150, 5,1),
--     ('Mens T-Shirt', 2, 3, 1, 1200.00, 500, 6,1),
--     ('C Programming Book', 1, 4, 1, 500.00, 250, 7,1),
--     ('Rice', 2, 1, 0, 70.00, 1000, 8,1),
--     ('Car Battery', 3, 2, 1, 7000.00, 75, 9,1),
--     ('Shampoo', 1, 3, 1, 350.00, 600, 10,1);




-- INSERT INTO vendors (vendor_name, email, phone, pan_no, pin_code, country, state, city, address, created_by)
-- VALUES
--     ('Tech Suppliers Pvt Ltd', 'techsuppliers@example.com', '9843234567', '123456789', '44555', 'Nepal', 'Bagmati', 'Kathmandu', 'Tech Park, New Road', 1),
--     ('Home Goods Wholesale', 'homegoods@example.com', '9812345678', '987654321', '66322', 'Nepal', 'Gandaki', 'Pokhara', 'Lake Road, Pokhara', 2),
--     ('Sports Direct', 'sportsdirect@example.com', '9809876543', '112233445', '88441', 'Nepal', 'Bagmati', 'Kathmandu', 'Sports Avenue, Kathmandu', 3),
--     ('Fashion Trends', 'fashiontrends@example.com', '9798765432', '556677889', '99322', 'Nepal', 'Bagmati', 'Lalitpur', 'Fashion Street, Lalitpur', 4),
--     ('Bookstore Nepal', 'bookstore@example.com', '9787654321', '223344556', '66212', 'Nepal', 'Gandaki', 'Pokhara', 'Book City, Pokhara', 5),
--     ('Auto Parts Suppliers', 'autoparts@example.com', '9776543210', '998877665', '44533', 'Nepal', 'Bagmati', 'Kathmandu', 'Automobile Street, Kathmandu', 6),
--     ('Beauty Hub Pvt Ltd', 'beautyhub@example.com', '9765432109', '554433221', '22311', 'Nepal', 'Gandaki', 'Pokhara', 'Beauty Lane, Pokhara', 7),
--     ('Green Grocers', 'greengrocers@example.com', '9754321098', '667788990', '22322', 'Nepal', 'Gandaki', 'Pokhara', 'Grocery Road, Pokhara', 8),
--     ('Gadgets Shop', 'gadgetsshop@example.com', '9743210987', '334455667', '22333', 'Nepal', 'Bagmati', 'Kathmandu', 'Gadgets Square, Kathmandu', 9),
--     ('Furniture Warehouse', 'furniturewarehouse@example.com', '9732109876', '998877665', '66311', 'Nepal', 'Bagmati', 'Lalitpur', 'Furniture Park, Lalitpur', 10);


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


-- INSERT INTO purchases (
--     ordered_qnt, received_qnt, unit_rate, vat_rate, pruchase_date, status, remarks, vendor, product
-- ) VALUES
--     (10, 10, 150, 13.5, '2024-10-10', 'received', 'First bulk order', 1, 1),
--     (15, 15, 200, 10.0, '2024-10-12', 'received', 'Urgent purchase', 2, 2),
--     (20, 15, 250, 12.5, '2024-10-15', 'pending', 'Delayed shipment', 3, 3),
--     (25, 20, 300, 14.0, '2024-10-17', 'received', 'Special discount', 4, 4),
--     (30, 30, 120, 10.0, '2024-10-18', 'received', 'Restocking', 5, 5),
--     (35, 30, 180, 12.0, '2024-10-20', 'pending', 'Awaiting clearance', 6, 6),
--     (40, 35, 220, 15.0, '2024-10-22', 'received', 'Bulk order discount', 7, 7),
--     (45, 40, 260, 11.5, '2024-10-24', 'received', 'Seasonal purchase', 8, 8),
--     (50, 50, 100, 9.0, '2024-10-25', 'received', 'New supplier', 9, 9),
--     (55, 50, 150, 10.5, '2024-10-27', 'pending', 'Payment issues', 10, 10);



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
    

