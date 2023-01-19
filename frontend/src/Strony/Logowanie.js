import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Logowanie(props){
	const [login, setLogin] = useState(null);
	const [haslo, setHaslo] = useState(null);
	const [blad, setBlad] = useState(false);
	document.title = "The Boss Spedition - Logowanie";
	const autoryzacja = async (e) => {
		if(login && haslo){
			if(login.length > 3 && login.length < 60 && haslo.length > 3 && haslo.length < 60){
				await Axios.post(gb.backendIP+"login",
				{
					username: login,
					password: haslo
				}).then((res) => {
					if(!res.data['blad']){
						localStorage.setItem('awatar', "/img/"+res.data['awatar']);
						localStorage.setItem('login', res.data['login']);
						localStorage.setItem('token', res.data['token']);
						window.location.replace("./");
					} else {
						setBlad("Nieprawidłowe dane logowania!");
					}
				}).catch((er) => {
					setBlad("Błąd: "+er.message);
				});
			} else {
				setBlad("Za krótkie/długie dane!");
			}
		} else {
			setBlad("Wprowadź dane logowania!");
		}
	};

	return(
		<div className="logowanieBg">
			<div className="logowanie">
				<div className="logowanieLewa">
					<div className="logowanieLogo" />
				</div>
				<div className="logowaniePrawa">
					<h1>Logowanie</h1>
					<h3>Aby przejść do systemu musisz zalogować się na swoje konto</h3>
					{blad && <h5>{blad}</h5>}
					<input type="text" name="login" onChange={(e) => { setLogin(e.target.value); setBlad(null); } } placeholder="Username"/>
					<input type="password" name="haslo" onChange={(e) => { setHaslo(e.target.value); setBlad(null); } } onKeyDown={(e) => { 
						if(e.key === 'Enter') { e.preventDefault(); autoryzacja(e); }
						}} placeholder="Password"/>
					<input type="submit" value="Zaloguj" onClick={(e) => {
						e.preventDefault();
						autoryzacja(e);
					}} disabled={blad ? true : false}/>
					<a href="/reset">Resetuj hasło</a>
				</div>
			</div>
		</div>
	);
}