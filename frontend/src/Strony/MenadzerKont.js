import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FaUserCheck, FaUserTimes, FaUserClock, FaRedoAlt } from "react-icons/fa";
export default function MenadzerKont(props){
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false, zarzadzaj: false, wniosek: false});
    const [ podwyzki, setPodwyzki ] = useState({response: false, dane: null});
    const [ zmianyProfil, setZmianyProfil ] = useState(null);
    const [ rangi, setRangi ] = useState({response: false, dane: null});
    const { kontoID } = useParams();

    const obejscieTlo = (c) => { return {backgroundImage: `url('${c}')`}};
    
    const zaktualizujProfil = (idosoby) => {
        console.log(idosoby, zmianyProfil);
        const k = new Date(zmianyProfil.datadolaczenia);
        k.setHours(k.getHours() + 1);
        const czas = k.toISOString().slice(0, 19).replace("T", " ");
        Axios.post(gb.backendIP+"/administrujProfil/"+localStorage.getItem('token'), {
            idosoby: idosoby,
            login: zmianyProfil.login,
            stawka: zmianyProfil.stawka,
            garaz: zmianyProfil.garaz,
            truck: zmianyProfil.truck,
            typkonta: zmianyProfil.typkonta,
            steam: zmianyProfil.steam,
            truckbook: zmianyProfil.truckbook,
            truckersmp: zmianyProfil.truckersmp,
            discord: zmianyProfil.discord,
            datadolaczenia: czas
        }).then((r) => {
            console.log(r.data);
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
            setZmianyProfil(null);
        }).catch(() => {
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
            setZmianyProfil(null);
        });
    };

    const potwierdzenieUsuwania = (idosoby) => {
        console.log("Usuwam profil", zmianyProfil.login);
        Axios.post(gb.backendIP+"/usunKonto/"+localStorage.getItem('token'), {idosoby: idosoby}).then((r) => {
            console.log(r.data)
            setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
        }).catch(() => setUzytkownicy({response: false, zarzadzaj: false, wniosek: false}));
    };

    const zarzadzajKontem = (idtypa) => {
        console.log('zarzadzajKontem:', zmianyProfil);
        return(
            <div className="administrowanieKonta wejscieSmooth">
                <div className="administrowanieKol">
                    <span>Awatar:</span>
                    <div className="administrowanieKontaAwatar" style={obejscieTlo('/img/'+zmianyProfil.awatar)} />
                </div>
                <div className="administrowanieKol">
                   <div>
                        <span>Login:</span>
                        <input type="text" value={zmianyProfil.login} onChange={(e) => setZmianyProfil({...zmianyProfil, login: e.target.value})}/>
                    </div>
                    <div>
                        <span>Dołączył dnia:</span>
                        <input type="datetime-local" value={zmianyProfil.datadolaczenia} onChange={(e) => setZmianyProfil({...zmianyProfil, datadolaczenia: e.target.value})}/>
                    </div>
                    <div>
                        <span>Ranga:</span>
                        <select value={zmianyProfil.typkonta} onChange={(e) => setZmianyProfil({...zmianyProfil, typkonta: e.target.value})}>
                            {rangi.dane.map((ranga, idr) => {
                                if(ranga) return <option value={idr}>{ranga}</option>
                            })}
                        </select>
                    </div>
                    <div>
                        <span>Stawka za km:</span>
                        <input type="number" step={0.01} value={zmianyProfil.stawka} min={0} onChange={(e) => setZmianyProfil({...zmianyProfil, stawka: e.target.value})}/>
                    </div>
                    <div>
                        <span>Discord ID:</span>
                        <input type="number" step={1} value={zmianyProfil.discord} onChange={(e) => setZmianyProfil({...zmianyProfil, discord: e.target.value})} />
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>Garaż:</span>
                        <input type="text" value={zmianyProfil.garaz} onChange={(e) => setZmianyProfil({...zmianyProfil, garaz: e.target.value})} />
                    </div>
                    <div>
                        <span>Pojazd:</span>
                        <input type="text" value={zmianyProfil.truck} onChange={(e) => setZmianyProfil({...zmianyProfil, truck: e.target.value})} />
                    </div>
                    <div>
                        <span>Steam:</span>
                        <input type="url" value={zmianyProfil.steam} onChange={(e) => setZmianyProfil({...zmianyProfil, steam: e.target.value})} />
                    </div>
                    <div>
                        <span>TruckBook:</span>
                        <input type="url" value={zmianyProfil.truckbook} onChange={(e) => setZmianyProfil({...zmianyProfil, truckbook: e.target.value})} />
                    </div>
                    <div>
                        <span>TruckersMP:</span>
                        <input type="url" value={zmianyProfil.truckersmp} onChange={(e) => setZmianyProfil({...zmianyProfil, truckersmp: e.target.value})} />
                    </div>
                </div>
                <div className="administrowanieOpcje">
                    <button onClick={() => { setZmianyProfil(null); setUzytkownicy({...uzytkownicy, zarzadzaj: false})}}>Anuluj</button>
                    <button onClick={() => setZmianyProfil({...zmianyProfil, usuwanie: true})}>Usuń konto</button>
                    <button onClick={() => zaktualizujProfil(idtypa)}>Zapisz zmiany</button>
                </div>
                {zmianyProfil.usuwanie && <div className="potwierdzenieUsuwania wejscieSmooth">
                    <span>Czy napewno chcesz usunąć konto <b>{zmianyProfil.login}</b>?</span>
                    <div>
                        <button onClick={() => setZmianyProfil({...zmianyProfil, usuwanie: false})}>Anuluj</button><button onClick={() => potwierdzenieUsuwania(idtypa)}>Potwierdź</button>
                    </div>
                </div>
                }
            </div>
        )
    };

    const dostanDane = (idtypa) => {
        const daneU = uzytkownicy.dane.filter(u => u.id === idtypa)[0];
        setZmianyProfil({...daneU});
    };

    const dostanPodwyzki = () => {
        Axios.post(gb.backendIP+"listaPodwyzek").then((r) => {
            setPodwyzki({dane: r.data, response: true});
        });
    };

    const dostanKonta = () => {
        //i rangi
        Axios.post(gb.backendIP+"listaUzytkownikow").then((r2) => {
            Axios.post(gb.backendIP+"rangi").then((r3) => {
                setUzytkownicy({dane: r2.data, response: true});
                setRangi({dane: r3.data['dane'], response: true});
            });
        });
    };

    const wniosekDecyzja = (idwniosku, czyAkcept) => {
        if(czyAkcept) {
            Axios.post(gb.backendIP+"podwyzkaAkcept/"+localStorage.getItem('token'), {
                idwniosku: idwniosku,
                idwnioskujacego: podwyzki.dane.find(p => p.id === idwniosku).ktozlozyl,
                stawka: podwyzki.dane.find(p => p.id === idwniosku).nowastawka,
                typkonta: podwyzki.dane.find(p => p.id === idwniosku).nowestanowisko
            }).then((r) => {
                console.log(r.data);
            });
        } else {
            Axios.post(gb.backendIP+"podwyzkaOdrzuc/"+localStorage.getItem('token'), {
                idwniosku: idwniosku,
                powod: uzytkownicy.wniosekpowod
            }).then((r) => {
                console.log(r.data);
            });
        }
        setUzytkownicy({response: false, zarzadzaj: false, wniosek: false});
        setPodwyzki({response: false, dane: null});
    }

    const rozpatrzPodwyzke = (idosoby) => {
        const info = podwyzki.dane.find(tmp => tmp.ktozlozyl === idosoby);
        console.log(info);
        const akttypkonta = uzytkownicy.dane.find(u => u.id === info.ktozlozyl).typkonta;
        const aktstanowisko = rangi.dane[akttypkonta] + " (" + akttypkonta + ")";
        const nowestanowisko = rangi.dane[info.nowestanowisko] + " (" + info.nowestanowisko + ")";
        return(
            <div className="administrowanieKonta wejscieSmooth">
                <div className="administrowanieKol">
                    <div>
                        <span>ID wniosku: <b>{info.id}</b></span>
                    </div>
                    <div>
                        <span>Wnioskujący:</span>
                        <input type="text" value={uzytkownicy.dane.find(u => u.id === info.ktozlozyl).login} disabled/>
                    </div>
                    <div>
                        <span>Data złożenia:</span>
                        <input type="date" value={info.kiedy} disabled />
                    </div>
                    <div>
                        <span>Aktualne stanowisko:</span>
                        <input type="text" value={aktstanowisko} disabled />
                    </div>
                    <div>
                        <span>Aktualna stawka:</span>
                        <input type="text" value={info.aktstawka.toFixed(2)+" zł/km"} disabled />
                    </div>
                </div>
                <div className="administrowanieKol">
                    <div>
                        <span>Wnioskowane stanowisko:</span>
                        <input type="text" value={nowestanowisko} disabled />
                    </div>
                    <div>
                        <span>Wnioskowana stawka:</span>
                        <input type="text" value={info.nowastawka.toFixed(2)+" zł/km"} disabled />
                    </div>
                    <div>
                        <span>Powód:</span><br />
                        <textarea value={info.powod} disabled/>
                    </div>
                </div>
                <div className="administrowanieOpcje">
                    <button onClick={() => { setUzytkownicy({...uzytkownicy, wniosek: false})}}>Cofnij</button>
                    <button onClick={() => setUzytkownicy({...uzytkownicy, wniosekodrzuc: true})}>Odrzuć</button>
                    <button onClick={() => wniosekDecyzja(info.id, true)}>Zaakceptuj</button>
                </div>
                {uzytkownicy.wniosekodrzuc && <div className="potwierdzenieUsuwania wejscieSmooth">
                    <span>Podaj powód odrzucenia wniosku.</span>
                    <textarea value={uzytkownicy.wniosekpowod} onChange={(e) => setUzytkownicy({...uzytkownicy, wniosekpowod: e.target.value})} />
                    <div>
                        <button onClick={() => setUzytkownicy({...uzytkownicy, wniosekodrzuc: false})}>Anuluj</button><button onClick={() => wniosekDecyzja(info.id, false)}>Odrzuć wniosek</button>
                    </div>
                </div>
                }
            </div>
        );
    };

    const zwrocKonta = () => {
        return (
            <>
                <table className="ostatnieTrasy wejscieSmooth">
                <tbody>
                    <tr><th>#</th><th>Kierowca</th><th>Dołączył</th><th>Ranga</th><th>Stawka</th><th>Akcja</th></tr>
                    { uzytkownicy.dane.map((user) => {
                        return (
                            <tr key={"user_" + user.id}>
                                <td>{user.id}</td>
                                <td>
                                    <a href={"/profil/" + user.login}>
                                        <img className="ktoOddal" src={"/img/" + user.awatar} /> 
                                        {user.login}
                                    </a>
                                    {podwyzki.dane && (podwyzki.dane.find(tmp => tmp.ktozlozyl === user.id) && <span className="menadzerPodwyzkaBtn" onClick={() => setUzytkownicy({...uzytkownicy, wniosek: user.id})}>Wniosek o podwyżkę!</span>)}
                                </td>
                                <td>{new Date(user.datadolaczenia).toLocaleString("pl-PL", {day: "2-digit", month: "long", year: "numeric"})}</td>
                                <td>{user.ranga}</td>
                                <td>{user.stawka.toFixed(2)} zł / km</td>
                                <td><a onClick={() => { setUzytkownicy({...uzytkownicy, zarzadzaj: user.id}) }}>Zarządzaj</a></td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
                {!podwyzki.response && dostanPodwyzki() }
            </>
        );
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <div className="przegladajTrasy przegladajUzytkownikow">
                        {uzytkownicy.response ? zwrocKonta() : dostanKonta() }
                    </div>
                    { uzytkownicy.zarzadzaj && (zmianyProfil ? zarzadzajKontem(uzytkownicy.zarzadzaj) : dostanDane(uzytkownicy.zarzadzaj)) }
                    { uzytkownicy.wniosek && rozpatrzPodwyzke(uzytkownicy.wniosek) }
                </div>
            </div>
        </>
    );
}