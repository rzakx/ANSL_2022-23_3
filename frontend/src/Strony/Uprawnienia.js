import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Uprawnienia(props){
    const [historia, setHistoria] = useState({response: null, dane: null, usuwane: false});
    const [nazwyupr, setNazwyupr] = useState({response: null, dane: null});
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false});
    const [ dodawane, setDodawane ] = useState({kto: null, naco: null, odkiedy: new Date(), dokiedy: null, cena: null});

    const dostanHistorie = () => {
        Axios.post(gb.backendIP+"uprHistoria").then((r) => {
            Axios.post(gb.backendIP+"listaUzytkownikow").then((r2) => {
                Axios.post(gb.backendIP+"uprawnienia").then((r3) => {
                    setUzytkownicy({dane: r2.data, response: true});
                    setHistoria({response: true, dane: r.data['dane'], usuwane: null});
                    setNazwyupr({response: true, dane: r3.data});
                });
            });
        });
    };

    const usunUpr = (id, potwierdzone) => {
        if(potwierdzone){
            Axios.post(gb.backendIP+"usunUpr/"+id).then((r) => {
                if(r.data['odp'] == "usunieto"){
                    setHistoria({...historia, response: null, usuwane: null});
                }
            });
        } else {
            setHistoria({...historia, usuwane: id});
        }
    };

    const nadajUpr = () => {
        if(dodawane.kto && dodawane.naco && dodawane.dokiedy && dodawane.cena){
            Axios.post(gb.backendIP+"dodajUpr/"+localStorage.getItem('token'), {
                kto: dodawane.kto,
                cena: dodawane.cena,
                dokiedy: dodawane.dokiedy,
                naco: dodawane.naco
            }).then((res) => {
                if(res.data['odp'] == "ok"){
                    setDodawane({kto: null, naco: null, odkiedy: new Date(), dokiedy: null, cena: null});
                    setHistoria({response: null, dane: null, usuwane: false});
                }
            });
        }
        console.log(dodawane);
    };

    const wyswietlHistorie = () => {
        return(
            <table className="ostatnieTrasy uprTable wejscieSmooth">
                { historia.usuwane && <div className="overlay zabluruj" />}
                <tbody>
                    <tr><th>ID</th><th>Posiadacz</th><th>Uprawnienie</th><th>Cena</th><th>Nadane</th><th>Ważność</th><th>Akcja</th></tr>
                    { historia.dane.map((wiersz) => {
                        const nazwaUpr = nazwyupr.dane.find(upr => upr.id === wiersz.naco).nazwa;
                        const kierowca = uzytkownicy.dane.find(user => user.id === wiersz.kto).login;
                        return(
                            <tr>
                                <td>{wiersz.id}</td>
                                <td><a href={"/profil/"+kierowca}><img className="ktoOddal" src={"/img/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).awatar} />{kierowca}</a></td>
                                <td>{nazwaUpr ? nazwaUpr : "???"}</td>
                                <td>{wiersz.cena.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</td>
                                <td>{new Date(wiersz.odkiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                                <td>{new Date(wiersz.dokiedy).toLocaleString('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                                <td><a onClick={() => { usunUpr(wiersz.id, false); setHistoria({...historia, usuwane: wiersz.id}); }}>Usuń</a></td>
                            </tr>
                        )
                    })}
                    <tr>
                        <td></td>
                        <td><select value={dodawane.kto ? dodawane.kto : null} onChange={(e) => setDodawane({...dodawane, kto: e.target.value})}>
                            <option value={null}>Kierowca</option>
                            {uzytkownicy.dane.map((user) => {
                                return(
                                    <option value={user.id}>{user.login}</option>
                                )
                            })}    
                        </select></td>
                        <td><select value={dodawane.naco ? dodawane.naco : null} onChange={(e) => setDodawane({...dodawane, naco: e.target.value})}>
                            <option value={null}>Uprawnienie</option>
                            {nazwyupr.dane.map((upr) => {
                                return(
                                    <option value={upr.id}>{upr.nazwa}</option>
                                )
                            })}
                        </select></td>
                        <td><input type="number" step="0.01" value={dodawane.cena ? dodawane.cena : null} placeholder="0,00 zł" onChange={(e) => setDodawane({...dodawane, cena: e.target.value})} /></td>
                        <td></td>
                        <td><input type="date" value={dodawane.dokiedy ? dodawane.dokiedy : null} onChange={(e) => setDodawane({...dodawane, dokiedy: e.target.value})} /></td>
                        <td><a onClick={ nadajUpr }>Dodaj</a></td>
                    </tr>
                </tbody>
            </table>
        )
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    { historia.response ? (historia.dane ? wyswietlHistorie() : <span>Brak danych</span>) : dostanHistorie()}    
                </div>
                { historia.usuwane ?
                    <div className="komunikat wejscieSmooth">
                        Czy napewno chcesz usunąć uprawnienie {historia.usuwane}?
                        <div>
                            <a onClick={() => usunUpr(historia.usuwane, true)}>Tak</a>
                            <a onClick={() => setHistoria({...historia, usuwane: null})}>Nie</a>
                        </div>
                    </div>
                    : "" }
            </div>
            
        </>
    );
}