import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";

export default function Glowna(props) {
	const [checkData, setCheckData] = useState(0);
	const [wersjeGry, setWersjeGry ] = useState({'resp': 0, 'tmp': 0, 'ets': 0, 'ats': 0});
	const [stanKonta, setStanKonta] = useState(null);
	const [topka, setTopka] = useState({response: 0, top1: null, top2: null, top3: null});
	const [ownStats, setOwnStats] = useState({'response': 0, 'ladunkow': 0, "przejechanekm": 0, "tony": 0, "spalanie": 0});
	const [mainInfo, setMainInfo] = useState({'response': 0, 'limitkm': 0, 'msg': null});
	const [globalStats, setGlobalStats] = useState({'response': 0, 'ladunkow': 0, "przejechanekm": 0, "pracownikow": 0, "spalanie": 0});
	document.title = "Główna - The Boss Spedition";
	const poprzedniMiesiac = new Date();
	const tenMiesiac = poprzedniMiesiac.toLocaleString('default', {month: 'long'});
	poprzedniMiesiac.setMonth(poprzedniMiesiac.getMonth()-1);
	const poprzedniMiesiacNazwa = poprzedniMiesiac.toLocaleString('default', {month: 'long'}).toUpperCase();

	const askForVersions = () => {
		Axios.get(gb.backendIP+"wersjeGry")
		.then((res) => {
			setWersjeGry(res.data);
		}).catch((err) => {
			console.log(err.message);
		});
	};

	const fGlobalStats = () =>{
		Axios.post(gb.backendIP+"mainGlobalStats/")
		.then((res) => {
			if(!res.data['blad']){
				setGlobalStats(res.data);
			}
		})
		.catch((err) => {
			console.error(err);
		});
	};

	//dostan wlasne statystyki
	const fOwnStats = () => {
		Axios.post(gb.backendIP+"mainOwnStats/"+localStorage.getItem('token'))
		.then((res) => {
			if(!res.data['blad']){
				setOwnStats(res.data);
			}
		})
		.catch((err) => {
			console.error(err);
		});
	};

	//dostan wiadomosc i limit km
	const fGetInfo = () =>{
		Axios.post(gb.backendIP+"glownaInfo/")
		.then((res) => {
			if(!res.data['blad']){
				setMainInfo(res.data);
			}
		}).catch((err) => {
			console.error(err);
		})
	};

	//dostan stan konta
	const getStanKonta = () =>{
		let odp = 0;
		Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/wlasnyzarobek").then((res) => {
			odp += res.data['odp'];
			Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/kary").then((res2) => {
				odp -= res2.data['odp'];
				Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/upr").then((res3) => {
					odp -= res3.data['odp'];
					Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/gesty").then((res4) => {
						odp += res4.data['odp'];
						Axios.post(gb.backendIP+"stankonta/"+localStorage.getItem('login')+"/winiety").then((res5) => {
							odp -= res5.data['odp'];
							setStanKonta(odp);
						});
					});
				});
			});
		});
	};

	//dostan top3
	const getTopka = () => {
		Axios.post(gb.backendIP+"lastMonthTop3").then((res) => {
			if(!res.data['blad']){
				setTopka(res.data);
			}
		}).catch((err) => {
			console.error(err);
		});
	};

	const dostanDane = () => {
		if(stanKonta === null) getStanKonta();
		if(!topka.response) getTopka();
		if(!mainInfo.response) fGetInfo();
		if(!ownStats.response) fOwnStats();
		if(!globalStats.response) fGlobalStats();
		if(!wersjeGry.resp) askForVersions();
		setCheckData(true);
	};


	return (
		<>
			<Nawigacja />
			<div className="tlo" />
			<div className="srodekekranu">
				<div className="glowna">
					<div className="glownaWiadomosc">
						<h3>Ważna informacja</h3>
						<hr />
						<span>{mainInfo.msg ? mainInfo.msg : "Witaj w systemie The Boss Spedition!"}</span>
					</div>
					<div className="glownaGora">
						<div className="miniProfil">
							<div className="glownaAwatar" style={{ backgroundImage: `url(${localStorage.getItem('awatar')})` }} />
							<div className="miniDane">
								<div>
									<span>Cześć, {localStorage.getItem('login')}!</span>
									<span>{localStorage.getItem('ranga')}</span>
								</div>
								<div>
									<span>Stan konta: { stanKonta ? stanKonta.toLocaleString("pl-PL", {style: 'currency', currency: "PLN"}) : "0"}</span>
								</div>
								<div>
									
									<span>Wersja TruckersMP: { wersjeGry.tmp ? wersjeGry.tmp : "Brak"}</span>
									<span>Wersja ETS2: { wersjeGry.ets ? wersjeGry.ets : "Brak"}</span>
									<span>Wersja ATS: { wersjeGry.ats ? wersjeGry.ats : "Brak" }</span>
								</div>
							</div>
						</div>
						<div className="top3" style={{ backgroundImage: `url("/img/top3.png")`}}>
							<span className="tytul">TOP 3 - { poprzedniMiesiacNazwa }</span>
							{topka.top1 ? <a className="miejsce1" href={`${"/profil/"+topka.top1}`}>{topka.top1}</a> : <span className="miejsce1">Brak</span>}
							{topka.top2 ? <a className="miejsce2" href={`${"/profil/"+topka.top2}`}>{topka.top2}</a> : <span className="miejsce2">Brak</span>}
							{topka.top3 ? <a className="miejsce3" href={`${"/profil/"+topka.top3}`}>{topka.top3}</a> : <span className="miejsce3">Brak</span>}
						</div>
					</div>
					<div className="glownaDol">
						<div className="statwlasna">
							<h2>Twoja statystyka - miesięczna ({tenMiesiac})</h2>
							<div><span>Dostarczone przesyłki</span><span>{ownStats.ladunkow ? ownStats.ladunkow.toLocaleString() : "Brak"}</span></div>
							<div><span>Limit</span><span>{ownStats.przejechanekm ? ownStats.przejechanekm.toLocaleString() : "0"} km / {mainInfo.limitkm ? mainInfo.limitkm.toLocaleString("pl-PL") : "???"} km</span></div>
							<div><span>Średnie spalanie</span><span>{ownStats.spalanie ? ownStats.spalanie.toFixed(1).toLocaleString() : "0"} l / 100 km</span></div>
							<div><span>Dostarczony tonaż</span><span>{ownStats.tony ? ownStats.tony : "Brak"}</span></div>
						</div>
						<div className="statfirmowa">
							<h2>Statystyka firmy - całościowa</h2>
							<div><span>Dostarczone przesyłki</span><span>{globalStats.ladunkow ? globalStats.ladunkow.toLocaleString() : "Brak"}</span></div>
							<div><span>Dystans</span><span>{globalStats.przejechanekm ? globalStats.przejechanekm.toLocaleString() : "0"} km</span></div>
							<div><span>Średnie spalanie</span><span>{globalStats.spalanie ? globalStats.spalanie.toFixed(1).toLocaleString() : "0"} l / 100 km</span></div>
							<div><span>Wszystkich pracowników</span><span>{globalStats.pracownikow ? globalStats.pracownikow-1 : "0"}</span></div>
						</div>
					</div>
				</div>
			</div>
			{ !checkData && dostanDane() }
		</>
	);
}
