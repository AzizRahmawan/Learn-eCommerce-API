import express, { query } from "express";
import product from "./product.json" assert {type: 'json'};
import dotenv from 'dotenv';
import app from './app.js';
dotenv.config();

const port = process.env.PORT || 3000;
const products = product;
const shopigCart = {
    cart: [],
    totalPrice: 0,
}

app.get('/products', (req, res) => {
    const query = req.query.search;
    if(query){
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes((query).toLowerCase()),
        );
        res.json(filtered);
        return;
    }
    res.json(products);
    return;
});
app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const productId = products.find(product=>product.id === id);
    res.json(productId);
});
app.get('/cart', (req, res) => {
    res.json(shopigCart);
});
app.post('/cart/:id', (req, res) => {
    const id = Number(req.params.id);
    const existProduct = shopigCart.cart.find(item=>item.id === id);
    const productId = products.find(product=>product.id === id);
    const updateTotalPrice = () => {
        const updateTotal = shopigCart.cart.reduce((price, product) => {
            return price + (product.quantity * product.price); 
        }, 0);
        shopigCart.totalPrice = updateTotal;
        return shopigCart;
    }
    if(!productId || productId.inStock === false){
        res.status(404).json({ message: "Produk Not Found or Stock 0" });
    } else {
        if(existProduct){
            existProduct.quantity += 1;
            updateTotalPrice();
            res.json(shopigCart);
        } else {   
            if(productId){
                const quantity = 1;
                shopigCart.cart.push({...productId, quantity });
                updateTotalPrice();
                res.json(shopigCart);
            } else {
                res.status(404).json({ message: "Product not found" });
            }
        }
    }
});
app.delete('/cart/:id', (req, res) => {
    const id = Number(req.params.id);
    const existProduct = shopigCart.cart.find(item=>item.id === id);
    if(existProduct){
        if(existProduct.quantity > 1){
            existProduct.quantity -= 1;
            res.json(cart);
        } else {   
            shopigCart.cart.splice(cart.findIndex((product)=>product.id === id),1);     
            res.json(shopigCart);
        }
    } else {
        res.status(404).json({ message: "Product not found!!" });
    }
});
app.post('/order', (req, res) => {
    const totalMoney = Number(req.body.money);
    const totalPrice = shopigCart.totalPrice;
    if (shopigCart.cart.length === 0) {
        res.status(404).json({ message: "Cart is Empty!!" });
    } else {
        if(totalPrice > totalMoney){
            res.json({message: "Money is not Enough!!"});
        } else{
            const totalChange = totalMoney - totalPrice;
            shopigCart.cart = [];
            res.json({message: "Order is Success!!", total_price: totalPrice, money:totalMoney, change:totalChange });
        }
    }
});
app.listen(port, () => {
    console.log(`Server Running on Port: ${port}`);
});
