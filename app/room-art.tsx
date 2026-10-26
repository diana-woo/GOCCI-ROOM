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
 const ink="#4a3d38";
 return <div className={"avatar "+(friend?"friend":"")} style={style} aria-label={friend?"하치와레":"치이카와"} role="img">
 <svg viewBox="0 0 140 145" aria-hidden="true">
  <g stroke={ink} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
   {/* Short pear-shaped body and tiny limbs */}
   <path d="M48 102Q38 104 34 119Q30 134 44 137Q55 138 59 128Q72 132 82 128Q88 139 100 136Q114 132 105 116Q101 106 92 102Z" fill="#fff"/>
   <path d="M37 111Q22 104 19 116Q18 126 35 127M103 111Q119 104 122 116Q123 127 106 127" fill="#fff"/>
   {friend?
    <><path d="M23 53Q13 29 17 9Q18 3 24 8L52 30M88 29L117 7Q124 3 124 14Q124 38 115 56" fill="#a9d8ed"/><path d="M25 38L24 18 43 33M97 33L116 18 114 40" fill="#f9b7c5" strokeWidth="1.8"/></>:
    <><path d="M23 54Q9 43 14 30Q18 16 31 17Q44 19 49 37M91 38Q97 19 109 17Q124 16 127 31Q129 43 115 54" fill="#fff"/><path d="M23 42Q18 35 23 29Q31 22 40 35M100 35Q109 22 117 29Q122 35 117 42" fill="#f9c4cd" strokeWidth="1.7"/></>}
   <path d="M12 76Q11 43 40 34Q69 23 100 34Q128 42 128 77Q127 111 92 117Q69 122 44 117Q12 111 12 76Z" fill="#fff"/>
   {friend&&<path d="M15 64Q16 42 41 35Q58 30 69 32Q83 28 101 35Q121 43 125 64Q110 62 100 54Q94 49 89 45Q85 62 72 67Q65 69 60 64Q50 56 49 45Q36 60 15 64Z" fill="#acd9ee" stroke="none"/>}
   <ellipse cx="48" cy="81" rx="3.3" ry="4.3" fill={ink} stroke="none"/>
   <ellipse cx="91" cy="81" rx="3.3" ry="4.3" fill={ink} stroke="none"/>
   <ellipse cx="31" cy="91" rx="10.5" ry="5.3" fill="#f7b6c6" stroke="none" opacity=".8"/>
   <ellipse cx="108" cy="91" rx="10.5" ry="5.3" fill="#f7b6c6" stroke="none" opacity=".8"/>
   <path d="M66 88Q69 91 72 88" fill="none" strokeWidth="2"/>
   <path d="M63 96Q69 101 76 96" fill="none" strokeWidth="2.1"/>
   <path d="M52 114Q56 121 59 126M88 114Q84 121 82 126" fill="none" strokeWidth="2"/>
  </g>
 </svg></div>
}