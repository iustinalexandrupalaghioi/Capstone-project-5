import express from "express";
import pg from "pg";
import axios from "axios";
import bodyParser from "body-parser";

const db = new pg.Client({
    host: "localhost",
    user:"postgres",
    database: "books",
    password: "postgres",
    port: 5432,
});

db.connect();

const app = express();
const port = 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", async (req, res) => {
    try{
        const response = await db.query("SELECT * FROM book");
        const result = response.rows;
        let books = [];
        result.forEach(book => {
            const isbn = book.isbn.toString();
            books.push({
                id: book.id,
                title: book.title,
                author: book.author,
                date: book.date_of_read,
                rating: book.rating,
                isbn: isbn,
            });
        })
        res.render("index.ejs", {books: books});
    } catch(err){
        console.error(err.message);
    }
})

app.get("/new", (req, res) => {
    res.render("new.ejs");
})

app.post("/add", async (req, res) => {
    const title = req.body["title"];
    const author = req.body["author"];
    const rating = req.body["rating"];
    const date = req.body["date"];
    try{
        const response = await axios.get("http://openlibrary.org/search.json",{
            params: {
                title: title,
                author: author
            }
        });
        const result = response.data;
        try{
            await db.query("INSERT INTO book (title, author, rating, date_of_read, isbn)  VALUES ($1,$2,$3,$4,$5)",
                [result.docs[0].title, result.docs[0].author_name[0],rating, date, result.docs[0].isbn[0]]
            );
            res.redirect("/");
        } catch(err){
            console.error(err.message);
        }
    } catch(err){
        console.error(err.message);
    }
    
});

app.get("/title", async (req, res) => {
    try{
        const response = await db.query("SELECT * FROM book ORDER BY title ASC");
        const result = response.rows;
        let books = [];
        result.forEach(book => {
            const isbn = book.isbn.toString();
            books.push({
                id: book.id,
                title: book.title,
                author: book.author,
                date: book.date_of_read,
                rating: book.rating,
                isbn: isbn,
            });
        });
        res.render("index.ejs", {books: books});
    } catch (err){
        console.error(err.message);
    }
});

app.get("/rating", async (req, res) => {
    try{
        const response = await db.query("SELECT * FROM book ORDER BY rating DESC");
        const result = response.rows;
        let books = [];
        result.forEach(book => {
            const isbn = book.isbn.toString();
            books.push({
                id: book.id,
                title: book.title,
                author: book.author,
                date: book.date_of_read,
                rating: book.rating,
                isbn: isbn,
            });
        });
        res.render("index.ejs", {books: books});
    } catch (err){
        console.error(err.message);
    }
});

app.get("/date", async (req, res) => {
    try{
        const response = await db.query("SELECT * FROM book ORDER BY date_of_read DESC");
        const result = response.rows;
        let books = [];
        result.forEach(book => {
            const isbn = book.isbn.toString();
            books.push({
                id: book.id,
                title: book.title,
                author: book.author,
                date: book.date_of_read,
                rating: book.rating,
                isbn: isbn,
            });
        });
        res.render("index.ejs", {books: books});
    } catch (err){
        console.error(err.message);
    }
})

app.post("/delete", async (req, res) => {
    try{
        await db.query("DELETE FROM book WHERE id = $1 ", [req.body["id"]]);
        res.redirect("/");
    } catch(err){
        console.error(err.message);
    }
})

app.listen(port, (req, res) => {
    console.log(`Server started at port ${port}`);
})