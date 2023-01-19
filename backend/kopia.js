const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const https = require("https");
const Axios = require("axios");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const app = express();
const port = 3003;
require('dotenv').config();
const KLUCZ_H = process.env.KLUCZ_H;

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if(file.fieldname === 'awatarImg'){
			cb(null, 'awatary/');
		} else {
			cb(null, 'trasy/');
		}
	},
	filename: (req, file, cb) => {
		if(file.fieldname === 'awatarImg'){
			cb(null, req.params.login + '-' + Date.now() + path.extname(file.originalname));
		} else {
			cb(null, 'zdjTrasy-' + Date.now() + path.extname(file.originalname));
		}
	}
});
const upload = multer({storage: storage});
app.use(express.json());
app.use(cors());

const db = mysql.createPool({
	user: 'rafal',
	host: "localhost",
	password: process.env.DB_PASS,
	database: "awis_test",
	port: 3306,
	multipleStatements: true,
	dateStrings: true
});

app.get("/wersjeGry", (req, res) => {
	Axios.get("https://api.truckersmp.com/v2/version").then((resp) => {
		res.send({
			'resp': 1,
			'tmp': resp.data['name'] + ' ' + resp.data['stage'],
			'ets': resp.data['supported_game_version'],
			'ats': resp.data['supported_ats_game_version']
		});
	}).catch((err) => {
		res.send({blad: 'Nieudane'});
	});
});

//sprawdzenie sesji
app.get("/typkonta/:token", (req, res) => {
	const token = req.params.token;
	if(token.length == 40){
		db.query("SELECT `konta`.`typkonta`, `typkonta`.`nazwa`, `konta`.`login` FROM `konta`, `typkonta` WHERE `token` = ? AND `typkonta`.`id` = `konta`.`typkonta`", [token],
		(err, result) => {
			if(result.length > 0){
				res.send({typkonta: result[0]['typkonta'], ranga: result[0]['nazwa'], login: result[0]['login']});
			} else {
				res.send({blad: "Nie ma takiego tokenu"});
			}
		});
	}
});

app.post("/profilDane/:login", (req, res) => {
	const login = req.params.login;
	console.log("");
	console.log(new Date().toISOString(), "Odwiedziny na profilu:", login);
	db.query("SELECT * FROM `konta`, `typkonta` WHERE `login` = ? AND `typkonta`.`id` = `konta`.`typkonta`", [login],
	(err, result) => {
		if(result.length > 0){
			res.send({
				login: result[0]['login'],
				typkonta: result[0]['typkonta'],
				datadolaczenia: result[0]['kiedydolaczyl'],
				awatar: result[0]['awatar'],
				stawka: result[0]['stawka'],
				garaz: result[0]['garaz'],
				truck: result[0]['truck'],
				discord: result[0]['discord'],
				steam: result[0]['steam'],
				truckbook: result[0]['truckbook'],
				truckersmp: result[0]['truckersmp'],
				ranga: result[0]['nazwa']
		});
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	});
});

app.post("/profilDaneId/:id", (req, res) => {
	const id = req.params.id;
	db.query("SELECT * FROM `konta`, `typkonta` WHERE `konta`.`id` = ? AND `typkonta`.`id` = `konta`.`typkonta`", [id],
	(err, result) => {
		if(result.length > 0){
			res.send({
				login: result[0]['login'],
				typkonta: result[0]['typkonta'],
				datadolaczenia: result[0]['kiedydolaczyl'],
				awatar: result[0]['awatar'],
				stawka: result[0]['stawka'],
				garaz: result[0]['garaz'],
				truck: result[0]['truck'],
				discord: result[0]['discord'],
				steam: result[0]['steam'],
				truckbook: result[0]['truckbook'],
				truckersmp: result[0]['truckersmp'],
				ranga: result[0]['nazwa']
		});
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	});
});
app.post("/listaUzytkownikow/", (req, res) => {
	db.query("SELECT `konta`.`id` as 'kontoid', `konta`.`login`, `konta`.`typkonta`, `konta`.`kiedydolaczyl`, `konta`.`awatar`, `konta`.`stawka`, `konta`.`garaz`, `konta`.`truck`, `konta`.`discord`, `konta`.`steam`, `konta`.`truckersmp`, `konta`.`truckbook`, `typkonta`.`nazwa` FROM `konta`, `typkonta` WHERE `typkonta`.`id` = `konta`.`typkonta`",
	(err, result) => {
		if(err) console.log(err);
		if(result.length > 0){
			let lista = [];
			result.map((w) => {
				lista.push({
					id: w.kontoid,
					login: w.login,
					typkonta: w.typkonta,
					datadolaczenia: w.kiedydolaczyl,
					awatar: w.awatar,
					stawka: w.stawka,
					garaz: w.garaz,
					truck: w.truck,
					discord: w.discord,
					steam: w.steam,
					truckbook: w.truckbook,
					truckersmp: w.truckersmp,
					ranga: w.nazwa
				});
			});
			res.send(lista);
		} else {
			res.send({blad: "Nie ma takiego tokenu"});
		}
	});
});

//logowanie
app.post("/login", (req, res) => {
	const user = req.body.username;
	const saltToken = user + Date.now().toString();
	const password = req.body.password;
	const haslo = CryptoJS.HmacSHA1(password, KLUCZ_H).toString();
	db.query(
		"SELECT `login`,`awatar`,`typkonta` FROM `konta` WHERE `login` = ? AND `haslo` = ?",
		[user, haslo],
		(err, result) => {
			if(result.length > 0){
				console.log("");
				console.log(new Date().toISOString(), "Udana próba logowania na konto:", user);
				const tokenik = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
				db.query(
					"UPDATE `konta` SET `token` = ? WHERE `login` = ?",
					[tokenik, user]
				);
				res.send({
					login: user,
					awatar: result[0]['awatar'],
					token: tokenik
				});
				console.log(tokenik);
			} else {
				console.log("Nieudana próba logowania na konto: ", user);
				res.send({blad: "ZLE DANE KURWO"});
			}
		}
	);
});

//etap 1 resetowania hasla
app.post("/reset", (req, res) => {
	const user = req.body.username;
	const saltToken = user + Date.now().toString() + "reset";
	const kodzwrotny = CryptoJS.HmacSHA1(saltToken, KLUCZ_H).toString();
	console.log("");
	console.log(new Date().toISOString(), "Uzytkownik ", user, " resetuje haslo, jego kodzwrotny: ", kodzwrotny);
	db.query(
		"UPDATE `konta` SET `reset` = ? WHERE `login` = ?",
		[kodzwrotny, user], (err, result) => {
			if(err){console.error(err)}
			if(result.affectedRows > 0){
				res.send({odp: "GITES"});
			} else {
				res.send({blad: "Nie ma takiego gagatka :D"});
			}
		}
	);
});

//etap 2 resetowanie hasla
app.post("/resetcheck", (req, res) => {
	const zwrotny = req.body.kodzik;
	console.log("");
	console.log(new Date().toISOString(), "Sprawdzanie czy kod zwrotny ", zwrotny, " jest git");
	db.query(
		"SELECT COUNT(*) FROM `konta` WHERE `reset` = ?",
		[zwrotny], (err, result) => {
			if(result.length > 0){
				res.send({odp: "GITES"});
			} else {
				res.send({blad: "Zly kod"});
			}
		}
	);
});

//etap 3 resetowanie hasla
app.post("/resetfinal", (req, res) => {
	const zwrotny = req.body.kodzwrotny;
	console.log("");
	console.log(new Date().toISOString(), "Przywrocono haslo dla osoby o kluczu ", zwrotny);
	const szyfrHaslo = CryptoJS.HmacSHA1(req.body.haslo, KLUCZ_H).toString();
	db.query(
		"UPDATE `konta` SET `haslo` = ?, `reset` = '' WHERE `reset` = ?",
		[szyfrHaslo, zwrotny], (err, result) => {
			if(result.affectedRows > 0){
				res.send({odp: "Zresetowano"});
			} else {
				res.send({blad: "CHUJ"});
			}
		}
	);
});

//navbar licznik
app.get("/sprawdztrasy", (req, res) => {
	db.query("SELECT COUNT(`id`) as 't' FROM `trasy` WHERE `zatwierdz` = 0", (err, result) => {
		if(result.length > 0){
			res.send({ilosc: result[0]['t']});
		} else {
			res.send({ilosc: 0});
		}
	});
});

//navbar licznik
app.get("/sprawdzpodwyzki", (req, res) => {
	db.query("SELECT COUNT(`id`) as 't' FROM `podwyzka` WHERE `ktorozpatrzyl` = 0 AND `wniosek` IS NULL AND `wniosektxt` IS NULL", (err, result) => {
		if(result.length > 0){
			res.send({ilosc: result[0]['t']});
		} else {
			res.send({ilosc: 0});
		}
	});
});

//wlasne statystyki na glowna
app.post("/mainOwnStats/:token", (req, res) => {
	const token = req.params.token;
	const currentMonth = new Date().toISOString().split('T')[0].slice(0,-2) + "%";
	if(token.length == 40){
		db.query("SELECT COUNT(`trasy`.`id`) as 'ile', SUM(`trasy`.`przejechane`) as 'km', SUM(`trasy`.`masaladunku`) as 'tony', SUM(`trasy`.`spalanie`) as 'spalanie' FROM `trasy`,`konta` WHERE `trasy`.`kto` = `konta`.`id` AND `konta`.`token` = ? AND `trasy`.`kiedy` LIKE ? AND `trasy`.`zatwierdz` = 1", [token, currentMonth],
		(err, result) => {
			if(result.length > 0){
				res.send({
					ladunkow: result[0]['ile'],
					tony: result[0]['tony'],
					przejechanekm: result[0]['km'],
					spalanie: result[0]['spalanie'] * 100 / result[0]['km'],
					response: 1
				});
			} else {
				res.send({blad: "Nie ma takiego tokenu"});
			}
		});
	}
});

//globalne statystyki na glowna
app.post("/mainGlobalStats", (req, res) => {
	db.query("SELECT COUNT(`trasy`.`id`) as 'ile', SUM(`trasy`.`przejechane`) as 'km', SUM(`trasy`.`spalanie`) as 'spalanie' FROM `trasy` WHERE `trasy`.`zatwierdz` = 1",
	(err, result) => {
		if(result.length > 0){
			db.query("SELECT COUNT(`konta`.`id`) as 'pracownikow' FROM `konta`", (err, result2) => {
				if(result2.length > 0){
					res.send({
						ladunkow: result[0]['ile'],
						pracownikow: result2[0]['pracownikow'],
						przejechanekm: result[0]['km'],
						spalanie: result[0]['spalanie'] * 100 / result[0]['km'],
						response: 1
					});
				}
			});
		}
	});
});

app.post("/stankonta/:login/wlasnyzarobek", (req, res) =>{
	const login = req.params.login;
	db.query("SELECT SUM(`wlasnyzarobek`) as 'w' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['w']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/kary", (req, res) =>{
	const login = req.params.login;
	db.query("SELECT SUM(`kara`) as 'k' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['k']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/upr", (req, res) =>{
	const login = req.params.login;
	db.query("SELECT SUM(`cena`) as 'u' FROM `uprawnienia` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['u']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/gesty", (req, res) =>{
	const login = req.params.login;
	db.query("SELECT SUM(`kwota`) as 'k' FROM `dodawaniekwoty` WHERE `komu` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['k']});
		} else {
			res.send({odp: 0});
		}
	});
});
app.post("/stankonta/:login/winiety", (req, res) =>{
	const login = req.params.login;
	db.query("SELECT SUM(`zaile`) as 'z' FROM `kupionewiniety` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?)", [login], (err, result) => {
		if(result.length > 0){
			res.send({odp: result[0]['z']});
		} else {
			res.send({odp: 0});
		}
	});
});

//glowna - info oraz limit_km
app.post("/glownaInfo", (req, res) => {
	db.query("SELECT * FROM `ustawienia` WHERE `nazwa` = 'limit_km' OR `nazwa` = 'informacja'", (err, result) => {
		if(result.length > 0){
			const odp = {};
			result.forEach((element) => {
				if(element['nazwa'] == "informacja"){
					odp.msg = element['wartosc'];
				}
				if(element['nazwa'] == "limit_km"){
					odp.limitkm = element['wartosc'];
				}
			});
			res.send({response: 1, limitkm: odp.limitkm, msg: odp.msg});
		}
	});
});

app.post("/ranking/:miesiac", (req, res) => {
	const miesiac = req.params.miesiac + "-%";
	console.log("");
	console.log(new Date().toISOString(), "Sprawdzanie rankingu dla: ", miesiac);
	db.query("SELECT COUNT(`trasy`.`id`) as 'tras', SUM(`trasy`.`przejechane`) as 'przejechane', SUM(`trasy`.`masaladunku`) as 'tonaz', SUM(`trasy`.`zarobek`) as 'zarobek', SUM(`trasy`.`wlasnyzarobek`) as 'wlasnyzarobek', SUM(`trasy`.`spalanie`) as 'spalanie', `konta`.`login` as 'login', `konta`.`awatar` as 'awatar', `trasy`.`kto` as 'id' FROM `trasy`, `konta` WHERE `trasy`.`kto` = `konta`.`id` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto`", [miesiac], (err, result) => {
		if(result.length > 0){
			let dane = [];
			result.forEach((rekord) => {
				if(rekord.login){
					let tmpDane = {
						id: rekord.id,
						login: rekord.login,
						awatar: rekord.awatar,
						tras: rekord.tras,
						przejechane: rekord.przejechane,
						tonaz: rekord.tonaz,
						spalanie: rekord.spalanie * 100 / rekord.przejechane,
						zarobek: rekord.zarobek,
						wlasnyzarobek: rekord.wlasnyzarobek
					};
					dane.push(tmpDane);
				}
			});
			res.send({dane: dane});
		} else {
			res.send({blad: 'Brak danych!'});
		}
	});
});

//top 3 poprzedniego miesiaca
app.post("/lastMonthTop3", (req, res) => {
	const lastMonthObj = new Date();
	lastMonthObj.setMonth(lastMonthObj.getMonth() - 1);
	const lastMonth = lastMonthObj.toISOString().split('T')[0].slice(0,-2) + "%";
	db.query("SELECT SUM(`trasy`.`przejechane`) as 'km', `konta`.`login` as 'login' FROM `trasy`,`konta` WHERE `konta`.`id` = `trasy`.`kto` AND `trasy`.`zatwierdz` = 1 AND `trasy`.`kiedy` LIKE ? GROUP BY `trasy`.`kto` ORDER BY SUM(`trasy`.`przejechane`) DESC LIMIT 3", [lastMonth], (err, result) => {
		if(result.length > 0){
			if(result.length == 1)
				res.send({response: 1, top1: result[0]['login']});
			if(result.length == 2)
				res.send({response: 1, top1: result[0]['login'], top2: result[1]['login']});
			if(result.length == 3)
				res.send({response: 1, top1: result[0]['login'], top2: result[1]['login'], top3: result[2]['login']});
		} else {
			res.send({response: 1});
		}
	});
});

app.post("/ostatnie10tras/:login/dystanskm", (req,res) => {
	const login = req.params.login;
	console.log("Sprawdzanie dytansu km ostatnich 10 tras dla: ", login);
	db.query("SELECT `id`,`przejechane` FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [login], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push({x: trasa.id, y: trasa.przejechane});
			});
			res.send({dane: tmp.reverse()});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/ostatnie10tras/:login/spalanie", (req,res) => {
	const login = req.params.login;
	console.log("Sprawdzanie spalania ostatnich 10 tras dla: ", login);
	db.query("SELECT `id`, (`spalanie`*100/`przejechane`) as 'sp' FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [login], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push({x: trasa.id, y: trasa.sp});
			});
			res.send({dane: tmp.reverse()});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/ostatnie10tras/:login/zarobki", (req,res) => {
	const login = req.params.login;
	console.log("Sprawdzanie zarobkow ostatnich 10 tras dla: ", login);
	db.query("SELECT `id`,`zarobek` FROM `trasy` WHERE `zatwierdz` = 1 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `id` DESC LIMIT 10", [login], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push({x: trasa.id, y: trasa.zarobek});
			});
			res.send({dane: tmp.reverse()});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/komentarze/:login", (req, res) => {
	const login = req.params.login;
	console.log("");
	console.log(new Date().toISOString(), "Sprawdzanie komentarzy dla: ", login);
	if(!login){
		res.send({blad: 'Nie podano uzytkownika'});
	} else {
		db.query("SELECT `notatkiprofilowe`.`id` as 'idnotatki', `konta`.`login` as 'ktonapisal', `notatkiprofilowe`.`data` as 'kiedy', `notatkiprofilowe`.`tekst` as 'tresc' FROM `notatkiprofilowe`,`konta` WHERE `notatkiprofilowe`.`kto` = `konta`.`id` AND `notatkiprofilowe`.`komu` = (SELECT `konta`.`id` FROM `konta` WHERE `konta`.`login` = ?) GROUP BY `notatkiprofilowe`.`id` ORDER BY `notatkiprofilowe`.`id` DESC", [login], (er, result) => {
			if(result.length > 0){
				let tmp = [];
				result.forEach((rekord) => {
					tmp.push({idnotatki: rekord.idnotatki, kto: rekord.ktonapisal, kiedy: rekord.kiedy, tresc: rekord.tresc})
				});
				res.send({response: 1, dane: tmp});
			} else {
				res.send({response: 1});
			}
		});
	}
})
app.post("/dodajKomentarz/:komu/:kto/:token", (req, res) => {
	const komu = req.params.komu;
	const kto = req.params.kto;
	const tokenKto = req.params.token;
	const wiadomosc = req.body.wiadomosc;
	const kiedy = new Date().toISOString().split('T')[0];
	console.log("");
	console.log(new Date().toISOString(), kto, "dodał notatke", komu, "dnia:", kiedy);
	db.query("INSERT INTO `notatkiprofilowe` (`kto`,`komu`,`data`,`tekst`) VALUES ((SELECT `id` FROM `konta` WHERE `login` = ? AND `token` = ?), (SELECT `id` FROM `konta` WHERE `login` = ?), ?, ?)", [kto, tokenKto, komu, kiedy, wiadomosc], (er, result) => {
		if(result.affectedRows > 0){
			res.send({odp: 'OK'});
		} else {
			res.send({blad: 'Nie dodano...'});
		}
	})
});
app.post("/usunKomentarz/:kto/:komu/:idkom", (req, res) => {
	const idkom = req.params.idkom;
	console.log("");
	console.log(new Date().toISOString(), req.params.kto, "usunal", req.params.komu, "komentarz o ID:", idkom);
	db.query("DELETE FROM `notatkiprofilowe` WHERE `id` = ?", [idkom], (er, result) => {
		if(result.affectedRows > 0){
			res.send({odp: 'OK'});
		} else {
			res.send({blad: 'Nie usunieto'});
		}
	})
})
app.post("/profilFullDane/:token", async (req, res) => {
	const token = req.params.token;
	db.query("SELECT `email`, `truck`, `garaz`, `truckbook`, `truckersmp`, `steam` FROM `konta` WHERE `token` = ?", [token], (er, result) => {
		if(result.length > 0){
			res.send({dane: result[0]});
		} else {
			res.send({blad: "Zly token"});
		}
	});
});
app.post("/zaktualizujProfil/:token/:login", upload.single('awatarImg'), (req, res) => {
	/* TODO:
		- DODAC POTWIERDZENIE ZMIANY EMAILU
		- POWIADOMIENIE O ZMIANACH NA DC: DO OSOBY NA DM I NA KANAŁ Z LOGAMI
	*/
	const token = req.params.token;
	const login = req.params.login;
	console.log("");
	console.log(new Date().toISOString(), "Zmiany dla profilu", login);
	db.query("SELECT * FROM `konta` WHERE `token` = ? AND `login` = ?", [token, login], (er, result) => {
		if(result.length > 0){
			let aktualneDane = {};
			aktualneDane.login = result[0].login;
			aktualneDane.awatar = result[0].awatar;
			aktualneDane.email = result[0].email;
			aktualneDane.garaz = result[0].garaz;
			aktualneDane.truck = result[0].truck;
			aktualneDane.steam = result[0].steam;
			aktualneDane.truckbook = result[0].truckbook;
			aktualneDane.truckersmp = result[0].truckersmp;
			if(req.file){
				const nowaNazwa = req.file.destination + req.file.filename;
				db.query("UPDATE `konta` SET `awatar` = ? WHERE `token` = ?" , [nowaNazwa, token]);
				console.log("Zmieniono awatar dla", login, nowaNazwa);
				// usunac stary awatar jesli nie jest placeholderem
				if(aktualneDane.awatar != 'awatary/default.png'){
					fs.unlink(aktualneDane.awatar, (err) => {if(err) console.log(err)});
				}
			}
			if(req.body.noweHaslo1 && req.body.NoweHaslo2 && (req.body.noweHaslo1 === req.body.noweHaslo2)){
				const haslo = CryptoJS.HmacSHA1(req.body.noweHaslo1, KLUCZ_H).toString();
				db.query("UPDATE `konta` SET `haslo` = ? WHERE `token` = ?" , [haslo, token]);
				console.log("Zmieniono hasło dla", login);
			}
			if(req.body.truck && (req.body.truck != aktualneDane.truck)){
				db.query("UPDATE `konta` SET `truck` = ? WHERE `token` = ?" , [req.body.truck, token]);
				console.log("Zmiana trucka dla", login, aktualneDane.truck, "->", req.body.truck);
			}
			if(req.body.garaz && (req.body.garaz != aktualneDane.garaz)){
				db.query("UPDATE `konta` SET `garaz` = ? WHERE `token` = ?" , [req.body.garaz, token]);
				console.log("Zmiana garazu dla", login, aktualneDane.garaz, "->", req.body.garaz);
			}
			if(req.body.steam && (req.body.steam != aktualneDane.steam)){
				db.query("UPDATE `konta` SET `steam` = ? WHERE `token` = ?" , [req.body.steam, token]);
				console.log("Zmiana steama dla", login, aktualneDane.steam, "->", req.body.steam);
			}
			if(req.body.truckersmp && (req.body.truckersmp != aktualneDane.truckersmp)){
				db.query("UPDATE `konta` SET `truckersmp` = ? WHERE `token` = ?" , [req.body.truckersmp, token]);
				console.log("Nowy truckersmp link dla", login, aktualneDane.truckersmp, "->", req.body.truckersmp);
			}
			if(req.body.truckbook && (req.body.truckbook != aktualneDane.truckbook)){
				db.query("UPDATE `konta` SET `truckbook` = ? WHERE `token` = ?" , [req.body.truckbook, token]);
				console.log("Nowy truckbook link dla", login, aktualneDane.truckbook, "->", req.body.truckbook);
			}
			if(req.body.email && (req.body.email != aktualneDane.email)){
				db.query("UPDATE `konta` SET `email` = ? WHERE `token` = ?" , [req.body.email, token]);
				console.log("Zmiana emailu dla", login, aktualneDane.email, "->", req.body.email);
			}
			res.send({odp: "OK"});
		} else {
			res.send({blad: "Nie ma takiego uzytkownika!"});
		} 
	});
});

app.post("/sprawdzUprawnienie/:login/firanki", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 4 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Poj = result[0]['dokiedy'];
		} else {
			tmp.Poj = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 7 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.HTC = result[0]['dokiedy'];
			} else {
				tmp.HTC = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 5 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.Pod = result[0]['dokiedy'];
				} else {
					tmp.Pod = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 6 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.BD = result[0]['dokiedy'];
					} else {
						tmp.BD = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/furgony", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 8 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Poj = result[0]['dokiedy'];
		} else {
			tmp.Poj = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 11 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.HTC = result[0]['dokiedy'];
			} else {
				tmp.HTC = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 9 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.Pod = result[0]['dokiedy'];
				} else {
					tmp.Pod = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 10 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.BD = result[0]['dokiedy'];
					} else {
						tmp.BD = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/chlodnie", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 16 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Poj = result[0]['dokiedy'];
		} else {
			tmp.Poj = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 19 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.HTC = result[0]['dokiedy'];
			} else {
				tmp.HTC = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 17 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.Pod = result[0]['dokiedy'];
				} else {
					tmp.Pod = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 18 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.BD = result[0]['dokiedy'];
					} else {
						tmp.BD = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/izoterma", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 12 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Poj = result[0]['dokiedy'];
		} else {
			tmp.Poj = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 15 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.HTC = result[0]['dokiedy'];
			} else {
				tmp.HTC = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 13 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.Pod = result[0]['dokiedy'];
				} else {
					tmp.Pod = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 14 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.BD = result[0]['dokiedy'];
					} else {
						tmp.BD = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/klonicowka", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 28 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Poj = result[0]['dokiedy'];
		} else {
			tmp.Poj = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 31 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.HTC = result[0]['dokiedy'];
			} else {
				tmp.HTC = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 29 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.Pod = result[0]['dokiedy'];
				} else {
					tmp.Pod = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 30 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.BD = result[0]['dokiedy'];
					} else {
						tmp.BD = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/podkontenerowka", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 24 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Poj = result[0]['dokiedy'];
		} else {
			tmp.Poj = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 27 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.HTC = result[0]['dokiedy'];
			} else {
				tmp.HTC = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 25 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.Pod = result[0]['dokiedy'];
				} else {
					tmp.Pod = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 26 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.BD = result[0]['dokiedy'];
					} else {
						tmp.BD = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/inne", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 32 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.cys = result[0]['dokiedy'];
		} else {
			tmp.cys = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 33 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.niskopodw = result[0]['dokiedy'];
			} else {
				tmp.niskopodw = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 34 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.niskopodl = result[0]['dokiedy'];
				} else {
					tmp.niskopodl = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 36 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.lora = result[0]['dokiedy'];
					} else {
						tmp.lora = "Brak";
					}
					db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 35 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
						if(result.length > 0){
							tmp.katCE = result[0]['dokiedy'];
						} else {
							tmp.katCE = "Brak";
						}
						db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 40 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
							if(result.length > 0){
								tmp.adr = result[0]['dokiedy'];
							} else {
								tmp.adr = "Brak";
							}
							res.send(tmp);
						});
					});
				});
			});
		});
	});
});
app.post("/sprawdzUprawnienie/:login/platforma", (req, res) => {
	const login = req.params.login;
	db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 20 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
		let tmp = {response: 1};
		if(result.length > 0){
			tmp.Z = result[0]['dokiedy'];
		} else {
			tmp.Z = "Brak";
		}
		db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 22 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
			if(result.length > 0){
				tmp.K = result[0]['dokiedy'];
			} else {
				tmp.K = "Brak";
			}
			db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 21 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
				if(result.length > 0){
					tmp.S = result[0]['dokiedy'];
				} else {
					tmp.S = "Brak";
				}
				db.query("SELECT `dokiedy` FROM `uprawnienia` WHERE `naco` = 23 AND `kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `dokiedy` DESC", [login], (er, result) => {
					if(result.length > 0){
						tmp.SH = result[0]['dokiedy'];
					} else {
						tmp.SH = "Brak";
					}
					res.send(tmp);
				});
			});
		});
	});
});
app.post("/profilWiniety/:login", (req, res) => {
	const login = req.params.login;
	const dzis = new Date().toISOString().split('T')[0];
	db.query("SELECT `kupionewiniety`.`id` as 'idwiniety', `kupionewiniety`.`kraj` as 'idkraj', `kupionewiniety`.`dokiedy` as 'dokiedy', `winiety`.`kraj` as 'flaga' FROM `kupionewiniety`, `winiety` WHERE `kupionewiniety`.`kraj` = `winiety`.`id` AND `kupionewiniety`.`dokiedy` >= ? AND `kupionewiniety`.`kto` = (SELECT `id` FROM `konta` WHERE `login` = ?) ORDER BY `winiety`.`kraj` ASC", [dzis, login], (er, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((rekord) => {
				tmp.push({idwiniety: rekord.idwiniety, kraj: rekord.flaga, termin: rekord.dokiedy, flaga: rekord.flaga.toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")});
			});
			res.send({response: 1, dane: tmp});
		} else {
			res.send({blad: "Brak"});
		}
	});
});
app.post("/ostatnieTrasy/:token", (req,res) => {
	const token = req.params.token;
	db.query("SELECT * FROM `trasy` WHERE `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?) ORDER BY `id` DESC LIMIT 10", [token], (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push(trasa);
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/dyspozytorTrasy", (req,res) => {
	db.query("SELECT * FROM `trasy` WHERE `zatwierdz` = 0 ORDER BY `id` ASC LIMIT 10", (err, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((trasa) => {
				tmp.push(trasa);
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/rozpatrzenieTrasy/:token/:idtrasy", (req, res) => {
	const idtrasy = req.params.idtrasy;
	const token = req.params.token;
	const k = new Date();
    k.setHours(k.getHours() + 2);
    const dzis = k.toISOString().slice(0, 19).replace("T", " ");
	console.log(req.body);
	if(req.body.zatwierdz != 2){
		console.log("Zatwierdzanie trasy", idtrasy);
		//zatwierdzanie
		db.query("UPDATE `trasy` SET `zatwierdz` = 1, `kara` = ?, `wlasnyzarobek` = (SELECT `stawka` FROM `konta` WHERE `id` = ?)*? WHERE `id` = ?", [ req.body.grzywna ? req.body.grzywna : 0, req.body.kto, req.body.przejechane, idtrasy], (er, r) => {
			if(er) console.log(er);
			if(r.affectedRows > 0){
				db.query("INSERT INTO `dysphistoria` (`kto`, `trasa`, `kiedy`, `akcja`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, 1)", [token, idtrasy, dzis]);
				res.send({odp: 'OK'});
			} else {
				res.send({blad: 'Nie zatwierdzono'});
			}
		});
	} else {
		//odrzucanie
		console.log("Odrzucanie trasy", idtrasy);
		db.query("UPDATE `trasy` SET `zatwierdz` = 2, `powododrzuc` = ?, `dozwolpoprawke` = ? WHERE `id` = ?", [req.body.powod, req.body.dozwolpoprawe, idtrasy], (er, r) => {
			if(er) console.log(er);
			if(r.affectedRows > 0){
				db.query("INSERT INTO `dysphistoria` (`kto`, `trasa`, `kiedy`, `akcja`) VALUES ((SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, 0)", [token, idtrasy, dzis]);
				res.send({odp: 'OK'});
			} else {
				res.send({blad: 'Nie odrzucono'});
			}
		});
	}
});
app.post("/miastaETS", (req, res) => {
	console.log("Sprawdzam miasta ETS");
	db.query("SELECT `id`, `miasto` as 'nazwa', `kraj` FROM `miejscowosci` WHERE `gra` = 0 ORDER BY `kraj`, `miasto` ASC", (er, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: 'ERROR'});
		}
	});
});
app.post("/miastaATS", (req, res) => {
	db.query("SELECT `id`, `miasto` as 'nazwa', `kraj` FROM `miejscowosci` WHERE `gra` = 1  ORDER BY `kraj`, `miasto` ASC", (er, result) => {
		if(result.length > 0){
			let tmp = [];
			result.forEach((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: 'ERROR'});
		}
	});
});
app.post("/typyNaczep", (req, res) => {
	db.query("SELECT * FROM `typyuprawnien` WHERE `id` != 35", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send({dane: tmp});
		} else {
			res.send({blad: true});
		}
	})
});
app.post("/promy", (req, res) => {
	db.query("SELECT * FROM `prompociag`", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz => {
				tmp.push({...wiersz});
			}));
			res.send({dane: tmp});
		} else {
			res.send({dane: null});
		}
	});
});
app.post("/promyTrasy/:idtrasy", (req, res) => {
	const idtrasy = req.params.idtrasy;
	db.query("SELECT * FROM `trasyprompociag` WHERE `idtrasa` = ?", [idtrasy], (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.forEach((wiersz => {
				tmp.push(wiersz.idprompociag);
			}));
			res.send({dane: {promy: tmp, ile: r.length}});
		} else {
			res.send({dane: {promy: null, ile: 0}});
		}
	});
});
app.post("/poprawTrase/:id/:token", upload.any('noweZdj'), (req, res) => {
	const token = req.params.token;
	const idtrasy = req.params.id;
	console.log(new Date().toISOString(),"Poprawka trasy o ID:", idtrasy);
	let fotki = req.body.stareZdj;
	if(req.files){
		req.files.map((noweZdj) => {
			fotki = fotki + " /img/trasy/" + noweZdj.filename;
		});
		db.query("UPDATE `trasy` SET `zdj` = ? WHERE `id` = ?", [fotki, idtrasy]);
	}
	db.query("UPDATE `trasy` SET `kto` = (SELECT `id` FROM `konta` WHERE `token` = ?), `kiedy` = ?, `przejechane` = ?, `komentarz` = ?, `od` = ?, `do` = ?, `ladunek` = ?, `masaladunku` = ?, `naczepa` = ?, `paliwo` = ?, `powododrzuc` = '', `zatwierdz` = 0, `uszkodzenia` = ?, `spalanie` = ?, `typserwera` = ?, `typzlecenia` = ?, `vmax` = ?, `zarobek` = ?, `dozwolpoprawke` = 0 WHERE `id` = ?", [token, req.body.kiedy, req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, idtrasy], (er, result) => {
		if(er) console.log(er);
		if(result.affectedRows > 0){
			res.send({odp: 'Gites majonez'});
		} else {
			res.send({blad: "chujnia"});
		}
	});
});
app.post("/oddajTrase/:token", upload.any('noweZdj'), (req, res) => {
	const token = req.params.token;
	if(req.files){
		console.log(new Date().toISOString(),"Nowa trasa ze zdjeciami");
		let fotki = [];
		req.files.map((noweZdj) => {
			fotki.push("/img/trasy/" + noweZdj.filename);
		});
		db.query("INSERT INTO `trasy` (`wlasnyzarobek`, `kara`, `gra`, `kto`, `kiedy`, `przejechane`, `komentarz`, `od`, `do`, `ladunek`, `masaladunku`, `naczepa`, `paliwo`, `powododrzuc`, `zatwierdz`, `uszkodzenia`, `spalanie`, `typserwera`, `typzlecenia`, `vmax`, `zarobek`, `dozwolpoprawke`, `zdj`) VALUES (0,0,?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?, ?, ?, ?, ?, ?, 0, ?)", [req.body.gra ? 1 : 0, token, req.body.kiedy, req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek, fotki.join(" ")], (er, result) => {
			if(er) console.log(er);
			if(result.affectedRows > 0){
				res.send({odp: result.insertId});
			} else {
				res.send({blad: "chujnia"});
			}
		});
	} else {
		console.log(new Date().toISOString(), "Nowa trasa bez zdjec");
		db.query("INSERT INTO `trasy` (`wlasnyzarobek`, `kara`, `gra`, `kto`, `kiedy`, `przejechane`, `komentarz`, `od`, `do`, `ladunek`, `masaladunku`, `naczepa`, `paliwo`, `powododrzuc`, `zatwierdz`, `uszkodzenia`, `spalanie`, `typserwera`, `typzlecenia`, `vmax`, `zarobek`, `dozwolpoprawke`, `zdj`) VALUES (0,0, ?, (SELECT `id` FROM `konta` WHERE `token` = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 0, ?, ?, ?, ?, ?, ?, 0, '')", [req.body.gra ? 1 : 0, token, req.body.kiedy, req.body.przejechane, req.body.komentarz, req.body.od, req.body.do, req.body.ladunek, req.body.masaladunku, req.body.naczepa, req.body.paliwo, req.body.uszkodzenia, req.body.spalanie, req.body.typserwera, req.body.typzlecenia, req.body.vmax, req.body.zarobek], (er, result) => {
			if(result.affectedRows > 0){
				res.send({odp: result.insertId});
			} else {
				res.send({blad: "chujnia"});
			}
		});
	}
	
});
app.post("/updateTrasaPromy/:id", (req, res) => {
	const idtrasy = req.params.id;
	db.query("DELETE FROM `trasyprompociag` WHERE `idtrasa` = ?", [idtrasy]);
	let ile = 0;
	let ile2 = 0;
	if(req.body.promy){
		ile = req.body.promy.length;
		req.body.promy.map((ajdi) => {
			db.query("INSERT INTO `trasyprompociag` (`idtrasa`,`idprompociag`) VALUES (?, ?)", [idtrasy, ajdi]);
			console.log(new Date().toISOString(),"Dodano prom", ajdi, "dla", idtrasy);
			ile2 += 1;
		});
	}
	if(ile == ile2){
		res.send({odp: "GIT"});
	} else {
		res.send({blad: "Nwm"});
	}

});
app.post("/trasaDane/:trasaID", (req, res) => {
	const trasaID = req.params.trasaID;
	db.query("SELECT * FROM `trasy` WHERE `id` = ?", [trasaID], (err, result) => {
		if(result.length > 0){
			res.send({dane: result[0]});
		} else {
			res.send({blad: "Brak danych"});
		}
	})
});
app.post("/dyspHistoria/", (req, res) => {
	db.query("SELECT * FROM `dysphistoria` ORDER BY `id` DESC LIMIT 10", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.map((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send({dane: tmp});
		} else {
			res.send({dane: null});
		}
	});
});
app.post("/uprHistoria", (req, res) => {
	db.query("SELECT * FROM `uprawnienia` ORDER BY `id` DESC LIMIT 10", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.map((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send({dane: tmp});
		} else {
			res.send({dane: null});
		}
	});
});
app.post("/dodajUpr/:token", (req, res) => {
	const idtypa = req.body.kto;
	const idupr = req.body.naco;
	const dokiedy = req.body.dokiedy;
	const cena = req.body.cena;
	const k = new Date();
    k.setHours(k.getHours() + 2);
    const odkiedy = k.toISOString().slice(0, 19).replace("T", " "); 
	db.query("INSERT INTO `uprawnienia` (`kto`, `naco`, `dokiedy`, `cena`, `odkiedy`) VALUES (?, ?, ?, ?, ?)", [idtypa, idupr, dokiedy, cena, odkiedy], (er, r) => {
		if(er) console.log(er);
		if(r.affectedRows > 0){
			res.send({odp: "ok"});
		} else {
			res.send({blad: "nie dodano"});
		}
	});
});
app.post("/usunUpr/:id", (req, res) => {
	const idupr = req.params.id;
	db.query("DELETE FROM `uprawnienia` WHERE `id` = ?", [idupr], (er, r) => {
		if(r.affectedRows > 0){
			res.send({odp: 'usunieto'});
		} else {
			res.send({blad: 'nieusunieto'});
		}
	})
});
app.post("/uprawnienia", (req, res) => {
	db.query("SELECT * FROM `typyuprawnien` ORDER BY `nazwa` ASC", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.map((wiersz) => {
				tmp.push({...wiersz});
			});
			res.send(tmp);
		} else {
			res.send(null);
		}
	})
});
app.post("/listaPodwyzek", (req, res) => {
	db.query("SELECT * FROM `podwyzka` WHERE `wniosek` IS NULL", (er, r) => {
		if(r.length > 0){
			let tmp = [];
			r.map(wiersz => {
				tmp.push({...wiersz});
			});
			res.send(tmp);
		} else {
			res.send(null);
		}
	});
});

app.listen(port, () => {
		console.log(`Aplikacja serwerowa zostala uruchomiona na http://localhost:${port}`);
});