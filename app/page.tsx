"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {MouseEvent,FormEvent,PointerEvent} from "react";
import {getSupabase} from "../lib/supabase";
import {Art,Avatar,characterKinds,characterNames,moods,moodNames,isCharacter,isMood,furnitureNames,type CharacterKind,type Mood,type Furniture,type FurnitureKind} from "./room-art";
type Wall="pink"|"blue"|"green"|"cream";
type Chat={id:number;user_id:string;body:string};
type Member={user_id:string;nickname:string;character:CharacterKind;mood:Mood};
const starter:Furniture[]=[{id:"bed",kind:"bed",x:28,y:50},{id:"plant",kind:"plant",x:73,y:45}];
const kinds=Object.keys(furnitureNames) as FurnitureKind[];
export default function Home(){
 const supabase=getSupabase();
 const [uid,setUid]=useState("");
 const [roomId,setRoomId]=useState("");
 const [nickname,setNickname]=useState("나");
 const [wall,setWall]=useState<Wall>("pink");
 const [furniture,setFurniture]=useState<Furniture[]>(starter);
 const [selected,setSelected]=useState<string|null>(null);
 const [members,setMembers]=useState<Member[]>([]);
 const [ownerId,setOwnerId]=useState("");
 const [chosenKind,setChosenKind]=useState<CharacterKind>("chiikawa");
 const [chosenMood,setChosenMood]=useState<Mood>("happy");
 const [previewFriend,setPreviewFriend]=useState<CharacterKind>("hachiware");
 const [messages,setMessages]=useState<Chat[]>([]);
 const [draft,setDraft]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const seq=useRef(0);
 const roomRef=useRef<HTMLDivElement>(null);
 const dragging=useRef<{id:string;pointerId:number;startX:number;startY:number;moved:boolean}|null>(null);
 const furnitureRef=useRef(furniture);
 furnitureRef.current=furniture;
 const canDecorate=!supabase||!roomId||ownerId===uid;
 const demo=!supabase;
 const refresh=useCallback(async(rid:string)=>{
   if(!supabase)return;
   const [room,people,chat]=await Promise.all([
     supabase.from("rooms").select("owner_id,wallpaper,furniture").eq("id",rid).single(),
     supabase.from("room_members").select("user_id,nickname,character,mood").eq("room_id",rid),
     supabase.from("messages").select("id,user_id,body").eq("room_id",rid).order("id",{ascending:false}).limit(100)
   ]);
   if(room.data){setWall(room.data.wallpaper as Wall);setFurniture(room.data.furniture as Furniture[]);setOwnerId(room.data.owner_id as string)}
   if(people.data){
     setMembers(people.data as Member[]);
     const me=people.data.find((person)=>person.user_id===uid);
     if(me){
       if(isCharacter(me.character))setChosenKind(me.character);
       if(isMood(me.mood))setChosenMood(me.mood);
     }
   }
   if(chat.data)setMessages([...chat.data].reverse());
 },[supabase,uid]);
 useEffect(()=>{
   try{
     const saved=window.localStorage.getItem("gocci-character");
     const emotion=window.localStorage.getItem("gocci-mood");
     if(isCharacter(saved))setChosenKind(saved);
     if(isMood(emotion))setChosenMood(emotion);
   }catch{}
 },[]);
 useEffect(()=>{
   if(!supabase){setReady(true);return}
   let live=true;
   supabase.auth.getSession().then(async({data,error:sessionError})=>{
     if(!live)return;
     if(sessionError){setError(sessionError.message);setReady(true);return}
     let user=sessionError?null:data.session?.user;
     if(!user){const result=await supabase.auth.signInAnonymously();if(result.error){setError("익명 로그인을 활성화해 주세요: "+result.error.message);setReady(true);return}user=result.data.user}
     if(!live||!user)return;
     setUid(user.id);setReady(true);
   });
   return()=>{live=false};
 },[supabase]);
 useEffect(()=>{
   if(!supabase||!uid||!roomId)return;
   void refresh(roomId);
   const channel=supabase.channel("gocci-"+roomId)
     .on("postgres_changes",{event:"*",schema:"public",table:"rooms",filter:"id=eq."+roomId},()=>{void refresh(roomId)})
     .on("postgres_changes",{event:"*",schema:"public",table:"room_members",filter:"room_id=eq."+roomId},()=>{void refresh(roomId)})
     .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"room_id=eq."+roomId},()=>{void refresh(roomId)})
     .subscribe();
   return()=>{void supabase.removeChannel(channel)};
 },[supabase,uid,roomId,refresh]);
 useEffect(()=>{
   if(!supabase||!uid)return;
   const id=new URLSearchParams(window.location.search).get("room");
   if(id && /^[0-9a-f-]{36}$/i.test(id)){void join(id)}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[uid]);
 async function join(id:string){
   if(!supabase||!uid)return;
   setBusy(true);setError("");
   const {error:err}=await supabase.rpc("join_room",{p_room:id,p_nickname:nickname.trim()||"친구"});
   if(err)setError(err.message);else{setRoomId(id);window.history.replaceState(null,"","?room="+id)}
   setBusy(false);
 }
 async function createRoom(){
   if(!supabase||!uid)return;
   setBusy(true);setError("");
   const {data,error:err}=await supabase.rpc("create_room",{p_nickname:nickname.trim()||"나"});
   if(err)setError(err.message);else if(data){setRoomId(data as string);window.history.replaceState(null,"","?room="+data)}
   setBusy(false);
 }
 async function persist(nextWall:Wall,nextFurniture:Furniture[]){
   if(!supabase||!roomId)return;
   if(!canDecorate){setError("방 꾸미기는 방장만 변경할 수 있어요.");return}
   const {error:err}=await supabase.from("rooms").update({wallpaper:nextWall,furniture:nextFurniture}).eq("id",roomId);
   if(err){setError(err.message);await refresh(roomId)}
 }
 async function chooseCharacter(kind:CharacterKind){
   setChosenKind(kind);
   try{window.localStorage.setItem("gocci-character",kind)}catch{}
   if(!supabase||!roomId||!uid)return;
   const {error:err}=await supabase.from("room_members").update({character:kind}).eq("room_id",roomId).eq("user_id",uid);
   if(err)setError("캐릭터 변경 저장 실패: "+err.message);
   else void refresh(roomId);
 }
 async function chooseMood(mood:Mood){
   setChosenMood(mood);
   try{window.localStorage.setItem("gocci-mood",mood)}catch{}
   if(!supabase||!roomId||!uid)return;
   const {error:err}=await supabase.from("room_members").update({mood}).eq("room_id",roomId).eq("user_id",uid);
   if(err)setError("표정 저장 실패: "+err.message);
   else void refresh(roomId);
 }
 function wallpaper(w:Wall){if(!canDecorate)return;setWall(w);void persist(w,furniture)}
 function add(kind:FurnitureKind){if(!canDecorate)return;const next=[...furniture,{id:"f-"+Date.now()+"-"+(++seq.current),kind,x:50,y:58}];setFurniture(next);void persist(wall,next)}
 function remove(){if(!canDecorate)return;const next=furniture.filter(i=>i.id!==selected);setFurniture(next);setSelected(null);void persist(wall,next)}
 function place(e:MouseEvent<HTMLDivElement>){
   if(!selected||!canDecorate)return;
   const r=e.currentTarget.getBoundingClientRect();
   const x=Math.max(10,Math.min(90,(e.clientX-r.left)/r.width*100));
   const y=Math.max(15,Math.min(85,(e.clientY-r.top)/r.height*100));
   const next=furniture.map(i=>i.id===selected?{...i,x,y}:i);
   setFurniture(next);setSelected(null);void persist(wall,next);
 }
 function coordinates(clientX:number,clientY:number){
   const rect=roomRef.current?.getBoundingClientRect();
   if(!rect)return null;
   return {x:Math.round(Math.max(10,Math.min(90,(clientX-rect.left)/rect.width*100))),y:Math.round(Math.max(15,Math.min(85,(clientY-rect.top)/rect.height*100)))};
 }
 function startDrag(e:PointerEvent<HTMLButtonElement>,id:string){
   if(!canDecorate)return;
   e.preventDefault();e.stopPropagation();
   dragging.current={id,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,moved:false};
   e.currentTarget.setPointerCapture(e.pointerId);
   setSelected(id);
 }
 function moveDrag(e:PointerEvent<HTMLButtonElement>){
   const drag=dragging.current;
   if(!drag||drag.pointerId!==e.pointerId)return;
   if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4)drag.moved=true;
   if(!drag.moved)return;
   const p=coordinates(e.clientX,e.clientY);if(!p)return;
   setFurniture(current=>current.map(item=>item.id===drag.id?{...item,...p}:item));
 }
 function finishDrag(e:PointerEvent<HTMLButtonElement>){
   const drag=dragging.current;
   if(!drag||drag.pointerId!==e.pointerId)return;
   const p=coordinates(e.clientX,e.clientY);
   if(drag.moved&&p){
     const next=furnitureRef.current.map(item=>item.id===drag.id?{...item,...p}:item);
     setFurniture(next);void persist(wall,next);
   }
   dragging.current=null;
 }
 async function sendText(value:string){
   const body=value.trim().slice(0,500);
   if(!body)return;
   if(!supabase||!roomId){
     setMessages(a=>[...a,{id:Date.now()+Math.floor(Math.random()*1000),user_id:uid||"me",body}]);
     return;
   }
   const {error:err}=await supabase.from("messages").insert({room_id:roomId,user_id:uid,body});
   if(err){setError(err.message);setDraft(body)}else await refresh(roomId);
 }
 async function send(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   const body=draft.trim();
   if(!body)return;
   setDraft("");
   await sendText(body);
 }
 const ownUserId=uid||"me";
 const other=members.find(m=>m.user_id!==uid);
 const friendKind=isCharacter(other?.character)?other.character:previewFriend;
 const friendMood=isMood(other?.mood)?other.mood:"happy";
 const ownBubble=[...messages].reverse().find(m=>m.user_id===ownUserId)?.body||"같이 놀자!";
 const friendBubble=[...messages].reverse().find(m=>m.user_id!==ownUserId)?.body||"뭐 해?";
 const link=typeof window!=="undefined"&&roomId?window.location.origin+"?room="+roomId:"";
 const copy=async()=>{if(link)await navigator.clipboard.writeText(link);else if(!supabase)alert("실제 초대 링크는 Supabase 연결 후 만들 수 있어요.")};
 return (
 <main className="shell">
   <header className="header">
     <div><div className="eyebrow">TINY PLACE, BIG FEELINGS</div><div className="brand">GOCCI ROOM ♡</div></div>
     <button className="pill" onClick={copy} disabled={!roomId}>초대 링크 복사 ↗</button>
   </header>
   <p className="subtitle">우리만의 작은 방 · 캐릭터를 고르고 표정을 바꿔봐 ♡ 가구는 손가락으로 드래그!</p>
   {error&&<div className="alert" role="alert">{error} <button onClick={()=>setError("")}>닫기</button></div>}
   {demo?<div className="alert">미리보기 모드 · 캐릭터 선택과 말풍선은 체험할 수 있어요. 실시간 연결은 Supabase 설정이 필요해요.</div>:
     !roomId&&<div className="setup">
       <input className="nickname" maxLength={20} value={nickname} onChange={e=>setNickname(e.target.value)} aria-label="닉네임" placeholder="닉네임"/>
       <button className="pill" disabled={!ready||busy||!uid} onClick={()=>void createRoom()}>새 방 만들기</button>
       <span className="status">{!ready?"연결 중…":"방을 만든 뒤 초대 링크를 보내주세요."}</span>
     </div>}
   {roomId&&<p className="status">함께 있는 사람 {members.length}/2 · {members.map(m=>m.nickname).join(" · ")} · 가구 이동은 방장만 가능해요.</p>}
   <div className="columns">
     <section className="panel">
       <h2>⌂ 우리의 작은 방</h2>
       <div className={"room "+wall} ref={roomRef} onClick={place} aria-label="방 꾸미기 공간">
         <div className="floor"/><div className="rug"/><div className="window"><span>☁</span></div>
         <div className="room-sparkle sparkle-one">✳</div><div className="room-sparkle sparkle-two">✦</div>
         {furniture.map(item=><button key={item.id}
           aria-label={furnitureNames[item.kind]+" 드래그하여 이동"} aria-pressed={selected===item.id}
           className={"object "+(selected===item.id?"selected":"")}
           style={{left:item.x+"%",top:item.y+"%",zIndex:Math.round(item.y)+5}}
           onPointerDown={e=>startDrag(e,item.id)} onPointerMove={moveDrag}
           onPointerUp={finishDrag} onPointerCancel={()=>{dragging.current=null}}
           onClick={e=>e.stopPropagation()}>
           <Art kind={item.kind}/>
         </button>)}
         <div className="character-spot me">
           <div className="speech-balloon" aria-live="polite">{ownBubble}</div>
           <Avatar kind={chosenKind} mood={chosenMood}/>
           <span className="spot-label">나 · {characterNames[chosenKind]}</span>
         </div>
         <div className="character-spot friend">
           <div className="speech-balloon blue" aria-live="polite">{friendBubble}</div>
           <Avatar kind={friendKind} mood={friendMood} friend/>
           <span className="spot-label">{other?.nickname||"친구"} · {characterNames[friendKind]}</span>
         </div>
       </div>
       <div className="palette"><b>벽지</b>
         {([["pink","#fbe6e8"],["blue","#e1edf9"],["green","#e6efdf"],["cream","#fff1d5"]] as const).map(([w,c])=><button
           key={w} aria-label={w+" 벽지"} aria-pressed={wall===w} disabled={!canDecorate}
           style={{background:c,outline:wall===w?"2px solid #e995ab":undefined}} onClick={()=>wallpaper(w)}/>)}
         <button className="tool" onClick={remove} disabled={!selected||!canDecorate}>선택 가구 삭제</button>
       </div>
     </section>
     <aside className="stack">
       <section className="panel">
         <h2>♡ 캐릭터 꾸미기</h2>
         <p className="subhint">내 캐릭터</p>
         <div className="character-options">
           {characterKinds.map(kind=><button key={kind} className={"character-option "+(chosenKind===kind?"active":"")}
             aria-pressed={chosenKind===kind} onClick={()=>void chooseCharacter(kind)}>
             <Avatar kind={kind}/><span>{characterNames[kind]}</span>
           </button>)}
         </div>
         <p className="subhint">지금 기분</p>
         <div className="mood-options">
           {moods.map((mood)=><button key={mood} className={chosenMood===mood?"active":""}
             aria-pressed={chosenMood===mood} onClick={()=>void chooseMood(mood)}>
             {moodNames[mood]}
           </button>)}
         </div>
         {demo&&<div className="preview-friend">
           <label htmlFor="friend-preview">친구 미리보기</label>
           <select id="friend-preview" value={previewFriend}
             onChange={e=>{if(isCharacter(e.target.value))setPreviewFriend(e.target.value)}}>
             {characterKinds.map(kind=><option key={kind} value={kind}>{characterNames[kind]}</option>)}
           </select>
         </div>}
       </section>
       <section className="panel"><h2>✎ 가구 꾸미기</h2>
         <div className="furniture-grid">{kinds.map(kind=><button key={kind} className="furn-btn"
           disabled={!canDecorate} onClick={()=>add(kind)}><Art kind={kind}/><span>{furnitureNames[kind]}</span></button>)}</div>
       </section>
       <section className="panel">
         <h2>♡ 채팅 {demo&&<small>(미리보기)</small>}</h2>
         <div className="chat-log" aria-live="polite">{messages.length===0&&<p className="status">첫 인사를 건네봐 ♡</p>}
           {messages.map(m=><p key={m.id} className={"chat-line "+(m.user_id!==ownUserId?"friend":"")}>
             {m.user_id===ownUserId?"나":members.find(p=>p.user_id===m.user_id)?.nickname||"친구"}: {m.body}
           </p>)}
         </div>
         <div className="quick-phrases" aria-label="말풍선 빠른 보내기">
           {["뭐 해?","놀자! ♡","좋아!","우와!"].map(phrase=><button key={phrase}
             disabled={!!supabase&&!roomId} onClick={()=>void sendText(phrase)}>{phrase}</button>)}
         </div>
         <form className="chat-form" onSubmit={send}>
           <input value={draft} maxLength={500} onChange={e=>setDraft(e.target.value)}
             placeholder="메시지를 입력하세요" aria-label="메시지"/>
           <button disabled={!!supabase&&!roomId}>보내기</button>
         </form>
       </section>
     </aside>
   </div>
   <p className="footer">GOCCI ROOM · 둘만의 작은 세계</p>
 </main>
 );
}
