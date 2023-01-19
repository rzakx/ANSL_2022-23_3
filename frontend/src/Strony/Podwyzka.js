import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Podwyzka(props){
    const [wniosek, setWniosek] = useState({nowastawka: null, nowestanowisko: null, powod: null, rangi: null, blad: null});
    const [historia, setHistoria] = useState({dane: null, response: false});
    const initDane = () => {
        Axios.post(gb.backendIP+"rangi").then((r) => {
            Axios.post(gb.backendIP+"twojeAktDaneWniosek/"+localStorage.getItem('token')).then((r2) => {
                setWniosek({...wniosek, nowastawka: r2.data['aktstawka'], nowestanowisko: r2.data['aktstanowisko'], ...r2.data, rangi: r.data['dane']});
            });
        });
    };
    const initHistoria = () => {
        Axios.post(gb.backendIP+"historiaPodwyzek/"+localStorage.getItem('token')).then((r) => {
            setHistoria({dane: r.data['dane'], response: true});
        }).catch((er) => setHistoria({response: true, dane: null}));
    };

    const zlozWniosek = () => {
        if(!wniosek.powod){
            setWniosek({...wniosek, blad: "Nie podano powodu"});
            return;
        }
        if(!wniosek.nowastawka){
            setWniosek({...wniosek, blad: "Podaj stawkę, nawet jeśli nie wnioskujesz o inną!"});
            return;
        }
        if(!wniosek.nowestanowisko){
            setWniosek({...wniosek, blad: "Wybierz stanowisko, nawet jeśli nie wnioskujesz o inne!"});
            return;
        }
        Axios.post(gb.backendIP+"zlozWniosek/"+localStorage.getItem("token"), {
            aktstanowisko: wniosek.aktstanowisko,
            nowestanowisko: wniosek.nowestanowisko,
            aktstawka: wniosek.aktstawka,
            nowastawka: wniosek.nowastawka,
            powod: wniosek.powod
        }).then((r) => {
            console.log(r.data);
            setWniosek({nowastawka: null, nowestanowisko: null, powod: null, rangi: null, blad: null});
            setHistoria({dane: null, response: false});
        }).catch((err) => {
            setWniosek({nowastawka: null, nowestanowisko: null, powod: null, rangi: null, blad: "Wystapil blad podczas składania wniosku!"});
        });
    };

    const histBody = (dane) => {
        return(
            <div className="historiaWnioskow">
                <h4>Historia złożonych wniosków</h4>
                <table className="ostatnieTrasy">
                    <tbody>
                        <tr><th>Data</th><th>Stanowisko</th><th>Stawka</th><th>Status</th></tr>
                        { dane ? dane.map((wiersz) => {
                            let decyzja;
                            switch(wiersz.status){
                                case 1:
                                    decyzja = <td title={wiersz.powod} style={{color: '#2f2'}}>Zaakceptowano</td>;
                                    break;
                                case 0:
                                    decyzja = <td title={wiersz.powod} style={{color: 'crimson'}}>Odrzucono</td>;
                                    break;
                                case null:
                                    decyzja = <td style={{color: 'dodgerblue'}}>Oczekujący</td>;
                                    break;
                            }
                            return(
                                <tr>
                                    <td>{ new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                    <td>{wniosek.rangi[wiersz.aktstanowisko]} → {wniosek.rangi[wiersz.nowestanowisko]}</td>
                                    <td>{wiersz.aktstawka.toFixed(2)} → {wiersz.nowastawka.toFixed(2)}</td>
                                    {decyzja}
                                </tr>
                            )
                        }) : <tr><td rowSpan={4} colSpan={4}>Brak złożonych wniosków.</td></tr>}
                    </tbody>
                </table>
            </div>
        )
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                { wniosek.rangi ?
                <>
                    <div className="podwyzkiRow">
                        <div className="podwyzkiKol">
                            <div className="wniosek">
                                <h2>Formularz o podwyżkę</h2>
                                <div className="wniosekGora">
                                    <div className="wniosekGoraKol">
                                        <div>
                                            <span>Aktualne stanowisko:</span>
                                            <input type="text" value={wniosek.rangi[wniosek.aktstanowisko] + " (" + wniosek.aktstanowisko + ")"} disabled />
                                        </div>
                                        <div>
                                            <span>Wnioskowane stanowisko:</span>
                                            <select value={wniosek.nowestanowisko} onChange={(e) => setWniosek({...wniosek, nowestanowisko: e.target.value})}>
                                                { wniosek.rangi.map((ranga, idr) => {
                                                    if(ranga) return <option value={idr}>{ranga} ({idr})</option> 
                                                })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="wniosekGoraKol">
                                        <div>
                                            <span>Aktualna stawka:</span>
                                            <input type="text" value={wniosek.aktstawka.toFixed(2) + " zł/km"} disabled/>
                                        </div>
                                        <div>
                                            <span>Wnioskowana stawka:</span>
                                            <input type="number" step={0.01} min={0} value={wniosek.nowastawka} onChange={(e) => setWniosek({...wniosek, nowastawka: e.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="wniosekGoraKol">
                                        <div>
                                            <span>Powód:</span>
                                            <textarea
                                                placeholder="Pamiętaj, aby wnioskować o stanowisko i/lub stawkę adekwatną do twojego zaangażowania. Jeśli wnioskujesz tylko o jedno, drugą opcje wybierz taką jaką masz aktualnie ;)" 
                                                value={wniosek.powod && wniosek.powod}
                                                onChange={(e) => setWniosek({...wniosek, powod: e.target.value})}
                                            />
                                        </div>
                                        <button onClick={() => zlozWniosek()}>Złóż wniosek</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    { historia.response ? (historia.dane ? histBody(historia.dane) : histBody(null)) : initHistoria() }
                    </>
                : initDane()
                }
                </div>
            </div>
        </>
    );
};