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
 const outline={stroke:"#302b2c",strokeWidth:3.1,strokeLinejoin:"round" as const,strokeLinecap:"round" as const};
 return <div className={"avatar "+(friend?"friend":"")} style={style} aria-label={friend?"하치와레 캐릭터":"치이카와 캐릭터"} role="img">
 <svg viewBox="0 0 120 130" aria-hidden="true">
  <g {...outline}>
   {/* Rounded little body and short feet */}
   <path d="M36 94Q22 108 32 119Q44 124 50 113L70 113Q79 126 90 118Q101 109 85 94" fill="#fff"/>
   <path d="M26 92Q9 97 13 108Q17 116 31 104M94 91Q111 95 107 106Q103 114 92 105" fill="#fff"/>
   {friend?<><path d="M21 52Q6 23 18 8Q31 0 43 26M77 27Q91 0 104 9Q114 24 99 54" fill="#fff"/><path d="M23 42Q12 20 21 16Q29 12 38 32M82 33Q94 13 101 18Q105 25 96 43" fill="#f4bfd0"/></>:<><path d="M23 49Q9 19 21 11Q36 4 44 32M76 32Q88 5 102 11Q112 21 98 49" fill="#fff"/><path d="M26 38Q18 22 23 20Q30 17 37 35M83 35Q94 16 100 21Q104 27 95 40" fill="#f6c5d0"/></>}
   <path d="M10 67Q8 30 56 28Q111 26 111 70Q112 106 62 109Q12 110 10 67Z" fill="#fff"/>
   {friend&&<path d="M13 54Q17 29 40 30Q50 34 59 47Q68 33 84 29Q107 35 109 54L96 53Q87 45 77 52Q68 61 60 66Q50 58 41 52Q30 45 22 55Z" fill="#9ecbe3" stroke="none"/>}
   <ellipse cx="42" cy="70" rx="3.4" ry="4.4" fill="#292529" stroke="none"/>
   <ellipse cx="79" cy="70" rx="3.4" ry="4.4" fill="#292529" stroke="none"/>
   <path d="M57 79Q60 82 63 79M55 85Q60 91 65 85" fill="none" strokeWidth="2.5"/>
   <ellipse cx="27" cy="83" rx="10" ry="6" fill="#f9b8c5" stroke="none" opacity=".88"/>
   <ellipse cx="94" cy="83" rx="10" ry="6" fill="#f9b8c5" stroke="none" opacity=".88"/>
   {friend&&<path d="M56 90q4 5 8 0" strokeWidth="2" fill="none"/>}
  </g>
 </svg></div>
}