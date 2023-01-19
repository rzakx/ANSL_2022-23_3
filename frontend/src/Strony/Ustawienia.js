import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Ustawienia(props){
    const [ust, setUst] = useState({dane: null, response: false});

    const initUstawienia = () => {
        Axios.post(gb.backendIP+"listaUzytkownikow").then((uzytkownicy) => {
            Axios.post(gb.backendIP+"glownaInfo").then((glowna) => {
                setUst({response: true, limitkm: glowna.data['limitkm'], msg: glowna.data['msg'], uzytkownicy: uzytkownicy.data, wybranyUzytkownik: 1});
            });
        });
    };

    const ustawMsg = () => {
        if(!ust.msg) return;
        Axios.post(gb.backendIP+"ustawPowitalna", {
            tresc: ust.msg
        }).then((r) => {
            console.log(r.data);
            setUst({response: false}); 
        }).catch((er) => console.log(er));
    };

    const dodajKwote = () => {
        if(!ust.kwotaDod) return;
        console.log(ust);
        Axios.post(gb.backendIP+"dodajKwote/"+localStorage.getItem('token'), {
            komu: ust.wybranyUzytkownik,
            kwota: ust.kwotaDod
        }).then((r) => {
            console.log(r);
            setUst({...ust, kwotaDod: 0});
        }).catch((er) => console.log(er));
    };

    const ustawLimit = () => {
        if(!ust.limitkm) return;
        Axios.post(gb.backendIP+"ustawLimit", {
            limit: ust.limitkm
        }).then((r) => {
            console.log(r.data);
            setUst({response: false}); 
        }).catch((er) => console.log(er));
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    { ust.response ?
                    <div className="ustawieniaMain">
                        <div className="ustawieniaKol">
                            <h2>Wiadomość powitalna</h2>
                            <span>Górny tekst na stronie głównej:</span>
                            <textarea value={ust.msg} onChange={(e) => setUst({...ust, msg: e.target.value})} />
                            <button onClick={() => ustawMsg()}>Ustaw</button>
                        </div>
                        <div className="ustawieniaKol"><div className="slupeczek" /></div>
                        <div className="ustawieniaKol">
                            <h2>Dodawanie pieniędzy</h2>
                            <div>
                                <span>Użytkownik:</span>
                                <select placeholder="Użytkownik" value={ust.wybranyUzytkownik && ust.wybranyUzytkownik} onChange={(e) => setUst({...ust, wybranyUzytkownik: e.target.value})}>
                                    { ust.uzytkownicy.map((user) => {
                                        return <option value={user.id}>{user.login}</option>
                                    })}
                                </select>
                            </div>
                            <div>
                                <span>Kwota:</span>
                                <input type="number" value={ust.kwotaDod} step={0.01} placeholder={0.12} onChange={(e) => setUst({...ust, kwotaDod: e.target.value})}/>
                            </div>
                            <button onClick={() => dodajKwote()}>Dodaj</button>
                        </div>
                        <div className="ustawieniaKol"><div className="slupeczek" /></div>
                        <div className="ustawieniaKol">
                            <h2>Limit KM</h2>
                            <div>
                                <span>Wartość:</span>
                                <input type="number" step={1} value={ust.limitkm} onChange={(e) => setUst({...ust, limitkm: e.target.value})}/>
                            </div>
                            <button onClick={() => ustawLimit()}>Ustaw</button>
                        </div>
                    </div>
                    : initUstawienia() }
                </div>
            </div>
        </>
    );
};