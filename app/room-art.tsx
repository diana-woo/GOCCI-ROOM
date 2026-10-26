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
export const characterKinds = ["chiikawa", "hachiware", "usagi"] as const;
export type CharacterKind = (typeof characterKinds)[number];
export const characterNames: Record<CharacterKind, string> = {
  chiikawa: "치이카와",
  hachiware: "하치와레",
  usagi: "우사기",
};
export const moods = ["happy", "shy", "surprised", "sleepy"] as const;
export type Mood = (typeof moods)[number];
export const moodNames: Record<Mood, string> = {
  happy: "방긋",
  shy: "수줍",
  surprised: "깜짝",
  sleepy: "꾸벅",
};

export function isCharacter(value: unknown): value is CharacterKind {
  return typeof value === "string" && characterKinds.some((kind) => kind === value);
}
export function isMood(value: unknown): value is Mood {
  return typeof value === "string" && moods.some((mood) => mood === value);
}

/** Original hand-drawn SVG illustrations. No external character images are loaded. */
export function Avatar({
  friend = false,
  kind,
  mood = "happy",
  style,
}: {
  friend?: boolean;
  kind?: CharacterKind;
  mood?: Mood;
  style?: CSSProperties;
}) {
  const who = kind ?? (friend ? "hachiware" : "chiikawa");
  const yellow = who === "usagi";
  const blue = who === "hachiware";
  const ink = "#282321";
  const fur = yellow ? "#fff1ad" : "#fffefb";
  const eyeY = mood === "sleepy" ? 84 : 82;
  return (
    <div className={"avatar " + (friend ? "friend" : "")} style={style} role="img"
      aria-label={characterNames[who] + " " + moodNames[mood]}>
      <svg viewBox="0 0 140 144" aria-hidden="true">
        <g stroke={ink} strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round">
          {/* Silly tiny paws, tucked behind an oversized round head */}
          <path d="M30 95Q12 91 13 107Q16 119 36 109M108 96Q126 92 128 107Q127 119 105 109" fill={fur}/>
          <path d="M36 107Q27 116 33 127Q38 134 48 128L57 119Q70 124 81 119L90 130Q101 134 106 125Q110 114 100 107" fill={fur}/>
          {yellow ? (
            <>
              <path d="M36 46Q22 12 33 7Q43 0 54 40M89 39Q98 0 111 7Q122 13 105 48" fill={fur}/>
              <path d="M36 35Q30 16 37 15Q43 15 47 37M97 37Q105 13 111 16Q114 19 105 38" fill="#f7bbbc" strokeWidth="1.5"/>
            </>
          ) : blue ? (
            <>
              <path d="M25 52 17 12Q16 6 23 11L49 34M91 34 117 11Q123 6 123 13L116 53" fill={fur}/>
              <path d="m25 40-3-19 16 17m66 0 14-17-3 19" fill="#f7bbc8" strokeWidth="1.7"/>
            </>
          ) : (
            <>
              <path d="M27 50Q12 40 17 26Q22 14 36 20Q47 25 49 37M91 37Q93 25 105 20Q120 14 125 27Q130 40 115 50" fill={fur}/>
              <path d="M26 38Q20 31 26 27Q34 23 42 36M98 36Q105 23 114 27Q119 32 114 39" fill="#f8c8cf" strokeWidth="1.6"/>
            </>
          )}
          {/* One imperfect rounded face: the head is nearly the entire body */}
          <path d="M12 79Q9 47 36 36Q64 27 91 35Q121 42 126 73Q130 104 105 116Q87 125 69 123Q47 125 28 115Q12 106 12 79Z" fill={fur}/>
          {blue && (
            <path d="M15 68Q17 47 38 38Q51 32 69 34Q87 31 103 39Q120 48 123 69Q109 67 96 56Q91 51 87 45Q84 59 72 64Q65 67 60 63Q48 57 46 45Q34 63 15 68Z"
              fill="#a8d8ef" stroke="none"/>
          )}
          {/* Side cheeks, tiny dot eyes and intentionally simple mouth */}
          <ellipse cx="34" cy="94" rx="9" ry="6" fill="#f4a7b5" opacity=".88" stroke="none"/>
          <ellipse cx="106" cy="94" rx="9" ry="6" fill="#f4a7b5" opacity=".88" stroke="none"/>
          {mood === "sleepy" ? (
            <>
              <path d="M46 83q6 5 12 0M83 83q6 5 12 0" fill="none" strokeWidth="2.6"/>
              <path d="M66 100q5 4 10 0" fill="none" strokeWidth="2"/>
            </>
          ) : (
            <>
              <ellipse cx="51" cy={eyeY} rx="3.2" ry="3.8" fill={ink} stroke="none"/>
              <ellipse cx="89" cy={eyeY} rx="3.2" ry="3.8" fill={ink} stroke="none"/>
              {mood === "surprised" ? (
                <ellipse cx="70" cy="98" rx="5" ry="6" fill="#d46e7c" strokeWidth="2.2"/>
              ) : mood === "shy" ? (
                <path d="M65 96q5 3 10 0M43 76l5-2m44 2-5-2" fill="none" strokeWidth="2.2"/>
              ) : (
                <path d="M65 93q5 4 10 0M63 99q7 9 14 0" fill="none" strokeWidth="2.2"/>
              )}
            </>
          )}
          {yellow && <path d="M54 70q-4-4-8 0M94 70q-4-4-8 0" strokeWidth="1.8" fill="none"/>}
          <path d="M51 120q4 6 8 7M87 121q-4 6-8 7" strokeWidth="1.8" fill="none"/>
        </g>
      </svg>
    </div>
  );
}
