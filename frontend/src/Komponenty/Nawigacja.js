import { NavLink } from "react-router-dom";
import {
	RiBarChart2Fill,
	RiLogoutBoxLine,
	RiUser3Fill,
	RiFolderUserFill,
	RiBus2Fill,
	RiSurveyFill,
	RiHome3Fill,
	RiCurrencyFill,
	RiEqualizerFill,
	RiAlertFill,
	RiBankFill,
} from "react-icons/ri";
import Axios from "axios";
import { useState } from "react";
import gb from "../GlobalVars";

export default function Nawigacja() {
	const [sprawdzona, setSprawdzona] = useState(false);
	const [iloscTras, setIloscTras ] = useState(0);
	const [iloscPodwyzek, setIloscPodwyzek] = useState(0);
	const [typKonta, setTypKonta] = useState(13);

	const sprawdzSesje = () => {
		console.log("Sprawdzam sesje");
		if(localStorage.getItem("token")){
			Axios.get(
				gb.backendIP+"typkonta/" + localStorage.getItem("token")
			).then((res) => {
				if(!res.data['blad']){
					setTypKonta(res.data['typkonta']);
					localStorage.setItem('typkonta', res.data['typkonta']);
					localStorage.setItem('ranga', res.data['ranga']);
					localStorage.setItem('login', res.data['login']);
					setSprawdzona(true);
				} else {
					localStorage.clear();
					window.location.replace("/zaloguj");
				}
			}).catch(() => {
				localStorage.clear();
				window.location.replace("/zaloguj");
			});
		} else {
			window.location.replace("/zaloguj");
		}
	};

	const szefMenu = () => {
		return (
			<>
				<li>
					<NavLink to="/konta">
						<RiFolderUserFill /> Menadżer kont
						{iloscPodwyzek ? <div className="menu-ilosc">{iloscPodwyzek}</div> : ""}
					</NavLink>
				</li>
				<li>
					<NavLink to="/ustawienia">
						<RiEqualizerFill /> Ustawienia
					</NavLink>
				</li>
			</>
		);
	};

	const trasunie = () => {
		Axios.get(
			gb.backendIP+"sprawdztrasy"
		).then((res) => {
			setIloscTras(res.data['ilosc']);
		}).catch(() => {
			setIloscTras("?");
		});
	};

	const podwyzki = () => {
		Axios.get(
			gb.backendIP+"sprawdzpodwyzki"
		).then((res) => {
			setIloscPodwyzek(res.data['ilosc']);
		}).catch(() => {
			setIloscPodwyzek("?");
		});
	}

	const dyspMenu = () => {
		return (
				<>
					<li>
						<NavLink to="/uprawnienia">
							<RiBankFill /> Uprawnienia
						</NavLink>
					</li>
					<li>
						<NavLink to="/dyspozytornia">
							<RiSurveyFill /> Dyspozytornia
							{iloscTras ? <div className="menu-ilosc">{iloscTras}</div> : ""}
						</NavLink>
					</li>
				</>
		);
	};

	const wyloguj = () => {
		localStorage.clear();
		sprawdzSesje();
	};

	return (
		<>
		<div className="logofirmy" style={{backgroundImage: `url('/img/logoglowna.jpg')`}}/>
		<header>
			{!sprawdzona && sprawdzSesje()}
			<nav>
				<ul>
					<li>
						<NavLink to="/">
							<RiHome3Fill /> Główna
						</NavLink>
					</li>
					<li>
						<NavLink to="/profil">
							<RiUser3Fill /> Profil
						</NavLink>
					</li>
					<li>
						<NavLink to="/ranking">
							<RiBarChart2Fill /> Ranking
						</NavLink>
					</li>
					<li>
						<NavLink to="/trasy">
							<RiBus2Fill /> Trasy
						</NavLink>
					</li>
					<li>
						<NavLink to="/podwyzka">
							<RiCurrencyFill /> Podwyżka
						</NavLink>
					</li>
					<li>
						<NavLink to="/incydenty">
							<RiAlertFill /> Incydenty
						</NavLink>
					</li>
					{sprawdzona && 0 <= typKonta && typKonta <= 3 && dyspMenu()}
					{sprawdzona && 0 <= typKonta && typKonta <= 3 && trasunie()}
					{sprawdzona && 0 <= typKonta && typKonta <= 2 && szefMenu()}
					{sprawdzona && 0 <= typKonta && typKonta <= 2 && podwyzki()}
				</ul>
				<button onClick={() => wyloguj()}>
					<RiLogoutBoxLine /> Wyloguj
				</button>
			</nav>
		</header>
		</>
	);
}
