import Nawigacja from "../Komponenty/Nawigacja";
import { useState } from "react";
import Axios from "axios";
import gb from "../GlobalVars";
export default function Ranking(props){
    const dateObj = new Date();
    const [ odswiezyc, setOdswiezyc ] = useState(1);
    const lastMonth = dateObj.toISOString().split('T')[0].slice(0,-3);
    const [ miesiacRok, setMiesiacRok ] = useState(lastMonth);
    const [ dane, setDane ] = useState(null);
    const [ coSortowac, setCoSortowac ] = useState('przejechane');
    const [ jakSortowac, setJakSortowac ] = useState(false); //true ASC false DESC
    document.title = "The Boss Spedition - Ranking "+new Date(miesiacRok).toLocaleString('pl-PL', {month: 'long', year: 'numeric'});
    
    const odswiezDane = () => {
        Axios.post(gb.backendIP+"ranking/"+miesiacRok).then((res) => {
            if(!res.data['blad']){
                setDane(res.data['dane']);
            } else {
                setDane(null);
            }
        }).catch((er) => console.log(er));
        setOdswiezyc(0);
    };

    const przygotujSort = (poczym) => {
        if(coSortowac === poczym){
            setJakSortowac(!jakSortowac);
        } else {
            setCoSortowac(poczym);
		}
    };

    const zwrocDane = () => {
        if(dane){
            let tmpDane = dane.sort((a, b) => {
				if(coSortowac){
                    if(coSortowac){
                        if(jakSortowac){
                            return a[coSortowac] - b[coSortowac];
                        } else {
                            return b[coSortowac] - a[coSortowac];
                        }
                    }
				}
            });
            return(
                <>
                    <table className="rankingTable wejscieSmooth">
                        <thead>
                        <tr>
                            <th>Użytkownik</th>
                            <th className={(coSortowac === 'przejechane') ? (jakSortowac ? "rosnacySort" : "malejacySort") : ""} onClick={() => przygotujSort('przejechane')}>Przejechane</th>
                            <th className={(coSortowac === 'tonaz') ? (jakSortowac ? "rosnacySort" : "malejacySort") : ""} onClick={() => przygotujSort('tonaz')}>Tonaż</th>
                            <th className={(coSortowac === 'tras') ? (jakSortowac ? "rosnacySort" : "malejacySort") : ""} onClick={() => przygotujSort('tras')}>Ilość tras</th>
                            <th className={(coSortowac === 'spalanie') ? (jakSortowac ? "rosnacySort" : "malejacySort") : ""} onClick={() => przygotujSort('spalanie')}>Śr. Spalanie</th>
                            <th className={(coSortowac === 'zarobek') ? (jakSortowac ? "rosnacySort" : "malejacySort") : ""} onClick={() => przygotujSort('zarobek')}>Zarobek</th>
                            <th title="Bez uwzględniania kar!" className={(coSortowac === 'wlasnyzarobek') ? (jakSortowac ? "rosnacySort" : "malejacySort") : ""} onClick={() => przygotujSort('wlasnyzarobek')}>Własny zarobek</th>
                        </tr>
                        </thead>
                        <tbody>
                        { tmpDane.map(rekord => {
                            return(
                            <tr key={"dane_"+rekord.id} className={(rekord.login === localStorage.getItem('login')) ? "twojestaty" : ""}>
                                <td><a href={"/profil/"+rekord.login}><img src={"img/"+rekord.awatar} />{rekord.login}</a></td>
                                <td>{rekord.przejechane.toLocaleString()} km</td>
                                <td>{rekord.tonaz.toLocaleString("pl-PL")}</td>
                                <td>{rekord.tras.toLocaleString("pl-PL")}</td>
                                <td>{rekord.spalanie.toFixed(1).toLocaleString()} l / 100 km</td>
                                <td>{rekord.zarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</td>
                                <td title="Bez uwzględniania kar!">{rekord.wlasnyzarobek.toLocaleString('pl-PL', {style: 'currency', currency: "PLN"})}</td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </>
            );
        }
    };

    return(
        <>
            <Nawigacja />
            <div className="tlo" />
			<div className="srodekekranu">
                <div className="glowna">
                    <input type="month" className="rankingMiesiac" min="2021-03" value={miesiacRok} max={lastMonth} onChange={(e) => {
                        e.preventDefault();
                        setMiesiacRok(e.target.value);
                        setOdswiezyc(1);
                    }}
                    placeholder={lastMonth}/>
                    { (miesiacRok && odswiezyc) ? odswiezDane() : "" }
                    { (dane && coSortowac) ? zwrocDane() : <p className="wejscieSmooth" style={{width: '100%', textAlign: 'center', padding: '30px', fontSize: '1.1rem'}}>Brak danych!</p>}
                </div>
            </div>
        </>
    );
}