import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import gb from "../GlobalVars";
import { HiArrowNarrowRight } from "react-icons/hi";
import { FaTimes, FaCheck, FaSistrix, FaShare, FaExpand, FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
export default function Trasy(props){
    const [ ostatnieTrasy, setOstatnieTrasy ] = useState({response: null});
    const [ daneTrasy, setDaneTrasy ] = useState({wyswietl: false, gra: null});
    const [ miasta, setMiasta ] = useState(null);
    const [ uzytkownicy, setUzytkownicy ] = useState({response: false});
    const [ typyNaczep, setTypyNaczep ] = useState(null);
    const [ promy, setPromy ] = useState(null);
    const [ historia, setHistoria ] = useState({wysun: false, dane: null, response: false});
    const { trasaID } = useParams();

    const dostanMiasta = () => {
        Axios.post(gb.backendIP+"miasta").then((res2) => {
            Axios.post(gb.backendIP+"typyNaczep").then((res3) => {
                Axios.post(gb.backendIP+"promy").then((res4) => {
                    setTypyNaczep(res3.data['dane']);
                    setMiasta(res2.data['dane']);
                    setPromy(res4.data['dane']);
                });
            })
        });
    };

    const dostanTrasy = () => {
        Axios.post(gb.backendIP+"dyspozytorTrasy").then((res) => {
            if(res.data['dane']){
                let trasy = res.data['dane'];
                setOstatnieTrasy({response: 1, dane: trasy});
            } else {
                setOstatnieTrasy({response: 1, dane: null});
            }
        }).catch((er) => {
            setOstatnieTrasy({response: 1, dane: null, blad: er.message});
        });
    };

    const sprawdzanieTrasy = (gra, daneinc) => {
        const dane = {...daneinc};
        if(daneinc){
            if(dane.zdj){
                dane.zdj = dane.zdj.split(" ");
            }
            let krajod;
            let krajdo;
            if(gra){
                krajod = miasta[dane.od][0];
                krajdo = miasta[dane.do][0];
            } else {
                krajod = miasta[dane.od][0];
                krajdo = miasta[dane.do][0];
            }
            Axios.post(gb.backendIP+"promyTrasy/"+dane.id).then((res) => {
                setDaneTrasy({wyswietl: true, ...dane, liczbapromow: res.data['dane'].ile, promy: res.data['dane'].promy, gra: gra ? 1 : 0, krajOd: krajod, krajDo: krajdo});
            });
        }
    };

    const dostanHistorie = () => {
        Axios.post(gb.backendIP+"dyspHistoria/").then((res) => {
            if(res.data['dane']){
                setHistoria({response: true, dane: res.data['dane'], wysun: false});
            } else {
                setHistoria({response: true, dane: null, wysun: false});
            }
        });
    };

    const zwrocTrasy = () => {
    if(uzytkownicy.response){
        if(trasaID && !daneTrasy.wyswietl){
                console.log("No kurwa podane");
                Axios.post(gb.backendIP+"trasaDane/"+trasaID).then((res2) => {
                    console.log(res2.data['dane']);
                    sprawdzanieTrasy(res2.data['dane']['gra'], res2.data['dane']);
                });
        }
        if(!trasaID && ostatnieTrasy.dane){
                return(
                    <>
                    <table className="ostatnieTrasy wejscieSmooth">
                        <tbody>
                            <tr><th>ID</th><th>Gra</th><th>Data</th><th>Lokalizacja</th><th>Ładunek</th><th>Kto oddał</th><th>Akcja</th></tr>
                            {ostatnieTrasy.dane.map((wiersz) => {
                                const skad = miasta[wiersz.od];
                                const dokad = miasta[wiersz.do];
                                const autor = uzytkownicy.dane.find(user => user.id === wiersz.kto).login;
                                return(
                                    <tr key={"trasa_"+wiersz.id}>
                                        <td>{wiersz.id}</td>
                                        <td>{wiersz.gra ? <img src={"/img/trasaats.png"}/> : <img src={"/img/trasaets.png"}/>}</td>
                                        <td>{new Date(wiersz.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - {new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long'})}</td>
                                        <td>
                                            {wiersz.gra ? <img title={skad[0]} className="flaga" src={"/img/flagi/usa.png"} /> : <img title={skad[0]} className="flaga" src={"/img/flagi/"+skad[0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} />}
                                            <b>{skad[1]}</b>
                                            <HiArrowNarrowRight />
                                            {wiersz.gra ? <img title={skad[0]} className="flaga" src={"/img/flagi/usa.png"} /> : <img title={dokad[0]} className="flaga" src={"/img/flagi/"+dokad[0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"} />}
                                            <b>{dokad[1]}</b>
                                        </td>
                                        <td>{wiersz.ladunek}</td>
                                        <td><a href={"/profil/"+autor}><img className="ktoOddal" src={"/img/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).awatar} />{autor}</a></td>
                                        <td><a onClick={() => sprawdzanieTrasy(wiersz.gra, wiersz)}>Rozpatrz</a></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </>
                )
            
        } else {
            if(ostatnieTrasy.blad){
                return(<>Wystąpił błąd! {ostatnieTrasy.blad}</>);
            } else {
                return(<>Aktualnie nie ma żadnej trasy oczekującej na rozpatrzenie.</>);
            }
        }
    } else {
        Axios.post(gb.backendIP+"listaUzytkownikow").then((res) => {
            setUzytkownicy({dane: res.data, response: true});
        });
    }
        
    };

    const odrzucanie = () => {
        return(
            <div className="akcjaDyspozytor wejscieSmooth">
                <span>Odrzucanie trasy nr {daneTrasy.id} użytkownika {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</span><br />
                <div>
                    <span>Powód:</span><br />
                    <textarea onChange={ (e) => setDaneTrasy({...daneTrasy, powododrzucenia: e.target.value})} />
                </div>
                <div>
                    <span>Zezwolić na poprawę trasy?</span>
                    <select value={daneTrasy.dozwolPoprawe ? daneTrasy.dozwolPoprawe : null} onChange={(e) => setDaneTrasy({...daneTrasy, dozwolPoprawe: e.target.value})}>
                        <option value={null} />
                        <option value="1">Tak</option>
                        <option value="0">Nie</option>
                    </select>
                </div>
                <br />
                <div>
                    <a onClick={() => setDaneTrasy({...daneTrasy, odrzucanie: false, powododrzucenia: null, dozwolPoprawe: null})}><FaShare /> Wróć</a>
                    <a onClick={() => decyzja(false)}><FaTimes /> Odrzuć</a>
                </div>
            </div>
        )
    };

    const zatwierdzanie = () => {
        return(
            <div className="akcjaDyspozytor wejscieSmooth">
                <span>Zatwierdzanie trasy nr {daneTrasy.id} użytkownika {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</span><br />
                { daneTrasy.uszkodzenia ?
                <>
                <div style={{textAlign: 'center'}}>
                    <span>W trasie wykryto uszkodzenia.</span><br />
                    <span>Możesz opcjonalnie nałożyć grzywnę.</span><br /><br />
                    <input type="number" step="0.01" placeholder="Wprowadź grzywnę" value={daneTrasy.nakladanaGrzywna ? daneTrasy.nakladanaGrzywna : ""} onChange={(e) => setDaneTrasy({...daneTrasy, nakladanaGrzywna: e.target.value})} />
                </div>
                <br />
                </>
                : ""}
                <br />
                <div>
                    <a onClick={() => setDaneTrasy({...daneTrasy, zatwierdzanie: false, nakladanaGrzywna: null})}><FaShare /> Wróć</a>
                    <a onClick={() => decyzja(true)}><FaCheck /> Zatwierdź</a>
                </div>
            </div>
        )
    };

    const decyzja = (jaka) => {
        let bodyData = {};
        if(jaka){
            //zatwierdzanie
            daneTrasy.nakladanaGrzywna ? bodyData.grzywna = daneTrasy.nakladanaGrzywna : bodyData.grzywna = 0;
            bodyData.zatwierdz = 1;
            bodyData.kto = daneTrasy.kto;
            bodyData.przejechane = daneTrasy.przejechane;
        } else {
            //odrzucanie
            bodyData.zatwierdz = 2;
            if(daneTrasy.dozwolPoprawe){
                if(daneTrasy.dozwolPoprawe == 0){
                    bodyData.dozwolpoprawe = 0;
                } else {
                    bodyData.dozwolpoprawe = 1;
                }
            } else {
                bodyData.dozwolpoprawe = 1;
            }
            if(daneTrasy.powododrzucenia) {
                bodyData.powod = daneTrasy.powododrzucenia;
            } else {
                bodyData.powod = "Nie podano.";
            }
        }
        console.log(bodyData);
        Axios.post(gb.backendIP+"rozpatrzenieTrasy/"+localStorage.getItem('token')+"/"+daneTrasy.id, {...bodyData}).then((res) => {
            if(res.data['odp']){
                setDaneTrasy({wyswietl: false});
                setOstatnieTrasy({response: null});
            }
        });
    };

    const pokazHistorie = () => {
        return(
            <div className="dyspHistoria wejscieSmooth">
                <table className="ostatnieTrasy">
                    <tbody>
                        <tr><th>ID Trasy</th><th>Dyspozytor</th><th>Data rozpatrzenia</th><th>Decyzja</th></tr>
                        {historia.dane ?
                        historia.dane.map((wiersz) => {
                            return(
                                <tr>
                                    <td><a href={"/dyspozytornia/"+wiersz.trasa}>{wiersz.trasa}</a></td>
                                    <td>
                                        <a href={"/profil/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).login}>
                                            <img className="ktoOddal" src={"/img/"+uzytkownicy.dane.find(user => user.id === wiersz.kto).awatar} /> 
                                            {uzytkownicy.dane.find(user => user.id === wiersz.kto).login}
                                        </a>
                                    </td>
                                    <td>{new Date(wiersz.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - {new Date(wiersz.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                    <td>{wiersz.akcja ? "Zaakceptowana" : "Odrzucona"}</td>
                                </tr>
                            )
                        })    
                        : <tr><td colSpan={4}>Brak danych...</td></tr>
                        }
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
                <div className="glowna" style={{minHeight: '500px'}}>
                    <div className="przegladajTrasy">
                        <h4>Następujące trasy czekają na rozpatrzenie</h4>
                        {ostatnieTrasy.response ? zwrocTrasy() : (miasta ? dostanTrasy() : dostanMiasta())}
                    </div>
                    {historia.response ? <div className="dyspHistoriaBtn" onClick={() => setHistoria({...historia, wysun: !historia.wysun})}>{historia.wysun ? <FaArrowAltCircleDown /> : <FaArrowAltCircleUp />} Historia</div> : dostanHistorie() }
                    {historia.wysun && pokazHistorie() }
                    <div className="customDysp">
                        <input type="number" min="1" step="1" placeholder="ID Trasy" id="customIdTrasy" />
                        <a onClick={() => { document.getElementById("customIdTrasy").value && window.location.assign("/dyspozytornia/"+document.getElementById("customIdTrasy").value); }}><FaSistrix /></a>
                    </div>
                </div>
                
            </div>
            {daneTrasy.wyswietl &&
                <div className="formularzTrasyScreen wejscieSmooth">
                    <div className="formularzTrasy">
                        { daneTrasy.pokazZdj && <div className="podgladZdj" style={{backgroundImage: `url(${daneTrasy.pokazZdj})`}} onClick={() => setDaneTrasy({...daneTrasy, pokazZdj: null})}/> }
                        { daneTrasy.odrzucanie && odrzucanie() }
                        { daneTrasy.zatwierdzanie && zatwierdzanie() }
                        <div className="trasaOpcje">
                            <a onClick={() => trasaID ? window.location.href = "/dyspozytornia": setDaneTrasy({wyswietl: false})}><FaShare /> Wróć</a>
                            <a onClick={() => setDaneTrasy({...daneTrasy, odrzucanie: true})}><FaTimes /> Odrzuć</a>
                            <a onClick={() => setDaneTrasy({...daneTrasy, zatwierdzanie: true})}><FaCheck /> Zatwierdź</a>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Data raportu</h3>
                                <span>{new Date(daneTrasy.kiedy).toLocaleString('pl-PL', {hour: '2-digit', minute: '2-digit'})} - { new Date(daneTrasy.kiedy).toLocaleString('pl-PL', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                            </div>
                            <div className="formularzDane">
                                <h3>Typ serwera</h3>
                                {daneTrasy.typserwera ? <span>TMP</span> : <span>SCS</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Typ zlecenia</h3>
                                {!daneTrasy.typzlecenia ? <span>Zlecenie z gry</span> : ((daneTrasy.typzlecenia === 2) ? <span>World of Trucks</span> : <span>Zlecenie generowane przez gracza</span>)}
                            </div>
                            <div className="formularzDane">
                                <h3>Gra</h3>
                                {daneTrasy.gra ? <span>American Truck Simulator</span> : <span>Euro Truck Simulator 2</span>}
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Ładunek</h3>
                                {daneTrasy.ladunek ? <span>{daneTrasy.ladunek}</span> : <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Typ naczepy</h3>
                                <span>{ typyNaczep.map((naczepki) => {if(naczepki.id === daneTrasy.naczepa) return naczepki.nazwa}) }</span>
                            </div>
                            <div className="formularzDane">
                                <h3>Rozpoczęcie trasy</h3>
                                <span>{daneTrasy.gra ? <img className="flaga" src="/img/flagi/usa.png" />
                                : <img className="flaga" src={"/img/flagi/"+miasta[daneTrasy.od][0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"}/>} 
                                {miasta[daneTrasy.od][0]}, {miasta[daneTrasy.od][1]}</span>
                            </div>
                            <div className="formularzDane">
                                <h3>Zakończenie trasy</h3>
                                <span>{daneTrasy.gra ? 
                                <img className="flaga" src="/img/flagi/usa.png" /> : 
                                <img className="flaga" src={"/img/flagi/"+miasta[daneTrasy.do][0].toLowerCase().replaceAll("ó", "o").replaceAll("ń", "n").replaceAll("ł", "l").replaceAll(" ", "").replaceAll("ś", "s").replaceAll("ę", "e").replaceAll("ż", "z").replaceAll("ą", "a").replaceAll("ź", "z").replaceAll("ć", "c")+".png"}/>} 
                                {miasta[daneTrasy.do][0]}, {miasta[daneTrasy.do][1]}</span>
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Masa ładunku</h3>
                                {daneTrasy.masaladunku ? <span>{daneTrasy.masaladunku.toLocaleString('pl-PL')} t</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Uszkodzenia</h3>
                                {daneTrasy.uszkodzenia ? <span>{daneTrasy.uszkodzenia.toLocaleString('pl-PL')}%</span>: <span>Brak uszkodzeń</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Wykorzystane paliwo</h3>
                                {daneTrasy.spalanie ? <span>{daneTrasy.spalanie.toLocaleString('pl-PL')} l</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Koszt tankowanego paliwa</h3>
                                {daneTrasy.paliwo !== undefined ? <span>{daneTrasy.paliwo.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</span>: <span>Nie podano.</span>}
                            </div>
                        </div>
                        <div className="formularzLinia">
                            <div className="formularzDane">
                                <h3>Pokonany dystans</h3>
                                {daneTrasy.przejechane ? <span>{daneTrasy.przejechane.toLocaleString('pl-PL')} km</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Prędkość maksymalna</h3>
                                {daneTrasy.vmax ? <span>{daneTrasy.vmax} km/h</span>: <span>Nie podano.</span>}
                            </div>
                            <div className="formularzDane">
                                <h3>Zarobek na zleceniu</h3>
                                {daneTrasy.zarobek ? <span>{daneTrasy.zarobek.toLocaleString('pl-PL', {style: 'currency', currency: 'PLN'})}</span>: <span>Nie podano.</span>}
                            </div>
                            { daneTrasy.promy ?
                            <div className="formularzDane">
                                <h3>Promy/pociągi</h3>
                                { daneTrasy.promy.map((prom, i) => { return <span>{promy.find((dostepnePromy) => dostepnePromy.id === prom).nazwa}</span> }) }
                            </div>
                            : "" }
                        </div>
                        <div className="formularzLinia">
                            { daneTrasy.komentarz ?
                            <div className="formularzDane">
                                <h3>Komentarz</h3>
                                <span>{daneTrasy.komentarz}</span>
                            </div>
                            : ""
                            }
                            <div className="formularzDane">
                                <h3>Zdjęcia</h3>
                                <div className="zdjeciaTrasy">
                                    { (!daneTrasy.zdj && !daneTrasy.noweZdj) && <span>Brak zdjęć</span>}
                                    { daneTrasy.zdj ? daneTrasy.zdj.map((zdj, i) => {
                                        return <div className="zdjecieTrasa" style={{backgroundImage: `url(${zdj})`}}>
                                            <FaExpand className="zdjecieTrasaPodglad" onClick={() => {
                                                setDaneTrasy({...daneTrasy, pokazZdj: zdj})
                                            }} />
                                        </div>
                                    }) : "" }
                                </div>
                            </div>
                            <div className="formularzDane">
                                <h3>Kierowca</h3>
                                <a href={"/profil/"+uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}><img src={"/img/"+uzytkownicy.dane.find(user => user.id === daneTrasy.kto).awatar} /> {uzytkownicy.dane.find(user => user.id === daneTrasy.kto).login}</a>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}