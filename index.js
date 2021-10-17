const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
const { Client } = require('pg');
const { RowDescriptionMessage } = require("pg-protocol/dist/messages");


const client = new Client({
	host: "localhost",
	user: "postgres",
	port: 5432,
	password: "postgres",
	database: "postgres"
})
client.connect();

app.use(bodyParser.json());

app.get('/', (req, res) => {
	client.query(`Select * from users`, (err, result) => {
		if (!err) {
			res.json(result.rows);
		} else {
			res.send(err);
		}
	});
	client.end;
})

app.get("/recive", async (req, res) => {
	try {
		const response = await axios({
			url: "https://api.wazirx.com/api/v2/tickers",
			method: "get",
		});
		let count = 0;
		for (let i in response.data) {
			if (count < 10) {
				let b = response.data[i];
				const user = {
					name: b.name,
					last: b.last,
					buy: b.buy,
					sell: b.sell,
					volume: b.volume,
					base_unit: b.base_unit
				}
				let insertQuery = `insert into users(name, last, buy, sell, volume, base_unit) values('${user.name}', ${user.last}, ${user.buy}, ${user.sell}, ${user.volume}, '${user.base_unit}')`
				client.query(insertQuery, (err, result) => {
					if (!err) {
						console.log('Insertion was successful')
					}
					else { console.log(err.message) }
				})
				count++;
				client.end;
			}
		}

	} catch (err) {
		res.status(500).json(err);
	}
});

app.listen(8800, () => {
	console.log("Server started at port 8800");
});
