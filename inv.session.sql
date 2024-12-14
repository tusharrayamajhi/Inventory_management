use inventory;
SELECT * from companies;
select vendors.vendor_name as vendor_name,products.product_name as product_name,purchases.pruchase_date as pruchase_date,purchases.unit_rate as buying_rate from purchases inner join vendors on vendors.vendor_id = purchases.vendor inner join products ON products.product_id = purchases.product where purchases.product = 1;