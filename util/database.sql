

create database inventory;
use inventory;

CREATE TABLE companies(
		company_id int primary key auto_increment,
        company_name varchar(100) not null,
         company_code varchar(50) not null unique;
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
        user_image varchar(200) default null,
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
        remaining int default 0,
        vendor int not null,
        product int not null,
        user int not null,
        foreign key(user) references users(user_id),
        foreign key(vendor) references users(user_id),
        foreign key(product) references products(product_id)
    );
   
CREATE TABLE invoices(
		invoices_id int primary key auto_increment,
        sells_code varchar(100),
        customer_id int,
        product_id int,
        Quantity int unsigned,
        rate int unsigned,
        total decimal(10,2),
        payment varchar(100),
        vat tinyint(0) default 1,
        remark varchar(200),
        user int not null,
        sales_date timestamp default current_timestamp,
        created_at date default null,
        update_at timestamp default current_timestamp on update current_timestamp,
        foreign key(customer_id) references customers(customer_id),
        foreign key(product_id) references products(product_id),
        foreign key(user) references users(user_id)
);
  insert into companies (company_name , company_code,registration_no ,phone ,email ,pan_vat_no ,isvat ,address ,country ,state,city ,zip )
		values   		("stock hub","StHUB","123423432423","9876543210","stockhub@gmail.com","987654321",1,"butwal","nepal","lumbini","butwal","3390");

INSERT INTO users (name, address, phone, email, password, is_active, roles,company_id)
VALUES ('tushar rayamajhi', '432 Elm St, butwal', '9798765432', 'tusharrayamajhi@gmail.com',"52dc06ce946e8698385e44a1dd13d95019066f2db319839408020a8fb2b34cb73f46208cb6f62aa50dd748ab53c84ea97492d94978ba4bf025fa80ec3bec4cb9" , 1, 'superadmin',1);
