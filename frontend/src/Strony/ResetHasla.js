import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function ResetHasla(props){
    const [etap, setEtap] = useState(0);
	const [login, setLogin] = useState(null);
    const [kodzwrotny, setKodzwrotny] = useState(null);
	const [haslo, setHaslo] = useState(null);
    const [haslo2, setHaslo2] = useState(null);
	const [blad, setBlad] = useState(false);

    const etap0 = () => {
        return(
            <>
            <h1>Resetowanie hasła</h1>
					<h3>Podaj swój login, aby rozpocząć proces resetowania hasła!</h3>
					{blad && <h5>{blad}</h5>}
					<input type="text" name="login" onChange={(e) => { setLogin(e.target.value); setBlad(null); } } onKeyDown={(e) => { 
						if(e.key === 'Enter') { e.preventDefault(); etap0Btn(e); }
						}} placeholder="Username"/>
					<input type="submit" value="Resetuj" onClick={(e) => {
						e.preventDefault();
						etap0Btn(e);
					}} disabled={blad ? true : false}/>
            </>
        )
    };

    const etap1 = () => {
        return(
            <>
            <h1>Resetowanie hasła</h1>
					<h3>Powinieneś otrzymać kod zwrotny, podaj go poniżej!</h3>
					{blad && <h5>{blad}</h5>}
					<input type="text" name="kodzwrotny" onChange={(e) => { setKodzwrotny(e.target.value); setBlad(null); } } onKeyDown={(e) => { 
						if(e.key === 'Enter') { e.preventDefault(); etap1Btn(e); }
						}} placeholder="Kod zwrotny"/>
					<input type="submit" value="Resetuj" onClick={(e) => {
						e.preventDefault();
						etap1Btn(e);
					}} disabled={blad ? true : false}/>
            </>
        );
    };

    const etap2 = () => {
        return(
            <>
            <h1>Resetowanie hasła</h1>
					<h3>Już prawie! Wystarczy, że wprowadzisz swoje nowe hasło!</h3>
					{blad && <h5>{blad}</h5>}
					<input type="password" name="haslo" onChange={(e) => { setHaslo(e.target.value); setBlad(null); } } placeholder="Password"/>
                    <input type="password" name="haslo2" onChange={(e) => { setHaslo2(e.target.value); setBlad(null); } } onKeyDown={(e) => { 
						if(e.key === 'Enter') { e.preventDefault(); etap2Btn(e); }
						}} placeholder="Password"/>
					<input type="submit" value="Resetuj" onClick={(e) => {
						e.preventDefault();
						etap2Btn(e);
					}} disabled={blad ? true : false}/>
            </>
        );
    };

    const etap3 = () => {
        return(
            <>
            <h1>Resetowanie hasła</h1>
            <h3>Hasło zresetowane pomyślnie! Pozostaje nic, jak tylko zalogować się!</h3>
            <input type="submit" value="Zakończ" onClick={(e) => {
                e.preventDefault();
                window.location.replace("/zaloguj");
            }} />
            </>
        );
    };

    const etap0Btn = (e) => {
		if(login){
			if(login.length > 3 && login.length < 60){
				Axios.post(gb.backendIP+"reset",
				{
					username: login
				}).then((res) => {
					if(!res.data['blad']){
						setEtap(1);
                        setBlad(null);
					} else {
						setBlad("Nie ma takiego użytkownika!");
					}
				}).catch((er) => {
					setBlad("Błąd: "+er.message);
				});
			} else {
				setBlad("Za krótkie/długie dane!");
			}
		} else {
			setBlad("Wprowadź swój login!");
		}
	};

    const etap1Btn = () => {
        if(kodzwrotny){
            if(kodzwrotny.length > 30 && kodzwrotny.length < 45){
                Axios.post(gb.backendIP+"resetcheck",
                {
                    kodzik: kodzwrotny
                }).then((res) => {
                    if(!res.data['blad']){
                        setEtap(2);
                        setBlad(null);
                    } else {
                        setBlad("Wprowadzono niepoprawny kod!");
                    }
                }).catch((err) => {
                    setBlad("Błąd: "+err.message);
                });
            } else {
                setBlad("Niepoprawna długość kodu!");
            }
        } else {
            setBlad("Wprowadź kod zwrotny!");
        }
    };

    const etap2Btn = (e) => {
		if(haslo && haslo2 && (haslo === haslo2)){
			if(haslo.length > 3 && login.length < 60){
				Axios.post(gb.backendIP+"resetfinal",
				{
					kodzwrotny: kodzwrotny,
                    haslo: haslo
				}).then((res) => {
					if(!res.data['blad']){
						setEtap(3);
                        setBlad(null);
					} else {
						setBlad("Nie ustawiono nowego hasła!");
					}
				}).catch((er) => {
					setBlad("Błąd: "+er.message);
				});
			} else {
				setBlad("Za krótkie/długie dane!");
			}
		} else {
			setBlad("Wprowadź 2 takie same hasła!");
		}
	};

	return(
		<div className="logowanieBg">
			<div className="logowanie">
				<div className="logowanieLewa">
					<div className="logowanieLogo" />
				</div>
				<div className="logowaniePrawa">
                    { (etap === 0) && etap0() }
                    { (etap === 1) && etap1() }
                    { (etap === 2) && etap2() }
                    { (etap === 3) && etap3() }
                    <a href="/zaloguj">Jednak pamiętam!</a>
				</div>
			</div>
		</div>
	);
}