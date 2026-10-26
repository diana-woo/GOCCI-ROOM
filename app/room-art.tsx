import type {CSSProperties} from "react";
export type FurnitureKind="bed"|"plant"|"chair"|"lamp"|"table"|"bear";
export type Furniture={id:string;kind:FurnitureKind;x:number;y:number};
export const furnitureNames:Record<FurnitureKind,string>={bed:"침대",plant:"화분",chair:"의자",lamp:"조명",table:"테이블",bear:"곰인형"};
export function Art({kind}: {kind:FurnitureKind}){
 const common={stroke:"#34302e",strokeWidth:3.4,strokeLinejoin:"round" as const,strokeLinecap:"round" as const};
 return <svg viewBox="0 0 100 100" aria-hidden="true" className="art">
 {kind==="bed"&&<g {...common}><path fill="#f4d5c4" d="M9 55 53 31 92 52 48 78Z"/><path fill="#fff9f4" d="M9 55v15l39 22V78Zm39 23v14l44-25V52Z"/><path fill="#fff" d="m20 50 31-17 27 15-30 18Z"/><path fill="#e9b6c2" d="m13 57 35 20 42-24-10-6-32 19-28-16Z"/><path fill="#fff" d="m20 48 17-10 15 9-18 10Z"/></g>}
 {kind==="plant"&&<g {...common}><path fill="#a4c8a0" d="M48 58Q16 38 28 20q24 3 20 38ZM50 60q-5-46 21-47 9 28-21 47ZM50 61q-29-20-37-4 13 18 37 4Z"/><path fill="#f0c4a4" d="M29 59h44l-7 29H36Z"/><path fill="none" d="M29 59q20 7 44 0"/></g>}
 {kind==="chair"&&<g {...common}><path fill="#e9b4a7" d="M23 20 57 9l5 47-34 13Z"/><path fill="#f7d7bf" d="m28 61 36-12 20 13-39 17-25-11Z"/><path fill="none" d="M28 69v19m18-9v13m34-26v19"/></g>}
 {kind==="lamp"&&<g {...common}><path fill="#f9e6b1" d="m30 38 12-26h24l12 26-16 10H44Z"/><path fill="none" d="M54 48v32M34 85q19-13 40 0Z"/><path fill="#e7b7a2" d="M34 85q19-13 40 0"/></g>}
 {kind==="table"&&<g {...common}><ellipse cx="50" cy="38" rx="38" ry="17" fill="#e8c9a7"/><path fill="#f6dcbc" d="M12 38v11q36 31 76 0V38Q50 70 12 38Z"/><path fill="none" d="M30 58v29m40-29v29"/></g>}
 {kind==="bear"&&<g {...common}><circle cx="27" cy="26" r="12" fill="#d8b79c"/><circle cx="72" cy="26" r="12" fill="#d8b79c"/><ellipse cx="50" cy="67" rx="29" ry="27" fill="#d8b79c"/><circle cx="50" cy="39" r="29" fill="#e8c8aa"/><circle cx="40" cy="39" r="2.5"/><circle cx="60" cy="39" r="2.5"/><ellipse cx="50" cy="49" rx="5" ry="4" fill="#41312d"/></g>}
 </svg>
}
export function Avatar({friend=false,style}: {friend?:boolean;style?:CSSProperties}){
 const ink="#211d1b";
 return <div className={"avatar "+(friend?"friend":"")} style={style} aria-label={friend?"하치와레":"치이카와"} role="img">
 <svg viewBox="0 0 120 135" aria-hidden="true">
 <g stroke={ink} strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round">
 {/* Tiny feet and stubby arms */}
 <path d="M35 98Q29 105 31 116Q33 123 43 121L51 114Q61 119 70 115L80 122Q91 125 93 115Q94 107 87 98" fill="#fff"/>
 <path d="M28 92Q14 91 14 102Q14 109 29 108M92 92Q106 91 106 102Q106 109 91 108" fill="#fff"/>
 {friend?<><path d="M20 52Q12 28 18 10Q20 5 26 11L45 31M76 31L96 10Q102 5 105 11Q112 29 101 52" fill="#fff"/><path d="m22 35 1-15 12 13m51 0 12-13 1 15" fill="#f6c6d0" strokeWidth="1.8"/></>:<><path d="M24 51Q9 43 15 29Q20 18 32 21Q43 24 45 38M75 38Q79 24 91 21Q103 18 108 29Q114 43 99 51" fill="#fff"/><path d="M23 40Q17 33 23 28Q31 23 37 35M83 35Q89 23 97 28Q103 33 97 40" fill="#f9cbd3" strokeWidth="1.8"/></>}
 {/* Main head, near-round and slightly squashed, like the provided reference */}
 <path d="M9 70Q9 41 32 34Q58 25 83 33Q110 39 111 69Q113 96 93 106Q76 115 58 113Q35 115 20 103Q8 92 9 70Z" fill="#fff"/>
 {friend&&<path d="M12 59Q17 39 37 34Q51 29 60 32Q74 28 87 35Q104 40 108 59Q92 57 84 46Q81 42 79 42Q74 57 61 59Q49 57 41 43Q30 56 12 59Z" fill="#a6d8ef" stroke="none"/>}
 <ellipse cx="43" cy="74" rx="2.9" ry="3.5" fill={ink} stroke="none"/>
 <ellipse cx="78" cy="74" rx="2.9" ry="3.5" fill={ink} stroke="none"/>
 <ellipse cx="28" cy="84" rx="8.2" ry="5.3" fill="#f4a4b7" stroke="none" opacity=".85"/>
 <ellipse cx="93" cy="84" rx="8.2" ry="5.3" fill="#f4a4b7" stroke="none" opacity=".85"/>
 <path d="M57 81Q60 84 63 81" fill="none" strokeWidth="2.2"/>
 <path d="M54 87Q60 95 66 87" fill="none" strokeWidth="2.2"/>
 </g>
 </svg></div>
}