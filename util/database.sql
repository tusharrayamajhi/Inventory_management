Drop Database inventory; 
CREATE DATABASE IF NOT EXISTS Inventory;
USE Inventory;



CREATE TABLE companies(
		company_id int primary key auto_increment,
        company_name varchar(100) not null,
        registration_no varchar(100) not null,
        phone char(10) not null,
        email varchar(100) not null,
        DOJ timestamp not null default current_timestamp,
        pan_vat_no varchar(100) not null unique,
        isvat tinyint(1) default 0 not null,
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
        select * from companies;
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
        remaining int default (received_qnt),
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
    

