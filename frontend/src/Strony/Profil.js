import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	Label
} from "recharts";
import { FaUserCheck, FaUserTimes,FaUserClock, FaRedoAlt, FaPencilAlt, FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
export default function Profil(props){
	const obejscieTlo = (c) => { return {backgroundImage: `url('${c}')`}};
    const { loginP} = useParams();
	if(loginP){
		document.title = "The Boss Spedition - "+loginP;
		if(loginP === localStorage.getItem('login')) { window.location.href = "/profil/"; }
	} else {
		document.title = "The Boss Spedition - Mój Profil";
	}
	const [ blad, setBlad ] = useState(null);
	const [ daneWykres, setDaneWykres ] = useState([]);
	const [ ktoreWykres, setKtoreWykres ] = useState(0);
    const [ daneProfilu, setDaneProfilu ] = useState({prevLink: null,
		gotowe: null, steam: null, datadolaczenia: null, truckbook: null,
		truckersmp: null, typkonta: null, discord: null, garaz: null, truck: null,
		login: null, stanKonta: null, ranga: null, awatar: null, stawka: null
	});
	const [ komunikat, setKomunikat ] = useState(null);
	const [ komentarze, setKomentarze ] = useState({response: null, dane: null, wysuniete: false});
	const [ dodawanyKomentarz, setDodawanyKomentarz ] = useState("");
	const [ edycjaProfilu, setEdycjaProfilu ] = useState(false);
	const [ zmianyProfil, setZmianyProfil ] = useState({response: null});
	const [ pokazPolskie, setPokazPolskie ] = useState(false);
	const [ uprETSfiranki, setUprETSFiranki ] = useState({response: null, Poj: null, Pod: null, HTC: null, BD: null});
	const [ uprETSklonicowka, setUprETSKlonicowka ] = useState({response: null, Poj: null, Pod: null, HTC: null, BD: null});
	const [ uprETSchlodnia, setUprETSChlodnia ] = useState({response: null, Poj: null, Pod: null, HTC: null, BD: null});
	const [ uprETSfurgony, setUprETSFurgony ] = useState({response: null, Poj: null, Pod: null, HTC: null, BD: null});
	const [ uprETSizoterma, setUprETSIzoterma ] = useState({response: null, Poj: null, Pod: null, HTC: null, BD: null});
	const [ uprETSpodkontenerowka, setUprETSPodkontenerowka ] = useState({response: null, Poj: null, Pod: null, HTC: null, BD: null});
	const [ uprETSinne, setUprETSInne ] = useState({response: null, lora: null, niskopodl: null, niskopodw: null, cys: null, katCE: null, adr: null});
	const [ uprETSplatforma, setUprETSPlatforma ] = useState({response: null, Z: null, K: null, S: null, SH: null});
	const [ winiety, setWiniety ] = useState({response: null, dane: null, wysuniete: false});

    const getDane = (dane) =>{
		let zwrot = {};
		Axios.post(gb.backendIP+"profilDane/"+dane.login).then((res) => {
			if(!res.data['blad']){
				zwrot = res.data;
				if(dane.login === localStorage.getItem('login')){
					localStorage.setItem('awatar', "img/"+res.data['awatar']);
				}
			} else {
				setBlad(res.data['blad']);
			}
		});
		let odp = 0;
		Axios.post(gb.backendIP+"stankonta/"+dane.login+"/wlasnyzarobek").then((res) => {
			odp += res.data['odp'];
			Axios.post(gb.backendIP+"stankonta/"+dane.login+"/kary").then((res2) => {
				odp -= res2.data['odp'];
				Axios.post(gb.backendIP+"stankonta/"+dane.login+"/upr").then((res3) => {
					odp -= res3.data['odp'];
					Axios.post(gb.backendIP+"stankonta/"+dane.login+"/gesty").then((res4) => {
						odp += res4.data['odp'];
						Axios.post(gb.backendIP+"stankonta/"+dane.login+"/winiety").then((res5) => {
							odp -= res5.data['odp'];
							setDaneProfilu({...dane, ...zwrot, stanKonta: odp});
							setKtoreWykres(0);
							setKomentarze({response: null, dane: null, wysuniete: false});
							setWiniety({response: null, dane: null, wysuniete: false});
							setDodawanyKomentarz("");
							setUprETSChlodnia({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setUprETSFiranki({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setUprETSFurgony({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setUprETSInne({response: null, lora: null, niskopodl: null, niskopodw: null, cys: null, katCE: null, adr: null});
							setUprETSIzoterma({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setUprETSKlonicowka({response: null, Poj: null, Pod: null, HTC: null, BD: null});
							setUprETSPlatforma({response: null, Z: null, K: null, S: null, SH: null});
							setUprETSPodkontenerowka({response: null, Poj: null, Pod: null, HTC: null, BD: null});
						});
					});
				});
			});
		});
	};

	const sprawdzLogin = () => {
		const tempDane = {...daneProfilu, gotowe: 1, prevLink: window.location.href};
		if(!loginP){
			tempDane.login = localStorage.getItem('login');
			tempDane.awatar = localStorage.getItem('awatar');
			tempDane.ranga = localStorage.getItem('ranga');
        } else {
			tempDane.login = loginP;
        }
		getDane(tempDane);
	}

	const zaladujWykres = (ktore) => {
		if(ktore === 1){
			Axios.post(gb.backendIP+"ostatnie10tras/"+daneProfilu.login+"/dystanskm").then((res) => {
				if(!res.data['blad']){
					setDaneWykres(res.data['dane']);
				}
			}).catch((err) => console.log(err));
		}
		if(ktore === 2){
			Axios.post(gb.backendIP+"ostatnie10tras/"+daneProfilu.login+"/spalanie").then((res) => {
				if(!res.data['blad']){
					setDaneWykres(res.data['dane']);
				}
			}).catch((err) => console.log(err));
		}
		if(ktore === 3){
			Axios.post(gb.backendIP+"ostatnie10tras/"+daneProfilu.login+"/zarobki").then((res) => {
				if(!res.data['blad']){
					setDaneWykres(res.data['dane']);
				}
			}).catch((err) => console.log(err));
		}
		setKtoreWykres(ktore);
	}

	const dostanKomentarze = () => {
		Axios.post(gb.backendIP+"komentarze/"+daneProfilu.login).then((res) => {
			if(!res.data['blad']){
				setKomentarze({...komentarze, response: 1, dane: res.data['dane']});
			} else {
				setKomentarze({...komentarze, response: 1, dane: null});
			}
		}).catch((er) => console.log(er));
	};
	const dodajKomentarz = () => {
		if(dodawanyKomentarz && dodawanyKomentarz.length > 5 && dodawanyKomentarz.length < 300){
			Axios.post(gb.backendIP+"dodajKomentarz/"+daneProfilu.login+"/"+localStorage.getItem('login')+"/"+localStorage.getItem('token'), {
				wiadomosc: dodawanyKomentarz
			}).then((res) => {
				if(res.data['odp'] === "OK"){
					console.log("Dodano komentarz");
					dostanKomentarze();
				}
			})
			setDodawanyKomentarz("");
			document.getElementById("dodawanyKomentarz").value = "";
		}
	};
	const usunKomentarz = (ktory, potwierdzenie) => {
		if(!potwierdzenie){
			setKomunikat(ktory);
		} else {
			setKomunikat(null);
			Axios.post(gb.backendIP+"usunKomentarz/"+localStorage.getItem('login')+"/"+daneProfilu.login+"/"+ktory).then((res) => {
				dostanKomentarze();
			}).catch((er) => console.log(er));
		}
	};
	const zwrocKomentarze = () => {
			return(
				<>
				<div className="wysuwanieKomentarzy" onClick={() => {setKomentarze({...komentarze, wysuniete: !komentarze.wysuniete}); setKomunikat(null); setWiniety({...winiety, wysuniete: false}); }}>Notatki {komentarze.wysuniete ? <FaArrowAltCircleDown style={{color: 'crimson'}} /> : <FaArrowAltCircleUp />}</div>
				{ komentarze.wysuniete ?
				<div className={komunikat ? "komentarzeProfilHolder wejscieSmooth zabluruj" : "komentarzeProfilHolder wejscieSmooth"}>
					{ komunikat && <div className="overlay"/>}
					<div className="komentarzeProfil wejscieSmooth">
					{komentarze.dane ? komentarze.dane.map((komentarz) => {
						const kiedy = new Date(komentarz.kiedy);
						return(
							<div className="komentarzProfil" key={"komentarz_"+komentarz.idnotatki}>
								{ (localStorage.typkonta < 3) && <a className="usunKomentarz wejscieSmooth" onClick={() => { usunKomentarz(komentarz.idnotatki, false)}}>Usuń</a>}
								<div className="komentarzNaglowek">
									<a className="komentarzKto" href={"/profil/"+komentarz.kto}>{komentarz.kto}</a>
									<p>{kiedy.toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
								</div>
								<div className="komentarzTresc">{komentarz.tresc}</div>
							</div>
						)
					}) : <p style={{color: 'goldenrod', textShadow: '1px 1px 3px #111', fontWeight: 'bold'}}>Użytkownik {daneProfilu.login} nie posiada na dany moment żadnych notatek!</p>}
					</div>
					<div className="napiszKomentarz wejscieSmooth">
						<textarea type="text" id="dodawanyKomentarz" placeholder="Dodaj nową notatkę..." onChange={(e) => {setDodawanyKomentarz(e.target.value)}} required/>
						<input type="submit" value="Dodaj" onClick={(e) => {
							e.preventDefault();
							dodajKomentarz();
						}}/>
					</div>
				</div>
				: ""
				}
				</>
			)
	};

	const zwrocWiniety = () => {
		return(
			<>
			<div className="wysuwanieWiniet" onClick={() => {setWiniety({...winiety, wysuniete: !winiety.wysuniete}); setKomentarze({...komentarze, wysuniete: false}); }}>Winiety {winiety.wysuniete ? <FaArrowAltCircleDown style={{color: 'crimson'}} /> : <FaArrowAltCircleUp />}</div>
			{ winiety.wysuniete ?
				<div className="winietyProfilHolder wejscieSmooth">
					<div className="winietyProfil wejscieSmooth">
					{winiety.dane ? winiety.dane.map((winieta) => {
						const kiedy = new Date(winieta.termin);
						return(
							<div className="winietaProfil" key={"winieta_"+winieta.idwiniety}>
								<img src={"/img/flagi/"+winieta.flaga+".png"} />
								<div className="winietaDane">
									<span>{winieta.kraj}</span>
									<p>{kiedy.toLocaleString('pl-PL', {day: 'numeric', month: '2-digit', year: 'numeric'})}</p>
								</div>
							</div>
						)
					}) : <p style={{color: 'goldenrod', textShadow: '1px 1px 3px #111', fontWeight: 'bold'}}>Użytkownik {daneProfilu.login} nie posiada na dany moment żadnych winiet!</p>}
					</div>
				</div>
				: ""
				}
			</>
		);
	};

	const dostanWiniety = () => {
		Axios.post(gb.backendIP+"profilWiniety/"+daneProfilu.login).then((res) => {
			if(!res.data['blad']){
				setWiniety({...winiety, response: 1, dane: res.data['dane']});
			} else {
				setWiniety({...winiety, response: 1, dane: null});
			}
		}).catch((er) => console.log(er));
	};

	const getDaneEdycja = () => {
		Axios.post(gb.backendIP+"profilFullDane/"+localStorage.getItem('token')).then((res) => {
			if(res.data['blad']){
				localStorage.clear();
				window.location.href = "";
			}
			if(res.data['dane']){
				const tmp = res.data['dane'];
				setZmianyProfil({...zmianyProfil, ...tmp, response: 1});
			}
		}).catch((er) => { console.log(er); setZmianyProfil({response: 1}); })
	};

	const zaktualizujProfil = () => {
		Axios.post(gb.backendIP+"zaktualizujProfil/"+localStorage.getItem('token')+"/"+localStorage.getItem('login'), {
			awatarImg: zmianyProfil.awatarPlik,
			email: zmianyProfil.email,
			truckbook: zmianyProfil.truckbook,
			truckersmp: zmianyProfil.truckersmp,
			steam: zmianyProfil.steam,
			garaz: zmianyProfil.garaz,
			truck: zmianyProfil.truck,
			noweHaslo1: zmianyProfil.noweHaslo1,
			noweHaslo2: zmianyProfil.noweHaslo2
		}, { headers: { 'Content-Type': 'multipart/form-data'}}).then((res) => {
			if(res.data['odp']){
				sprawdzLogin();
				setEdycjaProfilu(false);
				setZmianyProfil({response: null});
			} else {
				console.log("Cos sie odjebalo");
			}
		}).catch((er) => console.log("Blad zmiana profilu:", er));
	};

	const dostanFiranki = () => {
		//firanki
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/firanki").then((res) => { setUprETSFiranki(res.data);});
	};
	const dostanChlodnie = () => {
		let tmp = {response: 1};
		//chlodnia
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/chlodnie").then((res) => { setUprETSChlodnia(res.data)});
	};
	const dostanFurgony = () => {
		//furgony
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/furgony").then((res) => { setUprETSFurgony(res.data)});
	};
	const dostanIzoterma = () => {
		//izoterma
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/izoterma").then((res) => { setUprETSIzoterma(res.data)});
	};
	const dostanKlonicowka = () => {
		//klonicowka
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/klonicowka").then((res) => { setUprETSKlonicowka(res.data)});
	};
	const dostanPodkontenerowka = () => {
		//podkontenerowka
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/podkontenerowka").then((res) => { setUprETSPodkontenerowka(res.data)});
	};
	const dostanETSinne = () => {
		//cysterna/cement
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/inne").then((res) => { setUprETSInne(res.data)});
	};
	const dostanPlatforma = () => {
		//platforma
		Axios.post(gb.backendIP+"sprawdzUprawnienie/"+daneProfilu.login+"/platforma").then((res) => { setUprETSPlatforma(res.data)});
	};

    return(
        <>
        <Nawigacja />
        <div className="tlo" />
        <div className="srodekekranu">
			{ !blad &&
			<div className="profilWysuwalne">
                <div className="profilKarta polskiePrawko" title="Polskie prawo jazdy" style={{backgroundImage: `url("/img/prawkoPLprzod.png")`}} onClick={() => setPokazPolskie(true)}></div>
				<div className="profilKarta amerykanskiePrawko nieaktywnyFiltr" title="W przyszłości :(" style={{backgroundImage: `url("/img/prawkoUSAprzod.png")`}}></div>
				<div className="profilKarta kartaPaliwowa nieaktywnyFiltr" title="W przyszłości :(" style={{backgroundImage: `url("/img/kartaPaliwowa.png")`}}></div>
            </div>
			}
            <div className="glowna"  style={{zIndex: 2}}>
                <div className="glownaGora">
					<div className="miniProfil" style={{width: '100%'}}>
						{ blad ? 
						<div className="miniDane">
							<div />
							<div>
								<span>Nie ma takiego użytkownika!</span>
							</div>
							<div><span>Wydaje się, że zbłądziłeś!</span></div>
						</div>
						:
						<>
						<div className="glownaAwatar" style={obejscieTlo("/img/"+daneProfilu.awatar)} />
						<div className="miniDane">
							<div>
								<span>{daneProfilu.login ? daneProfilu.login : "Brak"}</span>
								<span>{daneProfilu.ranga ? daneProfilu.ranga : "?"}</span>
							</div>
							<div>
								<span>Stan konta: { daneProfilu.stanKonta ? daneProfilu.stanKonta.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"}) : "??"} <sup>{daneProfilu.stawka}zł/km</sup></span>
							</div>
							<div>
								<span>Dołączył { daneProfilu.datadolaczenia ? new Date(daneProfilu.datadolaczenia).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'}) : "?"}.</span>
								<span>Główny garaż w {daneProfilu.garaz ? daneProfilu.garaz : "Brak"}.</span>
								<span>Ulubiony truck to {daneProfilu.truck ? daneProfilu.truck : "Brak"}.</span>
								<br />
								<div>
									{ daneProfilu.truckersmp && <a rel="noreferrer" className="odnosnikProfil" href={`${daneProfilu.truckersmp}`} style={obejscieTlo("/img/truckersmp.png")} target="_blank"/>}
									{ daneProfilu.truckbook && <a rel="noreferrer" className="odnosnikProfil" style={obejscieTlo("/img/truckbook.png")} href={`${daneProfilu.truckbook}`} target="_blank"/>}
									{ daneProfilu.steam && <a rel="noreferrer" className="odnosnikProfil" style={obejscieTlo("/img/steam.png")} href={`${daneProfilu.steam}`} target="_blank"/>}
								</div>
								{ !daneProfilu.discord && <span style={{color: 'crimson'}}>Brak połączenia z Discordem!</span> }
							</div>
						</div>
						<div className="miniWykresik">
							<div style={{maxWidth: '500px', width: '100%', height: '200px'}}>
							<ResponsiveContainer>
								<AreaChart data={daneWykres} margin={{top: 30, left: 10, right: 30, bottom: 20}}>
									<XAxis dataKey="x" allowDecimals={true}>
										<Label value="ID trasy" position="insideBottom" dy={20} style={{fill: 'white', textAnchor: 'middle'}}/>
									</XAxis>
									<YAxis dataKey="y" allowDecimals={true}>
										<Label value="Wartość"
										 dy={-30} position="insideTopLeft"
										style={{fill: 'white'}}/>
									</YAxis>

									{ (ktoreWykres === 1) && <Area
										name="Dystans"
										unit=" km"
										type="monotone"
										dataKey="y"
										fillOpacity={0.7}
									/> }
									{ (ktoreWykres === 2) && <Area
										name="Spalanie"
										unit=" l / 100 km"
										type="monotone"
										dataKey="y"
										fillOpacity={0.7}
									/> }
									{ (ktoreWykres === 3) && <Area
										name="Zarobek"
										unit=" zł"
										type="monotone"
										dataKey="y"
										fillOpacity={0.7}
									/> }
									{ (ktoreWykres === 2) ? <Tooltip formatter={(v) => v.toFixed(1)}/> : <Tooltip /> }
									<CartesianGrid stroke="#ccc3" strokeDasharray="3 3"/>
								</AreaChart>
							</ResponsiveContainer>
							</div>
							<div className="ktoryWykresWybrany">
								{ daneProfilu.login && ((ktoreWykres === 1) ? <button disabled>Dystans KM</button> : <button onClick={() => {zaladujWykres(1);}}>Dystans KM</button>)}
								{ daneProfilu.login && ((ktoreWykres === 2) ? <button disabled>Spalanie</button> : <button onClick={() => { zaladujWykres(2)}}>Spalanie</button>)}
								{ daneProfilu.login && ((ktoreWykres === 3) ? <button disabled>Zarobek</button> : <button onClick={() => { zaladujWykres(3);}}>Zarobek</button>)}
								{ daneProfilu.login && !ktoreWykres && zaladujWykres(1) }
							</div>
						</div>
						</>
						}
					</div>
                </div>
				{ daneProfilu.login && (komentarze.response ? zwrocKomentarze() : dostanKomentarze())}
				{ daneProfilu.login && (winiety.response ? zwrocWiniety() : dostanWiniety())}
				{ ((localStorage.getItem('login') === daneProfilu.login) && !komentarze.wysuniete && !winiety.wysuniete) &&
				<>
					<FaPencilAlt className="edycjaProfilBtn" onClick={() => { setEdycjaProfilu(!edycjaProfilu)}} />
					<div className={edycjaProfilu ? "edycjaProfilu edycjaProfiluWysun":"edycjaProfilu"}>
						{ zmianyProfil.response ?
						<>
						<div className="wejscieSmooth" style={{display: 'flex'}}>
							<div className="edycjaSekcjaAwatar">
								<div className="edycjaSekcjaAwatarWyswietlany wejscieSmooth" style={obejscieTlo(zmianyProfil.awatarBlob ? zmianyProfil.awatarBlob : localStorage.getItem('awatar'))}>
								{ zmianyProfil.awatarBlob && <FaRedoAlt className="awatarCofnij" onClick={() => {setZmianyProfil({...zmianyProfil, awatarPlik: null, plikNazwa: null, awatarBlob: null}); document.getElementById("uploadImage").value = "";}} /> }
								</div>
								<input type="file" className={zmianyProfil.plikNazwa ? "edycjaSekcjaAwatarInput edycjaSekcjaAwatarInputYes" : "edycjaSekcjaAwatarInput edycjaSekcjaAwatarInputNo"} id="uploadImage" onChange={(e) => { 
									setZmianyProfil({...zmianyProfil, plikNazwa: e.target.value, awatarPlik: e.target.files[0],awatarBlob: URL.createObjectURL(e.target.files[0])});
								}} accept="image/png, image/jpeg"/>
							</div>
							<div>
								<div className="edycjaForm">
									<label>E-mail</label>
									<input type="email" placeholder="Wymagany email" value={zmianyProfil.email} onChange={(e) => setZmianyProfil({...zmianyProfil, email: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>Nowe hasło</label>
									<input type="password" placeholder="Opcjonalne" onChange={(e) => setZmianyProfil({...zmianyProfil, noweHaslo1: e.target.value})}/>
								</div>
								<div className="edycjaForm">
									<label>Powtórz hasło</label>
									<input type="password" placeholder="Opcjonalne" onChange={(e) => setZmianyProfil({...zmianyProfil, noweHaslo2: e.target.value})}/>
								</div>
							</div>
							<div>
								<div className="edycjaForm">
									<label>TruckersMP</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.truckersmp} onChange={(e) => setZmianyProfil({...zmianyProfil, truckersmp: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>TruckBook</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.truckbook} onChange={(e) => setZmianyProfil({...zmianyProfil, truckbook: e.target.value})} required/>
								</div>
								<div className="edycjaForm">
									<label>Steam</label>
									<input type="url" placeholder="Wymagany link" value={zmianyProfil.steam} onChange={(e) => setZmianyProfil({...zmianyProfil, steam: e.target.value})} required/>
								</div>
							</div>
							<div>
								<div className="edycjaForm">
									<label>Główny garaż</label>
									<input type="text" placeholder="Lokalizacja" value={zmianyProfil.garaz} onChange={(e) => setZmianyProfil({...zmianyProfil, garaz: e.target.value})}/>
								</div>
								<div className="edycjaForm">
									<label>Ulubiony truck</label>
									<input type="text" placeholder="Marka + Model" value={zmianyProfil.truck} onChange={(e) => setZmianyProfil({...zmianyProfil, truck: e.target.value})}/>
								</div>
							</div>
							{ zmianyProfil.blad && <p>{zmianyProfil.bladTekst}</p>}
						</div>
						<div className="edycjaWybor">
							<button onClick={() => {
								setEdycjaProfilu(!edycjaProfilu);
								setZmianyProfil({response: null});
							}}>
								<FaUserTimes />
								<p>Anuluj</p>
							</button>
							<button onClick={() => {
								setZmianyProfil({response: null});
							}}>
								<FaUserClock />
								<p>Odśwież</p>
							</button>
							<button onClick={() => { zaktualizujProfil() }}>
								<FaUserCheck />
								<p>Zatwierdź</p>
							</button>
						</div>
						</>
						: getDaneEdycja()
						}
					</div>
				</>
				}
			</div>
			{ komunikat && 
			<div className="komunikat wejscieSmooth">
				Czy napewno chcesz usunąć ten komentarz?
				<div>
					<a onClick={() => usunKomentarz(komunikat, true)}>Tak</a>
					<a onClick={() => setKomunikat(null)}>Nie</a>
				</div>
			</div>
			}
			{ pokazPolskie && 
			<div className="licencja">
				<div className="licencjaTlo wejscieSmooth" onClick={() => setPokazPolskie(false) }/>
				{ !uprETSfiranki.response && dostanFiranki() }
				{ !uprETSfurgony.response && dostanFurgony() }
				{ !uprETSizoterma.response && dostanIzoterma() }
				{ !uprETSklonicowka.response && dostanKlonicowka() }
				{ !uprETSchlodnia.response && dostanChlodnie() }
				{ !uprETSpodkontenerowka.response && dostanPodkontenerowka() }
				{ !uprETSinne.response && dostanETSinne() }
				{ !uprETSplatforma.response && dostanPlatforma() }
				{ (uprETSchlodnia.response && uprETSfiranki.response && uprETSfurgony.response && uprETSinne.response && uprETSizoterma.response && uprETSklonicowka.response && uprETSplatforma.response && uprETSpodkontenerowka.response) ?
				<div className="polskiePrawkoTyl pokazSmooth" style={obejscieTlo("/img/prawkoPLtyl.jpg")}>
				<table className="prawko-uprawnienia">
					<tbody>
						<tr><th></th><th>Pojedyńcza</th><th>HTC</th><th>Podwójna</th><th>B-Double</th></tr>
						<tr><th>Firanka</th>
							<td>{uprETSfiranki.Poj}</td>
							<td>{uprETSfiranki.HTC}</td>
							<td>{uprETSfiranki.Pod}</td>
							<td>{uprETSfiranki.BD}</td>
						</tr>
						<tr><th>Furgon</th>
							<td>{uprETSfurgony.Poj}</td>
							<td>{uprETSfurgony.HTC}</td>
							<td>{uprETSfurgony.Pod}</td>
							<td>{uprETSfurgony.BD}</td>
						</tr>
						<tr><th>Izoterma</th>
							<td>{uprETSizoterma.Poj}</td>
							<td>{uprETSizoterma.HTC}</td>
							<td>{uprETSizoterma.Pod}</td>
							<td>{uprETSizoterma.BD}</td>
						</tr>
						<tr><th>Kłonicówka</th>
							<td>{uprETSklonicowka.Poj}</td>
							<td>{uprETSklonicowka.HTC}</td>
							<td>{uprETSklonicowka.Pod}</td>
							<td>{uprETSklonicowka.BD}</td>
						</tr>
						<tr><th>Chłodnia</th>
							<td>{uprETSchlodnia.Poj}</td>
							<td>{uprETSchlodnia.HTC}</td>
							<td>{uprETSchlodnia.Pod}</td>
							<td>{uprETSchlodnia.BD}</td>
						</tr>
						<tr><th>Podkontenerówka</th>
							<td>{uprETSpodkontenerowka.Poj}</td>
							<td>{uprETSpodkontenerowka.HTC}</td>
							<td>{uprETSpodkontenerowka.Pod}</td>
							<td>{uprETSpodkontenerowka.BD}</td>
						</tr>
						<tr><th>Cysterna/Cement</th><td>{uprETSinne.cys}</td><td></td><td></td><td></td></tr>
						<tr><th>Niskopodwoziowa</th><td>{uprETSinne.niskopodw}</td><td></td><td></td><td></td></tr>
						<tr><th>Niskopodłogowa</th><td>{uprETSinne.niskopodl}</td><td></td><td></td><td></td></tr>
						<tr><th>Lora</th><td>{uprETSinne.lora}</td><td></td><td></td><td></td></tr>	
						<tr><th>Platforma</th>
							<td><b>Zwykła</b><br />{uprETSplatforma.Z}</td>
							<td><b>Kontenery</b><br />{uprETSplatforma.K}</td>
							<td><b>Skrzynia</b><br />{uprETSplatforma.S}</td>
							<td><b>Skrzynia HDS</b><br />{uprETSplatforma.SH}</td>
						</tr>
					</tbody>
				</table>
				<div className="katCE">
					<b>Kat C+E: </b> {uprETSinne.katCE}
					<br /><br />
					<b>ADR: </b> { uprETSinne.adr}
				</div>
				<div className="prawkoPLLogo" style={obejscieTlo("/img/logoglowna.png")}/>
				</div>
				: <span>Ładuję dane...</span>
				}
			</div>
			}
        </div>
		{ (!daneProfilu.prevLink || (daneProfilu.prevLink !== window.location.href)) && sprawdzLogin() }
    </>
    );
}