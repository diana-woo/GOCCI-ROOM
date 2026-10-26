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

/** Single-silhouette hand-drawn vectors modeled against the user's character reference.
 * SVG shapes are authored in code; no external character images are used.
 */
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
  const who: CharacterKind = kind ?? (friend ? "hachiware" : "chiikawa");
  const ink = "#211e1c";
  const white = "#fffefa";
  const isSleepy = mood === "sleepy";

  return (
    <div
      className={"avatar " + (friend ? "friend" : "")}
      style={style}
      role="img"
      aria-label={characterNames[who] + " · " + moodNames[mood]}
    >
      <svg viewBox="0 0 140 144" aria-hidden="true" focusable="false">
        <g stroke={ink} strokeWidth="3.7" strokeLinecap="round" strokeLinejoin="round">
          {who === "chiikawa" && (
            <path
              d="M46 22C40 17 39 12 33 14C25 16 27 26 30 31C18 39 12 51 11 67C9 85 15 100 27 106C20 108 18 113 22 118C26 122 33 123 38 120C39 126 42 134 48 135C53 136 56 133 57 129L79 129C80 135 87 136 92 133C96 130 97 125 98 120C105 124 113 120 112 114C112 110 108 107 104 106C117 98 122 83 119 66C117 52 110 39 98 32C102 24 101 17 94 15C88 13 82 18 80 23C68 20 57 19 46 22Z"
              fill={white}
            />
          )}
          {who === "hachiware" && (
            <>
              <path
                d="M25 46C23 35 24 17 32 15C39 12 46 20 49 27C60 24 71 25 80 28C87 19 96 12 102 16C109 21 109 37 106 47C118 59 121 72 118 87C115 97 109 103 105 106C112 109 113 114 110 118C107 123 101 123 97 120C96 130 94 135 87 135C82 135 78 132 78 129L56 129C54 134 49 136 44 133C40 131 38 125 38 120C33 123 26 121 23 117C20 113 23 109 27 106C15 101 10 86 11 72C12 58 17 52 25 46Z"
                fill={white}
              />
              <path
                d="M25 50C25 35 25 20 33 17C39 15 46 23 50 28C62 25 70 26 80 28C87 22 95 15 101 18C107 22 105 38 106 50C98 54 89 57 80 53C73 50 69 46 65 43C61 49 54 54 46 55C36 57 29 54 25 50Z"
                fill="#a6cee8"
              />
            </>
          )}
          {who === "usagi" && (
            <>
              <path
                d="M40 44C35 34 30 13 35 7C38 3 43 4 47 8C54 17 55 33 55 41L74 41C75 30 77 11 83 6C87 3 93 4 96 8C102 17 95 36 90 45C106 52 117 64 118 79C120 91 116 101 105 108C111 109 113 114 109 118C106 122 100 122 96 120C95 130 93 135 87 135C82 135 79 133 78 129L57 129C56 134 52 136 47 134C41 131 40 126 39 121C33 123 26 120 23 116C20 112 22 109 27 106C14 98 10 85 13 71C16 57 26 48 40 44Z"
                fill="#fff4b2"
              />
              <path
                d="M43 34C40 27 36 13 40 12C45 12 49 30 49 36M82 35C84 22 88 11 91 12C95 15 90 29 87 36"
                strokeWidth="2"
                fill="none"
              />
            </>
          )}
          {isSleepy ? (
            <>
              <path d="M48 82q5 4 10 0M76 82q5 4 10 0" fill="none" strokeWidth="2.5" />
              <path d="M64 94q3-2 6 0" fill="none" strokeWidth="2.2" />
            </>
          ) : (
            <>
              <path d="M50 70q3-2 6 0M78 70q3-2 6 0" fill="none" strokeWidth="2" />
              <ellipse cx="53" cy="82" rx="2.8" ry="3.3" stroke="none" fill={ink} />
              <ellipse cx="81" cy="82" rx="2.8" ry="3.3" stroke="none" fill={ink} />
            </>
          )}
          <ellipse cx="33" cy="91" rx="7.5" ry="5.5" fill="#f1b1c0" stroke="none" />
          <ellipse cx="101" cy="91" rx="7.5" ry="5.5" fill="#f1b1c0" stroke="none" />
          <path d="M30 88v3m4-3v3m64-3v3m4-3v3" strokeWidth="1.7" fill="none" />
          {mood === "happy" ? (
            <>
              <path d="M62 89q5 4 10 0q0 10-5 10q-5 0-5-10Z" fill={ink} strokeWidth="2" />
              <path d="M65 96q2-2 4 0" fill="none" stroke="#f1b1c0" strokeWidth="2" />
            </>
          ) : mood === "shy" ? (
            <path d="M62 92q5 5 10 0" fill="none" strokeWidth="2.5" />
          ) : mood === "surprised" ? (
            <ellipse cx="67" cy="94" rx="4.3" ry="5.8" fill="#e896a6" strokeWidth="2.5" />
          ) : (
            <path d="M64 95q3 3 6 0" fill="none" strokeWidth="2" />
          )}
        </g>
      </svg>
    </div>
  );
}
